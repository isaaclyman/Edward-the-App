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
          <p class="sentence">
            <strong>Sentence:</strong>
            {{ sentence }}
          </p>
          <div class="words">
            <p>
              <strong>Words:</strong>
            </p>
            <p class="word" v-for="word in words" :key="word">
              {{ word }}
              <a :href="getDefineLink(word)">Define</a>
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
      let sentence = sentences[sentenceNum]
      let lastSentence = sentences[sentenceNum - 1] || ''
      let nextSentence = sentences[sentenceNum + 1] || ''

      if (sentence.length < 30) {
        sentence = lastSentence + '. ' + sentence
      }
      if (sentence.length < 30) {
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

</style>
