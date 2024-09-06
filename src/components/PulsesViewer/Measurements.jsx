import { useGesture, useHover, useDrag } from "@vueuse/gesture"

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
    const rRef = ref()
    useGesture(
      {
        onDrag: (e) => {
          props.m[props.x] += (props.viewStore.pixelRatio * e.delta[0]) / props.viewStore.state.ZT.k
          props.m.isDragging = e.dragging
          e.event.stopImmediatePropagation()
        },
      },
      {
        domTarget: rRef,
      },
    )

    let x = computed(() => props.viewStore.xScale(props.m[props.x]))
    return () =>
      h("path", {
        d: `M${x.value},0 L${x.value},100`,
        "stroke-width": 10,
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
          let dx = (props.viewStore.pixelRatio * e.delta[0]) / props.viewStore.state.ZT.k
          props.m[props.x] += dx
          props.m.isDragging = e.dragging
          return e.memo
        },
      },
      {
        domTarget: rRef,
      },
    )
    const x = computed(() => {
      return props.m[props.x] > props.m.minX ? 100 : 0
    })
    return () => (
      <path ref={rRef} d={`M${x.value},0 L${x.value},100`} stroke-width="10" class="fill-none stroke-transparent cursor-ew-resize"></path>
    )
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

    useGesture(
      {
        onDrag: (e) => {
          if (e.event.pressure === 0) return

          props.viewStore.state.cursor.x = e.event.clientX - props.viewStore.wrapperBounds.left
          e.event.stopImmediatePropagation()
          props.viewStore.state.gestures.state.drag.cancel()
          let dx = (props.viewStore.pixelRatio * e.delta[0]) / props.viewStore.state.ZT.k
          m.isDragging = e.dragging
          m.x1 += dx
          m.x2 += dx
        },
      },
      {
        domTarget: moveHandlerRef,
      },
    )

    useGesture(
      {
        onHover: (e) => {
          let hasClass = e.event.relatedTarget?.classList?.contains("join")
          if (hasClass) return
          m.isHovered = e.hovering
        },
      },
      {
        domTarget: groupRef,
      },
    )

    const k = computed(() => ((10 / m.scaledWidth) * 100) / props.viewStore.state.ZT.k)

    watchEffect(() => {
      m.rectRef = groupRef.value
    })
    return () =>
      h(
        "svg",
        {
          onKeydown(e) {
            if (e.key === "d" || e.key === "D") {
              m.remove()
            }
          },
          onFocus() {
            m.selected = true
          },
          onBlur() {
            m.selected = false
          },
          tabindex: 0,
          // style: "overflow: visible;",
          y: 0,
          x: m.scaledMinX,
          width: m.scaledWidth,
          preserveAspectRatio: "none",
          viewBox: `0 0 100 102`,
          // style: {
          //   "box-shadow": "inset 0 -2px 4px rgba(0, 0, 0, 1)"
          // },
          class: "overflow-visible focus:outline-none",
          "vector-effect": "non-scaling-stroke",
          ref: groupRef,
        },
        [
          h("path", {
            d: `M0 0 L 100 0 L 100 100 L 0 100 Z`,
            // opacity: m.isHovered ? 0.2 : 0.1,
            "stroke-width": 1,
            "stroke-alignment": "inner",
            stroke: m.selected ? (m.color + "ff") : (m.color + "00"),
            fill: m.color + (m.isHovered ? "20" : "10"),
          }),
          // h("path", {
          //   d: `M0 0 V 100`,
          //   stroke: m.color,
          // }),
          // h("path", {
          //   d: `M100 0 V 100`,
          //   stroke: m.color,
          // }),
          h("path", {
            d: `M ${Math.min(50, k.value)} 96 H ${Math.max(50, 100 - k.value)} `,
            stroke: m.color,
            "stroke-width": 8,
            "stroke-linecap": "round",
            class: "cursor-move",
            ref: moveHandlerRef,
          }),
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
    return () =>
      props.pulses.measurements.map((m, i) => {
        return h(Measurement, { ...props, m, key: m.id })
      })
  },
}
