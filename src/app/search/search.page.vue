<template>
  <div class="wrap">
    <div class="search">
      <h2>Document Search</h2>
      <p>
        Enter a partial word, full word or phrase and Edward will find all your chapters, outlines, plans and workshops
        that match it.
      </p>
      <div class="search-box">
        <input class="search-input" v-model="searchText" type="text" placeholder="Search text" @keyup.enter="search()">
        <button class="button-green" @click="search()">Search</button>
      </div>
      <transition name="fade" mode="out-in">
        <div class="results" v-if="!loading" key="results">
          <hr v-if="hasResults">
          <div class="chapters" v-if="matches.chapters.length">
            <h3>Chapters</h3>
            <div class="result" v-for="chapter in matches.chapters" :key="chapter.guid">
              <p class="result-title">
                <strong v-text="chapter.title"></strong>
                <button class="link-out" v-html="linkSvg" @click="goToChapter(chapter.guid)"></button>
              </p>
              <p class="match" v-for="match in chapter._matches" :key="match.index">
                <span v-if="!match.atHead">...</span>
                <span v-text="match.pre"></span>
                <em v-text="match.query"></em>
                <span v-text="match.post"></span>
                <span v-if="!match.atTail">...</span>
              </p>
            </div>
          </div>
        </div>
        <div class="loading" v-else key="loading">
          <pulse-loader></pulse-loader>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { GetContentString, GetIndicesOf } from '../shared/deltaParser'
import Octicons from 'octicons'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

const prePostChars = 40

export default {
  components: {
    PulseLoader
  },
  computed: {
    allChapters () {
      return this.$store.state.chapters.chapters
    },
    allPlans () {
      return this.$store.state.chapters.plans
    },
    allWorkshops () {
      return this.$store.state.workshop.workshops
    },
    hasResults () {
      return (
        this.matches.chapters.length ||
        this.matches.outlines.length ||
        this.matches.plans.length ||
        this.matches.workshops.length
      )
    }
  },
  data () {
    return {
      linkSvg: Octicons.link.toSVG({
        height: 14,
        width: 14
      }),
      loading: false,
      matches: {
        chapters: [],
        outlines: [],
        plans: [],
        workshops: []
      },
      searchText: ''
    }
  },
  methods: {
    getMatchingChapters (query) {
      return this.allChapters.map(chapter => {
        const fullText = GetContentString(chapter.content)
        const indices = GetIndicesOf(query, fullText)
        chapter._matches = indices.map(index => {
          const pre = fullText.slice(
            Math.max(index - prePostChars, 0),
            index
          )
          const post = fullText.slice(
            index + query.length,
            index + query.length + prePostChars
          )

          return {
            atHead: (index - prePostChars) <= 0,
            atTail: (index + query.length + prePostChars) >= (fullText.length - 1),
            pre,
            post,
            index,
            query
          }
        })
        return chapter
      }).filter(chapter => {
        return chapter._matches.length > 0 || chapter.title.includes(query)
      })
    },
    // getMatchingSections (query) {

    // },
    goToChapter (guid) {
      this.$router.push(`/write/${guid}`)
    },
    search () {
      this.loading = true
      this.matches.chapters = this.getMatchingChapters(this.searchText)
      this.loading = false
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 100ms;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
}

.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.search {
  display: block;
  flex: 1;
  max-width: 1050px;
}

.search-input {
  font-size: 18px;
  margin-bottom: 8px;
  width: 100%;
}

.result {
  margin-top: 8px;
}

.result-title {
  display: flex;
  flex-direction: row;
  margin: 0;
}

.link-out {
  align-items: center;
  border: none;
  color: #444;
  display: flex;
  flex-direction: row;
  height: 17px;
  padding: 0;
  margin: 0 4px;
}

.match {
  line-height: 1.2em;
  margin: 2px 0;
}

.loading {
  align-items: center;
  display: flex;
  justify-content: center;
}
</style>
