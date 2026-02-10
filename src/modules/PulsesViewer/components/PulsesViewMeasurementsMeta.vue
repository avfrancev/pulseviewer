<script setup lang="ts">
const pulsesStore = usePulsesStore()
// const config = useConfig()

const measurements = computed(() => {
  return [...pulsesStore.data].flatMap((p) => {
    return [...p.measurements]
  })
})

const measurementsSorted = computed(() => {
  return measurements.value.toSorted((a, b) => (a.minX.value + a.pulses.xOffset.value) - (b.minX.value + b.pulses.xOffset.value))
})
</script>

<template>
  <!-- div Measurements Meta Card [ {{ measurementsSorted.length }} ] -->
  <!-- div( -->
  <!--   class="z-20 inline-flex self-start max-w-full pt-2 top-2" -->
  <!-- ) -->
  <!-- div(class="flex w-auto p-2 -ml-2 space-x-3 overflow-y-auto scroll-ml-6") -->
  <div class="flex w-auto p-2 -ml-2 space-x-3 overflow-y-auto scroll-ml-6">
    <template
      v-for="(_m, i) in measurementsSorted"
      :key="_m.id"
    >
      <PulsesViewMeasurementsMetaCard
        v-model="measurementsSorted[i]"
      />
    </template>
    <!-- div(class="flex w-auto p-2 -ml-2 space-x-3 overflow-y-auto scroll-ml-6") -->
    <!-- PulsesViewMeasurementsMetaCard( -->
    <!-- v-for="m in measurements" -->
    <!-- :key="m.id" -->
    <!-- v-model="m" -->
    <!-- ) -->
  </div>
</template>
