<template>
  <div class="quill-wrap">
    <quill-editor :scroll-to="scrollTo" :content="content" 
                  @update:content="updateContent"
                  @update:selection="updateSelection"
                  @update:textContent="updateTextContent"></quill-editor>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
import QuillEditor from '../app/quillEditor.vue'

export default {
  components: {
    QuillEditor
  },
  data () {
    return {}
  },
  methods: {
    updateContent (delta) {
      const oldDelta = this.content

      if (isEqual(delta, oldDelta)) {
        return
      }

      this.$emit('update:content', delta)
    },
    updateSelection (selection) {
      const oldSelection = this.selection

      if (isEqual(selection, oldSelection)) {
        return
      }

      this.$emit('update:selection', selection)
    },
    updateTextContent (text) {
      this.$emit('update:textContent', text)
    }
  },
  props: {
    content: {
      required: true
    },
    scrollTo: {
      type: Object
    },
    selection: {
      type: Object
    }
  }
}
</script>

<style>
.quill-wrap {
  height: calc(100% - 30px);
  margin-right: 15px;
  width: 100%;
}
</style>
