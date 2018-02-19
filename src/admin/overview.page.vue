<template>
  <div>
    <total-users></total-users>
    <hr>
    <space-overages></space-overages>
    <hr>
    <unverified-users></unverified-users>
    <hr>
    <user-emails></user-emails>
  </div>
</template>

<script>
import SpaceOverages from './SpaceOverages.vue'
import TotalUsers from './TotalUsers.vue'
import UnverifiedUsers from './UnverifiedUsers.vue'
import UserEmails from './UserEmails.vue'

export default {
  components: {
    SpaceOverages,
    TotalUsers,
    UnverifiedUsers,
    UserEmails
  },
  data () {
    return {}
  }
}
</script>

<style>

</style>
