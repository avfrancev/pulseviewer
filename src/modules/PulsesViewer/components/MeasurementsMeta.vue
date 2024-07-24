<template lang="pug">
.carousel.carousel-center.w-full.space-x-3.my-2.p-2
  .carousel-item.bg-base-300.text-sm.box-border.flex.p-3.py-3.rounded(
    :class="{'ring ring-secondary/50': m.isHovered}"
    v-for="m in props.measurements"
    :key="m.id"
    v-hover="(e) => {m.isHovered = e.hovering}"
    )
    //- pre {{ m.bits }}
    //- pre {{ m.bytes?.map(b => b.toString(2).padStart(8, '0')).join(' ') }}
    //- pre {{ m.bytes?.map(b => '' + b.toString(16).padStart(2, '0')).join(' ') }}
    //- pre {{ m.reversedBytes?.map(b => '' + b.toString(16).padStart(2, '0')).join(' ') }}
    .wrapper.transition.flex
      .main.flex.flex-col
        .flex.items-baseline.space-x-3
          button(@click="m.changeColor" class="size-4 rounded-full" :style="{'background-color': m.color}")
          pre #[small Δ]T
          pre.text-right.flex-1: b {{ m.width?.toFixed() }} µs
        .grid.grid-cols-2.flex-1.items-center
          pre N#[sub pulses]
          pre.text-right: b {{ m.pulsesInRange.length }}
          pre N#[sub falling]
          pre.text-right: b {{ m.Nfalling }}
          pre N#[sub rising]
          pre.text-right: b {{ m.Nrising }}
          //- pre {{ m.rangeIds }}
          pre #[i &#402;]#[sub min]
          pre.text-right: b {{ m.minmaxFreq[0] }} µs
          pre #[i &#402;]#[sub max]
          pre.text-right: b {{ m.minmaxFreq[1] }} µs
          //- pre {{ m.averageTime }}
          pre #[i &#402;]#[sub baud]
          pre.text-right: b {{ m.baud }}
        .join.flex.mt-2
          button.join-item.btn-xs.btn.flex-1(@click="m.locate")
            i-lucide:locate-fixed
          button.join-item.btn-xs.btn.flex-1(
            @click="m.remove"
            class="hover:btn-error")
            i-tabler:trash
          button.join-item.btn-xs.btn.flex-1(@click="m.descOpened = !m.descOpened")
            i-mingcute:right-fill(v-if="!m.descOpened")
            i-mingcute:left-fill(v-if="m.descOpened")
      .ml-4.more.transition(v-show="m.descOpened")
        .flex.items-baseline
          pre CKMean clusters:
          input.input.input-xs.input-ghost.w-12.bold.flex-none(type="number" v-model.number="m.statistics.ckmeansClustersCount" min="2" max="10")
        
        div(v-for="c,i in m.statistics.ckmeans_mean" :key="i")
          pre.text-xs {{ c.val.toFixed() }} µs
          div(class="h-[1px] mb-[1px] transition-all duration-100 rounded-full" :style="{'background-color': m.color, 'width': `${c.percent}%`}")
          //- pre {{ c.percent }}
        //- .bg-base-200.rounded-full(
          v-for="c in m.statistics.ckmeans_mean" :key="c"
          ) {{ c }}
        //- pre {{ m.statistics.ckmeans_mean }}
        //- pre {{ m.statistics.ckmeans_avg }}
</template>

<script setup>
const props = defineProps({
  measurements: Array,
})
</script>
