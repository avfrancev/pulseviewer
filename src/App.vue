<template lang="pug">
div(class="container mx-auto px-2 min-h-screen flex flex-col max-sm:max-w-[100svw]")
  div(class="flex my-4 items-center overflow-x-auto")
    div(class="flex items-center mr-0 md:mr-4")
      i-twemoji:raccoon(class="hue-rotate-180 drop-shadow-lg mr-0 md:mr-4 text-3xl transition duration-600 hover:scale-110 hover:hue-rotate-0")
      pre(class="hidden md:block"): b(class="text-xl") RF Pulse Viewer
    //- SelectRoot(:value="currentSession.id")
    SelectRoot(v-model="currentSession")
      SelectTrigger(class="whitespace-nowrap input input-bordered h-8 inline-flex mx-4 items-center space-x-3" aria-label="Select session")
        //- SelectValue(placeholder="Select session..." aria-label="value") {{ currentSession.id }}
        SelectValue(placeholder="Select session...")
        Icon(class="size-4" icon="radix-icons:chevron-down")
      SelectPortal
        SelectContent(class="shadow-lg bg-base-300 rounded z-[100]" :side-offset="5")
          SelectScrollUpButton(class="flex items-center justify-center bg-base-300 text-base-content cursor-default h-[25px]")
            Icon(icon="radix-icons:chevron-up")
          SelectViewport(class="relative p-[5px]")
            SelectGroup(class="relativ")
              SelectItem(
                class="cursor-pointer hover:text-primary text-sm leading-none flex items-center h-8 pr-5 pr-8 relative select-none rounded-[3px] pl-[25px] data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1"
                v-for="(option, index) in sessions"
                :key="option.id"
                :value="option")
                SelectItemIndicator(class="absolute left-0 inline-flex items-center justify-center w-[25px]")
                  Icon(icon="radix-icons:check")
                SelectItemText(v-if="option.id === 'ESP32' && config.useESP32") ESP32
                SelectItemText(v-else) Session # {{index + (hasESP32Session ? 0 : 1)}}
              div(class="absolute top-0 right-0 mt-1 mr-1")
                div(
                  v-for="session in sessions"
                  :key="session.id")
                  div(class="h-8" v-if="session.id === 'ESP32' && config.useESP32")
                  button(
                    class="btn btn-xs my-1 text-xs btn-square btn-ghost hover:bg-error hover:text-error-content"
                    v-else
                    @click="removeSession(session)")
                    i-ph:x

              button(class="btn btn-sm btn-block btn-ghost" @click="sessionsStore.addSession(null)")
                i-ph:plus(class="text-xs")
          SelectScrollDownButton(class="flex items-center justify-center bg-base-300 text-base-content cursor-default h-[25px]")
            Icon(icon="radix-icons:chevron-down")
    div(class="flex-1")
    div(class="flex join")
      label(class="join-item btn btn-square swap swap-rotate")
        input(
          type="checkbox"
          :checked="mode !== 'dark' ? true : false"
          @input="mode = mode === 'dark' ? 'light' : 'dark'")
        div(class="swap-off")
          i-ph:sun-bold(class="text-lg")
        div(class="swap-on")
          i-ph:moon-bold(class="text-lg")
      button(
        class="join-item btn btn-square ml-2 text-xl"
        v-if="config.useESP32"
        @click="isESP32Paused = !isESP32Paused")
        i-ph:pause-fill(v-if="!isESP32Paused")
        i-ph:play-fill(v-else)
      button(class="join-item btn btn-square ml-2 text-xl" @click="fullscreen.toggle()")
        i-mingcute:fullscreen-fill(v-if="!fullscreen.isFullscreen.value")
        i-mingcute:fullscreen-exit-fill(v-if="fullscreen.isFullscreen.value")
      //- button(class="join-item btn btn-square ml-2 text-xl" onclick="helpDialog.showModal()")
        i-material-symbols:help-outline
      //- Modal
        template(#trigger)
          DialogTrigger(class="join-item btn text-xl btn-square")
            i-material-symbols:help-outline
        template(#content)
          DialogTitle(class="mb-4 text-lg font-bolds")
            | Key bindings
          DialogDescription
          pre ctr + wheel = zoom
          pre shift + wheel or drag = translate 
          h3.text-xl Measurements
          pre d = delete
          DialogClose(class="btn btn-square btn-sm text-xs top-0 right-0 absolute m-2" aria-label="Close")
            i-fa:close 
      PopoverRoot
        PopoverTrigger(class="join-item btn btn-square ml-2 text-xl" aria-label="Settings")
          i-material-symbols:settings-outline
        PopoverPortal
        PopoverContent(
          class="bg-base-300 rounded p-5 shadow-lg z-[40]"
          side="bottom"
          :side-offset="2")
          div(class="flex flex-col gap-3 text-sm")
            fieldset(class="flex gap-3 justify-between")
              label(for="useESP32") Use ESP32
              input#useESP32div(
                class="toggle"
                type="checkbox"
                v-model="config.useESP32")
            fieldset(class="flex gap-3 justify-between items-center" v-if="config.useESP32")
              label(for="esp32WSEndpoint") ESP32 WS Endpoint
              input#esp32WSEndpointdiv(
                class="input input-sm"
                type="text"
                v-model.lazy="config.esp32WSEndpoint")
          PopoverArrow(class="fill-base-300")

  template(v-if="currentSession")
    PulsesViewerRoot(
      v-bind="{session: currentSession, sessionsStore}"
      :key="currentSession.id")
</template>

<script setup>
  import { Icon } from "@iconify/vue"

  import { mode } from "@/stores/colors"
  import useSessions from "@/stores/sessions"
  import useConfig from "@/stores/config"
  import useESP32 from "@/stores/ESP32"
  import { usePulsesStore } from "@/models"

  const sessionsStore = useSessions()
  const { sessions } = sessionsStore
  const { config } = useConfig()

  const hasESP32Session = computed(() => sessions.some((session) => session.id === "ESP32"))

  const fullscreen = useFullscreen()

  if (!sessions.length || (sessions.length === 1 && hasESP32Session.value)) {
    console.log("no sessions")
    sessionsStore.addSession()
  }

  const currentSession = ref(sessions[0])

  watchEffect(() => {
    if (config.useESP32) {
      sessionsStore.addSession("ESP32", true)
    } else {
      sessionsStore.removeSessionById("ESP32")
      if (currentSession.value.id === "ESP32") currentSession.value = sessions[0] || sessionsStore.addSession()
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

  const isESP32Paused = useStorage("isESP32Paused", false)

  ESP32Store.$onAction(({ name, args }) => {
    if (name !== "addWSData" || isESP32Paused.value) return
    let data = args[0]
    // console.log(name, data);
    const pulsesStore = usePulsesStore("ESP32")
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
      background-image: url("/corrugation.png")
    &[data-theme='dark']
      background-image: url("/fake-brick.png")

  #app
    position: relative
    width: 100%
    min-height: 100vh

  path
    vector-effect: non-scaling-stroke
</style>
