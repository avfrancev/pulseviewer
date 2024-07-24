import { defineStore } from "pinia"
import { extent, fsum, bisector, quantile } from "d3-array"
import { zoomIdentity } from "d3-zoom"
import { interpolateRainbow } from "d3-scale-chromatic"

import * as ss from 'simple-statistics'

import { decodePulses } from "@/RCSwitch.js"

import { useViewStore, useESP32RMTStore, useConfigStore } from "./index.js"

const colors = Array.from(Array(20)).map((d, i) => {
  return interpolateRainbow(i / 20)
})

function getRandomNotUsedColor(colors) {
  const filteredColors = colors.filter((color) => !getRandomNotUsedColor.usedColors.includes(color))
  const randomIndex = Math.floor(Math.random() * filteredColors.length)
  let c = filteredColors[randomIndex]
  if (!c) {
    getRandomNotUsedColor.usedColors = []
    c = getRandomNotUsedColor(colors)
  }
  getRandomNotUsedColor.usedColors.push(c)
  return c
}

getRandomNotUsedColor.usedColors = []

function parsePlainArr(arr, startLevel = 0) {
  let time = 0
  return arr.map((d, i) => {
    if (i !== 0) time += arr[i - 1]
    return { level: (i + startLevel) % 2, width: d, time }
  })
}

function parseSaleaeLogicCSV(csv) {
  let lines = csv.split("\n")
  let result = []
  for (let i = 1; i < lines.length - 1; i++) {
    let currentline = lines[i].split(",")
    let nextline = lines[i + 1].split(",")

    let width = nextline[0] - currentline[0]
    if (width >= 0) result.push(+(width * 1000_000).toFixed())
  }
  return result
}

// import digital_csv from '../digital.csv?raw'
// console.log(parseSaleaeLogicCSV(digital_csv));
// import data_bin from '/src/data.bin?arraybuffer'
// import data_bin from '../../../esp32s2_pump/data.bin?arraybuffer'
// console.log(data_bin);

// console.log(new Uint8Array(data_bin));

function setupPulsesObject(arr) {
  // let raw =
  // console.log(arr.join(","));
  let raw = arr.join(",")
  arr = reactive(parsePlainArr(arr))
  arr.raw = raw
  arr.sum = fsum(arr, (d) => d.width)
  arr.xOffset = 0
  arr.cursorX = 0
  // arr.lala = computed(() => {
  //   return arr.cursorX +1
  // })

  return arr
}

/**
 * Decode OOK_MC_ZEROBIT signal
 * @param {Array<number>} signal - array of pulse durations (in microseconds)
 * @returns {Array<number>} - array of decoded bits (0 or 1)
 */
function decodeOOK_MC_ZEROBIT(signal) {
  const decoded = []
  let lastBit = 1 // assume logic 1 as the initial state

  for (let i = 0; i < signal.length; i++) {
    const pulseDuration = signal[i]

    // check if pulse duration is within the range of a valid bit pulse
    if (pulseDuration >= 200 && pulseDuration <= 800) {
      const bit =
        // check for Manchester encoding of zero bit
        pulseDuration <= 375 && lastBit === 1 ? 0 : pulseDuration > 375 && lastBit === 0 ? 1 : null

      if (bit === null) {
        // push a null value for invalid bit transitions
        decoded.push(null)
      } else {
        decoded.push(bit)
        lastBit = bit
      }
    }
  }

  // check if the last bit is the same as the bit before it
  if (decoded.length > 0 && decoded[decoded.length - 1] === lastBit) {
    decoded.pop() // pop the last bit if it's the same as the bit before it
  }

  return decoded
}

/**
 * Decode OOK_PULSE_RZ signal
 * @param {Array<number>} signal - array of pulse durations (in microseconds)
 * @returns {Array<number>} - array of decoded bits (0 or 1)
 */
function decodeOOK_PULSE_RZ(signal) {
  const decoded = []
  let lastBit = 1 // assume logic 1 as the initial state

  for (let i = 0; i < signal.length; i++) {
    const pulseDuration = signal[i]

    // check if pulse duration is within the range of a valid bit pulse
    if (pulseDuration >= 200 && pulseDuration <= 800) {
      const bit = pulseDuration <= 500 ? 0 : 1

      // check if the current bit is the same as the last bit
      if (bit !== lastBit) {
        decoded.push(null) // push a null value for invalid bit transitions
      }

      decoded.push(bit)
      lastBit = bit
    }
  }

  // check if the last bit is the same as the bit before it
  if (decoded.length > 0 && decoded[decoded.length - 1] === lastBit) {
    decoded.pop() // pop the last bit if it's the same as the bit before it
  }

  return decoded
}

// { pulselength, Sync bit, "0" bit, "1" bit, invertedSignal }
//  * {
//  *    Pulse length,
//  *    PreambleFactor,
//  *    Preamble {high,low},
//  *    HeaderFactor,
//  *    Header {high,low},
//  *    "0" bit {high,low},
//  *    "1" bit {high,low},
//  *    Inverted Signal,
//  *    Guard time
//  * }
const protocolHeaders = [
  "pulselength",
  "preambleFactor",
  "preamble",
  "headerFactor",
  "header",
  "zerobit",
  "onebit",
  "invertedSignal",
  "guardTime",
]
const protocols = [
  // { 350, { 1, 31 }, { 1, 3 }, { 3, 1 }, false }
  [350, 0, [0, 0], 1, [1, 31], [1, 3], [3, 1], false, 0], // 01 (Princeton, PT-2240)
  [400, 11, [1, 1], 1, [0, 9], [2, 1], [1, 2], false, 40], // 12 (Keeloq 64/66)
]

function getProtocol(p) {
  return Object.fromEntries(protocolHeaders.map((key, i) => [key, p[i]]))
}
// float diff = d1 - d2;
// float avg = (d1 + d2) / 2;
// float ratio = diff / avg;

// uint8_t b = ratio < 0.2 ? 1 : 0;

function decodeOOK_PWM(pulses) {
  const decoded = []

  for (let i = 0; i < pulses.length; i += 2) {
    let w1 = pulses[i]?.width
    let w2 = pulses[i + 1]?.width
    let t1 = pulses[i]?.time
    let t2 = pulses[i + 1]?.time

    if (!w1 || !w2) continue

    let diff = w1 - w2
    let avg = (w1 + w2) / 2
    let ratio = diff / avg
    let b = ratio < 0.2 ? 1 : 0
    decoded.push({
      width: w1 + w2,
      time: t1,
      b,
    })
  }
  return decoded
}

// console.log(getProtocol(protocols[0]));

// export function addPulses(pulses, arr) {
//   rawPulses.push(pulses)
// }

// const useMeasurementsStore = defineStore(`measurements`, () => {
//   const measurements = reactive([])
//   function addMeasurement(x1,x2,color) {
//     measurements.push({x1,x2,color})
//   }

//   return {
//     measurements,
//     addMeasurement,
//   }
// })

let measurementsCounter = 0

function initMeasurements(pulses, viewStore, pulsesMinX) {
  const measurements = reactive([])
  measurements.addMeasurement = (x1, x2, color = getRandomNotUsedColor(colors)) => {
    const m = reactive({ x1, x2, color })
    m.id = `measurement-${measurementsCounter++}`
    m.isHovered = false
    m.minX = computed(() => Math.min(m.x1, m.x2))
    m.maxX = computed(() => Math.max(m.x1, m.x2))
    m.minXWithXOffset = computed(() => m.minX + pulses.xOffset)
    m.xOffset = computed(() => pulses.xOffset)
    m.width = computed(() => m.maxX - m.minX)
    m.scaledX1 = computed(() => viewStore.xScale(m.x1))
    m.scaledX2 = computed(() => viewStore.xScale(m.x2))
    m.scaledMinX = computed(() => viewStore.xScale(m.minX))
    m.scaledMaxX = computed(() => viewStore.xScale(m.maxX))
    m.scaledWidth = computed(() => m.width / viewStore.pixelRatio)
    m.statistics = {
      ckmeansClustersCount: 3,
      ckmeans: computed(() => {
        if (m.pulsesInRange.length <= m.statistics.ckmeansClustersCount) return []
        return ss.ckmeans(m.pulsesInRange.map((d) => d.width), m.statistics.ckmeansClustersCount)
      }),
      ckmeans_mean: computed(() => {
        let o = m.statistics.ckmeans.map(ss.mean)
        o = o.map((d,i) => { return {
          val: d,
          percent: Math.round(m.statistics.ckmeans[i].length / m.pulsesInRange.length * 100),
        }})
        return o
      }),
      // ckmeans_avg: computed(() => m.statistics.ckmeans.map(ss.median)),
    }
    m.isCursorsInsideMeasurement = computed(
      () => m.minX < pulses.cursorX && m.maxX > pulses.cursorX,
    )
    m.rangeIds = computed(() => [
      pulses.bisectorRef.left(pulses, m.minX),
      pulses.bisectorRef.left(pulses, m.maxX),
    ])
    m.pulsesInRange = computed(() => pulses.slice(...m.rangeIds))
    m.Nfalling = computed(() => m.pulsesInRange.filter((d) => d.level === 0).length)
    m.Nrising = computed(() => m.pulsesInRange.filter((d) => d.level === 1).length)
    m.minmaxFreq = computed(() => extent(m.pulsesInRange, (d) => d.width))
    m.averageTime = computed(
      () => m.pulsesInRange.reduce((acc, curr) => acc + curr.width, 0) / m.pulsesInRange.length,
    )
    m.q = computed(() =>
      quantile(
        m.pulsesInRange.map((d) => d.width),
        0.05,
      ),
    )
    m.baud = computed(() => parseInt((1 / m.q) * 1000 * 1000))

    m.remove = () => {
      measurements.removeMeasurement(m.id)
    }

    m.locate = () => {
      let w = m.scaledMaxX - m.scaledMinX
      let z = zoomIdentity.scale((viewStore.wrapperBounds.width / w) * 0.9)
      // viewStore.state.ZT.k = z.k
      // viewStore.state.ZT.x = - ((m.scaledMinX - w/2*0.1 )*z.k)
      let newX = -((m.scaledMinX - (w * 0.1) / 2) * z.k)
      newX -= viewStore.xScale(pulses.xOffset + pulsesMinX.value) * z.k
      viewStore.state.ZT.animateTo({ k: z.k, x: newX })
      // animate({
      //   from: {k: viewStore.state.ZT.k, x: viewStore.state.ZT.x},
      //   to: {k: z.k, x: newX},
      //   ease: easeInOut,
      //   onUpdate: (v) => {
      //     Object.assign(viewStore.state.ZT, v)
      //   }
      // })
    }
    m.changeColor = () => {
      m.color = getRandomNotUsedColor(colors)
    }
    measurements.push(m)
    return m
  }
  measurements.removeMeasurement = (id) => {
    const index = measurements.findIndex((m) => m.id === id)
    if (index !== -1) measurements.splice(index, 1)
  }
  return measurements
}

export default defineStore(`pulses`, () => {
  const viewStore = useViewStore()

  // const rawPulses = reactive([])
  // make array of 20 elements with 10 values
  // let a1 = Array(20).fill(10)
  // console.log(a1);

  // rawPulses.push([10, 10, 10, 100, 100, 40, 300, 10, 10, 10])
  // rawPulses.push([10, 10, 10, 100, 170, 10, 10, 200, 50, 400, 200, 100, 10,10,10])
  // rawPulses.push(Array(10).fill(10))
  // let rawRTM = parseRMT_item32_packet(new Uint8Array(data_bin))
  // console.log({rawRTM});
  // rawPulses.push(rawRTM)
  // console.log(rawRTM);
  // let decodeProtocol = decodePulses(rawPulses, protocols)
  // console.log({decodeProtocol});
  // let decodeOOK_MC_ZEROBIT_data = decodeOOK_MC_ZEROBIT(rawRTM)
  // console.log(decodeOOK_MC_ZEROBIT_data);
  // let decodeOOK_PULSE_RZ_data = decodeOOK_PULSE_RZ(rawRTM)
  // console.log(decodeOOK_PULSE_RZ_data);
  // console.log(data_bin);
  // console.log(rawPulses[0]);
  // rawPulses.push(Array(500).fill(1000))
  // console.log('434,394,380,422,379,422,377,421,378,420,377,421,378,420,378,420,377,421,377,421,378,421,377'.split(',').map(Number));
  // console.log('773,427,791,423,370,824,369,799,396,802,370,815,389,807,388,808,382,788,811,408,384,802,781,425,381,824,778,423,378,797,801,421,779,425,378,798,800,422,779,424,379,823,377,797,374,820,798,420,377,796,375,820,373,820,371,820,773,420,400,795,374,820,375,819,798,420,378,796,801,421,778,424,780,425,805,401,382,825,378,798,399,796,799,422,777,424,781,426,781,426,381,826,779,423,379,824,778,423,780,424,380,825,778,423,379,799,801,423,781,424,781,426,805,427,782,402,808,403,807,427,783,403,382,826,779,423,781,425,381,826,378,16092,386,376,377,421,377,421,378,421,377,422,377,423,378,421,378,422,377,422,378,422,379,421,378,3932,796,414,798,413'.split(',').map(Number));

  // rawPulses.push('434,394,380,422,379,422,377,421,378,420,377,421,378,420,378,420,377,421,377,421,378,421,377,3929,773,427,791,423,370,824,369,799,396,802,370,815,389,807,388,808,382,788,811,408,384,802,781,425,381,824,778,423,378,797,801,421,779,425,378,798,800,422,779,424,379,823,377,797,374,820,798,420,377,796,375,820,373,820,371,820,773,420,400,795,374,820,375,819,798,420,378,796,801,421,778,424,780,425,805,401,382,825,378,798,399,796,799,422,777,424,781,426,781,426,381,826,779,423,379,824,778,423,780,424,380,825,778,423,379,799,801,423,781,424,781,426,805,427,782,402,808,403,807,427,783,403,382,826,779,423,781,425,381,826,378,16092,386,376,377,421,377,421,378,421,377,422,377,423,378,421,378,422,377,422,378,422,379,421,378,3932,796,414,798,413'.split(',').map(Number))
  // console.log(la.join(','));
  // rawPulses.push(la)

  // rawPulses.push([139,9,33,3795,162,50,7,686,428,1259,1321,427,415,439,26,794,1329,79,8,73,35,178,482,1263,494,1262,432,1252,1343,359,454,1312,447,1264,395,1288,1347,386,436,1254,1352,334,585,1174,1343,441,367,1305,1263,423,465,1250,1323,446,408,1272,19,27,1257,425,409,1297,450,1264,478,7464,40,1419,37,60,40,4184,431,270,33,1014,494,27,741,419,492,912,93,35,59,153,1327,382,431,460,30,787,445,1253,484,1228,1371,376,475,1247,439,1245,454,1315,1271,431,395,1273,1334,399,454,1268,594,24,700,407,482,1215,1328,423,451,1274,1288,386,472,1300,1255,415,426,1285,476,1245,467,2557,42,10668,484,1235,1308,438,404,371,130,774,1340,380,427,971,10,326,415,1266,465,1248,378,24,40,16,918,361,512,848,40,353,422,1268,33,8,428,1224,1351,393,452,1234,1324,458,413,1249,1296,437,418,1294,1289,497,387,1266,1143,551,441,1326,1272,393,284,19,142,1334,285,8,48,1381,396,10274,44,2689,61,37,21,126,511,66,14,1142,1299,410,452,21,66,370,18,843,1247,412,481,1296,433,1264,463,1220,1305,399,462,1259,469,1259,470,1228,2390,8,845,247,1284,513,22,32,300,1301,2104,658,1888,504,381,1275,205,8,1057,477,324,29,64,1299,1133,685,118,26,183,1266,232,14,453,1009,206,28,104,46,95,13243,484,1239,1315,401,446,1327,1275,389,426,1276,462,1267,461,1254,549,24,695,443,456,1256,475,1246,445,1333,413,19,794,430,458,1271,1302,393,359,23,88,1253,291,84,50,33,29,31,848,352,196,30,226,1294,137,15,1115,443,404,1292,235,38,1032,408,454,1272,29,33,1273,447,134,8,204,1414,374,150,194,1032,340,9552,41,3698,395,1275,1337,372,473,1274,1068,15,228,389,31,8,429,1233,456,1269,249,30,199,1284,1250,409,449,1273,485,1267,418,1114,1463,8,29,99,189,85,457,1302,1260,410,581,1167,65,8,1209,413,449,1253,1350,406,490,1234,1298,381,134,132,141,1311,1338,377,430,1125,12,141,458,1279,425,5892,46,69,73,875,35,1854,60,60,39,2063,59,2212,441,180,58,1009,1276,408,480,735,41,459,1355,416,483,829,64,281,482,1235,509,1242,1319,377,466,191,57,1014,455,1245,299,9,182,1237,1280,180,30,75,37,64,507,1294,56,8,246,11,1020,354,418,64,292,27,517,205,89,84,1157,576,455,1270,1327,368,473,1259,1154,28,81,455,472,1230,1323,422,438,1248,427,15,175,245,167,990,288,1231,130,7424])

  // rawPulses.push([266,4224,468,1302,1244,102,773,1264,1372,391,64,35,353,1341,57,12,207,1396,390,1303,70,18,1075,14,107,394,471,1424,28,9,235,1278, 472,1214,1322,301,519,1298,1300,436,409,1188,515,12,899,432,351,1318,1291,476,430,1286,1306,372,422,874,206,235,753,19,532,456,381,463, 96,838,291,402,20,908,437,7541,46,2059,15,1561,58,1966,454,404,95,364,37,46,72,250,1306,463,436,1046,50,18,58,84,1322,415, 451,847,28,346,455,807,37,438,64,91,251,1281,1320,259,53,96,433,172,17,985,25,179,425,24,38,1140,501,200,47,1005,35,18, 1251,359,488,1268,1321,31,30,51,44,224,445,972,51,288,677,8,557,420,537,1227,1286,383,468,1267,1355,387,35,27,404,1265,1283,376, 412,1303,487,1253,492,2058,26,1920,62,1600,45,3165,414,3710,54,175,473,1267,1325,399,448,1212,1371,385,472,1220,473,1239,489,1235,1344,370, 493,1226,510,1298,403,108,33,1120,661,141,509,373,480,1240,1344,384,437,1290,1304,403,455,1238,1308,414,470,1288,1280,443,433,1228,1320,461, 473,75,491,205,93,326,451,1301,427,8101,25,5133,524,1233,1289,433,438,1234,1296,414,484,1273,470,1221,468,436,90,724,1334,366,450,1317, 408,1283,482,1263,1278,386,485,1276,1287,446,433,1259,1303,410,477,1218,1270,551,356,1362,1248,422,417,1234,1346,383,466,1262,445,1254,452,13296, 32,19,361,1290,1339,377,481,1265,1284,411,67,19,384,1268,452,1220,453,1266,1364,394,48,16,118,1500,452,1317,475,1362,1179,368,486,1248, 1313,376,493,1241,1339,403,465,1205,1338,404,483,1234,1311,503,343,1293,124,11,1137,409,503,1300,359,1301,447,13277,476,1241,1313,406,482,1259, 1323,337,502,1241,464,1274,408,1267,1364,367,442,1267,112,21,382,1200,486,1270,1341,332,485,1272,1306,414,444,1229,1304,461,433,1252,65,13, 2391,30,835,182,63,10,892,712,379,1311,1308,395,461,1333,393,473,116,683,424,4189,203,5493,291,3150,365,1328,1309,395,452,1301,1271,433, 437,1302,411,1296,413,1308,1274,589,253,1261,423,1341,18,39,374,1231,1304,481,406,1286,22,29,1233,431,45,15,385,1268,1072,27,205,480, 308,1312,1326,401,438,1375,1192,468,438,1229,1320,379,501,1224,477,1240,475,13259,454,1286,1298,429,434,1245,29,11,1337,457,381,1215,477,1237, 442,1303,378,16,914,438,361,1311,455,1260,58,16,412,1218,1368,367,487,1252,1302,409,423,1261,1343,413,35,27,389,267,2309,379,501,610])
  // rawPulses.push(parseSaleaeLogicCSV(digital_csv))

  let pulsesCounter = ref(0)

  const pulses = reactive([])

  const maxSum = computed(() => Math.max(...pulses.map((d) => d.sum + d.xOffset)))
  const minOffset = computed(() => Math.min(0, Math.min(...pulses.map((d) => d.xOffset))))
  const maxOffset = computed(() => Math.max(...pulses.map((d) => d.xOffset)))
  // const minX = computed(() => Math.min(0,Math.min(...pulses.map(d => d.xOffset))))
  const minX = computed(() => Math.min(0, minOffset.value))
  const maxX = computed(() => maxSum.value)
  const maxSumWithOffset = computed(() =>
    Math.max(...pulses.map((d) => maxSum.value - Math.abs(d.xOffset))),
  )

  function addPulses(data) {
    if (!Array.isArray(data) || data.length === 0) {
      console.log(data)
      return
    }
    let arr = reactive(parsePlainArr(data))
    arr.iid = pulsesCounter.value
    pulsesCounter.value += 1
    arr.raw_data = data
    arr.sum = computed(() => fsum(arr, (d) => d.width))
    arr.xOffset = 0
    arr.cursorX = 0
    arr.rssi = 0
    arr.isHovered = false
    arr.bisectorRef = bisector((d) => d.time)
    arr.dataIDUnderCursor = computed(() => {
      return arr.bisectorRef.left(arr, arr.cursorX) - 1
    })
    // arr.RCSwitch = computed(() => {
    //   return decodePulses(arr.raw_data)
    // })
    arr.measurements = initMeasurements(arr, viewStore, minX)
    // arr.measurements.addMeasurement(2000,30000,'red')

    // let dpwm = decodeOOK_PWM(pulses[0])
    // arr.decodedPWM = computed(() => decodeOOK_PWM(arr))
    watch(
      () => arr.raw_data,
      () => {
        arr.length = 0
        Object.assign(arr, parsePlainArr(arr.raw_data.map(Number)))
        // Object.assign( arr, parsePlainArr(arr.raw.split(',').map(Number)))
      },
    )
    pulses.push(arr)
    return arr
  }

  function removePulses(p) {
    pulses.splice(pulses.indexOf(p), 1)
  }

  const pulsesStorage = useStorage("pulses", [])

  const allMeasurements = computed(() => {
    return pulses
      .map((p) => p.measurements)
      .flat()
      .sort((a, b) => a.minXWithXOffset - b.minXWithXOffset)
  })

  const saveToLocalStorage = () => {
    console.log("saving to local storage")
    // pulsesStorage.value = []
    pulsesStorage.value = pulses.map((p) => {
      let o = {
        raw_data: p.raw_data,
        xOffset: p.xOffset,
        rssi: p.rssi,
        measurements: p.measurements.map((m) => {
          return {
            x1: m.x1,
            x2: m.x2,
            color: m.color,
          }
        }),
      }
      return o
    })
    // pulsesStorage.value = out

    // console.log('throttledSaveToLocalStorage');
  }

  const throttledSaveToLocalStorage = useDebounceFn(saveToLocalStorage, 100)

  const pulsesOffsetsX = computed(() => {
    return pulses.map((p) => p.xOffset)
  })

  const debounceOptions = { debounce: 500, maxWait: 4000 }
  watchDebounced(allMeasurements, throttledSaveToLocalStorage, { deep: true, ...debounceOptions })
  watchDebounced(pulsesOffsetsX, throttledSaveToLocalStorage, { ...debounceOptions })
  watchDebounced(pulses, throttledSaveToLocalStorage, { ...debounceOptions })

  function loadPulses(_pulses = []) {
    pulses.length = 0
    _pulses.forEach((p) => {
      if (!p.raw_data) return
      let _p = addPulses(p.raw_data)
      _p.xOffset = p.xOffset
      p.measurements.forEach((m) => {
        _p.measurements.addMeasurement(m.x1, m.x2, m.color)
      })
    })
  }

  if (pulsesStorage.value.length) {
    loadPulses(pulsesStorage.value)
  }



  // console.log(ss, pulses[0]?.measurements[0].pulsesInRange[0]);
  // // equalIntervalBreaks
  // let ppp = pulses[0]?.measurements[0].pulsesInRange.map((d) => d.width)
  // // console.log(ppp, ss.equalIntervalBreaks(ppp, 5), ss.equalIntervalBreaks(ppp.sort((a, b) => a - b), 2));
  // let ppp_ck = ss.ckmeans(ppp, 3)
  // // console.log(ss.ckmeans(ppp, 3));
  // // console.log(ss.tTestTwoSample(ppp_ck[1], ppp_ck[2]), 0);
  // function printa(arr, fn, ...args) {
  //   console.log(fn(arr, ...args), arr);
  // }
  // printa(ppp_ck[0], ss.sampleKurtosis)
  // printa(ppp_ck[1], ss.sampleKurtosis)
  // printa(ppp_ck[2], ss.sampleKurtosis)
  // printa(ppp, ss.sampleKurtosis)
  // console.log(ss.extent(ppp_ck[0]));
  // // console.log(ss.sampleSkewness(ppp_ck[0]));
  // // console.log(ss.sampleSkewness(ppp_ck[1]));
  // // console.log(ss.sampleSkewness(ppp_ck[2]));
  // // console.log(ss.sampleSkewness(ppp));

  

  return {
    addPulses,
    removePulses,
    loadPulses,
    saveToLocalStorage,
    throttledSaveToLocalStorage,
    pulses,
    maxSum,
    minOffset,
    maxOffset,
    maxSumWithOffset,
    minX,
    maxX,
    pulsesStorage,
    allMeasurements,
  }
})
