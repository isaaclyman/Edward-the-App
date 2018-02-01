import { test } from './_imports'
import { orderPromises } from '../utilities'
import { setTimeout } from 'timers';

const getPromiseFn = (callback, timeout) =>
  () =>
    new Promise((resolve, reject) =>
      setTimeout(() =>
        resolve(callback()), timeout || 10
      )
    )

test(`handles an empty array`, async t => {
  let resolved = false
  await orderPromises([]).then(() => { resolved = true }, t.fail)
  t.is(resolved, true)
})

test(`handles an array with one item`, async t => {
  let resolved = false
  const promiseFns = [getPromiseFn(() => { resolved = true })]
  await orderPromises(promiseFns).then(undefined, t.fail)
  t.is(resolved, true)
})

test(`handles an array with two items`, async t => {
  let resolved = [false, false]
  const promiseFns = [
    getPromiseFn(() => { resolved[0] = true }),
    getPromiseFn(() => { resolved[1] = true })
  ]
  await orderPromises(promiseFns).then(undefined, t.fail)
  t.true(resolved.every(didResolve => didResolve === true))
})

test(`executes an array of 4 functions in order`, async t => {
  let resolved = [false, false, false, false]
  const promiseFns = [
    getPromiseFn(() => { resolved[0] = true }, 5),
    getPromiseFn(() => {
      if (resolved[0] !== true) t.fail()
      resolved[1] = true
    }, 50),
    getPromiseFn(() => {
      if (resolved[0] !== true || resolved[1] !== true) t.fail()
      resolved[2] = true
    }, 200),
    getPromiseFn(() => {
      if (resolved[0] !== true || resolved[1] !== true || resolved[2] !== true) t.fail()
      resolved[3] = true
    }, 10)
  ]
  await orderPromises(promiseFns).then(undefined, t.fail)
  t.true(resolved.every(didResolve => didResolve === true))
})

test(`fails if an array is not passed`, async t => {
  try {
    await orderPromises(null)
    t.fail()
  } catch (e) {
    t.true(e instanceof TypeError)
  }
})

test(`fails if the array contains something that is not a function`, async t => {
  try {
    await orderPromises([getPromiseFn(() => null), null])
    t.fail()
  } catch (e) {
    t.true(e instanceof TypeError)
  }
})

test(`fails if one of the functions in the array doesn't return a promise`, async t => {
  try {
    await orderPromises([getPromiseFn(() => null), () => null])
    t.fail()
  } catch (e) {
    t.true(e instanceof TypeError)
  }
})