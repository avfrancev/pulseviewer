import { Analyzer } from "pulseplot/lib/histogram.js"
import { sliceGuess } from "pulseplot/lib/slicer.js"

onmessage = async function (e) {
  const { pulses, pickedSlicer } = e.data
  const analyzer = new Analyzer(pulses)
  const guessed = analyzer.guess()
  guessed.modulation = pickedSlicer || guessed.modulation
  const sg = sliceGuess(pulses, guessed)
  sg.hex = sg.bits?.toHexString()

  postMessage({ analyzer, guessed, sg })
}
