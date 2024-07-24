import { select, pointer } from "d3-selection"
import { zoom, ZoomTransform, zoomIdentity } from "d3-zoom"
import { extent, sum, cumsum, bisect, bisector, quantile, mean } from "d3-array"
import { interpolateRainbow } from 'd3-scale-chromatic'
import { clamp } from 'lodash-es'
import Measurements from "./Measurements"

export default  (props) => {

  const {
    data,
    cumsumData,
    t, sizes,
    xScaleOrigin,
    svgEl,
    svgElWrapperSel,
    zoomObj,
    svgElBounds,
  } = props

  const measurements = reactive([])
  const measurementsSorted = computed((e) => measurements.sort((a,b) => a.selection.minX - b.selection.minX))

  const Measurements = () => {
    // return h('div', 'LALALA')
    const rect = (m) => {
      // const state = reactive({
      //   isMoving: false,
      // })
      let handlePointerMoveFn, handlePointerUpFn

      const handlePointerMove = (type, e) => {
        const [x,y] = t.invert(pointer(e, svgEl.value))
        let dx = x - m.sp[0]
        dx *= t.k
        let x1 = clamp(m.origin[0] + dx,0,svgElBounds.width.value)
        let x2 = clamp(m.origin[1] + dx,0,svgElBounds.width.value)
        if (type == 'resize-x1') {
          m.x1 = x1 
          return
        }
        if (type == 'resize-x2') {
          m.x2 = x2 
          return
        }
        let w = Math.abs(m.x1 - m.x2)
        if (x1 === 0 || x1 === svgElBounds.width.value) {
          m.x1 = x1
          m.x2 = m.x1 + ( x1 === 0 ? w : -w )
          return
        }
        if (x2 === 0 || x2 === svgElBounds.width.value) {
          m.x2 = x2
          m.x1 = m.x2 + ( x2 === 0 ? w : -w )
          return
        }
        m.x1 = x1 
        m.x2 = x2 
      }


      const handlePointerUp = (e) => {
        document.removeEventListener("pointermove", handlePointerMoveFn)
        document.removeEventListener("pointerup", handlePointerUp)
      }
      
      const handlePointerDown = (type, e) => {
        m.sp = t.invert(pointer(e, svgEl.value))
        m.origin = [m.x1,m.x2]
        handlePointerMoveFn = handlePointerMove.bind(null, type)
        document.addEventListener("pointermove", handlePointerMoveFn)
        document.addEventListener("pointerup", handlePointerUp)
      }

      
      const p = h('g', {
        onPointerenter: (e) => m.hovered = true,
        onPointerleave: (e) => m.hovered = false,
        measurementId: m.selection.measurementId,
        },
        h('path', {
          d: `M ${m.x1} 0 V 200 H ${m.x2} V 0`,
          // class: 'pointer-events-none',
          isMeasurement: 'true',
          measurementId: m.selection.measurementId,
          mask: "url(#stripe-mask2)",
          fill: m.color,
          style: {
            opacity: 0.5,
            // fill: m.color,
            // fill: "url(#pattern_stripe_lines)",
          },
        }),
  
        h('g',
          {class: 'group'},
          [
            h('path', {
              d: `M ${Math.min(m.x1,m.x2) + 10/t.k} ${sizes.bottom.y + sizes.bottom.height/2} H ${Math.max(m.x1,m.x2) - 10/t.k}`,
              'stroke-width': "3",
              'stroke-linecap': 'round',
              // class: 'hover:stroke-base-content/50 cursor-move',
              class: 'group-hover:brightness-200s transition',
              style: {
                cursor: 'move',
                opacity: 1,
                stroke: m.color,
              },
              // onPointerdown: handlePointerDown.bind(null, 'move')
            }),
            h('path', {
              d: `M ${Math.min(m.x1,m.x2) + 10/t.k} ${sizes.bottom.y + sizes.bottom.height/2} H ${Math.max(m.x1,m.x2) - 10/t.k}`,
              'stroke-width': "20",
              'stroke-linecap': 'round',
              // class: 'hover:stroke-base-content/50 cursor-move',
              style: {
                cursor: 'move',
                opacity: 0,
                stroke: m.color,
              },
              onPointerdown: handlePointerDown.bind(null, 'move'),
              // onclick: () => m.selected = !m.selected
            }),
          ]
        ),      
        h('g',
          {class: 'group'},
          [h('path', {
            'stroke-width': "2",
            // class: 'stroke-orange-600 group-hover:stroke-orange-300 cursor-col-resize',
            d: `M ${m.x1} 0 V 200`,
            style: { cursor: 'col-resize', opacity: 0.5, stroke: m.color, },
            // onPointerdown: handlePointerDown.bind(null, "resize-x1")
          }),
          h('path', {
            'stroke-width': "12",
            class: 'stroke-transparent cursor-col-resize',
            d: `M ${m.x1} 0 V 200`,
            onPointerdown: handlePointerDown.bind(null, "resize-x1")
          })]
        ),
        h('g',
          {class: 'group'},
          [h('path', {
            'stroke-width': "2",
            // class: 'stroke-orange-600 group-hover:stroke-orange-300 cursor-col-resize',
            d: `M ${m.x2} 0 V 200`,
            style: { cursor: 'col-resize', opacity: 0.5, stroke: m.color, },
            // onPointerdown: handlePointerDown.bind(null, "resize-x2")
          }),
          h('path', {
            'stroke-width': "12",
            class: 'stroke-transparent cursor-col-resize',
            d: `M ${m.x2} 0 V 200`,
            onPointerdown: handlePointerDown.bind(null, "resize-x2"),
          })]
        ),
        // h('path', {
        //   'stroke-width': "6",
        //   class: 'stroke-red-600 hover:stroke-red-300 cursor-col-resize',
        //   d: `M ${m.x2} 0 V 200`,
        //   onPointerdown: handlePointerDown.bind(null, "resize-x2")
        //   // onPointerDown: handlePointerDown.bind(null, "resize")
        // }),
      )
      return p
    }
    return h('g', {class: 'measurements'}, measurements.map((m) => {
      return rect(m)
    }))
  }

  const colors = Array.from(Array(10)).map((d,i) => {
    return interpolateRainbow(i/10)
  })


  // console.log(colors);

  // function getColor() {
  //   let cf = colors.filter((d) => {
  //     measurements.
  //   })
  //   // let color = interpolateRainbow((measurements.length + i) / 8)
  //   // if (measurements.some((m) => m.color === color))
  //   //   return getColor(i+1)
  //   return color % 10
  // }

  let createMeasurementCounter = 0

  function createMeasurement(x1=0,x2=100,color='red') {
    const state = reactive({
      x1,x2,color,
      width: computed(() => Math.abs(state.x1 - state.x2)),
      selected: false,
      // color: getColor(),
      // color: interpolateRainbow(measurements.length / 8),
      color: colors[(createMeasurementCounter++) % 10],
      // maxX: computed(() => Math.max(state.x1,state.x2)),
      locateMeasurement: () => {
        let s = svgElBounds.width.value / state.width * 0.9
        let z = zoomIdentity.scale(s)
        z = z.translate(-(state.selection.minX - ( state.width * 0.05)),0)
        svgElWrapperSel.value.transition().duration(2000).call(zoomObj.value.transform, z)
      },
      remove: () => {
        measurements.splice(measurements.indexOf(state),1)
      },
      selection: computed(() => {
        // let b = bisect(cumsumData.value, o.x1)
        const scaledX1 = xScaleOrigin.value.invert(state.x1)
        const scaledX2 = xScaleOrigin.value.invert(state.x2)
        const scaledMinX = Math.min(scaledX1,scaledX2)
        const scaledMaxX = Math.max(scaledX1,scaledX2)
        const minX = Math.min(state.x1,state.x2)
        const maxX = Math.max(state.x1,state.x2)

                
        // const minX = Math.min(state.x1,state.x2)
        // const maxX = Math.max(state.x1,state.x2)
        const dT = xScaleOrigin.value.invert(state.width)
        // let rangeIds = [bisect(cumsumData.value, scaledMinX), bisect(cumsumData.value, scaledMaxX)].sort((a,b) => a-b)
        const pulsesBisect = bisector(d => d.time).left
        // console.log(pulsesBisect);
        let rangeIds = [pulsesBisect(data.value, scaledMinX), pulsesBisect(data.value, scaledMaxX)].sort((a,b) => a-b)
        // console.log(rangeIds);
        const pulses = data.value.slice(rangeIds[0], rangeIds[1])
        const minmaxFreq = extent(pulses, (d) => d.width)
        const averageTime = pulses.reduce((acc, curr) => acc + curr.width, 0) / pulses.length
        // quantile @pulses.value.map((d)->d.w), 0.05
        const Nfalling = pulses.filter((d) => d.level === 0).length 
        const Nrising = pulses.filter((d) => d.level === 1).length 
        const q = quantile(pulses.map((d) => d.width), 0.05)
        const baud = parseInt(1 / q*1000*1000)
        const measurementId = measurements.indexOf(state)

        // ΔT	0.9024258921333334	s
        // Nfalling	278
        // Nrising	279	
        // fmin	160.86998487821955	Hz
        // fmax	5871.9906048146295	Hz
        // fmean	309.09818270282125	Hz
        // Tstd	0.0013018705305734958	s
        // fbaud	17857.142857131003	Hz
        // Pmin	0.00035439999999994145	s
        // Pmean	0.0032407480144404327	s
        // PSDev	0.0013422704540369177	s
        // Pmax	0.006492899999999963	s
        // Count	277	

        // console.log(pulses.length);
        // console.log(averageTime, q);
        // console.log(dT / 1000_000, q);
        return {
          measurementId,
          averageTime,
          scaledX1,scaledX2,dT,
          minX, maxX,
          rangeIds,
          Nfalling, Nrising,
          pulses,
          minmaxFreq,
          baud,
        }
      })
    })
    return state
  }

  return {
    Measurements,
    measurements,
    measurementsSorted,
    createMeasurement,
  }
}


// ΔT	0.9024258921333334	s
// Nfalling	278	
// Nrising	279	
// fmin	160.86998487821955	Hz
// fmax	5871.9906048146295	Hz
// fmean	309.09818270282125	Hz
// Tstd	0.0013018705305734958	s
// fbaud	17857.142857131003	Hz
// Pmin	0.00035439999999994145	s
// Pmean	0.0032407480144404327	s
// PSDev	0.0013422704540369177	s
// Pmax	0.006492899999999963	s
// Count	277	
