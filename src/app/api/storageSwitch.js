import DemoStorageApi from './demoStorage'
import LocalStorageApi from './localStorage'
import ServerStorageApi from './serverStorage'

let storageApi
const setStorageApi = function(storage) {
  storageApi = storage
  return storage
}

export const storageApiPromise = function () {
  return Promise.resolve(storageApi)
}

export function getStorageApi (user, isOffline) {
  if (!user || !user.accountType) {
    return setStorageApi(new LocalStorageApi())
  }

  if (user.accountType.name === 'DEMO') {
    return setStorageApi(new DemoStorageApi())
  }

  if (!user.isPremium) {
    return setStorageApi(new LocalStorageApi())
  }

  if (isOffline) {
    return setStorageApi(new LocalStorageApi())
  }

  if (user.isPremium) {
    return setStorageApi(new ServerStorageApi())
  }

  return setStorageApi(new LocalStorageApi())
}
