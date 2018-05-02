<template>
  <div class="workshops-wrap">
    <div class="write">
      <h1>Free Write</h1>
      <p class="intro">
        Write whatever comes to mind. Don't worry about style, grammar, or making sense.
      </p>
      <p class="intro" v-if="!begun">If you'd like, you can set a time or word limit:</p>
      <transition name="shrink">
        <div class="timer-wrap" v-if="!finished">
          <timer @begin="begin()" :fullText="fullText"></timer>
        </div>
      </transition>
      <div class="content">
        <transition name="fade" mode="out-in">
          <div v-if="begun && !finished" class="content-inner" key="editor">
            <div class="editor">
              <quill-editor :content="content" @update:content="updateContent($event)" ref="quillEditor"></quill-editor>
            </div>
            <div class="done">
              <button class="button-green" @click="finish()">Done</button>
            </div>
          </div>
          <div v-else-if="finished" class="content-inner" key="done">
            <p class="finished">
              <template v-if="this.fullText.trim()">
                <strong>Saved!</strong> You can view this free write in the Workshops column of the Write page.
              </template>
              <template v-else>
                <strong>Deleted!</strong> This free write was empty.
              </template>
            </p>
            <button class="button-green" @click="reset()">Start over</button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_WORKSHOP, DELETE_WORKSHOP, UPDATE_WORKSHOPS_CONTENT } from '../shared/workshops.store'
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
      workshop: null
    }
  },
  methods: {
    begin (currentWorkshop) {
      this.begun = true

      if (!currentWorkshop) {
        this.newWorkshop()
      } else {
        this.workshop = currentWorkshop
      }
    },
    finish () {
      this.$refs.quillEditor.disable()
      exerciseCache.cacheDelete()
      this.finished = true
    },
    getCurrentWorkshop () {
      const cachedGuid = exerciseCache.cacheGet()
      if (!cachedGuid) {
        return null
      }

      const workshop = this.allWorkshops.find(workshop => workshop.guid === cachedGuid)
      return workshop || null
    },
    newWorkshop () {
      exerciseCache.cacheDelete()
      this.workshop = {
        archived: false,
        guid: guid(),
        title: `Free Write ${new Date().toLocaleDateString()}`,
        order: 0,
        workshopName: writingWorkshops.FREE_WRITE.name,
        content: null,
        date: new Date().toLocaleDateString('en-US')
      }
      this.$store.commit(ADD_WORKSHOP, { workshop: this.workshop })
      exerciseCache.cacheSet(this.workshop.guid)
    },
    reset () {
      this.begun = false
      this.finished = false
      this.workshop = null
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
  created () {
    const workshop = this.getCurrentWorkshop()
    if (workshop) {
      this.begin(workshop)
    }
  },
  beforeDestroy () {
    if (!this.fullText.trim()) {
      exerciseCache.cacheDelete()
      if (this.workshop) {
        this.$store.commit(DELETE_WORKSHOP, { workshop: this.workshop })
      }
    }
  }
}
</script>

<style scoped>
.shrink-enter-active, .shrink-leave-active {
  transition: max-height 200ms, opacity 200ms;
}

.shrink-enter, .shrink-leave-to {
  opacity: 0;
  max-height: 0;
}

.shrink-enter-to, .shrink-leave {
  opacity: 1;
  max-height: 300px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
}

.workshops-wrap {
  display: flex;
  font-size: 16px;
  justify-content: center;
  width: 100%;
}

.write {
  display: block;
  flex: 1;
  max-width: 100%;
  width: 1050px;
}

.intro {
  margin: 0;
}

.timer-wrap {
  overflow: hidden;
}

.content {
  height: 300px;
  position: relative;
}

.content-inner {
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.editor {
  display: block;
  height: 200px;
  margin-bottom: 50px;
  min-height: 200px;
  transition: opacity 200ms;
}

.editor.saving {
  opacity: 0.5;
}

.editor .wrap {
  height: 100%;
  width: 100%;
}

.finished {
  margin-top: 20px;
}
</style>
