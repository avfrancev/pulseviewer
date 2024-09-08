<template lang="pug">
g(
  class="focus:outline-none"
  v-for="m in pulses.measurements"
  v-hover="(s) => { m.isHovered = s.hovering }"
  @focus="() => (m.isSelected = true)"
  @blur="() => (m.isSelected = false)"
  @click="(e) => { e.preventDefault(); viewStore.state.gestures.state.drag.distance == 0 && e.currentTarget.focus() }"
  @mousedown="(e) => { e.preventDefault() }"
  v-drag="(s) => { if (m.isSelected) { s.event.stopImmediatePropagation(); let d = (viewStore.pixelRatio * s.delta[0]) / ZT.k; m.x1 += d; m.x2 += d } }"
  tabindex="0"
  @keydown.esc="(e) => { e.currentTarget.blur() }"
  @keydown.left="(e) => { let d = (viewStore.pixelRatio * 10) / ZT.k; m.x1 -= d; m.x2 -= d }"
  @keydown.right="(e) => { let d = (viewStore.pixelRatio * 10) / ZT.k; m.x1 += d; m.x2 += d }"
  @keydown.delete="(e) => { m.remove() }"
  @keydown.space.prevent="(e) => { m.locate() }"
  )
  path(
    stroke-width="1"
    :stroke="m.isSelected ? m.color + 'ff' : 'transparent'"
    :fill="m.isHovered ? m.color + '20' : 'transparent'"
    :d="`M${m.scaledX1},0 L${m.scaledX2},0 L${m.scaledX2},118 L${m.scaledX1},118 z`")
  path(
    stroke-width="1"
    :stroke="m.color"
    :d="`M${m.scaledX1},0 V${120}`")
  path(
    stroke-width="1"
    :stroke="m.color"
    :d="`M${m.scaledX2},0 V${120}`")
  path(
    class="stroke-transparent cursor-ew-resize"
    stroke-width="10"
    :d="`M${m.scaledX1},0 V${120}`"
    v-drag="(s) => { s.event.stopImmediatePropagation(); m['x1'] += (viewStore.pixelRatio * s.delta[0]) / ZT.k }")
  path(
    class="stroke-transparent cursor-ew-resize"
    stroke-width="10"
    :d="`M${m.scaledX2},0 V${120}`"
    v-drag="(s) => { s.event.stopImmediatePropagation(); m['x2'] += (viewStore.pixelRatio * s.delta[0]) / ZT.k }")
</template>

<script setup>
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

  const { ZT } = props.viewStore.state
  
</script>
