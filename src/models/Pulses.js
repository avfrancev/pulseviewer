import { extent, fsum, bisector, quantile, min, mean, median } from "d3-array"
import { zoomIdentity } from "d3-zoom"
import { interpolateRainbow } from "d3-scale-chromatic"

import { useViewStore } from "."
import { initMeasurements } from "./Measurements"

function parsePlainArr(arr, startLevel = 0) {
  let time = 0
  return arr.map((d, i) => {
    if (i !== 0) time += arr[i - 1]
    return { level: (i + startLevel) % 2, width: d, time }
  })
}

export default (uuid = 0) => {
  const viewStore = useViewStore(uuid)

  let pulsesIIDCounter = ref(0)

  const pulses = reactive([])

  const maxSum = computed(() => Math.max(...pulses.map((d) => d.sum + d.xOffset)))
  const minOffset = computed(() => Math.min(0, Math.min(...pulses.map((d) => d.xOffset))))
  const maxOffset = computed(() => Math.max(...pulses.map((d) => d.xOffset)))
  // const minX = computed(() => Math.min(0,Math.min(...pulses.map(d => d.xOffset))))
  const minX = computed(() => Math.min(0, minOffset.value))
  const maxX = computed(() => maxSum.value)
  const maxSumWithOffset = computed(() => Math.max(...pulses.map((d) => maxSum.value - Math.abs(d.xOffset))))

  function addPulses(data) {
    if (!Array.isArray(data) || data.length === 0) {
      console.log(data)
      return
    }
    let arr = reactive(parsePlainArr(data))
    arr.iid = pulsesIIDCounter.value
    pulsesIIDCounter.value += 1
    arr.raw_data = data
    arr.sum = computed(() => fsum(arr, (d) => d.width))
    arr.xOffset = 0
    arr.scaledXOffset = computed(() => viewStore.xScale(arr.xOffset * viewStore.state.ZT.k + minX.value))
    arr.cursorX = 0
    arr.rssi = 0
    arr.isHovered = false
    arr.isSelected = false
    arr.bisectorRef = bisector((d) => d.time)
    arr.viewportRangeIDs = computed(() => {
      let l = viewStore.xScale.invert(viewStore.state.viewportLeft)
      let r = viewStore.xScale.invert(viewStore.state.viewportRight)
      return [arr.bisectorRef.left(arr, l), arr.bisectorRef.left(arr, r)]
    })
    arr.dataIDUnderCursor = computed(() => {
      return arr.bisectorRef.left(arr, arr.cursorX) - 1
    })

    arr.measurements = initMeasurements(arr, viewStore, minX)

    watch(
      () => arr.raw_data,
      () => {
        arr.length = 0
        Object.assign(arr, parsePlainArr(arr.raw_data.map(Number)))
      },
    )

    pulses.push(arr)
    return arr
  }

  function removePulses(p) {
    pulses.splice(pulses.indexOf(p), 1)
  }

  function remove() {
    pulses.forEach(removePulses)
    pulsesStorage.value = null
    localStorage.removeItem(`pulses-${uuid}`)
    this.$dispose()
  }

  const pulsesStorage = useStorage(`pulses-${uuid}`, [])

  const allMeasurements = computed(() => {
    return pulses
      .map((p) => p.measurements)
      .flat()
      .sort((a, b) => a.minXWithXOffset - b.minXWithXOffset)
  })

  const saveToLocalStorage = () => {
    pulsesStorage.value = pulses.map((p) => {
      let o = {
        raw_data: p.raw_data,
        xOffset: p.xOffset,
        rssi: p.rssi,
        measurements: p.measurements.map((m) => {
          return {
            x1: m.x1,
            x2: m.x2,
            color: m.color,
          }
        }),
      }
      return o
    })
  }

  const throttledSaveToLocalStorage = useDebounceFn(saveToLocalStorage, 100)

  const pulsesOffsetsX = computed(() => {
    return pulses.map((p) => p.xOffset)
  })

  const debounceOptions = { debounce: 500, maxWait: 4000 }
  const measurementsDimensions = computed(() => {
    return allMeasurements.value.map((m) => {
      return [m.x1, m.x2]
    })
  })
  watchDebounced(measurementsDimensions, throttledSaveToLocalStorage, { ...debounceOptions })
  watchDebounced(pulsesOffsetsX, throttledSaveToLocalStorage, { ...debounceOptions })
  watchDebounced(pulses, throttledSaveToLocalStorage, { ...debounceOptions })

  function loadPulses(_pulses = [], resetState = true) {
    if (resetState) pulses.length = 0
    _pulses.forEach((p) => {
      if (!p.raw_data) return
      let _p = addPulses(p.raw_data)
      _p.xOffset = p.xOffset
      _p.rssi = p.rssi
      p.measurements.forEach((m) => {
        _p.measurements.addMeasurement(m.x1, m.x2, m.color)
      })
    })
  }

  if (pulsesStorage.value.length) {
    loadPulses(pulsesStorage.value)
  }

  return {
    uuid,
    addPulses,
    removePulses,
    remove,
    loadPulses,
    saveToLocalStorage,
    throttledSaveToLocalStorage,
    pulses,
    maxSum,
    minOffset,
    maxOffset,
    maxSumWithOffset,
    minX,
    maxX,
    pulsesStorage,
    allMeasurements,
  }
}
