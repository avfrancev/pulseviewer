import { defineStore } from "pinia"

export default defineStore(`config-store`, () => {
  const storage = useStorage(
    "config",
    {
      useESP32Api: false,
      esp32ApiEndpint: "http://localhost/",
    },
    null,
    { mergeDefaults: true },
  )
  return { storage }
})
