import utilities from '../../api/utilities'

test('containSameElements is true when it should be', () => {
  const arr1 = ['bob', 3, undefined, 'foo']
  const arr2 = [undefined, 'bob', 'foo', 3]

  expect(utilities.containSameElements(arr1, arr2)).toBeTruthy()
  expect(utilities.containSameElements(arr2, arr1)).toBeTruthy()
})

test('containSameElements is false when it should be', () => {
  const arr1 = ['bob', 3, undefined, undefined]
  const arr2 = ['bob', 3, undefined, null]
  const arr3 = ['bob', 'sam', 3, undefined]

  expect(utilities.containSameElements(arr1, arr2)).toBeFalsy()
  expect(utilities.containSameElements(arr2, arr1)).toBeFalsy()
  expect(utilities.containSameElements(arr1, arr3)).toBeFalsy()
  expect(utilities.containSameElements(arr2, arr3)).toBeFalsy()
})
