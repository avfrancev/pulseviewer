<template lang="pug">
div(class="chart relative" :class="pulses.isSelected && `rounded outline-offset-2 outline-1 outline-dashed outline-base-content/40`")
  div(
    class="relative rounded"
    ref="wrapper"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false")
    div(class="join join-verticals absolute left-0 top-0 pr-12s z-10 shadow-lg -translate-y-full bg-base-300" v-show="isHovered")
      button(class="join-item btn btn-sm btn-square drag-handle cursor-grab active:cursor-grabbing")
        i-ic:round-drag-indicator
      Modal
        template(#trigger)
          DialogTrigger(class="join-item btn btn-sm btn-square")
            i-mdi:edit-outline
        template(#content)
          DialogTitle(class="mb-4 text-lg font-bolds")
            | Edit pulses
          DialogDescription
          textarea(
            class="flex-1 input w-full"
            v-wheel="(e) => e.event.stopImmediatePropagation()"
            v-model.lazy="raw_data")
          div(class="mt-3 flex justify-end")
            DialogClose(as-child)
              button(class="btn")
                | OK
          DialogClose(class="btn btn-square btn-sm text-xs top-0 right-0 absolute m-2" aria-label="Close")
            i-fa:close 
      button(
        class="join-item btn btn-sm btn-square"
        @click="pulses.measurements.addMeasurement(0, pulses[pulses.length - 1].time)"
        title="Measure all")
        i-fluent-emoji-high-contrast:orange-square
      button(
        class="join-item btn btn-sm btn-square"
        :disabled="pulses.xOffset === 0"
        @click.stop="pulses.xOffset = 0"
        title="Reset offset")
        i-ph:align-left-fill

      PopoverRoot
        PopoverTrigger(
          class="join-item btn btn-square btn-sm"
          aria-label="Copy to session"
          title="Copy to session")
          i-material-symbols:copy-all
        PopoverContent(
          class="bg-base-300 menu rounded z-30 p-0 shadow-lg"
          side="bottom"
          :side-offset="2")
          p(class="px-2 py-2 text-xs text-base-content/50") Copy to:
          PopoverClose
            li: a(
              class="text-xs px-2 py-1 rounded"
              v-for="s in copyToSessionMenu"
              :key="s.id"
              @click="s.action") {{s.label}}
          PopoverArrow(class="fill-base-300")

      button(
        class="join-item btn btn-sm btn-square hover:btn-error"
        @click.stop="pulsesStore.removePulses(pulses)"
        title="Remove pulses")
        i-tabler:trash

    //- div(class="relative overflow-hidden")
    div(class="relative h-[120px]" ref="wrapper")
      //- p {{  pulses.viewportRangeIDs }}
      svg(
        class="w-full h-[120px] will-change-auto absolute top-0"
        preserveAspectRatio="none"
        :viewBox="svgViewBox"
        ref="chartEl"
        :height="wrapperBounds.height.value || 1")
        //- :viewBox="`${-ZT.x/ZT.k - viewStore.xScale(pulses.xOffset)} -1 ${wrapperBounds.width/ZT.k} ${150}`"
        defs
          marker#head(
            markerUnits="userSpaceOnUse"
            :viewBox="`0 0 10 10`"
            :refX="10 / ZT.k"
            :refY="5"
            :markerWidth="6"
            :markerHeight="6"
            orient="auto-start-reverse")
            path(
              class="fill-base-content"
              :transform="`scale(${1 / ZT.k},${1})`"
              :d="`M 0 0 L 10 5 L 0 10 z`") 

        g(
          class="arrows pointer-events-none select-none touch-none"
          v-if="(dataUnderCursor?.width / viewStore.pixelRatio) * ZT.k > 15 && isHovered && arrows.x1 !== undefined && arrows.x3 !== undefined")
          text(
            class="fill-base-content text-xs"
            :x="arrows.label1.x"
            dy="0"
            :transform="`scale(${1 / ZT.k},1)`"
            :transform-origin="`${arrows.label1.x} 0`"
            dominant-baseline="hanging"
            text-anchor="middle") {{arrows.label1.text}}
          text(
            class="fill-base-content text-xs"
            :x="arrows.label1.x"
            dy="100"
            :transform="`scale(${1 / ZT.k},1)`"
            :transform-origin="`${arrows.label2.x} 0`"
            dominant-baseline="hanging"
            text-anchor="middle") {{arrows.label2.text}}
          path(
            class="stroke-base-content stroke-1 fill-none"
            marker-start="url(#head)"
            marker-end="url(#head)"
            :d="`M${arrows.x1},15 L${arrows.x2},15`")
          path(
            class="stroke-base-content stroke-1 fill-none"
            marker-start="url(#head)"
            marker-end="url(#head)"
            :d="`M${arrows.x1},96 L${arrows.x3},96`")

        PulsesMeasurements(v-bind="{pulses: pulses, pulsesStore, viewStore}")
      canvas(
        ref="canvas"
        :width="wrapperBounds.width.value"
        :height="wrapperBounds.height.value"       class="absolute pointer-events-none")

      div(
        class="top-0 absolute will-change-auto"
        v-for="m in pulses.measurements"
        :key="m.id"
        :style="{width: `${m.scaledWidth * ZT.k}px`, transform: `translate3d(${m.scaledMinX * ZT.k + ZT.x + pulses.scaledXOffset}px, 0px, 0px)`}")
        Transition(
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0")
          div(class="text-right p-2" v-if="m.decoder.analyzerWorker?.isRunning")
            div(class="loading")
</template>

<script setup lang="jsx">
  import { bisector } from "d3-array"
  import paper from "paper/dist/paper-core"
  import { useGesture } from "@vueuse/gesture"
  import { scaleLinear } from "d3-scale"

  import useSessionStore from "@/stores/sessions"
  import useConfigStore from "@/stores/config"

  import { PulsesMeasurements } from "@/components/PulsesViewer/Measurements"
  import { usePulsesStore } from "@/models"
  import { colors, getColor, mode, darkColors, lightColors } from "@/stores/colors"
import { average } from "simple-statistics"

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
  })

  const { config } = useConfigStore()
  const sessionsStore = useSessionStore()

  // const pulsesStore = usePulsesStore(props.session.id)
  const { pulses, viewStore, pulsesStore } = props
  const { ZT } = props.viewStore.state
  // const { pulses } = props

  const wrapper = ref(null)
  const canvas = ref(null)
  const chartEl = ref(null)
  const wrapperBounds = useElementBounding(wrapper)

  const targetIsVisible = useElementVisibility(wrapper)

  const svgViewBox = computed(() => {
    let x = -ZT.x / ZT.k - viewStore.xScale(pulses.xOffset + pulsesStore.minX)
    let w = wrapperBounds.width.value / ZT.k
    return `${x} -1 ${w} ${wrapperBounds.height.value || 0}`
  })

  const isHovered = ref(false)

  const dataUnderCursor = computed(() => pulses[pulses.dataIDUnderCursor])

  const arrows = computed(() => {
    let next = pulses[pulses.dataIDUnderCursor + 1]
    let x1 = viewStore.xScale(dataUnderCursor.value?.time)
    let x2 = viewStore.xScale(dataUnderCursor.value?.time + dataUnderCursor.value?.width)
    let x3 = viewStore.xScale(dataUnderCursor.value?.time + dataUnderCursor.value?.width + next?.width)
    return {
      x1,
      x2,
      x3: next ? x3 : undefined,
      label1: {
        x: x1 + (x2 - x1) / 2,
        text: `${dataUnderCursor.value?.width}`,
      },
      label2: {
        x: x1 + (x3 - x1) / 2,
        text: next?.width + dataUnderCursor.value?.width,
      },
    }
  })

  const raw_data = computed({
    get() {
      return pulses.raw_data
    },
    set(v) {
      v = v.split(",").map(Number)
      pulses.raw_data = v
    },
  })

  let tmpMeasurement = null

  useGesture(
    {
      onMove: (s) => {
        if (s.dragging || tmpMeasurement) return
        let x = s.event.clientX - wrapperBounds.left.value - ZT.x
        pulses.cursorX = viewStore.xScale.invert(x / ZT.k) - pulses.xOffset
      },
      onDrag: (s) => {
        if (s.shiftKey && (s.ctrlKey || s.metaKey)) {
          s.event.stopPropagation()
          props.pulses.xOffset += (props.viewStore.pixelRatio * s.delta[0]) / ZT.k
          return
        }

        if (tmpMeasurement) s.event.stopPropagation()

        if (s.altKey && !s.first) {
          s.event.stopPropagation()
          let x = s.event.clientX - wrapperBounds.left.value - ZT.x
          props.pulses.cursorX = props.viewStore.xScale.invert(x / ZT.k) - props.pulses.xOffset
          if (tmpMeasurement && s.last) {
            tmpMeasurement = null
            props.viewStore.state.gestures.state.drag.cancel()
            return
          }
          if (tmpMeasurement) {
            tmpMeasurement.x2 = props.pulses.cursorX
            return
          }
          if (!tmpMeasurement && s.delta[0] !== 0) {
            let x = s.event.clientX - wrapperBounds.left.value - ZT.x
            tmpMeasurement = props.pulses.measurements.addMeasurement(props.pulses.cursorX, props.pulses.cursorX)
          }
          return
        }
      },
    },
    {
      domTarget: chartEl,
    },
  )

  function copyToSession(_pulses, sessionId) {
    const ps = usePulsesStore(sessionId)
    ps.loadPulses([_pulses], false)
  }

  const copyToSessionMenu = computed(() => {
    return sessionsStore.sessions.map((s, i) => {
      let label = props.pulsesStore.uuid === s.id ? "Current" : `Session #${i + (config.useESP32 ? 0 : 1)}`
      if (s.id === "ESP32") label = "ESP32"
      return {
        id: s.id,
        label,
        action: () => {
          copyToSession(props.pulses, s.id)
        },
      }
    })
  })

  const bitsHintsSource = computed(() => {
    return pulses.measurements
      .toSorted((a, b) => a.minXWithXOffset - b.minXWithXOffset)
      .filter((m) => !m.decoder.analyzerWorker.isRunning)
      .reduce((acc, m) => {
        return [...acc, ...(m.decoder?.bitsHints || [])]
      }, [])
  })

  const bitsHints = computed(() => {
    let n = -props.viewStore.xScale(0)
    n += props.pulses.scaledXOffset / ZT.k
    return bitsHintsSource.value.filter((h) => {
      const scaleConstraint = (h[4] - h[3]) * ZT.k > 20
      const viewportConstraint = props.viewStore.isRangeInView(n + h[3], n + h[4])
      return scaleConstraint && viewportConstraint
    })
  })

  const transformPath = (path, matrix) => {
    const copy = new Path2D()
    copy.addPath(path, matrix)
    return copy
  }

  const bitsHintsSourcePath = computed(() => {
    return bitsHintsSource.value.reduce((acc, h) => {
      acc += `M${h[3]} 94 V108 M${h[4]} 94 V108 `
      return acc
    }, "")
  })

  const pulsesPath = computed(() => {
    let o = pulses.reduce((acc, d, i) => {
      const t = i % 2 === 0
      let x = viewStore.xScale(d.time)
      let w = x + viewStore.xScale(d.width + pulsesStore.minOffset)
      return (acc += `M${x},${t ? 22 : 90} V${t ? 90 : 22} H${w}`)
    }, "")
    return new Path2D(o)
  })

  const bitsHintsSourceViewportIDs = computed(() => {
    let l = viewStore.state.viewportLeft - pulses.scaledXOffset / ZT.k
    let r = viewStore.state.viewportRight - pulses.scaledXOffset / ZT.k
    // return [arr.bisector(h=>h[3])(bitsHints.value, l).left(arr, l)]
    let ids = [bisector((h) => h[3]).left(bitsHintsSource.value, l), bisector((h) => h[4]).left(bitsHintsSource.value, r)]
    return ids
  })

  let ctx, ctx__, sprites
  let scope = new paper.PaperScope()

  watch(wrapperBounds.width, () => {
    canvas.value.width = wrapperBounds.width.value
    canvas.value.height = wrapperBounds.height.value
  })
  
  watch(
    () => [ZT.k, ZT.x, bitsHintsSource.value, pulses.scaledXOffset, mode.value, pulses.raw_data, targetIsVisible.value, wrapperBounds.width.value],
    () => {
      if (targetIsVisible.value === false) return
      window.requestAnimationFrame(draw)
    },
    { immediate: true },
  )

  let a = []
  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, wrapperBounds.width.value, wrapperBounds.height.value)
    ctx.reset()
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
    // return
    pulses.measurements.forEach((m) => {
      if (m.decoder.analyzerWorker.isRunning) return
      m.decoder.bytesHints.forEach((h) => {
        h.bytes.forEach((b) => {
          bytesRangesPath.moveTo(b[3], 70)
          bytesRangesPath.lineTo(b[3], 110)
          bytesRangesPath.moveTo(b[4], 70)
          bytesRangesPath.lineTo(b[4], 110)
          let w = b[4] - b[3]
          if (w * ZT.k < 30) return
          let args = [b[2].toString(16).padStart(2, "0").toUpperCase(), (b[3] + w / 2) * ZT.k + ZT.x + pulses.scaledXOffset, 85, w * ZT.k]
          ctx.strokeText(...args)
          ctx.fillText(...args)
        })
        bytesRangesPathErr.moveTo(h.scaledRange[0], 0)
        bytesRangesPathErr.lineTo(h.scaledRange[0], 110)
        bytesRangesPathErr.moveTo(h.scaledRange[1], 0)
        bytesRangesPathErr.lineTo(h.scaledRange[1], 110)
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
      if (w && w*ZT.k < 5) return
      
      for (let i = m.decoder.viewportRangeIDs[0] - 1; i <= m.decoder.viewportRangeIDs[1]; i++) {
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
      alpha: true,
    })
  })
</script>
