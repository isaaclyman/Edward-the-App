import tippy from 'tippy.js'

const tooltip = ({ arrow = true, content, distance = 10, el, interactive } = {}) => {
  tippy(el, {
    arrow,
    distance,
    html: content,
    interactive,
    position: 'bottom'
  })
}

export default tooltip
