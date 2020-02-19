<template>
  <div class="wrap">
    <div class="warning">
      <h3>Just so you know...</h3>
      <p>
        <strong>This is a free (Dreamer) account.</strong> When you use a free account, you should know:
      </p>
      <ul>
        <li>
          <strong>Your documents are not private.</strong> Anyone who logs in on this computer may be able to see and edit them.
        </li>
        <li>
          <strong>Your documents are not safe.</strong> If you reinstall your browser, clear your browsing data, or wipe your hard drive, all your work will be deleted. If you use more space than your browser allows, it may erase all your data without warning.
        </li>
        <li>
          <strong>Your documents are not online.</strong> You can't access them from any other computer.
        </li>
      </ul>
      <p>
        Dreamer accounts are not intended for long-term use, but you can use yours for as long as you want.
      </p>
      <p class="upgrade">
        Upgrade to an Author account to get private, safe, permanent online storage for all your documents.
        It's only $7.99 per month and guarantees your peace of mind.
      </p>
    </div>
    <div class="actions">
      <router-link to="/account">
        <button class="button-green">
          Upgrade to Author
        </button>
      </router-link>
      <p>
        That's fine, <button
          class="button-link"
          @click="noPremium()"
        >
          continue with a free account for now
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { goToApp } from './shared'

export default {
  computed: {
    user() {
      const record = this.$route.matched.find(record => record && record.meta.getCurrentUser)
      return record && record.meta && record.meta.getCurrentUser()
    },
  },
  created() {
    if (this.user.isPremium) {
      goToApp()
    }
  },
  data() {
    return {}
  },
  methods: {
    noPremium() {
      goToApp()
    }
  },
  props: {},
}
</script>

<style scoped>
.wrap {
  align-items: flex-start;
  color: #323232;
  display: flex;
  flex: 1;
  flex-direction: column;
}

h3 {
  font-size: 34px;
  font-weight: normal;
  margin-bottom: 32px;
  margin-top: 0;
}

p {
  margin-bottom: 16px;
  margin-top: 0;
}

p, ul {
  font-size: 20px;
}

ul {
  padding-left: 6px;
}

ul li {
  margin-bottom: 8px;
}

.actions button.button-link {
  padding: 0 3px;
}

.actions button.button-green {
  margin: 32px 0;
}

.upgrade, .upgrade a, .actions p, .actions p a {
  color: #323232;
  font-size: 20px;
  font-weight: bold;
}

.upgrade {
  margin: 0;
}
</style>
