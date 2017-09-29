<template>
  <div class="quill-wrap">
    <quill-editor :scroll-to="scrollTo" :content="content" @update:content="updateContent"
                  @update:selection="updateSelection"></quill-editor>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
import QuillEditor from '../app/quillEditor.vue'
import { UPDATE_CONTENT, UPDATE_SELECTION } from './composer.store'

export default {
  components: {
    QuillEditor
  },
  computed: {
    content () {
      return this.$store.state.composer.deltaContent
    },
    selection () {
      return this.$store.state.composer.selection
    }
  },
  data () {
    return {}
  },
  methods: {
    updateContent (delta) {
      const oldDelta = this.$store.state.composer.deltaContent

      if (isEqual(delta, oldDelta)) {
        return
      }

      this.$store.commit(UPDATE_CONTENT, delta)
    },
    updateSelection (selection) {
      const oldSelection = this.$store.state.composer.selection

      if (isEqual(selection, oldSelection)) {
        return
      }

      this.$store.commit(UPDATE_SELECTION, selection)
    }
  },
  props: {
    scrollTo: {
      type: Object
    }
  }
}
</script>

<style>
.quill-wrap {
  height: 100%;
  margin-right: 15px;
  width: 100%;
}
</style>
