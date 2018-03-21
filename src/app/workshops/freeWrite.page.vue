<template>
  <div class="workshops-wrap">
    <div class="write">
      <h1>Free Write</h1>
      <p class="intro">
        Write whatever comes to mind. Don't worry about style, grammar, or making sense.
      </p>
      <p class="intro" v-if="!begun">If you'd like, you can set a time or word limit:</p>
      <div v-show="!finished">
        <timer @begin="begin()" :fullText="fullText"></timer>
        <div v-if="begun" class="editor" :class="{ 'saving': saving }">
          <quill-editor :content="content" @update:content="updateContent($event)" ref="quillEditor"></quill-editor>
        </div>
      </div>
      <p class="finished" v-show="finished">
        <strong>Saved!</strong> You can view this free write in the Workshops column of the Write page.
      </p>
      <div v-if="begun && !finished" class="done">
        <button class="button-green" @click="finish()">Done</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_WORKSHOP, UPDATE_WORKSHOPS_CONTENT } from '../shared/workshops.store'
import Cache from '../shared/cache'
import { GetContentString } from '../shared/deltaParser'
import guid from '../shared/guid'
import QuillEditor from '../shared/quillEditor.vue'
import Timer from '../shared/timer.vue'
import writingWorkshops from '../../../models/writingWorkshop'

const exerciseCache = new Cache('FREE_WRITE_CURRENT_EXERCISE')

export default {
  components: {
    QuillEditor,
    Timer
  },
  computed: {
    allWorkshops () {
      return this.$store.state.workshop.workshops
    },
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
      finished: false,
      saving: false,
      workshop: null
    }
  },
  methods: {
    begin () {
      this.begun = true

      const cachedGuid = exerciseCache.cacheGet()
      if (!cachedGuid) {
        this.newWorkshop()
      } else {
        const workshop = this.allWorkshops.find(workshop => workshop.guid === cachedGuid)

        if (!workshop) {
          exerciseCache.cacheDelete()
          this.newWorkshop()
          return
        }

        this.workshop = workshop
        this.begun = true
      }
    },
    finish () {
      this.$refs.quillEditor.disable()
      this.saving = true
      setTimeout(() => {
        exerciseCache.cacheDelete()
        this.finished = true
        this.saving = false
      }, 1000)
    },
    newWorkshop () {
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
      exerciseCache.cacheSet(this.workshop.guid)
    },
    updateContent (content) {
      this.$store.commit(UPDATE_WORKSHOPS_CONTENT, {
        workshopUpdates: [{
          workshop: this.workshop,
          newContent: content,
          newTitle: `${GetContentString(content).slice(0, 20)}...`
        }]
      })
    }
  },
  mounted () {
    if (exerciseCache.cacheGet()) {
      this.begin()
    }
  }
}
</script>

<style scoped>
.workshops-wrap {
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

.editor {
  display: block;
  height: 200px;
  margin-bottom: 50px;
  min-height: 200px;
  transition: opacity 200ms;
}

.editor.saving {
  opacity: 0.75;
}

.editor .wrap {
  height: 100%;
  width: 100%;
}

.finished {
  margin-top: 20px;
}
</style>
