<template>
  <div class="wrap">
    <div class="write">
      <h1>Free Write</h1>
      <p class="intro">
        Write whatever comes to mind. Don't worry about style, grammar, or making sense.
        If you'd like, you can set a time or word limit:
      </p>
      <timer @begin="begin()" :fullText="fullText"></timer>
      <div v-if="begun" class="editor">
        <quill-editor :content="content" @update:content="updateContent($event)"></quill-editor>
      </div>
    </div>
  </div>
</template>

<script>
import { GetContentString } from '../shared/deltaParser'
import QuillEditor from '../shared/quillEditor.vue'
import Timer from '../shared/timer.vue'

export default {
  components: {
    QuillEditor,
    Timer
  },
  computed: {
    fullText () {
      return GetContentString(this.content)
    }
  },
  data () {
    return {
      begun: false,
      content: null
    }
  },
  methods: {
    begin () {
      this.begun = true
    },
    updateContent (content) {
      this.content = content
    }
  }
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.write {
  display: block;
  flex: 1;
  max-width: 1050px;
}

.intro {
  margin: 0;
}
</style>
