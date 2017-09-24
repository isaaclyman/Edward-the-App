<template>
  <quill-editor :content="content" @update:content="updateContent"></quill-editor>
</template>

<script>
import isEqual from 'lodash/isEqual'
import QuillEditor from '../app/quillEditor.vue'
import { UPDATE_CONTENT } from './composer.store'

export default {
  components: {
    QuillEditor
  },
  computed: {
    content () {
      return this.$store.state.composer.deltaContent
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
    }
  }
}
</script>

<style>

</style>
