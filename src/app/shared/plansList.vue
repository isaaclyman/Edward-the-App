<template>
  <div 
    class="plans-wrap" 
    v-show="viewingPlans.length > 0"
  >
    <!-- Plan Tabs -->
    <tabs-list 
      :active-index="activePlanIndex" 
      :data-array="allPlans" 
      :filter-tabs="filterPlans"
      item-name="Plan"
      @add="addPlan"
      @update:activeIndex="selectPlan"
    />
    <div 
      class="plan" 
      v-if="activePlan"
    >
      <div
        class="plan-head"
        v-if="showSubheader"
      >
        <h2 class="plan-title">
          {{ activePlan.title }}
        </h2>
        <div class="plan-actions">
          <button 
            class="plan-action button-icon" 
            v-show="!activePlan.archived" 
            @click="archivePlan({ index: activePlanIndex })"
            title="Archive"
            v-tooltip
          >
            <span class="fas fa-archive" />
          </button>
          <button 
            class="plan-action button-icon" 
            v-show="activePlan.archived" 
            @click="restorePlan({ index: activePlanIndex })"
            title="Un-archive"
            v-tooltip
          >
            <span class="fas fa-box-open" />  
          </button>
          <button 
            class="plan-action plan-action-danger button-icon" 
            v-show="activePlan.archived" 
            @click="deletePlan({ index: activePlanIndex })"
            title="Delete Forever"
            v-tooltip
          >
            <span class="fas fa-trash" />
          </button>
        </div>
      </div>
      <h3>Add/rearrange sections</h3>
      <div class="plan-body">
        <!-- Section Chips -->
        <div class="chips-wrap section-chips">
          <chips-list 
            name="Section" 
            name-prop="title"
            :data-array="activePlanSections"
            :filter-chips="filterSections"
            :is-deletable="isDeletable"
            @add="addSection"
            @delete="archiveSection"
            @rearrange="rearrangeSection"
            @restore="restoreSection"
            @update="renameSection"
          />
        </div>
        <div class="sections">
          <div 
            class="section" 
            v-for="(section, index) in activePlan.sections" 
            :key="section.guid" 
            v-show="filterSections(section)"
          >
            <div class="section-head">
              <h5 class="section-title">
                {{ section.title }}
              </h5>
              <div class="section-actions">
                <button 
                  class="section-action" 
                  v-show="!isEditing(index)" 
                  @click="editSection(index)"
                  title="Edit"
                  v-tooltip
                >
                  <span class="fas fa-edit" />
                </button>
                <button 
                  class="section-action" 
                  v-show="isEditing(index)" 
                  @click="endEditSection()"
                  title="Save"
                  v-tooltip
                >
                  <span class="fas fa-check" />
                </button>
                <button 
                  class="section-action" 
                  v-show="!section.archived" 
                  @click="archiveSection({ index })"
                  title="Archive"
                  v-tooltip
                >
                  <span class="fas fa-archive" />
                </button>
                <button 
                  class="section-action" 
                  v-show="section.archived" 
                  @click="restoreSection({ index })"
                  title="Un-archive"
                  v-tooltip
                >
                  <span class="fas fa-box-open" />
                </button>
                <button 
                  class="section-action button-red" 
                  v-show="section.archived" 
                  @click="deleteSection({ index })"
                  title="Delete forever"
                  v-tooltip
                >
                  <span class="fas fa-trash" />  
                </button>
              </div>
            </div>
            <div class="section-content">
              <div 
                class="content-static" 
                v-if="!isEditing(index)"
              >
                <div v-html="getHtml(section)" />
                <span 
                  class="content-placeholder" 
                  v-if="!section.archived && !getTextContent(section.content)"
                >
                  No content yet. Click <span class="fas fa-edit" /> to add some.
                </span>
              </div>
              <div 
                class="content-editable" 
                v-show="isEditing(index)"
              >
                <quill-editor 
                  :content="section.content" 
                  :content-id="activePlan.guid" 
                  ref="quillEditor" 
                  @update:content="updateContent(section, $event)"
                  @shortcut:done="endEditSection()"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sections: [?] Modal -->
    <div style="display: none">
      <div 
        class="help" 
        ref="helpSectionChipsModal"
      >
        <p>This is the section list. It's the easiest place to add, archive, restore, rename, and rearrange sections.</p>
        <p>To add a section, type its name into the "New Section" box and click "Add".</p>
        <p>
          To archive a section, click the "X" next to its name in the list.
          Archiving a section removes it from your document without deleting it permanently.
        </p>
        <p>To restore an archived section, check the "Show Archived" box, then click the "+" next to its name in the list.</p>
        <p>To rename a section, click the pencil icon next to its name in the list.</p>
        <p>To rearrange a section, click and drag it to where you want it to go.</p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ADD_PLAN, ADD_SECTION, ARCHIVE_PLAN, ARCHIVE_SECTION,
  DELETE_PLAN, DELETE_SECTION, REARRANGE_SECTIONS,
  RESTORE_PLAN, RESTORE_SECTION, UPDATE_SECTION,
  UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS,
} from '../shared/chapters.store'
import ChipsList from '../shared/chipsList.vue'
import { GetContentString, GetHtml } from '../shared/deltaParser'
import guid from '../shared/guid'
import QuillEditor from '../shared/quillEditor.vue'
import swal from 'sweetalert'
import TabsList from '../shared/tabsList.vue'
import tooltip from '../shared/tooltip.directive'
import { ValidateTitle } from '../shared/validate'

export default {
  components: {
    ChipsList,
    QuillEditor,
    TabsList,
  },
  computed: {
    activePlan() {
      return this.allPlans[this.activePlanIndex]
    },
    activePlanSections() {
      if (!this.activePlan) {
        return []
      }

      return this.activePlan.sections || []
    },
    allPlans() {
      return this.$store.state.chapters.plans || []
    },
    viewingPlans() {
      return this.allPlans.filter(plan => this.filterPlans(plan))
    },
  },
  data() {
    return {
      activePlanIndex: -1,
      editingSectionIndex: -1
    }
  },
  directives: {
    tooltip
  },
  methods: {
    addPlan(title) {
      if (!ValidateTitle('plan', title)) {
        return
      }

      const plan = {
        archived: false,
        guid: guid(),
        title,
        sections: [],
      }

      this.$store.commit(ADD_PLAN, { plan })
      console.log(this.activePlanIndex)
    },
    addSection(title) {
      if (!ValidateTitle('section', title)) {
        return
      }

      const section = {
        archived: false,
        content: null,
        guid: guid(),
        tags: [],
        title,
      }

      this.$store.commit(ADD_SECTION, { plan: this.activePlan, section })
    },
    archivePlan({ index }) {
      this.$store.commit(ARCHIVE_PLAN, { plan: this.allPlans[index] })

      if (index === this.activePlanIndex && !this.filterPlans(this.allPlans[index])) {
        this.selectPlan(-1)
      }
    },
    archiveSection({ index }) {
      this.$store.commit(ARCHIVE_SECTION, {
        plan: this.activePlan,
        section: this.activePlan.sections[index],
      })
    },
    deletePlan({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: 'Are you sure you want to delete this plan? Its sections and all of their content will be lost. This cannot be undone.',
        title: 'Delete Forever?',
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_PLAN, { plan: this.allPlans[index] })

        if (index === this.activePlanIndex) {
          this.selectPlan(-1)
        }
      })
    },
    deleteSection({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: 'Are you sure you want to delete this section? Its content will be lost. This cannot be undone.',
        title: 'Delete Forever?',
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_SECTION, {
          plan: this.activePlan,
          section: this.activePlan.sections[index],
        })
      })
    },
    editSection(index) {
      this.editingSectionIndex = index
      this.$refs.quillEditor[index].focus()
    },
    endEditSection() {
      this.editingSectionIndex = -1
    },
    getHtml(section) {
      return GetHtml(section.content)
    },
    getTextContent(content) {
      return GetContentString(content)
    },
    helpClick(content, title) {
      swal({
        content,
        title,
      })
    },
    isDeletable(chip) {
      return !chip.archived
    },
    isEditing(index) {
      return this.editingSectionIndex === index
    },
    rearrangeSection(sections) {
      this.$store.commit(REARRANGE_SECTIONS, { plan: this.activePlan, sections })
    },
    renameSection({ index, value: newTitle }) {
      if (!ValidateTitle('section', newTitle)) {
        return
      }

      this.$store.commit(UPDATE_SECTION, {
        plan: this.activePlan,
        section: this.activePlan.sections[index],
        newTitle,
      })
    },
    restorePlan({ index }) {
      this.$store.commit(RESTORE_PLAN, { plan: this.allPlans[index] })
    },
    restoreSection({ index }) {
      this.$store.commit(RESTORE_SECTION, { plan: this.activePlan, section: this.activePlan.sections[index] })
    },
    selectPlan(index) {
      if (index === -1) {
        index = 0
      }

      if (this.allPlans[index] && this.allPlans[index].archived && !this.filterPlans(this.allPlans[index])) {
        index = this.allPlans.indexOf(this.viewingPlans[0])
      }
      
      this.activePlanIndex = index
    },
    updateContent(section, { content: newContent, contentId: planGuid }) {
      const plan = this.allPlans.find(plan => plan.guid === planGuid)
      this.$store.commit(UPDATE_SECTION_CONTENT, {
        plan,
        newContent,
        section,
      })
    },
    updateTags(section, newTags) {
      this.$store.commit(UPDATE_SECTION_TAGS, {
        plan: this.activePlan,
        newTags,
        section,
      })
    },
  },
  mounted() {
    this.helpSectionChipsModal = this.$refs.helpSectionChipsModal
  },
  props: {
    filterPlans: {
      required: true,
      type: Function,
    },
    filterSections: {
      required: true,
      type: Function,
    },
    showSubheader: {
      required: true,
      type: Boolean
    }
  },
}
</script>

<style scoped>
.chips-wrap {
  margin-bottom: 16px;
  padding-bottom: 4px;
  padding-top: 4px;
}

.plan-head {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.plan-title {
  margin-right: 8px;
}

.plan-action {
  background-color: transparent;
  color: #323232;
  margin-left: 16px;
  transition: background-color 100ms;
}

.plan-action:hover {
  background-color: #FFF;
  color: #000;
}

.plan-action-danger {
  color: #e53935;
}

.section {
  border: none;
  border-top: none;
  color: #000;
  margin-bottom: 20px;
}

.section-head {
  align-items: center;
  background-color: #00866F;
  color: #FFF;
  display: flex;
  flex-direction: row;
  height: 48px;
  padding-left: 16px;
  padding-right: 8px;
}

.section-title {
  color: #fff;
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  padding: 2px 0;
}

.section-actions {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.section-action {
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

.section-action:hover {
  background-color: #FFF;
  color: #000;
}

.section-action span {
  align-items: center;
  display: flex;
  justify-content: center;
}

.section-content {
  background-color: #FFF;
  font-size: 16px;
  padding: 16px;
}

.content-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.content-static, .content-editable {
  max-height: 275px;
  overflow-y: auto;
}

.content-static {
  white-space: pre-wrap;
}

.content-placeholder {
  color: #444;
  white-space: normal;
}
</style>
