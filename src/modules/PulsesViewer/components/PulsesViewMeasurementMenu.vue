<script setup lang="ts">
import type { Measurement } from "../models/Measurements"
import type { Pulses, PulsesItem } from "../models/Pulses"

const { measurements } = defineProps<{ measurements: Measurement[] }>()

// const pulsesStore = usePulsesStore()
const { view } = useViewStore()
const ZT = view.ZT
</script>

<template lang="pug">
div(class="absolute inset-0 overflow-hidden")
  div(
    v-for="m in measurements"
    :key="m.id"
    class="overflow-hidden absolute text-right"
    :style="{ width: `${m.scaledWidth.value * ZT.k}px`, transform: `translate3d(${(m.scaledMinX.value * ZT.k + ZT.x)}px, 0, 0)` }"
    )
    div(
      :style="{ transform: `translate3d(${Math.min(0, view.viewportRight.value - m.scaledMaxX.value) * ZT.k}px, 0, 0)` }"
      )
      DropdownMenuRoot
        DropdownMenuTrigger(:as-child="true")
          button(
            v-hover="(s: any) => m.isHovered.value = s.hovering"
            class="btn btn-xs btn-ghost btn-square mt-1 mx-1 pointer-events-auto -left-full1 relative"
            )
            i-ph:dots-three-outline-fill
        DropdownMenuPortal
          DropdownMenuContent.DropdownMenuContent(v-hover="(s: any) => m.isHovered.value = s.hovering")
            DropdownMenuArrow(class="fill-base-300")
            DropdownMenuItem.DropdownMenuItem
              i-ph:align-left-simple-fill.mr-2
              | Copy pulses
            DropdownMenuItem.DropdownMenuItem
              i-ph:align-left-simple-fill.mr-2
              | Copy RfRaw
            DropdownMenuItem.DropdownMenuItem
              i-ph:align-left-simple-fill.mr-2
              | Reset offset
            DropdownMenuItem.DropdownMenuItem
              i-ph:align-left-simple-fill.mr-2
              | Reset offset
            DropdownMenuItem.DropdownMenuItem
              i-ph:align-left-simple-fill.mr-2
              | Reset offset
            DropdownMenuItem.DropdownMenuItem(class="hover:bg-error hover:text-error-content")
              i-ph:align-left-simple-fill.mr-2
              | Delete
</template>
