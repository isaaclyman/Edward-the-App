<template>
  <div class="workshop-wrap">
    <div class="workshop">
      <h1>Writer's Unblock</h1>
      <p class="intro">
        A new idea, even a bad one, can unblock your mind and get you writing again.
      </p>
      <p>
        A recent sentence from your novel and two random words will appear below.
        Write a few paragraphs to follow the sentence, and try to use each random word at least once.
        Consider that the words may have multiple meanings.
      </p>
      <div class="warn" v-if="!hasChapterContent">
        <p>You can't do this workshop until you've written at least one sentence in a chapter.</p>
      </div>
      <button v-if="!begun" class="begin button-green" @click="begin()" :disabled="!hasChapterContent">Begin</button>
      <div v-if="begun && !finished">
        <div class="prompt">
          <div class="sentence">
            <p>
              <strong>Sentence:</strong>
            </p>
            <p>
              {{ sentence }}
            </p>
          </div>
          <div class="words">
            <p>
              <strong>Words:</strong>
            </p>
            <p class="word" v-for="word in words" :key="word">
              {{ word }}
              <a class="define-link" :href="getDefineLink(word)" target="_blank">define</a>
            </p>
          </div>
        </div>
        <div class="write">
          <quill-editor :content="content" @update:content="updateContent($event)" ref="quillEditor"></quill-editor>
        </div>
        <div class="actions">
          <button class="done button-green" @click="finish()">Done</button>
        </div>
      </div>
      <div v-else-if="finished">
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
    </div>
  </div>
</template>

<script>
import { ADD_WORKSHOP, DELETE_WORKSHOP, UPDATE_WORKSHOPS_CONTENT } from '../shared/workshops.store'
import Cache from '../shared/cache'
import { GetContentString } from '../shared/deltaParser'
import guid from '../shared/guid'
import QuillEditor from '../shared/quillEditor.vue'
import randomWords from './resources/random-words'
import writingWorkshops from '../../../models/writingWorkshop'

const exerciseCache = new Cache('WRITERS_UNBLOCK_CURRENT_EXERCISE')
const promptCache = new Cache('WRITERS_UNBLOCK_PROMPTS')

export default {
  components: {
    QuillEditor
  },
  computed: {
    allChapters () {
      return this.$store.state.chapters.chapters
    },
    allWorkshops () {
      return this.$store.state.workshop.workshops
    },
    content () {
      return this.workshop ? this.workshop.content : null
    },
    hasChapterContent () {
      const sentences = this.getChapterSentences()
      const text = sentences.join('').trim()
      return !!text.length
    },
    fullText () {
      return GetContentString(this.content)
    }
  },
  data () {
    return {
      begun: false,
      finished: false,
      sentence: '',
      words: [],
      workshop: null
    }
  },
  methods: {
    begin (currentWorkshop, currentPrompts) {
      this.begun = true

      if (!currentWorkshop) {
        this.newWorkshop()
      } else {
        this.workshop = currentWorkshop

        if (currentPrompts) {
          this.sentence = currentPrompts.sentence
          this.words = currentPrompts.words
        }
      }
    },
    checkForDeletion () {
      if (!this.fullText.trim()) {
        exerciseCache.cacheDelete()
        promptCache.cacheDelete()
        if (this.workshop && this.allWorkshops.includes(this.workshop)) {
          this.$store.commit(DELETE_WORKSHOP, { workshop: this.workshop })
        }
      }
    },
    finish () {
      exerciseCache.cacheDelete()
      promptCache.cacheDelete()
      this.finished = true
      this.checkForDeletion()
    },
    getChapterSentences () {
      const chapters = this.allChapters.slice(-10)
      const fullText = chapters.map(chapter => GetContentString(chapter.content)).join('. ')
      const sentences = fullText.replace(/\.[ *.]+/g, '.').split('.')
      return sentences.filter(sentence => !!sentence.trim())
    },
    getCurrentPrompts () {
      const cachedPrompts = promptCache.cacheGet()
      if (!cachedPrompts) {
        return null
      }

      return cachedPrompts
    },
    getCurrentWorkshop () {
      const cachedGuid = exerciseCache.cacheGet()
      if (!cachedGuid) {
        return null
      }

      const workshop = this.allWorkshops.find(workshop => workshop.guid === cachedGuid)
      return workshop || null
    },
    getDefineLink (word) {
      const urlWord = word.trim().replace(/\s+/g, '+')
      return `https://www.google.com/#q=define+${urlWord}`
    },
    getRandomSentence () {
      const sentences = this.getChapterSentences()
      const sentenceNum = this.randomInt(sentences.length - 2)
      let sentence = sentences[sentenceNum].trim()
      let lastSentence = (sentences[sentenceNum - 1] || '').trim()
      let nextSentence = (sentences[sentenceNum + 1] || '').trim()

      if (sentence.length < 30 && lastSentence) {
        sentence = lastSentence + '. ' + sentence
      }
      if (sentence.length < 30 && nextSentence) {
        sentence = sentence + '. ' + nextSentence
      }

      sentence += '.'

      return sentence
    },
    getRandomWords () {
      const halfwayPoint = Math.floor((randomWords.length - 1) / 2)
      const firstWordNum = this.randomInt(halfwayPoint)
      const firstWord = randomWords[firstWordNum]

      let secondWordNum = this.randomInt(halfwayPoint) + halfwayPoint
      const secondWord = randomWords[secondWordNum]
      return [firstWord, secondWord]
    },
    newWorkshop () {
      promptCache.cacheDelete()
      this.sentence = this.getRandomSentence()
      this.words = this.getRandomWords()
      promptCache.cacheSet({ sentence: this.sentence, words: this.words })

      exerciseCache.cacheDelete()
      this.workshop = {
        archived: false,
        guid: guid(),
        title: `Writer's Unblock ${new Date().toLocaleDateString()}`,
        order: 0,
        workshopName: writingWorkshops.WRITERS_UNBLOCK.name,
        content: null,
        date: new Date().toLocaleDateString('en-US')
      }
      this.$store.commit(ADD_WORKSHOP, { workshop: this.workshop })
      exerciseCache.cacheSet(this.workshop.guid)
    },
    randomInt (max) {
      return Math.floor(Math.random() * Math.floor(max + 1))
    },
    reset () {
      this.begun = false
      this.finished = false
      this.workshop = null
    },
    updateContent ({ content }) {
      this.$store.commit(UPDATE_WORKSHOPS_CONTENT, {
        workshopUpdates: [{
          workshop: this.workshop,
          newContent: content
        }]
      })
    }
  },
  created () {
    const workshop = this.getCurrentWorkshop()
    if (workshop) {
      const prompts = this.getCurrentPrompts()
      this.begin(workshop, prompts)
    }
  },
  beforeDestroy () {
    this.checkForDeletion()
  }
}
</script>

<style>
.prompt {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
}

.warn {
  color: red;
}

.sentence {
  border-right: 1px solid #CCC;
  flex: 1;
  padding-right: 20px;
}

.words {
  flex: 1;
  padding-left: 20px;
}

a.define-link {
  color: #444;
  display: inline-block;
  font-size: 12px;
  margin-left: 4px;
}

.write {
  height: 300px;
  margin-bottom: 12px;
}

.actions {
  margin-bottom: 20px;
}
</style>
