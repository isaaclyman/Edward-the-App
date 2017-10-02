<template>
  <div class="composer">
    <div class="editor-wrap">
      <div class="tabs">
        <button v-for="(chapter, index) in viewingChapters" :key="chapter.title" @click="selectChapter(index)"
                class="button-tab" :class="{ 'active': isActive(index) }">
          {{ chapter.title }}
        </button>
      </div>
      <text-editor ref="textEditor" :content="activeChapter.content" :scroll-to="scrollTo" :selection="selection"
                   @update:content="updateContent($event)"
                   @update:selection="updateSelection($event)"></text-editor>
    </div>
    <div class="map-wrap">
      <text-map :editor-element="editorElement" :data-stream="activeChapter.content"
                @select="selectMap" :mark="mark"></text-map>
    </div>
    <div class="sidebar-wrap">
      <topic-list :chapter="activeChapter" :filter-topics="showTopic" :topics="allTopics"></topic-list>
    </div>
  </div>
</template>

<script>
import TextEditor from './textEditor.vue'
import TextMap from './textMap.vue'
import TopicList from '../app/topicList.vue'
import { UPDATE_CHAPTER_CONTENT } from '../app/chapters.store'
import { UPDATE_SELECTION } from './composer.store'

export default {
  components: {
    TextEditor,
    TextMap,
    TopicList
  },
  computed: {
    activeChapter () {
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
    selection () {
      return this.$store.state.composer.selection
    },
    viewingChapters () {
      return this.allChapters.filter(chapter => !chapter.archived)
    }
  },
  data () {
    return {
      activeChapterIndex: 0,
      editorElement: null,
      scrollTo: {
        paragraphIndex: -1,
        searchTermIndex: -1
      }
    }
  },
  methods: {
    isActive (index) {
      return index === this.activeChapterIndex
    },
    selectChapter (index) {
      this.activeChapterIndex = index
    },
    selectMap (descriptor) {
      this.scrollTo = descriptor
    },
    showTopic (topic) {
      return !topic.archived
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

.tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.editor-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-right: 12px;
}

.map-wrap {
  display: flex;
  height: 100%;
  width: 160px;
}

.sidebar-wrap {
  display: flex;
  height: 100%;
  margin-left: 12px;
  width: 300px;
}

/* MOBILE */
@media (max-width: 700px) {
  .map-wrap {
    display: none;
  }
}
</style>
