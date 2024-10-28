import type { PulsesStorage } from "../models/Pulses"
import sample_data from "../store/sample_data.json"

export const usePulsesStore = createGlobalState(() => {
  const { currentSession } = useSessionsStore()

  const pulsesStore = shallowReactive(new PulsesStore(currentSession.value))

  watchImmediate(() => currentSession.value, () => {
    const ps = new PulsesStore(currentSession.value)
    Object.assign(pulsesStore, ps)
    // Object.assign(pulsesStore, new PulsesStore(currentSession.value))
    pulsesStore.loadFromStorage()
  })

  return pulsesStore
})

export function copyToSession(s: string, pulses: PulsesStorage) {
  const { currentSession } = useSessionsStore()
  if (s === currentSession.value) {
    usePulsesStore().add(pulses)
    return
  }
  const ps = new PulsesStore(s)
  ps.loadFromStorage()
  ps.add(pulses)
  ps.saveToStorage()
}

export function loadSamplePulses() {
  const ps = usePulsesStore()
  for (const p of sample_data) {
    ps.add(p)
  }
}
