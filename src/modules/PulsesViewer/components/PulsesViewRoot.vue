<script lang="ts" setup>
import type { Pulses } from "../models/Pulses"
import type { IParsedPulses } from "../parserHelpers"

const viewEl = ref()
const viewStore = useViewStore()
const { view } = viewStore
viewStore.init(viewEl)
const config = useConfig()
const pulsesStore = usePulsesStore()

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
    class="sticky z-20 top-2 bg-base-300/80 backdrop-blur"
  />

  <div
    v-if="pulsesStore.data.size > 0"
    class="inline-flex self-start max-w-full MeasurementsMetaWrapper"
    :class="config.pinMeasurements && ['sticky top-10 z-30']"
  >
    <PulsesViewMeasurementsMeta />
  </div>

  <div
    v-if="pulsesStore.data.size > 0"
    class="container fixed bottom-0 z-10 px-2 -ml-2"
  >
    <div class="flex w-full mb-4 bg-base-300 ring-4 ring-base-300 rounded-box">
      <div
        v-drag="(e: any) => { view.translateBy(-e.delta[0] * view.ZT.k, 0) }"
        class="h-2 text-xs text-center text-secondary-content rounded-box bg-base-content/20 active:ring-1 ring-base-content/50 cursor-grab active:cursor-grabbing"
        :style="{ width: `${Math.max(view.elBounds.width.value / view.ZT.k, 10)}px`, transform: `translateX(${-view.ZT.x / view.ZT.k}px)` }"
      />
    </div>
  </div>

  <div class="relative flex flex-col flex-1 h-full">
    <div
      v-if="pulsesStore.data.size < 1"
      class="flex flex-col items-center self-center justify-center flex-1 my-auto sm:flex-row sm:gap-12"
    >
      <PulsesViewEditPulsesDialog
        value=""
        title="Create new pulses"
        :clear-on-save="true"
        @save="onPulsesSave"
      >
        <button class="btn md:btn-wide">
          Create new pulses
        </button>
      </PulsesViewEditPulsesDialog>
      <div class="divider sm:divider-horizontal sm:h-[100px] self-center">OR</div>
      <button
        class="btn md:btn-wide"
        @click="loadSamplePulses()"
      >Add sample pulses</button>
    </div>

    <div
      ref="viewEl"
      class="mt-4 mb-20 viewEl"
    >
      <div
        v-if="pulsesStore.data.size > 0"
      >
        <PulsesViewItem
          v-for="p in pulsesStore.data"
          :key="p.id"
          v-bind="{ pulses: p }"
        />
        <PulsesViewTicks />
      </div>
    </div>
  </div>
</template>
