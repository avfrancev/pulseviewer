import { bisector, extent, sum } from "d3-array"
import { v4 as uuidv4 } from "uuid"
import { Measurement } from "./Measurements"
// import { pick } from "~/utils"
import type { PulsesStore } from "../store/pulses.store"
// import { PulsesStore } from "../store"
// import { currentPulsesStore } from "../stores/pulses.store"

export interface PulsesItem {
  level: number
  time: number
  width: number
  scaledTime: number
  scaledWidth: number
}

export type PulsesStorage = ReturnType<Pulses["toJSON"]>

export class Pulses {
  id = uuidv4()
  raw_data = shallowReactive<number[]>([])
  xOffset = ref(0)
  isHovered = ref(false)
  rssi: number | null = null
  pulsesStore: PulsesStore
  measurements = shallowReactive(new Set<Measurement>())

  constructor(pulsesStore: PulsesStore, p: PulsesStorage) {
    this.pulsesStore = pulsesStore
    Object.assign(this.raw_data, p.raw_data)
    this.xOffset.value = p.xOffset
    if (p.rssi)
      this.rssi = p.rssi
    const measurements = Array.from(p.measurements || [])
    if (measurements.length) {
      for (const m of measurements) {
        this.addMeasurement(m.x1, m.x2, m.color)
      }
    }
  }

  timeBisector = bisector((d: PulsesItem) => d.time)
  sum = computed(() => sum(this.raw_data))
  xScale = computed(() => { return this.pulsesStore.xScale.value })
  scaledXOffset = computed(() => this.xScale.value(this.xOffset.value + this.pulsesStore.minX.value))
  pulsesWidthExtent = computed(() => extent(this.raw_data))
  // get minPulseWidth() { return this.pulsesWidthExtent.value[0] }
  // get maxPulseWidth() { return this.pulsesWidthExtent.value[1] }
  raw_dataSorted = computed(() => this.raw_data.toSorted((a, b) => a - b))
  minPulseWidth = computed(() => {
    for (const p of this.raw_dataSorted.value) {
      if (p !== 0)
        return p
    }
    return Infinity
  })

  data = computed<PulsesItem[]>(() => {
    const startLevel = 0
    if (this.raw_data[this.raw_data.length - 1] !== 0)
      this.raw_data.push(0)
    let time = 0
    return this.raw_data.map((d, i) => {
      if (i !== 0)
        time += this.raw_data[i - 1]
      // return { level: (i + startLevel) % 2, width: d, time, scaledTime: this.pulsesStore.xScale.value(time) || 0, scaledWidth: this.pulsesStore.xScale.value(d) || 0 }
      return { level: (i + startLevel) % 2, width: d, time, scaledTime: this.xScale.value(time) || 0, scaledWidth: this.xScale.value(d + this.pulsesStore.minX.value) || 0 }
    })
  })

  get view() { return this.pulsesStore.view }
  viewBox = computed<{ x: number, w: number }>(() => {
    // let xOffset = computed(() => pulsesStore.active.xScale(state.xOffset + pulsesStore.active.minX))
    const ZT = this.view.ZT
    const x = -ZT.x / ZT.k - this.scaledXOffset.value
    const w = this.view.elBounds.width.value / ZT.k
    return { x, w }
  })

  remove() {
    for (const m of this.measurements) m.remove()
  }

  setIsHovered(hovering: boolean) {
    this.isHovered.value = hovering
  }

  setXOffset(x: number) {
    this.xOffset.value = x
  }

  setRawData(data: number[]) {
    this.raw_data.splice(0, this.raw_data.length, ...data)
  }

  addMeasurement(x1: number, x2: number, color?: string) {
    const m = new Measurement(this, x1, x2, color)
    this.measurements.add(m)
    return m
  }

  toJSON() {
    return {
      raw_data: this.raw_data,
      xOffset: toValue(this.xOffset),
      rssi: this.rssi,
      // measurements: Array.from(this.measurements as unknown as MeasurementStorage[]),
      measurements: Array.from(this.measurements, m => m.toJSON()),
    }
  }
}
