// import { Hexbuffer, dec2hex } from "@/utils/hexbuffer.js"
// import { Analyzer, Histogram, Bin } from "@/utils/histogram.js"
import { Analyzer } from "pulseplot/lib/histogram.js"
import { sliceGuess } from "pulseplot/lib/slicer.js"
onmessage = async function (e) {
  const { pulses, pickedSlicer } = e.data
  const analyzer = new Analyzer(pulses)
  const guessed = analyzer.guess()
  guessed.modulation = pickedSlicer || guessed.modulation
  const sg = sliceGuess(pulses, guessed)
  // console.log("sg", sg.bits.toHexString());
  sg.hex = sg.bits?.toHexString()
  // return { analyzer, guessed, sg }

  // postMessage({analyzer})
  this.setTimeout(() => {
    // resolve({ analyzer, guessed, sg })
  }, 1000)
  postMessage({ analyzer, guessed, sg })
}
