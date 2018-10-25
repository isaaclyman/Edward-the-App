import api from './api'
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
    get: username => new LocalStorageApi(username),
  },
  Demo: {
    cached: null,
    get: () => new DemoStorageApi(),
  },
  Server: {
    cached: null,
    get: username => new ServerStorageApi(username),
  },
  Offline: {
    cached: null,
    get: username => new OfflineStorageApi(username),
  },
}

let waitForInit = Promise.resolve()
const getCached = (storage, username) => {
  if (!storage.cached) {
    storage.cached = storage.get(username)
  }

  if (typeof storage.cached.init === 'function' && storageApi !== storage.cached) {
    waitForInit = storage.cached.init() || Promise.resolve()
  }

  setStorageApi(storage.cached)
  return waitForInit.then(() => storage.cached)
}

export function getStorageApi(user) {
  return api.isOnline().then(() => true, () => false).then((isOnline) => {
    if (!user || !user.accountType) {
      return getCached(cachedStorage.Demo)
    }

    if (user.accountType.name === 'DEMO') {
      return getCached(cachedStorage.Demo)
    }

    if (!user.email) {
      throw new Error('User does not have a valid username/email for initializing storage.')
    }

    if (!user.isPremium) {
      return getCached(cachedStorage.Local, user.email)
    }

    if (!isOnline) {
      return getCached(cachedStorage.Offline, user.email)
    }

    if (user.isPremium) {
      return getCached(cachedStorage.Server, user.email)
    }

    return getCached(cachedStorage.Local, user.email)
  })
}
