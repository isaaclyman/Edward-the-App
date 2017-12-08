class Cache {
  constructor (key) {
    this.key = key
  }

  cacheGet () {
    return JSON.parse(window.localStorage.getItem(this.key))
  }

  cacheSet (val) {
    window.localStorage.setItem(this.key, JSON.stringify(val))
  }
}

export default Cache
