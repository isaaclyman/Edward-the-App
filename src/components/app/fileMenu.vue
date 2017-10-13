<template>
  <div class="menu">
    <div>
      <select class="file-dropdown" v-model="fileValue">
        <option v-if="!currentFile" value="">No file selected</option>
        <option v-for="file in allFiles" :key="file.id">
          {{file.name}}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { CHANGE_FILE } from './file.store'

export default {
  components: {},
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
  props: {},
  watch: {
    fileValue (value) {
      const file = this.allFiles.find(file => file.id === value)
      this.$store.commit(CHANGE_FILE, file)
    }
  }
}
</script>

<style scoped>
.menu {
  align-items: center;
  background-color: #444;
  display: flex;
  flex-direction: row;
  height: 30px;
  padding: 2px 30px;
}

.file-dropdown {
  color: #FFF;
  font-size: 14px;
  padding: 4px;
}
</style>
