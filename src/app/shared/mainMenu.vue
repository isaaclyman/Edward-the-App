<template>
  <div class="main-menu">
    <div style="display:none">
      <offline-storage/>
    </div>
    <div class="routes">
      <template v-for="route in routes">
        <router-link 
          :to="(route.worksOffline || isOnline) ? route.location : '#'" 
          :key="route.name">
          <button 
            class="main-menu--button" 
            :title="route.tooltip" 
            v-tooltip 
            :disabled="!route.worksOffline && !isOnline">
            <img
              class="main-menu--icon"
              :src="'img/' + route.icon">
            <div>{{ route.name }}</div>
          </button>
        </router-link>
        <hr 
          class="vert between mobile-only" 
          :key="route.name + '-hr'">
      </template>
    </div>
    <div class="extra">
      <status-signal/>
      <button class="main-menu--button">
        <img
          src="img/icons_more-white.png"
          class="main-menu--icon">
        <div>More</div>
      </button>
      <button class="main-menu--button">
        <img 
          src="img/icons_account-white.png"
          class="main-menu--icon">
        <div>Account</div>
      </button>
      <!-- <a 
        class="disguised mobile-hide" 
        :href="isOnline ? '/auth#/account' : '#'">
        <div 
          class="account" 
          :class="{ 'offline': !isOnline }" 
          :title="accountType.description" 
          v-tooltip>
          <div class="email">
            {{ email }}
          </div>
          <div class="account-type">
            {{ accountType.displayName }}
          </div>
        </div>
      </a> -->
    </div>
    <!-- Workshops modal -->
    <div style="display: none">
      <div 
        class="workshops" 
        ref="workshopsModal">
        <p 
          v-if="!isPremium" 
          class="warn">
          Workshops are only available for Author accounts.
        </p>
        <div 
          v-for="workshop in workshops" 
          :key="workshop.name" 
          @click="startWorkshop(workshop)">
          <div 
            class="workshop" 
            :class="{ 'restricted': !isPremium || !workshop.available }">
            <div 
              class="workshop-restricted" 
              v-if="!workshop.available">
              COMING SOON
            </div>
            <div 
              class="workshop-restricted" 
              v-if="workshop.available && !isPremium">
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
            <div class="workshop-button">
              <button class="button-green">
                Begin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Octicons from 'octicons'
import OfflineStorage from '../offlineStorage/offlineStorage.vue'
import { Statuses } from './status.store'
import StatusSignal from './statusSignal.vue'
import swal from 'sweetalert'
import tooltip from './tooltip.directive'
import writingWorkshops from '../../../models/writingWorkshop'

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
        tooltip: 'Make general notes about characters, topics, settings, and more.',
        worksOffline: true,
      }, {
        icon: 'icons_write-white.png',
        location: '/write',
        name: 'Write',
        tooltip: 'Write, search and measure your content.',
        worksOffline: true,
      }, {
        icon: 'icons_plan-white.png',
        location: '/outline',
        name: 'Outline',
        tooltip: 'Create and organize chapters and chapter-specific notes.',
        worksOffline: true,
      }],
      toolsTooltip: 'Workshop your novel with free or prompted writing exercises.',
      workshops: Object.keys(writingWorkshops).map(key => writingWorkshops[key]),
    }
  },
  directives: {
    tooltip,
  },
  methods: {
    getIconSvg(iconName) {
      return Octicons[iconName].toSVG({
        class: 'main-menu--icon',
        height: 25,
        width: 25,
      })
    },
    showWorkshops() {
      swal({
        content: this.$refs.workshopsModal,
        title: 'Workshops',
        buttons: {
          cancel: true,
        },
      })
    },
    startWorkshop(workshop) {
      if (!this.isPremium || !workshop.available) {
        return
      }

      swal.close()
      this.$router.push(workshop.route)
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
  transition: font-size 100ms;
}

a:not(.router-link-active) .main-menu--button:not([disabled]):hover {
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 800px) {
  .main-menu--button {
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

.account {
  color: inherit;
  cursor: pointer;
  margin-left: 8px;
  opacity: 1;
  text-decoration: none;
}

.account.offline {
  cursor: default;
  opacity: 0.5;
}

.email {
  color: rgb(13, 91, 166);
  font-size: 14px;
  margin-right: 20px;
}

.account-type {
  color: rgb(13, 91, 166);
  font-size: 14px;
  margin-right: 20px;
}

.warn {
  color: red;
}

.workshop {
  align-items: center;
  border: 1px solid rgb(1, 171, 109);
  color: #000;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 12px;
  padding: 8px;
  position: relative;
  text-decoration: none;
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
  font-size: 28px;
  text-align: left;
}

.workshop-description {
  font-size: 14px;
  text-align: left;
}

.workshop-button {
  margin-left: 12px;
  padding: 8px;
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
</style>
