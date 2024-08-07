<template lang="pug">
.container.mx-auto.px-2(class="max-sm:max-w-[100svw]")
  .flex.my-4.items-center.overflow-x-auto
    .flex.items-center.mr-4
      i-twemoji:raccoon.hue-rotate-180.drop-shadow-lg.mr-4.text-3xl(class="transition duration-600 hover:scale-110 hover:hue-rotate-0")
      pre(
        class="hidden md:block"
        ): b.text-xl RF Pulse Viewer
    SelectRoot(v-model="currentSession")
      SelectTrigger(class="whitespace-nowrap input input-bordered h-8 inline-flex mx-4 items-center space-x-3", aria-label="Select session")
        SelectValue(placeholder="Select session...")
        Icon(icon="radix-icons:chevron-down", class="size-4")
      SelectPortal
        SelectContent(class="shadow-lg bg-base-300 rounded z-[100]", :side-offset="5")
          SelectScrollUpButton(class="flex items-center justify-center h-[25px] bg-base-300 text-base-content cursor-default")
            Icon(icon="radix-icons:chevron-up")
          SelectViewport(class="p-[5px] relative")
            //- SelectLabel(class="px-[25px] text-xs leading-[25px] text-mauve11") Fruits
            SelectGroup.relative
              SelectItem(v-for="(option, index) in sessions", :key="option.id", class="text-sm leading-none rounded-[3px] flex items-center h-8 pr-5 pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1", :value="option")
                SelectItemIndicator(class="absolute left-0 w-[25px] inline-flex items-center justify-center")
                  Icon(icon="radix-icons:check")
                SelectItemText Session # {{ index + 1 }}
              .absolute.top-0.right-0
                div(v-for="session in sessions" :key="session.id")
                  button.btn.btn-sm.text-xs.btn-square.btn-ghost(
                    class="hover:bg-error hover:text-error-content"
                    @click="removeSession(session)")
                    i-ph:x        

              button.btn.btn-sm.btn-block.btn-ghost(@click="() => currentSession = sessionsStore.addSession(null)")
                i-ph:plus.text-xs
              //- SelectItem( :key="-1", class="text-sm leading-none rounded-[3px] flex items-center h-8 pr-5 pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1", :value="option")
              //-   SelectItemIndicator(class="absolute left-0 w-[25px] inline-flex items-center justify-center")
              //-     Icon(icon="radix-icons:check")
              //-   SelectItemText ADD
          SelectScrollDownButton(class="flex items-center justify-center h-[25px] bg-base-300 text-base-content cursor-default")
            Icon(icon="radix-icons:chevron-down")
    .flex-1
    .flex
      label.btn.btn-square.swap.swap-rotate()
        input(type="checkbox" :checked="mode !== 'dark' ? true : false" @input="mode = mode === 'dark' ? 'light' : 'dark'")
        .swap-off
          a ☀
        .swap-on 
          a 🌙
      button.btn.btn-square.ml-2.text-xl(onclick="helpDialog.showModal()")
        i-material-symbols:help-outline
      button.btn.btn-square.ml-2.text-xl(onclick="settingsDialog.showModal()")
        i-material-symbols:settings-outline
        //- pre.swap-off 2222

  //- pre asdasd
  //-  p asd
  //- .navbar.bg-base-300.rounded-box.my-4
    pre HEADER
    button.btn(
      @click="currentSession = session"
      :class="[session.id === currentSession.id ? 'btn-active': '']"
      v-for="session in sessionsStore.sessions") Session {{ session.id }}

    button.btn(@click="sessionsStore.clearSessions") clearStorage
    button.btn(@click="sessionsStore.addSession(null)") add Session
    a.btn.btn-sm.btn-square(
            class="hover:btn-error bg-transparent border-0"
            @click="session.remove()")
            i-fa:trash
    div(class="dropdown")
      div(tabindex="0" role="button" class="btn m-1") Click
      ul(tabindex="0" class="menus dropdown-content bg-base-100 rounded-box z-[1] mt-0 w-52 p-2 shadow")
        li.flex.flex-row(v-for="session in sessionsStore.sessions")
          a.flex-1.btn.btn-ghost.btn-sm.justify-start(@click="currentSession = session") Session {{session.id}}
          a.btn.btn-sm.btn-square(
            class="hover:btn-error bg-transparent border-0"
            @click="removeSession(session)")
            i-fa:trash



    //- pre asdasd {{ pulsesStore.allMeasurements?.length }}
    //- pre(v-for="m in pulsesStore.allMeasurements") {{ m.width }}
  div(v-if="currentSession")
    PV(v-bind="{session: currentSession, sessionsStore}" :key="currentSession.id")
</template>

<script setup>
import { Icon } from "@iconify/vue"

import { mode } from "@/stores/colors"
// import PulsesViewer from "@/modules/PulsesViewer/PulsesViewer.vue"
import useSessions from "@/stores/sessions"
// import { usePulsesStore } from "@/models"

const sessionsStore = useSessions()
const { sessions } = sessionsStore

const currentSession = ref(sessions[0])

// const pulsesStore = computed(() => {
//   return usePulsesStore(currentSession.value.id)
// })

// !!!!! curl_test_http3: working strategy found for ipv4 rutracker.org : nfqws --dpi-desync=fake !!!!!

// clearing nfqws redirection

// * SUMMARY
// ipv4 rutracker.org curl_test_http : tpws --split-http-req=method --oob
// ipv4 rutracker.org curl_test_http : nfqws --dpi-desync=fake --dpi-desync-ttl=12 --dpi-desync-fake-http=0x00000000
// ipv4 rutracker.org curl_test_https_tls12 : tpws not working
// ipv4 rutracker.org curl_test_https_tls12 : nfqws --dpi-desync=fake,split2 --dpi-desync-ttl=2 --dpi-desync-split-pos=1
// ipv4 rutracker.org curl_test_http3 : nfqws --dpi-desync=fake

function removeSession(session) {
  console.log(session.id, currentSession.value.id, sessions.length)
  session.remove()
  console.log(session.id, currentSession.value.id, sessions.length)
  if (sessions.length === 0) {
    currentSession.value = sessionsStore.addSession()
  } else if (session.id === currentSession.value.id) {
    currentSession.value = sessions[0]
  }
}
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
  // min-height: 100vh

path
  vector-effect: non-scaling-stroke
</style>
