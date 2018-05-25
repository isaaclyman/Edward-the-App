<template>
  <div class="workshop-wrap">
    <div class="workshop">
      <div class="intro">
        <h1>Novel Quickstart</h1>
        <p v-if="!finished">
          <strong>Answer the following prompts.</strong> You'll start simple and add more details as you go along.
          By the end, you'll be ready to start plotting and outlining your novel.
        </p>
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="!finished" class="content" key="content">
          <!-- Title -->
          <p class="description">Write the title of your novel:</p>
          <div class="editor short title">
            <quill-editor :content="content.title" @update:content="updateContent(0, $event)"></quill-editor>
          </div>
          <!-- Tagline -->
          <p class="description">Write a tagline: a short, catchy slogan that draws potential readers in.</p>
          <p class="example">e.g. "Can the best thing happen at the worst time?"</p>
          <div class="editor short tagline">
            <quill-editor :content="content.tagline" @update:content="updateContent(1, $event)"></quill-editor>
          </div>
          <!-- Two-sentence summary (NYT bestseller snippet) -->
          <p class="description">
            Summarize your novel in one or two sentences, like the descriptions in the New York Times bestseller list.
          </p>
          <p class="example">
            e.g. "In the year 2149, a young family struggles to survive in an irradiated countryside."
          </p>
          <div class="editor short summary">
            <quill-editor :content="content.summary" @update:content="updateContent(2, $event)"></quill-editor>
          </div>
          <!-- Theme -->
          <p class="description">In a sentence or two, explain the theme of the novel and why it's important to you.</p>
          <p class="example">
            e.g. "This novel is about learning to trust the people who are always there for you.
            I want the reader to know that it's okay to believe in others, even if they've been hurt before."
          </p>
          <div class="editor short theme">
            <quill-editor :content="content.theme" @update:content="updateContent(3, $event)"></quill-editor>
          </div>
          <!-- Back jacket (a few paragraphs) -->
          <p class="description">
            Write the "back jacket" of the novel: a few paragraphs that introduce the plot and characters.
          </p>
          <div class="editor medium jacket">
            <quill-editor :content="content.jacket" @update:content="updateContent(4, $event)"></quill-editor>
          </div>
          <!-- Book report (a page or two) -->
          <p class="description">
            Write a book report about your novel: several paragraphs that describe the most important parts.
          </p>
          <div class="editor long report">
            <quill-editor :content="content.report" @update:content="updateContent(5, $event)"></quill-editor>
          </div>
          <button class="button-green done" @click="finish()">Finish</button>
        </div>
        <div v-else class="finished" key="finished">
          <div v-if="this.fullText.trim()">
            <p>
              Saved! You can view what you've written in the Workshops column of the Write page.
            </p>
            <p>
              If you're ready to start writing, you can visit the <router-link to="/write">Write</router-link> page.
              You can also visit the <router-link to="/plan">Plan</router-link> page to do more plotting and development,
              or the <router-link to="/outline">Outline</router-link> page to start outlining individual chapters.
            </p>
          </div>
          <div v-else>
            <p>
              Deleted! This workshop was empty.
            </p>
          </div>
          <button class="button-green" @click="reset()">Start over</button>
        </div>
      </transition>      
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

const exerciseCache = new Cache('NOVEL_QUICKSTART_CURRENT_EXERCISE')

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
      if (!this.workshops) {
        return {}
      }

      return {
        title: this.workshops[0].content,
        tagline: this.workshops[1].content,
        summary: this.workshops[2].content,
        theme: this.workshops[3].content,
        jacket: this.workshops[4].content,
        report: this.workshops[5].content
      }
    },
    fullText () {
      if (!this.workshops || !this.workshops.length) {
        return ''
      }

      return this.workshops.reduce((acc, el) => acc + GetContentString(el.content), '')
    }
  },
  data () {
    return {
      finished: false,
      workshops: null
    }
  },
  methods: {
    begin (currentWorkshops) {
      if (!currentWorkshops) {
        this.newWorkshop()
      } else {
        this.workshops = currentWorkshops
      }
    },
    checkForDeletion () {
      if (!this.fullText.trim()) {
        exerciseCache.cacheDelete()
        if (this.workshops && this.workshops.length && this.allWorkshops.includes(this.workshops[0])) {
          this.workshops.forEach(workshop => this.$store.commit(DELETE_WORKSHOP, { workshop }))
        }
      }
    },
    finish () {
      exerciseCache.cacheDelete()
      this.finished = true
      this.checkForDeletion()
    },
    getCurrentWorkshop () {
      const cachedGuid = exerciseCache.cacheGet()
      if (!cachedGuid) {
        return null
      }

      const workshops = this.allWorkshops.filter(workshop => workshop.guid === cachedGuid)
      return workshops && workshops.length ? workshops : null
    },
    newWorkshop () {
      exerciseCache.cacheDelete()
      const uuid = guid()
      const title = `Novel Quickstart ${new Date().toLocaleDateString()}`
      this.workshops = [0, 1, 2, 3, 4, 5].map(order => ({
        archived: false,
        guid: uuid,
        title,
        order,
        workshopName: writingWorkshops.NOVEL_QUICKSTART.name,
        content: null,
        date: new Date().toLocaleDateString('en-US')
      }))

      this.workshops.forEach(workshop => this.$store.commit(ADD_WORKSHOP, { workshop }))
      exerciseCache.cacheSet(uuid)
    },
    reset () {
      this.finished = false
      this.workshops = null
      this.begin()
    },
    updateContent (index, { content }) {
      this.$store.commit(UPDATE_WORKSHOPS_CONTENT, {
        workshopUpdates: [{
          workshop: this.workshops[index],
          newContent: content
        }]
      })
    }
  },
  created () {
    const workshops = this.getCurrentWorkshop()
    this.begin(workshops || null)
  },
  beforeDestroy () {
    this.checkForDeletion()
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
}

.intro {
  margin: 0;
  margin-bottom: 20px;
  max-width: 100%;
  width: 600px;
}

.content {
  margin-bottom: 30px;
  max-width: 100%;;
  position: relative;
  width: 600px;
}

.description {
  margin-bottom: 2px;
}

.example {
  color: #444;
  font-size: 14px;
  font-style: italic;
}

.editor {
  display: block;
  margin-bottom: 75px;
  transition: opacity 200ms;
}

.editor.short {
  height: 80px;
}

.editor.medium {
  height: 180px;
}

.editor.long {
  height: 280px;
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
  max-width: 100%;
  width: 600px;
}
</style>
