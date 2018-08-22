import tooltip from './tippyBuilder'

const directive = {
  bind: (el, { value = {} }) => {
    const { content, distance = 10, interactive = false, enabled = true } = value

    tooltip({
      content,
      distance,
      el,
      interactive
    })

    if (enabled) {
      return
    }

    if (!el._tippy) {
      console.warn('Expected a Tippy.js instance on el with v-tooltip')
      return
    }

    el._tippy.disable()
  },
  update: (el, { value = {} }) => {
    const { enabled = true } = value

    if (!el._tippy) {
      console.warn('Expected a Tippy.js instance on el with v-tooltip')
      return
    }

    if (enabled) {
      el._tippy.enable()
    } else {
      el._tippy.disable()
    }
  }
}

export default directive
