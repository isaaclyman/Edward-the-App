function orderPromises (promiseFns) {
  if (!Array.isArray(promiseFns) || (promiseFns.length && typeof promiseFns[0] !== 'function')) {
    throw new TypeError(`orderPromises expects an array of functions. Received: ${promiseFns}`)
  }

  if (!promiseFns.length) {
    return Promise.resolve()
  }

  const promise = promiseFns[0]()

  if (!promise.then) {
    throw new TypeError(`A function in the array passed to orderPromises did not return a promise. Returned: ${promise}`)
  }

  return promiseFns[0]().then(() => {
    return orderPromises(promiseFns.slice(1))
  })
}

module.exports = {
  orderPromises
}
