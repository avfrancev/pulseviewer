<script setup lang="ts">
const { toasts, remove } = useToast()

const typeClasses: Record<string, string> = {
  success: "alert alert-success",
  error: "alert alert-error",
  info: "alert alert-info",
  warning: "alert alert-warning",
}

const typeIcons: Record<string, string> = {
  success: "i-ph:check-circle-fill",
  error: "i-ph:x-circle-fill",
  info: "i-ph:info-fill",
  warning: "i-ph:warning-fill",
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="shadow-lg pointer-events-auto" :class="[typeClasses[toast.type]]"
        >
          <div class="flex items-center gap-3">
            <i :class="typeIcons[toast.type]" class="text-lg" />
            <span class="text-sm font-medium">{{ toast.message }}</span>
            <button
              class="btn btn-ghost btn-xs btn-circle ml-auto"
              @click="remove(toast.id)"
            >
              <i-ph:x-bold />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
