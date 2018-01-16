<template>
  <div class="wrap">
    <div v-if="!failed">
      <h1>
        Verifying...
      </h1>
    </div>
    <div v-if="failed">
      <h1>
        Verification failed.
      </h1>
      <p>
        Please try again. If you keep having trouble, email support@edwardtheapp.com.
      </p>
    </div>
    <div>
      <pulse-loader></pulse-loader>
    </div>
  </div>
</template>

<script>
import { goToApp } from './shared'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import userApi from '../components/api/userApi'

export default {
  beforeCreate () {
    const { email, key } = this.$route.params
    userApi.verify(email, key).then(() => {
      goToApp()
    }, () => {
      this.failed = true
    })
  },
  components: {
    PulseLoader
  },
  data () {
    return {
      failed: false
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
