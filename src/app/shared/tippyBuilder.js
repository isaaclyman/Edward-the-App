import tippy from 'tippy.js'

const tooltip = ({ arrow = true, content, distance = 10, el, interactive, position = 'bottom' } = {}) => {
  tippy(el, {
    arrow,
    distance,
    html: content,
    interactive,
    position
  })
}

export default tooltip
