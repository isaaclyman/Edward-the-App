<template>
  <div class="menu">
    <file-picker></file-picker>
  </div>
</template>

<script>
import FilePicker from './filePicker.vue'

export default {
  components: {
    FilePicker
  },
  data () {
    return {}
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
</style>
