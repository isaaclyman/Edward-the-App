<template>
  <div class="plans-wrap" v-show="viewingPlans.length > 0">
    <!-- Plan Tabs -->
    <tabs-list :active-index="activePlanIndex" :data-array="allPlans" :filter-tabs="filterPlans"
              item-name="Plan"
              @add="addPlan"
              @update:activeIndex="selectPlan"></tabs-list>
    <div class="plan">
      <div class="plan-header">
        <h4 class="plan-title">
          {{ activePlan.title }}
        </h4>
        <div class="plan-actions">
          <button class="plan-action" v-show="!activePlan.archived" @click="archivePlan({ index: activePlanIndex })">Archive</button>
          <button class="plan-action" v-show="activePlan.archived" @click="restorePlan({ index: activePlanIndex })">Restore</button>
          <button class="plan-action button-red" v-show="activePlan.archived" @click="deletePlan({ index: activePlanIndex })">Delete Forever</button>
        </div>
      </div>
      <!-- Section Chips -->
      <div class="chips-wrap section-chips">
        <div class="section-title">
          <h3>Sections</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpSectionChipsModal, 'Section List')"></button>
        </div>
        <chips-list name="Section" name-prop="title"
                    :data-array="activePlanSections"
                    :filter-chips="filterSections"
                    :is-deletable="isDeletable"
                    @add="addSection"
                    @delete="archiveSection"
                    @rearrange="rearrangeSection"
                    @restore="restoreSection"
                    @update="renameSection"></chips-list>
      </div>

      <div class="sections">
        <div class="section" v-for="(section, index) in activePlan.sections" :key="section.id" v-show="filterSections(section)">
          <div class="section-header">
            <h5 class="section-title">
              {{ section.title }}
            </h5>
            <div class="section-actions">
              <button class="section-action" v-show="!section.archived" @click="archiveSection({ index })">Archive</button>
              <button class="section-action" v-show="section.archived" @click="restoreSection({ index })">Restore</button>
              <button class="section-action button-red" v-show="section.archived" @click="deleteSection({ index })">Delete Forever</button>
            </div>
          </div>
          <div class="section-content">
            <div class="content-actions" v-if="!section.archived">
              <button class="button-link" v-if="!isEditing(index)" @click="editSection(index)">
                <span class="button-link-icon" v-html="editSvg"></span>Edit
              </button>
              <button class="button-link" v-if="isEditing(index)" @click="endEditSection(index)">
                <span class="button-link-icon" v-html="doneSvg"></span>Done Editing
              </button>
            </div>
            <div class="content-static" v-if="!isEditing(index)">
              <div v-html="getHtml(section)"></div>
              <span class="content-placeholder" v-if="!section.archived && !getTextContent(section.content)">
                No content yet. Click "Edit" to add some.
              </span>
            </div>
            <div class="content-editable" v-if="isEditing(index)">
              <quill-editor :content="section.content" @update:content="updateContent(section, $event)"></quill-editor>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sections: [?] Modal -->
    <div style="display: none">
      <div class="help" ref="helpSectionChipsModal">
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
import { ADD_PLAN, ADD_SECTION, ARCHIVE_PLAN, ARCHIVE_SECTION,
  DELETE_PLAN, DELETE_SECTION, REARRANGE_SECTIONS,
  RESTORE_PLAN, RESTORE_SECTION, UPDATE_SECTION,
  UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS } from '../app/chapters.store'
import ChipsList from '../app/chipsList.vue'
import { GetContentString, GetHtml } from '../app/deltaParser'
import guid from '../app/guid'
import Octicons from 'octicons'
import QuillEditor from '../app/quillEditor.vue'
import swal from 'sweetalert'
import TabsList from '../app/tabsList.vue'
import { ValidateTitle } from '../app/validate'

export default {
  components: {
    ChipsList,
    QuillEditor,
    TabsList
  },
  computed: {
    activePlan () {
      if (this.activePlanIndex < 0) {
        this.activePlanIndex = this.allPlans.indexOf(this.viewingPlans[0])
      }

      return this.allPlans[this.activePlanIndex] || {}
    },
    activePlanSections () {
      return this.activePlan.sections || []
    },
    allPlans () {
      return this.$store.state.chapters.plans || []
    },
    viewingPlans () {
      return this.allPlans.filter(plan => this.filterPlans(plan))
    }
  },
  data () {
    return {
      activePlanIndex: -1,
      doneSvg: Octicons.check.toSVG({
        height: 14,
        width: 14
      }),
      editingSectionIndex: -1,
      editSvg: Octicons.pencil.toSVG({
        height: 14,
        width: 14
      }),
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

      if (index === this.activePlanIndex) {
        this.activePlanIndex = -1
      }
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

        if (index === this.activePlanIndex) {
          this.activePlanIndex = -1
        }
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
    editSection (index) {
      this.editingSectionIndex = index
    },
    endEditSection (index) {
      this.editingSectionIndex = -1
    },
    getHtml (section) {
      return GetHtml(section.content)
    },
    getTextContent (content) {
      return GetContentString(content)
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
    isEditing (index) {
      return this.editingSectionIndex === index
    },
    rearrangeSection (sections) {
      this.$store.commit(REARRANGE_SECTIONS, { plan: this.activePlan, sections })
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
    restorePlan ({ index }) {
      this.$store.commit(RESTORE_PLAN, { plan: this.allPlans[index] })
    },
    restoreSection ({ index }) {
      this.$store.commit(RESTORE_SECTION, { plan: this.activePlan, section: this.activePlan.sections[index] })
    },
    selectPlan (index) {
      this.activePlanIndex = index
    },
    updateContent (section, newContent) {
      this.$store.commit(UPDATE_SECTION_CONTENT, {
        plan: this.activePlan,
        newContent,
        section
      })
    },
    updateTags (section, newTags) {
      this.$store.commit(UPDATE_SECTION_TAGS, {
        plan: this.activePlan,
        newTags,
        section
      })
    }
  },
  mounted () {
    this.helpSectionChipsModal = this.$refs.helpSectionChipsModal
  },
  props: {
    filterPlans: {
      required: true,
      type: Function
    },
    filterSections: {
      required: true,
      type: Function
    }
  }
}
</script>

<style scoped>
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

.plan {
  background-color: #e3f2fd;
  border: 1px solid #CCC;
  box-shadow: 0px -2px 12px -4px rgba(0,0,0,0.75);
  margin-bottom: 10px;
}

.plan-header {
  align-items: center;
  background-color: #005cb2;
  color: #FFF;
  display: flex;
  flex-direction: row;
  padding: 8px;
}

.plan-title {
  flex: 1;
}

.plan-action {
  background-color: transparent;
  border-color: #FFF;
  color: #FFF;
  margin-right: 6px;
  transition: background-color 100ms;
}

.plan-action:hover {
  background-color: #444;
}

.section-chips {
  margin-left: 8px;
  margin-top: 8px;
}

.sections {
  padding: 8px;
}

.section {
  border: 1px solid #005cb2; 
  margin-bottom: 20px; 
}

.section-header {
  align-items: center;
  background-color: #005cb2;
  color: #FFF;
  display: flex;
  flex-direction: row;
  height: 28px;
  padding: 0 8px;
}

.section-title {
  flex: 1;
}

.section-actions {
  height: 100%;
}

.section-action {
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

.section-action:hover {
  background-color: #444;
}

.section-content {
  background-color: #FFF;
  padding-bottom: 6px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 1px;
}

.content-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.content-static {
  font-family: 'Khula', sans-serif;
  font-size: 13px;
  white-space: pre-wrap;
}

.content-placeholder {
  color: #444;
  white-space: normal;
}
</style>
