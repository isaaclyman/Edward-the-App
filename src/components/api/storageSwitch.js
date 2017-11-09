import LocalStorageApi from './localStorage'
import ServerStorageApi from './serverStorage'

let storageApiResolve
export const storageApiPromise = new Promise((resolve) => {
  storageApiResolve = resolve
})

export function getStorageApi (user, state) {
  let storage
  if (user && user.isPremium) {
    storage = new ServerStorageApi(state)
  } else {
    storage = new LocalStorageApi()
  }

  storageApiResolve(storage)
  return storage
}
