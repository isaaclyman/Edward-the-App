<template>
  <div class="wrap">
    <h4>This is a restricted Admin page.</h4>
    <hr>
    <total-users></total-users>
    <hr>
    <space-overages></space-overages>
    <hr>
    <unverified-users></unverified-users>
  </div>
</template>

<script>
import SpaceOverages from './SpaceOverages.vue'
import TotalUsers from './TotalUsers.vue'
import UnverifiedUsers from './UnverifiedUsers.vue'

export default {
  components: {
    SpaceOverages,
    TotalUsers,
    UnverifiedUsers
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
