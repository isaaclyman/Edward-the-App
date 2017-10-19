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

import DeltaToHtmlConverter from 'quill-delta-to-html'
export const GetHtml = (delta) => {
  if (!delta || !delta.ops) {
    return ''
  }

  const converter = new DeltaToHtmlConverter(delta.ops, {})
  return converter.convert()
}
