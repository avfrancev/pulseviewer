import { defineStore } from 'pinia'
// import { extent, sum, cumsum, bisect, quantile, mean } from "d3-array"
import { scaleLinear, scaleOrdinal, tickFormat } from "d3-scale"
import { ZoomTransform } from "d3-zoom"
import { animate, easeInOut } from "popmotion"



import { usePulsesStore } from './index.js'
import useGestures from '../composables/useGestures'
import usePanZoomStore from './panzoom'


export default defineStore(`view-store`, () => {
  const pulsesStore = usePulsesStore()

  const canvas = ref(null)
  const wrapper = ref(null)
  // const wrapperBounds = {
  const wrapperBounds = ref({
    width: ref(0),
  })

  const state = reactive({
    ZT: {k:1, x:0, y:0},
    cursor: {
      x: 10, y: 0,
      xCom: computed(() => state.cursor.x - state.ZT.x),
      xLabel: computed(() => xScale.value.invert((state.cursor.x - state.ZT.x) / state.ZT.k).toFixed(0)),
    },
    viewportLeft: computed(() => -state.ZT.x / state.ZT.k),
    viewportRight: computed(() => wrapperBounds.value.width / state.ZT.k + state.viewportLeft),
  })

  function isPointInView(x) {
    // const ZT = state.ZT
    // let l = - ZT.x/ZT.k
    // let r = wrapperBounds.value.width/ZT.k + l
    return x >= state.viewportLeft && x <= state.viewportRight
  }
  function isRangeInView(x1,x2) {
    return state.viewportLeft < x2 && x1 < state.viewportRight
  }


  const panZoomStore = usePanZoomStore({ canvas, wrapper, wrapperBounds, viewState: state })()
  state.ZT = panZoomStore.ZT
  state.gestures = panZoomStore.gestures
  // console.log(state.ZT);
  // const xScaleOrigin = ref(null)
  const xScale = ref(scaleLinear())

  const pixelRatio = computed(() => {
    let xs = xScale.value.copy()
    return (Math.abs(xs.domain()[0]) + xs.domain()[1]) / wrapperBounds.value.width
  })


  watch(() => [wrapperBounds.value.width, pulsesStore.minX, pulsesStore.maxX], () => {
    // console.log('xScale', pulsesStore.maxX);
    // xScale.value = scaleLinear([pulsesStore.minX, pulsesStore.maxX], [0, wrapperBounds.value.width])
    xScale.value = scaleLinear([pulsesStore.minX, pulsesStore.maxX], [0, wrapperBounds.value.width])
    // if (!xScaleOrigin.value?.domain()[1]) xScaleOrigin.value = xScale.value.copy()
    // xScaleOrigin.value = xScale.value.copy()
    // xScale.value = state.ZT.rescaleX(xScaleOrigin.value)
    // xScale.value = state.ZT.rescaleX(xScale.value)
  }, { immediate: true })

  // watch(() => [wrapperBounds.value.width, ], () => {
  //   console.log(wrapperBounds.value.width);
  //   xScale.value = scaleLinear([pulsesStore.minX, pulsesStore.maxX], [0, wrapperBounds.value.width])
  //   xScaleOrigin.value = xScale.value.copy()
  //   xScale.value = state.ZT.rescaleX(xScaleOrigin.value)
  // }, { immediate: true })

  // pulsesStore.viewState = {
  //   ZT: toRef(state, 'ZT'),
  //   xScale,
  // }

  return {
    canvas, wrapper, wrapperBounds,
    state,
    xScale,
    pixelRatio,
    isPointInView,
    isRangeInView,
  }
})