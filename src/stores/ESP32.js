import useConfigStore from "./config"

function parse_rmt_buffer(data) {
  let arr, dur, i, j, level, ref1, x1, x16_t, x2
  arr = []
  for (i = j = 0, ref1 = data.length; j < ref1; i = j += 2) {
    x1 = data[i]
    x2 = data[i + 1]
    x16_t = (x2 << 8) | x1
    level = (x16_t >> 15) & 1
    dur = x16_t & ~(1 << 15)
    arr.push(dur)
  }
  return arr
}

function parse_rmt_message_t(data) {
  // typedef struct rmt_message_t
  // {
  //   uint16_t length;
  //   unsigned long time;
  //   int64_t delta;
  //   int rssi;
  //   rmt_data_t buf[512];
  // } rmt_message_t;
  // offset time: 4
  // offset delta: 8
  // offset rssi: 16
  // offset buf: 20

  let dv = new DataView(data)
  const length = dv.getUint16(0, true)
  const delta = dv.getUint32(8, true)
  const rssi = dv.getInt16(16, true)
  const buf = new Uint8Array(dv.buffer, 20, length * 4)
  let parsed_buf = parse_rmt_buffer(buf)
  return {
    length,
    delta,
    rssi,
    buf,
    parsed_buf,
  }
}

export default defineStore("ESP32", () => {
  const { config } = useConfigStore()

  const wsData = reactive([])

  const wsOptions = {
    heartbeat: { interval: 5000, pongTimeout: 2000, },
    immediate: config.useESP32,
    autoReconnect: {
      retries: 5, delay: 1000,
      onFailed() { setTimeout(() => { ws.open() }, 20000) },
    },
    onConnected: (ws) => {
      console.warn("WebSocket connected!")
      ws.binaryType = "arraybuffer"
    },
    onDisconnected: () => console.warn('WebSocket disconnected'),
    // onError: () => console.warn('WebSocket ERROR'),
    onMessage: (ws, event) => {
      if (event.data instanceof ArrayBuffer) {
        const parsedRMT = parse_rmt_message_t(event.data)
        store.addWSData(parsedRMT)
      }
    },
  }

  const esp32WSEndpoint = computed(() => config.esp32WSEndpoint)
  let ws = useWebSocket(esp32WSEndpoint, wsOptions)

  watch(() => config.useESP32, () => {
    config.useESP32 ? ws.open() : ws.close()
  })

  function addWSData(data) {
    wsData.push(data)
  }

  const store = { ws, wsData, addWSData }

  return store
})