<template lang="pug">
//- pre {{viewStore.xScale(dataUnderCursor?.width + pulses.xOffset)}} {{pixelRatio}} {{pixelRatio/ZT.k}}
.chart.relative(
  :class="pulses.isSelected && `rounded outline-offset-2 outline-1 outline-dashed outline-base-content/40`"
  )
  //- dialog.modal.px-2(:id="componentId")
    .modal-box(class="h-full w-full max-w-5xl")
      .flex.flex-col.h-full.space-y-4
        textarea.flex-1.input.w-full( v-wheel="(e) => e.event.stopImmediatePropagation()" v-model="raw_data")
        form(method="dialog")
          button.btn close
  .relative.rounded(
    ref="chartElWrapper",
    @mouseover="isHovered = true",
    @touchstart="console.log",
    @mouseleave="isHovered = false",
    )
    //- :class="isHovered && `outline-1 outline-dashed outline-base-content/40`"
    .join.join-verticals.absolute.left-0.top-0.pr-12s.z-10.shadow-lg(
      class="-translate-y-full bg-base-300" v-show="isHovered")
      button.join-item.btn.btn-sm.btn-square.drag-handle(
        class="cursor-grab active:cursor-grabbing"
        )
        i-ic:round-drag-indicator
      //- button.join-item.btn.btn-sm.btn-square(:onclick="`${componentId}.showModal()`" title="Edit pulses")
        i-mdi:edit-outline
      Modal
        template(#trigger)
          DialogTrigger(class="join-item btn btn-sm btn-square")
            i-mdi:edit-outline
        template(#content)
          DialogTitle(class="mb-4 text-lg font-bolds")
            | Edit pulses
          //- DialogDescription(class="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal")
            pre.text-xs(class="text-base-content/50") Example: 434,394,380,422,379,422,377,421,378,420,377,421
          textarea.flex-1.input.w-full( v-wheel="(e) => e.event.stopImmediatePropagation()" v-model="raw_data")
          //- textarea.textarea.textarea-bordered.my-4.flex-1.w-full(
            v-model="tmpPulsesString" placeholder="434,394,380,422,379,422,377,421,378,420,377,421")
          div(class="mt-3 flex justify-end")
            DialogClose(as-child)
              button(class="btn" )
                | OK
          DialogClose(class="btn btn-square btn-sm text-xs top-0 right-0 absolute m-2" aria-label="Close")
            i-fa:close          
      button.join-item.btn.btn-sm.btn-square(@click="pulses.measurements.addMeasurement(0,pulses[pulses.length-1].time)" title="Measure all")
        i-fluent-emoji-high-contrast:orange-square
      button.join-item.btn.btn-sm.btn-square(
        :disabled="pulses.xOffset === 0"
        @click.stop="pulses.xOffset = 0" title="Reset offset")
        i-ph:align-left-fill

      PopoverRoot
        PopoverTrigger.join-item.btn.btn-square.btn-sm(aria-label="Copy to session" title="Copy to session")
          i-material-symbols:copy-all
        PopoverContent(
          side="bottom"
          :side-offset="2"
          class="bg-base-300 menu rounded z-30 p-0 shadow-lg"
          )
          //- li: button.btn.btn-xs.text-left(v-for="s in copyToSessionMenu" :key="s.id" @click="s.action") to {{ s.label }}
          p.px-2.py-2.text-xs(class="text-base-content/50") Copy to:
          PopoverClose
            li: a.text-xs.px-2.py-1.rounded(v-for="s in copyToSessionMenu" :key="s.id" @click="s.action") {{ s.label }}
          PopoverArrow(class="fill-base-300")

      //- button.join-item.btn.btn-sm.btn-square(@click="copyToSession(pulses)" title="Copy to session")
        i-material-symbols:copy-all
        //- pre CP
      button.join-item.btn.btn-sm.btn-square(
        class="hover:btn-error"
        @click.stop="pulsesStore.removePulses(pulses)" title="Remove pulses")
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

        //- g.bits(
          v-for="m in measurementsWithHints"
          :key="m.id"
          :transform="`translate(${viewStore.xScale(m.pulsesInRange[0].time)},0)`"
          )
          //- path.stroke-1.stroke-blue-400(:d="m.path")
        g.bits.pointer-events-none1(
          v-for="m in pulses.measurements.filter(m => m.decoder.sliceGuess?.hints?.length)"
          :key="m.id"
          :transform="`translate(${viewStore.xScale(m.pulsesInRange[0].time)},91)`"
          )
          g()
            path(
              class="stroke-2 stroke-red-600"
              :d="m.decoder.sliceGuess.LA.map((h,i) => `M${h[3]},0 V-300`).join('')"
              )
            path(
              class="stroke-1 stroke-green-400"
              :d="m.decoder.sliceGuess.bb.map(h => `M${h[0]},0 V20 M${h[1]},0 V20`).join('')"
              )
            text(
              class="fill-green-100 font-bold text-xss"
              dy="-15"
              :transform="`scale(${1/ZT.k},1)`"
              text-anchor="middle"
              dominant-baseline="hanging"
              ) 
              tspan(
                v-for="(h,i) in m.decoder.sliceGuess.bb"
                :key="i"
                :x="`${(h[0] + (h[1]-h[0])/2)*ZT.k}`"
              ) {{ parseInt(h[2],2).toString(16).toUpperCase() }}
              //- {{ m.decoder.sliceGuess.bb.join('') }}
              //- :textLength="m.rangeScaledWidth*ZT.k"
              //- :x="m.scaledMinX*ZT.k"
              //- tspan(
                v-for="(h,i) in m.decoder.sliceGuess.hints.filter((h,i) => i%8 == 0)"
                :key="i"
                :x="`${(h[3] )*ZT.k}`"
                ) {{ m.decoder.sliceGuess.bits.bytes[i].toString(16)}}
              //- tspan {{ m.decoder.sliceGuess.bits.bytes.filter(b => +b > 0) }}
              //- tspan.stroke-1.stroke-green-600(
                v-for="(b,i) in m.decoder.sliceGuess.bits.bytes.filter(b => +b >= 0)"
                :key="i"
                :x="`${( m.decoder.sliceGuess.hints[(i)*7][3] )*ZT.k}`"
                ) {{ b.toString(16).toUpperCase()}}
                //- ) {{ m.decoder.sliceGuess.hints[i*4][3]}}

          g(
            v-if="m.decoder.sliceGuess?.hints?.length && ((m.rangeWidth / props.viewStore.pixelRatio) * ZT.k) / m.decoder.sliceGuess?.hints?.length > 9"
            )
            path(
              class="stroke-1 stroke-base-content/20"
              :d="m.decoder.sliceGuess.hints.map(h => `M${h[3]},0 V20 M${h[4]},0 V20`).join('')")
            //- text.fill-accent(:x="m.scaledMinX*ZT.k" y="20"
              :transform="`scale(${1/ZT.k},1)`"
              dominant-baseline="hanging" text-anchor="middle") {{ m.decoder.sliceGuess?.hints[m.decoder.sliceGuess?.hints.length - 1] }}
            text(
              class="fill-base-content/60 text-xs"
              dy="5"
              :transform="`scale(${1/ZT.k},1)`"
              text-anchor="middle"
              dominant-baseline="hanging"
              )
              //- :x="m.scaledMinX*ZT.k"
              tspan(
                v-for="(h,i) in m.decoder.sliceGuess.hints"
                :key="i"
                :x="`${(h[3] + (h[4] - h[3])/2)*ZT.k}`"
                ) {{ h[2]}}
                //- :dx="`${100 / m.decoder.sliceGuess?.hints.length}%`"
                //- :x="viewStore.xScale(m.pulsesInRange[0].time + h[0] + ((h[1] || h[0]) - h[0])/2)*ZT.k"

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

      
      .top-0.absolute(
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
              :open="m.tooltipIsOpened"
              @update:open="(v) => m.tooltipIsOpened"
              )
              //- :open="m.tooltipIsOpened"
              PopoverTrigger(
                @click="m.tooltipIsOpened = !m.tooltipIsOpened"
                :style="`left: ${m.scaledMaxX*ZT.k}px`"
                class="relative btn btn-sm btn-ghost btn-square")
                //- i-mdi:more-circle
                //- i-tabler:wave-sine
                //- i-fa6-solid:wave-square
                i-material-symbols:more-vert
                //- button. ASDAS
              PopoverPortal
                PopoverContent(
                  class="text-xs z-20 bg-base-300 rounded p-2 shadow-lg overflow-y-auto max-h-[250px]"
                  align="center"
                  :side-offset="0"
                  :modal="false"
                  side="top"
                  :avoidCollisions="true"
                  :collisionBoundary="'app'"
                  sticky="partial"
                  :prioritizePosition="false"
                  updatePositionStrategy="always"
                  :collision-boundary="viewStore.wrapper"
                  @interactOutside="m.tooltipIsOpened = false"
                  @mouseleave="m.tooltipIsOpened = false"
                  )
                  div.flex.-mx-2.-mt-2.join.sticky.-top-2
                    //- pre {{m.rawPulsesClipboard}}
                    button.join-item.btn.btn-sm(@click="m.rawPulsesClipboard.copy()")
                      i-heroicons-solid:clipboard-copy(v-if="!m.rawPulsesClipboard.copied")
                      i-heroicons-solid:clipboard-check(v-else)
                    button.join-item.btn.btn-sm(@click="console.log(m)") m
                    button.join-item.btn.btn-sm(@click="console.log(m.decoder)") m.decoder
                    button.join-item.btn.btn-sm(@click="m.showBitsToggle") show bits {{ m.showBits }}
                    
                    //- input.toggle(type="checkbox" v-model="m.showBits")
                    //- .flex-1
                    //- button.btn(@click="m.copyToClipboard") copyToClipboard
                  div(class="mt-2 max-w-lg")
                    div.text-nowrap(v-for="h in histogramTimings" :key="h.key")
                      p.inline {{ h.name }}: 
                      p.inline-block.mr-3(v-for="b,i in m.decoder.analyzer[h.key].bins" :key="i") {{ b.count }} × {{b.mean.toFixed(1)}} #[small ±{{b.devi.toFixed(1)}}] µs 
                    //- .divider.my-0
                    //- div(v-if="m.decoder")
                      pre.text-error(v-if="m.showBits && m.decoder.sliceGuess.hints.length > 500") More than 500 bits
                      button.btn.btn-xs(
                        v-for="s in m.decoder.slicers"
                        :key="s"
                        @click="() => m.decoder.guess.modulation = s") {{ s }}
                      p.font-mono
                        | #[b Modulation]:
                        | [ {{ m.decoder.analyzer.guessed.modulation }} ]
                        | {{ m.decoder.analyzer.guessed.short && 'short: ' + m.decoder.analyzer.guessed.short.toFixed(1) }}
                        | {{ m.decoder.analyzer.guessed.long && 'long: ' + m.decoder.analyzer.guessed.long.toFixed(1) }}
                        | {{ m.decoder.analyzer.guessed.sync && 'sync: ' + m.decoder.analyzer.guessed.sync.toFixed(1) }}
                        | {{ m.decoder.analyzer.guessed.gap && 'gap: ' + m.decoder.analyzer.guessed.gap.toFixed(1) }}
                        | {{ m.decoder.analyzer.guessed.reset && 'reset: ' + m.decoder.analyzer.guessed.reset.toFixed(1) }}
                      pre #[b Guessing modulation]: {{ m.decoder.guess.name }}
                      pre #[b DC bias (Pulse/Gap skew)]: {{ (m.decoder.analyzer?.pulse_gap_skew * 100 || 0).toFixed(1) }}%
                      pre #[b RfRaw (rx)]: {{ m.decoder.analyzer.rfrawB1 }}
                      pre #[b RfRaw (tx)]: {{ m.decoder.analyzer.rfrawB0 }}
                      pre.text-balances #[b Bits]: {{ m.decoder.sliceGuess.bits?.toHexString() }}
                      //- .overflow-x-scroll(class="max-h-[300px] max-w-[300px]")
                      //- p.break-wordss #[b RfRaw (tx)]: {{ m.decoder.analyzer.rfrawB0 }}
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

const componentId = "chart_" + props.pulses.iid
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
    onMove: (s) => {
      if (s.dragging || tmpMeasurement) return
      let x = s.event.clientX - wrapperBounds.left - ZT.x
      props.pulses.cursorX = props.viewStore.xScale.invert(x / ZT.k) - props.pulses.xOffset
      // props.pulses.dataIDUnderCursor = bisectorRef.left(props.pulses, props.pulses.cursorX) - 1
    },
    onDrag: (s) => {
      // if (s.tap) {
      //   // s.event.stopImmediatePropagation()
      //   // console.log(props.pulsesStore.pulses)
      //   props.pulsesStore.pulses.forEach((p) => (p.isSelected = false))
      //   props.pulses.isSelected = true
      //   // isHovered.value = !isHovered.value
      //   // console.log(props.viewStore.state.gestures)
      //   props.viewStore.state.gestures.state.drag.cancel()
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
    drag: {
      // preventWindowScrollY: true,
      // useTouch: true,
      // filterTaps: true,
    },
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

const histogramTimings = [
  { name: "Pulses", key: "hist_pulses" },
  { name: "Gaps", key: "hist_gaps" },
  { name: "Periods", key: "hist_periods" },
  { name: "Timings", key: "hist_timings" },
]

// const measurementsWithHints = computed(() => {
//   return props.pulses.measurements.filter((m) => m.decoder.sliceGuess?.hints?.length)
// })
</script>
