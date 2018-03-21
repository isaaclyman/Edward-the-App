const allCacheKeys = []

export function resetCache () {
  for (const key of allCacheKeys) {
    window.localStorage.removeItem(key)
  }
  allCacheKeys.splice(0, allCacheKeys.length)
}

class Cache {
  constructor (key) {
    this.key = key
    allCacheKeys.push(key)
  }

  cacheDelete () {
    window.localStorage.removeItem(this.key)
  }

  cacheGet () {
    return JSON.parse(window.localStorage.getItem(this.key))
  }

  cacheSet (val) {
    window.localStorage.setItem(this.key, JSON.stringify(val))
  }
}

export default Cache
