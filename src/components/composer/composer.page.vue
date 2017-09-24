<template>
  <div class="composer">
    <div class="editor-wrap">
      <text-editor ref="textEditor" :scroll-to="scrollTo"></text-editor>
    </div>
    <div class="map-wrap">
      <text-map :editor-element="editorElement" :data-stream="$store.state.composer.deltaContent"
                @select="selectMap"></text-map>
    </div>
    <div class="sidebar-wrap">

    </div>
  </div>
</template>

<script>
import TextEditor from './editor.vue'
import TextMap from './map.vue'

export default {
  components: {
    TextEditor,
    TextMap
  },
  data () {
    return {
      editorElement: null,
      scrollTo: 0
    }
  },
  methods: {
    selectMap (index) {
      this.scrollTo = index
    }
  },
  mounted () {
    this.editorElement = this.$refs.textEditor
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
  width: 160px;
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
