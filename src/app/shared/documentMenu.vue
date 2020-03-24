<template>
  <div class="menu">
    <div class="menu-items">
      <document-picker />
    </div>
    <div class="menu-items">
      <router-link to="/documentEdit">
        <button class="menu-button">
          Edit
          <div class="fas fa-edit" />
        </button>
      </router-link>
      <router-link to="/export">
        <button 
          class="menu-button mobile-hide" 
          :disabled="!isOnline"
        >
          Download / Upload
          <div class="fas fa-download" />
        </button>
      </router-link>
      <button 
        class="menu-button" 
        @click="showWizard()" 
        :disabled="!isOnline"
      >
        New
        <div class="fas fa-plus" />
      </button>
    </div>
    <div class="spacer" />
    <div 
      class="menu-items mobile-hide"
      v-if="isLimited"
    >
      <div>Keep your work safe.</div>
      <a href="/auth#/account">
        <button 
          class="menu-button upgrade-button" 
          :disabled="!isOnline"
        >Upgrade to Author</button>
      </a>
    </div>
    <div 
      class="menu-items mobile-hide"
      v-if="!isLimited && !isGold"
    >
      <div>Need more space?</div>
      <a href="/auth#/account">
        <button 
          class="menu-button upgrade-button" 
          :disabled="!isOnline"
        >Upgrade to Bestseller</button>
      </a>
    </div>
  </div>
</template>

<script>
import DocumentPicker from './documentPicker.vue'
import { Statuses } from './status.store'
import { UNLOAD_CURRENT_DOCUMENT } from './document.store'

export default {
  components: {
    DocumentPicker
  },
  computed: {
    isOnline() {
      return this.$store.state.status.status !== Statuses.OFFLINE
    },
    isLimited() {
      return this.$store.state.user.user.accountType.name === 'LIMITED'
    },
    isGold() {
      return this.$store.state.user.user.accountType.name === 'GOLD'
    }
  },
  data() {
    return {}
  },
  methods: {
    showWizard() {
      this.$store.dispatch(UNLOAD_CURRENT_DOCUMENT)
    }
  }
}
</script>

<style scoped>
.menu {
  align-items: center;
  background-color: #F0F0F0;
  display: flex;
  flex-direction: row;
  height: 36px;
  padding: 0px 30px;
  z-index: 100;
}

.menu-items {
  color: #fff;
  display: flex;
  height: 100%;
  margin-right: 20px;
}

.menu-items div {
  align-items: center;
  color: #323232;
  display: flex;
  flex-direction: row;
  font-size: 16px;
  font-weight: bold;
  margin-right: 16px;
  padding: 0px 8px;
}

.menu-items a {
  align-items: center;
  display: flex;
  text-decoration: none;
}

.menu-button {
  border: none;
  border-radius: 0;
  box-shadow: none;
  color: #323232;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  height: 100%;
  padding: 0px 22px;
  transition: box-shadow 200ms;
}

.menu-button:hover {
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
}

.menu-button svg {
  margin-left: 8px;
}

.spacer {
  flex: 1;
}

.menu-button.upgrade-button {
  background-color: #F47866;
  border-radius: 4px;
  color: #323232;
  height: 30px;
  min-width: 200px;
}
</style>
