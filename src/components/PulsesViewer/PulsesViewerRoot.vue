<template lang="pug">
//- div.text-xs(ref="wrapper")
  pre PV 

  pre sessionID: {{ session.id }}
  pre pulses: {{ pulsesStore }}
//- pre viewStore: {{ viewStore.state.ZT.k }}
//- pre {{ viewStore.wrapperBounds.height }}
//- pre {{pulsesStore.pulses}}


//- button.btn(@click="console.log(pulsesStore.$dispose)") log
//- button.btn(@click="() => pulsesStore.$dispose()") reset
//- ScrollAreaRoot(class="overflow-hidden")
  ScrollAreaViewport(class="w-full h-full rounded border")
    pre asdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdj
.sticky.top-2.z-20
  .overflow-x-auto
    .bg-base-300.min-h-0.p-0.flex(class="backdrop-blur-sm bg-base-300/70 rounded-full dark:rounded-lg")
      .join.bg-base-300
        Modal
          template(#trigger)
            DialogTrigger(class="join-item btn btn-square")
              //- i-ph:file-plus-fill
              //- i-pajamas:doc-new
              i-mingcute:file-new-line(class="text-lg")
          template(#content)
            DialogTitle(class="mb-4 text-lg font-bolds")
              | Add new pulses
            DialogDescription(class="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal")
              pre.text-xs(class="text-base-content/50") Example: 434,394,380,422,379,422,377,421,378,420,377,421
            textarea.textarea.textarea-bordered.my-4.flex-1.w-full(
              v-model="tmpPulsesString" placeholder="434,394,380,422,379,422,377,421,378,420,377,421")
            div(class="mt-3 flex justify-end")
              DialogClose(as-child)
                button(class="btn" @click="pulsesStore.addPulses(tmpPulsesString.split(',').map(Number))")
                  | Add
            DialogClose(class="btn btn-square btn-sm text-xs top-0 right-0 absolute m-2" aria-label="Close")
              i-fa:close

        button.btn.join-item
          i-fluent:phone-span-out-28-filled
        button.btn.join-item(@click="zoomIn" title="Zoom in" :disabled="ZT.k >= 1000")
          i-bi:zoom-in
        button.btn.join-item(@click="zoomOut" title="Zoom out" :disabled="ZT.k <= 1")
          i-bi:zoom-out
        button.btn.btn-md.join-item.text-lg(
          :disabled="viewStore.state.ZT.k === 1"
          @click="viewStore.state.ZT.animateTo({x: 0, k: 1})" title="Reset zoom")
          //- i-material-symbols:reset-focus-outline-rounded.text-lg(:class="{': viewStore.state.ZT.k !== 1}")
          i-material-symbols:zoom-in-map-rounded
        button.btn.btn-md.join-item.text-lg(
          @click="pulses.forEach(p => p.xOffset = 0)" :disabled="pulses.every(p => p.xOffset === 0)" title="Reset offsets")
          i-ph:align-left-fill     
        button.btn.btn-md.join-item.text-lg(
          :class="[config.pinMeasurements && 'text-accent1 btn-active']"
          @click="config.pinMeasurements = !config.pinMeasurements")
          //- i-fluent:note-pin-20-filled
          i-clarity:pinned-solid
      .flex-1
      button.btn.btn-md.join-item.text-lg(
        class="hover:btn-error"
        title="Clear pulses"
        @click="pulses.length = 0")
        i-mdi:clear-box


div.h-fulls.flex-1.items-center.flex.justify-center(v-if="!pulses.length")
  pre Add pulses...
  button.btn.btn-md.btn-block(@click="pulsesStore.loadPulses(sampleData)") add samaple data

//- MeasurementsMeta block
.pt-2.top-12.z-20.inline-block.max-w-full(
  v-if="pulses.length"
  :class="[config.pinMeasurements && 'sticky']")
  .scroll-ml-6.snap-x.flex.w-auto.space-x-3.p-2.overflow-y-auto.-ml-2
    MeasurementMeta( 
      class="snap-start scroll-ml-2"
      v-for="m in pulsesStore.allMeasurements" :key="m.id" v-bind="{ m }")

//- div
  .size-24.bg-green-400

//- .pt-2.top-12.z-20.inline-blocks.max-w-fullx.overflow-y-auto.float-left(
  v-if="pulses.length"
  :class="[config.pinMeasurements && 'sticky']")
  .size-24.bg-green-400
  //- .scroll-ml-6.snap-x.inline-flex.w-auto.space-x-3.p-2.-ml-2
    MeasurementMeta( 
      class="snap-start scroll-ml-2"
      v-for="m in pulsesStore.allMeasurements" :key="m.id" v-bind="{ m }")


.container.fixed.bottom-0.px-2.-ml-2.z-10(
  v-if="pulses.length"
  )
  .flex.w-full.bg-base-300.my-4.ring-4.ring-base-300.rounded-box(v-if="pulses.length")
    div.h-2.text-xs.text-secondary-content.text-center.rounded-box(
      class="bg-base-content/20 hover:ring-1 ring-base-content/50 cursor-grab active:cursor-grabbing"
      v-drag="(e) => {ZT.translateBy(-e.delta[0] * ZT.k) }"
      :style="{width: `${viewStore.wrapperBounds.width/ZT.k}px`, transform: `translateX(${-ZT.x/ZT.k}px)`}"
      )

      
.relative.mt-8.mb-12
  div.w-full.relative.select-none(ref="wrapper")
    svg.w-full.absolute.inset-0.pointer-events-none.select-none.touch-none.-z-10.overflow-visible(
      v-if="pulses.length > 0"
      preserveAspectRatio="none"
      :viewBox="`${-ZT.x} -1 ${viewStore.wrapperBounds.width} ${viewStore.wrapperBounds.height || 100}`"
      :height="viewStore.wrapperBounds.height"
      )

      g.ticks( v-if="ticks" )
        g( v-for="tick in ticks" :key="tick" )
          path(
            class="stroke-base-content/20"
            stroke-dasharray="8 10"
            stroke-width="1"
            :d="`M ${viewStore.xScale(tick)*ZT.k} 20 V${viewStore.wrapperBounds.height || 0}`")
          text.fill-base-content.text-xs(
            :x="viewStore.xScale(tick)*ZT.k"
            :transform-origin="`${viewStore.xScale(tick)} 0`"
            dy="0"
            :transform="`scale(${1},1)`"
            dominant-baseline="hanging"
            text-anchor="middle"
            ) {{ tick/1000 }}
      path(
        :d="`M ${(viewStore.state.cursor.xCom)   } 0 V${viewStore.wrapperBounds.height || 0}`"
        stroke-dasharray="8 10"
        class="stroke-1 stroke-base-content/60"
        )
      foreignObject.overflow-visible(:x="viewStore.state.cursor.xCom" y="-29" width="100%" height="100%")
        div.btn.btn-xs.absolute(class="-translate-x-1/2") {{ viewStore.state.cursor.xLabel/1000 }} ms

    draggable(
        :component-data="{ tag: 'div', type: 'transition-group', name: ('flip-list' && !drag) }"
        class="list-group"
        :list="pulses"
        v-bind="dragOptions"
        handle=".drag-handle"
        :forceFallback="true"
        @start="drag = true"
        @end="drag = false; "
        item-key="iid"
      )
      //- @update="pulsesStore.throttledSaveToLocalStorage"
      template(#item="{ element }")
        //- .list-group-item(:key="element.iid")
          .drag-handle {{ element.iid }}
        PulsesViewerRow(class="my-3" :key="element.iid" v-bind="{ pulses: element, viewStore, pulsesStore }")


</template>

<script setup lang="jsx">
import draggable from "vuedraggable"

import { useElementBounding } from "@vueuse/core"
import { useViewStore, usePulsesStore } from "@/models"
import sampleData from "@/stores/sample_data.json"
import useConfigStore from "@/stores/config"

const props = defineProps({
  session: {
    type: Object,
    default: () => {},
  },
  sessionsStore: {
    type: Object,
    default: () => {},
  },
})

const { config } = useConfigStore()

const tmpPulsesString = ref(Array.from({ length: 120 }, () => Math.floor(Math.random() * 950) + 50).join(","))

const viewStore = useViewStore(props.session.id)
const pulsesStore = usePulsesStore(props.session.id)
const { ZT } = viewStore.state
const { pulses } = pulsesStore

const wrapper = ref(null)
const wrapperBounds = useElementBounding(wrapper)

onMounted(() => {
  viewStore.$patch({
    wrapper: wrapper.value,
    wrapperBounds,
  })
})

function zoomIn() {
  let x = ((viewStore.state.viewportRight - viewStore.state.viewportLeft) / 2) * ZT.k
  let newZT = ZT.getScaleToPointX(1.2, x)
  viewStore.state.ZT.animateTo(newZT)
}
function zoomOut() {
  let x = ((viewStore.state.viewportRight - viewStore.state.viewportLeft) / 2) * ZT.k
  let newZT = ZT.getScaleToPointX(0.8, x)
  viewStore.state.ZT.animateTo(newZT)
}

const ticks = computed(() => {
  return ZT.rescaleX(viewStore.xScale).ticks(6)
})

const dragOptions = {
  animation: 250,
  // group: "description",
  disabled: false,
  ghostClass: "ghost",
}

const drag = ref(false)

// console.log(pulsesStore)
// pulsesStore.loadPulses(sampleData)
</script>

<style>
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.1;
}

.list-group {
  min-height: 20px;
}

.list-group-item {
  cursor: move;
}

.list-group-item i {
  cursor: pointer;
}
</style>
