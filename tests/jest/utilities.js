import { orderPromises } from '../../utilities'
import { setTimeout } from 'timers';

const getPromiseFn = (callback, timeout) =>
  () =>
    new Promise((resolve, reject) =>
      setTimeout(() =>
        resolve(callback()), timeout || 10
      )
    )

test(`handles an empty array`, async () => {
  let resolved = false
  await orderPromises([]).then(() => { resolved = true })
  expect(resolved).toBe(true)
})

test(`handles an array with one item`, async () => {
  let resolved = false
  const promiseFns = [getPromiseFn(() => { resolved = true })]
  await orderPromises(promiseFns)
  expect(resolved).toBe(true)
})

test(`handles an array with two items`, async () => {
  let resolved = [false, false]
  const promiseFns = [
    getPromiseFn(() => { resolved[0] = true }),
    getPromiseFn(() => { resolved[1] = true })
  ]
  await orderPromises(promiseFns)
  expect(resolved.every(didResolve => didResolve === true)).toBe(true)
})

test(`executes an array of 4 functions in order`, async done => {
  let resolved = [false, false, false, false]
  const promiseFns = [
    getPromiseFn(() => { resolved[0] = true }, 5),
    getPromiseFn(() => {
      if (resolved[0] !== true) done.fail()
      resolved[1] = true
    }, 50),
    getPromiseFn(() => {
      if (resolved[0] !== true || resolved[1] !== true) done.fail()
      resolved[2] = true
    }, 200),
    getPromiseFn(() => {
      if (resolved[0] !== true || resolved[1] !== true || resolved[2] !== true) done.fail()
      resolved[3] = true
    }, 10)
  ]
  await orderPromises(promiseFns)
  expect(resolved.every(didResolve => didResolve === true)).toBe(true)
  done()
})

test(`executes each function only once`, async () => {
  let resolved = [0, 0, 0, 0]
  const promiseFns = [
    getPromiseFn(() => { resolved[0]++ }),
    getPromiseFn(() => { resolved[1]++ }),
    getPromiseFn(() => { resolved[2]++ }),
    getPromiseFn(() => { resolved[3]++ })
  ]
  await orderPromises(promiseFns)
  expect(resolved.every(times => times === 1)).toBe(true)
})

test(`fails if an array is not passed`, async done => {
  try {
    await orderPromises(null)
    done.fail()
  } catch (e) {
    expect(e instanceof TypeError).toBe(true)
    done()
  }
})

test(`fails if the array contains something that is not a function`, async done => {
  try {
    await orderPromises([getPromiseFn(() => null), null])
    done.fail()
  } catch (e) {
    expect(e instanceof TypeError).toBe(true)
    done()
  }
})

test(`fails if one of the functions in the array doesn't return a promise`, async done => {
  try {
    await orderPromises([getPromiseFn(() => null), () => null])
    done.fail()
  } catch (e) {
    expect(e instanceof TypeError).toBe(true)
    done()
  }
})