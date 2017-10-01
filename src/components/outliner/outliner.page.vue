<template>
  <div class="outliner-wrap">
    <div class="outliner">
      <!-- Filters -->
      <div class="filters">
        <div class="section-title">
          <h3>Filters</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpFiltersNode, 'Filters')"></button>
        </div>
        <div class="filter-input">
          <label for="filterChaptersInput">Filter Chapters</label>
          <input id="filterChaptersInput" type="text" v-model.trim="filters.chapter" />
        </div>
        <div class="filter-input">
          <label for="filterTopicsInput">Filter Topics</label>
          <input id="filterTopicsInput" type="text" v-model.trim="filters.topic" />
        </div>
        <div>
          <input id="showArchivedCheckbox" type="checkbox" v-model="filters.archived" />
          <label for="showArchivedCheckbox">Show Archived</label>
        </div>
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
        <div class="chapter" v-for="(chapter, index) in viewingChapters" :key="index">
          <div class="chapter-head" :class="{ 'light': chapter.archived }">
            <h4 class="chapter-title">
              {{ chapter.title }}
            </h4>
            <div class="chapter-actions">
              <button class="chapter-action" v-show="!chapter.archived" @click="archiveChapter({ index })">Archive</button>
              <button class="chapter-action" v-show="chapter.archived" @click="restoreChapter({ index })">Restore</button>
              <button class="chapter-action button-red" v-show="chapter.archived" @click="deleteChapter({ index })">Delete Forever</button>
            </div>
          </div>
          <div class="chapter-content">
            <topic-list :chapter="chapter" :filter-topics="showTopic" :topics="allTopics"></topic-list>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters: [?] Modal -->
    <div style="display: none">
      <div class="help" ref="helpFiltersModal">
        <p>These are the filters. They can help you focus on the parts of your document you want to work on right now.</p>
        <p>If you type in the "Filter Chapters" box, only chapters that match your search text will be visible.</p>
        <p>If you type in the "Filter Topics" box, only topics that match your search text will be visible.</p>
        <p>
          If you check the "Show Archived" box, your archived chapters and topics will be visible.
          You'll be able to delete them forever, if you want.
        </p>
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
         RESTORE_CHAPTER, RESTORE_TOPIC, UPDATE_CHAPTER, UPDATE_TOPIC } from './outliner.store'
import ChipsList from './chipsList.vue'
import Octicons from 'octicons'
import swal from 'sweetalert'
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
      addSvg: Octicons.plus.toSVG({
        class: 'add-icon--svg',
        height: 14,
        width: 14
      }),
      filters: {
        archived: false,
        chapter: '',
        topic: ''
      },
      helpChapterBlocksNode: null,
      helpChapterChipsNode: null,
      helpFiltersNode: null,
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
      this.$store.commit(ADD_CHAPTER, {
        archived: false,
        title,
        topics: {}
      })
    },
    addTopic (title) {
      this.$store.commit(ADD_TOPIC, {
        archived: false,
        title
      })
    },
    archiveChapter ({ index }) {
      this.$store.commit(ARCHIVE_CHAPTER, this.allChapters[index])
    },
    archiveTopic ({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, this.allTopics[index])
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

        this.$store.commit(DELETE_CHAPTER, this.allChapters[index])
      })
    },
    getMasterTopic (chapterTopic) {
      return this.allTopics.find(topic => topic.title === chapterTopic.title)
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
      this.$store.commit(REARRANGE_CHAPTERS, chapters)
    },
    rearrangeTopic (topics) {
      this.$store.commit(REARRANGE_TOPICS, topics)
    },
    renameChapter ({ index, value: newTitle }) {
      this.$store.commit(UPDATE_CHAPTER, {
        chapter: this.allChapters[index],
        newTitle
      })
    },
    renameTopic ({ index, value: newTitle }) {
      const topic = this.allTopics[index]

      this.$store.commit(UPDATE_TOPIC, {
        topic,
        newContent: topic.content,
        newTitle
      })
    },
    restoreChapter ({ index }) {
      this.$store.commit(RESTORE_CHAPTER, this.allChapters[index])
    },
    restoreTopic ({ index }) {
      this.$store.commit(RESTORE_TOPIC, this.allTopics[index])
    },
    showChapter (chapter) {
      return this.viewingChapters.includes(chapter)
    },
    showTopic (topic) {
      const masterTopic = this.getMasterTopic(topic)

      return (this.viewingTopicsFilteredArchived.includes(masterTopic) &&
        (this.viewingTopicsFilteredTitle.includes(masterTopic) ||
        topic.textContent && topic.textContent.includes(this.filters.topic)))
    }
  },
  mounted () {
    this.helpChapterBlocksNode = this.$refs.helpChapterBlocksModal
    this.helpChapterChipsNode = this.$refs.helpChapterChipsModal
    this.helpFiltersNode = this.$refs.helpFiltersModal
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
  max-width: 350px;
}

.filter-input {
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
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
  transition: background-color 200ms;
}

.chapter-action:hover {
  background-color: #FFF;
}

.chapter-content {
  border: 1px solid #e8cc84;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-top: none;
  padding: 8px;
}
</style>

<style>
.add-icon--svg {
  fill: #FFF;
  margin-right: 6px;
}
</style>