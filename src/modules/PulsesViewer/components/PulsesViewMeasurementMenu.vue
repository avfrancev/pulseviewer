<script setup lang="ts">
import type { Measurement } from "../models/Measurements"

const { measurements } = defineProps<{ measurements: Set<Measurement> }>()

// const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const ZT = view.ZT

const clipboard = useClipboard()
</script>

<template lang="pug">
div(class="absolute inset-0 overflow-hidden")
  div(
    v-for="m in measurements"
    :key="m.id"
    class="overflow-hidden absolute text-right"
    :style="{ width: `${m.scaledWidth.value * ZT.k}px`, transform: `translate3d(${((m.scaledMinX.value + m.pulses.scaledXOffset.value) * ZT.k + ZT.x)}px, 0, 0)` }"
    )
    div(
      :style="{ transform: `translate3d(${Math.min(0, view.viewportRight.value - m.scaledMaxX.value - m.pulses.scaledXOffset.value) * ZT.k}px, 0, 0)` }"
      )
      DropdownMenuRoot
        DropdownMenuTrigger(:as-child="true")
          button(
            v-hover="(s: any) => m.isHovered.value = s.hovering"
            class="btn btn-xs btn-ghost btn-square mt-1 mx-1 pointer-events-auto relative"
            )
            i-ph:dots-three-outline-fill
        DropdownMenuPortal
          DropdownMenuContent.DropdownMenuContent(v-hover="(s: any) => m.isHovered.value = s.hovering")
            DropdownMenuArrow(class="fill-base-300")
            DropdownMenuItem.DropdownMenuItem(@click="clipboard.copy(m.pulses.raw_data.slice(...m.rangeIds.value)?.toString())")
              i-ph:align-left-simple-fill.mr-2
              | Copy pulses
            DropdownMenuItem.DropdownMenuItem(@click="clipboard.copy(m.decoder.state.analyzer?.rfrawB0)")
              i-ph:align-left-simple-fill.mr-2
              | Copy RfRawB0
            DropdownMenuItem.DropdownMenuItem(@click="clipboard.copy(m.decoder.state.analyzer?.rfrawB1)")
              i-ph:align-left-simple-fill.mr-2
              | Copy RfRawB1
            DropdownMenuItem.DropdownMenuItem(@click="m.pulses.setRawData([...m.pulses.raw_data.slice(0, m.rangeIds.value[0]), ...m.pulses.raw_data.slice(m.rangeIds.value[1])]); measurements.delete(m)")
              i-ph:align-left-simple-fill.mr-2
              | Cut pulses
            DropdownMenuItem.DropdownMenuItem(
              class="hover:bg-error hover:text-error-content"
              @click="measurements.delete(m)")
              i-ph:align-left-simple-fill.mr-2
              | Delete
</template>
