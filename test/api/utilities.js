import { test } from '../_imports'
import utilities from '../../api/utilities'

test('containSameElements is true when it should be', t => {
  const arr1 = ['bob', 3, undefined, 'foo']
  const arr2 = [undefined, 'bob', 'foo', 3]

  t.truthy(utilities.containSameElements(arr1, arr2))
  t.truthy(utilities.containSameElements(arr2, arr1))
})

test('containSameElements is false when it should be', t => {
  const arr1 = ['bob', 3, undefined, undefined]
  const arr2 = ['bob', 3, undefined, null]
  const arr3 = ['bob', 'sam', 3, undefined]

  t.falsy(utilities.containSameElements(arr1, arr2))
  t.falsy(utilities.containSameElements(arr2, arr1))
  t.falsy(utilities.containSameElements(arr1, arr3))
  t.falsy(utilities.containSameElements(arr2, arr3))
})
