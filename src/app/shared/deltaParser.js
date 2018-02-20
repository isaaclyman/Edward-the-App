import TrimEnd from 'lodash/trimEnd'
import TrimStart from 'lodash/trimStart'

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
  return tokens.map(token => {
    token = TrimEnd(token, `.,;:?!"'\``)
    token = TrimStart(token, `"'\``)
    return token
  }).filter(token =>
    wordStartRe.test(token) && wordContentRe.test(token)
  )
}

import DeltaToHtmlConverter from 'quill-delta-to-html'
export const GetHtml = (delta) => {
  if (!delta || !delta.ops) {
    return ''
  }

  const converter = new DeltaToHtmlConverter(delta.ops, {})
  return converter.convert()
}
