import DemoStorageApi from './demoStorage'
import LocalStorageApi from './localStorage'
import ServerStorageApi from './serverStorage'
import OfflineStorageApi from './offlineStorage'

let storageApi
let temporaryStoragePromiseResolve
const temporaryStoragePromise = new Promise((resolve) => {
  temporaryStoragePromiseResolve = resolve
})

const setStorageApi = function (storage) {
  if (!storageApi) {
    temporaryStoragePromiseResolve(storage)
  }

  storageApi = storage
  return storage
}

export const storageApiPromise = function () {
  if (storageApi) {
    return Promise.resolve(storageApi)
  }

  return temporaryStoragePromise
}

const cachedStorage = {
  Local: {
    cached: null,
    get: username => new LocalStorageApi(username)
  },
  Demo: {
    cached: null,
    get: () => new DemoStorageApi()
  },
  Server: {
    cached: null,
    get: () => new ServerStorageApi()
  },
  Offline: {
    cached: null,
    get: username => new OfflineStorageApi(username)
  }
}

const getCached = (storage, username = 'unknown') => {
  if (!storage.cached) {
    storage.cached = storage.get(username)
  }

  if (typeof storage.cached.init === 'function' && storageApi !== storage.cached) {
    return storage.cached.init().then(() => {
      setStorageApi(storage.cached)
      return storage.cached
    })
  }

  setStorageApi(storage.cached)
  return Promise.resolve(storage.cached)
}

export function getStorageApi (user, isOffline) {
  if (!user || !user.accountType) {
    return getCached(cachedStorage.Local)
  }

  if (user.accountType.name === 'DEMO') {
    return getCached(cachedStorage.Demo)
  }

  if (!user.isPremium) {
    return getCached(cachedStorage.Local, user.email)
  }

  if (isOffline) {
    return getCached(cachedStorage.Offline, user.email)
  }

  if (user.isPremium) {
    return getCached(cachedStorage.Server)
  }

  return getCached(cachedStorage.Local, user.email)
}
