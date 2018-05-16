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
      <button v-if="!begun" class="button-green" @click="begin()">Begin</button>
      <div v-if="begun">
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
        <button class="button-green" @click="done()">Done</button>
      </div>
    </div>
  </div>
</template>

<script>
import { GetContentString } from '../shared/deltaParser'
import QuillEditor from '../shared/quillEditor.vue'
import randomWords from './resources/random-words'

export default {
  components: {
    QuillEditor
  },
  computed: {
    allChapters () {
      return this.$store.state.chapters.chapters
    }
  },
  data () {
    return {
      begun: false,
      content: null,
      sentence: '',
      words: []
    }
  },
  methods: {
    begin () {
      this.sentence = this.getRandomSentence()
      this.words = this.getRandomWords()
      this.begun = true
    },
    done () {

    },
    getDefineLink (word) {
      const urlWord = word.trim().replace(/\s+/g, '+')
      return `https://www.google.com/#q=define+${urlWord}`
    },
    getRandomSentence () {
      const chapters = this.allChapters.slice(-10)
      const fullText = chapters.map(chapter => GetContentString(chapter.content)).join('. ')
      const sentences = fullText.replace(/\.[ *.]+/g, '.').split('.')
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
    randomInt (max) {
      return Math.floor(Math.random() * Math.floor(max + 1))
    },
    updateContent (content) {
      // this.$store.commit(UPDATE_WORKSHOPS_CONTENT, {
      //   workshopUpdates: [{
      //     workshop: this.workshop,
      //     newContent: content,
      //     newTitle: `${GetContentString(content).slice(0, 20)}...`
      //   }]
      // })
    }
  }
}
</script>

<style>
.prompt {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
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
  margin-bottom: 12px;
}
</style>
