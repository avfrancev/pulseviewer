<script setup lang="ts">
const config = useConfig()
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
      <!-- Header -->
      <li class="menu-title px-3 py-2">
        <span class="font-bold text-xs uppercase tracking-wide text-base-content/60">Settings</span>
      </li>

      <!-- ESP32 Settings -->
      <li>
        <label class="label cursor-pointer justify-start gap-3 px-3 py-2">
          <input
            v-model="config.useESP32"
            type="checkbox"
            class="toggle toggle-primary toggle-sm"
          />
          <span class="label-text text-xs">Use ESP32</span>
        </label>
      </li>

      <li v-if="config.useESP32" class="px-3 pb-2">
        <label class="label py-1 px-0">
          <span class="label-text text-xs font-medium">WS Endpoint</span>
        </label>
        <input
          v-model.lazy="config.esp32WSEndpoint"
          class="input input-bordered input-sm w-full"
          type="text"
          placeholder="ws://192.168.1.x:81"
        />
      </li>

      <!-- Divider -->
      <li class="my-1">
        <div class="h-px bg-base-300/50 mx-3"></div>
      </li>

      <!-- Measurements Settings -->
      <li>
        <label class="label cursor-pointer justify-start gap-3 px-3 py-2">
          <input
            v-model="config.pinMeasurements"
            type="checkbox"
            class="toggle toggle-primary toggle-sm"
          />
          <span class="label-text text-xs">Pin measurements</span>
        </label>
      </li>
    </ul>
  </div>
</template>

<style lang="sass" scoped>
</style>
