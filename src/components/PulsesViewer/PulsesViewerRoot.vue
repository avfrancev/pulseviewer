<template lang="pug">
div(class="sticky top-2 z-30")
  div(class="overflow-x-auto")
    div(class="bg-base-300 min-h-0 p-0 flex backdrop-blur-sm bg-base-300/90 rounded-full dark:rounded-lg")
      div(class="join")
        AddPulsesModal(v-bind="{pulsesStore}")
        button(
          class="btn btn-square join-item bg-opacity-0 border-none"
          @click="zoomIn"
          title="Zoom in"
          :disabled="ZT.k >= 1000")
          i-bi:zoom-in
        button(
          class="btn btn-square join-item bg-opacity-0 border-none"
          @click="zoomOut"
          title="Zoom out"
          :disabled="ZT.k <= 1")
          i-bi:zoom-out
        button(
          class="btn btn-square btn-md join-item text-lg bg-opacity-0 border-none"
          :disabled="viewStore.state.ZT.k === 1"
          @click="viewStore.state.ZT.animateTo({x: 0, k: 1})"
          title="Reset zoom")
          //- i-material-symbols:reset-focus-outline-rounded.text-lg(:class="{': viewStore.state.ZT.k !== 1}")
          i-material-symbols:zoom-in-map-rounded
        button(
          class="btn btn-square btn-md join-item text-lg bg-opacity-0 border-none"
          @click="pulses.forEach((p) => (p.xOffset = 0))"
          :disabled="pulses.every((p) => p.xOffset === 0)"
          title="Reset offsets")
          i-ph:align-left-fill 
        button(
          class="btn btn-square btn-md join-item text-lg bg-opacity-0 border-none"
          :class="[config.pinMeasurements && 'btn-active bg-opacity-100']"
          @click="config.pinMeasurements = !config.pinMeasurements"
          title="Pin measurements")
          i-clarity:pinned-solid
      div(class="flex-1")
      button(
        class="btn btn-square btn-md join-item text-lg bg-opacity-0 border-none hover:btn-error"
        title="Clear pulses"
        @click="pulses.length = 0")
        i-mdi:clear-box

div(class="h-fulls flex-1 items-center flex justify-center space-x-12" v-if="!pulses.length")
  AddPulsesModal(v-bind="{pulsesStore}")
  div(class="h-24")
    div(class="divider divider-horizontal h-24") OR
  button(class="btn btn-md" @click="pulsesStore.loadPulses(sampleData)") add samaple data

//- MeasurementsMeta block
div(
  class="pt-2 top-12 z-20 inline-flex self-start max-w-full"
  :class="[config.pinMeasurements && 'sticky']"
  v-if="pulses.length")
  div(class="scroll-ml-6 flex w-auto space-x-3 p-2 overflow-y-auto -ml-2")
    MeasurementMeta(
      v-for="m in pulsesStore.allMeasurements"
      :key="m.id"
      v-bind="{m}")

div(class="container fixed bottom-0 px-2 -ml-2 z-10" v-if="pulses.length")
  div(class="flex w-full bg-base-300 my-4 ring-4 ring-base-300 rounded-box" v-if="pulses.length")
    div(
      class="h-2 text-xs text-secondary-content text-center rounded-box bg-base-content/20 hover:ring-1 ring-base-content/50 cursor-grab active:cursor-grabbing"
      v-drag="(e) => { ZT.translateBy(-e.delta[0] * ZT.k) }"
      :style="{width: `${viewStore.wrapperBounds.width / ZT.k}px`, transform: `translateX(${-ZT.x / ZT.k}px)`}")

div(class="relative mt-8 mb-12")
  div(class="w-full relative select-none" ref="wrapper")
    svg(
      class="w-full absolute inset-0 pointer-events-none select-none touch-none -z-10 overflow-visible"
      v-if="pulses.length > 0"
      preserveAspectRatio="none"
      :viewBox="`${-ZT.x} -1 ${viewStore.wrapperBounds.width} ${viewStore.wrapperBounds.height || 100}`"
      :height="viewStore.wrapperBounds.height")
      g(class="ticks" v-if="ticks")
        g(
          v-for="tick in ticks"
          :key="tick")
          path(
            class="stroke-base-content/20"
            stroke-dasharray="8 10"
            stroke-width="1"
            :d="`M ${viewStore.xScale(tick) * ZT.k} 20 V${viewStore.wrapperBounds.height || 0}`")
          text(
            class="fill-base-content text-xs"
            :x="viewStore.xScale(tick) * ZT.k"
            :transform-origin="`${viewStore.xScale(tick)} 0`"
            dy="0"
            :transform="`scale(${1},1)`"
            dominant-baseline="hanging"
            text-anchor="middle") {{tick / 1000}}
      path(
        class="stroke-1 stroke-base-content/60"
        :d="`M ${viewStore.state.cursor.xCom} 0 V${viewStore.wrapperBounds.height || 0}`"
        stroke-dasharray="8 10")
      foreignObject(
        class="overflow-visible"
        :x="viewStore.state.cursor.xCom"
        y="-29"
        width="100%"
        height="100%")
        div(class="btn btn-xs absolute -translate-x-1/2") {{viewStore.state.cursor.xLabel / 1000}} ms

    //- pre(@click="console.log(pulses)") {{viewStore.state.viewportLeft}} : {{viewStore.state.viewportRight}} {{ viewStore.xScale.invert(viewStore.state.viewportLeft) }}

    draggable(
      class="list-group pt-2"
      :component-data="{tag: 'div', type: 'transition-group', name: 'flip-list' && !drag}"
      :list="pulses"
      v-bind="dragOptions"
      handle=".drag-handle"
      :forceFallback="true"
      @start="drag = true"
      @end="drag = false"
      item-key="iid")
      template(#item="{element}")
        PulsesViewerRow(
          class="my-3"
          :key="element.iid"
          v-bind="{pulses: element, viewStore, pulsesStore}")
  </template>
  
  <script setup lang="jsx">
    function size(v) {
      const kb = v / 1024 / 1024
      return `${kb.toFixed(2)} MB`
    }
    const { isSupported, memory } = useMemory()
  
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
  