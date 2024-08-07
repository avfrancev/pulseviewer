import { extent, fsum, bisector, quantile } from "d3-array"
import { zoomIdentity } from "d3-zoom"
import { interpolateRainbow } from "d3-scale-chromatic"

import { sliceGuess } from "pulseplot/lib/slicer.js"
import { Analyzer } from "pulseplot/lib/histogram.js"

// import { useViewStore, useESP32RMTStore, useConfigStore } from "."
import { useViewStore } from "."

const colors = Array.from(Array(20)).map((d, i) => {
  return interpolateRainbow(i / 20)
})

function getRandomNotUsedColor(colors) {
  const filteredColors = colors.filter((color) => !getRandomNotUsedColor.usedColors.includes(color))
  const randomIndex = Math.floor(Math.random() * filteredColors.length)
  let c = filteredColors[randomIndex]
  if (!c) {
    getRandomNotUsedColor.usedColors = []
    c = getRandomNotUsedColor(colors)
  }
  getRandomNotUsedColor.usedColors.push(c)
  return c
}

getRandomNotUsedColor.usedColors = []

function parsePlainArr(arr, startLevel = 0) {
  let time = 0
  return arr.map((d, i) => {
    if (i !== 0) time += arr[i - 1]
    return { level: (i + startLevel) % 2, width: d, time }
  })
}

function getDecoder(m) {
  // console.log(props.measurements[0].pulsesInRangeRaw);
  const analizer = computedWithControl(
    () => m.pulsesInRangeRaw.length,
    () => (m.pulsesInRangeRaw.length > 10 ? new Analyzer(m.pulsesInRangeRaw) : null),
  )
  const guess = computed(() => analizer.value?.guess() || null)
  const sg = computed(() => guess.value && sliceGuess(m.pulsesInRangeRaw, guess.value))
  // watchEffect(() => {
  //   guess.value
  //   // console.log("analizer has changed")
  // })
  const hasHints = computed(() => sg.value?.hints?.length > 0)
  // console.log({ analizer: analizer.value, guess: guess.value, sliceGuess: sg.value })
  // console.log(sg.value?.bits?.toHexString())

  // if (!sg.value.hints?.length)
  //   return null
  return { analizer, guess, sliceGuess: sg, hasHints }
}

let measurementsCounter = 0

function initMeasurements(pulses, viewStore, pulsesMinX) {
  const measurements = reactive([])
  measurements.addMeasurement = (x1, x2, color = getRandomNotUsedColor(colors)) => {
    const m = reactive({ x1, x2, color })
    m.id = `measurement-${measurementsCounter++}`
    m.isHovered = false
    m.minX = computed(() => Math.min(m.x1, m.x2))
    m.maxX = computed(() => Math.max(m.x1, m.x2))
    m.minXWithXOffset = computed(() => m.minX + pulses.xOffset)
    m.xOffset = computed(() => pulses.xOffset)
    // props.viewStore.xScale(props.pulses.xOffset*ZT.k + props.pulsesStore.minX)
    m.showBits = ref(false)
    m.showBitsToggle = () => (m.showBits = !m.showBits)
    m.width = computed(() => m.maxX - m.minX)
    m.scaledX1 = computed(() => viewStore.xScale(m.x1))
    m.scaledX2 = computed(() => viewStore.xScale(m.x2))
    m.scaledMinX = computed(() => viewStore.xScale(m.minX))
    m.scaledMaxX = computed(() => viewStore.xScale(m.maxX))
    m.scaledWidth = computed(() => Math.max(m.width, 1 / viewStore.state.ZT.k) / viewStore.pixelRatio)
    m.statistics = {}
    m.isCursorsInsideMeasurement = computed(() => m.minX < pulses.cursorX && m.maxX > pulses.cursorX)
    m.rangeIds = computed(() => [pulses.bisectorRef.left(pulses, m.minX), pulses.bisectorRef.left(pulses, m.maxX)])
    m.pulsesInRange = computed(() => pulses.slice(...m.rangeIds))
    m.rangeWidth = computed(
      // () => m.pulsesInRange[m.rangeIds[1]].time - m.pulsesInRange[m.rangeIds[0]].time,
      () => m.pulsesInRange[m.pulsesInRange.length - 1]?.time - m.pulsesInRange[0]?.time,
    )
    m.pulsesInRangeRaw = computed(() => pulses.raw_data.slice(...m.rangeIds))
    m.Nfalling = computed(() => m.pulsesInRange.filter((d) => d.level === 0).length)
    m.Nrising = computed(() => m.pulsesInRange.filter((d) => d.level === 1).length)
    m.minmaxFreq = computed(() => extent(m.pulsesInRange, (d) => d.width))
    m.averageTime = computed(() => m.pulsesInRange.reduce((acc, curr) => acc + curr.width, 0) / m.pulsesInRange.length)
    m.decoder = getDecoder(m)
    m.q = computed(() =>
      quantile(
        m.pulsesInRange.map((d) => d.width),
        0.05,
      ),
    )
    m.baud = computed(() => parseInt((1 / m.q) * 1000 * 1000))
    // m.decoders = createDecoders(m)
    m.remove = () => {
      measurements.removeMeasurement(m.id)
    }
    m.copyToClipboard = () => {
      // const pulses = arr.map(d => d.width).map((v,i) => i % 2 ? `${v}\n` : v).join(' ')
      const o = m.pulsesInRangeRaw.map((v, i) => (i % 2 ? `${v}\n` : `${v}`)).join(" ")
      navigator.clipboard.writeText(o)
    }

    m.locate = () => {
      let w = m.scaledMaxX - m.scaledMinX
      let z = zoomIdentity.scale((viewStore.wrapperBounds.width / w) * 0.9)
      // viewStore.state.ZT.k = z.k
      // viewStore.state.ZT.x = - ((m.scaledMinX - w/2*0.1 )*z.k)
      let newX = -((m.scaledMinX - (w * 0.1) / 2) * z.k)
      newX -= viewStore.xScale(pulses.xOffset + pulsesMinX.value) * z.k
      viewStore.state.ZT.animateTo({ k: z.k, x: newX })
      // animate({
      //   from: {k: viewStore.state.ZT.k, x: viewStore.state.ZT.x},
      //   to: {k: z.k, x: newX},
      //   ease: easeInOut,
      //   onUpdate: (v) => {
      //     Object.assign(viewStore.state.ZT, v)
      //   }
      // })
    }
    m.changeColor = () => {
      m.color = getRandomNotUsedColor(colors)
    }
    measurements.push(m)
    return m
  }
  measurements.removeMeasurement = (id) => {
    const index = measurements.findIndex((m) => m.id === id)
    if (index !== -1) measurements.splice(index, 1)
  }
  return measurements
}

export default (uuid = 0) => {
  const viewStore = useViewStore(uuid)

  let pulsesCounter = ref(0)

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
    arr.iid = pulsesCounter.value
    pulsesCounter.value += 1
    arr.raw_data = data
    arr.sum = computed(() => fsum(arr, (d) => d.width))
    arr.xOffset = 0
    arr.scaledXOffset = computed(() => viewStore.xScale(arr.xOffset * viewStore.state.ZT.k + minX.value))
    arr.cursorX = 0
    arr.rssi = 0
    arr.isHovered = false
    arr.isSelected = false
    arr.bisectorRef = bisector((d) => d.time)
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
    // pulsesStorage.value = out

    // console.log('throttledSaveToLocalStorage');
  }

  const throttledSaveToLocalStorage = useDebounceFn(saveToLocalStorage, 100)

  const pulsesOffsetsX = computed(() => {
    return pulses.map((p) => p.xOffset)
  })

  const debounceOptions = { debounce: 500, maxWait: 4000 }
  watchDebounced(allMeasurements, throttledSaveToLocalStorage, { deep: true, ...debounceOptions })
  watchDebounced(pulsesOffsetsX, throttledSaveToLocalStorage, { ...debounceOptions })
  watchDebounced(pulses, throttledSaveToLocalStorage, { ...debounceOptions })

  function loadPulses(_pulses = []) {
    pulses.length = 0
    _pulses.forEach((p) => {
      if (!p.raw_data) return
      let _p = addPulses(p.raw_data)
      _p.xOffset = p.xOffset
      p.measurements.forEach((m) => {
        _p.measurements.addMeasurement(m.x1, m.x2, m.color)
      })
    })
  }

  if (pulsesStorage.value.length) {
    loadPulses(pulsesStorage.value)
  }

  return {
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
