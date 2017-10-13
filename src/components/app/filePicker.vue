<template>
  <select class="file-dropdown" v-model="fileValue">
    <option v-if="!currentFile" value="">No file selected</option>
    <option v-for="file in allFiles" :key="file.id">
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
      return this.$store.state.ownedFiles
    },
    currentFile () {
      return this.$store.state.file.currentFile
    }
  },
  data () {
    return {
      fileValue: ''
    }
  },
  watch: {
    fileValue (value) {
      const file = this.allFiles.find(file => file.id === value)
      this.$store.dispatch(CHANGE_FILE, file)
    }
  }
}
</script>

<style scoped>
.file-dropdown {
  color: #FFF;
  font-size: 14px;
  padding: 4px;
}
</style>
