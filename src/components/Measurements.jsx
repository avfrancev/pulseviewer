import { useGesture, useHover, useDrag } from "@vueuse/gesture"
// import { max } from 'd3-array'
// import { transform } from 'lodash-es'

const measurementHandler = {
  props: {
    m: Object,
    x: String,
    scaledX: String,
    viewStore: Object,
    pulses: Array,
    pulsesStore: Object,
  },
  setup(props) {
    // console.log(props);
    const rRef = ref()
    useGesture(
      {
        onDrag: (e) => {
          // console.log('DRAG');
          // props.m[props.x] += props.viewStore.xScale.invert(e.delta[0]/props.viewStore.state.ZT.k )
          props.m[props.x] += (props.viewStore.pixelRatio * e.delta[0]) / props.viewStore.state.ZT.k
          props.m.isDragging = e.dragging
          e.event.stopImmediatePropagation()
          // pixelRatio.value*s.delta[0]/ZT.k
          // - props.viewStore.xScale(props.pulses.xOffset + props.pulsesStore.minX)
        },
      },
      {
        domTarget: rRef,
      },
    )
    // const x = computed(() => props.m[props.scaledX])

    let x = computed(() => props.viewStore.xScale(props.m[props.x]))
    // let x = computed(() => props.m[props.x] - props.viewStore.xScale(props.pulses.xOffset + props.pulsesStore.minX))
    return () =>
      h("path", {
        // d: `M${props.m[props.x]} 0, L${props.m[props.x]} 100`,
        d: `M${x.value},0 L${x.value},100`,
        "stroke-width": 10,
        // class: props.x === 'x1' ? 'stroke-red-600/10' : 'stroke-green-600/10',
        class: "fill-none2 stroke-transparent cursor-ew-resize",
        ref: rRef,
      })
  },
}

const measurementHandler2 = {
  props: {
    m: Object,
    x: String,
    scaledX: String,
    viewStore: Object,
    pulses: Array,
    pulsesStore: Object,
  },
  setup(props) {
    const rRef = ref()
    useGesture(
      {
        onDrag: (e) => {
          props.viewStore.state.cursor.x = e.event.clientX - props.viewStore.wrapperBounds.left
          e.event.stopImmediatePropagation()
          // console.log(e, e.offset, e.movement, e.memo);
          // if (e.memo === undefined)
          //   e.memo = props.m.minX
          let dx = (props.viewStore.pixelRatio * e.delta[0]) / props.viewStore.state.ZT.k

          // e.movement[0] = 0
          // let firstEl = props.m.pulsesInRange[0]
          // let lastEl = props.m.pulsesInRange[props.m.pulsesInRange.length - 1]
          // // if ((props.m.minX - firstEl?.time) < 100 && (props.m.minX - firstEl?.time) > -100)
          // let xd = Math.abs(e.memo - firstEl?.time)
          // console.log(xd);
          // if ( xd < 100) {
          //   console.log("KAJSDKJASD");
          //   props.m.x1 = firstEl?.time
          //   return e.memo += dx
          // }
          //   props.m.x1 = firstEl?.time
          // console.log(props.m.minX - firstEl?.time);
          props.m[props.x] += dx
          props.m.isDragging = e.dragging
          return e.memo
          // if (props.m[props.x].time - firstEl[props.x].time)
          // console.log(props.x, props.m, firstEl, lastEl);
        },
      },
      {
        domTarget: rRef,
      },
    )
    const x = computed(() => {
      return props.m[props.x] > props.m.minX ? 100 : 0
    })
    return () =>
      <path
        ref={rRef}
        d={`M${x.value},0 L${x.value},100`}
        stroke-width="10"
        class="fill-none stroke-transparent cursor-ew-resize"
      ></path>
  },
}

const Measurement = {
  props: {
    m: Object,
    x: String,
    viewStore: Object,
    pulses: Array,
    pulsesStore: Object,
  },
  setup(props, { slots }) {
    const { m } = props
    const moveHandlerRef = ref()
    const groupRef = ref()

    // const width = computed(() => m.scaledMaxX - m.scaledMinX)

    useGesture(
      {
        onDrag: (e) => {
          props.viewStore.state.cursor.x = e.event.clientX - props.viewStore.wrapperBounds.left
          e.event.stopImmediatePropagation()
          // let dx = props.viewStore.xScale.invert(e.delta[0]/props.viewStore.state.ZT.k - props.viewStore.xScale(props.pulses.xOffset + props.pulsesStore.minX))
          let dx = (props.viewStore.pixelRatio * e.delta[0]) / props.viewStore.state.ZT.k
          // console.log(m);
          // dx += _dx
          // let snap_candidate = 1000 * Math.floor((dx +m.x1)/1000);
          m.isDragging = e.dragging
          m.x1 += dx
          m.x2 += dx
        },
      },
      {
        domTarget: moveHandlerRef,
      },
    )

    useHover(
      (e) => {
        let hasClass = e.event.relatedTarget?.classList?.contains("join")
        if (hasClass) return
        m.isHovered = e.hovering
      },
      {
        domTarget: groupRef,
      },
    )

    watchEffect(() => {
      if (m.isHovered) groupRef.value.focus({ preventScroll: true, focusVisible: false })
      // console.log(m.isHovered);
      // if (m.isDragging) {
      //   m.isHovered = true
      // }
    })

    // const pixelRatio = computed(() => m.scaledWidth / props.viewStore.wrapperBounds.width)
    // watchEffect(() => {
    //   console.log(props.viewStore.wrapperBounds.width, m.scaledWidth, props.viewStore.wrapperBounds.width / m.scaledWidth);
    // })
    const k = computed(() => (10 / m.scaledWidth) * 100 / props.viewStore.state.ZT.k) 
    return () =>
      h(
        "svg",
        {
          onKeydown(e) {
            if (e.key === "d" || e.key === "D") {
              m.remove()
            }
          },
          tabindex: 0,
          style: "overflow: visible;",
          y: 0,
          x: m.scaledMinX,
          width: m.scaledWidth,
          // width: Math.max(m.scaledWidth, 1 / props.viewStore.pixelRatio),
          // width: Math.max(m.scaledMaxX - m.scaledMinX, 0),
          "preserveAspectRatio": "none",
          // viewBox: `0 0 ${m.scaledWidth} 100`,
          viewBox: `0 0 100 100`,
          class: "overflow-visible focus:outline-none",
          "vector-effect": "non-scaling-stroke",
          ref: groupRef,
        },
        [
          h("path", {
            d: `M0 0 L 100 0 L 100 100 L 0 100 Z`,
            opacity: m.isHovered ? 0.2 : 0.1,
            fill: m.color,
          }),
          h("path", {
            d: `M0 0 V 100`,
            stroke: m.color,
          }),
          h("path", {
            d: `M100 0 V 100`,
            stroke: m.color,
          }),
          h("path", {
            // d: `M${m.scaledMinX + Math.min(width.value/2, 7/props.viewStore.state.ZT.k)},100 L${m.scaledMaxX - Math.min(width.value/2, 7/props.viewStore.state.ZT.k)},100`,
            d: `M ${Math.min(50, k.value)} 96 H ${Math.max(50, 100 - k.value)} `,
            stroke: m.color,
            "stroke-width": 8,
            "stroke-linecap": "round",
            class: "cursor-move",
            ref: moveHandlerRef,
          }),
          // h("g", { 
          //   transform: `scale(${1/props.viewStore.state.ZT.k},1)`,
          // }, [
          //   h("text", {
          //     class: "fill-base-content text-xs",
          //     y: 29,
          //   }, "asdasd"),
          // ]),
          h(measurementHandler2, { ...props, x: "x1" }),
          h(measurementHandler2, { ...props, x: "x2" }),
        ],
      )
  },
}

export const PulsesMeasurements = {
  props: {
    pulses: Array,
    viewStore: Object,
    pulsesStore: Object,
  },
  setup(props) {
    // console.log(props.pulses.measurements);
    return () =>
      props.pulses.measurements.map((m, i) => {
        return h(Measurement, { ...props, m, key: m.id })
      })
    // return () => h('g', props.pulses.measurements.map((m,i) => {
    //   return h(Measurement, {...props, m, key: m.id})
    // }))
  },
}
