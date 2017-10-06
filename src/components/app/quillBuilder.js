import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

const toolbarOptions = [[
  { 'header': [1, 2, 3, false] }
], [
  'bold', 'italic', 'underline', 'strike'
], [
  { 'list': 'ordered' }, { 'list': 'bullet' }
], [
  'blockquote'
], [
  'clean'
]]

const allowedFormats = [
  'header',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'blockquote'
]

const createQuill = (el, placeholder) => {
  return new Quill(el, {
    formats: allowedFormats,
    modules: {
      toolbar: toolbarOptions
    },
    placeholder,
    theme: 'snow'
  })
}

export default createQuill
