<template lang="pug">
canvas(
  class="absolute pointer-events-none"
  ref="canvas"
  :width="wrapperBounds.width.value"
  :height="wrapperBounds.height.value")
</template>

<script setup>
  import { colors, getColor, mode, darkColors, lightColors } from "@/stores/colors"

  const props = defineProps({
    pulses: {
      type: Array,
      default: [],
    },
    viewStore: {
      type: Object,
      default: {},
    },
    pulsesStore: {
      type: Object,
      default: {},
    },
    wrapperBounds: {
      type: Object,
      default: {},
    },
    targetIsVisible: {
      type: Boolean,
      default: {},
    },
  })

  const { pulses, wrapperBounds, viewStore, pulsesStore, targetIsVisible } = props
  const { ZT } = props.viewStore.state

  const canvas = ref(null)

  const transformPath = (path, matrix) => {
    const copy = new Path2D()
    copy.addPath(path, matrix)
    return copy
  }

  const pulsesPath = computed(() => {
    let o = pulses.reduce((acc, d, i) => {
      const t = i % 2 === 0
      let x = viewStore.xScale(d.time)
      let w = x + viewStore.xScale(d.width + pulsesStore.minOffset)
      return (acc += `M${x},${t ? 22 : 90} V${t ? 90 : 22} H${w}`)
    }, "")
    return new Path2D(o)
  })

  let ctx

  watch(wrapperBounds.width, () => {
    canvas.value.width = wrapperBounds.width.value
    canvas.value.height = wrapperBounds.height.value
  })

  watch(
    () => [
      ZT.k,
      ZT.x,
      pulses.scaledXOffset,
      viewStore.xScale,
      mode.value,
      pulses.raw_data,
      targetIsVisible.value,
      wrapperBounds.width.value,
      wrapperBounds.height.value,
      pulses.measurements.map((m) => [m.x1, m.x2, m.color, m.decoder.analyzerWorker.isRunning]),
    ],
    () => {
      if (targetIsVisible.value === false) return
      window.requestAnimationFrame(draw)
    },
    { immediate: true },
  )

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, wrapperBounds.width.value, wrapperBounds.height.value)
    ctx.reset()
    // pulses.measurements.forEach((m) => {
    //   const pattern = getPattern(m.color + "40")
    //   ctx.fillStyle = pattern
    //   ctx.fillRect(m.scaledMinX * ZT.k + ZT.x + pulses.scaledXOffset, 0, m.scaledWidth * ZT.k, 120)
    // })
    ctx.strokeStyle = getColor(["accent", "base-content"], [1, 0.4]).value
    ctx.stroke(transformPath(pulsesPath.value, { a: ZT.k, e: ZT.x + pulses.scaledXOffset }))

    drawBitsHints()
    drawBytesHints()
  }

  function drawBytesHints() {
    let bytesRangesPath = new Path2D()
    let bytesRangesPathErr = new Path2D()
    ctx.fillStyle = getColor(["base-content", "base-content"], [0.8, 0.8]).value
    ctx.strokeStyle = getColor(["base-100", "base-100"], [0.8, 0.8]).value
    ctx.lineWidth = 3
    ctx.textAlign = "center"
    ctx.font = "bold 10px monospace"
    pulses.measurements.forEach((m) => {
      if (m.decoder.analyzerWorker.isRunning) return
      m.decoder.bytesHints.forEach((group) => {
        for (let i = group.viewportRangeIDs.value[0]; i <= group.viewportRangeIDs.value[1]; i++) {
          let b = group.bytes[i]
          if (!b) continue
          let w = b[4] - b[3]
          if (w * ZT.k < 30) return
          bytesRangesPath.moveTo(b[3], 70)
          bytesRangesPath.lineTo(b[3], 110)
          bytesRangesPath.moveTo(b[4], 70)
          bytesRangesPath.lineTo(b[4], 110)
          let args = [b[2].toString(16).padStart(2, "0").toUpperCase(), (b[3] + w / 2) * ZT.k + ZT.x + pulses.scaledXOffset, 85, w * ZT.k]
          ctx.strokeText(...args)
          ctx.fillText(...args)
        }
        bytesRangesPathErr.moveTo(group.scaledRange[0], 0)
        bytesRangesPathErr.lineTo(group.scaledRange[0], 110)
        bytesRangesPathErr.moveTo(group.scaledRange[1], 0)
        bytesRangesPathErr.lineTo(group.scaledRange[1], 110)
      })
    })
    ctx.lineWidth = 1
    ctx.strokeStyle = getColor(["error", "error"], [0.9, 0.9]).value
    ctx.stroke(transformPath(bytesRangesPathErr, { a: ZT.k, e: ZT.x + pulses.scaledXOffset }))
    ctx.strokeStyle = getColor(["info", "info"], [0.9, 0.9]).value
    ctx.stroke(transformPath(bytesRangesPath, { a: ZT.k, e: ZT.x + pulses.scaledXOffset }))
  }

  function drawBitsHints() {
    let bitsRangesPath = new Path2D()
    ctx.fillStyle = getColor(["base-content", "base-content"], [0.6, 0.5]).value
    ctx.textAlign = "center"
    ctx.font = "10px monospace"

    pulses.measurements.forEach((m) => {
      if (m.decoder.analyzerWorker.isRunning) return
      let w = viewStore.xScale(m.decoder.guess?.short)
      if (w && w * ZT.k < 5) return
      for (let i = m.decoder.bitsHintsViewportRangeIDs[0]; i <= m.decoder.bitsHintsViewportRangeIDs[1]; i++) {
        let h = m.decoder.bitsHints[i]
        if (!h) continue
        w = h[4] - h[3]
        if (w * ZT.k < 10) continue
        ctx.fillText(h[2], (h[3] + w / 2) * ZT.k + ZT.x + pulses.scaledXOffset, 105, w * ZT.k)
        bitsRangesPath.moveTo(h[3], 94)
        bitsRangesPath.lineTo(h[3], 108)
        bitsRangesPath.moveTo(h[4], 94)
        bitsRangesPath.lineTo(h[4], 108)
      }
    })
    ctx.strokeStyle = getColor(["base-content", "base-content"], [0.4, 0.3]).value
    ctx.stroke(transformPath(bitsRangesPath, { a: ZT.k, e: ZT.x + pulses.scaledXOffset }))
  }

  onMounted(() => {
    ctx = canvas.value.getContext("2d", {
      willReadFrequently: true,
    })
    ctx.textRendering = "optimizeSpeed"
  })
</script>
