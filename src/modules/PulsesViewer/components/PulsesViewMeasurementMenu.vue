<script setup lang="ts">
import type { Measurement } from "../models/Measurements"
import { useToast } from "~/composables/useToast"

const { measurements } = defineProps<{ measurements: Set<Measurement> }>()

const { view } = useViewStore()
const ZT = view.ZT

const clipboard = useClipboard()
const toast = useToast()

async function copyPulses(m: Measurement) {
  await clipboard.copy(m.pulses.raw_data.slice(...m.rangeIds.value)?.toString())
  toast.success("Pulses copied")
}

async function copyRfRawB0(m: Measurement) {
  await clipboard.copy(m.decoder.state.analyzer?.rfrawB0)
  toast.success("RfRawB0 copied")
}

async function copyRfRawB1(m: Measurement) {
  await clipboard.copy(m.decoder.state.analyzer?.rfrawB1)
  toast.success("RfRawB1 copied")
}

function cutPulses(m: Measurement) {
  m.pulses.setRawData([
    ...m.pulses.raw_data.slice(0, m.rangeIds.value[0]),
    ...m.pulses.raw_data.slice(m.rangeIds.value[1]),
  ])
  measurements.delete(m)
  toast.info("Pulses cut")
}

function deleteMeasurement(m: Measurement) {
  measurements.delete(m)
  toast.info("Measurement deleted")
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <div
      v-for="m in measurements"
      :key="m.id"
      class="absolute overflow-hidden text-right"
      :style="{ width: `${m.scaledWidth.value * ZT.k}px`, transform: `translate3d(${((m.scaledMinX.value + m.pulses.scaledXOffset.value) * ZT.k + ZT.x)}px, 0, 0)` }"
    >
      <div
        :style="{ transform: `translate3d(${Math.min(0, view.viewportRight.value - m.scaledMaxX.value - m.pulses.scaledXOffset.value) * ZT.k}px, 0, 0)` }"
      >
        <!-- DaisyUI Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="relative mx-1 mt-1 pointer-events-auto btn btn-xs btn-ghost btn-square">
            <i-ph:dots-three-outline-fill />
          </div>
          <ul tabindex="-1" class="dropdown-content menu bg-base-200 rounded-box z-50 w-48 p-2 shadow-lg border border-base-300">
            <li>
              <button class="flex items-center gap-2" @click="copyPulses(m)">
                <i-ph:copy />
                Copy pulses
              </button>
            </li>
            <li>
              <button class="flex items-center gap-2" @click="copyRfRawB0(m)">
                <i-ph:copy />
                Copy RfRawB0
              </button>
            </li>
            <li>
              <button class="flex items-center gap-2" @click="copyRfRawB1(m)">
                <i-ph:copy />
                Copy RfRawB1
              </button>
            </li>
            <li>
              <button class="flex items-center gap-2" @click="cutPulses(m)">
                <i-ph:scissors />
                Cut pulses
              </button>
            </li>
            <div class="divider my-1"></div>
            <li>
              <button class="flex items-center gap-2 text-error" @click="deleteMeasurement(m)">
                <i-ph:trash />
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
