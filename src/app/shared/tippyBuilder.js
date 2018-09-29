import tippy from 'tippy.js'

const tooltip = ({
  arrow = true, content, distance = 10, el, interactive, placement = 'bottom', hideOnClick = true,
} = {}) => tippy.one(el, {
  arrow,
  distance,
  hideOnClick,
  html: content,
  interactive,
  placement,
})

export default tooltip
