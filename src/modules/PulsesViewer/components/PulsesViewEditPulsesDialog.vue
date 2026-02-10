<script lang="ts" setup>
import type { PulsesStorage } from "../models/Pulses"
import { FormatType, getParsedInputString, type IParsedPulses } from "../parserHelpers"

const { value, title = "Edit pulses", clearOnSave = false } = defineProps<{ value: string, title?: string, clearOnSave?: boolean }>()

const emit = defineEmits<{
  save: [data: IParsedPulses]
}>()

const dialogEl = ref<HTMLDialogElement | null>(null)
const tmp = ref(value)

watch(() => value, () => {
  tmp.value = value
})

function cancelSave() {
  tmp.value = value
}

const textareaEl = ref<HTMLTextAreaElement | null>(null)
useFocus(textareaEl, { initialValue: true })

const parsed = ref<IParsedPulses>()

watchEffect(() => {
  const p = getParsedInputString(tmp.value)
  if (p) {
    if (p.type === FormatType[FormatType.Array] || p.type === FormatType[FormatType.RfRaw]) {
      if ((p.data as number[])?.at(-1) !== 0)
        (p?.data as number[])?.push(0)
    }
    else if (p.type === FormatType[FormatType.Json]) {
      if ((p.data as Partial<PulsesStorage>)?.raw_data?.at(-1) !== 0)
        (p?.data as Partial<PulsesStorage>)?.raw_data?.push(0)
    }
  }
  parsed.value = p as IParsedPulses
})

const totalPulses = computed(() => {
  if (parsed.value === undefined)
    return undefined
  if (parsed.value.type === FormatType[FormatType.Array] || parsed.value.type === FormatType[FormatType.RfRaw])
    return (parsed.value?.data as number[])?.length
  if (parsed.value.type === FormatType[FormatType.Json])
    return (parsed.value?.data as Partial<PulsesStorage>)?.raw_data?.length
  return undefined
})

function save() {
  if (parsed.value) {
    emit("save", parsed.value)
    dialogEl.value?.close()
    clearOnSave && (tmp.value = "")
  }
}

function openDialog() {
  dialogEl.value?.showModal()
}

defineExpose({ openDialog })
</script>

<template>
  <!-- Trigger button -->
  <slot>
    <button class="btn btn-sm btn-ghost" @click="openDialog">
      <i-ph:ambulance-light />
    </button>
  </slot>

  <!-- DaisyUI Modal using native <dialog> (portaled to body) -->
  <Teleport to="body">
    <dialog ref="dialogEl" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-3xl bg-base-200/95 backdrop-blur-sm shadow-2xl border border-base-300/50">
        <!-- Close button -->
        <form method="dialog">
          <button class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        </form>

        <!-- Title -->
        <h3 class="font-bold text-lg mb-2">{{ title }}</h3>

        <!-- Textarea -->
        <textarea
          ref="textareaEl"
          v-model="tmp"
          placeholder="AA B1 03 00C8 02DA 1D2E 28190909090908181909081818181908190909090819081818 55"
          class="textarea w-full h-[400px] my-4"
          :class="parsed ? 'textarea-success' : 'textarea-error'"
        />

        <!-- Footer with actions -->
        <div class="flex items-center justify-end gap-4">
          <div v-if="parsed" class="mr-auto text-muted text-sm">Type: {{ parsed?.type }} | Total pulses: {{ totalPulses }}</div>

          <form method="dialog">
            <button class="btn btn-ghost btn-sm" @click="cancelSave">Cancel</button>
          </form>

          <button
            class="btn btn-success btn-sm font-bold"
            :disabled="!parsed"
            @click="save"
          >
            Save
          </button>
        </div>
      </div>

      <!-- Backdrop -->
      <form method="dialog" class="modal-backdrop">
        <button @click="cancelSave">close</button>
      </form>
    </dialog>
  </Teleport>
</template>
