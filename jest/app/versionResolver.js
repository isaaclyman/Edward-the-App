import clone from 'lodash/clone'
import VersionResolver from '../../src/app/shared/versionResolver'

const wait = async () => await new Promise(resolve => setTimeout(resolve, 50))

test('timestamps increment', async () => {
  expect.assertions(1)

  var obj1 = {}
  var obj2 = {}
  VersionResolver.timestamp(obj1)
  await wait()
  VersionResolver.timestamp(obj2)
  expect(VersionResolver.getTimestamp(obj2) > VersionResolver.getTimestamp(obj1)).toBe(true)
})

test('timestampEach timestamps each element', () => {
  var arr = [{}, {}, {}]
  VersionResolver.timestampEach(arr)
  expect(arr.every(obj => !!VersionResolver.getTimestamp(obj))).toBe(true)
})

test('getMostRecent returns the most recently timestamped element or default', async () => {
  var oldObj = {}
  var newObj = {}
  VersionResolver.timestamp(oldObj)
  var sameObj = clone(oldObj)
  await wait()
  VersionResolver.timestamp(newObj)

  expect(VersionResolver.getMostRecent(oldObj, newObj)).toBe(newObj)
  expect(VersionResolver.getMostRecent(newObj, oldObj)).toBe(newObj)
  expect(VersionResolver.getMostRecent(oldObj, sameObj)).toBe(oldObj)
  expect(VersionResolver.getMostRecent(sameObj, oldObj)).toBe(sameObj)
})

test('getMostRecent correctly handles different timestamp formats', () => {
  var oldObj = { updated_at: '2018-09-04T09:24:48.783Z' }
  var newObj = { updated_at: 1536117990932 }
  
  expect(VersionResolver.getMostRecent(oldObj, newObj)).toBe(newObj)
})

test('getMostRecentEach returns an empty array if two empty arrays are passed (with string matcher)', () => {
  var result = VersionResolver.getMostRecentEach([], [], obj => `${obj.id}`, obj => { obj.deleted = true })
  expect(Array.isArray(result)).toBe(true)
  expect(0).toBe(result.length)
})

test('getMostRecentEach replaces every item in an array if it is empty (with string matcher)', () => {
  var arr1 = []
  var arr2 = [{id: 1}, {id: 2}]

  var result = VersionResolver.getMostRecentEach(arr1, arr2, obj => `${obj.id}`, obj => { obj.deleted = true })

  expect(2).toBe(result.length)
  expect(result.some(obj => obj.id === 1)).toBe(true)
  expect(result.some(obj => obj.id === 2)).toBe(true)
})

test('getMostRecentEach merges two arrays, marking exclusive items as deleted', () => {
  var [obj1, obj2, obj3, obj4, obj5] = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: undefined}]
  var arr1 = [obj1, obj2]
  var arr2 = [obj1, obj3, obj4, obj5]
  
  var result = VersionResolver.getMostRecentEach(arr1, arr2, obj => obj.id, obj => { obj.deleted = true })
  
  expect(result.some(obj => obj.id === 1)).toBe(true)
  expect(result.some(obj => obj.id === 2)).toBe(true)
  expect(result.some(obj => obj.id === 3)).toBe(true)
  expect(result.some(obj => obj.id === 4)).toBe(true)
  expect(result.some(obj => obj.id === undefined)).toBe(false)

  expect(result.find(obj => obj.id === 1).deleted).toBeFalsy()
  expect(result.find(obj => obj.id === 2).deleted).toBe(true)
  expect(result.find(obj => obj.id === 3).deleted).toBe(true)
  expect(result.find(obj => obj.id === 4).deleted).toBe(true)  

  expect(result.every(obj => !!obj.id)).toBe(true)
})

test('getMostRecentEach merges two arrays, keeping the most recent version of each element', async () => {
  var [obj1, obj2, obj3, obj4, obj5, obj6] = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}]
  var [new2, new3, new4] = [{id: 2}, {id: 3}, {id: 4}].map(obj => {
      obj.isNew = true
      return obj
    })
  
  var fullArr = [obj1, obj2, obj3, obj4, obj5, obj6]
  for (var obj of fullArr) {
    await wait()
    VersionResolver.timestamp(obj)
  }

  var newArr = [new2, new3, new4]
  for (var obj of newArr) {
    await wait()
    VersionResolver.timestamp(obj)
  }

  var arr1 = [obj1, new2, obj4, obj5]
  var arr2 = [obj1, obj2, new3, new4, obj6]

  var result = VersionResolver.getMostRecentEach(arr1, arr2, obj => obj.id, () => {})

  for (var obj of fullArr) {
    expect(result.some(resultObj => resultObj.id === obj.id)).toBe(true)
  }

  expect(result.find(obj => obj.id === 1).isNew).toBeFalsy()
  expect(result.find(obj => obj.id === 2).isNew).toBe(true)
  expect(result.find(obj => obj.id === 3).isNew).toBe(true)
  expect(result.find(obj => obj.id === 4).isNew).toBe(true)
  expect(result.find(obj => obj.id === 5).isNew).toBeFalsy()
  expect(result.find(obj => obj.id === 6).isNew).toBeFalsy()
})
