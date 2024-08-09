import { usePulsesStore } from "@/models"
import { v4 as uuidv4 } from "uuid"

export default defineStore("sessions", () => {
  
  const sessions = reactive([])

  function createSession(id = null) {
    return {
      // id: sessionsCounter++,
      id: id || uuidv4(),
      remove() {
        usePulsesStore(this.id).remove()
        sessions.splice(sessions.indexOf(this), 1)
      },
    }
  }

  function addSession(id = null, prepand = false) {
    const s = sessions.find((s) => s.id === id)
    if (s) return s
    let session = createSession(id)
    if (prepand) sessions.unshift(session)
    else sessions.push(session)
    return session
  }

  const sessionsStorage = useLocalStorage("sessions", [])

  function saveToLocalStorage() {
    sessionsStorage.value = toRaw(sessions)
  }

  watch(sessions, saveToLocalStorage, { deep: true })

  if (sessionsStorage.value.length) {
    sessionsStorage.value.forEach((v) => addSession(v.id))
  }

  function clearSessions() {
    sessionsStorage.value = []
    sessions.length = 0
  }

  function removeSessionById(id) {
    let idx = sessions.indexOf(sessions.find((s) => s.id === id))
    if (idx === -1) return
    sessions.splice(idx, 1)
  }

  return {
    sessions,
    addSession,
    clearSessions,
    removeSessionById,
  }
})
