import { useGesture } from "@vueuse/gesture"
import { inertia } from "popmotion"

// import { usePulsesStore } from '/src/stores/pulses'

export default (props) => {
  const { ZT, wrapperBounds } = props
  // const { tz } = store
  // const pulsesStore = usePulsesStore()
  // console.log(tz, domTarget);

  onMounted(() => {
    const gestures = useGesture(
      {
        onMove(e) {
          // console.log(e, props.viewState.cursor );
          //- v-move="(e) => {cursor.x = (e.event.clientX - viewStore.wrapperBounds.left ) }"
          // console.log(wrapperBounds.value.left);
          props.viewState.cursor.x = e.event.clientX - wrapperBounds.value.left
        },
        onDblclick: (e) => {
          let x = e.event.clientX - wrapperBounds.value.left
          const scaleFactor = Math.exp(e.shiftKey ? -0.5 : 0.5)
          let newZT = ZT.getScaleToPointX_ZT(scaleFactor, x)
          ZT.animateTo(newZT)
          // ZT.scaleToPointX(scaleFactor, x)
        },
        onWheel: (e) => {
          // console.log(e);
          // return
          if (e.delta[0] !== 0) {
            e.event.preventDefault()
            ZT.translateBy(e.delta[0])
          }
          if (!e.event.shiftKey) return
          if (e.delta[1] !== 0) {
            e.event.preventDefault()
            // let x = store.state.mouse.elementX
            let x = e.event.clientX - wrapperBounds.value.left
            const scaleFactor = Math.exp(e.delta[1] * -0.001)
            ZT.scaleToPointX(scaleFactor, x)
          }
        },
        onDrag: (e) => {
          // console.log(e);
          // if (e.metaKey || e.shiftKey) {
          //   // store.state.data.xOffset += e.delta[0] * (pulsesStore.maxSum / 1008) / tz.k
          //   console.log("NEED TO IMPLEMENT!");
          //   return
          // }
          if (e.last) {
            // console.log(e.last);
            // tz.translateBy(e.delta[0])
            // let ina = inertia({ velocity: 200, from: 50, onUpdate: (v) => tz.translateBy(v) })
            // let lastv = e.vxvy[0]
            inertia({
              // velocity: e.vxvy[0]*120/tz.k,
              velocity: e.vxvy[0] * e.distance,
              from: ZT.x,
              // from: 0,
              power: 0.9,
              timeConstant: 50,
              onUpdate: (v) => ZT.translateBy(v - ZT.x),
            })
            return
          }
          if (e.dragging) {
            ZT.translateBy(e.delta[0], e.delta[1])
            // console.log(ina);
            // .start(v => console.log(v))
          }
        },
        onPinch: (e) => {
          // return
          // onPinch: (e) => {
          //   console.log(e, 'pich');
          //   let x = e.origin[0] - props.wrapperBounds.left.value
          //   if (e.touches === 0) {
          //     const scaleFactor = Math.exp(e.delta[1] * -0.01)
          //     tz.scaleToPointX(scaleFactor, x)
          //   } else if (e.touches === 2) {
          //     // tz.translateBy(e.delta[0])
          //     // const scaleFactor = Math.exp(e.delta[0] * 0.01)
          //     const scaleFactor = (1 - e.vdva[0])
          //     tz.scaleToPointX(scaleFactor, x)

          //   }
          //   // console.log(e.origin, props.mouse.elementX.value, xx);

          // }
          // console.log(e.da);
          // return
          // console.log(e.origin);
          // let lastDx
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
        // onMove: (e) => {}
      },
      {
        // domTarget: props.wrapper,
        // domTarget: domTarget,
        drag: {
          // delay: 1000,
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
  })

  watchEffect(() => {
    gestures.config.domTarget = props.wrapper.value
    // HACK
    gestures.clean()
    gestures.bind()
  })

  return gestures
}
