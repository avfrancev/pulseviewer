<script setup lang="ts">
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger :as-child="true">
      <slot />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent class="flex flex-col gap-2 p-4 text-sm">
        <PopoverArrow class="fill-base-300" />
        <div class="h-0 divider divider-start"><b>Pulses</b></div>
        <div class="shortcut">
          <span><kbd>ctrl</kbd> + <kbd>scroll</kbd> zoom view</span>
        </div>
        <div class="shortcut">
          <span><kbd>alt</kbd> + <kbd>drag</kbd> change offset</span>
        </div>
        <div class="shortcut">
          <span><kbd>shift</kbd> + <kbd>drag</kbd> create new measurement</span>
        </div>
        <div class="h-0 divider divider-start"><b>Measurements</b></div>
        <div class="shortcut">
          <span><kbd>del</kbd> or <kbd>d</kbd> delete measurement</span>
        </div>
        <div class="shortcut">
          <kbd>c</kbd>
          <span>change color</span>
        </div>
        <div class="shortcut">
          <span><kbd>&#8592;</kbd> or <kbd>&#8594;</kbd> move measurement</span>
        </div>
        <div class="shortcut">
          <span><kbd>alt</kbd> + <kbd>drag resize handler</kbd> snap to pulses</span>
        </div>
        <div class="shortcut">
          <span><kbd>space</kbd> scroll to measurement card</span>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style lang="sass" scoped>
.shortcut
  @apply flex items-center gap-2
  kbd
    @apply kbd kbd-sm text-xs mx-1
</style>
