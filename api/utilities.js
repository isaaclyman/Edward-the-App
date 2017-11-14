const difference = require('lodash/difference')

const utilities = {}

// This does not behave reliably for arrays that have duplicated elements.
// For the purposes of this app, that's not a concern.
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
