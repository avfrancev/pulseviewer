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
  @keydown.delete.d="(e) => { m.remove() }"
  @keydown.space.prevent="(e) => { m.locate() }"
  :transform="`matrix(${Math.max(1/ZT.k,m.scaledMaxX - m.scaledMinX)},0,0,1,${m.scaledMinX},0)`"
  )
  path(
    stroke-width="1"
    :stroke="m.isSelected ? m.color + 'ff' : 'transparent'"
    :fill="m.isHovered ? m.color + '20' : m.color + '10'"
    :d="`M${0},0 L${1},0 L${1},118 L${0},118 z`")
  path(
    stroke-width="1"
    :stroke="m.color"
    :d="`M${0},0 V${120}`")
  path(
    stroke-width="1"
    :stroke="m.color"
    :d="`M${1},0 V${120}`")
  path(
    class="stroke-transparent cursor-ew-resize"
    stroke-width="10"
    :d="`M${m.x1 >= m.x2 ? 1 : 0},0 V${120}`"
    v-drag="resizeHandleHandler.bind(null,m,'x1')")
  path(
    class="stroke-transparent cursor-ew-resize"
    stroke-width="10"
    :d="`M${m.x1 < m.x2 ? 1 : 0},0 V${120}`"
    v-drag="resizeHandleHandler.bind(null,m,'x2')")
</template>

<script setup>
  import { bisector } from 'd3-array';
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

  const { pulses, viewStore } = props
  const { ZT } = props.viewStore.state

  const resizeHandleHandler = (m, key, s) => {
    s.event.stopImmediatePropagation()
    const b = bisector((d) => d.time).center
    let x = (viewStore.pixelRatio * s.delta[0]) / ZT.k + m[key]
    let _x = s.event.clientX - viewStore.wrapperBounds.left - pulses.scaledXOffset
    let x2 = viewStore.xScale.invert((_x - ZT.x) / ZT.k) 
    let id = b(pulses, x2)
    let t = pulses[id].time
    let cond = Math.abs(t-x2)/viewStore.pixelRatio*ZT.k < 7
    m[key] = cond ? t : x2
  }
  
</script>
