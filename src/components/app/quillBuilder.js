import Octicons from 'octicons'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import tooltip from './tippyBuilder'

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
        handlers: handlers
      }
    },
    placeholder,
    theme: 'snow'
  })

  if (onFullScreen) {
    const arrowUpSvg = Octicons['device-desktop'].toSVG({
      height: 30
    })
    const fullScreenButton = document.querySelector('.ql-fullscreen')
    fullScreenButton.title = 'Full-screen writing mode'
    fullScreenButton.innerHTML = arrowUpSvg

    tooltip({
      distance: 10,
      el: fullScreenButton,
      interactive: false,
      position: 'top'
    })
  }

  return quill
}

export default createQuill
