import clone from 'lodash/clone'
import { test } from '../_imports'
import VersionResolver from '../../src/app/shared/versionResolver'

const wait = async () => await new Promise(resolve => setTimeout(resolve, 50))

test('timestamps increment', async t => {
  t.plan(1)

  var obj1 = {}
  var obj2 = {}
  VersionResolver.timestamp(obj1)
  await wait()
  VersionResolver.timestamp(obj2)
  t.true(VersionResolver.getTimestamp(obj2) > VersionResolver.getTimestamp(obj1))
})

test('timestampEach timestamps each element', t => {
  var arr = [{}, {}, {}]
  VersionResolver.timestampEach(arr)
  t.true(arr.every(obj => !!VersionResolver.getTimestamp(obj)))
})

test('getMostRecent returns the most recently timestamped element or default', async t => {
  var oldObj = {}
  var newObj = {}
  VersionResolver.timestamp(oldObj)
  var sameObj = clone(oldObj)
  await wait()
  VersionResolver.timestamp(newObj)

  t.is(VersionResolver.getMostRecent(oldObj, newObj), newObj)
  t.is(VersionResolver.getMostRecent(newObj, oldObj), newObj)
  t.is(VersionResolver.getMostRecent(oldObj, sameObj), oldObj)
  t.is(VersionResolver.getMostRecent(sameObj, oldObj), sameObj)
})

test('getMostRecentEach returns an empty array if two empty arrays are passed (with string matcher)', t => {
  var result = VersionResolver.getMostRecentEach([], [], obj => `${obj.id}`, obj => { obj.deleted = true })
  t.true(Array.isArray(result))
  t.is(0, result.length)
})

test('getMostRecentEach replaces every item in an array if it is empty (with string matcher)', t => {
  var arr1 = []
  var arr2 = [{id: 1}, {id: 2}]

  var result = VersionResolver.getMostRecentEach(arr1, arr2, obj => `${obj.id}`, obj => { obj.deleted = true })

  t.is(2, result.length)
  t.true(result.some(obj => obj.id === 1))
  t.true(result.some(obj => obj.id === 2))
})

test('getMostRecentEach merges two arrays, marking exclusive items as deleted', t => {
  var [obj1, obj2, obj3, obj4, obj5] = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: undefined}]
  var arr1 = [obj1, obj2]
  var arr2 = [obj1, obj3, obj4, obj5]
  
  var result = VersionResolver.getMostRecentEach(arr1, arr2, obj => obj.id, obj => { obj.deleted = true })
  
  t.true(result.some(obj => obj.id === 1))
  t.true(result.some(obj => obj.id === 2))
  t.true(result.some(obj => obj.id === 3))
  t.true(result.some(obj => obj.id === 4))
  t.false(result.some(obj => obj.id === undefined))

  t.falsy(result.find(obj => obj.id === 1).deleted)
  t.true(result.find(obj => obj.id === 2).deleted)
  t.true(result.find(obj => obj.id === 3).deleted)
  t.true(result.find(obj => obj.id === 4).deleted)  

  t.true(result.every(obj => !!obj.id))
})

test('getMostRecentEach merges two arrays, keeping the most recent version of each element', async t => {
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
    t.true(result.some(resultObj => resultObj.id === obj.id))
  }

  t.falsy(result.find(obj => obj.id === 1).isNew)
  t.true(result.find(obj => obj.id === 2).isNew)
  t.true(result.find(obj => obj.id === 3).isNew)
  t.true(result.find(obj => obj.id === 4).isNew)
  t.falsy(result.find(obj => obj.id === 5).isNew)
  t.falsy(result.find(obj => obj.id === 6).isNew)
})
