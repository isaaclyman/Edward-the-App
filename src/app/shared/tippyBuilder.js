import tippy from 'tippy.js'

const tooltip = ({
  arrow = true, content, distance = 10, el, interactive, placement = 'bottom', hideOnClick = true,
} = {}) => tippy(el, {
  arrow,
  distance,
  hideOnClick,
  content,
  interactive,
  placement,
})

export default tooltip
