<template>
  <div class="main-menu">
    <div style="display:none">
      <offline-storage />
    </div>
    <div class="routes">
      <template v-for="route in routes">
        <router-link 
          :to="route.location" 
          :key="route.name"
        >
          <button 
            class="main-menu--button" 
            :title="route.tooltip" 
            v-tooltip 
          >
            <img
              class="main-menu--icon"
              :src="'img/' + route.icon"
            >
            <div>{{ route.name }}</div>
          </button>
        </router-link>
      </template>
    </div>
    <div class="extra">
      <status-signal />
      <button
        class="main-menu--button"
        ref="moreButton"
      >
        <img
          src="img/icons_more-white.png"
          class="main-menu--icon"
        >
        <div>More</div>
        <div
          ref="moreMenu"
          style="display: none"
        >
          <div class="more-menu">
            <router-link
              class="disguised"
              to="/search"
            >
              <button class="more-item">
                <span class="more-icon fas fa-search" />
                Search
              </button>
            </router-link>
            <button
              class="more-item"
              :disabled="!isOnline"
              @click="showWorkshops"
            >
              <span class="more-icon fas fa-hammer" />
              Workshops
            </button>
          </div>
        </div>
      </button>
      <button
        class="main-menu--button"
        ref="accountButton"
      >
        <img 
          src="img/icons_account-white.png"
          class="main-menu--icon"
        >
        <div>Account</div>
        <div
          ref="accountMenu"
          style="display: none"
        >
          <div class="account-menu">
            <div class="account-email">
              {{ email }}
            </div>
            <div
              class="account-type"
              :title="accountType.description"
              v-tooltip
            >
              {{ accountType.displayName }}
            </div>
            <div class="account-actions">
              <a
                v-if="isOnline"
                href="/auth#/account"
              >
                <button class="button-green account-action">
                  Account Settings
                </button>
              </a>
              <div>
                <button class="account-action" @click="logOut()">
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- Workshops modal -->
    <div style="display: none">
      <div 
        class="workshops" 
        ref="workshopsModal"
      >
        <h1 class="workshop-modal-title">
          Select a workshop
        </h1>
        <p 
          v-if="!isPremium" 
          class="warn"
        >
          Workshops are only available for Author accounts.
        </p>
        <div 
          v-for="workshop in workshops" 
          :key="workshop.name"
          @click="setSelectedWorkshop(workshop)"
        >
          <div 
            class="workshop" 
            :class="{ 'restricted': !isPremium || !workshop.available, 'selected': selectedWorkshop === workshop }"
          >
            <div 
              class="workshop-restricted" 
              v-if="!workshop.available"
            >
              COMING SOON
            </div>
            <div 
              class="workshop-restricted" 
              v-if="workshop.available && !isPremium"
            >
              AUTHORS ONLY
            </div>
            <div class="workshop-details">
              <div class="workshop-name">
                {{ workshop.displayName }}
              </div>
              <div class="workshop-description">
                {{ workshop.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OfflineStorage from '../offlineStorage/offlineStorage.vue'
import { Statuses } from './status.store'
import StatusSignal from './statusSignal.vue'
import swal from 'sweetalert'
import tooltip from './tooltip.directive'
import writingWorkshops from '../../../models/writingWorkshop'
import tippy from 'tippy.js'
import userApi from '../api/userApi'

export default {
  components: {
    OfflineStorage,
    StatusSignal,
  },
  computed: {
    accountType() {
      return this.$store.state.user.user.accountType || {}
    },
    email() {
      return this.$store.state.user.user.email || ''
    },
    isOnline() {
      return this.$store.state.status.status !== Statuses.OFFLINE
    },
    isPremium() {
      return this.$store.state.user.user.isPremium
    },
  },
  data() {
    return {
      routes: [{
        icon: 'icons_outline-white.png',
        location: '/plan',
        name: 'Plan',
        tooltip: 'Create book-level notes.',
      }, {
        icon: 'icons_write-white.png',
        location: '/write',
        name: 'Write',
        tooltip: 'Write your content.',
      }, {
        icon: 'icons_plan-white.png',
        location: '/outline',
        name: 'Outline',
        tooltip: 'Create chapters and chapter-level notes.',
      }],
      selectedWorkshop: null,
      toolsTooltip: 'Workshop your novel with free or prompted writing exercises.',
      workshops: Object.keys(writingWorkshops).map(key => writingWorkshops[key]),
    }
  },
  directives: {
    tooltip,
  },
  mounted() {
    tippy(this.$refs.moreButton, {
      arrow: true,
      content: this.$refs.moreMenu.firstChild,
      distance: 10,
      interactive: true,
      placement: 'bottom',
      theme: 'light nopadding',
      trigger: 'click'
    })

    tippy(this.$refs.accountButton, {
      arrow: true,
      content: this.$refs.accountMenu.firstChild,
      distance: 10,
      interactive: true,
      placement: 'bottom',
      theme: 'light nopadding',
      trigger: 'click'
    })
  },
  methods: {
    showWorkshops() {
      if (this.isPremium && !this.selectedWorkshop) {
        this.selectedWorkshop = this.workshops[0]
      }

      swal({
        content: this.$refs.workshopsModal,
        className: 'workshop-modal',
        buttons: {
          cancel: true,
          confirm: !this.isPremium ? false : {
            text: 'Begin',
            className: 'button-green'
          }
        },
      }).then(result => {
        if (!result) {
          return
        }

        this.startWorkshop(this.selectedWorkshop)
      })
    },
    setSelectedWorkshop(workshop) {
      this.selectedWorkshop = workshop
    },
    startWorkshop(workshop) {
      if (!this.isPremium || !workshop.available) {
        return
      }

      swal.close()
      this.$router.push(workshop.route)
    },
    logOut() {
      userApi.logOut().then(
        () => {
          window.location.href = '/auth'
        },
        () => {
          swal({
            icon: 'error',
            text:
              'Sorry, logout failed. If security is a concern, please clear your cookies and other browsing data and close your browser.'
          })
        }
      )
    },
  },
}
</script>

<style scoped>
.main-menu {
  align-items: center;
  display: flex;
  flex: 1;
}

.routes {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
}

.routes .main-menu--button {
  padding: 14px 52px;
}

.main-menu--button {
  background-color: transparent;
  border: none;
  border-radius: 8px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  color: rgba(255, 255, 255, 1);
  font-size: 18px;
  height: 100%;
  margin-bottom: 2px;
  margin-top: 2px;
  padding: 8px 16px;
  transition: font-size 100ms;
}

a:not(.router-link-active) .main-menu--button:not([disabled]):hover {
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 1000px) {
  .routes .main-menu--button {
    font-size: 16px;
    padding: 6px 10px;
  }

  .main-menu--button {
    font-size: 14px;
    padding: 6px 10px;
  }
}

.router-link-active > .main-menu--button {
  background-color: #0F6858;
  border: 3px solid #FFFFFF;
  box-shadow: 0px 3px 6px 0px rgba(0,0,0,0.16);
  height: 110px;
  font-size: 22px;
  padding: 22px 52px;
}

@media (max-width: 1000px) {
  .router-link-active > .main-menu--button {
    padding: 24px 16px;
  }
}

.main-menu--icon {
  transition: width 100ms;
  width: 36px;
}

.router-link-active .main-menu--icon {
  width: 45px;
}

hr.between:last-of-type {
  display: none;
}

.extra {
  align-items: center;
  display: flex;
  justify-content: center;
}

.more-menu {
  padding: 8px 0;
}

.more-item {
  background-color: inherit;
  border: none;
  border-radius: 0;
  color: #323232;
  cursor: pointer;
  display: block;
  fill: #323232;
  font-size: inherit;
  padding: 6px 20px;
  text-align: left;
  text-decoration: none;
  transition: background-color 100ms, color 100ms, fill 100ms;
  width: 100%;
}

.more-item[disabled] {
  cursor: default;
}

.more-item:not([disabled]):hover {
  background-color: #323232;
  color: #fff;
  fill: #fff;
}

.more-item:not(:last-of-type) {
  margin-bottom: 4px;
}

.more-icon {
  margin-right: 6px;
  width: 20px;
}

.account-menu {
  font-size: 16px;
  padding: 8px 16px;
}

.account-email {
  color: #00866F;
  font-size: 18px;
  font-weight: bold;
}

.account-type {
  font-weight: bold;
}

.account-actions {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
}

.account-action {
  margin-bottom: 8px;
  width: 100%;
}

.warn {
  color: #DA0000;
}

.workshop-modal-title {
  margin-bottom: 16px;
}

.workshop {
  align-items: center;
  background-color: #fff;
  border: none;
  color: #323232;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 12px;
  padding: 16px;
  position: relative;
  text-decoration: none;
  transition: background-color 200ms, color 200ms;
}

.workshop.selected {
  background-color: #00866F;
  color: #fff;
}

.workshop.restricted {
  cursor: default;
}

.workshop-restricted {
  background-color: rgba(255, 255, 255, 0.85);
  bottom: 0;
  font-size: 20px;
  font-weight: bold;
  left: 0;
  padding-top: 5px;
  position: absolute;
  right: 0;
  text-align: center;
  top: 0;
}

.workshop-details {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.workshop-name {
  font-size: 20px;
  text-align: left;
}

.workshop-description {
  font-size: 14px;
  text-align: left;
  max-height: 0;
  overflow: hidden;
}

.workshop.selected .workshop-description {
  max-height: 100px;
}
</style>

<style>
.main-menu--icon {
  fill: rgba(255, 255, 255, 1);
  transition: fill 100ms ease-in-out;
}

.main-menu--button:not([disabled]):hover .main-menu--icon {
  fill: rgba(255, 255, 255, 0.7);
}

.router-link-active > .main-menu--button .main-menu--icon {
  fill: rgba(255, 255, 255, 1);
}

.workshop-modal {
  background-color: #F2F9F8;
}
</style>