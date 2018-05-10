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
    <user-id></user-id>
    <hr>
    <backup-recover></backup-recover>
    <hr>
    <user-emails></user-emails>
    <hr>
    <!-- Comping accounts doesn't really work yet (can't migrate content from the user's computer without an explicit flow).
    For now I can do it manually. -->
    <!-- <comp-accounts></comp-accounts> -->
  </div>
</template>

<script>
import BackupRecover from './BackupRecover.page.vue'
import CompAccounts from './CompAccounts.vue'
import PremiumUsers from './PremiumUsers.vue'
import SpaceOverages from './SpaceOverages.vue'
import TotalUsers from './TotalUsers.vue'
import UnverifiedUsers from './UnverifiedUsers.vue'
import UserEmails from './UserEmails.vue'
import UserId from './UserId.vue'

export default {
  components: {
    BackupRecover,
    CompAccounts,
    PremiumUsers,
    SpaceOverages,
    TotalUsers,
    UnverifiedUsers,
    UserEmails,
    UserId
  },
  data () {
    return {}
  }
}
</script>

<style>

</style>
