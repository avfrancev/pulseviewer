import { scaleLinear, scaleOrdinal, tickFormat } from "d3-scale"
import { animate, easeInOut } from "popmotion"
import { ZoomTransform } from "d3-zoom"

import { usePulsesStore } from "@/models"
import usePanZoom from "@/composables/usePanZoom"

export default (key = 0) => {
  const pulsesStore = usePulsesStore(key)

  const wrapper = ref(null)
  const wrapperBounds = ref({
    width: ref(11),
  })

  const state = reactive({
    ZT: { k: 1, x: 0, y: 0 },
    cursor: {
      x: 10,
      y: 0,
      xCom: computed(() => state.cursor.x - state.ZT.x),
      xLabel: computed(() => xScale.value.invert((state.cursor.x - state.ZT.x) / state.ZT.k).toFixed(0)),
    },
    viewportLeft: computed(() => -state.ZT.x / state.ZT.k),
    viewportRight: computed(() => wrapperBounds.value.width / state.ZT.k + state.viewportLeft),
  })

  function isPointInView(x) {
    return x >= state.viewportLeft && x <= state.viewportRight
  }
  function isRangeInView(x1, x2) {
    return state.viewportLeft < x2 && x1 < state.viewportRight
  }

  const panZoom = usePanZoom({ wrapper, wrapperBounds, viewState: state })
  state.ZT = panZoom.ZT
  state.gestures = panZoom.gestures
  const xScale = ref(scaleLinear())

  const pixelRatio = computed(() => {
    let xs = xScale.value.copy()
    return (Math.abs(xs.domain()[0]) + xs.domain()[1]) / wrapperBounds.value.width
  })

  watch(
    () => [wrapperBounds.value.width, pulsesStore.minX, pulsesStore.maxX],
    () => {
      xScale.value = scaleLinear([pulsesStore.minX, pulsesStore.maxX], [0, wrapperBounds.value.width])
    },
    { immediate: true },
  )

  return {
    wrapper,
    wrapperBounds,
    state,
    xScale,
    pixelRatio,
    isPointInView,
    isRangeInView,
  }
}
