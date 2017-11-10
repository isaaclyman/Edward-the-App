<template>
  <div class="composer-wrap">
    <div class="composer" v-if="hasChapters">
      <div class="map-wrap">
        <text-map :editor-element="editorElement" :data-stream="activeChapter.content"
                  @select="selectMap" :mark="mark"></text-map>
      </div>
      <div class="editor-wrap">
        <tabs-list :active-index="activeChapterIndex" :data-array="allChapters" :filter-tabs="isViewing"
                  item-name="Chapter"
                  @add="addChapter"
                  @hover="hoverChapter"
                  @unhover="unhoverChapter"
                  @update:activeIndex="selectChapter"></tabs-list>
        <div class="below-tabs" ref="editorContainer">
          <div class="stats" :class="{ 'active': showStats }">
            <div class="stats-content">
              <p>
                <b>{{ activeChapter.title }}</b>
              </p>
              <p>{{ chapterWordCount }} words</p>
              <p>{{ chapterParagraphCount }} paragraphs</p>
              <p>{{ chapterPageCount }} pages</p>
              <p>{{ chapterReadTimeMinutes }} minute read</p>
              <br>
              <p>
                <b>{{ documentTitle }} (Full document)</b>
              </p>
              <p>{{ documentWordCount }} words</p>
              <p>{{ documentPageCount }} pages</p>
              <p>{{ documentReadTimeMinutes }} minute read</p>
            </div>
          </div>
          <div class="define">
            <word-define :word="mark"></word-define>
          </div>
          <text-editor ref="textEditor" :content="activeChapter.content" :scroll-to="scrollTo" :selection="selection"
                      :container="editorContainerNode"
                      @update:content="updateContent"
                      @update:selection="updateSelection"></text-editor>
        </div>
      </div>
      <div class="sidebar-wrap">
        <div class="sidebar-options">
          <div class="plan-switch">
            <button class="switch-label" :class="{ 'active': !showPlans }" @click="showPlans = false">
              <div class="switch-label-text">Chapter Outline</div>
              <div v-html="outlineSvg"></div>
            </button>
            <hr class="vert">
            <button class="switch-label" :class="{ 'active': showPlans }" @click="showPlans = true">
              <div v-html="planSvg"></div>
              <div class="switch-label-text">Document Plans</div>
            </button>
          </div>
          <div class="archived-filter">
            <input id="showArchivedTopics" type="checkbox" v-model="filters.archived">
            <label for="showArchivedTopics">Show Archived</label>
          </div>
        </div>
        <!-- Document Plans -->
        <div class="sidebar-content" v-show="showPlans">
          <template v-if="hasPlans">
            <plans-list :filter-plans="showPlan" :filter-sections="showSection"></plans-list>
          </template>
          <template v-else>
            <div>No plans yet.</div>
            <div>
              <router-link to="/plan">Start planning</router-link>
            </div>
          </template>
        </div>
        <!-- Chapter Outlines -->
        <div class="sidebar-content" v-show="!showPlans">
          <template v-if="hasTopics">
            <div class="topic-list-wrap">
              <topic-list :chapter="activeChapter" :filter-topics="showTopic" :topics="allTopics"></topic-list>
            </div>
          </template>
          <template v-else>
            <div>No outline yet.</div>
            <div>
              <router-link to="/outline">Start outlining</router-link>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else>
      <div>No chapters yet.</div>
      <div>
        <router-link to="/outline">Create one</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_CHAPTER, UPDATE_CHAPTER_CONTENT } from '../app/chapters.store'
import { GetContentString } from '../app/deltaParser'
import guid from '../app/guid'
import Octicons from 'octicons'
import PlansList from '../app/plansList.vue'
import TabsList from '../app/tabsList.vue'
import TextEditor from './textEditor.vue'
import TextMap from './textMap.vue'
import TopicList from '../app/topicList.vue'
import { UPDATE_SELECTION } from './composer.store'
import { ValidateTitle } from '../app/validate'
import VueSwitch from 'vue-switches'
import WordDefine from './wordDefine.vue'

export default {
  components: {
    PlansList,
    TabsList,
    TextEditor,
    TextMap,
    TopicList,
    VueSwitch,
    WordDefine
  },
  computed: {
    activeChapter () {
      if (this.activeChapterIndex === -1) {
        this.activeChapterIndex = this.allChapters.indexOf(this.viewingChapters[0])
      }

      return this.allChapters[this.activeChapterIndex]
    },
    allChapters () {
      return this.$store.state.chapters.chapters
    },
    allPlans () {
      return this.$store.state.chapters.plans || []
    },
    allTopics () {
      return this.$store.state.chapters.topics
    },
    chapterPageCount () {
      return this.getPageCount(this.textContent)
    },
    chapterParagraphCount () {
      return this.getParagraphCount(this.textContent)
    },
    chapterReadTimeMinutes () {
      return this.getReadTimeMinutes(this.textContent)
    },
    chapterWordCount () {
      return this.getWordCount(this.textContent)
    },
    documentFullText () {
      return this.$store.state.chapters.chapters
        .map(chapter => chapter.content)
        .map(content => GetContentString(content))
        .join(' ')
    },
    documentPageCount () {
      return this.getPageCount(this.documentFullText)
    },
    documentReadTimeMinutes () {
      return this.getReadTimeMinutes(this.documentFullText)
    },
    documentTitle () {
      return this.$store.state.file.currentFile.name
    },
    documentWordCount () {
      return this.getWordCount(this.documentFullText)
    },
    hasChapters () {
      return this.allChapters && this.allChapters.length
    },
    hasPlans () {
      return this.allPlans && this.allPlans.length
    },
    hasTopics () {
      return this.allTopics && this.allTopics.length
    },
    mark () {
      return this.selection.text
    },
    selection () {
      return this.$store.state.composer.selection
    },
    textContent () {
      return GetContentString(this.activeChapter.content)
    },
    viewingChapters () {
      return this.allChapters.filter(chapter => !chapter.archived)
    },
    viewingPlans () {
      return (this.allPlans
        .filter(plan => !plan.archived || this.filters.archived))
    }
  },
  data () {
    return {
      activeChapterIndex: -1,
      editorContainerNode: null,
      editorElement: null,
      filters: {
        archived: false
      },
      newChapter: '',
      outlineSvg: Octicons['list-unordered'].toSVG({
        height: 25,
        width: 25
      }),
      planSvg: Octicons.telescope.toSVG({
        height: 25,
        width: 25
      }),
      scrollTo: {
        paragraphIndex: -1,
        searchTermIndex: -1
      },
      showPlans: false,
      showStats: false
    }
  },
  methods: {
    addChapter (title) {
      if (!ValidateTitle('chapter', title)) {
        return
      }

      const chapter = {
        archived: false,
        content: null,
        id: guid(),
        title,
        topics: {}
      }

      this.$store.commit(ADD_CHAPTER, { chapter })
    },
    getMasterTopic (chapterTopic) {
      return this.allTopics.find(topic => topic.id === chapterTopic.id)
    },
    getReadTimeMinutes (str) {
      return Math.ceil(this.getWordCount(str) / 275)
    },
    getPageCount (str) {
      return Math.ceil(this.getWordCount(str) / 300)
    },
    getParagraphCount (str) {
      return (str.match(/[\n]+/g) || []).length
    },
    getWordCount (str) {
      return (str.match(/[^\s]+/g) || []).length
    },
    hoverChapter (index) {
      this.showStats = true
    },
    isActive (index) {
      return index === this.activeChapterIndex
    },
    isViewing (chapter) {
      return !chapter.archived
    },
    selectChapter (index) {
      this.activeChapterIndex = index
    },
    selectMap (descriptor) {
      this.scrollTo = descriptor
    },
    showPlan (plan) {
      return this.viewingPlans.includes(plan)
    },
    showSection (section) {
      return !section.archived || this.filters.archived
    },
    showTopic (chapterTopic) {
      const masterTopic = this.getMasterTopic(chapterTopic)
      return !masterTopic.archived || this.filters.archived
    },
    unhoverChapter () {
      this.showStats = false
    },
    updateContent (newContent) {
      this.$store.commit(UPDATE_CHAPTER_CONTENT, {
        chapter: this.allChapters[this.activeChapterIndex],
        newContent
      })
    },
    updateSelection (selection) {
      this.$store.commit(UPDATE_SELECTION, selection)
    }
  },
  mounted () {
    this.editorContainerNode = this.$refs.editorContainer
    this.editorElement = this.$refs.textEditor
  }
}
</script>

<style scoped>
.composer-wrap {
  display: flex;
  justify-content: center;
  min-height: 300px;
  width: 100%;
}

.composer {
  display: flex;
  flex: 1;
  max-width: 1500px;
}

.map-wrap {
  display: flex;
  height: 100%;
  margin-right: 20px;
  width: 160px;
  z-index: 25;
}

.editor-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-right: 20px;
  position: relative;
}

.below-tabs {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.stats {
  background-color: rgba(255, 255, 255, 0.9);
  bottom: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: opacity 100ms;
  width: 100%;
  z-index: 15;
}

.stats.active {
  opacity: 1;
}

.stats-content {
  height: 100%;
  padding: 12px;
  width: 100%;
}

.define {
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 15;

}

.sidebar-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  width: 300px;
}

.sidebar-content {
  overflow: auto;
}

.sidebar-options {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  min-height: 45px;
}

.plan-switch {
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 35px;
  margin-bottom: 6px;
}

.switch-label {
  align-items: center;
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  fill: #888;
  flex-direction: row;
  font-size: 16px;
  margin: 0 4px;
  transition: color 100ms, fill 100ms;
}

.switch-label:hover {
  color: #000;
  fill: #000;
}

.switch-label.active {
  color: #000;
  fill: #000;
}

.switch-label-text {
  margin: 0 12px;
}

.archived-filter {
  align-items: center;
  align-self: flex-start;
  display: flex;
  flex-direction: row;
  margin-top: 8px;
}

.topic-list-wrap {
  overflow: auto;
}

/* MOBILE */
@media (max-width: 800px) {
  .map-wrap {
    display: none;
  }
}
</style>
