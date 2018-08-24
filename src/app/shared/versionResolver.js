import clone from 'lodash/clone'

class VersionResolver {
  constructor () {
    this.timestampField = 'updated_at'
  }

  timestamp (obj) {
    obj[this.timestampField] = Date.now()
  }

  timestampEach (arr) {
    arr.forEach(obj => this.timestamp(obj))
  }

  getTimestamp (obj) {
    if (!obj[this.timestampField]) {
      return null
    }
    return new Date(obj[this.timestampField]).getTime()
  }

  getMostRecent (defaultObj, obj2) {
    const defaultTimestamp = this.getTimestamp(defaultObj)
    const timestamp2 = this.getTimestamp(obj2)

    if (!!timestamp2 && timestamp2 > defaultTimestamp) {
      return obj2
    }

    return defaultObj
  }

  getMostRecentEach (defaultArr, arr2, matchBy, markAsDeleted) {
    const returnList = clone(defaultArr)

    for (let index in returnList) {
      const obj = returnList[index]
      const arr2match = arr2.find(arrObj => matchBy(arrObj) === matchBy(obj))

      if (!arr2match) {
        markAsDeleted(obj)
      }
    }

    for (let index in arr2) {
      const obj = clone(arr2[index])
      const defaultMatch = returnList.find(returnObj => matchBy(returnObj) === matchBy(obj))

      if (!defaultMatch) {
        markAsDeleted(obj)
        returnList.splice(index, 0, obj)
        continue
      }

      const replacement = this.getMostRecent(defaultMatch, obj)
      if (replacement === defaultMatch) {
        continue
      }

      returnList.splice(returnList.indexOf(defaultMatch), 1, replacement)
    }

    return returnList
  }
}

export default new VersionResolver()
