<template lang="pug">
div(class="chart relative" :class="pulses.isSelected && `rounded outline-offset-2 outline-1 outline-dashed outline-base-content/40`")
  div(
    class="relative rounded"
    ref="chartElWrapper"
    @mouseover="isHovered = true"
    @touchstart="console.log"
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
          textarea(
            class="flex-1 input w-full"
            v-wheel="(e) => e.event.stopImmediatePropagation()"
            v-model="raw_data")
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

    div(class="relative overflow-hidden")
      svg(
        class="w-full h-[120px] will-change-auto"
        preserveAspectRatio="none"
        :viewBox="svgViewBox"
        ref="chartEl"
        :height="chartElBounds.height.value || 1")
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

        PulsesMeasurements(v-bind="{pulses: props.pulses, pulsesStore, viewStore}")

        path(class="fill-none pointer-events-none select-none touch-none stroke-base-content/50 dark:stroke-accent" :d="pulsesLine")
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

        g(
          class="bits pointer-events-none"
          v-for="m in pulses.measurements.filter((m) => m.decoder.sliceGuess?.hints?.length)"
          :key="m.id"
          :transform="`translate(${-props.viewStore.xScale(0)},91)`")
          template(v-if="!m.decoder.analyzerWorker?.isRunning")
            path(
              class="stroke-1 stroke-error"
              v-if="!m.decoder.analyzerWorker?.isRunning"
              :d="m.decoder.bytesHints.map((g) => `M${g.scaledRange[0]},20 V-100 M${g.scaledRange[1]},20 V-100 `).join('')")
            //- g(v-if="m.decoder.sliceGuess.groups.some((g) => g.bytes.filter(bytesFilter.bind(null, {m, g})).length)")
            path(
              class="stroke-1 stroke-base-content/20"
              v-if="bitsHints.length > 0"
              :d="bitsHints.map((h) => `M${h[3]},0 V20 M${h[4]},0 V20`).join('')")
            path(
              class="stroke-1 stroke-info"
              v-if="m.decoder.bytesHints.length > 0"
              :d="m.decoder.bytesHints.map((g) => g.bytes).flat().filter(bytesFilter.bind(null, 30)).map((h) => `M${h[3]},-20 V20 M${h[4]},-20 V20`).join('')")

        g(
          :transform="`translate(${-props.viewStore.xScale(0)},91) scale(${1 / ZT.k},1)`"
          text-anchor="middle"
          dominant-baseline="hanging"
          paint-order="stroke")
          text(
            class="fill-base-content/60 text-xs pointer-events-auto"
            :x="`${bitsHints.map(h => (h[3] + (h[4] - h[3])/2) * ZT.k).join(' ')}`"
            @click="console.log(bitsHints)"
            ) {{bitsHints.map(h => h[2]).join('')}}
          text(
            class="text-xs font-bold fill-base-content stroke-base-300"
            :x="`${bytesHints.map(h => [(h[3] + (h[4] - h[3])/2) * ZT.k-4, (h[3] + (h[4] - h[3])/2) * ZT.k + 4].join(' ')).join(' ')}`"
            y="-15"
              ) {{bytesHints.map(h => h[2].toString(16).padStart(2, "0").toUpperCase()).join('')}}
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

<script setup>
  function getXX(m) {
    return `${10*ZT.k}`
  }
  import { useGesture } from "@vueuse/gesture"
  import { line, curveStepAfter } from "d3-shape"
  import { scaleLinear } from "d3-scale"

  import useSessionStore from "@/stores/sessions"
  import useConfigStore from "@/stores/config"

  import { PulsesMeasurements } from "./Measurements"
  import { usePulsesStore } from "@/models"

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

  const chartEl = ref(null)
  const chartElWrapper = ref(null)
  const chartElBounds = useElementBounding(chartEl)

  const sessionsStore = useSessionStore()
  const { config } = useConfigStore()
  const yScale = scaleLinear([0, 1], [20, 90])

  const { ZT } = props.viewStore.state
  const wrapperBounds = props.viewStore.wrapperBounds

  const genLine = computed(() => {
    return line()
      .x((d) => props.viewStore.xScale(d.time))
      .y((d) => yScale(d.level))
      .curve(curveStepAfter)
  })

  const pulsesLine = computed(() => {
    let lastPulse = props.pulses[props.pulses.length - 1]
    let l = genLine.value(props.pulses)
    l += `L${props.viewStore.xScale(lastPulse.time + lastPulse.width)},${yScale(lastPulse.level)}`
    return l
  })

  const svgViewBox = computed(() => {
    let x = -ZT.x / ZT.k - props.viewStore.xScale(props.pulses.xOffset + props.pulsesStore.minX)
    let w = wrapperBounds.width / ZT.k
    return `${x} -1 ${w} ${chartElBounds.height.value || 0}`
  })

  const isHovered = ref(false)

  const dataUnderCursor = computed(() => props.pulses[props.pulses.dataIDUnderCursor])

  const arrows = computed(() => {
    let next = props.pulses[props.pulses.dataIDUnderCursor + 1]
    let x1 = props.viewStore.xScale(dataUnderCursor.value?.time)
    let x2 = props.viewStore.xScale(dataUnderCursor.value?.time + dataUnderCursor.value?.width)
    let x3 = props.viewStore.xScale(dataUnderCursor.value?.time + dataUnderCursor.value?.width + next?.width)
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
      return props.pulses.raw_data
    },
    set(v) {
      props.pulses.raw_data = v.split(",").map(Number)
    },
  })

  let tmpMeasurement = null

  useGesture(
    {
      onMove: (s) => {
        if (s.dragging || tmpMeasurement) return
        let x = s.event.clientX - wrapperBounds.left - ZT.x
        props.pulses.cursorX = props.viewStore.xScale.invert(x / ZT.k) - props.pulses.xOffset
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
          let x = s.event.clientX - wrapperBounds.left - ZT.x
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
            let x = s.event.clientX - wrapperBounds.left - ZT.x
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
    return props.pulses.measurements
      .filter((m) => !m.decoder.analyzerWorker.isRunning)
      .reduce((acc, m) => {
        return [...acc, ...(m.decoder?.sliceGuess?.hints || [])]
      }, [])
  })

  const bitsHints = computed(() => {
    // return bitsHintsSource.value
    let n = -props.viewStore.xScale(0)
    n += props.pulses.scaledXOffset / ZT.k
    return bitsHintsSource.value.filter((h) => {
      const scaleConstraint = (h[4] - h[3]) * ZT.k > 20
      const viewportConstraint = props.viewStore.isRangeInView(n + h[3], n + h[4])
      return scaleConstraint && viewportConstraint
    })
  })

  // const bitsHints = refThrottled(bitsHints_, 100, true, true)

  const bytesHintsSource = computed(() => {
    return props.pulses.measurements
      .filter((m) => !m.decoder.analyzerWorker.isRunning)
      .reduce((acc, m) => {
        return [...acc, ...(m.decoder.bytesHints.map((g) => g.bytes).flat() || [])]
      }, [])
  })

  const bytesHints = computed(() => {
    // return bytesHintsSource.value
    let n = -props.viewStore.xScale(0)
    n += props.pulses.scaledXOffset / ZT.k
    return bytesHintsSource.value.filter((h) => {
      const scaleConstraint = (h[4] - h[3]) * ZT.k > 30
      const viewportConstraint = props.viewStore.isRangeInView(n + h[3], n + h[4])
      return scaleConstraint && viewportConstraint
    })
  })

  // const bytesHints = refThrottled(bytesHints_, 100, true, true)

  const xOffset = computed(() => {
    let n = -props.viewStore.xScale(0)
    n += props.pulses.scaledXOffset / ZT.k
    return n
  })

  function bytesFilter(w, h) {
    const scaleConstraint = (h[4] - h[3]) * ZT.k > w
    const viewportConstraint = props.viewStore.isRangeInView(xOffset.value + h[3], xOffset.value + h[4])
    return scaleConstraint && viewportConstraint
  }
</script>
