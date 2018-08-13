<template>
  <div class="wrap">
    <div class="exporter">
      <div class="export-option">
        <h3>Export to PDF</h3>
        <pulse-loader v-if="loading"></pulse-loader>
        <div class="export-checkbox">
          <input id="pdfIncludeArchived" v-if="!loading" type="checkbox" v-model="pdfIncludeArchived">
          <label for="pdfIncludeArchived" v-if="!loading">Include Archived</label>
        </div>
        <template v-if="!loading">
          <button class="button-green export-button" @click="exportPdfChapters()">
            Export all chapters
          </button>
          <button class="button-green export-button" @click="exportPdfPlans()">
            Export all plans
          </button>
          <button class="button-green export-button" @click="exportPdfOutlines()">
            Export all outlines
          </button>
          <button v-if="isPremium" class="button-green export-button" @click="exportPdfWorkshops()">
            Export all workshops
          </button>
        </template>
      </div>
      <div class="export-option">
        <h3>Export to Microsoft Word document</h3>
        <div>(Premium users only)</div>
        <pulse-loader v-if="loading"></pulse-loader>
        <div class="export-checkbox">
          <input id="wordIncludeArchived" v-if="!loading" type="checkbox" v-model="wordIncludeArchived">
          <label for="wordIncludeArchived" v-if="!loading">Include Archived</label>
        </div>
        <template v-if="!loading">
          <button class="button-green export-button" @click="exportWordChapters()">
            Export all chapters
          </button>
        </template>
      </div>
      <div class="export-option">
        <h3>Create a backup</h3>
        <div>(You can recover your document from this file later.)</div>
        <pulse-loader v-if="loading"></pulse-loader>
        <button v-if="!loading" class="button-green export-button" @click="exportJsonDocument()">
          Export entire document
        </button>
      </div>
      <div class="export-option" v-if="isOnline">
        <h3>Import a backup</h3>
        <div>
          (Warning: This will overwrite the current document completely, including all chapters, plans, outlines and workshops.)
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
import { resetCache } from '../shared/cache'
import { chaptersToPdf } from './pdf'
import { CHANGE_DOCUMENT } from '../shared/document.store'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import sortBy from 'lodash/sortBy'
import { storageApiPromise } from '../api/storageSwitch'
import swal from 'sweetalert'
import writingWorkshops from '../../../models/writingWorkshop'

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
    allWorkshops () {
      return this.$store.state.workshop.workshops
    },
    documentGuid () {
      return this.$store.state.document.currentDocument.guid
    },
    documentTitle () {
      return this.$store.state.document.currentDocument.name
    },
    isOnline () {
      return this.$store.state.status.status !== Statuses.OFFLINE
    },
    isPremium () {
      return this.$store.state.user.user.isPremium
    },
    masterTopics () {
      return this.$store.state.chapters.topics
    }
  },
  data () {
    return {
      pdfIncludeArchived: false,
      loading: false,
      wordIncludeArchived: false
    }
  },
  methods: {
    importBackup (file) {
      this.loading = true
      let backup
      jsonFileToBackup(file).then(_backup => {
        backup = _backup
        backup.guid = this.documentGuid
        backup.name = this.documentTitle

        return storageApiPromise().then(storage => {
          return storage.docImport(backup)
        })
      }).then(backup => {
        this.loading = false
        resetCache()

        swal({
          icon: 'success',
          text: 'The document has been imported.',
          title: 'Success'
        }).then(() => {
          return this.$store.dispatch(CHANGE_DOCUMENT,
            { guid: this.documentGuid, name: this.documentTitle }
          )
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

      storageApiPromise().then(storage => {
        return storage.docExport(this.documentGuid, this.documentTitle)
      }).then(backup => {
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
        !chapter.archived || this.pdfIncludeArchived
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
        !chapter.archived || this.pdfIncludeArchived
      ).map(chapter => {
        const chapterTopics = Object.keys(chapter.topics).map(guid => {
          const topic = chapter.topics[guid]
          const masterTopic = this.getMasterTopic(topic)
          topic.archived = masterTopic.archived
          topic.title = `${chapter.title} - ${masterTopic.title}`
          return topic
        }).filter(topic =>
          !topic.archived || this.pdfIncludeArchived
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
        !plan.archived || this.pdfIncludeArchived
      ).map(plan => {
        return plan.sections.filter(section =>
          !section.archived || this.pdfIncludeArchived
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
    exportPdfWorkshops () {
      this.loading = true
      const workshops = this.allWorkshops.filter(workshop =>
        !workshop.archived || this.pdfIncludeArchived
      ).map(workshop => {
        return {
          content: workshop.content,
          date: workshop.date,
          guid: workshop.guid,
          order: workshop.order,
          title: `${writingWorkshops[workshop.workshopName].displayName} (${workshop.date.toString()})`,
          workshopName: workshop.workshopName
        }
      })

      const sortedWorkshops = sortBy(workshops, workshop =>
        `${workshop.workshopName}-${workshop.date.toString()}-${workshop.guid}-${workshop.order}`
      )

      chaptersToPdf(`${this.documentTitle}: Workshops`, sortedWorkshops).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export workshops. DETAILS: "${err}"`
        })
        throw err
      })
    },
    exportWordChapters () {
      if (!this.isPremium) {
        swal({
          button: 'OK',
          dangerMode: true,
          icon: 'error',
          text: `Only Premium users can export to a Microsoft Word document. Please upgrade to a Premium subscription to continue.`,
          title: 'Not allowed'
        })
        return
      }

      this.loading = true
      storageApiPromise().then(storage => {
        return storage.exportToWord({
          guid: this.documentGuid,
          title: this.documentTitle,
          includeArchived: this.wordIncludeArchived
        })
      }).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export to Word. DETAILS: "${err}"`
        })
        throw err
      })
    },
    getMasterTopic (chapterTopic) {
      return this.masterTopics.find(topic => topic.guid === chapterTopic.guid)
    },
    setFile (event) {
      if (!this.isOnline) {
        return
      }

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
