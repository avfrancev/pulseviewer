<script setup lang="ts">
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="navbar bg-base-300 shadow-sm min-h-fit rounded-box my-4">
    <!-- Brand -->
    <div class="flex-none">
      <a class="btn btn-ghost text-xl gap-2">
        <i-twemoji:raccoon class="text-3xl transition hue-rotate-180 hover:hue-rotate-0" />
        <span class="hidden sm:inline">RF Pulse Viewer</span>
      </a>
    </div>

    <!-- Session Selector -->
    <div class="flex-1">
      <PulsesViewSessionSelecotr />
    </div>

    <!-- Right Actions -->
    <div class="flex-none gap-1">
      <!-- Theme Toggle -->
      <button
        class="btn btn-ghost btn-circle "
        @click="toggleDark()"
      >
        <i-carbon:moon v-if="!isDark" class="text-lg" />
        <i-carbon:sun v-else class="text-lg" />
      </button>

      <!-- Settings -->
      <SettingsPopover>
        <button class="btn btn-ghost btn-circle ">
          <i-ph:gear class="text-lg" />
        </button>
      </SettingsPopover>

      <!-- GitHub -->
      <a
        class="btn btn-ghost btn-circle "
        href="https://github.com/avfrancev/pulseviewer"
        target="_blank"
      >
        <i-ph:github-logo-fill class="text-lg" />
      </a>

      <!-- Help -->
      <HelpPopover>
        <button class="btn btn-ghost btn-circle ">
          <i-ph:question class="text-lg" />
        </button>
      </HelpPopover>
    </div>
  </div>
</template>
