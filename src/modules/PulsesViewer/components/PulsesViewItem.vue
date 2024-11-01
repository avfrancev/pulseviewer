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

<template lang="pug">
div.relative.mt-2(
  ref="itemEl"
  v-hover="(s: any) => { !isDropDownMoreOpen && pulses.setIsHovered(s.hovering) }"
  )
  //- pre {{ 20/view.ZT.k }}
  //- pre {{ pulses.isHovered }}
  .h-8.flex.items-center
    .actions.relative(
      v-show="pulses.isHovered.value"
      class="join *:btn *:btn-sm *:text-md")
      button.join-item.btn-square
        i-ph:dots-six-vertical-bold
      //- PulsesViewEditPulsesDialog(
        :model-value="props.pulses.raw_data"
        @update:model-value="onPulsesSave"
        )
      PulsesViewEditPulsesDialog(
        :value="props.pulses.raw_data.toString()"
        @save="onPulsesSave"
        )
        button(class="join-item btn-square")
          i-ph:pencil-simple
        button(class="join-item btn-square hover:btn-error" @click="pulsesStore.remove(props.pulses)")
          i-ph:trash

      DropdownMenuRoot(v-model:open="isDropDownMoreOpen" :default-open="false")
        DropdownMenuTrigger.btn-square.join-item
          i-ph:dots-three-outline-fill
        DropdownMenuPortal
          DropdownMenuContent.DropdownMenuContent
            DropdownMenuArrow(class="fill-base-300")
            DropdownMenuItem.DropdownMenuItem(:disabled="pulses.xOffset.value === 0" @click="pulses.setXOffset(0)")
              i-ph:align-left-simple-fill.mr-2
              | Reset offset
            DropdownMenuSub
              DropdownMenuSubTrigger.DropdownMenuItem(value="more copy")
                i-ph:align-left-simple-fill.mr-2
                | Copy to
                DropdownMenuPortal
                  DropdownMenuSubContent.DropdownMenuContent
                    DropdownMenuItem.DropdownMenuItem(
                      v-if="config.useESP32"
                      @click="copyToSession('ESP32', pulses.toJSON())"
                      ) {{ currentSession === "ESP32" ? "Current" : "ESP32" }}
                    DropdownMenuItem.DropdownMenuItem(
                      v-for="(s, id) in sessions"
                      :key="s"
                      @click="copyToSession(s, pulses.toJSON())"
                      ) {{ currentSession === s ? "Current" : `Session #${id + 1}` }}
                      //- @click="console.log(pulses.toJSON())"
            DropdownMenuSub(v-if="clipboard.isSupported")
              DropdownMenuSubTrigger.DropdownMenuItem(value="more copy")
                i-ph:align-left-simple-fill.mr-2
                | Copy as
                DropdownMenuPortal
                  DropdownMenuSubContent.DropdownMenuContent
                    //- DropdownMenuItem.DropdownMenuItem(@click="copyAs('RFRAW')")
                    //-   | RFRaw
                    DropdownMenuItem.DropdownMenuItem(@click="copyAs('JSON')")
                      | JSON
                    DropdownMenuItem.DropdownMenuItem(@click="copyAs('ARRAY')")
                      | Array
            DropdownMenuItem.DropdownMenuItem(
              @click="pulses.addMeasurement(pulses.data.value.at(0)?.time || 0, pulses.data.value.at(-1)?.time || 0)"
              )
              i-ph:brackets-square-duotone.mr-2
              | Measure all
            DropdownMenuItem.DropdownMenuItem(class="hover:bg-error hover:text-error-content" @click="pulsesStore.remove(props.pulses)")
              i-ph:trash.mr-2
              | Delete
    div(
      v-if="clipboard.copied.value"
      class="whitespace-nowrap flex gap-1 items-center mt-2 ml-2 text-success text-sm")
      //- span
      i-ph:check-circle-bold
      b Copied
    div.ml-auto.text-xs.text-muted.text-right
      div(
        v-if="pulses.rssi"
        ) RSSI: [ {{ pulses.rssi }} dBm]
      div(
        v-if="pulses.rssi"
        ) Created at: {{ pulses.created_at.toLocaleString() }} {{ useTimeAgo(pulses.created_at).value }}

  //- g.pointer-events-none(v-if="m.isHovered.value")
  //- g.pointer-events-none
    foreignObject(
      :width="m.scaledWidth.value * ZT.k"
      :height="bottom - top"
      :transform="`matrix(${1 / ZT.k},0,0,1,0,0)`"
      )
      .pointer-events-autos.h-full
        PulsesViewMeasurementMenu(:m="m")
  div(
    class="h-[100px] relative"
    )
    svg.w-full.h-full(
      v-drag="onItemDrag"
      :viewBox="`${pulses.viewBox.value.x} 0 ${pulses.viewBox.value.w} 100`"
      preserveAspectRatio="none"
      )
      //- :viewBox="`${viewStore.view.viewportLeft.value - pulses.scaledXOffset.value} 0 ${viewStore.view.viewportWidth.value} 100`"
      path.fill-none(
        class="stroke-base-content/60"
        :d="linePath"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
        )
      PulsesViewMeasurementsRects(v-bind="{ pulses }")
      PulsesViewWidthMeasure( v-bind="{ pulses }")

    PulsesViewMeasurementMenu.pointer-events-none(v-bind="{ measurements: pulses.measurements }")
    //- pre {{ props.pulses.viewBox.value.x }}

  PulsesViewMeasurementsDecoders(v-bind="{ pulses: props.pulses }")
</template>
