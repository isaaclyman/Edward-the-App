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

      window.grecaptcha.render(placeholderEl, {
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
  }
}
</script>

<style scoped>

</style>
