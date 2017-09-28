<template>
  <div class="outliner-wrap">
    <div class="outliner">
      <div class="filters">

      </div>
      <div class="chapters">
        <!-- Existing chapters -->
        <div class="chapter" v-for="chapter in viewingChapters" :key="chapter.title">
          <div class="chapter--head">
            <h3 class="chapter--title" v-if="!chapter.editing">
              {{ chapter.title }}
            </h3>
            <h3 class="chapter--title" v-if="chapter.editing">
              <input v-model.trim="chapter.title">
            </h3>
            <div v-show="!chapter.editing" class="chapter--actions">
              <!-- Move up, move down, rename, archive -->
              <button @click="renameChapter(chapter)">Rename</button>
              <button @click="archiveChapter(chapter)">Archive</button>
            </div>
          </div>
          <topic-list v-show="!chapter.editing" :chapter="chapter" :topics="viewingTopics"></topic-list>
        </div>
        <!-- New chapter -->
        <div class="chapter" v-if="newChapter">
          <div class="chapter--head">
            <div class="chapter--title">
              <input v-model="newChapter.title">
            </div>
            <div class="chapter--actions">
              <button class="button-green" :disabled="!newChapter.title" @click="addChapter">
                Save
              </button>
              <button @click="hideNewChapter">
                Cancel
              </button>
            </div>
          </div>
        </div>
        <!-- Add chapter -->
        <button v-if="!newChapter" class="chapter button-green" @click="showNewChapter">
          <span v-html="addSvg"></span>
          Add New Chapter
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_CHAPTER } from './outliner.store' // , ARCHIVE_CHAPTER, UPDATE_CHAPTER
import cloneDeep from 'lodash/cloneDeep'
import Octicons from 'octicons'
import TopicList from '../app/topicList.vue'

export default {
  components: {
    TopicList
  },
  computed: {
    viewingChapters () {
      return this.$store.state.outliner.chapters.map(chapter => ({ ...cloneDeep(chapter), editing: false }))
    },
    viewingTopics () {
      // Don't clone or transform topics here because that's TopicList's responsibility
      return this.$store.state.outliner.topics
    }
  },
  data () {
    return {
      addSvg: Octicons.plus.toSVG({
        class: 'add-icon--svg',
        height: 14,
        width: 14
      }),
      filters: {
        archived: false,
        chapter: null,
        topic: null
      },
      newChapter: null
    }
  },
  methods: {
    addChapter () {
      this.$store.commit(ADD_CHAPTER, this.newChapter)
      this.newChapter = null
    },
    hideNewChapter () {
      this.newChapter = null
    },
    renameChapter (chapter) {

    },
    showNewChapter () {
      this.newChapter = {
        archived: false,
        title: '',
        topics: []
      }
    }
  }
}
</script>

<style scoped>
.outliner-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.outliner {
  display: flex;
  flex: 1;
  max-width: 1050px;
}

.chapters {
  display: block;
}
</style>

<style>
.add-icon--svg {
  fill: #FFF;
  margin-right: 6px;
}
</style>