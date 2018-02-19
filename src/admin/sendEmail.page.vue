<template>
  <div class="wrap">
    <div v-if="!error && !success">
      <pulse-loader></pulse-loader>
    </div>
    <div v-if="error">
      <h4>
        Email failed to send.
      </h4>
      <p v-text="error"></p>
    </div>
    <div v-if="success">
      <h4>
        Email sent.
      </h4>
    </div>
    <router-link to="/overview">
      Back to overview
    </router-link>
  </div>
</template>

<script>
import adminApi from './api'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  beforeCreate () {
    const { id } = this.$route.params
    adminApi.sendEmail({ id }).then(() => {
      this.success = true
    }, err => {
      this.error = err
    })
  },
  components: {
    PulseLoader
  },
  data () {
    return {
      error: null,
      success: false
    }
  }
}
</script>

<style scoped>
.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>
