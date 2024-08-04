<template lang="pug">
  //- pre {{viewStore.xScale(dataUnderCursor?.width + pulses.xOffset)}} {{pixelRatio}} {{pixelRatio/ZT.k}}
  .chart.relative(
    :class="isHovered && `rounded outline-offset-2 outline-1 outline-dashed outline-base-content/40`"
    )
    dialog.modal.px-2(:id="componentId")
      .modal-box(class="h-full w-full max-w-5xl")
        .flex.flex-col.h-full.space-y-4
          textarea.flex-1.input.w-full( v-wheel="(e) => e.event.stopImmediatePropagation()" v-model="raw_data")
          form(method="dialog")
            button.btn close
    .relative.rounded(
      ref="chartElWrapper",
      )
      //- :class="isHovered && `outline-1 outline-dashed outline-base-content/40`"
      .join.join-verticals.absolute.left-0.top-0.pr-12s.z-10.shadow-lg(class="-translate-y-full -translate-x-full1" v-show="isHovered")
        button.join-item.btn.btn-sm.btn-square.drag-handle(
          class="cursor-grab active:cursor-grabbing"
          )
          i-ic:round-drag-indicator
        button.join-item.btn.btn-sm.btn-square(:onclick="`${componentId}.showModal()`" title="Edit pulses")
          i-mdi:edit-outline
        button.join-item.btn.btn-sm.btn-square(@click="pulses.measurements.addMeasurement(0,pulses[pulses.length-1].time)" title="Measure all")
          i-fluent-emoji-high-contrast:orange-square
        button.join-item.btn.btn-sm.btn-square(@click.stop="pulses.xOffset = 0" title="Reset offset")
          i-ph:align-left-fill
        button.join-item.btn.btn-sm.btn-square.btn-error(@click.stop="pulsesStore.removePulses(pulses)" title="Remove pulses")
          i-tabler:trash
  
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
                :d="`M 0 0 L 10 5 L 0 10 z`"
                )  
  
  
          PulsesMeasurements(v-bind="{ pulses: props.pulses, pulsesStore, viewStore }")
  
          path.fill-none.pointer-events-none.select-none.touch-auto.touch-none(
            class=" stroke-base-content/50 dark:stroke-accent"
            :d="pulsesLine"
          )
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
  
          //- foreignObject(
            v-for="m in measurementsWithHints"
            :key="m.id"
            :x="m.scaledMinX*ZT.k" y="0"
            :width="m.scaledWidth*ZT.k" height="100" :transform="`scale(${1/ZT.k},1)`"
            class="pointer-events-none select-none touch-none"
            )
            //- pre {{ measurementsWithHints }} measurementsWithHints
            div.relative.pointer-events-auto(
              :style="{ left: `0px`}"
              v-if="((m.rangeWidth / props.viewStore.pixelRatio) * ZT.k) / m.decoder.sliceGuess?.hints?.length > 9"
              )
              //- button.btn asdasd
              .absolute.text-center.text-xs(
                class="first:border-l last:border-r border-base-content/40"
                :class="{'border-none':  m.pixel < 12 }"
                v-for="h in m.decoder.sliceGuess?.hints" :key="h[0]"
                :style="{left: `${((props.pulses[m.rangeIds[0]].time - m.minX + h[0] )/(m.width))*100}%`, width: `${((h[1] - h[0]) / m.width) * 100}%`}"
                ) {{ h[2] }}
  
          //- foreignObject(:x="pulses.measurements[0]?.scaledMinX*ZT.k" y="0" width="100" height="100" :transform="`scale(${1/ZT.k},1)`")
            div.text-center asdasd
            //- path.fill-none.stroke-base-content(
              marker-start='url(#head)'
              marker-end='url(#head)'
              :transform="`translate(0,${sizes.chart.y - 8})`"
              stroke-width="1" :d="`M${xScaleOrigin(props.data[pulseIdUnderCursor]?.time)} 0 L${xScaleOrigin(cumsumData[pulseIdUnderCursor])} 0`")
        
  
        //- pre {{ viewStore.isRangeInView(measurementsWithHints[0].scaledMinX + viewStore.xScale(pulses.xOffset), measurementsWithHints[0].scaledMaxX + viewStore.xScale(pulses.xOffset)) }}
        //- pre {{ viewStore.xScale(pulses.xOffset) }}
        //- pre {{ [measurementsWithHints[0].scaledMinX, viewStore.xScale(pulses.xOffset)] }}

        
        //- .top-0.absolute(
          :style="{width: `${chartElBounds.width.value * ZT.k }px`, transform: `translate3d(${ZT.x + pulses.scaledXOffset}px, 0px, 0px)`}"
          )
          div.absolute.top-0.select-none(
            v-for="m in pulses.measurements"
            :key="m.id"
            :class="[ !m.isHovered && 'opacity-0']"
            v-hover="(e) => {m.isHovered = e.hovering}"
            )
            //- :style="{transform: `translate3d(${(m.scaledMinX)*ZT.k}px, 0%, 0px)`, width: `${m.scaledWidth*ZT.k}px`}"
            //- button.btn(@click="m.showBitsToggle()") {{ m.showBits }}
            //- button.btn(@click="m.showBitsToggle") {{ m.showBits }}
            //- pre.relative(
              :style="`left: ${m.scaledMaxX*ZT.k}px`"
              ) {{ m.decoder.guess }}
            div(class="-translate-x-full p-1")
              PopoverRoot(
                :modal="false"
                )
                PopoverTrigger(
                  :style="`left: ${m.scaledMaxX*ZT.k}px`"
                  class="relative btn btn-sm btn-ghost btn-square")
                  //- i-mdi:more-circle
                  //- i-tabler:wave-sine
                  i-fa6-solid:wave-square
                  //- button. ASDAS
                PopoverPortal
                  PopoverContent.PopoverContent(
                    class="text-xs z-20 data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade min-w-[300px] rounded-md bg-base-300 p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:transition-all"
                    align="end"
                    :side-offset="-5"
                    side="top"
                    :avoidCollisions="true"
                    sticky="partial"
                    updatePositionStrategy="optimized"
                    :style="`max-width: ${viewStore.wrapperBounds.width}px`"
                    :collision-boundary="viewStore.wrapper"
                    )
                    button.btn(@click="console.log(m.decoder)") LOG
                    button.btn(@click="m.showBitsToggle") show bits {{ m.showBits }}
                    input.toggle(type="checkbox" v-model="m.showBits")
                    button.btn(@click="m.copyToClipboard") copyToClipboard
                    div(v-if="m.decoder.hasHints")
                    
                      pre.text-error(v-if="m.showBits && m.decoder.sliceGuess.hints.length > 500") More than 500 bits
                      pre #[b Modulation]: [ {{ m.decoder.guess.modulation }} ]
                      pre #[b Guessing modulation]: {{ m.decoder.guess.name }}
                      pre #[b DC bias (Pulse/Gap skew)]: {{ (m.decoder.analizer?.pulse_gap_skew * 100 || 0).toFixed(1) }}%
                      p.break-words #[b RfRaw (rx)]: {{ m.decoder.analizer.rfrawB1 }}
                      p.break-words #[b RfRaw (tx)]: {{ m.decoder.analizer.rfrawB0 }}
                      pre.text-balance #[b Bits]: {{ m.decoder.sliceGuess.bits?.toHexString() }}
                      //- pre.text-xs(@click="console.log(m.decoder)") {{ m.decoder }}
                    PopoverArrow(class="fill-base-300") 
  
    //- pre {{ measurementsWithHints2.length }}
    //- .relative.overflow-hidden
      .select-text.touch-auto.pointer-events-auto.text-xs.relative.z-10
        .w-full.flex(
          :style="{width: `${chartElBounds.width.value * ZT.k || 1 }px`, transform: `translate3d(${ZT.x + pulses.scaledXOffset}px, 0px, 0px)`}"
          )
          .measurements.relative.w-full.h-10
            .absolute(
              v-for="m in measurementsWithHints2" :key="m.id"
              :style="{transform: `translate3d(${(m.scaledMinX)*ZT.k}px, 0%, 0px)`, width: `${m.scaledWidth*ZT.k}px`}"
              )
              //- :style="{width: `${m.scaledWidth*ZT.k}px`}"
              //- :style="m.decoderStyles"
              //- pre {{ m.pixel }}
              .hints.divide-x.absolute.inset-0(
                v-if="m.decoder.hasHints && m.pixel > 9 && m.decoder?.sliceGuess?.hints.length <= 500"
                )
                //- v-if="m.showBits && m.pixel > 9 && m.decoder?.sliceGuess?.hints <= 300"
                //- v-if="m.pixel > 9 && viewStore.isRangeInView(m.scaledMinX + viewStore.xScale(pulses.xOffset), m.scaledMaxX + viewStore.xScale(pulses.xOffset))"
                .absolute.text-center(
                  class="first:border-l last:border-r border-base-content/40"
                  :class="[m.pixel < 12 && 'border-none' ]"
                  v-for="h in m.decoder.sliceGuess.hints" :key="h[0]"
                  :style="{left: `${((props.pulses[m.rangeIds[0]].time - m.minX + h[0] )/(m.width))*100}%`, width: `${((h[1] - h[0]) / m.width) * 100}%`}"
                  ) {{ h[2] }}
              //- div(
                class="mt-1"
                :class="{'mt-5': m.pixel > 9 }"
                :style="{transform: `translate3d(${m.scaledMinX*ZT.k}px, 0px, 0px)`}"
                )
                // pre {{ m.decoder?.sliceGuess?.bits?.toHexString() }}
        //- /////////////////////////////////////////
        //- .w-full.flex(
          :style="{width: `${chartElBounds.width.value * ZT.k || 1 }px`, transform: `translate3d(${ZT.x + props.viewStore.xScale(props.pulses.xOffset*ZT.k + props.pulsesStore.minX)}px, 0px, 0px)`}"
          )
          .absolute.left-0(
            v-for="m in measurementsWithHints" :key="m.id"
            :style="m.decoderStyles")
            //- pre {{m.decoderStyles}}
            //- pre {{ m.hints }}
            //- pre :: {{ m.width }}  
            //- p {{ m.decoder.sliceGuess.hints[0] }}
            //- p {{ m.rangeWidth / viewStore.pixelRatio * ZT.k  }}
            //- p {{ m.rangeWidth / viewStore.pixelRatio * ZT.k / m.decoder.sliceGuess.hints.length }}
            //- p {{ m.decoder.sliceGuess.hints[m.decoder.sliceGuess.hints.length - 1] }}
            //- a(@click="console.log(m.decoder)") {{ m.width / m.decoder.sliceGuess.hints.length }}
            .hints(v-if="m.rangeWidth / viewStore.pixelRatio * ZT.k / m.decoder.sliceGuess.hints.length > 12")
              .absolute.text-center.border-x.border-red-400(
                v-for="h in m.decoder.sliceGuess.hints" :key="h[0]"
                :style="{ left: `${((m.t0 + h[0]) / m.width) * 100}%`, width: `${((h[1] - h[0]) / m.width) * 100}%`,}"
                ) 
                //- :style="{ left: `${( pulses[d.value.m.rangeIds[0]].time - d.m.minX + h[0])/m.width*100}%`, width: `${(h[1]-h[0])/d.m.width*100}%` }"
                pre {{ h[2] }}
            pre.mt-2.absolute(
              :class="{'mt-6': m.rangeWidth / viewStore.pixelRatio * ZT.k / m.decoder.sliceGuess.hints.length > 12}"
              ) {{ m.decoder?.sliceGuess?.bits?.toHexString() }}
  
            //- pre.mt-6.relative(
              :style="{left: `${( pulses[m.rangeIds[0]].time - m.minX + m.analize?.sliceGuess?.hints[0][0])/m.width*100}%`}"
              ) {{ m.decoder?.sliceGuess?.bits?.toHexString() }}
              
            //- pre {{ m.analize.sliceGuess.hints }}
            //- pre(
              v-if="m.analize?.sliceGuess?.hints?.length"
              ) {{ m.analize?.sliceGuess?.hints[0] }}
            //- pre {{ (m.analize?.sliceGuess?.hints[10][0])/m.width }}
            //- .absolute(
              v-if="m.analize?.sliceGuess?.hints?.length"
              style="transform: translate3d(50%, 0px, 0px)"
              ) {{ m.scaledWidth*ZT.k }}
              //- :style="{transform: `translate3d(${ (m.analize?.sliceGuess?.hints[10][0])/m.width}%, 0px, 0px`}"
  </template>
  
  <script setup>
  import { useGesture, useHover } from "@vueuse/gesture"
  import { line, curveStepAfter } from "d3-shape"
  import { scaleLinear } from "d3-scale"
  
  import { PulsesMeasurements } from "./Measurements"
  
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

const componentId = "chart_" + props.pulses.iid

// watchEffect(() => {
//   console.log(props.pulses);
// })

const yScale = scaleLinear([0, 1], [20, 90])

const { ZT } = props.viewStore.state
const wrapperBounds = props.viewStore.wrapperBounds

const genLine = computed(() =>
  line()
    .x((d) => props.viewStore.xScale(d.time))
    .y((d) => yScale(d.level))
    // .defined((d) => !isNaN(d.time))
    .curve(curveStepAfter),
)

const pulsesLine = computed(() => genLine.value(props.pulses))

const svgViewBox = computed(() => {
  
  let x = -ZT.x / ZT.k - props.viewStore.xScale(props.pulses.xOffset + props.pulsesStore.minX)
  let w = wrapperBounds.width / ZT.k
  return `${x} -1 ${w} ${chartElBounds.height.value || 0}`
})

const isHovered = ref(false)

// useHover(
//   (s) => {
//     isHovered.value = s.hovering
//   },
//   {
//     domTarget: chartElWrapper,
//   },
// )

const measurementsInViewport = computed(() => {
  return props.pulses.measurements.filter((m) => {
    let offset = props.viewStore.xScale(props.pulses.xOffset)
    return props.viewStore.isRangeInView(m.scaledMinX + offset, m.scaledMaxX + offset)
  })
})

const measurementsWithHints = computed(() => {
  return props.pulses.measurements
    .filter((m) => m.showBits)
    .filter((m) => {
      let offset = props.viewStore.xScale(props.pulses.xOffset)
      return props.viewStore.isRangeInView(m.scaledMinX + offset, m.scaledMaxX + offset)
    })
})


const measurementsWithHints2 = computedWithControl(
  () => measurementsWithHints.value.length,
  () => {
    // console.log("AKJSLKDAS");
    // return []
    let o = measurementsWithHints.value
      .filter((m) => m.decoder.hasHints && m.showBits)
    o.forEach((m) => {
        // console.log(m);
        m.t0 = computed(() => props.pulses[m.rangeIds[0]].time - m.minX)
        // m.t0 = computed(() => props.pulses[m.rangeIds[0]].time)
        m.pixel = computed(() => {
          // console.log(((m.rangeWidth / props.viewStore.pixelRatio) * ZT.k) / m.decoder.sliceGuess?.hints?.length);
          // console.log({...m.decoder.guess}, props.viewStore.pixelRatio);
          // console.log(m.decoder.guess.gap / props.viewStore.pixelRatio * ZT.k);
          return (m.decoder.guess?.gap || m.decoder.guess?.long) / props.viewStore.pixelRatio * ZT.k
          return ((m.rangeWidth / props.viewStore.pixelRatio) * ZT.k) / m.decoder.sliceGuess?.hints?.length
        })
        // m.decoderStyles = computed(() => {
        //   return {
        //     width: `${m.scaledWidth * ZT.k}px`,
        //     transform: `translate3d(${m.scaledMinX * ZT.k}px, 0px, 0px)`,
        //   }
        // })
    })
  return o
})

const decoders = computed(() => {
  return measurementsWithHints.value.map((m_) => {
    const m = props.pulses.measurements.find((m) => m.id === m_.id)
    const styles = computed(() => {
      console.log("======")
      return {
        width: `${m.scaledWidth * ZT.k}px`,
        transform: `translate3d(${m.scaledMinX * ZT.k}px, 0px, 0px)`,
      }
    })
    const hints = computed(() => {
      const t0 = props.pulses[m.rangeIds[0]].time - m.minX
      return m.decoder.sliceGuess.hints.map((h) => [
        ...h,
        {
          left: `${((t0 + h[0]) / m.width) * 100}%`,
          width: `${((h[1] - h[0]) / m.width) * 100}%`,
        },
      ])
    })
    return {
      id: m.id,
      styles,
      hints,
    }
    return computed(() => {
      let d = { m }
      d.id = m.id
      d.styles = {
        width: `${m.scaledWidth * ZT.k}px`,
        transform: `translate3d(${m.scaledMinX * ZT.k}px, 0px, 0px)`,
      }
      // :style="{ left: `${( pulses[d.value.m.rangeIds[0]].time - d.m.minX + h[0])/m.width*100}%`, width: `${(h[1]-h[0])/d.m.width*100}%` }"
      const t0 = props.pulses[m.rangeIds[0]].time - m.minX

      d.hints = m.decoder.sliceGuess.hints.map((h) => [
        ...h,
        {
          left: `${((t0 + h[0]) / m.width) * 100}%`,
          width: `${((h[1] - h[0]) / m.width) * 100}%`,
        },
      ])
      console.log("+++")
      return d
    })
  })
  // return o
})

const dataUnderCursor = computed(() => props.pulses[props.pulses.dataIDUnderCursor])

const arrows = computed(() => {
  let next = props.pulses[props.pulses.dataIDUnderCursor + 1]
  let x1 = props.viewStore.xScale(dataUnderCursor.value?.time)
  let x2 = props.viewStore.xScale(dataUnderCursor.value?.time + dataUnderCursor.value?.width)
  let x3 = props.viewStore.xScale(
    dataUnderCursor.value?.time + dataUnderCursor.value?.width + next?.width,
  )
  return {
    x1,
    x2,
    x3: next ? x3 : undefined,
    // a1: {x1,x2},
    // a2: {x1,x2: next ? x3 : undefined},
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
    // on: (s) => {
    //   console.log(s);
    //   isHovered.value = !isHovered.value
    // },
    onMove: (s) => {
      if (s.dragging || tmpMeasurement) return
      let x = s.event.clientX - wrapperBounds.left - ZT.x
      props.pulses.cursorX = props.viewStore.xScale.invert(x / ZT.k) - props.pulses.xOffset
      // props.pulses.dataIDUnderCursor = bisectorRef.left(props.pulses, props.pulses.cursorX) - 1
    },
    onDrag: (s) => {
      // if (s.tap) {
      //   s.event.stopPropagation()
      //   console.log(props.pulsesStore.pulses);
      //   props.pulsesStore.pulses.forEach((p) => (p.isHovered = false))
      //   isHovered.value = !isHovered.value
      //   return
      // }
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
          return
        }
        if (tmpMeasurement) {
          tmpMeasurement.x2 = props.pulses.cursorX
          return
        }
        if (!tmpMeasurement && s.delta[0] !== 0) {
          let x = s.event.clientX - wrapperBounds.left - ZT.x
          tmpMeasurement = props.pulses.measurements.addMeasurement(
            props.pulses.cursorX,
            props.pulses.cursorX,
          )
        }
        return
      }
    },
  },
  {
    domTarget: chartEl,
    drag: {
      // preventWindowScrollY: true,
      // useTouch: true,
      // filterTaps: true,
    }
  },
)
  </script>
  