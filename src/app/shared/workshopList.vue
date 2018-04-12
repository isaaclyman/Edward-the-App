<template>
  <div class="workshops-wrap" v-show="workshops.length > 0">
    <tabs-list :active-index="activeWorkshopNameIndex" :data-array="workshopNameTabs" :filter-tabs="() => true"
              item-name="Workshop"
              :can-add="false"
              @update:activeIndex="selectWorkshopName"></tabs-list>
    <div class="workshop-list">
      <div class="workshop-list-header">
        <div class="workshop-list-title">
          {{ currentWorkshopDisplayName }}
        </div>
      </div>
      <div class="workshop-list-body">
        <div class="workshop-select">
          <div class="workshop-select-label">
            Select a workshop:
          </div>
          <select class="workshop-select-dropdown" v-model="selectedWorkshopGuid">
            <option v-for="workshop in selectableWorkshops" v-if="filterWorkshops(workshop)" :key="workshop.guid" :value="workshop.guid">
              {{ workshop.title }}
            </option>
          </select>
        </div>
        <div class="workshops" v-show="activeWorkshopsTitle">
          <div class="workshop">
            <div class="workshop-header">
              <div class="workshop-title">
                {{ activeWorkshopsTitle }} ({{ activeWorkshopsDate }})
              </div>
              <div class="workshop-actions">
                <button class="workshop-action" v-show="!firstActiveWorkshop.archived" @click="archiveActiveWorkshops()">Archive</button>
                <button class="workshop-action" v-show="firstActiveWorkshop.archived" @click="restoreActiveWorkshops()">Restore</button>
                <button class="workshop-action button-red" v-show="firstActiveWorkshop.archived" @click="deleteActiveWorkshops()">Delete Forever</button>
              </div>
            </div>
            <div class="workshop-content" v-for="workshop in activeWorkshops" :key="`${workshop.guid}|${workshop.order}`">
              <div v-html="getHtml(workshop)"></div>            
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ARCHIVE_WORKSHOP, DELETE_WORKSHOP, RESTORE_WORKSHOP } from '../shared/workshops.store'
import { GetHtml } from '../shared/deltaParser'
import swal from 'sweetalert'
import TabsList from '../shared/tabsList.vue'
import uniq from 'lodash/uniq'
import writingWorkshops from '../../../models/writingWorkshop'

export default {
  components: {
    TabsList
  },
  computed: {
    currentWorkshopDisplayName () {
      return writingWorkshops[this.currentWorkshopName].displayName
    },
    currentWorkshopName () {
      if (this.activeWorkshopNameIndex < 0) {
        this.activeWorkshopNameIndex = 0
        this.selectDefaultWorkshop()
      }

      return this.workshopNames[this.activeWorkshopNameIndex] || {}
    },
    activeWorkshops () {
      return this.viewingWorkshops.filter(workshop => workshop.guid === this.selectedWorkshopGuid)
    },
    activeWorkshopsDate () {
      return this.activeWorkshops && this.activeWorkshops.length && new Date(this.activeWorkshops[0].date).toLocaleDateString()
    },
    activeWorkshopsTitle () {
      return this.firstActiveWorkshop.title
    },
    firstActiveWorkshop () {
      return (this.activeWorkshops && this.activeWorkshops.length && this.activeWorkshops[0]) || {}
    },
    selectableWorkshops () {
      return this.viewingWorkshops.filter(workshop => workshop.order === 0).slice(0).sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
    },
    viewingWorkshops () {
      return this.workshops.filter(workshop => workshop.workshopName === this.currentWorkshopName)
    },
    workshopNames () {
      return uniq(this.workshops.map(workshop => workshop.workshopName))
    },
    workshopNameTabs () {
      return this.workshopNames.map(name => ({ title: writingWorkshops[name].displayName }))
    },
    workshops () {
      return this.$store.state.workshop.workshops
    }
  },
  data () {
    return {
      activeWorkshopNameIndex: -1,
      selectedWorkshopGuid: null
    }
  },
  methods: {
    archiveActiveWorkshops () {
      for (const workshop of this.activeWorkshops) {
        this.$store.commit(ARCHIVE_WORKSHOP, { workshop })
      }
    },
    deleteActiveWorkshops () {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this workshop? All of its content will be lost. This cannot be undone.`,
        title: 'Delete Forever?'
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }
        for (const workshop of this.activeWorkshops) {
          this.$store.commit(DELETE_WORKSHOP, { workshop })
        }

        if (!(this.selectableWorkshops && this.selectableWorkshops.length)) {
          return
        }

        this.selectedWorkshopGuid = this.selectableWorkshops[0].guid
      })
    },
    getHtml (workshop) {
      return GetHtml(workshop.content)
    },
    restoreActiveWorkshops () {
      for (const workshop of this.activeWorkshops) {
        this.$store.commit(RESTORE_WORKSHOP, { workshop })
      }
    },
    selectWorkshopName (index) {
      this.activeWorkshopNameIndex = index
    },
    selectDefaultWorkshop () {
      if (!this.viewingWorkshops || !this.viewingWorkshops.length) {
        return
      }

      this.selectedWorkshopGuid = this.viewingWorkshops[0].guid
    }
  },
  mounted () {
    this.selectDefaultWorkshop()
  },
  props: {
    filterWorkshops: {
      required: true,
      type: Function
    }
  }
}
</script>

<style scoped>
.workshop-list {
  background-color: #FFF;
  border: 1px solid #CCC;
  box-shadow: 0px -2px 12px -4px rgba(0,0,0,0.75);
  margin-bottom: 10px;
}

.workshop-list-header {
  align-items: center;
  background-color: rgba(139, 195, 74, 0.85);
  color: #FFF;
  display: flex;
  flex-direction: row;
  padding: 8px;
}

.workshop-list-title {
  flex: 1;
}

.workshop-list-body {
  background-color: rgba(139, 195, 74, 0.05);
}

.workshop-select {
  padding: 12px 6px;
}

.workshop-select-label {
  margin-bottom: 5px;
}

.workshop-select-dropdown {
  border: 1px solid #BBB;
}

.workshops {
  padding: 8px;
}

.workshop {
  border: 1px solid rgba(139, 195, 74, 0.85);
  margin-bottom: 20px; 
}

.workshop-header {
  align-items: center;
  background-color: rgba(139, 195, 74, 0.85);
  color: #FFF;
  display: flex;
  flex-direction: row;
  height: 28px;
  padding: 0 8px;
}

.workshop-title {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: row;
}

.workshop-actions {
  height: 100%;
}

.workshop-action {
  background-color: transparent;
  border: none;
  border-left: 1px solid #fff;
  border-radius: 0;
  border-right: 1px solid #fff;
  color: #fff;
  height: 100%;
  margin-right: 6px;
  padding: 3px 6px;
  transition: background-color 100ms;
}

.workshop-action:hover {
  background-color: #444;
}

.workshop-content {
  background-color: #FFF;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 6px;
}
</style>
