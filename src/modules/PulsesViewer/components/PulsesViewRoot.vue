<script lang="ts" setup>
import type { DragState } from "@vueuse/gesture"
import type { Pulses } from "../models/Pulses"
import type { IParsedPulses } from "../parserHelpers"

const viewEl = ref()
const viewStore = useViewStore()
const { view } = viewStore
viewStore.init(viewEl)
const config = useConfig()
const pulsesStore = usePulsesStore()

// Computed properties для оптимизации производительности
const hasPulsesData = computed(() => pulsesStore.data.size > 0)

const scrollbarWidth = computed(() => {
  const { width } = view.elBounds
  const scale = view.ZT.k
  // Защита от деления на ноль и отрицательных значений
  if (!scale || scale <= 0 || !width.value)
    return 0
  const scrollbarWidthPx = Math.max(width.value / scale, 0)
  return scrollbarWidthPx
})

const scrollbarPosition = computed(() => {
  const { x, k } = view.ZT
  // Защита от деления на ноль
  if (!k || k <= 0)
    return 0
  return -x / k
})

const scrollbarStyle = computed(() => ({
  width: `calc(${scrollbarWidth.value}px + 5px)`,
  transform: `translateX(${scrollbarPosition.value}px)`,
}))

// Типизированный обработчик drag для скроллбара
function handleScrollbarDrag(state: DragState) {
  try {
    const { delta } = state
    const scale = view.ZT.k

    // Защита от некорректных значений
    if (!scale || scale <= 0) {
      console.warn("[Scrollbar] Invalid scale value:", scale)
      return
    }

    // Применяем трансформацию с учетом масштаба
    view.translateBy(-delta[0] * scale, 0)
  }
  catch (error) {
    console.error("[Scrollbar] Drag handler error:", error)
  }
}

function onPulsesSave(val: IParsedPulses) {
  if (val.data && typeof val.data === "object") {
    if (val.type === FormatType[FormatType.Array] || val.type === FormatType[FormatType.RfRaw])
      pulsesStore.add({ raw_data: val.data as number[] })
    else if (val.type === FormatType[FormatType.Json] && "raw_data" in val.data)
      pulsesStore.add(val.data)
  }
}

watchEffect(() => {
  viewStore.setScaleConstraints(pulsesStore)
})
// const ESP32PulsesStore = new PulsesStore("ESP32")
// ESP32PulsesStore.loadFromStorage()

const ESP32Store = useESP32()
// console.log(ESP32Store, ESP32PulsesStore.allMeasurements.value)

let lastPulses: Pulses | undefined

ESP32Store.onRMTMessage((data) => {
  // console.log(data)
  if (useSessionsStore().currentSession.value !== "ESP32")
    return
  if (data.delta > 200_000) {
    lastPulses = pulsesStore.add({ raw_data: data.parsed_buf, rssi: data.rssi })
  }
  else if (lastPulses) {
    const raw_data = [...lastPulses.raw_data]
    raw_data.pop()
    lastPulses.setRawData([...raw_data, data.delta, ...data.parsed_buf])
  }
})
</script>

<template>
  <PulsesViewPulsesStoreNavbar
    v-if="pulsesStore.data.size > 0"
  />

  <div
v-if="pulsesStore.data.size > 0" class="inline-flex self-start max-w-full MeasurementsMetaWrapper"
    :class="config.pinMeasurements && ['sticky top-10 z-30']"
>
    <PulsesViewMeasurementsMeta />
  </div>

  <!-- Scrollbar component -->
  <div v-if="hasPulsesData" class="fixed bottom-0 left-0 right-0 z-10">
    <div class="container mx-auto  ">
      <div class="flex w-full mb-4 bg-base-300/60  p-1 rounded-full   rounded-box backdrop-blur-xs">
        <div
          v-drag="handleScrollbarDrag"
          class="h-2 text-xs text-center text-secondary-content rounded-box bg-base-content/20
                 active:ring-1 ring-base-content/50 cursor-grab active:cursor-grabbing "
          :style="scrollbarStyle"
          aria-label="Drag to scroll"
          role="slider"
          :aria-valuenow="scrollbarPosition"
          :aria-valuemin="0"
          :aria-valuemax="100"
        />
      </div>
    </div>
  </div>

  <div class="relative flex flex-col flex-1 h-full">
    <div
v-if="pulsesStore.data.size < 1"
      class="flex flex-col items-center self-center justify-center flex-1 my-auto sm:flex-row sm:gap-12"
>
      <PulsesViewEditPulsesDialog value="" title="Create new pulses" :clear-on-save="true" @save="onPulsesSave">
        <button class="btn md:btn-wide">
          Create new pulses
        </button>
      </PulsesViewEditPulsesDialog>
      <div class="divider sm:divider-horizontal sm:h-[100px] self-center">OR</div>
      <button class="btn md:btn-wide" @click="loadSamplePulses()">Add sample pulses</button>
    </div>

    <div ref="viewEl" class="mt-4 mb-20 viewEl">
      <div v-if="pulsesStore.data.size > 0">
        <PulsesViewItem v-for="p in pulsesStore.data" :key="p.id" v-bind="{ pulses: p }" />
        <PulsesViewTicks />
      </div>
    </div>
  </div>
</template>
