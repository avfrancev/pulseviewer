<script setup lang="ts">
// const { currentSession, sessions, addSession, removeSession: _removeSession } = useSessionsStore()
// const config = useConfig()

// import  { mode } from '~/stores/colors'
// console.log(mode.system.value);

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="flex items-center my-4 overflow-x-auto">
    <div class="flex items-center mr-0 md:mr-4">
      <i-twemoji:raccoon class="mr-0 text-3xl transition hue-rotate-180 drop-shadow-lg md:mr-4 duration-600 hover:scale-110 hover:hue-rotate-0" />
      <pre class="hidden md:block"><b class="text-xl">RF Pulse Viewer</b></pre>
    </div>
    <PulsesViewSessionSelecotr />
    <div class="ml-auto *:btn-sm *:sm:btn-md">
      <button class="text-lg btn btn-sms btn-square btn-ghost" @click="toggleDark()">
        <i-carbon:moon v-if="!isDark" />
        <i-carbon:sun v-else />
      </button>
      <SettingsPopover>
        <button class="text-lg btn btn-square btn-ghost">
          <i-ph:gear />
        </button>
      </SettingsPopover>
      <a class="text-lg btn btn-sms btn-square btn-ghost" href="https://github.com/avfrancev/pulseviewer" target="_blank">
        <i-ph:github-logo-fill />
      </a>
      <HelpPopover>
        <button class="text-xl btn btn-ghost">?</button>
      </HelpPopover>
    </div>
  </div>
</template>
