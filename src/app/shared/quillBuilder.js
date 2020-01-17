import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const toolbarOptions = [[
  { header: [1, 2, 3, false] },
], [
  'bold', 'italic', 'underline', 'strike', 'blockquote', { list: 'ordered' }, { list: 'bullet' }, 'clean'
]]

const allowedFormats = [
  'header',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'blockquote',
]

const createQuill = (el, placeholder, container, onFullScreen) => {
  const tempToolbar = [...toolbarOptions]
  const handlers = {}
  if (onFullScreen) {
    tempToolbar.push(['fullscreen'])
    handlers.fullscreen = onFullScreen
  }

  const quill = new Quill(el, {
    bounds: container,
    formats: allowedFormats,
    modules: {
      toolbar: {
        container: tempToolbar,
        handlers,
      },
    },
    placeholder,
    theme: 'snow',
  })

  if (onFullScreen) {
    const fullScreenButton = container.querySelector('.ql-fullscreen')
    fullScreenButton.innerHTML = '<div class="fas fa-expand-arrows-alt"></div>'
  }

  return quill
}

export default createQuill
