<script setup lang="ts">
</script>

<template>
  <div class="dropdown dropdown-end">
    <!-- Trigger button -->
    <div tabindex="0" role="button" class="cursor-pointer">
      <slot />
    </div>

    <!-- Dropdown content -->
    <ul
      tabindex="-1"
      class="dropdown-content bg-base-200/95 backdrop-blur-sm rounded-box z-50 w-64 p-1 shadow-2xl border border-base-300/50 text-xs"
    >
      <!-- Pulses Section -->
      <li class="menu-title px-3 py-2">
        <span class="font-bold text-xs uppercase tracking-wide text-base-content/60">Pulses</span>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5 ">
          <span class="flex items-center gap-0.5">
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">ctrl</kbd> +
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">scroll</kbd>
          </span>
          <span class="text-xs text-base-content/70">Zoom view</span>
        </div>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5">
          <span class="flex items-center gap-0.5">
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">alt</kbd> +
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">drag</kbd>
          </span>
          <span class="text-xs text-base-content/70">Change offset</span>
        </div>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5">
          <span class="flex items-center gap-0.5">
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">shift</kbd> +
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">drag</kbd>
          </span>
          <span class="text-xs text-base-content/70">Create measurement</span>
        </div>
      </li>

      <!-- Divider -->
      <li class="my-1">
        <div class="h-px bg-base-300/50 mx-3"></div>
      </li>

      <!-- Measurements Section -->
      <li class="menu-title px-3 py-2">
        <span class="font-bold text-xs uppercase tracking-wide text-base-content/60">Measurements</span>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5">
          <span class="flex items-center gap-0.5">
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">del</kbd> or
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">d</kbd>
          </span>
          <span class="text-xs text-base-content/70">Delete</span>
        </div>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5">
          <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">c</kbd>
          <span class="text-xs text-base-content/70">Change color</span>
        </div>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5">
          <span class="flex items-center gap-0.5">
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">←</kbd>
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">→</kbd>
          </span>
          <span class="text-xs text-base-content/70">Move</span>
        </div>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5">
          <span class="flex items-center gap-0.5">
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">alt</kbd> +
            <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">drag</kbd>
          </span>
          <span class="text-xs text-base-content/70">Snap to pulses</span>
        </div>
      </li>
      <li>
        <div class="flex items-center gap-2 px-3 py-1.5">
          <kbd class="kbd kbd-xs bg-base-300 border-base-content/20">space</kbd>
          <span class="text-xs text-base-content/70">Scroll to card</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
</style>
