<template>
  <div 
    class="workshops-wrap" 
    v-show="workshops.length > 0"
  >
    <tabs-list 
      :active-index="activeWorkshopNameIndex" 
      :data-array="workshopNameTabs" 
      :filter-tabs="() => true"
      item-name="Workshop"
      :can-add="false"
      @update:activeIndex="selectWorkshopNameIndex"
    />
    <div>
      <div>
        <h3>
          {{ currentWorkshopDisplayName }}
        </h3>
      </div>
      <div>
        <div class="workshop-select">
          <div class="workshop-select-label">
            Select a workshop:
          </div>
          <select 
            class="workshop-select-dropdown" 
            v-model="selectedWorkshopGuid"
          >
            <option 
              v-for="workshop in filteredSelectableWorkshops" 
              :key="workshop.guid" 
              :value="workshop.guid"
            >
              {{ workshop.title }}
            </option>
          </select>
        </div>
        <div 
          class="workshops" 
          v-show="activeWorkshopsTitle"
        >
          <div class="workshop">
            <div class="workshop-header">
              <div class="workshop-title">
                {{ activeWorkshopsTitle }} ({{ activeWorkshopsDate }})
              </div>
              <div class="workshop-actions">
                <button 
                  class="workshop-action" 
                  v-show="!firstActiveWorkshop.archived" 
                  @click="archiveActiveWorkshops()"
                  title="Archive"
                  v-tooltip
                >
                  <span class="fas fa-archive" />
                </button>
                <button 
                  class="workshop-action" 
                  v-show="firstActiveWorkshop.archived" 
                  @click="restoreActiveWorkshops()"
                  title="Un-archive"
                  v-tooltip
                >
                  <span class="fas fa-box-open" />
                </button>
                <button 
                  class="workshop-action button-red" 
                  v-show="firstActiveWorkshop.archived" 
                  @click="deleteActiveWorkshops()"
                  title="Delete forever"
                  v-tooltip
                >
                  <span class="fas fa-trash" />
                </button>
              </div>
            </div>
            <div 
              class="workshop-content" 
              v-for="workshop in activeWorkshops" 
              :key="`${workshop.guid}|${workshop.order}`"
            >
              <div v-html="getHtml(workshop)" />
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
import tooltip from '../shared/tooltip.directive'

export default {
  components: {
    TabsList,
  },
  directives: {
    tooltip
  },
  computed: {
    currentWorkshopDisplayName() {
      return writingWorkshops[this.currentWorkshopName].displayName
    },
    currentWorkshopName() {
      if (this.activeWorkshopNameIndex === -1) {
        return this.workshopNames[0]
      }

      return this.workshopNames[this.activeWorkshopNameIndex] || {}
    },
    activeWorkshops() {
      return this.viewingWorkshops.filter(workshop => workshop.guid === this.selectedWorkshopGuid)
    },
    activeWorkshopsDate() {
      return this.activeWorkshops && this.activeWorkshops.length && new Date(this.activeWorkshops[0].date).toLocaleDateString()
    },
    activeWorkshopsTitle() {
      return this.firstActiveWorkshop.title
    },
    filteredSelectableWorkshops() {
      return this.selectableWorkshops.filter(w => this.filterWorkshops(w))
    },
    firstActiveWorkshop() {
      return (this.activeWorkshops && this.activeWorkshops.length && this.activeWorkshops[0]) || {}
    },
    selectableWorkshops() {
      return this.viewingWorkshops.filter(workshop => workshop.order === 0).slice(0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    },
    viewingWorkshops() {
      return this.workshops.filter(workshop => workshop.workshopName === this.currentWorkshopName)
    },
    workshopNames() {
      return uniq(this.workshops.map(workshop => workshop.workshopName))
    },
    workshopNameTabs() {
      return this.workshopNames.map(name => ({ title: writingWorkshops[name].displayName }))
    },
    workshops() {
      return this.$store.state.workshop.workshops
    },
  },
  data() {
    return {
      activeWorkshopNameIndex: -1,
      selectedWorkshopGuid: null,
    }
  },
  methods: {
    archiveActiveWorkshops() {
      for (const workshop of this.activeWorkshops) {
        this.$store.commit(ARCHIVE_WORKSHOP, { workshop })
      }
    },
    deleteActiveWorkshops() {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: 'Are you sure you want to delete this workshop? All of its content will be lost. This cannot be undone.',
        title: 'Delete Forever?',
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }
        for (const workshop of this.activeWorkshops) {
          this.$store.commit(DELETE_WORKSHOP, { workshop })
        }

        if (!(this.selectableWorkshops && this.selectableWorkshops.length)) {
          this.selectWorkshopNameIndex(-1)
          return
        }

        this.selectedWorkshopGuid = this.selectableWorkshops[0].guid
      })
    },
    getHtml(workshop) {
      return GetHtml(workshop.content)
    },
    restoreActiveWorkshops() {
      for (const workshop of this.activeWorkshops) {
        this.$store.commit(RESTORE_WORKSHOP, { workshop })
      }
    },
    // The following two methods are available for use by parent components
    selectWorkshopGuid(guid) {
      this.selectedWorkshopGuid = guid
    },
    selectWorkshopName(name) {
      this.activeWorkshopNameIndex = this.workshopNames.indexOf(name)
    },
    selectWorkshopNameIndex(index) {
      if (index === -1) {
        index = 0
        this.selectDefaultWorkshop()
      }

      this.activeWorkshopNameIndex = index
    },
    selectDefaultWorkshop() {
      if (!this.viewingWorkshops || !this.viewingWorkshops.length) {
        return
      }

      this.selectedWorkshopGuid = this.viewingWorkshops[0].guid
    },
  },
  mounted() {
    this.selectDefaultWorkshop()
  },
  props: {
    filterWorkshops: {
      required: true,
      type: Function,
    },
  },
}
</script>

<style scoped>
.workshop-list {
  border: none;
  border-top: none;
  color: #000;
  margin-bottom: 20px;
}

.workshop-list-header {
  align-items: center;
  background-color: #00866F;
  color: #FFF;
  display: flex;
  flex-direction: row;
  height: 48px;
  padding-left: 16px;
  padding-right: 8px;
}

.workshop-list-title {
  color: #fff;
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  padding: 2px 0;
}

.workshop-list-body {
  background-color: #FFF;
  font-size: 16px;
  padding: 16px;
}

.workshop-select {
  margin-bottom: 8px;
}

.workshop-select-label {
  margin-bottom: 5px;
}

.workshop-select-dropdown {
  border: 2px solid #323232;
}

.workshops {
  margin-top: 16px;
}

.workshop {
  border: none;
  border-top: none;
  color: #000;
  margin-bottom: 20px;
}

.workshop-header {
  align-items: center;
  background-color: #00866F;
  color: #FFF;
  display: flex;
  flex-direction: row;
  height: 48px;
  padding-left: 16px;
  padding-right: 8px;
}

.workshop-title {
  color: #fff;
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  padding: 2px 0;
}

.workshop-actions {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.workshop-action {
  align-items: center;
  background-color: #fff;
  border: none;
  border-radius: 8px;
  color: #323232;
  display: flex;
  font-size: 16px;
  justify-content: center;
  height: 32px;
  margin: 8px;
  padding: 0;
  transition: background-color 100ms;
  width: 32px;
}

.workshop-action:hover {
  background-color: #FFF;
  color: #000;
}

.workshop-content {
  background-color: #FFF;
  font-size: 16px;
  padding: 16px;
}
</style>
