const difference = require('lodash/difference')

const utilities = {}

utilities.containSameElements = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false
  }

  if (arr1.length !== arr2.length) {
    return false
  }

  const diff = [...difference(arr1, arr2), ...difference(arr2, arr1)]

  return diff.length === 0
}

module.exports = utilities
