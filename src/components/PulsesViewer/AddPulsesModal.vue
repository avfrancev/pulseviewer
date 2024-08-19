<template lang="pug">
Modal
  template(#trigger)
    DialogTrigger(class="join-item btn btn-square")
      //- i-ph:file-plus-fill
      //- i-pajamas:doc-new
      i-mingcute:file-new-line(class="text-lg")
  template(#content)
    DialogTitle(class="mb-4 text-lg font-bolds")
      | Add new pulses
    DialogDescription(class="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal")
      pre.text-xs(class="text-base-content/50") Example: 434,394,380,422,379,422,377,421,378,420,377,421
      pre.text-xs(class="text-base-content/50") Example: 434,394,380,422,379,422,377,421,378,420,377,421
    textarea.textarea.textarea-bordered.my-4.flex-1.w-full(
      v-model="tmpPulsesString" placeholder="434,394,380,422,379,422,377,421,378,420,377,421")
    div(class="mt-3 flex justify-end")
      DialogClose(as-child)
        button(class="btn" @click="addPulses")
          | Add
    DialogClose(class="btn btn-square btn-sm text-xs top-0 right-0 absolute m-2" aria-label="Close")
      i-fa:close
</template>

<script setup>

import { RfRaw } from 'pulseplot/lib/rfraw';

const props = defineProps({
  pulsesStore: {
    type: Object,
    default: () => {},
  }
})

function parsePulsesString(pulseStr) {
  if (Array.isArray(pulseStr)) {
    return pulseStr
  }
  let pulses = pulseStr.split(/[ ,]+/).map(x => parseInt(x, 10))
  return pulses
}

const tmpPulsesString = ref("")

const addPulses = () => {
  if (RfRaw.isRfRaw(tmpPulsesString.value)) {
    props.pulsesStore.addPulses(RfRaw.getPulses(tmpPulsesString.value))
  }
  let pulses = parsePulsesString(tmpPulsesString.value)  
  if (pulses.length > 2) {
    props.pulsesStore.addPulses(pulses)
  }
}
</script>