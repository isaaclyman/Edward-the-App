<template>
  <div class="wrap">
    <h4>This is a restricted Admin page.</h4>
    <total-users></total-users>
    <space-overages></space-overages>
  </div>
</template>

<script>
import SpaceOverages from './SpaceOverages.vue'
import TotalUsers from './TotalUsers.vue'

export default {
  components: {
    SpaceOverages,
    TotalUsers
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
.wrap {
  padding: 10px;
}
</style>
