<template>
  <div class="wrap">
    <div class="exporter">
      <div>
        <h3>Export to PDF</h3>
        <div>(You can open PDFs in Microsoft Word.)</div>
        <button class="button-green export-button" @click="exportDocxChapters()">
          Export all chapters
        </button>
      </div>
      <div>
        <h3>Export to JSON</h3>
      </div>
      <div>
        <h3>Import from JSON</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { chaptersToPdf } from './pdf'

export default {
  computed: {
    allChapters () {
      return this.$store.state.chapters.chapters
    },
    documentTitle () {
      return this.$store.state.file.currentFile.name
    }
  },
  data () {
    return {}
  },
  methods: {
    exportDocxChapters () {
      chaptersToPdf(this.documentTitle, this.allChapters)
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

.export-button {
  margin: 10px 0;
}
</style>
