<template>
  <div ref="recaptcha"></div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    mountCaptcha () {
      if (!window.grecaptcha) {
        return false
      }

      const placeholderEl = this.$refs.recaptcha
      placeholderEl.innerHTML = ''

      console.log('captcha tabindex', this.tabindex)
      window.grecaptcha.render(placeholderEl, {
        tabIndex: this.tabindex,
        callback: (response) => {
          this.$emit('change', response)
        },
        'expired-callback': () => {
          this.$emit('expire')
        },
        sitekey: window.recaptchaSiteKey
      })
      return true
    },
    reset () {
      if (window.grecaptcha) {
        window.grecaptcha.reset()
      }
    }
  },
  mounted () {
    const interval = window.setInterval(() => {
      const success = this.mountCaptcha()
      if (success) {
        window.clearInterval(interval)
      }
    }, 100)
  },
  props: {
    tabindex: {
      required: true,
      type: Number
    }
  }
}
</script>

<style scoped>

</style>
