<template>
  <div class="composer">
    <div class="editor-wrap">
      <div class="tabs">
        <button v-for="(chapter, index) in allChapters" :key="chapter.id" v-show="isViewing(chapter)"
                class="button-tab" :class="{ 'active': isActive(index) }"
                @click="selectChapter(index)"
                @mouseover="hoverChapter(index)"
                @mouseout="unhoverChapter">
          {{ chapter.title }}
        </button>
        <button @click="showNewChapter" class="button-tab" v-show="!showAddChapter" v-html="addSvg"></button>
        <div class="button-tab add-tab" v-show="showAddChapter">
          <input class="chapter-input" v-model="newChapter" placeholder="New chapter...">
          <button class="button-green tab-internal-button" @click="addChapter">
            <span class="u-center-all" v-html="saveSvg"></span> Save
          </button>
          <button class="button-red tab-internal-button" @click="cancelAddChapter">
              <span class="u-center-all" v-html="cancelSvg"></span> Cancel
            </button>
        </div>
      </div>
      <div class="below-tabs" ref="editorContainer">
        <div class="stats" :class="{ 'active': showStats }">
          <div class="stats-content">
            <p>
              <b>{{ activeChapter.title }}</b>
            </p>
            <p>{{ wordCount }} words</p>
            <p>{{ paragraphCount }} paragraphs</p>
            <p>{{ readTimeMinutes }} minute read</p>
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
          <input id="showArchivedTopics" type="checkbox" v-model="showArchivedTopics">
          <label for="showArchivedTopics">Show Archived</label>
        </div>
        <div class="topic-list-wrap">
          <topic-list :chapter="activeChapter" :filter-topics="showTopic" :topics="allTopics"></topic-list>
        </div>
      </template>
      <template v-else>
        <div>No outline yet.</div>
        <div>
          <a @click="goToOutliner()">Start outlining</a>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { GetContentString } from '../app/deltaParser'
import guid from '../app/guid'
import Octicons from 'octicons'
import TextEditor from './textEditor.vue'
import TextMap from './textMap.vue'
import TopicList from '../app/topicList.vue'
import { ADD_CHAPTER, UPDATE_CHAPTER_CONTENT } from '../app/chapters.store'
import { UPDATE_SELECTION } from './composer.store'
import { ValidateTitle } from '../app/validate'

export default {
  components: {
    TextEditor,
    TextMap,
    TopicList
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
    mark () {
      return this.selection.text
    },
    paragraphCount () {
      return (this.textContent.match(/[\n]+/g) || []).length
    },
    readTimeMinutes () {
      return Math.ceil(this.wordCount / 275)
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
    wordCount () {
      return (this.textContent.match(/[^\s]+/g) || []).length
    }
  },
  data () {
    return {
      activeChapterIndex: -1,
      addSvg: Octicons.plus.toSVG({
        height: 14,
        width: 14
      }),
      cancelSvg: Octicons['circle-slash'].toSVG({
        height: 14,
        width: 14
      }),
      editorContainerNode: null,
      editorElement: null,
      newChapter: '',
      saveSvg: Octicons.check.toSVG({
        height: 14,
        width: 14
      }),
      scrollTo: {
        paragraphIndex: -1,
        searchTermIndex: -1
      },
      showAddChapter: false,
      showArchivedTopics: false,
      showStats: false
    }
  },
  methods: {
    addChapter () {
      if (!ValidateTitle('chapter', this.newChapter)) {
        return
      }

      const chapter = {
        archived: false,
        content: null,
        id: guid(),
        title: this.newChapter,
        topics: {}
      }

      this.$store.commit(ADD_CHAPTER, { chapter })

      this.showAddChapter = false
      this.newChapter = ''
    },
    cancelAddChapter () {
      this.showAddChapter = false
      this.newChapter = ''
    },
    getMasterTopic (chapterTopic) {
      return this.allTopics.find(topic => topic.id === chapterTopic.id)
    },
    goToOutliner () {
      this.$router.push('/outline')
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
    showNewChapter () {
      this.showAddChapter = true
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
.composer {
  display: flex;
  flex: 1;
  min-height: 300px;
}

.editor-wrap {
  display: flex;
  flex-basis: 600px;
  flex-direction: column;
  margin-right: 12px;
  position: relative;
}

.tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-height: 60px;
  min-height: 28px;
  overflow: auto;
}

.add-tab {
  background-color: #CCC;
  padding: 6px 6px;
}

.chapter-input {
  background-color: rgba(255,255,255,0.8);
  border: none;
  height: 20px;
  margin-right: 6px;
}

.tab-internal-button {
  display: flex;
  fill: #FFF;
  padding: 2px 8px;
}

.tab-internal-button:not(:first-of-type) {
  margin-left: 6px;
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
  transition: opacity 200ms;
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
  margin-bottom: 10px;
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
