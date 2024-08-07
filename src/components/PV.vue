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

.sticky.top-2.z-10
  .overflow-x-auto
    .bg-base-300.min-h-0.p-0(class="backdrop-blur-sm bg-base-300/70 rounded-full dark:rounded-lg")
      .join
        Modal
          template(#trigger)
            DialogTrigger(class="join-item btn btn-square btn-ghost")
              i-ph:file-plus-fill
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
        button.btn.join-item(@click="zoomIn" title="Zoom in")
          i-bi:zoom-in
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item.mx-24(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.join-item(@click="zoomOut" title="Zoom out")
          i-bi:zoom-out
        button.btn.btn-md.join-item.text-lg(
          :disabled="viewStore.state.ZT.k === 1"
          @click="viewStore.state.ZT.animateTo({x: 0, k: 1})" title="Reset zoom")
          //- i-material-symbols:reset-focus-outline-rounded.text-lg(:class="{': viewStore.state.ZT.k !== 1}")
          i-material-symbols:zoom-in-map-rounded
        button.btn.btn-md.join-item.text-lg(
          @click="pulses.forEach(p => p.xOffset = 0)" :disabled="pulses.every(p => p.xOffset === 0)" title="Reset offsets")
          i-ph:align-left-fill     

  //- ScrollAreaRoot(class="overflow-hidden")
    ScrollAreaViewport(class="w-full h-full rounded border")
      pre asdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdjasdjashdkjashdkjashdj
    ScrollAreaScrollbar( orientation="horizontal")


.sticky.pt-4.top-14.z-10
  .size-24.bg-red-400

.container.fixed.bottom-0.px-2.-ml-2.z-10
  .flex.w-full.bg-base-300.my-4.ring-4.ring-base-300.rounded-box(v-if="pulses.length")
    div.h-2.text-xs.text-secondary-content.text-center.rounded-box(
      class="bg-base-content/20 hover:ring-1 ring-base-content/50 cursor-grab active:cursor-grabbing"
      v-drag="(e) => {ZT.translateBy(-e.delta[0] * ZT.k) }"
      :style="{width: `${viewStore.wrapperBounds.width/ZT.k}px`, transform: `translateX(${-ZT.x/ZT.k}px)`}"
      )

      
.relative
  div.w-full.relative.select-none(ref="wrapper")
    svg.w-full.absolute.inset-0.pointer-events-none.select-none.touch-none.-z-10.overflow-visible(
      v-if="pulses.length > 0"
      preserveAspectRatio="none"
      :viewBox="`${-ZT.x} -1 ${viewStore.wrapperBounds.width} ${viewStore.wrapperBounds.height || 100}`"
      :height="viewStore.wrapperBounds.height"
      )
    //- PulsesViewerRow(v-bind="{ pulses,  }")
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

const props = defineProps({
  session: {
    type: Object,
    default: {},
  },
  sessionsStore: {
    type: Object,
    default: {},
  },
})

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

const dragOptions = {
  animation: 250,
  // group: "description",
  disabled: false,
  ghostClass: "ghost",
}

const drag = ref(false)
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
