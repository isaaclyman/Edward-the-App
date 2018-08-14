import clone from 'lodash/clone'
import { test } from '../_imports'
import VersionResolver from '../../src/app/shared/versionResolver'

const wait = async () => await new Promise(resolve => setTimeout(resolve, 100))

test('timestamps increment', async t => {
  t.plan(1)

  var obj = {}
  var obj2 = {}
  VersionResolver.timestamp(obj)
  await wait()
  VersionResolver.timestamp(obj2)
  t.true(VersionResolver.getTimestamp(obj2) > VersionResolver.getTimestamp(obj))
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
