import { extent, quantile } from "d3-array"
import { zoomIdentity } from "d3-zoom"
import { interpolateRainbow } from "d3-scale-chromatic"

import AnalyzerWorker from "@/analyzerWorker.js?worker"
import { Bitbuffer } from "pulseplot/lib/bitbuffer"

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

function splitArrayWithDelimiter(arr = [], delimiterCallback) {
  let result = [[]]
  arr.forEach((item, i) => {
    if (delimiterCallback(item, i, arr)) {
      result.push([item])
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

  let analyzerWorker = {
    worker: new AnalyzerWorker(),
    isRunning: ref(false),
  }

  const onmessage = (e) => {
    analyzer.value = e.data.analyzer
    guess.value = e.data.guessed
    sg.value = e.data.sg
    analyzerWorker.isRunning.value = false
    pickedSlicer.value ||= e.data.guessed.modulation
  }

  watchWithFilter(
    () => [m.rangeIds, pickedSlicer.value],
    async () => {
      analyzerWorker.isRunning.value = true
      analyzerWorker.worker.terminate()
      analyzerWorker.worker = new AnalyzerWorker()
      analyzerWorker.worker.onmessage = onmessage
      analyzerWorker.worker.postMessage({ pulses: m.pulsesInRangeRaw, pickedSlicer: pickedSlicer.value })
    },
    {
      eventFilter: (fn, { args }) => {
        const [oldVal, newVal] = args
        if (!oldVal || newVal?.toString() !== oldVal?.toString()) return fn()
      },
      immediate: true,
    },
  )

  const hasHints = computed(() => sg.value?.hints?.length > 0)

  const bitsHints = computed(() => {
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
  })

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
    m.pulsesInRange = computed(() => pulses.slice(...m.rangeIds))
    m.pulsesInRangeRaw = computed(() => pulses.raw_data.slice(...m.rangeIds))
    m.firstPulse = computed(() => pulses[m.rangeIds[0]])
    m.lastPulse = computed(() => pulses[m.rangeIds[1]])
    m.rangeScaledWidth = computed(
      () => viewStore.xScale(m.pulsesInRange[m.pulsesInRange.length - 1]?.time) - viewStore.xScale(m.pulsesInRange[0]?.time),
    )
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
    m.remove = () => {
      measurements.removeMeasurement(m.id)
    }
    m.rawPulsesClipboard = useClipboard({
      source: computed(() => m.pulsesInRangeRaw.map((v, i) => (i % 2 ? `${v}\n` : `${v}`)).join(" ")),
      legacy: true,
    })

    m.locate = () => {
      let w = m.scaledMaxX - m.scaledMinX
      let z = zoomIdentity.scale((viewStore.wrapperBounds.width / w) * 0.9)
      let newX = -((m.scaledMinX - (w * 0.1) / 2) * z.k)
      newX -= viewStore.xScale(pulses.xOffset + pulsesMinX.value) * z.k
      viewStore.state.ZT.animateTo({ k: z.k, x: newX })
      if (m.rectRef) {
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
