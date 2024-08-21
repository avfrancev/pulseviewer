import { extent, fsum, bisector, quantile, min, mean, median } from "d3-array"
import { zoomIdentity } from "d3-zoom"
import { interpolateRainbow } from "d3-scale-chromatic"

import {
  sliceGuess,
  slicePCM,
  sliceMC,
  slicePPM,
  slicePWM,
  sliceDM,
  sliceNRZ,
  sliceNRZI,
  sliceCMI,
  slicePIWM,
} from "pulseplot/lib/slicer.js"
import * as pulseplotSlicer from "pulseplot/lib/slicer.js"

import { Analyzer, Histogram, Bin } from "@/utils/histogram.js"
import { Hexbuffer, dec2hex } from "@/utils/hexbuffer.js"
// import { Analyzer, Histogram} from "pulseplot/lib/histogram.js"
import { Bitbuffer } from "pulseplot/lib/bitbuffer.js"

// import { useViewStore, useESP32RMTStore, useConfigStore } from "."
import { useViewStore } from "."

const colors = Array.from(Array(20)).map((d, i) => {
  return interpolateRainbow(i / 20)
})

let measurementsCounter = 0
const slicers = ["PCM", "PWM", "PPM", "MC", "DM", "NRZI", "CMI", "PIWM"]

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

function manchesterAligned(pulses, offset, short) {
  for (let j = offset; j < pulses.length; j += 2) {
    const mw = pulses[j] // mark
    const cw = ~~(mw / short + 0.5)
    if (cw > 1) return 0 // middle
    const sw = pulses[j + 1] // space
    const sc = ~~(sw / short + 0.5)
    if (sc > 1) return 1 // start
  }
  // warning, no alignment found
  return 0
}

function splitArrayWithDelimiter(arr = [], delimiterCallback) {
  let result = [[]]
  arr.forEach((item, i) => {
    if (delimiterCallback(item, i, arr)) {
      result.push([item])
      // console.log(item);
    } else {
      result[result.length - 1].push(item)
    }
  })
  return result.filter((g) => g.length)
}

export function getDecoder(m, viewStore, pulses) {
  const analyzer = ref(null)
  const guess = ref(null)
  const sg = ref(null)
  const pickedSlicer = ref(null)

  const analyzerWorker = useWebWorkerFn(
    (pulses, rangeIds) => {
      // return []
      pulses = pulses.slice(...rangeIds)
      const analyzer = new Analyzer(pulses)
      const guessed = analyzer.guess()
      const sg = sliceGuess(pulses, guessed)
      return { analyzer, guessed, sg }
    },
    {
      timeout: 10000,
      localDependencies: [
        Analyzer,
        Histogram,
        Bin,
        Hexbuffer,
        dec2hex,
        sliceGuess,
        ...Object.entries(pulseplotSlicer).map((d) => d[1]),
        manchesterAligned,
        Bitbuffer,
      ],
    },
  )

  watchWithFilter(
    () => m.rangeIds,
    async () => {
      // console.log("test")
      analyzerWorker.workerTerminate()
      const result = await analyzerWorker.workerFn(toRaw(pulses.raw_data), m.rangeIds)
      analyzer.value = result.analyzer
      guess.value = result.guessed
      sg.value = result.sg
    },
    {
      eventFilter: (fn, { args }) => {
        const [oldVal, newVal] = args
        if (!newVal || !oldVal) return fn()
        if (newVal[0] != oldVal[0] || newVal[1] != oldVal[1]) fn()
      },
      immediate: true,
    },
  )

  // watch(
  //   () => m.rangeIds,
  //   async () => {
  //     // if (m.rangeIds[0] == rangeIds[0] && m.rangeIds[1] == rangeIds[1]) return
  //     // rangeIds = m.rangeIds
  //     // analyzerWorker.workerTerminate()
  //     // const result = await analyzerWorker.workerFn(toRaw(pulses.raw_data), m.rangeIds)
  //     // analyzer.value = result.analyzer
  //     // guess.value = result.guessed
  //     // sg.value = result.sg
  //   },
  //   {
  //     throttle: 40,
  //     immediate: true,
  //   },
  // )

  // watchThrottled(
  //   () => m.pulsesInRangeRaw.length,
  //   () => {
  //     pulsesInRangeRawLength.value = m.pulsesInRangeRaw.length
  //   },
  //   { throttle: 100 },
  // )

  // const analyzer = computedWithControl(
  //   () => m.pulsesInRangeRaw.length,
  //   () => {
  //     // console.log("analyzer", m.pulsesInRangeRaw.length);
  //     if (m.pulsesInRangeRaw.length < 10) return null
  //     const a = new Analyzer(m.pulsesInRangeRaw)
  //     return a
  //   },
  //   // () => (m.pulsesInRangeRaw.length > 10 ? new Analyzer(m.pulsesInRangeRaw) : null),
  // )

  // const pickedSlicer = ref(null)
  // const guess = computed(() => analyzer.value?.guess() || null)
  // const guess = ref({})

  // pickedSlicer.value = analyzer.value?.guess()?.modulation || null

  // const sg = ref(sliceGuess(m.pulsesInRangeRaw, guess.value || analyzer.value.guess()))

  // const { workerFn, workerStatus, workerTerminate } = useWebWorkerFn((a, b) => sliceGuess(a, b), {
  //   timeout: 50000,
  //   localDependencies: [sliceGuess, ...Object.entries(pulseplotSlicer).map((d) => d[1]), manchesterAligned, Bitbuffer],
  // })

  // watch(
  //   () => [guess.value, viewStore.xScale],
  //   async () => {
  //     // console.log("watch", workerStatus.value, m.pulsesInRangeRaw.length);
  //     // if (workerStatus.value !== "PENDING" ) return
  //     // console.log("Waiting,,,", m.pulsesInRangeRaw.length);
  //     workerTerminate()

  //     // if ()
  //     // sg_.value = await workerFn(m.pulsesInRangeRaw, guess.value)

  //     sg.value = await workerFn(m.pulsesInRangeRaw, toRaw(guess.value))
  //     // console.log("RESULT",m.pulsesInRangeRaw.length, sg_.value);
  //     // workerStatus.value = "PENDING"
  //   },
  // )

  // const sg_ = computedWithControl(
  //   () => [guess.value, viewStore.xScale],
  //   () => {
  //     return sliceGuess(m.pulsesInRangeRaw, guess.value)
  //   },
  // )

  const sg2 = computedWithControl(
    // watchThrottled(
    () => [guess.value, viewStore.xScale],
    // [guess, viewStore.xScale],
    () => {
      // console.log(123124)
      const o = sliceGuess(m.pulsesInRangeRaw, guess.value)
      const groups = []

      let currGroup = null

      o.hints?.forEach((h, i) => {
        // let currGroup = groups[groups.length - 1] || {}

        h[3] = viewStore.xScale(h[0])
        h[4] = viewStore.xScale(h[1] || h[0])

        let prevh = o.hints[i - 1]
        let hasBreak = !prevh || prevh[1] !== h[0]

        if (hasBreak || h[2] === "X") {
          currGroup = {
            bitsHints: [],
            bbuf: new Bitbuffer(),
          }
          groups.push(currGroup)
        }
        currGroup.bitsHints.push(h)
        currGroup.bbuf.pushSymbol(h[2])
      })

      groups.forEach((g) => {
        g.range = [g.bitsHints[0][0], g.bitsHints[g.bitsHints.length - 1][1]]
        g.scaledRange = [g.bitsHints[0][3], g.bitsHints[g.bitsHints.length - 1][4]]
        g.bytes = g.bbuf.bytes.map((byte, i) => {
          let startBit = g.bitsHints[i * 8]
          let endBit = g.bitsHints[i * 8 + 7]
          if (!endBit) endBit = g.bitsHints[g.bitsHints.length - 1]
          // endBit ||= g.bitsHints[g.bitsHints.length - 1]
          let x1 = startBit[0]
          let x2 = endBit[1]
          let scaledX1 = startBit[3]
          let scaledX2 = endBit[4]
          let o = {
            x1,
            x2,
            byte,
            scaledX1,
            scaledX2,
            bits: [],
          }
          for (let j = i * 8; j < i * 8 + 8; j++) {
            const bit = g.bitsHints[j]
            if (!bit) break
            o.bits.push(bit)
          }
          o.minScaledBit = median(o.bits, (b) => b[4] - b[3]) || 5
          return o
        })
        g.bytesHints = g.bbuf.bytes.map((byte, i) => {
          let startBit = g.bitsHints[i * 8]
          let endBit = g.bitsHints[i * 8 + 7]
          if (!endBit) endBit = g.bitsHints[g.bitsHints.length - 1]
          // endBit ||= g.bitsHints[g.bitsHints.length - 1]
          let x1 = startBit[0]
          let x2 = endBit[1]
          let scaledx1 = startBit[3]
          let scaledx2 = endBit[4]
          let h = [x1, x2, byte, scaledx1, scaledx2, i * 8, i * 8 + 7]
          return h
        })
      })

      // console.log({ groups })

      const dbf = () => {
        let a = sg.value?.groups?.filter((g) => {
          // return true
          let n = viewStore.xScale(m.pulsesInRange[0].time) - viewStore.xScale(0)
          n += pulses.scaledXOffset / viewStore.state.ZT.k
          const viewportConstraint = viewStore.isRangeInView(n + g.scaledRange[0], n + g.scaledRange[1])
          g.bytesFiltered = g.bytes.filter((byte) => {
            const widthConstraint = (byte.scaledX2 - byte.scaledX1) * viewStore.state.ZT.k > 30
            // let n = props.viewStore.xScale(m.pulsesInRange[0].time) - props.viewStore.xScale(0)
            // n += props.pulses.scaledXOffset / ZT.k
            const viewportConstraint = viewStore.isRangeInView(n + byte.scaledX1, n + byte.scaledX2)
            // console.log(123, viewportConstraint && widthConstraint)
            return viewportConstraint && widthConstraint
          })
          return viewportConstraint
        })
        // console.log(a);

        return a
      }

      const dbfThrottled = useThrottleFn(dbf, 1200)

      // const groupsInViewport = ref([])
      const groupsInViewport = computed(() => {
        return sg.value?.groups
        // return dbf()
      })

      return { ...o, groups, groupsInViewport }
    },
    { throttle: 100 },
  )

  // watch(
  //   [analyzer, pickedSlicer],
  //   () => {
  //     guess.value = analyzer.value?.guess() || {}
  //     if (pickedSlicer.value) guess.value.modulation = pickedSlicer.value
  //   },
  //   { immediate: true },
  // )

  const hasHints = computed(() => sg.value?.hints?.length > 0)
  // console.log({ analyzer: analyzer.value, guess: guess.value, sliceGuess: sg.value })
  // console.log(sg.value?.bits?.toHexString())

  const bitsHints = computed(() => {
    // const firstPulse = pulses[m.rangeIds[0]]
    return sg.value?.hints?.map((h) => {
      h[3] = viewStore.xScale(h[0] + m.firstPulse?.time)
      h[4] = viewStore.xScale((h[1] || h[0]) + m.firstPulse?.time)
      return h
    })
  })

  const bytesHints = computed(() => {
    const groups = splitArrayWithDelimiter(bitsHints.value, (h, i, arr) => {
      let prevh = arr[i - 1]
      let hasBreak = !prevh || prevh[1] !== h[0]
      return hasBreak || h[2] === "X"
    })

    groups.forEach((g) => {
      g.bbuf = new Bitbuffer()
      for (let i = 0; i < g.length; ++i) {
        g.bbuf.pushSymbol(g[i][2])
      }
      g.range = [g[0][0], g[g.length - 1][1] || g[g.length - 1][0]]
      g.scaledRange = [g[0][3], g[g.length - 1][4]]

      g.bytes = g.bbuf.bytes.map((byte, i) => {
        let startBit = g[i * 8]
        let endBit = g[i * 8 + 7]
        if (!endBit) endBit = g[g.length - 1]
        let x1 = startBit[0]
        let x2 = endBit[1]
        let scaledx1 = startBit[3]
        let scaledx2 = endBit[4]
        let h = [x1, x2, byte, scaledx1, scaledx2, i * 8, i * 8 + 7]
        return h
      })
    })

    return groups
    // let groups = []
    // return bitsHints.value?.map( h => {

    // })
  })

  // if (!sg.value.hints?.length)
  //   return null
  return { analyzer, guess, sliceGuess: sg, hasHints, slicers, pickedSlicer, bitsHints, bytesHints, analyzerWorker }
}

export function initMeasurements(pulses, viewStore, pulsesMinX) {
  const measurements = reactive([])

  measurements.addMeasurement = function (x1, x2, color = getRandomNotUsedColor(colors)) {
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
    m.tooltipIsOpened = false
    m.width = computed(() => m.maxX - m.minX)
    m.scaledX1 = computed(() => viewStore.xScale(m.x1))
    m.scaledX2 = computed(() => viewStore.xScale(m.x2))
    m.scaledMinX = computed(() => viewStore.xScale(m.minX))
    m.scaledMaxX = computed(() => viewStore.xScale(m.maxX))
    m.scaledWidth = computed(() => Math.max(m.width, 1 / viewStore.state.ZT.k) / viewStore.pixelRatio)
    m.statistics = {}
    m.isCursorsInsideMeasurement = computed(() => m.minX < pulses.cursorX && m.maxX > pulses.cursorX)
    m.rangeIds = computed(() => [pulses.bisectorRef.left(pulses, m.minX), pulses.bisectorRef.left(pulses, m.maxX)])
    // m.pulsesInRange = computed(() => pulses.slice(...m.rangeIds))
    m.pulsesInRange = []
    m.firstPulse = computed(() => pulses[m.rangeIds[0]])
    m.lastPulse = computed(() => pulses[m.rangeIds[1]])
    // m.rangeWidth = computed(
    //   // () => m.pulsesInRange[m.rangeIds[1]].time - m.pulsesInRange[m.rangeIds[0]].time,
    //   () => pulses[m.rangeIds[0]]?.time - pulses[m.rangeIds[1]]?.time,
    // )
    m.rangeScaledWidth = computed(
      () => viewStore.xScale(m.pulsesInRange[m.pulsesInRange.length - 1]?.time) - viewStore.xScale(m.pulsesInRange[0]?.time),
    )
    // m.pulsesInRangeRaw = computed(() => pulses.raw_data.slice(...m.rangeIds))
    m.pulsesInRangeRaw = []
    m.Nfalling = computed(() => m.pulsesInRange.filter((d) => d.level === 0).length)
    m.Nrising = computed(() => m.pulsesInRange.filter((d) => d.level === 1).length)
    m.minmaxFreq = computed(() => extent(m.pulsesInRange, (d) => d.width))
    m.averageTime = computed(() => m.pulsesInRange.reduce((acc, curr) => acc + curr.width, 0) / m.pulsesInRange.length)

    m.decoder = getDecoder(m, viewStore, pulses)

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
    m.rawPulsesClipboard = useClipboard({
      source: computed(() => m.pulsesInRangeRaw.map((v, i) => (i % 2 ? `${v}\n` : `${v}`)).join(" ")),
      legacy: true,
    })
    // m.copyToClipboard = () => {
    //   // const pulses = arr.map(d => d.width).map((v,i) => i % 2 ? `${v}\n` : v).join(' ')
    //   const o = m.pulsesInRangeRaw.map((v, i) => (i % 2 ? `${v}\n` : `${v}`)).join(" ")
    //   navigator.clipboard.writeText(o)
    // }

    m.locate = () => {
      let w = m.scaledMaxX - m.scaledMinX
      let z = zoomIdentity.scale((viewStore.wrapperBounds.width / w) * 0.9)
      let newX = -((m.scaledMinX - (w * 0.1) / 2) * z.k)
      newX -= viewStore.xScale(pulses.xOffset + pulsesMinX.value) * z.k
      viewStore.state.ZT.animateTo({ k: z.k, x: newX })
      if (m.rectRef) {
        // BUG: Has bug without setTimeout
        setTimeout(() => m.rectRef.scrollIntoView({ block: "center" }), 300)
      }
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
