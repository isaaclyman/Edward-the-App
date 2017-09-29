<template>
  <div class="outliner-wrap">
    <div class="outliner">
      <div class="chapter-chips">
        <chips-list :data-array="allChapterTitles" name="Chapter"
                    @add="addChapter"
                    @delete="deleteChapter"></chips-list>
      </div>
      <div class="topic-chips">
        <chips-list :data-array="allTopicTitles" name="Topic"
                    @add="addTopic"
                    @delete="deleteTopic"></chips-list>
      </div>
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
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_CHAPTER, ADD_TOPIC } from './outliner.store' // , ARCHIVE_CHAPTER, UPDATE_CHAPTER
import ChipsList from './chipsList.vue'
import cloneDeep from 'lodash/cloneDeep'
import Octicons from 'octicons'
import TopicList from '../app/topicList.vue'

export default {
  components: {
    ChipsList,
    TopicList
  },
  computed: {
    allChapterTitles () {
      return this.$store.state.outliner.chapters.map(chapter => chapter.title)
    },
    allTopicTitles () {
      return this.$store.state.outliner.topics.map(topic => topic.title)
    },
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
      }
    }
  },
  methods: {
    addChapter (chapter) {
      this.$store.commit(ADD_CHAPTER, chapter)
    },
    addTopic (topic) {
      this.$store.commit(ADD_TOPIC, topic)
    },
    deleteChapter (chapter) {

    },
    deleteTopic (topic) {

    },
    renameChapter (chapter) {

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
  display: block;
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