import tooltip from './tippyBuilder'

const directive = {
  bind: (el, { value = {} }) => {
    const { content, distance = 10, interactive = false } = value

    tooltip({
      content,
      distance,
      el,
      interactive
    })
  }
}

export default directive
