import DemoStorageApi from './demoStorage'
import LocalStorageApi from './localStorage'
import ServerStorageApi from './serverStorage'

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

export function getStorageApi (user, isOffline) {
  if (!user || !user.accountType) {
    return setStorageApi(new LocalStorageApi('unknown'))
  }

  if (user.accountType.name === 'DEMO') {
    return setStorageApi(new DemoStorageApi())
  }

  if (!user.isPremium) {
    return setStorageApi(new LocalStorageApi(user.email))
  }

  if (isOffline) {
    return setStorageApi(new LocalStorageApi(user.email))
  }

  if (user.isPremium) {
    return setStorageApi(new ServerStorageApi())
  }

  return setStorageApi(new LocalStorageApi(user.email))
}
