import TrimEnd from 'lodash/trimEnd'
import TrimStart from 'lodash/trimStart'

import DeltaToHtmlConverter from 'quill-delta-to-html'

export const GetContentString = (delta) => {
  if (!delta || !delta.ops) {
    return ''
  }

  const inserts = delta.ops.map(op => op.insert || '')
  const joined = inserts.join('')
  return joined.trim().length ? joined : ''
}

const wordStartRe = /^[a-zA-Z0-9'\-_@&]/
const wordContentRe = /[a-zA-Z0-9]+/
export const GetWordArray = (delta) => {
  const content = GetContentString(delta)
  const tokens = content.split(/\s/g)
  return tokens.map((token) => {
    token = TrimEnd(token, '.,;:?!"\'`')
    token = TrimStart(token, '"\'`')
    return token
  }).filter(token =>
    wordStartRe.test(token) && wordContentRe.test(token))
}
export const GetHtml = (delta) => {
  if (!delta || !delta.ops) {
    return ''
  }

  const converter = new DeltaToHtmlConverter(delta.ops, {})
  return converter.convert()
}

// Inspired by Tim Down
// https://stackoverflow.com/a/3410557/4347245
export const GetIndicesOf = (search, str) => {
  const fullString = str.toLowerCase()
  const searchString = search.toLowerCase()

  const searchStringLength = searchString.length
  if (searchStringLength === 0 || !fullString.trim()) {
    return []
  }

  const indices = []
  let startIndex = 0
  let index = fullString.indexOf(searchString, startIndex)
  while (index > -1) {
    indices.push(index)
    startIndex = index + searchStringLength
    index = fullString.indexOf(searchString, startIndex)
  }

  return indices
}
