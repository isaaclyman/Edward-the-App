<template>
  <div class="composer-wrap">
    <div class="composer" v-if="allChapters.length > 0">
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
          <text-editor ref="textEditor" :content="activeChapter.content" :scroll-to="scrollTo" :selection="selection"
                      :container="editorContainerNode"
                      @update:content="updateContent"
                      @update:selection="updateSelection"></text-editor>
        </div>
      </div>
      <div class="map-wrap">
        <text-map :editor-element="editorElement" :data-stream="activeChapter.content"
                  @select="selectMap" :mark="mark"></text-map>
      </div>
      <div class="sidebar-wrap">
        <template v-if="allTopics.length">
          <div class="sidebar-options">
            <div class="plan-switch">
              <div class="switch-label" :class="{ 'active': !showPlans }">Chapter Outlines</div>
              <vue-switch v-model="showPlans" color="blue"></vue-switch>
              <div class="switch-label" :class="{ 'active': showPlans }">Document Plans</div>
            </div>
            <div class="archived-filter">
              <input id="showArchivedTopics" type="checkbox" v-model="showArchivedTopics">
              <label for="showArchivedTopics">Show Archived</label>
            </div>
          </div>
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
import TabsList from '../app/tabsList.vue'
import TextEditor from './textEditor.vue'
import TextMap from './textMap.vue'
import TopicList from '../app/topicList.vue'
import { UPDATE_SELECTION } from './composer.store'
import { ValidateTitle } from '../app/validate'
import VueSwitch from 'vue-switches'

export default {
  components: {
    TabsList,
    TextEditor,
    TextMap,
    TopicList,
    VueSwitch
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
    }
  },
  data () {
    return {
      activeChapterIndex: -1,
      editorContainerNode: null,
      editorElement: null,
      newChapter: '',
      scrollTo: {
        paragraphIndex: -1,
        searchTermIndex: -1
      },
      showArchivedTopics: false,
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
    showTopic (chapterTopic) {
      const masterTopic = this.getMasterTopic(chapterTopic)
      return !masterTopic.archived || this.showArchivedTopics
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

.editor-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-right: 12px;
  position: relative;
}

.below-tabs {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.stats {
  background-color: rgba(255, 255, 255, 0.85);
  bottom: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
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

.map-wrap {
  display: flex;
  height: 100%;
  width: 160px;
}

.sidebar-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  margin-left: 12px;
  width: 300px;
}

.sidebar-options {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.plan-switch {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.switch-label {
  color: #888;
  margin: 0 8px;
}

.switch-label.active {
  color: #000;
}

.archived-filter {
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-top: 8px;
}

.topic-list-wrap {
  overflow: auto;
}

/* MOBILE */
@media (max-width: 700px) {
  .map-wrap {
    display: none;
  }
}
</style>
