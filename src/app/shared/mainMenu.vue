<template>
  <div class="main-menu">
    <template v-for="route in routes">
      <router-link :to="route.location" :key="route.name">
        <button class="main-menu--button" :title="route.tooltip" v-tooltip>
          <div v-html="getIconSvg(route.icon)"></div>
          <div>{{route.name}}</div>
        </button>
      </router-link>
      <hr class="vert between mobile-hide" :key="route.name + '-hr'">
    </template>
    <button class="main-menu--button" :title="toolsTooltip" v-tooltip @click="showWorkshops()">
      <div v-html="getIconSvg('tools')"></div>
      <div>Workshop</div>
    </button>
    <div class="spacer"></div>
    <status-signal></status-signal>
    <hr class="vert mobile-hide">
    <a class="disguised mobile-hide" href="/auth#/account">
      <div class="account" :title="accountType.description" v-tooltip>
        <div class="email">
          {{ email }}
        </div>
        <div class="account-type">
          {{ accountType.displayName }}
        </div>
      </div>
    </a>
    <!-- Workshops modal -->
    <div style="display: none">
      <div class="workshops" ref="workshopsModal">
        <p v-if="!isPremium" class="warn">
          Workshops are only available for Premium subscribers.
        </p>
        <div v-for="workshop in workshops" :key="workshop.name" @click="startWorkshop(workshop)">
          <div class="workshop" :class="{ 'restricted': !isPremium || !workshop.available }">
            <div class="workshop-restricted" v-if="!workshop.available">
              COMING SOON
            </div>
            <div class="workshop-restricted" v-if="workshop.available && !isPremium">
              PREMIUM ONLY
            </div>
            <div class="workshop-details">
              <div class="workshop-name">
                {{workshop.displayName}}
              </div>
              <div class="workshop-description">
                {{workshop.description}}
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
import StatusSignal from './statusSignal.vue'
import swal from 'sweetalert'
import tooltip from './tooltip.directive'
import writingWorkshops from '../../../models/writingWorkshop'

export default {
  components: {
    StatusSignal
  },
  computed: {
    accountType () {
      return this.$store.state.user.user.accountType || {}
    },
    email () {
      return this.$store.state.user.user.email || ''
    },
    isPremium () {
      return this.$store.state.user.user.isPremium
    }
  },
  data () {
    return {
      routes: [{
        icon: 'telescope',
        location: '/plan',
        name: 'Plan',
        tooltip: 'Make general notes about characters, topics, settings, and more.'
      }, {
        icon: 'list-unordered',
        location: '/outline',
        name: 'Outline',
        tooltip: 'Create and organize chapters and chapter-specific notes.'
      }, {
        icon: 'pencil',
        location: '/write',
        name: 'Write',
        tooltip: 'Write, search and measure your content.'
      }, {
        icon: 'pulse',
        location: '/analyze',
        name: 'Analyze',
        tooltip: 'Get data-driven insights into your writing.'
      }, {
        icon: 'search',
        location: '/search',
        name: 'Search',
        tooltip: 'Search your entire document for a word or phrase.'
      }],
      toolsTooltip: 'Workshop your novel with free or prompted writing exercises.',
      workshops: Object.keys(writingWorkshops).map(key => writingWorkshops[key])
    }
  },
  directives: {
    tooltip
  },
  methods: {
    getIconSvg (iconName) {
      return Octicons[iconName].toSVG({
        class: 'main-menu--icon',
        height: 25,
        width: 25
      })
    },
    showWorkshops () {
      swal({
        content: this.$refs.workshopsModal,
        title: 'Workshops',
        buttons: {
          cancel: true
        }
      })
    },
    startWorkshop (workshop) {
      if (!this.isPremium || !workshop.available) {
        return
      }

      swal.close()
      this.$router.push(workshop.route)
    }
  }
}
</script>

<style scoped>
.main-menu {
  align-items: center;
  display: flex;
  flex: 1;
}

.main-menu--button {
  background-color: transparent;
  border: none;
  color: #777;
  height: 100%;
  margin-bottom: 2px;
  margin-top: 2px;
  padding: 6px 20px;
  transition: color 100ms ease-in-out;
}

.main-menu--button:hover {
  color: #000;
}

@media (max-width: 800px) {
  .main-menu--button {
    padding: 6px 10px;
  }
}

.router-link-active > .main-menu--button {
  color: #000;
}

hr.between:last-of-type {
  display: none;
}

.spacer {
  flex: 1;
}

.account {
  color: inherit;
  cursor: pointer;
  margin-left: 8px;
  text-decoration: none;
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
  fill: #777;
  transition: fill 100ms ease-in-out;
}

.main-menu--button:hover .main-menu--icon {
  fill: #000;
}

.router-link-active > .main-menu--button .main-menu--icon {
  fill: #000;
}
</style>