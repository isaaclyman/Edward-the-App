<template>
  <div class="outliner-wrap">
    <div class="outliner">
      <div class="archive-filter">
        <input id="showArchivedCheckbox" type="checkbox" v-model="filters.archived" />
        <label for="showArchivedCheckbox">Show Deleted</label>
      </div>
      <div class="chapter-chips">
        <chips-list :data-array="allChapters" :filter-chips="showChip" name="Chapter" name-prop="title"
                    @add="addChapter"
                    @delete="deleteChapter"></chips-list>
      </div>
      <div class="topic-chips">
        <chips-list :data-array="allTopics" :filter-chips="showChip" name="Topic" name-prop="title"
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
import { ADD_CHAPTER, ADD_TOPIC, ARCHIVE_CHAPTER, ARCHIVE_TOPIC } from './outliner.store'
import ChipsList from './chipsList.vue'
import Octicons from 'octicons'
import TopicList from '../app/topicList.vue'

export default {
  components: {
    ChipsList,
    TopicList
  },
  computed: {
    allChapters () {
      return this.$store.state.outliner.chapters
    },
    allTopics () {
      return this.$store.state.outliner.topics
    },
    viewingChapters () {
      return (this.allChapters
        .filter(chapter => !chapter.archived || this.filters.archived))
    },
    viewingTopics () {
      // Don't clone or transform topics here (but do filter) because that's TopicList's responsibility
      return this.allTopics
        .filter(topic => !topic.archived || this.filters.archived)
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
    addChapter (title) {
      this.$store.commit(ADD_CHAPTER, {
        archived: false,
        title,
        topics: []
      })
    },
    addTopic (title) {
      this.$store.commit(ADD_TOPIC, {
        archived: false,
        content: null,
        title
      })
    },
    deleteChapter ({ index }) {
      this.$store.commit(ARCHIVE_CHAPTER, this.allChapters[index])
    },
    deleteTopic ({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, this.allTopics[index])
    },
    showChip (chip) {
      return !chip.archived || this.filters.archived
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