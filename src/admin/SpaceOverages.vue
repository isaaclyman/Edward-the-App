<template>
  <div class="stat">
    <div v-if="overages != null">
      <p>Premium Overages: {{overages.premiums.length}}</p>
      <p>Gold Overages: {{overages.golds.length}}</p>
    </div>
    <div class="error" v-if="error" v-text="error"></div>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  beforeCreate () {
    adminApi.getSpaceOverages().then(resp => {
      this.overages = resp
    }, err => {
      this.error = err
    })
  },
  data () {
    return {
      error: null,
      overages: null
    }
  }
}
</script>

<style scoped>

</style>
