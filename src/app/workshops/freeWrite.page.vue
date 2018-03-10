<template>
  <div class="wrap">
    <div class="write">
      <h1>Free Write</h1>
      <p class="intro">
        Write whatever comes to mind. Don't worry about style, grammar, or making sense.
      </p>
      <p class="intro" v-if="!begun">If you'd like, you can set a time or word limit:</p>
      <timer @begin="begin()" :fullText="fullText"></timer>
      <div v-if="begun" class="editor">
        <quill-editor :content="content" @update:content="updateContent($event)"></quill-editor>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_WORKSHOP, UPDATE_WORKSHOPS_CONTENT } from '../shared/workshops.store'
import { GetContentString } from '../shared/deltaParser'
import guid from '../shared/guid'
import QuillEditor from '../shared/quillEditor.vue'
import Timer from '../shared/timer.vue'
import writingWorkshops from '../../../models/writingWorkshop'

export default {
  components: {
    QuillEditor,
    Timer
  },
  computed: {
    content () {
      return this.workshop ? this.workshop.content : null
    },
    fullText () {
      return GetContentString(this.content)
    }
  },
  data () {
    return {
      begun: false,
      workshop: null
    }
  },
  methods: {
    begin () {
      this.begun = true
      this.workshop = {
        archived: false,
        guid: guid(),
        title: `Free Write ${new Date().toLocaleDateString()}`,
        order: 0,
        workshopName: writingWorkshops.FREE_WRITE.name,
        content: null,
        date: new Date().toLocaleDateString()
      }
      this.$store.commit(ADD_WORKSHOP, { workshop: this.workshop })
    },
    updateContent (content) {
      this.$store.commit(UPDATE_WORKSHOPS_CONTENT, {
        workshopUpdates: [{
          workshop: this.workshop,
          newContent: content
        }]
      })
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
