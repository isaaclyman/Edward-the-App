import tooltip from './tippyBuilder'

const directive = {
  bind: (el, { value = {} }) => {
    const {
      arrow = true, content, distance = 10, interactive = false, enabled = true,
    } = value

    const tippy = tooltip({
      arrow,
      content,
      distance,
      el,
      interactive,
    })

    if (!tippy) {
      console.warn('Expected a Tippy.js instance to be returned')
      return
    }

    if (enabled) {
      return
    }

    tippy.disable()
  },
  update: (el, { value = {} }) => {
    const { enabled = true } = value

    const tippy = el._tippy

    if (!tippy) {
      console.warn('Expected a Tippy.js instance on el with v-tooltip')
      return
    }

    if (enabled) {
      tippy.enable()
    } else {
      tippy.disable()
    }
  },
}

export default directive
