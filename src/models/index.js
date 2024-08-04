import PulsesModel from "./Pulses"
import ViewModel from "./View"

export function makeSeparatedStore(defineStore) {
  const definedStores = new Map();
  return (storeKey) => {
    if (!definedStores.has(storeKey)) {
      definedStores.set(storeKey, defineStore(storeKey));
    }
    return definedStores.get(storeKey)();
  }
}

const useViewStore = makeSeparatedStore((key) => defineStore(`view-${key}`, ViewModel.bind(null, key)))
const usePulsesStore = makeSeparatedStore((key) => defineStore(`pulses-${key}`, PulsesModel.bind(null, key)))

export { 
  useViewStore, usePulsesStore,
}