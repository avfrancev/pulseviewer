// let pulses = [1192,608,616,604,1192,608,616,604,1192,604,1216,608,608,604,620,604,1192,604,616,604,1196,604,1216,604,608,604,1216,604,612,600,1216,608,608,600,1220,604,608,604,1216,604,608,604,16740,676,544,664,548,656,564,648,568,648,1172,644,568,644,1180,636,576,636,1188,632,584,628,1188,632,584,628,1192,628,584,628,1196,624,588,624,600,620,1176,620,604,616,1184,616,604,616,1180,616,608,616,1184,612,1204,616,600,612,1208,612,600,612,612,608,1192,608,612,608,1192,604,616,608,1188,608,620,604,1188,608,1216,604,608,604,620,604,1192,604,616,604,1192,608,1216,604,608,604,1216,604,612,600,1220,600,612,600,1216,604,612,600,1224,600,608,604,16736,680,532,676,540,664,556,652,564,648,1176,644,572,640,1180,636,576,636,1188,632,580,632,1188,632,584,628,1192,628,584,624,1196,624,592,620,604,620,1176,620,604,616,1180,620,608,612,1184,612,612,612,1180,616,1208,612,604,608,1212,608,604,608,616,608,1188,612,612,608,1188,608,620,604,1188,608,616,604,1192,608,1212,608,608,604,616,604,1196,604,620,600,1196,604,1216,604,612,600,1216,604,608,604,1220,600,612,600,1220,600,612,604,1216,604,608,604,16736,684,532,672,548,656,560,652,564,648,1172,648,568,640,1180,640,576,636,1184,636,580,632,1188,632,580,632,1192,628,588,620,1196,624,592,620,604,620,1176,620,604,620,1176,620,608,612,1184,616,604,616,1184,612,1212,608,604,608,1208,616,600,612,612,608,1188,612,612,608,1188,608,616,608,1192,604,616,608,1192,604,1216,604,608,604,620,604,1192,604,620,604,1196,600,1220,600,612,600,1216,608,608,604,1216,608,604,604,1216,604,612,600,1220,600,612,604,16736,680,536,668,548,660,556,652,568,644,1176,644,572,640,1180,640,576,636,1184,632,584,632,1188,628,584,628,1196,624,588,624,1196,624,592,620,604,616,1180,620,608,612,1180,620,604,616,1184,616,608,612,1184,612,1208,612,604,608,1208,612,604,608,616,608,1188,612,612,608,1192,604,616,608,1188,608,616,608,1192,604,1212,608,608,604,616,608,1192,604,620,600,1196,604,1216,604,612,600,1216,604,608,604,1216,604,612,604,1216,604,608,604,1216,604,612,600,16740,676,536,668,548,660,560,648,568,648,1172,644,572,640,1180,640,576,636,1184,636,584,628,1188,632,584,628,1192,624,588,628,1192,624,592,620]
let pulses = [
  576, 636, 1184, 636, 580, 632, 1188, 628, 588, 624, 1196, 624, 592, 620, 1196, 624, 592, 620,
  1200, 620, 596, 612, 608, 616, 1180, 616, 608, 612, 1188, 608, 612, 612, 1188, 608, 616, 608,
  1188, 608, 1212, 608, 608, 604, 1212, 608, 604, 608, 616, 604, 1196, 604, 620, 600, 1192, 604,
  620, 604, 1192, 604, 620, 600, 1200, 596, 1228, 592, 616, 596, 624, 600, 1200, 596, 628, 596,
  1196, 600, 1220, 600, 616, 596, 1224, 596, 620, 592, 628, 596, 1200, 596, 1224, 596, 616, 596,
  632, 592, 1204, 592, 16956, 672, 544, 664, 552, 652, 564, 648, 568, 644, 1180, 636, 576, 636,
  1188, 636, 576, 632, 1188, 632, 584, 624, 1196, 624, 592, 620, 1196, 624, 592, 620, 1204, 616,
  596, 616, 604, 616, 1184, 612, 612, 612, 1180, 616, 608, 612, 1188, 608, 616, 608, 1188, 608,
  1212, 608, 608, 604, 1216, 604, 608, 604, 620, 600, 1196, 604, 616, 604, 1196, 604, 620, 600,
  1196, 600, 624, 600, 1196, 600, 1220, 600, 612, 600, 624, 600, 1200, 596, 624, 596, 1200, 600,
  1220, 600, 616, 596, 1224, 596, 616, 596, 624, 596, 1204, 596, 1220, 600, 616, 596, 628, 592,
  1200, 596, 16960, 672, 540, 664, 556, 648, 564, 648, 572, 640, 1180, 640, 572, 640, 1184, 632,
  580, 632, 1192, 628, 584, 628, 1192, 624, 592, 620, 1196, 624, 592, 620, 1204, 616, 596, 616, 604,
  616, 1184, 616, 608, 616, 1180, 612, 612, 612, 1188, 608, 612, 608, 1188, 612, 1208, 608, 608,
  604, 1220, 600, 608, 604, 620, 604, 1192, 604, 620, 604, 1192, 604, 624, 600, 1196, 596, 628, 596,
  1196, 600, 1220, 600, 612, 600, 624, 600, 1196, 600, 624, 600, 1196, 600, 1220, 604, 612, 596,
  1220, 600, 616, 596, 628, 596, 1200, 596, 1220, 600, 616, 596, 628, 596, 1200, 596, 16952, 676,
  540, 664, 556, 648, 564, 648, 572, 640, 1180, 636, 580, 636, 1184, 632, 580, 632, 1188, 628, 588,
  624, 1196, 624, 588, 624, 1196, 624, 592, 620, 1200, 620, 592, 620, 604, 616, 1184, 612, 608, 616,
  1180, 612, 616, 608, 1184, 612, 612, 608, 1192, 604, 1216, 604, 608, 604, 1216, 604, 608, 604,
  616, 608, 1192, 604, 620, 600, 1196, 604, 620, 600, 1196, 600, 624, 600, 1196, 600, 1216, 604,
  612, 600, 624, 596, 1200, 596, 624, 600, 1200, 596, 1220, 600, 616, 596, 1224, 596, 616, 596, 632,
  592, 1200, 596, 1224, 596, 616, 596, 628, 596, 1200, 596, 16952, 676, 540, 664, 556, 648, 568,
  644, 572, 640, 1180, 640, 576, 636, 1184, 632, 580, 632, 1192, 628, 580, 632, 1192, 624, 588, 624,
  1196, 624, 592, 620, 1200, 616, 600, 616, 604, 616, 1184, 612, 608, 612, 1184, 612, 616, 608,
  1184, 612, 612, 608, 1188, 612, 1208, 608, 608, 604, 1220, 600, 608, 604, 620, 604, 1196, 600,
  616, 604, 1196, 600, 624, 600, 1196, 600, 620, 600, 1200, 600, 1216, 604, 612, 600, 624, 596,
  1200, 596, 632, 592, 1196, 600, 1220,
]
// pulses = [
//   1192, 608, 616, 604, 1192, 608, 616, 604, 1192, 604, 1216, 608, 608, 604, 620, 604, 1192, 604,
//   616, 604, 1196, 604, 1216, 604, 608, 604, 1216, 604, 612, 600, 1216, 608, 608, 600, 1220, 604,
//   608, 604, 1216, 604, 608, 604, 16740, 676, 544, 664, 548, 656, 564, 648, 568, 648, 1172, 644, 568,
//   644, 1180, 636, 576, 636, 1188, 632, 584, 628, 1188, 632, 584, 628, 1192, 628, 584, 628, 1196,
//   624, 588, 624, 600, 620, 1176, 620, 604, 616, 1184, 616, 604, 616, 1180, 616, 608, 616, 1184, 612,
//   1204, 616, 600, 612, 1208, 612, 600, 612, 612, 608, 1192, 608, 612, 608, 1192, 604, 616, 608,
//   1188, 608, 620, 604, 1188, 608, 1216, 604, 608, 604, 620, 604, 1192, 604, 616, 604, 1192, 608,
//   1216, 604, 608, 604, 1216, 604, 612, 600, 1220, 600, 612, 600, 1216, 604, 612, 600, 1224, 600,
//   608, 604, 16736, 680, 532, 676, 540, 664, 556, 652, 564, 648, 1176, 644, 572, 640, 1180, 636, 576,
//   636, 1188, 632, 580, 632, 1188, 632, 584, 628, 1192, 628, 584, 624, 1196, 624, 592, 620, 604, 620,
//   1176, 620, 604, 616, 1180, 620, 608, 612, 1184, 612, 612, 612, 1180, 616, 1208, 612, 604, 608,
//   1212, 608, 604, 608, 616, 608, 1188, 612, 612, 608, 1188, 608, 620, 604, 1188, 608, 616, 604,
//   1192, 608, 1212, 608, 608, 604, 616, 604, 1196, 604, 620, 600, 1196, 604, 1216, 604, 612, 600,
//   1216, 604, 608, 604, 1220, 600, 612, 600, 1220, 600, 612, 604, 1216, 604, 608, 604, 16736, 684,
//   532, 672, 548, 656, 560, 652, 564, 648, 1172, 648, 568, 640, 1180, 640, 576, 636, 1184, 636, 580,
//   632, 1188, 632, 580, 632, 1192, 628, 588, 620, 1196, 624, 592, 620, 604, 620, 1176, 620, 604, 620,
//   1176, 620, 608, 612, 1184, 616, 604, 616, 1184, 612, 1212, 608, 604, 608, 1208, 616, 600, 612,
//   612, 608, 1188, 612, 612, 608, 1188, 608, 616, 608, 1192, 604, 616, 608, 1192, 604, 1216, 604,
//   608, 604, 620, 604, 1192, 604, 620, 604, 1196, 600, 1220, 600, 612, 600, 1216, 608, 608, 604,
//   1216, 608, 604, 604, 1216, 604, 612, 600, 1220, 600, 612, 604, 16736, 680, 536, 668, 548, 660,
//   556, 652, 568, 644, 1176, 644, 572, 640, 1180, 640, 576, 636, 1184, 632, 584, 632, 1188, 628, 584,
//   628, 1196, 624, 588, 624, 1196, 624, 592, 620, 604, 616, 1180, 620, 608, 612, 1180, 620, 604, 616,
//   1184, 616, 608, 612, 1184, 612, 1208, 612, 604, 608, 1208, 612, 604, 608, 616, 608, 1188, 612,
//   612, 608, 1192, 604, 616, 608, 1188, 608, 616, 608, 1192, 604, 1212, 608, 608, 604, 616, 608,
//   1192, 604, 620, 600, 1196, 604, 1216, 604, 612, 600, 1216, 604, 608, 604, 1216, 604, 612, 604,
//   1216, 604, 608, 604, 1216, 604, 612, 600, 16740, 676, 536, 668, 548, 660, 560, 648, 568, 648,
//   1172, 644, 572, 640, 1180, 640, 576, 636, 1184, 636, 584, 628, 1188, 632, 584, 628, 1192, 624,
//   588, 628, 1192, 624, 592, 620,
// ]

const defaultProtocols = [
  {
    name: 'RCSwitch 868MHz 868MHz',
    pulseLength: 605, // represents the pulse length in microseconds (µs)
    syncFactor: { high: 1, low: 28 }, //  represents the high and low multiple of the pulses that represent a synch bit
    zero: { high: 1, low: 2 }, // the high and low multiple of the pulses that represent a zero
    one: { high: 1, low: 1 }, // the high and low multiple of the pulses that represent a one
  },
]

defaultProtocols.push(
  { name: 'protocol 1', pulseLength: 350, syncFactor: { high: 1, low: 31 }, zero: { high: 1, low: 3 }, one: { high: 3, low: 1 }, invertedSignal: false },
  { name: 'protocol 2', pulseLength: 650, syncFactor: { high: 1, low: 10 }, zero: { high: 1, low: 2 }, one: { high: 2, low: 1 }, invertedSignal: false },
  { name: 'protocol 3', pulseLength: 100, syncFactor: { high: 30, low: 71 }, zero: { high: 4, low: 11 }, one: { high: 9, low: 6 }, invertedSignal: false },
  { name: 'protocol 4', pulseLength: 380, syncFactor: { high: 1, low: 6 }, zero: { high: 1, low: 3 }, one: { high: 3, low: 1 }, invertedSignal: false },
  { name: 'protocol 5', pulseLength: 500, syncFactor: { high: 6, low: 14 }, zero: { high: 1, low: 2 }, one: { high: 2, low: 1 }, invertedSignal: false },
  { name: 'protocol 6', pulseLength: 450, syncFactor: { high: 23, low: 1 }, zero: { high: 1, low: 2 }, one: { high: 2, low: 1 }, invertedSignal: true },
  { name: 'protocol 7', pulseLength: 150, syncFactor: { high: 2, low: 62 }, zero: { high: 1, low: 6 }, one: { high: 6, low: 1 }, invertedSignal: false },
  { name: 'protocol 8', pulseLength: 200, syncFactor: { high: 130, low: 3 }, zero: { high: 16, low: 7 }, one: { high: 3, low: 16 }, invertedSignal: false },
  { name: 'protocol 9', pulseLength: 200, syncFactor: { high: 3, low: 130 }, zero: { high: 7, low: 16 }, one: { high: 16, low: 3 }, invertedSignal: true },
  { name: 'protocol 10', pulseLength: 365, syncFactor: { high: 18, low: 1 }, zero: { high: 3, low: 1 }, one: { high: 1, low: 3 }, invertedSignal: true },
  { name: 'protocol 11', pulseLength: 270, syncFactor: { high: 36, low: 1 }, zero: { high: 1, low: 2 }, one: { high: 2, low: 1 }, invertedSignal: true },
  { name: 'protocol 12', pulseLength: 320, syncFactor: { high: 36, low: 1 }, zero: { high: 1, low: 2 }, one: { high: 2, low: 1 }, invertedSignal: true },
)

function diff(a, b) {
  return Math.abs(a - b)
}

export function decodeProtocol(protocol, pulses) {
  let decodedData = []
  let pulseLength = protocol.pulseLength
  let syncFactorHigh = protocol.syncFactor.high
  let syncFactorLow = protocol.syncFactor.low
  let zeroHigh = protocol.zero.high
  let zeroLow = protocol.zero.low
  let oneHigh = protocol.one.high
  let oneLow = protocol.one.low
  let invertedSignal = protocol.invertedSignal

  // Calculate the expected sync pulse duration with 60% tolerance margin
  let syncDurationMin = pulseLength * (syncFactorHigh + syncFactorLow) * 0.4
  let syncDurationMax = pulseLength * (syncFactorHigh + syncFactorLow) * 1.6

  console.log(
    `decodePulses: syncDurationMin=${syncDurationMin}, syncDurationMax=${syncDurationMax}`,
  )

  

  // Search for a sync pulse anywhere in the array
  for (let i = 0; i < pulses.length; i++) {
    if (pulses[i] >= syncDurationMin && pulses[i] <= syncDurationMax) {
      console.log(`[ ${protocol.name} ]decodePulses: found sync pulse at index=${i}`, pulses[i])
      let syncLengthInPulses = syncFactorLow > syncFactorHigh ? syncFactorLow : syncFactorHigh
      let delay = pulses[i] / syncLengthInPulses
      let delayTolerance = delay * 0.6
      console.log(
        `syncLengthInPulses=${syncLengthInPulses}, decodePulses: delay=${delay}, delayTolerance=${delayTolerance}`,
      )
      // console.log(pulses.slice(i))
      let o = {
        data: "",
        startIdx: i,
        endIdx: i,
      }
      // let binaryData = ""
      // let s = "1111010101010101101010100101101010100110100101100110"
      for (let j = i + 1; j < pulses.length; j += 1) {
        if (
          diff(pulses[j], delay * zeroHigh) < delayTolerance &&
          diff(pulses[j + 1], delay * zeroLow) < delayTolerance
        ) {
          o.data += "0"
        } else if (
          diff(pulses[j], delay * oneHigh) < delayTolerance &&
          diff(pulses[j + 1], delay * oneLow) < delayTolerance
        ) {
          o.data += "1"
        } else {
          // console.log(`decodePulses: error: invalid pulse duration from ${i} at index=${j}`)
          // console.log(binaryData.length, parseInt(binaryData, 2), s, s === binaryData)
          i = j
          o.endIdx = j
          break
        }
        j++
      }

      // Invert the signal if necessary
      if (invertedSignal) {
        o.data = o.data
          .split("")
          .map((bit) => (bit === "0" ? "1" : "0"))
          .join("")
      }

      if (o.data.length > 0) {
        decodedData.push(o)
        console.log(`!!!!decodePulses: decoded binary data=${o.data}`)
      }
      // return binaryData
    }
  }
  return decodedData
}

export function decodePulses(pulses, protocols = [...defaultProtocols]) {
  // console.log(`decodePulses: pulses=${JSON.stringify(pulses)}`)
  // let decodedProtocols = []
  // let o = decodeProtocol(protocols[0], pulses)
  // console.log(o);
  console.log(pulses, protocols);
  let decodedProtocols = protocols.map((protocol) => {
    return {
      decodedData: decodeProtocol(protocol, pulses),
      protocol,
    }
  })
  console.log(`decodePulses: decoded protocols=${JSON.stringify(decodedProtocols)}`)
  
  return decodedProtocols
}

// console.log(decodePulses(pulses, protocols))
