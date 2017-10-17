<template>
  <div ref="recaptcha"></div>
</template>

<script>
export default {
  data () {
    return {}
  },
  mounted () {
    const placeholderEl = this.$refs.recaptcha
    placeholderEl.innerHTML = ''

    window.grecaptcha.render(placeholderEl, {
      callback: (response) => {
        this.$emit('change', response)
      },
      'expired-callback': () => {
        this.$emit('expire')
      },
      sitekey: '6LfxrTQUAAAAAKZHrZj_kqcmaVoYBcExGAfEN8kf'
    })
  }
}
</script>

<style scoped>

</style>
