<template>
  <div class="outliner-wrap">
    <div class="outliner">
      <div class="header">
        <h1 class="header-title">
          Outline
        </h1>
        <div>
          <input 
            id="showArchivedCheckbox" 
            type="checkbox" 
            v-model="filters.archived"
          >
          <label for="showArchivedCheckbox">Show Archived</label>
        </div>
      </div>
      <!-- Chapter Chips -->
      <div class="chips-wrap chapter-chips">
        <h3>Add/rearrange chapters</h3>
        <chips-list 
          name="Chapter" 
          name-prop="title"
          :data-array="allChapters"
          :filter-chips="showChapter"
          :is-deletable="isDeletable"
          @add="addChapter"
          @delete="archiveChapter"
          @rearrange="rearrangeChapter"
          @restore="restoreChapter"
          @update="renameChapter"
        />
      </div>
      <!-- Topic Chips -->
      <div class="chips-wrap topic-chips">
        <h3>Add a topic to all chapters</h3>
        <chips-list 
          name="Topic" 
          name-prop="title"
          :data-array="allTopics"
          :filter-chips="showTopic"
          :is-deletable="isDeletable"
          @add="addTopic"
          @delete="archiveTopic"
          @rearrange="rearrangeTopic"
          @restore="restoreTopic"
          @update="renameTopic"
        />
      </div>
      <hr class="divider">
      <div 
        class="chapters" 
        v-if="viewingChapters.length > 0"
      >
        <!-- Chapters > Topics -->
        <tabs-list 
          :active-index="activeChapterIndex" 
          :data-array="allChapters" 
          :filter-tabs="showChapter"
          item-name="Chapter"
          @add="addChapter"
          @update:activeIndex="selectChapter"
        />
        <div 
          class="chapter" 
          v-if="activeChapter"
        >
          <div class="chapter-head">
            <h2 class="chapter-title">
              {{ activeChapter.title }}
            </h2>
            <div class="chapter-actions">
              <button 
                class="chapter-action button-icon" 
                v-show="!activeChapter.archived" 
                @click="archiveChapter({ index: activeChapterIndex })"
                title="Archive"
                v-tooltip
              >
                <span class="fas fa-archive" />
              </button>
              <button 
                class="chapter-action button-icon" 
                v-show="activeChapter.archived" 
                @click="restoreChapter({ index: activeChapterIndex })"
                title="Un-archive"
                v-tooltip
              >
                <span class="fas fa-box-open" />  
              </button>
              <button 
                class="chapter-action chapter-action-danger button-icon" 
                v-show="activeChapter.archived" 
                @click="deleteChapter({ index: activeChapterIndex })"
                title="Delete Forever"
                v-tooltip
              >
                <span class="fas fa-trash" />
              </button>
            </div>
          </div>
          <topic-list 
            :chapter="activeChapter" 
            :filter-topics="showTopic" 
            :topics="allTopics"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ADD_CHAPTER, ADD_TOPIC, ARCHIVE_CHAPTER, ARCHIVE_TOPIC,
  DELETE_CHAPTER, REARRANGE_CHAPTERS, REARRANGE_TOPICS,
  RESTORE_CHAPTER, RESTORE_TOPIC, UPDATE_CHAPTER, UPDATE_TOPIC,
} from '../shared/chapters.store'
import ChipsList from '../shared/chipsList.vue'
import { GetContentString } from '../shared/deltaParser'
import guid from '../shared/guid'
import swal from 'sweetalert'
import TabsList from '../shared/tabsList.vue'
import TopicList from '../shared/topicList.vue'
import { ValidateTitle } from '../shared/validate'
import tooltip from '../shared/tooltip.directive'

export default {
  components: {
    ChipsList,
    TabsList,
    TopicList,
  },
  computed: {
    activeChapter() {
      if (this.activeChapterIndex === -1) {
        return null
      }

      return this.allChapters[this.activeChapterIndex]
    },
    allChapters() {
      return this.$store.state.chapters.chapters || []
    },
    allTopics() {
      return this.$store.state.chapters.topics || []
    },
    viewingChapters() {
      return (this.allChapters
        .filter(chapter => !chapter.archived || this.filters.archived))
        .filter(chapter => !this.filters.chapter ||
                chapter.title.toLowerCase().includes(this.filters.chapter.toLowerCase()))
    },
    viewingTopicsFilteredArchived() {
      return (this.allTopics.filter(topic => !topic.archived || this.filters.archived))
    },
    viewingTopicsFilteredTitle() {
      return this.allTopics.filter((topic) => {
        if (!this.filters.topic) {
          return true
        }

        const filter = this.filters.topic.toLowerCase()
        const title = topic.title.toLowerCase()

        return title.includes(filter)
      })
    },
  },
  data() {
    return {
      activeChapterIndex: -1,
      filters: {
        archived: false,
        chapter: '',
        topic: '',
      },
      filtersVisible: false,
      helpChapterBlocksNode: null,
      helpChapterChipsNode: null,
      helpTopicChipsNode: null,
    }
  },
  directives: {
    tooltip
  },
  methods: {
    addChapter(title) {
      if (!ValidateTitle('chapter', title)) {
        return
      }

      const chapter = {
        archived: false,
        content: null,
        guid: guid(),
        title,
        topics: {},
      }

      this.$store.commit(ADD_CHAPTER, { chapter })
    },
    addTopic(title) {
      if (!ValidateTitle('topic', title)) {
        return
      }

      const topic = {
        archived: false,
        guid: guid(),
        title,
      }

      this.$store.commit(ADD_TOPIC, { topic })
    },
    archiveChapter({ index }) {
      this.$store.commit(ARCHIVE_CHAPTER, { chapter: this.allChapters[index] })

      if (index === this.activeChapterIndex && !this.filters.archived) {
        this.selectChapter(-1)
      }
    },
    archiveTopic({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, { topic: this.allTopics[index] })
    },
    deleteChapter({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this chapter? Its outline and all of its written content (from the Write page)
               will be lost. This cannot be undone.`,
        title: 'Delete Forever?',
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_CHAPTER, { chapter: this.allChapters[index] })

        if (index === this.activeChapterIndex) {
          this.selectChapter(-1)
        }
      })
    },
    getMasterTopic(chapterTopic) {
      return this.allTopics.find(topic => topic.guid === chapterTopic.guid)
    },
    helpClick(content, title) {
      swal({
        content,
        title,
      })
    },
    isDeletable(chip) {
      return !chip.archived
    },
    rearrangeChapter(chapters) {
      this.$store.commit(REARRANGE_CHAPTERS, { chapters })
    },
    rearrangeTopic(topics) {
      this.$store.commit(REARRANGE_TOPICS, { topics })
    },
    renameChapter({ index, value: newTitle }) {
      if (!ValidateTitle('chapter', newTitle)) {
        return
      }

      this.$store.commit(UPDATE_CHAPTER, {
        chapter: this.allChapters[index],
        newTitle,
      })
    },
    renameTopic({ index, value: newTitle }) {
      if (!ValidateTitle('topic', newTitle)) {
        return
      }

      const topic = this.allTopics[index]

      this.$store.commit(UPDATE_TOPIC, {
        topic,
        newTitle,
      })
    },
    restoreChapter({ index }) {
      this.$store.commit(RESTORE_CHAPTER, { chapter: this.allChapters[index] })
    },
    restoreTopic({ index }) {
      this.$store.commit(RESTORE_TOPIC, { topic: this.allTopics[index] })
    },
    selectChapter(index) {
      // If no active chapter has been set, default to the first one
      if (index === -1) {
        index = 0
      }

      // If viewing an archived chapter but "show archived" is false
      if (this.allChapters[index].archived && !this.filters.archived) {
        index = this.allChapters.indexOf(this.viewingChapters[0])
      }

      this.activeChapterIndex = index
    },
    showChapter(chapter) {
      return this.viewingChapters.includes(chapter)
    },
    showTopic(topic) {
      const masterTopic = this.getMasterTopic(topic)
      const textContent = GetContentString(topic.content)

      return (this.viewingTopicsFilteredArchived.includes(masterTopic) &&
        (this.viewingTopicsFilteredTitle.includes(masterTopic) ||
        textContent && textContent.includes(this.filters.topic)))
    },
    toggleFilters() {
      this.filtersVisible = !this.filtersVisible
    },
  },
  mounted() {
    this.helpChapterBlocksNode = this.$refs.helpChapterBlocksModal
    this.helpChapterChipsNode = this.$refs.helpChapterChipsModal
    this.helpTopicChipsNode = this.$refs.helpTopicChipsModal

    const chapterGuid = this.$route.query.chapter
    if (chapterGuid) {
      const activeChapter = this.allChapters.find(chapter => chapter.guid === chapterGuid)
      if (activeChapter.archived) {
        this.filters.archived = true
      }

      this.selectChapter(this.allChapters.indexOf(activeChapter))
    } else {
      this.selectChapter(-1)
    }

    this.$router.replace('/outline')
  },
}
</script>

<style scoped>
h1 {
  margin-bottom: 16px;
}

.outliner-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.outliner {
  background-color: #F2F9F8;
  display: block;
  height: min-content;
  margin-bottom: 32px;
  max-width: 1050px;
  padding: 32px;
  width: 100%;
}

.header {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.header-title {
  flex: 1;
}

.filters {
  margin: 16px 0;
}

.chips-wrap {
  margin-bottom: 24px;
}

.chapters {
  display: block;
}

.chapter {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  margin-bottom: 10px;
}

.chapter-head {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.chapter-title {
  margin-right: 8px;
}

.chapter-action {
  background-color: transparent;
  color: #323232;
  margin-left: 16px;
  transition: background-color 100ms;
}

.chapter-action:hover {
  background-color: #FFF;
  color: #000;
}

.chapter-action-danger {
  color: #e53935;
}
</style>

<style>
.add-icon--svg {
  fill: #FFF;
  margin-right: 6px;
}

.filter-toggle svg {
  transform-origin: center;
  transition: transform 100ms;
}

.filter-toggle.expanded svg {
  transform: rotate(180deg);
}
</style>
