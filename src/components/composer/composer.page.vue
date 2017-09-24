<template>
  <div class="composer">
    <div class="editor-wrap">
      <text-editor></text-editor>
    </div>
    <div class="map-wrap">

    </div>
    <div class="sidebar-wrap">

    </div>
  </div>
</template>

<script>
import Editor from './editor.vue'

export default {
  components: {
    TextEditor: Editor
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
.composer {
  display: flex;
  flex: 1;
  min-height: 300px;
}

.editor-wrap {
  display: flex;
  flex: 1;
}

.map-wrap {
  display: flex;
  height: 100%;
  width: 120px;
}

.sidebar-wrap {
  display: flex;
  height: 100%;
  width: 300px;
}

/* MOBILE */
@media (max-width: 700px) {
  .map-wrap {
    display: none;
  }
}
</style>
