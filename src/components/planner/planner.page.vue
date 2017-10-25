<template>
  <div class="wrap">
    <div class="planner">
      <!-- 'Show Archived' checkbox -->
      <div>
        <input id="showArchivedCheckbox" type="checkbox" v-model="filters.archived" />
        <label for="showArchivedCheckbox">Show Archived</label>
      </div>

      <!-- Plan Chips -->
      <div class="chips-wrap">
        <div class="section-title">
          <h3>Plans</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpPlanChipsModal, 'Plan List')"></button>
        </div>
        <chips-list name="Plan" name-prop="title"
                    :data-array="allPlans"
                    :filter-chips="showPlan"
                    :is-deletable="isDeletable"
                    @add="addPlan"
                    @delete="archivePlan"
                    @rearrange="rearrangePlan"
                    @restore="restorePlan"
                    @update="renamePlan"></chips-list>
      </div>

      <!-- Plan Tabs -->
      <tabs-list :active-index="activePlanIndex" :data-array="allPlans" :filter-tabs="showPlan"
                 item-name="Plan"
                 @add="addPlan"
                 @update:activeIndex="selectPlan"></tabs-list>
                 <!-- @hover="hoverPlan"
                 @unhover="unhoverPlan" -->
    </div>

    <!-- Plans: [?] Modal -->
    <div style="display: none">
      <div class="help" ref="helpPlanChipsModal">
        <p>This is the plan list. It's the easiest place to add, archive, restore, rename, and rearrange plans.</p>
        <p>To add a plan, type its name into the "New Plan" box and click "Add".</p>
        <p>
          To archive a plan, click the "X" next to its name in the list.
          Archiving a plan removes it from your document without deleting it permanently.
        </p>
        <p>To restore an archived plan, check the "Show Archived" box, then click the "+" next to its name in the list.</p>
        <p>To rename a plan, click the pencil icon next to its name in the list.</p>
        <p>To rearrange a plan, click and drag it to where you want it to go.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_PLAN, ADD_SECTION, ARCHIVE_PLAN, ARCHIVE_SECTION,
  DELETE_PLAN, DELETE_SECTION, REARRANGE_PLANS, REARRANGE_SECTIONS,
  RESTORE_PLAN, RESTORE_SECTION, UPDATE_PLAN, UPDATE_SECTION } from '../app/chapters.store'
import guid from '../app/guid'
import Octicons from 'octicons'
import swal from 'sweetalert'
import { ValidateTitle } from '../app/validate'

export default {
  components: {},
  computed: {
    activePlan () {
      return this.allPlans[this.activePlanIndex]
    },
    allPlans () {
      return this.$store.state.chapters.plans
    },
    viewingPlans () {
      return (this.allPlans
        .filter(plan => !plan.archived || this.filters.archived))
    }
  },
  data () {
    return {
      activePlanIndex: -1,
      filters: {
        archived: false
      },
      helpIconSvg: Octicons.question.toSVG({
        class: 'help-icon--svg',
        height: 16,
        width: 16
      })
    }
  },
  methods: {
    addPlan (title) {
      if (!ValidateTitle('plan', title)) {
        return
      }

      const plan = {
        archived: false,
        id: guid(),
        title,
        sections: []
      }

      this.$store.commit(ADD_PLAN, { plan })
    },
    addSection (title) {
      if (!ValidateTitle('section', title)) {
        return
      }

      const section = {
        archived: false,
        content: null,
        id: guid(),
        tags: [],
        title
      }

      this.$store.commit(ADD_SECTION, { plan: this.activePlan, section })
    },
    archivePlan ({ index }) {
      this.$store.commit(ARCHIVE_PLAN, { plan: this.allPlans[index] })
    },
    archiveSection ({ index }) {
      this.$store.commit(ARCHIVE_SECTION, {
        plan: this.activePlan,
        section: this.activePlan.sections[index]
      })
    },
    deletePlan ({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this plan? Its sections and all of their content will be lost. This cannot be undone.`,
        title: 'Delete Forever?'
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_PLAN, { plan: this.allPlans[index] })
      })
    },
    deleteSection ({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this section? Its content will be lost. This cannot be undone.`,
        title: 'Delete Forever?'
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_SECTION, {
          plan: this.activePlan,
          section: this.activePlan.sections[index]
        })
      })
    },
    helpClick (content, title) {
      swal({
        content,
        title
      })
    },
    isDeletable (chip) {
      return !chip.archived
    },
    rearrangePlan (plans) {
      this.$store.commit(REARRANGE_PLANS, { plans })
    },
    rearrangeSection (sections) {
      this.$store.commit(REARRANGE_SECTIONS, { plan: this.activePlan, sections })
    },
    renamePlan ({ index, value: newTitle }) {
      if (!ValidateTitle('plan', newTitle)) {
        return
      }

      this.$store.commit(UPDATE_PLAN, {
        plan: this.allPlans[index],
        newTitle
      })
    },
    renameSection ({ index, value: newTitle }) {
      if (!ValidateTitle('section', newTitle)) {
        return
      }

      this.$store.commit(UPDATE_SECTION, {
        plan: this.activePlan,
        newTitle
      })
    },
    restoreChapter ({ index }) {
      this.$store.commit(RESTORE_PLAN, { plan: this.allPlans[index] })
    },
    restoreSection ({ index }) {
      this.$store.commit(RESTORE_SECTION, { section: this.activePlan.sections[index] })
    },
    selectPlan (index) {
      this.activePlanIndex = index
    },
    showPlan (plan) {
      return this.viewingPlans.includes(plan)
    }
  }
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.planner {
  display: block;
  flex: 1;
  max-width: 1050px;
}

.chips-wrap {
  border-left: 2px solid #e8cc84;
  margin-bottom: 16px;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-top: 4px;
}

.section-title {
  align-items: center;
  display: flex;
  flex-direction: row;
}
</style>
