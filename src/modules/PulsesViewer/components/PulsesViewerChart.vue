<template lang="pug">
//- pre {{viewStore.xScale(dataUnderCursor?.width + pulses.xOffset)}} {{pixelRatio}} {{pixelRatio/ZT.k}}
.chart.relative
  dialog.modal.px-2(:id="componentId")
    .modal-box(class="h-full w-full max-w-5xl")
      .flex.flex-col.h-full.space-y-4
        textarea.flex-1.input.w-full( v-wheel="(e) => e.event.stopImmediatePropagation()" v-model="raw_data")
        form(method="dialog")
          button.btn close

  .relative.rounded.outline-offset-2(ref="chartElWrapper" :class="{'outline outline-1 outline-dashed outline-base-content/40': isHovered}")
    .join.absolute.left-0.top-0.pr-12s.z-10.shadow-lg(class="-translate-y-1/2" v-show="isHovered")
      button.join-item.btn.btn-sm.btn-square.drag-handle
        i-ooui:move
      button.join-item.btn.btn-sm.btn-square(:onclick="`${componentId}.showModal()`" title="Edit pulses")
        i-mdi:edit-outline
      button.join-item.btn.btn-sm.btn-square(@click="pulses.measurements.addMeasurement(0,pulses[pulses.length-1].time)" title="Measure all")
        i-fluent-emoji-high-contrast:orange-square
      button.join-item.btn.btn-sm.btn-square(@click.stop="pulses.xOffset = 0" title="Reset offset")
        i-fluent:list-bar-tree-offset-16-filled
      button.join-item.btn.btn-sm.btn-square.btn-error(@click.stop="pulsesStore.removePulses(pulses)" title="Remove pulses")
        i-tabler:trash
      //- button.btn.btn-sm.join-item(@click="[pulsesStore[0], pulses[1]] = [pulses[1], pulses[0]];") SWAP

    .relative.overflow-hidden
      svg.w-full(
          preserveAspectRatio="none"
          :viewBox="svgViewBox"
          ref="chartEl"
          :height="chartElBounds.height.value || 1"
          class="h-[120px]"
        )
        //- :viewBox="`${-ZT.x/ZT.k - viewStore.xScale(pulses.xOffset)} -1 ${wrapperBounds.width/ZT.k} ${150}`"
        defs
          marker( 
            markerUnits="userSpaceOnUse"
            id='head' 
            :viewBox="`0 0 10 10`"
            :refX="10/ZT.k"
            :refY="5"
            :markerWidth="6"
            :markerHeight="6"
            orient="auto-start-reverse")
            path.fill-base-content(
              :transform="`scale(${1/ZT.k},${1})`"
              :d='`M 0 0 L 10 5 L 0 10 z`')  


        PulsesMeasurements(v-bind="{ pulses: props.pulses, pulsesStore, viewStore }")

        path.stroke-accent.fill-none.pointer-events-none.select-none.touch-none(
          :d="pulsesLine"
        )
        //- path.stroke-2.stroke-primary(
        //-   d="M368,0 L712,0 L712,100 L368,100",
        //- )
          //- d="M1000,0 L 0,20 L0,90 L1.003,90L1.003,20L2.157,20L2.157,90L3.114,90",
        //- circle(:cx="viewStore.xScale(dataUnderCursor?.time)" cy="100" r="10" fill="red" stroke="red" stroke-width="1")
        //- Measurements(v-bind="{ measurements, pulses: props.pulses, viewStore }")
        //- Measurements2(v-bind="{ measurements, pulses: props.pulses, viewStore }")


        g.arrows.pointer-events-none.select-none.touch-none(
          v-if="(dataUnderCursor?.width / viewStore.pixelRatio * ZT.k) > 15 && isHovered && arrows.x1 !== undefined && arrows.x3 !== undefined"
          )
          //- v-if="xScaleOrigin((props.data[pulseIdUnderCursor]?.width) * t.k) > 15"

          text.fill-base-content.text-xs(
            :x="arrows.label1.x"
            dy="0"
            :transform="`scale(${1/ZT.k},1)`"
            :transform-origin="`${arrows.label1.x} 0`"
            dominant-baseline="hanging"
            text-anchor="middle"
            ) {{ arrows.label1.text }}    
          text.fill-base-content.text-xs(
            :x="arrows.label1.x"
            dy="100"
            :transform="`scale(${1/ZT.k},1)`"
            :transform-origin="`${arrows.label2.x} 0`"
            dominant-baseline="hanging"
            text-anchor="middle"
            ) {{ arrows.label2.text }}    
          path.stroke-base-content.stroke-1.fill-none(
            marker-start='url(#head)'
            marker-end='url(#head)'
            :d="`M${arrows.x1},15 L${arrows.x2},15`")
          path.stroke-base-content.stroke-1.fill-none(
            marker-start='url(#head)'
            marker-end='url(#head)'
            :d="`M${arrows.x1},96 L${arrows.x3},96`")

        //- foreignObject(:x="pulses.measurements[0]?.scaledMinX*ZT.k" y="0" width="100" height="100" :transform="`scale(${1/ZT.k},1)`")
          //- div.text-center asdasd
          //- path.fill-none.stroke-base-content(
            marker-start='url(#head)'
            marker-end='url(#head)'
            :transform="`translate(0,${sizes.chart.y - 8})`"
            stroke-width="1" :d="`M${xScaleOrigin(props.data[pulseIdUnderCursor]?.time)} 0 L${xScaleOrigin(cumsumData[pulseIdUnderCursor])} 0`")
      

      //- .absolute.top-0(
        :style="{width: `${chartElBounds.width.value * ZT.k || 1 }px`, transform: `translate3d(${ZT.x + props.viewStore.xScale(props.pulses.xOffset*ZT.k + props.pulsesStore.minX)}px, 0px, 0px)`}"
        )
        //- pre asdasda
        div.absolute.top-0.select-none.transition-opacity.m-2(
          v-for="m in props.pulses.measurements"
          :key="m.id"
          :style="{transform: `translate3d(${m.scaledMinX*ZT.k}px, 0px, 0px)`}"
          :class="{'opacity-0': !m.isHovered}"
          v-hover="(e) => {m.isHovered = e.hovering}"

          )
          button.join-item.btn.btn-xs.btn-error.btn-square(@click="props.pulses.measurements.removeMeasurement(m.id)")
            i-tabler:trash

        //- :style="{transform: `translate3d(${m.scaledMinX*ZT.k+ZT.x + props.viewStore.xScale(props.pulses.xOffset*ZT.k + props.pulsesStore.minX)}px, 0px, 0px)`}"
      //- pre.relative.top-0(
        :style="{transform: `translate3d(${props.viewStore.xScale(props.pulses.xOffset*ZT.k + props.pulsesStore.minX)}px, 0px, 0px)`}"
        )  asd
        //- .relative
        //- .join.p-1.bg-accent.text-accent-content(
          v-hover="(e) => {m.isHovered = e.hovering}"
          :class="{'opacity-0': !m.isHovered}"
          ) lakjsd
          //- :style="{opacity: !m.isHovered ? 0.005 : 1}"
          //- v-show="m.isHovered"
        //- v-if="m.isCursorsInsideMeasurement && !m.isDragging && isHovered"
        //- .join.p-1.transition.duration-150(
          v-hover="(e) => {m.isHovered = e.hovering}"
          :class="{'opacity-0': !m.isHovered || m.isDragging}"
          )
          //- button.join-item.btn.btn-xs(@click="m.x1 += 10000")  ДФДФ
          //- button.join-item.btn.btn-xs(@click="m.x2 += 10000")  ДФДФ
          //- button.join-item.btn.btn-xs(@click="m.x1 -= 10000")  ДФДФ
          button.join-item.btn.btn-xs.btn-error.btn-square(@click="props.pulses.measurements.removeMeasurement(m.id)")
            //- i-eva:close-outline
            i-tabler:trash
    //- pre {{ props.pulses.decodedPWM }}
    //- .relative.h-5.overflow-hidden
      div.absolute.border(
        v-for="d in decodedPWM"
        :style="{width: `${props.viewStore.xScale(d.width)*ZT.k}px`, transform: `translateX(${props.viewStore.xScale(d.time)*ZT.k + ZT.x}px)`}"
        ) {{ d.b }}
</template>

<script setup>
import { useGesture, useHover } from '@vueuse/gesture'
import { line, curveStepAfter } from 'd3-shape';
import { scaleLinear } from 'd3-scale';

import { PulsesMeasurements } from './Measurements'

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
  }
})

const chartEl = ref(null)
const chartElWrapper = ref(null)
const chartElBounds = useElementBounding(chartEl)

const componentId = "chart_" +props.pulses.iid

// watchEffect(() => {
//   console.log(props.pulses);
// })

const yScale = scaleLinear([0,1],[20, 90])

const { ZT } = props.viewStore.state
const wrapperBounds = props.viewStore.wrapperBounds

const genLine = computed(() => 
  line()
    .x((d) => props.viewStore.xScale(d.time))
    .y((d) => yScale(d.level))
    // .defined((d) => !isNaN(d.time))
    .curve(curveStepAfter)
)

const pulsesLine = computed(() => genLine.value(props.pulses))

const svgViewBox = computed(() => {
  let x = (-ZT.x / ZT.k - props.viewStore.xScale(props.pulses.xOffset + props.pulsesStore.minX)) 
  let w = wrapperBounds.width / ZT.k
  return `${x} -1 ${w} ${chartElBounds.height.value || 0}`
})

const isHovered = ref(false)

useHover((s) => {
  isHovered.value = s.hovering
},{
  domTarget: chartElWrapper
})



const dataUnderCursor = computed(() => props.pulses[props.pulses.dataIDUnderCursor])

const arrows = computed(() => {
  let next = props.pulses[props.pulses.dataIDUnderCursor+1]
  let x1 = props.viewStore.xScale(dataUnderCursor.value?.time)
  let x2 = props.viewStore.xScale(dataUnderCursor.value?.time + dataUnderCursor.value?.width ) 
  let x3 = props.viewStore.xScale(dataUnderCursor.value?.time + dataUnderCursor.value?.width + next?.width)
  return {
    x1,x2,x3: next ? x3 : undefined,
    // a1: {x1,x2},
    // a2: {x1,x2: next ? x3 : undefined},
    label1: {
      x: x1 + (x2 - x1)/2,
      text: dataUnderCursor.value?.width,
    },
    label2: {
      x: x1 + (x3 - x1)/2,
      text: next?.width + dataUnderCursor.value?.width,
    },
  }
})

const raw_data = computed({
  get() {
    return props.pulses.raw_data
  },
  set(v) {
    props.pulses.raw_data = v.split(',').map(Number)
  }
})

let tmpMeasurement = null

useGesture({
  onMove: (s) => {
    if (s.dragging) return
    let x = s.event.clientX - wrapperBounds.left - ZT.x 
    props.pulses.cursorX = props.viewStore.xScale.invert(x/ ZT.k) - props.pulses.xOffset
    // props.pulses.dataIDUnderCursor = bisectorRef.left(props.pulses, props.pulses.cursorX) - 1
  },
  onDrag: (s) => {
    if (s.shiftKey && (s.ctrlKey || s.metaKey )) {
      s.event.stopImmediatePropagation()
      props.pulses.xOffset += props.viewStore.pixelRatio*s.delta[0]/ZT.k
      return
    }

    if (s.altKey)
      s.event.stopImmediatePropagation()


    if (s.altKey && !s.first) {
      s.event.stopImmediatePropagation()
      let x = s.event.clientX - wrapperBounds.left - ZT.x 
      props.pulses.cursorX = props.viewStore.xScale.invert(x/ ZT.k) - props.pulses.xOffset
      if (tmpMeasurement && s.last) {
        tmpMeasurement = null
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
    }  }
}, {
  domTarget: chartEl
})


</script>

