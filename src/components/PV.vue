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
.relative
  .container.fixed.bottom-0.px-2.-ml-2.z-10
    .flex.w-full.bg-base-300.my-4.ring-4.ring-base-300.rounded-box(v-if="pulses.length")
      div.h-2.text-xs.text-secondary-content.text-center.rounded-box(
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
import { useViewStore, usePulsesStore } from "@/models";

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
