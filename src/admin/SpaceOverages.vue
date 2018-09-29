<template>
  <div class="stat">
    <div v-if="overages != null">
      <p>Premium Overages: {{ overages.premiums.length }}</p>
      <p>Gold Overages: {{ overages.golds.length }}</p>
      <p v-if="overages.premiums.length">
        <strong>Premium users over 20MB</strong>
      </p>
      <div 
        v-for="user in overages.premiums" 
        :key="user.id">
        <p>
          email: {{ user.email }} | id: {{ user.id }} | space: {{ user.space_used }}
        </p>
      </div>
      <p v-if="overages.golds.length">
        <strong>Gold users over 250MB</strong>
      </p>
      <div 
        v-for="user in overages.golds" 
        :key="user.id">
        <p>
          email: {{ user.email }} | id: {{ user.id }} | space: {{ user.space_used }}
        </p>
      </div>
    </div>
    <div 
      class="error" 
      v-if="error" 
      v-text="error"/>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  beforeCreate() {
    adminApi.getSpaceOverages().then((resp) => {
      this.overages = resp
    }, (err) => {
      this.error = err
    })
  },
  data() {
    return {
      error: null,
      overages: null,
    }
  },
}
</script>

<style scoped>

</style>
