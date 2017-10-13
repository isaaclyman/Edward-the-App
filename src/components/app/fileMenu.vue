<template>
  <div class="menu">
    <div class="menu-item">
      <file-picker></file-picker>
    </div>
    <div class="menu-item">
      <button class="menu-button" @click="showWizard()">
        New...
      </button>
    </div>
  </div>
</template>

<script>
import FilePicker from './filePicker.vue'
import { UNLOAD_CURRENT_DOCUMENT } from './file.store'

export default {
  components: {
    FilePicker
  },
  data () {
    return {}
  },
  methods: {
    showWizard () {
      this.$store.dispatch(UNLOAD_CURRENT_DOCUMENT)
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

.menu-item {
  color: #FFF;
  margin: 3px 0;
  margin-right: 20px;
}

.menu-button {
  color: #FFF;
  padding: 3px 10px;
}
</style>
