import { defineStore } from 'pinia'
import { ZoomTransform } from "d3-zoom"
import { animate, easeInOut } from "popmotion"

import useGestures from '../composables/useGestures'


function constrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
    dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0]
    // dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
    // dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    // dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
    0
  );
}

export default ({ wrapper, wrapperBounds, viewState }) => defineStore(`panzoom-store`, () => {

  const ZT = reactive(new ZoomTransform(1, 0, 0))
  
  // ZT.wrapperSel = computed(() => select(wrapper.value))

  ZT.translateBy = function(xOffset=0, yOffset=0) {
    // console.log(store.state.wrapperBounds.width);
    let { width, height } = wrapperBounds.value
    // height = 1000
    let translateExtent = [[0, 0], [width, height]]
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

    this.x += xOffset
    this.y += yOffset
    this.y = clamp(this.y, height - viewState.fullCanvasHeight, 0)
    // this.y = Math.max(0, 200)
    let constrained = constrain(this, translateExtent, translateExtent)
    Object.assign(this, constrained)
    // props.xScale.value = ZT.rescaleX(props.xScaleOrigin.value)
    // console.log(store.xScale, store.xScaleOrigin);
    // store.xScale = ZT.rescaleX(store.xScaleOrigin)

  }

  ZT.scaleToPointX = function (scaleFactor, p0) {
    let scaleExtent = [1, 1000]
    // let translateExtent = [[0, 0], [wrapperBounds.width.value, wrapperBounds.height.value]]

    let p1 = this.invertX(p0)
    let newZT = this.scale(scaleFactor)
    newZT.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], newZT.k));
    Object.assign(this, newZT)
    this.x = p0 - p1 * ZT.k
    this.translateBy(0)
    // let constrained = constrain(this, translateExtent, translateExtent)
    // Object.assign(this, constrained)
    // props.xScale.value = ZT.rescaleX(props.xScaleOrigin.value)
  }

  ZT.animateTo = function(to) {
    animate({
      from: {k: ZT.k, x: ZT.x},
      to: to,
      ease: easeInOut,
      onUpdate: (v) => {
        Object.assign(ZT, v)
      }
    })
  }

  // watchEffect(() => {
  //   console.log(wrapper);
  // })
  const gestures = useGestures({ZT, wrapper, wrapperBounds, viewState})


  return {ZT, gestures}
})
