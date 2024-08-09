import { usePulsesStore } from "@/models"

export default defineStore("config", () => {
  
  const config = useStorage("config", reactive({
    useESP32: false,
    esp32WSEndpoint: window.location.origin+"/ws",
    pinMeasurements: true,
  }), localStorage, { mergeDefaults: false })

  return {
    config,
  }
})
