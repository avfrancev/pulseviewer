import { usePulsesStore } from '@/models';
import { v4 as uuidv4 } from 'uuid'

export default defineStore("sessions", () => {
  const sessions = reactive([]);

  function addSession(id = null) {
    let session = {
      // id: sessionsCounter++,
      id: id || uuidv4(),
      remove() {
        usePulsesStore(session.id).remove()
        // console.log(usePulsesStore(session.id).$dispose());
        sessions.splice(sessions.indexOf(this), 1)
        // console.log(sessions.length);
      }
    }
    sessions.push(session)
    return session
  }
  
  const sessionsStorage = useLocalStorage("sessions", [])

  function saveToLocalStorage() {
    console.log("saving to local storage", toRaw(sessions));
    sessionsStorage.value = toRaw(sessions)
  }

  watch(sessions, saveToLocalStorage, { deep: true })

  if (sessionsStorage.value.length) {
    sessionsStorage.value.forEach(v => addSession(v.id))
  } else {
    addSession()
  }

  function clearSessions() {
    sessionsStorage.value = []
    sessions.length = 0
  }
  
  return {
    sessions,
    addSession,
    clearSessions,
  }
})

