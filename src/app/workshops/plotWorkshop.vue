<template>
  <div class="workshop-wrap">
    <div class="workshop">
      <h1>Plot & Character Workshop</h1>
      <p>
        A prompt will appear below. Follow the prompt to help you build your plot and develop your characters.
      </p>
      <button 
        v-if="!begun" 
        class="begin button-green" 
        @click="begin()"
      >
        Begin
      </button>
      <div v-if="begun && !finished">
        <div class="prompt">
          <p>
            <strong>Prompt:</strong>
          </p>
          <p>
            {{ prompt }}
          </p>
        </div>
        <div class="write">
          <quill-editor 
            :content="content" 
            @update:content="updateContent($event)" 
            ref="quillEditor"
          />
        </div>
        <div class="actions">
          <button 
            class="done button-green" 
            @click="finish()"
          >
            Done
          </button>
        </div>
      </div>
      <div v-else-if="finished">
        <p class="finished">
          <template v-if="this.fullText.trim()">
            <strong>Saved!</strong> You can view this exercise in the Workshops column of the Write page.
          </template>
          <template v-else>
            <strong>Deleted!</strong> This exercise was empty.
          </template>
        </p>
        <button 
          class="button-green" 
          @click="reset()"
        >
          Start over
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_WORKSHOP, DELETE_WORKSHOP, UPDATE_WORKSHOPS_CONTENT } from '../shared/workshops.store'
import Cache from '../shared/cache'
import { GetContentString } from '../shared/deltaParser'
import guid from '../shared/guid'
import PlotPrompts from './resources/plot-prompts'
import QuillEditor from '../shared/quillEditor.vue'
import writingWorkshops from '../../../models/writingWorkshop'

const exerciseCache = new Cache('PLOT_WORKSHOP_CURRENT_EXERCISE')
const promptCache = new Cache('PLOT_WORKSHOP_PROMPTS')

export default {
  components: {
    QuillEditor,
  },
  computed: {
    allWorkshops() {
      return this.$store.state.workshop.workshops
    },
    content() {
      return this.workshop ? this.workshop.content : null
    },
    fullText() {
      return GetContentString(this.content)
    },
  },
  data() {
    return {
      begun: false,
      finished: false,
      prompt: '',
      workshop: null,
    }
  },
  methods: {
    begin(currentWorkshop, currentPrompt) {
      this.begun = true

      if (!currentWorkshop) {
        this.newWorkshop()
      } else {
        this.workshop = currentWorkshop

        if (currentPrompt) {
          this.prompt = currentPrompt
        }
      }
    },
    checkForDeletion() {
      if (!this.fullText.trim()) {
        exerciseCache.cacheDelete()
        promptCache.cacheDelete()
        if (this.workshop && this.allWorkshops.includes(this.workshop)) {
          this.$store.commit(DELETE_WORKSHOP, { workshop: this.workshop })
        }
      }
    },
    finish() {
      exerciseCache.cacheDelete()
      promptCache.cacheDelete()
      this.finished = true
      this.checkForDeletion()
    },
    getCurrentPrompts() {
      const cachedPrompts = promptCache.cacheGet()
      if (!cachedPrompts) {
        return null
      }

      return cachedPrompts
    },
    getCurrentWorkshop() {
      const cachedGuid = exerciseCache.cacheGet()
      if (!cachedGuid) {
        return null
      }

      const workshop = this.allWorkshops.find(workshop => workshop.guid === cachedGuid)
      return workshop || null
    },
    getDefineLink(word) {
      const urlWord = word.trim().replace(/\s+/g, '+')
      return `https://www.google.com/#q=define+${urlWord}`
    },
    getRandomPrompt() {
      return PlotPrompts[this.randomInt(PlotPrompts.length)]
    },
    newWorkshop() {
      promptCache.cacheDelete()
      this.prompt = this.getRandomPrompt()
      promptCache.cacheSet(this.prompt)

      exerciseCache.cacheDelete()
      this.workshop = {
        archived: false,
        guid: guid(),
        title: `Plot Workshop ${new Date().toLocaleDateString()}`,
        order: 0,
        workshopName: writingWorkshops.PLOT_WORKSHOP.name,
        content: null,
        date: new Date().toLocaleDateString('en-US'),
      }
      this.$store.commit(ADD_WORKSHOP, { workshop: this.workshop })
      exerciseCache.cacheSet(this.workshop.guid)
    },
    randomInt(max) {
      return Math.floor(Math.random() * Math.floor(max + 1))
    },
    reset() {
      this.begun = false
      this.finished = false
      this.workshop = null
    },
    updateContent({ content }) {
      this.$store.commit(UPDATE_WORKSHOPS_CONTENT, {
        workshopUpdates: [{
          workshop: this.workshop,
          newContent: content,
        }],
      })
    },
  },
  created() {
    const workshop = this.getCurrentWorkshop()
    if (workshop) {
      const prompts = this.getCurrentPrompts()
      this.begin(workshop, prompts)
    }
  },
  beforeDestroy() {
    this.checkForDeletion()
  },
}
</script>

<style scoped>
.prompt {
  margin: 16px 0;
}

.warn {
  color: #DA0000;
}

.write {
  height: 300px;
  margin-bottom: 16px;
}
</style>
