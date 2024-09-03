<template lang="pug">

//- pre {{ bitsHintsSource.length }}
div(ref="wrapper" class="border")
  canvas(ref="canvas" class="w-full h-32")
</template>

<script setup lang="jsx">
  import paper from "paper/dist/paper-core"
  import { useGesture } from "@vueuse/gesture"
  import { scaleLinear } from "d3-scale"

  import useSessionStore from "@/stores/sessions"
  import useConfigStore from "@/stores/config"

  // import { PulsesMeasurements } from "./Measurements"
  import { usePulsesStore } from "@/models"

  const props = defineProps({
    pulses: {
      type: Array,
      default: [],
    },
    viewStore: {
      type: Object,
      default: {},
    },
    pulsesStore: {
      type: Object,
      default: {},
    },
  })

  const { config } = useConfigStore()

  // const viewStore = useViewStore(props.session.id)
  // const pulsesStore = usePulsesStore(props.session.id)
  const { pulses, viewStore } = props
  const { ZT } = props.viewStore.state
  // const { pulses } = props

  const wrapper = ref(null)
  const canvas = ref(null)
  const wrapperBounds = useElementBounding(wrapper)

  let scope = new paper.PaperScope()

  onMounted(() => {
    scope.setup(canvas.value)

    // Draw the view now:
    // paper.view.draw()
    initZoom()
    drawPulses()
    drawText()
  })

  function initZoom() {
    watch(
      ZT,
      () => {
        scope.view.matrix = new scope.Matrix(ZT.k, 0, 0, 1, ZT.x, 0)
      }
    )
  }

  function drawPulses() {
    let path
    watch(
      () => [pulses, viewStore.xScale], () => {
        const pulsesScaled = pulses.map((d) => viewStore.xScale(d.time))
        let segments = []
        pulsesScaled.forEach((x, i) => {
          const t = i % 2 === 0 
          segments.push([x, t ? 20 : 80],[x, t ? 80 : 20])
        })
        scope.activate()
        path = new scope.Path({
          segments,
          strokeColor: 'lightgreen',
          strokeWidth: 1,
          // strokeCap: 'round',
          strokeScaling: false,
          selected: false,
        });
      }
    )

  }

  function drawText() {
    scope.activate()
    const textGroup = new scope.Group()
    const arr = []
    let p = new scope.Path()
    
    // const bitsHintsText = computed(() => {
    //   bitsHintsSource.value
    // })
    
    watch(
      bitsHintsSource,
      () => {
        scope.activate()
        textGroup.removeChildren()
        console.log("create texts...");
        let pd = bitsHintsSource.value.map((h) => `M${h[3]},80 V110 M${h[4]},80 V110`).join('')
        // console.log(p);
        p.remove()
        p = new scope.CompoundPath(pd)
        p.stroke = 2
        p.strokeColor = 'lightgray'
        p.strokeScaling = false
        bitsHintsSource.value.forEach((h) => {
          let t = new scope.PointText({
            point: [h[3] + (h[4] - h[3]) / 2, 100],
            applyMatrix: false,
            content: h[2],
            data: h,
            fillColor: 'white',
            strokeScaling: false,
            fontSize: 15,
            locked: true,
            // parent: textGroup,
            justification: "center",
            insert : false
          })
          
          arr.push(t)
          // h.t = t
        })
      }
    )

    // watch(ZT, () => {
    //   textGroup.children.forEach((c) => {
    //     c.scaling.x = 1/ZT.k
    //     // c.visible = ZT.k > 3
    //   })
    // })

    const ww = useWebWorkerFn((arr, k) => {
      return arr.filter((h) => {
        const scaleConstraint = (h[4] - h[3]) * k > 20
        return scaleConstraint
      })
    },{

    })
    
    scope.view.autoUpdate = false
    watch(() => [ZT.x, ZT.k], () => {
      // console.log(123);
      let n = -props.viewStore.xScale(0)
      n += props.pulses.scaledXOffset / ZT.k
      // textGroup.children.forEach((c) => {
      //   c.scaling.x = 1/ZT.k
      // })
      // scope.view.draw()
      // ww.workerFn(arr, ZT.k)
      console.log(arr);
      
      textGroup.removeChildren()
      // for (const i in arr) {
      //   let h = arr[i].data
      //   // console.log({i});
        
      //   const scaleConstraint = (h[4] - h[3]) * ZT.k > 20
      //   const viewportConstraint = props.viewStore.isRangeInView(n + h[3], n + h[4])
      //   // if (scaleConstraint && viewportConstraint)
      //   // textGroup.addChild(arr[i])
      //   // arr[i].scaling.x = 1/ZT.k
      //   // textGroup.children[i].visible = scaleConstraint && viewportConstraint
      //   // textGroup.children[i].scaling.x = 1/ZT.k
      // }

      // textGroup.visible = false

      // textGroup.children.filter((t) => {
      //   return
      // })
      // bitsHintsSource.value.forEach((h) => {
      //   // const scaleConstraint = (h[4] - h[3]) * ZT.k > 20
      //   // const viewportConstraint = props.viewStore.isRangeInView(n + h[3], n + h[4])
      //   // h.t.scaling.x = ZT.k
      //   // h.t.remove()
      //   // h.t.scaling.x = 1/ZT.k

      //   // if (scaleConstraint && viewportConstraint)
      //   //   textGroup.addChild(h.t)
        
      //   // h.t.visible = scaleConstraint && viewportConstraint
      //   // return scaleConstraint && viewportConstraint
      // })
      scope.view.update()

      // scope.activate()
      // let m = new scope.Matrix(1/ZT.k, 0, 0, 1, 0, 0)

      
      // paper.view.draw()
    })
  }

  const bitsHintsSource = computed(() => {
    return pulses.measurements
      .filter((m) => !m.decoder.analyzerWorker.isRunning)
      .reduce((acc, m) => {
        return [...acc, ...(m.decoder?.bitsHints || [])]
      }, [])
  })
  let c = 0



  const bitsHints = computed(() => {
    let n = -props.viewStore.xScale(0)
    n += props.pulses.scaledXOffset / ZT.k
    return bitsHintsSource.value.filter((h) => {
      const scaleConstraint = (h[4] - h[3]) * ZT.k > 20
      const viewportConstraint = props.viewStore.isRangeInView(n + h[3], n + h[4])
      return scaleConstraint && viewportConstraint
    })
  })
  
</script>
