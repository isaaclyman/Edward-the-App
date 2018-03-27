<template>
  <div>
    <total-users></total-users>
    <hr>
    <space-overages></space-overages>
    <hr>
    <premium-users></premium-users>
    <hr>
    <unverified-users></unverified-users>
    <hr>
    <user-emails></user-emails>
    <hr>
    <comp-accounts></comp-accounts>
  </div>
</template>

<script>
import CompAccounts from './CompAccounts.vue'
import PremiumUsers from './PremiumUsers.vue'
import SpaceOverages from './SpaceOverages.vue'
import TotalUsers from './TotalUsers.vue'
import UnverifiedUsers from './UnverifiedUsers.vue'
import UserEmails from './UserEmails.vue'

export default {
  components: {
    CompAccounts,
    PremiumUsers,
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
