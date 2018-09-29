<template>
  <div ref="recaptcha"/>
</template>

<script>
export default {
  created() {
    const iframeInterval = setInterval(() => {
      const iframe = this.$refs.recaptcha && this.$refs.recaptcha.querySelector('iframe')
      if (iframe) {
        iframe.setAttribute('tabindex', this.tabindex)
        clearInterval(iframeInterval)
      }
    }, 100)
  },
  data() {
    return {}
  },
  methods: {
    mountCaptcha() {
      if (!window.grecaptcha || !window.grecaptcha.render) {
        return false
      }

      const placeholderEl = this.$refs.recaptcha
      placeholderEl.innerHTML = ''

      window.grecaptcha.render(placeholderEl, {
        tabindex: this.tabindex,
        callback: (response) => {
          this.$emit('change', response)
        },
        'expired-callback': () => {
          this.$emit('expire')
        },
        sitekey: window.recaptchaSiteKey,
      })
      return true
    },
    reset() {
      if (window.grecaptcha) {
        window.grecaptcha.reset()
      }
    },
  },
  mounted() {
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
      type: Number,
    },
  },
}
</script>

<style scoped>

</style>
