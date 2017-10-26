<template>
  <div class="wrap">
    <div class="exporter">
      <div class="export-option">
        <h3>Export to PDF</h3>
        <div>(You can open PDFs in Microsoft Word.)</div>
        <pulse-loader v-if="loading"></pulse-loader>
        <button v-if="!loading" class="button-green export-button" @click="exportDocxChapters()">
          Export all chapters
        </button>
      </div>
      <div class="export-option">
        <h3>Export to JSON</h3>
        <div>(This is good for making a backup of your work.)</div>
        <pulse-loader v-if="loading"></pulse-loader>
        <button v-if="!loading" class="button-green export-button" @click="exportJsonDocument()">
          Export entire document
        </button>
      </div>
      <div class="export-option">
        <h3>Import from JSON</h3>
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
import { GetDocumentBackup } from '../app/file.store'
import { LOAD_CONTENT } from '../app/chapters.store'
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
    documentId () {
      return this.$store.state.file.currentFile.id
    },
    documentTitle () {
      return this.$store.state.file.currentFile.name
    }
  },
  data () {
    return {
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
      })
    },
    exportDocxChapters () {
      this.loading = true
      chaptersToPdf(this.documentTitle, this.allChapters).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export the document. DETAILS: "${err}"`
        })
      })
    },
    exportJsonDocument () {
      this.loading = true
      backupToJsonFile(this.documentTitle, GetDocumentBackup(this.documentId)).then(() => {
        this.loading = false
      }, err => {
        this.loading = false
        swal({
          icon: 'error',
          text: `Could not export the document. DETAILS: "${err}"`
        })
      })
    },
    setFile (event) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to import this document? It will overwrite everything in the current document.`,
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
