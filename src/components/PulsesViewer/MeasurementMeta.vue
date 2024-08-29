<template lang="pug">
div(
  class="text-sm box-border flex p-3 py-3 rounded bg-base-300/90 backdrop-blur transition-all duration-200"
  :class="[m.isHovered && 'ring ring-secondary/50', config.pinMeasurements && 'shadow-lg']"
  v-hover="(e) => { m.isHovered = e.hovering }")
  div(class="wrapper flex transition-all" :ref="(e) => (m.measurementCardRef = e)")
    div(class="main flex flex-col")
      div(class="flex items-baseline space-x-3")
        button(
          class="size-4 rounded-full"
          @click="m.changeColor"
          :style="{'background-color': m.color}")
        pre #[small Δ]T
        pre: b {{m.width?.toFixed()}} µs
      div(class="[&>*:nth-child(even)]:text-right flex-1 grid grid-cols-2 items-center")
        pre N#[sub pulses]
        pre: b {{m.pulsesInRange.length}}
        pre N#[sub falling]
        pre: b {{m.Nfalling}}
        pre N#[sub rising]
        pre: b {{m.Nrising}}
        //- pre {{ m.rangeIds }}
        pre #[i &#402;]#[sub min]
        pre: b {{m.minmaxFreq[0]}} µs
        pre #[i &#402;]#[sub max]
        pre: b {{m.minmaxFreq[1]}} µs
        //- pre {{ m.averageTime }}
        pre #[i &#402;]#[sub baud]
        pre: b {{m.baud}}
      div(class="join flex mt-2")
        button(class="join-item btn-xs btn flex-1" @click="m.locate")
          i-lucide:locate-fixed
        button(class="join-item btn-xs btn flex-1 hover:btn-error" @click="m.remove")
          i-tabler:trash
        button(class="join-item btn-xs btn flex-1" @click="m.descOpened = !m.descOpened")
          i-mingcute:right-fill(v-if="!m.descOpened")
          i-mingcute:left-fill(v-if="m.descOpened")
    div(class="flex flex-col" v-show="m.descOpened")
      div(class="ml-4 mb-2 join flex justify-stretch")
        button(
          class="join-item btn btn-xs"
          :class="{'btn-active btn-secondary': m.decoder.pickedSlicer === s}"
          v-for="s in m.decoder.slicers"
          :key="s"
          @click="() => (m.decoder.pickedSlicer = s)") {{s}}
      div(class="flex-1 ml-4 more flex flex-col overflow-hidden max-w-lg overflow-x-auto text-xs")
        div(class="flex join")
        p(class="font-mono text-nowrap" v-if="m.decoder.guess")
        p
          |#[b Timings]:
          //- | [ {{m.decoder.guess?.modulation}} ]
          | {{m.decoder.guess?.short && "short: " + m.decoder.guess.short.toFixed(1)}}
          | {{m.decoder.guess?.long && "long: " + m.decoder.guess.long.toFixed(1)}}
          | {{m.decoder.guess?.sync && "sync: " + m.decoder.guess.sync.toFixed(1)}}
          | {{m.decoder.guess?.gap && "gap: " + m.decoder.guess.gap.toFixed(1)}}
          | {{m.decoder.guess?.reset && "reset: " + m.decoder.guess.reset.toFixed(1)}}
        pre #[b Guessing modulation]: {{m.decoder.guess?.name}}
        pre #[b DC bias (Pulse/Gap skew)]: {{(m.decoder.analyzer?.pulse_gap_skew * 100 || 0).toFixed(1)}}%
        pre #[b RfRaw (rx)]: {{m.decoder.analyzer?.rfrawB1}}
        pre #[b RfRaw (tx)]: {{m.decoder.analyzer?.rfrawB0}}
        pre(class="text-balances") #[b Bits]: {{m.decoder.sliceGuess?.hex}}
</template>

<script setup>
  const props = defineProps({
    m: Object,
    viewStore: Object,
  })

  import useConfig from "@/stores/config"

  const { config } = useConfig()
</script>
