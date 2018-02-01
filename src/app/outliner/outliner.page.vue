<template>
  <div class="outliner-wrap">
    <div class="outliner">
      <!-- Filters -->
      <div class="filters">
        <input id="showArchivedCheckbox" type="checkbox" v-model="filters.archived" />
        <label for="showArchivedCheckbox">Show Archived</label>
      </div>
      <hr>
      <!-- Chapter Chips -->
      <div class="chips-wrap">
        <div class="section-title">
          <h3>Chapters</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpChapterChipsNode, 'Chapter List')"></button>
        </div>
        <chips-list name="Chapter" name-prop="title"
                    :data-array="allChapters"
                    :filter-chips="showChapter"
                    :is-deletable="isDeletable"
                    @add="addChapter"
                    @delete="archiveChapter"
                    @rearrange="rearrangeChapter"
                    @restore="restoreChapter"
                    @update="renameChapter"></chips-list>
      </div>
      <!-- Topic Chips -->
      <div class="chips-wrap">
        <div class="section-title">
          <h3>Topics</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpTopicChipsNode, 'Topic List')"></button>
        </div>
        <chips-list name="Topic" name-prop="title"
                    :data-array="allTopics"
                    :filter-chips="showTopic"
                    :is-deletable="isDeletable"
                    @add="addTopic"
                    @delete="archiveTopic"
                    @rearrange="rearrangeTopic"
                    @restore="restoreTopic"
                    @update="renameTopic"></chips-list>
      </div>
      <hr>
      <div class="chapters">
        <div class="section-title">
          <h3>Outline</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpChapterBlocksNode, 'Outline')"></button>
        </div>
        <!-- Chapters > Topics -->
        <tabs-list :active-index="activeChapterIndex" :data-array="allChapters" :filter-tabs="showChapter"
                  item-name="Chapter"
                  @add="addChapter"
                  @update:activeIndex="selectChapter"></tabs-list>
        <div class="chapter">
          <div class="chapter-head" :class="{ 'light': activeChapter.archived }">
            <h4 class="chapter-title">
              {{ activeChapter.title }}
            </h4>
            <div class="chapter-actions">
              <button class="chapter-action" v-show="!activeChapter.archived" @click="archiveChapter({ index: activeChapterIndex })">Archive</button>
              <button class="chapter-action" v-show="activeChapter.archived" @click="restoreChapter({ index: activeChapterIndex })">Restore</button>
              <button class="chapter-action button-red" v-show="activeChapter.archived" @click="deleteChapter({ index: activeChapterIndex })">Delete Forever</button>
            </div>
          </div>
          <div class="chapter-content">
            <topic-list :chapter="activeChapter" :filter-topics="showTopic" :topics="allTopics"></topic-list>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapters: [?] Modal -->
    <div style="display: none">
      <div class="help" ref="helpChapterChipsModal">
        <p>This is the chapter list. It's the easiest place to add, archive, restore, rename, and rearrange chapters.</p>
        <p>To add a chapter, type its name into the "New Chapter" box and click "Add".</p>
        <p>
          To archive a chapter, click the "X" next to its name in the list.
          Archiving a chapter removes it from your document without deleting it permanently.
        </p>
        <p>To restore an archived chapter, check the "Show Archived" box, then click the "+" next to its name in the list.</p>
        <p>To rename a chapter, click the pencil icon next to its name in the list.</p>
        <p>To rearrange a chapter, click and drag it to where you want it to go.</p>
      </div>
    </div>

    <!-- Topics: [?] Modal -->
    <div style="display: none">
      <div class="help" ref="helpTopicChipsModal">
        <p>This is the topic list. It's the easiest place to add, archive, restore, rename, and rearrange topics.</p>
        <p>To add a topic, type its name into the "New Topic" box and click "Add". It will show up in every chapter in the "Outline" section.</p>
        <p>
          To archive a topic, click the "X" next to its name in the list.
          Archiving a topic removes it from all chapters without deleting it permanently.
        </p>
        <p>To restore an archived topic, check the "Show Archived" box, then click the "+" next to its name in the list.</p>
        <p>To rename a topic, click the pencil icon next to its name in the list.</p>
        <p>To rearrange a topic, click and drag it to where you want it to go.</p>
      </div>
    </div>

    <!-- Chapter blocks: [?] Modal -->
    <div style="display: none">
      <div class="help" ref="helpChapterBlocksModal">
        <p>This is where the real work happens. Each of your chapters has a block below, with a section for each topic.</p>
        <p>
          A "topic" can be a character arc, a list of subpoints, citations you've found in your research, or really anything
          that you want to keep handy while you write. Everything you outline here will be visible on the Write page, next to
          the main editor.
        </p>
        <p>
          You can update these topics any time you want.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_CHAPTER, ADD_TOPIC, ARCHIVE_CHAPTER, ARCHIVE_TOPIC,
         DELETE_CHAPTER, REARRANGE_CHAPTERS, REARRANGE_TOPICS,
         RESTORE_CHAPTER, RESTORE_TOPIC, UPDATE_CHAPTER, UPDATE_TOPIC } from '../shared/chapters.store'
import ChipsList from '../shared/chipsList.vue'
import { GetContentString } from '../shared/deltaParser'
import guid from '../shared/guid'
import Octicons from 'octicons'
import swal from 'sweetalert'
import TabsList from '../shared/tabsList.vue'
import TopicList from '../shared/topicList.vue'
import { ValidateTitle } from '../shared/validate'

export default {
  components: {
    ChipsList,
    TabsList,
    TopicList
  },
  computed: {
    activeChapter () {
      if (this.activeChapterIndex < 0) {
        this.activeChapterIndex = this.allChapters.indexOf(this.viewingChapters[0])
      }

      return this.allChapters[this.activeChapterIndex] || {}
    },
    allChapters () {
      return this.$store.state.chapters.chapters || []
    },
    allTopics () {
      return this.$store.state.chapters.topics || []
    },
    viewingChapters () {
      return (this.allChapters
        .filter(chapter => !chapter.archived || this.filters.archived))
        .filter(chapter => !this.filters.chapter ||
                chapter.title.toLowerCase().includes(this.filters.chapter.toLowerCase()))
    },
    viewingTopicsFilteredArchived () {
      return (this.allTopics.filter(topic => !topic.archived || this.filters.archived))
    },
    viewingTopicsFilteredTitle () {
      return this.allTopics.filter(topic => {
        if (!this.filters.topic) {
          return true
        }

        const filter = this.filters.topic.toLowerCase()
        const title = topic.title.toLowerCase()

        return title.includes(filter)
      })
    }
  },
  data () {
    return {
      activeChapterIndex: -1,
      addSvg: Octicons.plus.toSVG({
        class: 'add-icon--svg',
        height: 14,
        width: 14
      }),
      expandSvg: Octicons['chevron-down'].toSVG({
        height: 18,
        width: 18
      }),
      filters: {
        archived: false,
        chapter: '',
        topic: ''
      },
      filtersVisible: false,
      helpChapterBlocksNode: null,
      helpChapterChipsNode: null,
      helpIconSvg: Octicons.question.toSVG({
        class: 'help-icon--svg',
        height: 16,
        width: 16
      }),
      helpTopicChipsNode: null
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
    addTopic (title) {
      if (!ValidateTitle('topic', title)) {
        return
      }

      const topic = {
        archived: false,
        id: guid(),
        title
      }

      this.$store.commit(ADD_TOPIC, { topic })
    },
    archiveChapter ({ index }) {
      this.$store.commit(ARCHIVE_CHAPTER, { chapter: this.allChapters[index] })

      if (index === this.activeChapterIndex) {
        this.activeChapterIndex = -1
      }
    },
    archiveTopic ({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, { topic: this.allTopics[index] })
    },
    deleteChapter ({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this chapter? Its outline and all of its written content (from the Write page)
               will be lost. This cannot be undone.`,
        title: 'Delete Forever?'
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_CHAPTER, { chapter: this.allChapters[index] })
      })
    },
    getMasterTopic (chapterTopic) {
      return this.allTopics.find(topic => topic.id === chapterTopic.id)
    },
    helpClick (content, title) {
      swal({
        content,
        title
      })
    },
    isDeletable (chip) {
      return !chip.archived
    },
    rearrangeChapter (chapters) {
      this.$store.commit(REARRANGE_CHAPTERS, { chapters })
    },
    rearrangeTopic (topics) {
      this.$store.commit(REARRANGE_TOPICS, { topics })
    },
    renameChapter ({ index, value: newTitle }) {
      if (!ValidateTitle('chapter', newTitle)) {
        return
      }

      this.$store.commit(UPDATE_CHAPTER, {
        chapter: this.allChapters[index],
        newTitle
      })
    },
    renameTopic ({ index, value: newTitle }) {
      if (!ValidateTitle('topic', newTitle)) {
        return
      }

      const topic = this.allTopics[index]

      this.$store.commit(UPDATE_TOPIC, {
        topic,
        newTitle
      })
    },
    restoreChapter ({ index }) {
      this.$store.commit(RESTORE_CHAPTER, { chapter: this.allChapters[index] })
    },
    restoreTopic ({ index }) {
      this.$store.commit(RESTORE_TOPIC, { topic: this.allTopics[index] })
    },
    selectChapter (index) {
      this.activeChapterIndex = index
    },
    showChapter (chapter) {
      return this.viewingChapters.includes(chapter)
    },
    showTopic (topic) {
      const masterTopic = this.getMasterTopic(topic)
      const textContent = GetContentString(topic.content)

      return (this.viewingTopicsFilteredArchived.includes(masterTopic) &&
        (this.viewingTopicsFilteredTitle.includes(masterTopic) ||
        textContent && textContent.includes(this.filters.topic)))
    },
    toggleFilters () {
      this.filtersVisible = !this.filtersVisible
    }
  },
  mounted () {
    this.helpChapterBlocksNode = this.$refs.helpChapterBlocksModal
    this.helpChapterChipsNode = this.$refs.helpChapterChipsModal
    this.helpTopicChipsNode = this.$refs.helpTopicChipsModal
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

.section-title {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.help-icon {
  margin-left: 6px;
}

.filters {
  margin: 10px 0;
}

.chips-wrap {
  border-left: 2px solid #e8cc84;
  margin-bottom: 16px;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-top: 4px;
}

.chapters {
  display: block;
}

.chapter {
  background-color: transparent;
  box-shadow: 0px -2px 12px -4px rgba(0,0,0,0.75);
  margin-bottom: 10px;
}

.chapter-head {
  align-items: center;
  background-color: #e8cc84;
  border: 1px solid #e8cc84;
  display: flex;
  flex-direction: row;
  padding: 8px;
}

.chapter-head.light {
  background-color: rgba(232, 204, 132, 0.5);
}

.chapter-title {
  flex: 1;
  margin: 0;
}

.chapter-action {
  background-color: transparent;
  border-color: #FFF;
  color: #000;
  margin-right: 6px;
  transition: background-color 100ms;
}

.chapter-action:hover {
  background-color: #FFF;
}

.chapter-content {
  background-color: #FFFFD1;
  border: 1px solid #e8cc84;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-top: none;
  padding: 0 8px;
  padding-top: 20px;
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