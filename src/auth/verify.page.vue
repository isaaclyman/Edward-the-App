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
    <div v-if="!failed">
      <pulse-loader/>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  beforeCreate() {
    const { email, key } = this.$route.params
    authApi.verify({ email, key }).then(() => {
      this.$router.push('/limited')
    }, () => {
      this.failed = true
    })
  },
  components: {
    PulseLoader,
  },
  data() {
    return {
      failed: false,
    }
  },
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
