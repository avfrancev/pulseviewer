<template lang="pug">
.container.mx-auto.px-2(class="max-sm:max-w-[100svw] min-h-screen flex flex-col")
  .flex.my-4.items-center.overflow-x-auto
    .flex.items-center.mr-4
      i-twemoji:raccoon.hue-rotate-180.drop-shadow-lg.mr-4.text-3xl(class="transition duration-600 hover:scale-110 hover:hue-rotate-0")
      pre(
        class="hidden md:block"
        ): b.text-xl RF Pulse Viewer
    //- SelectRoot(:value="currentSession.id")
    SelectRoot(v-model="currentSession")
      SelectTrigger(class="whitespace-nowrap input input-bordered h-8 inline-flex mx-4 items-center space-x-3", aria-label="Select session")
        //- SelectValue(placeholder="Select session..." aria-label="value") {{ currentSession.id }}
        SelectValue(placeholder="Select session...")
        Icon(icon="radix-icons:chevron-down", class="size-4")
      SelectPortal
        SelectContent(class="shadow-lg bg-base-300 rounded z-[100]", :side-offset="5")
          SelectScrollUpButton(class="flex items-center justify-center h-[25px] bg-base-300 text-base-content cursor-default")
            Icon(icon="radix-icons:chevron-up")
          SelectViewport(class="p-[5px] relative")
            //- SelectLabel(class="px-[25px] text-xs leading-[25px] text-mauve11") Fruits
            SelectGroup.relative
              //- button.btn.btn-sm.btn-block.btn-ghost(@click="() => currentSession = sessionsStore.addSession(null)")
                i-ph:plus.text-xs
              //- SelectItem(:key="`esp32`", class="text-sm leading-none rounded-[3px] flex items-center h-8 pr-5 pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1", :value="ESP32Session")
                SelectItemIndicator(class="absolute left-0 w-[25px] inline-flex items-center justify-center")
                  Icon(icon="radix-icons:check")
                SelectItemText ESP32
              SelectItem(v-for="(option, index) in sessions", :key="option.id", class="text-sm leading-none rounded-[3px] flex items-center h-8 pr-5 pl-[25px] pr-8 relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1", :value="option")
                SelectItemIndicator(class="absolute left-0 w-[25px] inline-flex items-center justify-center")
                  Icon(icon="radix-icons:check")
                SelectItemText(v-if="option.id === 'ESP32' && config.useESP32") ESP32
                SelectItemText(v-else) Session # {{(index + (hasESP32Session ? 0 : 1)) }}
                  //- pre {{ hasESP32Session ? 0 : 1 }} {{ index }}
              .absolute.top-0.right-0
                //- button.invisible.btn.btn-xs.my-1.text-xs.btn-square.btn-ghost
                div(v-for="session in sessions" :key="session.id")
                  .my-8(v-if="session.id === 'ESP32' && config.useESP32")
                  button.btn.btn-xs.my-1.text-xs.btn-square.btn-ghost(
                    v-else
                    class="hover:bg-error hover:text-error-content"
                    @click="removeSession(session)")
                    i-ph:x

              button.btn.btn-sm.btn-block.btn-ghost(@click="sessionsStore.addSession(null)")
                i-ph:plus.text-xs
              //- SelectItem( :key="-1", class="text-sm leading-none rounded-[3px] flex items-center h-8 pr-5 pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1", :value="option")
              //-   SelectItemIndicator(class="absolute left-0 w-[25px] inline-flex items-center justify-center")
              //-     Icon(icon="radix-icons:check")
              //-   SelectItemText ADD
          SelectScrollDownButton(class="flex items-center justify-center h-[25px] bg-base-300 text-base-content cursor-default")
            Icon(icon="radix-icons:chevron-down")
    .flex-1
    .flex.join
      label.join-item.btn.btn-square.swap.swap-rotate()
        input(type="checkbox" :checked="mode !== 'dark' ? true : false" @input="mode = mode === 'dark' ? 'light' : 'dark'")
        .swap-off
          i-ph:sun-bold.text-lg
        .swap-on 
          i-ph:moon-bold.text-lg
      button.join-item.btn.btn-square.ml-2.text-xl(
        v-if="config.useESP32"
        @click="isESP32Paused = !isESP32Paused")
        i-ph:pause-fill(v-if="!isESP32Paused")
        i-ph:play-fill(v-else)
      button.join-item.btn.btn-square.ml-2.text-xl(onclick="helpDialog.showModal()")
        i-material-symbols:help-outline
      PopoverRoot
        PopoverTrigger.join-item.btn.btn-square.ml-2.text-xl(aria-label="Settings")
          i-material-symbols:settings-outline
        PopoverPortal
        PopoverContent(
          side="bottom"
          :side-offset="2"
          class="bg-base-300 rounded z-30 p-5 shadow-lg"
          )
          .flex.flex-col.gap-3.text-sm
            fieldset.flex.gap-3.justify-between
              label(for="useESP32") Use ESP32
              input#useESP32.toggle(type="checkbox" v-model="config.useESP32")
            fieldset.flex.gap-3.justify-between.items-center(v-if="config.useESP32")
              label(for="esp32WSEndpoint") ESP32 WS Endpoint
              input#esp32WSEndpoint.input.input-sm(type="text" v-model.lazy="config.esp32WSEndpoint")
          PopoverArrow(class="fill-base-300")

  .flex.flex-col.flex-1(v-if="currentSession")
    PulsesViewerRoot(v-bind="{session: currentSession, sessionsStore}" :key="currentSession.id")
</template>

<script setup>
import { Icon } from "@iconify/vue"

import { mode } from "@/stores/colors"
// import PulsesViewer from "@/modules/PulsesViewer/PulsesViewer.vue"
import useSessions from "@/stores/sessions"
import useConfig from "@/stores/config"
import useESP32 from "@/stores/ESP32"
import { usePulsesStore } from "@/models"

const sessionsStore = useSessions()
const { sessions } = sessionsStore
const { config } = useConfig()

const hasESP32Session = computed(() => sessions.some(session => session.id === 'ESP32'))

if ( !sessions.length || sessions.length === 1 && hasESP32Session.value ) {
  console.log('no sessions');
  sessionsStore.addSession()
}

// if ( sessions.length === 1 && hasESP32Session.value ) {
//   console.log('has ESP32 session');
//   sessionsStore.addSession()
// }
  
const currentSession = ref(sessions[0])


watchEffect(() => {
  if (config.useESP32) {
    sessionsStore.addSession('ESP32', true)
  } else {
    sessionsStore.removeSessionById('ESP32')
    if (currentSession.value.id === 'ESP32')
      currentSession.value = sessions[0] || sessionsStore.addSession()
  }
})

function removeSession(session) {
  session.remove()
  if (sessions.length === 0) {
    currentSession.value = sessionsStore.addSession()
  } else if (session.id === currentSession.value.id) {
    currentSession.value = sessions[0]
  }
}

const ESP32Store = useESP32()

const isESP32Paused = useStorage('isESP32Paused', false)

ESP32Store.$onAction(({ name, args }) => {
  if (name !== "addWSData" || isESP32Paused.value) return
  let data = args[0]
  // console.log(name, data);
  const pulsesStore = usePulsesStore('ESP32')
  let p = pulsesStore.pulses[pulsesStore.pulses.length - 1]
  if (data.delta > 200_000) {
    p = pulsesStore.addPulses(data.parsed_buf)
    p.rssi = data.rssi
    return
  }
  if (p.raw_data[p.raw_data.length - 1] === 0) {
    p.raw_data[p.raw_data.length - 1] = data.delta
  }
  p.raw_data = [...p.raw_data, ...data.parsed_buf]
})


</script>

<style lang="sass">
html, body
  scroll-behavior: smooth
  height: 100%
  display: grid
  &[data-theme='cupcake']
    background-image: url("corrugation.png")
  &[data-theme='dark']
    background-image: url("fake-brick.png")

#app
  position: relative
  width: 100%
  min-height: 100vh

path
  vector-effect: non-scaling-stroke
</style>
