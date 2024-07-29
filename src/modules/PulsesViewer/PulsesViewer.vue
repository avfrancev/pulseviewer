<template lang="pug">
//- TEST
dialog.modal(id="helpDialog")
  .modal-box.p-12(class="h-full w-full max-w-5xl")
    .flex.flex-col.h-full.space-y-4.text-sm
      .flex.justify-between.items-center
        h2.text-2xl Keybinds
        form.text-right(method="dialog")
          button.btn.btn-square
            i-fa:close
      .divider
      .flex.space-x-2.items-baseline
        pre Offset pulses:
        span hold
        kbd.kbd CTRL
        span +
        kbd.kbd SHIFT
        span while dragging
      .flex.space-x-2.items-baseline
        pre Add measurement:
        span hold #[kbd.kbd SHIFT] while dragging
      .flex.space-x-2.items-baseline
        pre Remove measurement:
        span press #[kbd.kbd d] while measurement hovered
dialog.modal(id="settingsDialog")
  .modal-box.p-12(class="h-full w-full max-w-5xl")
    .flex.flex-col.h-full.space-y-4
      .flex.justify-between.items-center
        h2.text-2xl Settings
        form.text-right(method="dialog")
          button.btn.btn-square
            i-fa:close
      .divider
      div
        pre useESP32Api = {{ configStore.storage.useESP32Api }}
        input.toggle(type="checkbox" v-model="configStore.storage.useESP32Api")
        input.input(type="text" v-model="configStore.storage.esp32ApiEndpint")
      //- textarea.flex-1.input.input-bordered.w-full( v-model="addingPulses")
      //- form.text-center.space-x-6(method="dialog")
      //-   button.btn Cencel
      //-   button.btn.btn-primary(@click="pulsesStore.addPulses(addingPulses.split(',').map(Number))") ADD  
.navbar.bg-base-300.rounded-box.mb-4
  .flex.items-center.mr-4
    i-twemoji:raccoon.hue-rotate-180.drop-shadow-lg.mx-4.text-3xl(class="transition duration-600 hover:scale-110 hover:hue-rotate-0")
    pre: b.text-xl RF Pulse Viewer
  .flex.join
    button.btn.btn-md.join-item.text-secondary.text-lg(onclick="addPulsesModal.showModal()")
      i-ci:add-row
    button.btn.btn-md.join-item.text-error.text-lg(
      :disabled="pulsesStore.pulses.length === 0"
      @click="pulsesStore.pulses.length = 0" title="Remove all pulses")
      i-tabler:trash
    button.btn.btn-md.join-item.text-secondary.text-lg(
      :disabled="viewStore.state.ZT.k === 1"
      @click="viewStore.state.ZT.animateTo({x: 0, k: 1})" title="Reset zoom")
      //- i-material-symbols:reset-focus-outline-rounded.text-lg(:class="{'text-secondary': viewStore.state.ZT.k !== 1}")
      i-material-symbols:zoom-in-map-rounded
    button.btn.btn-md.join-item.text-secondary.text-lg(
      @click="pulses.forEach(p => p.xOffset = 0)" :disabled="pulses.every(p => p.xOffset === 0)" title="Reset offsets")
      i-fluent:list-bar-tree-offset-16-filled
      //- | reset offsets
    //- button.btn.btn-md.join-item(@click="pulsesStore.pulsesStorage = []") Clear pulsesStorage
    button.btn.btn-md.join-item(@click="loadSampleData") Load sample data
    //- pre {{ pulses[0] }}
    //- button.btn.btn-sm.join-item(@click="[pulses[0], pulses[1]] = [pulses[1], pulses[0]];") SWAP
  .flex-1
  .flex
    label.btn.btn-square.swap.swap-rotate()
      input(type="checkbox" :checked="mode !== 'dark' ? true : false" @input="mode = mode === 'dark' ? 'light' : 'dark'")
      .swap-off
        a ☀
      .swap-on 
        a 🌙
    button.btn.btn-square.ml-2.text-xl(onclick="helpDialog.showModal()")
      i-material-symbols:help-outline
    button.btn.btn-square.ml-2.text-xl(onclick="settingsDialog.showModal()")
      i-material-symbols:settings-outline
      //- pre.swap-off 2222
.relative

  div(v-for="p in pulses" :key="p.iid")
    pre(v-if="p.RCSwitch?.decodedData?.length") {{ p.RCSwitch }}
  MeasurementsMeta(v-bind="{measurements: pulsesStore.allMeasurements}")

  .flex.w-full.bg-base-300.mb-8.mt-2.ring-4.ring-base-300.rounded-box(v-if="pulses.length")
    div.h-2.text-xs.text-secondary-content.text-center.rounded(
      class="bg-base-content/20 hover:ring-1 ring-base-content/50"
      v-drag="(e) => {ZT.translateBy(-e.delta[0] * ZT.k) }"
      :style="{width: `${viewStore.wrapperBounds.width/ZT.k}px`, transform: `translateX(${-ZT.x/ZT.k}px)`}"
      )

  div.w-full.relative.select-none(ref="wrapper")
    svg.w-full.absolute.inset-0.pointer-events-none.select-none.touch-none.-z-10.overflow-visible(
      v-if="pulses.length > 0"
      preserveAspectRatio="none"
      :viewBox="`${-ZT.x} -1 ${viewStore.wrapperBounds.width} ${viewStore.wrapperBounds.height || 100}`"
      :height="viewStore.wrapperBounds.height"
      )
      //- :viewBox="`${-ZT.x/ZT.k} -1 ${viewStore.wrapperBounds.width/ZT.k} ${viewStore.wrapperBounds.height || 100}`"
      //- circle(:cx="viewStore.xScale(10000)*ZT.k" cy="100" r="10" fill="red" stroke="red" stroke-width="1")
      g.ticks(
          v-if="ticks"
        )
        g(
          v-for="tick in ticks"
          :key="tick"
          )
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
        :d="`M ${(cursor.xCom)   } 0 V${viewStore.wrapperBounds.height || 0}`"
        stroke-dasharray="8 10"
        class="stroke-1 stroke-base-content/60"
        )
      foreignObject.overflow-visible(:x="cursor.xCom" y="-25" width="100%" height="100%")
        div.btn.btn-xs.absolute(class="-translate-x-1/2") {{ cursor.xLabel/1000 }} ms
          //- div(class="-translate-x-1/2") {{ cursor.xLabel }}

    //- LALA
    draggable(
        class="list-group"
        :component-data="{ tag: 'div', type: 'transition-group', name: !drag ? 'flip-list' : null }"
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
        //- .list-group-item(:key="element.iid") {{ element.iid }}
        PulsesViewerChart(class="my-3" :key="element.iid" v-bind="{ pulses: element, viewStore, pulsesStore }")



  div.flex.items-center.justify-center
    button.w-32.mt-12.btn.btn-ghost.h-32.min-h-32.border-dashed.border(
      class="border-base-content/40"
      :onclick="`addPulsesModal.showModal()`")
      i-uil:plus.text-5xl
    dialog.modal(id="addPulsesModal")
      .modal-box.p-12(class="h-full w-full max-w-5xl")
        .flex.flex-col.h-full.space-y-4
          .flex.justify-between.items-center
            h2.text-2xl Adding pulses
            form.text-right(method="dialog")
              button.btn.btn-square
                i-fa:close
          pre.text-xs(class="text-base-content/50") Example: 434,394,380,422,379,422,377,421,378,420,377,421
          //- .divider
          //- form.text-right(method="dialog")
            button.btn.btn-square
              i-fa:close
          textarea.flex-1.input.input-bordered.w-full( v-model="addingPulses")
          .modal-action
            form.text-center.join.justify-center(method="dialog")
              button.btn.join-item Cancel
              button.btn.join-item.btn-primary(
                :disabled="!addingPulsesAreValid"
                @click="addPulses") ADD
                //- :disabled="addingPulses.trim().split(',').map(Number).length < 2"
  </template>

<script setup lang="jsx">
// import PulsesViewerChart from "./PulsesViewerChart.vue"
import draggable from "vuedraggable"

import { useConfigStore, useESP32RMTStore } from "./stores"
// import sampleData from '/src/stores/sample_data.json'
async function loadSampleData() {
  const module = await import(`./stores/sample_data.json`)
  pulsesStore.loadPulses(module.default)
  // pulsesStore.pulsesStorage = module.default
  return module
}

const dragOptions = {
  animation: 250,
  // group: "description",
  disabled: false,
  ghostClass: "ghost",
}

const drag = ref(false)

const configStore = useConfigStore()

import usePulsesStore from "./stores/pulses"
import { mode } from "/src/stores/colors.js"

import { useViewStore } from "./stores/index.js"
const viewStore = useViewStore()
const cursor = viewStore.state.cursor

onMounted(() => {
  viewStore.$patch({
    wrapper: wrapper.value,
    wrapperBounds,
  })
})

const pulsesStore = usePulsesStore()
const { pulses } = pulsesStore

const wrapper = ref()
const wrapperBounds = useElementBounding(wrapper)

const { ZT } = viewStore.state

const ticks = computed(() => {
  return ZT.rescaleX(viewStore.xScale).ticks(6)
})

const addingPulses = ref("")
const addingPulsesRegex = new RegExp(/^[0-9,\s]+$/)
const addingPulsesAreValid = computed(() => {
  return (
    addingPulsesRegex.test(addingPulses.value) === true &&
    addingPulses.value.trim().split(",").map(Number).length >= 2
  )
})
const addPulses = () => {
  if (addingPulsesAreValid.value) {
    pulsesStore.addPulses(addingPulses.value.trim().split(",").map(Number))
    // Bugfix: dialog is not closed if addingPulses cleared immediately
    setTimeout(() => {
      addingPulses.value = ""
    }, 500)
  }
}

const ESP32RMTStore = useESP32RMTStore()
// console.log(ESP32RMTStore);

ESP32RMTStore.$onAction(({name, args}) => {
  let data = args[0]
  console.log(name, data);
  if (name !== "addWSData") return
  let p = pulsesStore.pulses[pulsesStore.pulses.length - 1]
  if (data.delta > 200_000) {
    p = pulsesStore.addPulses(data.parsed_buf)
    p.rssi = data.rssi
    return
  }
  if (p.raw_data[p.raw_data.length - 1] === 0) {
    p.raw_data[p.raw_data.length - 1] = data.delta
  }
  p.raw_data = [...p.raw_data, ...data.parsed_buf]
})

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
