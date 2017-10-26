<template>
  <select class="file-dropdown" v-model="fileValue" @change="changeFile">
    <option v-if="!currentFile" value="">No file selected</option>
    <option v-for="file in allFiles" :key="file.id" :value="file.id">
      {{file.name}}
    </option>
  </select>
</template>

<script>
import { CHANGE_FILE } from './file.store'
import FilePicker from './filePicker.vue'

export default {
  components: {
    FilePicker
  },
  computed: {
    allFiles () {
      return this.$store.state.file.ownedFiles
    },
    currentFile () {
      return this.$store.state.file.currentFile
    }
  },
  data () {
    return {
      fileValue: this.currentFile ? this.currentFile.id : ''
    }
  },
  mounted () {
    this.fileValue = this.currentFile ? this.currentFile.id : ''
  },
  methods: {
    changeFile (value) {
      const file = this.allFiles.find(file => file.id === this.fileValue)
      this.$store.dispatch(CHANGE_FILE, file)
    }
  }
}
</script>

<style scoped>
.file-dropdown {
  background-color: #777;
  color: #FFF;
  font-size: 14px;
  padding: 4px;
}

.file-dropdown /deep/ option {
  background-color: #FFF;
  color: #000;
}
</style>
