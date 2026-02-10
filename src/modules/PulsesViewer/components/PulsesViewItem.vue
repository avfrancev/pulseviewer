<script setup lang="ts">
import type { Measurement } from "../models/Measurements"
import type { Pulses, PulsesItem } from "../models/Pulses"
import type { IParsedPulses } from "../parserHelpers"
import { curveStepAfter, line } from "d3-shape"

const props = defineProps<{ pulses: Pulses }>()
const { currentSession, sessions } = useSessionsStore()
const config = useConfig()

const { view } = useViewStore()
const { ZT } = view

const pulsesStore = usePulsesStore()

const itemEl = ref<HTMLElement | null>(null)

const genLine = line(
  (d: PulsesItem) => d.scaledTime,
  (d: PulsesItem) => (d.level ? 20 : 80),
)
  .curve(curveStepAfter)

const linePath = computed<string>(() => {
  return genLine(props.pulses?.data.value) as string
})

let tmpMeasurement: Measurement | null = null

const isDropDownMoreOpen = ref(false)

const clipboardSource = ref("")
const clipboard = useClipboard({ source: clipboardSource })

function copyAs(type: "RFRAW" | "JSON" | "ARRAY") {
  switch (type) {
    case "RFRAW":{
      console.log("RFRAW")

      break
    }
    case "JSON": {
      const a = JSON.stringify(props.pulses)
      clipboardSource.value = a
      clipboard.copy()
      // console.log("JSON", a)
      break
    }
    case "ARRAY": {
      console.log("ARRAY")
      clipboardSource.value = props.pulses.raw_data.toString()
      clipboard.copy()
      break
    }
    default:
      break
  }
}

// eslint-disable-next-line ts/no-explicit-any
function onItemDrag(s: any) {
  if (s.altKey) {
    s.event.stopImmediatePropagation()
    // props.pulses.xOffset.value += (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k
    props.pulses.setXOffset(props.pulses.xOffset.value + (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k)
  }
  else if (s.shiftKey) {
    s.event.stopImmediatePropagation()
    const dx = (pulsesStore.pixelRatio.value * s.delta[0]) / ZT.k
    let x = (s.event.clientX - view.elBounds.left.value)
    x = ZT.invertX(x)
    x -= props.pulses.scaledXOffset.value
    x = pulsesStore.xScale.value.invert(x)
    if (s.first) {
      // props.pulses.addMeasurement(x, x) ?????
      tmpMeasurement = props.pulses.addMeasurement(x, x)
      tmpMeasurement.isHovered.value = true
    }
    else if (tmpMeasurement) {
      tmpMeasurement.x2.value += dx
    }
    else if (s.last) {
      tmpMeasurement = null
    }
  }
}

function onPulsesSave(val: IParsedPulses) {
  // console.log({ val })
  if (val.data && typeof val.data === "object") {
    if (val.type === FormatType[FormatType.Array] || val.type === FormatType[FormatType.RfRaw])
      props.pulses.setRawData(val.data as number[])
    else if (val.type === FormatType[FormatType.Json] && "raw_data" in val.data)
      pulsesStore.updatePulses(props.pulses, val.data)
      // props.pulses.setRawData(val.data.raw_data)
  }
}
</script>

<template>
  <!-- prettier-ignore -->
  <div
    ref="itemEl"
    v-hover="(s: any) => { !isDropDownMoreOpen && pulses.setIsHovered(s.hovering) }"
    class="relative mt-2"
  >
    <!-- pre {{ 20/view.ZT.k }} -->
    <!-- pre {{ pulses.isHovered }} -->
    <div class="flex items-center h-8">
      <div
        v-show="pulses.isHovered.value"
        class="actions relative join *:btn *:btn-sm *:text-md"
      >
        <button class="join-item btn-square">
          <i-ph:dots-six-vertical-bold />
        </button>
        <!-- PulsesViewEditPulsesDialog( -->
        <!-- :model-value="props.pulses.raw_data" -->
        <!-- @update:model-value="onPulsesSave" -->
        <!-- ) -->
        <PulsesViewEditPulsesDialog
          :value="props.pulses.raw_data.toString()"
          @save="onPulsesSave"
        >
          <button class="join-item btn-square">
            <i-ph:pencil-simple />
          </button>
        </PulsesViewEditPulsesDialog>
        <button class="join-item btn-square hover:btn-error" @click="pulsesStore.remove(props.pulses)">
          <i-ph:trash />
        </button>

        <DropdownMenuRoot v-model:open="isDropDownMoreOpen" :default-open="false">
          <DropdownMenuTrigger class="btn-square join-item">
            <i-ph:dots-three-outline-fill />
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent class="DropdownMenuContent">
              <DropdownMenuArrow class="fill-base-300" />
              <DropdownMenuItem class="DropdownMenuItem" :disabled="pulses.xOffset.value === 0" @click="pulses.setXOffset(0)">
                <i-ph:align-left-simple-fill class="mr-2" />
                Reset offset
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger class="DropdownMenuItem" value="more copy">
                  <i-ph:align-left-simple-fill class="mr-2" />
                  Copy to
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent class="DropdownMenuContent">
                      <DropdownMenuItem
                        v-if="config.useESP32"
                        class="DropdownMenuItem"
                        @click="copyToSession('ESP32', pulses.toJSON())"
                      >{{ currentSession === "ESP32" ? "Current" : "ESP32" }}</DropdownMenuItem>
                      <DropdownMenuItem
                        v-for="(s, id) in sessions"
                        :key="s"
                        class="DropdownMenuItem"
                        @click="copyToSession(s, pulses.toJSON())"
                      >{{ currentSession === s ? "Current" : `Session #${id + 1}` }}</DropdownMenuItem>
                      <!-- @click="console.log(pulses.toJSON())" -->
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSubTrigger>
              </DropdownMenuSub>
              <DropdownMenuSub v-if="clipboard.isSupported">
                <DropdownMenuSubTrigger class="DropdownMenuItem" value="more copy">
                  <i-ph:align-left-simple-fill class="mr-2" />
                  Copy as
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent class="DropdownMenuContent">
                      <!-- DropdownMenuItem.DropdownMenuItem(@click="copyAs('RFRAW')") -->
                      <!-- RFRaw -->
                      <DropdownMenuItem class="DropdownMenuItem" @click="copyAs('JSON')">
                        JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem class="DropdownMenuItem" @click="copyAs('ARRAY')">
                        Array
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSubTrigger>
              </DropdownMenuSub>
              <DropdownMenuItem
                class="DropdownMenuItem"
                @click="pulses.addMeasurement(pulses.data.value.at(0)?.time || 0, pulses.data.value.at(-1)?.time || 0)"
              >
                <i-ph:brackets-square-duotone class="mr-2" />
                Measure all
              </DropdownMenuItem>
              <DropdownMenuItem class="DropdownMenuItem hover:bg-error hover:text-error-content" @click="pulsesStore.remove(props.pulses)">
                <i-ph:trash class="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
      <div
        v-if="clipboard.copied.value"
        class="flex items-center gap-1 mt-2 ml-2 text-sm whitespace-nowrap text-success"
      >
        <!-- span -->
        <i-ph:check-circle-bold />
        <b>Copied</b>
      </div>
      <div class="ml-auto text-xs text-right text-muted">
        <div
          v-if="pulses.rssi"
        >RSSI: [ {{ pulses.rssi }} dBm]</div>
        <div
          v-if="pulses.rssi"
        >Created at: {{ pulses.created_at.toLocaleString() }} {{ useTimeAgo(pulses.created_at).value }}</div>
      </div>
    </div>

    <div
      class="h-[100px] relative"
    >
      <svg
        v-drag="onItemDrag"
        :viewBox="`${pulses.viewBox.value.x} 0 ${pulses.viewBox.value.w} 100`"
        preserveAspectRatio="none"
        class="w-full h-full"
      >
        <!-- :viewBox="`${viewStore.view.viewportLeft.value - pulses.scaledXOffset.value} 0 ${viewStore.view.viewportWidth.value} 100`" -->
        <path
          fill="none"
          class="stroke-base-content/60"
          :d="linePath"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
        <PulsesViewMeasurementsRects v-bind="{ pulses }" />
        <PulsesViewWidthMeasure v-bind="{ pulses }" />
      </svg>
    </div>

    <PulsesViewMeasurementMenu v-bind="{ measurements: pulses.measurements }" class="pointer-events-none" />
    <!-- pre {{ props.pulses.viewBox.value.x }} -->

    <PulsesViewMeasurementsDecoders v-bind="{ pulses: props.pulses }" />
  </div>
</template>
