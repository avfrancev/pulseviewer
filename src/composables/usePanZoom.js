import { useGesture } from "@vueuse/gesture"
import { inertia } from "popmotion"
import { defineStore } from "pinia"
import { ZoomTransform } from "d3-zoom"
import { animate, easeInOut } from "popmotion"

export const useGestures = (props) => {
  const { ZT, wrapperBounds } = props

  const gestures = useGesture(
    {
      onMove(e) {
        props.viewState.cursor.x = e.event.clientX - wrapperBounds.value.left
      },
      onDblclick: (e) => {
        let x = e.event.clientX - wrapperBounds.value.left
        const scaleFactor = Math.exp(e.shiftKey ? -0.5 : 0.5)
        let newZT = ZT.getScaleToPointX(scaleFactor, x)
        ZT.animateTo(newZT)
      },
      onWheel: (e) => {
        if (e.delta[0] !== 0) {
          e.event.preventDefault()
          ZT.translateBy(e.delta[0])
        }
        if (!e.event.shiftKey) return
        if (e.delta[1] !== 0) {
          e.event.preventDefault()
          let x = e.event.clientX - wrapperBounds.value.left
          const scaleFactor = Math.exp(e.delta[1] * -0.001)
          ZT.scaleToPointX(scaleFactor, x)
        }
      },
      onDrag: (e) => {
        if (e.last) {
          inertia({
            velocity: e.vxvy[0] * e.distance,
            from: ZT.x,
            power: 0.9,
            timeConstant: 50,
            onUpdate: (v) => ZT.translateBy(v - ZT.x),
          })
          return
        }
        if (e.dragging) {
          // console.log("DRAGGING")
          ZT.translateBy(e.delta[0], e.delta[1])
        }
      },
      onPinch: (e) => {
        let x = e.origin[0] - wrapperBounds.value.left
        if (e.pinching && e.touches === 2) {
          gestures.state.drag.cancel()

          let w = wrapperBounds.value.width
          let dx = e.delta[0]
          let s = (w + dx * 2) / w

          ZT.scaleToPointX(s, x)
          return
        } else if (e.pinching) {
          gestures.state.wheel.cancel()
          if (e.delta[2] !== 0) {
            e.event.preventDefault()
            // let x = props.mouse.elementX.value
            const scaleFactor = Math.exp(e.delta[1] * -0.005)
            ZT.scaleToPointX(scaleFactor, x)
          }
        }
      },
    },
    {
      drag: {
        lockDirection: true,
        useTouch: true,
        preventWindowScrollY: true,
      },
      wheel: {
        lockDirection: true,
        passive: true,
      },
      eventOptions: { passive: false },
    },
  )
  watchEffect(() => {
    gestures.config.domTarget = props.wrapper.value
    // HACK
    gestures.clean()
    gestures.bind()
  })

  return gestures
}

function constrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
    dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0]
  // dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
  // dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    // dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
    0,
  )
}

export default ({ wrapper, wrapperBounds, viewState }) => {
  const ZT = reactive(new ZoomTransform(1, 0, 0))

  // ZT.wrapperSel = computed(() => select(wrapper.value))

  ZT.translateBy = function (xOffset = 0, yOffset = 0) {
    // console.log(store.state.wrapperBounds.width);
    let { width, height } = wrapperBounds.value
    // height = 1000
    let translateExtent = [
      [0, 0],
      [width, height],
    ]
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

  ZT.getScaleToPointX = function (scaleFactor, p0) {
    let scaleExtent = [1, 1000]
    let p1 = this.invertX(p0)
    let newZT = this.scale(scaleFactor)
    newZT.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], newZT.k))
    return {
      k: newZT.k,
      x: p0 - p1 * newZT.k,
    }
  }

  ZT.scaleToPointX = function (scaleFactor, p0) {
    let newZT = ZT.getScaleToPointX(scaleFactor, p0)
    Object.assign(ZT, newZT)
    this.translateBy(0)
  }

  ZT.animateTo = function (to) {
    animate({
      from: { k: ZT.k, x: ZT.x },
      to: to,
      ease: easeInOut,
      onUpdate: (v) => {
        Object.assign(ZT, v)
        this.translateBy(0)
      },
    })
  }

  const gestures = useGestures({ wrapper, wrapperBounds, ZT, viewState })

  return { ZT, gestures }
}
