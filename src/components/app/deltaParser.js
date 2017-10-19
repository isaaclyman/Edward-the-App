export const GetContentString = (delta) => {
  if (!delta || !delta.ops) {
    return ''
  }

  const inserts = delta.ops.map(op => op.insert || '')
  return inserts.join('')
}

export const GetWordArray = (delta) => {
  return GetContentString(delta).replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').split(/\s/).filter(word => !!word)
}
