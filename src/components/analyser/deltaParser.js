export const GetContentString = (delta) => {
  const inserts = delta.ops.map(op => op.insert || '')
  return inserts.join('')
}

export const GetWordArray = (delta) => {
  return GetContentString(delta).split(/\s/).filter(word => !!word)
}
