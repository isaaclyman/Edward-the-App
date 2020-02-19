<template>
  <div class="wrap">
    <div class="search">
      <h2>Document Search</h2>
      <p>
        Enter a partial word, full word or phrase and Edward will find all your chapters, outlines, plans and workshops
        that match it.
      </p>
      <div class="search-box">
        <input 
          class="search-input" 
          v-model="searchText" 
          type="text" 
          placeholder="Search text"
          @keyup.enter="search()" 
          ref="searchInput"
        >
        <button 
          class="button-green" 
          @click="search()"
        >
          Search
        </button>
      </div>
      <transition 
        name="fade" 
        mode="out-in"
      >
        <div 
          class="results" 
          v-if="!loading" 
          key="results"
        >
          <template v-if="hasResults">
            <hr>
            <div class="filters">
              <div class="filter">
                <input 
                  id="show-chapters" 
                  type="checkbox" 
                  v-model="filters.showChapters"
                >
                <label for="show-chapters">Show Chapters</label>
              </div>
              <div class="filter">
                <input 
                  id="show-outlines" 
                  type="checkbox" 
                  v-model="filters.showOutlines"
                >
                <label for="show-outlines">Show Outlines</label>
              </div>
              <div class="filter">
                <input 
                  id="show-plans" 
                  type="checkbox" 
                  v-model="filters.showPlans"
                >
                <label for="show-plans">Show Plans</label>
              </div>
              <div class="filter">
                <input 
                  id="show-workshops" 
                  type="checkbox" 
                  v-model="filters.showWorkshops"
                >
                <label for="show-workshops">Show Workshops</label>
              </div>
            </div>
          </template>
          <div v-if="searched && !hasResults">
            <strong>No results found.</strong>
          </div>
          <div 
            class="result-set chapter-results" 
            v-if="matches.chapters.length && filters.showChapters"
          >
            <h3>Chapters</h3>
            <div 
              class="result" 
              v-for="chapter in matches.chapters" 
              :key="chapter.guid"
            >
              <p class="result-title">
                <strong v-text="chapter.title" />
                <router-link :to="'/write?chapter=' + chapter.guid">
                  <button 
                    class="link-out" 
                    v-html="linkSvg"
                  />
                </router-link>
              </p>
              <div 
                v-for="match in chapter._matches" 
                :key="match.index"
              >
                <match :match="match" />
              </div>
            </div>
          </div>
          <div 
            class="result-set outline-results" 
            v-if="matches.outlines.length && filters.showOutlines"
          >
            <h3>Outlines</h3>
            <div 
              class="result" 
              v-for="topicMatch in matches.outlines" 
              :key="topicMatch.chapterGuid + topicMatch.topicGuid"
            >
              <p class="result-title">
                <strong>{{ topicMatch.chapterTitle }} | {{ topicMatch.topicTitle }}</strong>
                <router-link :to="'/outline?chapter=' + topicMatch.chapterGuid">
                  <button 
                    class="link-out" 
                    v-html="linkSvg"
                  />
                </router-link>
              </p>
              <div 
                v-for="match in topicMatch._matches" 
                :key="match.index"
              >
                <match :match="match" />
              </div>
            </div>
          </div>
          <div 
            class="result-set plan-results" 
            v-if="matches.plans.length && filters.showPlans"
          >
            <h3>Plans</h3>
            <div 
              class="result" 
              v-for="sectionMatch in matches.plans" 
              :key="sectionMatch.planGuid + sectionMatch.sectionGuid"
            >
              <p class="result-title">
                <strong>{{ sectionMatch.planTitle }} | {{ sectionMatch.sectionTitle }}</strong>
                <router-link :to="'/plan?plan=' + sectionMatch.planGuid">
                  <button 
                    class="link-out" 
                    v-html="linkSvg"
                  />
                </router-link>
              </p>
              <div 
                v-for="match in sectionMatch._matches" 
                :key="match.index"
              >
                <match :match="match" />
              </div>
            </div>
          </div>
          <div 
            class="result-set workshop-results" 
            v-if="matches.workshops.length && filters.showWorkshops"
          >
            <h3>Workshops</h3>
            <div 
              class="result" 
              v-for="workshopMatch in matches.workshops" 
              :key="workshopMatch.guid"
            >
              <p class="result-title">
                <strong>{{ workshopMatch.title }}</strong>
                <router-link :to="'/write?workshopName=' + workshopMatch.workshopName + '&workshop=' + workshopMatch.guid">
                  <button 
                    class="link-out" 
                    v-html="linkSvg"
                  />
                </router-link>
              </p>
              <div 
                v-for="match in workshopMatch._matches" 
                :key="match.index"
              >
                <match :match="match" />
              </div>
            </div>
          </div>
        </div>
        <div 
          class="loading" 
          v-else 
          key="loading"
        >
          <pulse-loader />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { GetContentString, GetIndicesOf } from '../shared/deltaParser'
import Match from './match.vue'
import Octicons from 'octicons'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

const prePostChars = 40

export default {
  components: {
    Match,
    PulseLoader,
  },
  computed: {
    allChapters() {
      return this.$store.state.chapters.chapters || []
    },
    allPlans() {
      return this.$store.state.chapters.plans || []
    },
    allTopics() {
      return this.$store.state.chapters.topics || []
    },
    allWorkshops() {
      return this.$store.state.workshop.workshops || []
    },
    hasResults() {
      return (
        this.matches.chapters.length ||
        this.matches.outlines.length ||
        this.matches.plans.length ||
        this.matches.workshops.length
      )
    },
  },
  data() {
    return {
      filters: {
        showChapters: true,
        showOutlines: true,
        showPlans: true,
        showWorkshops: true,
      },
      linkSvg: Octicons.link.toSVG({
        height: 14,
        width: 14,
      }),
      loading: false,
      matches: {
        chapters: [],
        outlines: [],
        plans: [],
        workshops: [],
      },
      searched: false,
      searchText: '',
    }
  },
  methods: {
    getMasterTopic(chapterTopic) {
      return this.allTopics.find(topic => topic.guid === chapterTopic.guid)
    },
    getMatchArray(fullText, indices, query) {
      return indices.map((index) => {
        const pre = fullText.slice(
          Math.max(index - prePostChars, 0),
          index,
        )
        const matched = fullText.slice(
          index,
          index + query.length,
        )
        const post = fullText.slice(
          index + query.length,
          index + query.length + prePostChars,
        )

        return {
          atHead: (index - prePostChars) <= 0,
          atTail: (index + query.length + prePostChars) >= (fullText.length - 1),
          pre,
          post,
          index,
          query: matched,
        }
      })
    },
    getMatchingChapters(query) {
      return this.allChapters.map((chapter) => {
        const fullText = GetContentString(chapter.content)
        const indices = GetIndicesOf(query, fullText)
        chapter._matches = this.getMatchArray(fullText, indices, query)
        return chapter
      }).filter(chapter => chapter._matches.length > 0 || chapter.title.toLowerCase().includes(query))
    },
    getMatchingOutlines(query) {
      return this.allChapters.reduce((arr, chapter) => {
        for (const key in chapter.topics) {
          if (!chapter.topics.prototype.hasOwnProperty(key)) {
            continue
          }

          const chapterTopic = chapter.topics[key]
          const fullText = GetContentString(chapterTopic.content)
          const indices = GetIndicesOf(query, fullText)
          const masterTopic = this.getMasterTopic(chapterTopic)

          arr.push({
            _matches: this.getMatchArray(fullText, indices, query),
            chapterGuid: chapter.guid,
            chapterTitle: chapter.title,
            topicGuid: chapterTopic.guid,
            topicTitle: masterTopic.title,
          })
        }
        return arr
      }, []).filter(topicMatch => topicMatch._matches.length > 0 || topicMatch.topicTitle.toLowerCase().includes(query))
    },
    getMatchingPlans(query) {
      return this.allPlans.reduce((arr, plan) => arr.concat(plan.sections.map((section) => {
        const fullText = GetContentString(section.content)
        const indices = GetIndicesOf(query, fullText)

        return {
          _matches: this.getMatchArray(fullText, indices, query),
          planGuid: plan.guid,
          planTitle: plan.title,
          sectionGuid: section.guid,
          sectionTitle: section.title,
        }
      })), []).filter(sectionMatch => sectionMatch._matches.length > 0 || sectionMatch.sectionTitle.toLowerCase().includes(query))
    },
    getMatchingWorkshops(query) {
      const workshopsByGuid = this.allWorkshops.reduce((obj, workshop) => {
        obj[workshop.guid] = obj[workshop.guid] || {
          guid: workshop.guid,
          title: workshop.title,
          workshopName: workshop.workshopName,
          _matches: [],
        }
        const workshopMatch = obj[workshop.guid]

        const fullText = GetContentString(workshop.content)
        const indices = GetIndicesOf(query, fullText)

        workshopMatch._matches = workshopMatch._matches.concat(this.getMatchArray(fullText, indices, query))
        return obj
      }, {})

      return Object.keys(workshopsByGuid).map(key => workshopsByGuid[key]).filter(workshopMatch => workshopMatch._matches.length > 0 || workshopMatch.title.toLowerCase().includes(query))
    },
    search() {
      this.loading = true
      this.searched = false
      this.matches.chapters = this.getMatchingChapters(this.searchText.toLowerCase())
      this.matches.outlines = this.getMatchingOutlines(this.searchText.toLowerCase())
      this.matches.plans = this.getMatchingPlans(this.searchText.toLowerCase())
      this.matches.workshops = this.getMatchingWorkshops(this.searchText.toLowerCase())
      this.searched = true
      this.loading = false
    },
  },
  mounted() {
    this.$refs.searchInput.focus()
  },
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

.result-set {
  margin: 20px 0;
}

.result-set h3 {
  border-left: 2px solid rgb(1,171,109);
  padding-left: 8px;
}

.result {
  margin-top: 8px;
}

.filters {
  display: flex;
  flex-direction: row;
  margin: 10px 0;
}

.filter:not(:last-of-type) {
  margin-right: 20px;
}

.result-title {
  display: flex;
  flex-direction: row;
  font-size: 16px;
  margin: 0;
}

.link-out {
  align-items: center;
  border: none;
  color: #444;
  display: flex;
  flex-direction: row;
  height: 20px;
  padding: 0;
  margin: 0 4px;
}

.loading {
  align-items: center;
  display: flex;
  justify-content: center;
}
</style>
