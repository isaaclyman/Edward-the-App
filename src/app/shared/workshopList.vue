<template>
  <div class="workshops-wrap" v-show="workshops.length > 0">
    <tabs-list :active-index="activeWorkshopNameIndex" :data-array="workshopNames" :filter-tabs="() => true"
              item-name="Workshop"
              :can-add="false"
              @update:activeIndex="selectWorkshopName"></tabs-list>
  </div>
</template>

<script>
import TabsList from '../shared/tabsList.vue'
import uniq from 'lodash/uniq'
import writingWorkshops from '../../../models/writingWorkshop'

export default {
  components: {
    TabsList
  },
  computed: {
    activeWorkshopName () {
      if (this.activeWorkshopNameIndex < 0) {
        this.activeWorkshopNameIndex = 0
      }

      return this.workshopNames[this.activeWorkshopNameIndex] || {}
    },
    workshopNames () {
      return uniq(this.workshops.map(item => item.workshopName)).map(name => ({ title: writingWorkshops[name].displayName }))
    },
    workshops () {
      return this.$store.state.workshop.workshops
    }
  },
  data () {
    return {
      activeWorkshopNameIndex: -1
    }
  },
  methods: {
    selectWorkshopName (index) {
      this.activeWorkshopNameIndex = index
    }
  }
}
</script>

<style scoped>

</style>
