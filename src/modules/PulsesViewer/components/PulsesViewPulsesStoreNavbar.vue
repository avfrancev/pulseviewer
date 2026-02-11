<script lang="ts" setup>
import type { IParsedPulses } from "../parserHelpers"
import { useToast } from "~/composables/useToast"

const pulsesStore = usePulsesStore()
const config = useConfig()
const toast = useToast()

const fullscreen = useFullscreen()
const loading = ref(false)
const removeModal = ref<HTMLDialogElement | null>(null)
const _newPulsesDialog = ref<{ openDialog: () => void } | null>(null)

function openNewPulsesDialog() {
  _newPulsesDialog.value?.openDialog()
}

function onRemoveAllPulses() {
  loading.value = true
  pulsesStore.removeAll()
  loading.value = false
  toast.success("All pulses removed")
  removeModal.value?.close()
}

function onPulsesSave(val: IParsedPulses) {
  if (val.data && typeof val.data === "object") {
    if (val.type === FormatType[FormatType.Array] || val.type === FormatType[FormatType.RfRaw])
      pulsesStore.add({ raw_data: val.data as number[] })
    else if (val.type === FormatType[FormatType.Json] && "raw_data" in val.data)
      pulsesStore.add(val.data)

    toast.success("Pulses added successfully")
  }
}

function onRemoveAllMeasurements() {
  pulsesStore.removeAllMeasurements()
  toast.success("All measurements removed")
}

function onResetOffsets() {
  for (const p of pulsesStore.data) p.setXOffset(0)
  toast.info("Offsets reset to zero")
}

const pulsesStoreDataString = computed(() => {
  return JSON.stringify([...pulsesStore.data])
})
const pulsesStoreDataClipboard = useClipboard({ source: pulsesStoreDataString })

async function copyPulses() {
  await pulsesStoreDataClipboard.copy()
  toast.success("Pulses copied to clipboard")
}

function togglePinMeasurements() {
  config.pinMeasurements = !config.pinMeasurements
}
</script>

<template>
  <div class="mb-4 join join-horizontal flex-wrap sticky z-20 top-2 bg-base-300/80 backdrop-blur rounded">
    <!-- New Pulses -->
    <PulsesViewEditPulsesDialog
      ref="_newPulsesDialog"
      value=""
      title="Create new pulses"
      :clear-on-save="true"
      @save="onPulsesSave"
    >
      <button class="join-item btn btn-ghost btn-sm hover:btn-info" title="Add new pulses" @click="openNewPulsesDialog">
        <i-ph:file-plus-bold class="size-4" />
        <span class="hidden sm:inline">New</span>
      </button>
    </PulsesViewEditPulsesDialog>

    <!-- Remove All Modal (portaled to body) -->
    <Teleport to="body">
      <dialog ref="removeModal" class="modal modal-bottom sm:modal-middle">
        <div class="modal-box bg-base-200/95 backdrop-blur-sm shadow-2xl border border-base-300/50">
          <h3 class="font-bold text-lg">Remove all pulses?</h3>
          <p class="py-4 text-base-content/70">This action cannot be undone. All pulses and measurements will be deleted.</p>
          <div class="modal-action">
            <form method="dialog">
              <button class="btn btn-ghost">Cancel</button>
            </form>
            <button
              class="btn  btn-error"
              :disabled="loading"
              @click="onRemoveAllPulses"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              Remove all
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </Teleport>

    <button
      class="join-item btn btn-ghost btn-sm hover:btn-error tooltip"
      data-tip="Clear all"
      @click="removeModal?.showModal()"
    >
      <i-carbon:row-delete class="size-4" />
    </button>

    <!-- Remove Measurements -->
    <button
      class="join-item btn btn-ghost btn-sm hover:btn-warning tooltip"
      data-tip="Remove all measurements"
      :disabled="pulsesStore.allMeasurements.value.size === 0"
      @click="onRemoveAllMeasurements"
    >
      <i-mdi:selection-remove class="size-4" />
    </button>

    <!-- Reset Offsets -->
    <button
      class="join-item btn btn-sm btn-ghost tooltip"
      data-tip="Reset all offsets"
      :disabled="[...pulsesStore.data].filter(p => p.xOffset.value !== 0).length === 0"
      @click="onResetOffsets"
    >
      <i-ph:align-left-fill class="size-4" />
    </button>

    <!-- Copy as JSON -->
    <button
      v-if="pulsesStoreDataClipboard.isSupported.value"
      class="join-item btn btn-sm tooltip"
      :class="[pulsesStoreDataClipboard.copied.value ? 'btn-success' : 'btn-ghost']"
      :data-tip="pulsesStoreDataClipboard.copied.value ? 'Copied!' : 'Copy all as JSON'"
      @click="copyPulses"
    >
      <i-ph:check v-if="pulsesStoreDataClipboard.copied.value" class="size-4" />
      <i-ph:clipboard-text v-else class="size-4" />
      <span v-if="pulsesStoreDataClipboard.copied.value" class="hidden sm:inline">Copied!</span>
    </button>

    <!-- Actions Group -->
    <div class="flex gap-1 ml-auto">
      <!-- Pin Measurements -->
      <button
        class="btn btn-sm tooltip"
        :class="[config.pinMeasurements ? ' btn-soft' : 'btn-ghost']"
        data-tip="Pin measurements"
        @click="togglePinMeasurements"
      >
        <i-clarity:pinned-solid class="size-4" />
      </button>

      <!-- Fullscreen -->
      <button
        class="btn btn-sm btn-ghost tooltip"
        data-tip="Toggle fullscreen"
        @click="fullscreen.toggle()"
      >
        <i-mingcute:fullscreen-fill v-if="!fullscreen.isFullscreen.value" class="size-4" />
        <i-mingcute:fullscreen-exit-fill v-else class="size-4" />
      </button>
    </div>
  </div>
</template>
