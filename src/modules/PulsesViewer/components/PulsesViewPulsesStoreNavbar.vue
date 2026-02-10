<script lang="ts" setup>
import type { IParsedPulses } from "../parserHelpers"

const pulsesStore = usePulsesStore()
const config = useConfig()

const fullscreen = useFullscreen()

function onPulsesSave(val: IParsedPulses) {
  if (val.data && typeof val.data === "object") {
    if (val.type === FormatType[FormatType.Array] || val.type === FormatType[FormatType.RfRaw])
      pulsesStore.add({ raw_data: val.data as number[] })
    else if (val.type === FormatType[FormatType.Json] && "raw_data" in val.data)
      pulsesStore.add(val.data)
  }
}

const pulsesStoreDataString = computed(() => {
  return JSON.stringify([...pulsesStore.data])
})
const pulsesStoreDataClipboard = useClipboard({ source: pulsesStoreDataString })
</script>

<template>
  <div class="mb-4 join">
    <PulsesViewEditPulsesDialog
      value=""
      title="Create new pulses"
      :clear-on-save="true"
      @save="onPulsesSave"
    >
      <button class="join-item btn btn-sm hover:btn-info" title="Add new pulses">
        <i-ph:file-plus-bold />
      </button>
    </PulsesViewEditPulsesDialog>
    <AlertDialogRoot>
      <AlertDialogTrigger class="join-item btn btn-sm hover:btn-error" title="Remove all pulses">
        <i-carbon:row-delete />
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay class="DialogOverlay" />
        <AlertDialogContent class="flex flex-col DialogContent">
          <AlertDialogTitle class="mb-2"><b>Remove all pulses</b></AlertDialogTitle>
          <AlertDialogDescription class="text-sm text-muted">Do you really want to remove all pulses?</AlertDialogDescription>
          <!-- p(v-if="RfRaw.isRfRaw(tmp)") {{ RfRaw.getPulses(tmp) }} -->
          <div class="flex items-center justify-end gap-6">
            <AlertDialogCancel class="btn btn-xs btn-ghost">Cancel</AlertDialogCancel>
            <AlertDialogAction
              class="font-bold btn btn-sm btn-error"
              @click="pulsesStore.removeAll()"
            >Remove all</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
    <button
      class="join-item btn btn-sm hover:btn-error"
      title="Remove all measurements"
      :disabled="pulsesStore.allMeasurements.value.size === 0"
      @click="pulsesStore.removeAllMeasurements()"
    >
      <i-mdi:selection-remove />
    </button>
    <button
      class="join-item btn btn-sm"
      title="Reset all offsets"
      :disabled="[...pulsesStore.data].filter(p => p.xOffset.value !== 0).length === 0"
      @click="pulsesStore.data.forEach(p => p.setXOffset(0))"
    >
      <i-ph:align-left-fill />
    </button>
    <button
      v-if="pulsesStoreDataClipboard.isSupported.value"
      class="join-item btn btn-sm"
      title="Copy all pulses as json"
      :class="[pulsesStoreDataClipboard.copied.value && 'btn-active btn-success']"
      @click="pulsesStoreDataClipboard.copy()"
    >
      <i-ph:check v-if="pulsesStoreDataClipboard.copied.value" />
      <i-ph:clipboard-text v-else />
      <!-- | {{ pulsesStoreDataClipboard.copied.value ? "Copied!" : "copy as json" }} -->
    </button>
    <div class="flex w-full">
      <button
        class="ml-auto join-item btn btn-sm"
        :class="[config.pinMeasurements && 'btn-active bg-opacity-100']"
        title="Pin measurements"
        @click="config.pinMeasurements = !config.pinMeasurements"
      >
        <i-clarity:pinned-solid />
      </button>
      <button class="btn btn-sm" @click="fullscreen.toggle()">
        <i-mingcute:fullscreen-fill v-if="!fullscreen.isFullscreen.value" />
        <i-mingcute:fullscreen-exit-fill v-else />
      </button>
    </div>
  </div>
</template>
