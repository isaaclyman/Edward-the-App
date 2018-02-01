<template>
  <div class="wrap">
    <div class="exporter">
      <div class="export-option">
        <h3>Export to PDF</h3>
        <div>(You can open PDFs in Microsoft Word.)</div>
        <pulse-loader v-if="loading"></pulse-loader>
        <div class="export-checkbox">
          <input id="includeArchived" v-if="!loading" type="checkbox" v-model="includeArchived">
          <label for="includeArchived" v-if="!loading">Include Archived</label>
        </div>
        <button v-if="!loading" class="button-green export-button" @click="exportPdfChapters()">
          Export all chapters
        </button>
        <button v-if="!loading" class="button-green export-button" @click="exportPdfPlans()">
          Export all plans
        </button>
        <button v-if="!loading" class="button-green export-button" @click="exportPdfOutlines()">
          Export all outlines
        </button>
      </div>
      <div class="export-option">
        <h3>Create a backup</h3>
        <div>(You can recover your document from this file later.)</div>
        <pulse-loader v-if="loading"></pulse-loader>
        <button v-if="!loading" class="button-green export-button" @click="exportJsonDocument()">
          Export entire document
        </button>
      </div>
      <div class="export-option">
        <h3>Import a backup</h3>
        <div>
          (Warning: This will overwrite the current document completely, including all chapters, plans and outlines.)
        </div>
        <div class="file-input-container">
          <pulse-loader v-if="loading"></pulse-loader>
          <template v-if="!loading">
            <label for="import-file-picker" class="file-input-label"></label>
            <input id="import-file-picker" class="file-input" type="file" accept=".json" @change="setFile">
            <button class="button-green export-button file-dummy-button">
              Import entire document
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { backupToJsonFile, jsonFileToBackup } from './json'
import { chaptersToPdf } from './pdf'
import { LOAD_CONTENT } from '../shared/chapters.store'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import swal from 'sweetalert'

export default {
  components: {
    PulseLoader
  },
  computed: {
    allChapters () {
      return this.$store.state.chapters.chapters
    },
    allPlans () {
      return this.$store.state.chapters.plans
    },
    allTopics () {
      return this.$store.state.chapters.topics
    },
    documentGuid () {
      return this.$store.state.document.currentDocument.guid
    },
    documentTitle () {
      return this.$store.state.document.currentDocument.name
    },
    masterTopics () {
      return this.$store.state.chapters.topics
    }
  },
  data () {
    return {
      includeArchived: false,
      loading: false
    }
  },
  methods: {
    importBackup (file) {
      this.loading = true
      jsonFileToBackup(file).then(backup => {
        this.loading = false
        this.$store.commit(LOAD_CONTENT, backup)
        swal({
          icon: 'success',
          text: 'The document has been imported.',
          title: 'Success'
        })
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not import the document. DETAILS: "${err}"`,
          title: 'Failure'
        })
        throw err
      })
    },
    exportJsonDocument () {
      this.loading = true

      const backup = {
        chapters: this.allChapters,
        plans: this.allPlans,
        topics: this.allTopics
      }

      backupToJsonFile(this.documentTitle, backup).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export the document. DETAILS: "${err}"`
        })
        throw err
      })
    },
    exportPdfChapters () {
      this.loading = true

      const chaptersToExport = this.allChapters.filter(chapter =>
        !chapter.archived || this.includeArchived
      )

      chaptersToPdf(this.documentTitle, chaptersToExport).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export the document. DETAILS: "${err}"`
        })
        throw err
      })
    },
    exportPdfOutlines () {
      this.loading = true

      const nestedTopics = this.allChapters.filter(chapter =>
        !chapter.archived || this.includeArchived
      ).map(chapter => {
        const chapterTopics = Object.keys(chapter.topics).map(guid => {
          const topic = chapter.topics[guid]
          const masterTopic = this.getMasterTopic(topic)
          topic.archived = masterTopic.archived
          topic.title = `${chapter.title} - ${masterTopic.title}`
          return topic
        }).filter(topic =>
          !topic.archived || this.includeArchived
        )

        return chapterTopics
      })

      const topicsArray = [].concat(...nestedTopics)

      chaptersToPdf(`${this.documentTitle}: Outlines`, topicsArray).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export outlines. DETAILS: "${err}"`
        })
        throw err
      })
    },
    exportPdfPlans () {
      this.loading = true
      const nestedPlans = this.allPlans.filter(plan =>
        !plan.archived || this.includeArchived
      ).map(plan => {
        return plan.sections.filter(section =>
          !section.archived || this.includeArchived
        ).map(section => {
          const title = plan.title === section.title
            ? plan.title
            : `${plan.title} - ${section.title}`

          return {
            title,
            content: section.content
          }
        })
      })

      const planArray = [].concat(...nestedPlans)

      chaptersToPdf(`${this.documentTitle}: Plans`, planArray).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export plans. DETAILS: "${err}"`
        })
        throw err
      })
    },
    getMasterTopic (chapterTopic) {
      return this.masterTopics.find(topic => topic.guid === chapterTopic.guid)
    },
    setFile (event) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to import this file? It will overwrite everything in the current document.`,
        title: 'Overwrite current document?'
      }).then(willOverwrite => {
        if (!willOverwrite) {
          return
        }

        this.importBackup(event.target.files[0])
      })
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

.exporter {
  display: block;
  flex: 1;
  max-width: 1050px;
}

.export-option {
  margin-bottom: 16px;
}

.export-checkbox {
  margin-top: 8px;
}

.export-button {
  margin: 10px 0;
}

.file-input-container {
  cursor: pointer;
  display: inline-block;
  position: relative;
}

.file-input-label {
  bottom: 0;
  cursor: pointer;
  left: 0;
  opacity: 0;
  padding: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.file-input {
  border: none;
  position: absolute;
  visibility: hidden;
}

.file-dummy-button {
  pointer-events: none;
}
</style>
