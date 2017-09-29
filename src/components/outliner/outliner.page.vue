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
        <chips-list :data-array="allChapters" :filter-chips="showChip" name="Chapter" name-prop="title"
                    @add="addChapter"
                    @delete="deleteChapter"></chips-list>
      </div>
      <!-- Topic Chips -->
      <div class="chips-wrap">
        <div class="section-title">
          <h3>Topics</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpTopicChipsNode, 'Topic List')"></button>
        </div>
        <chips-list :data-array="allTopics" :filter-chips="showChip" name="Topic" name-prop="title"
                    @add="addTopic"
                    @delete="deleteTopic"></chips-list>
      </div>
      <hr>
      <div class="chapters">
        <div class="section-title">
          <h3>Outline</h3>
          <button class="help-icon" v-html="helpIconSvg" @click="helpClick(helpChapterBlocksNode, 'Outline')"></button>
        </div>
        <!-- Chapters > Topics -->
        <div class="chapter" v-for="(chapter, index) in viewingChapters" :key="index">
          <div class="chapter-head">
            <h4 class="chapter-title" v-if="!chapter.editing">
              {{ chapter.title }}
            </h4>
            <h4 class="chapter-title" v-if="chapter.editing">
              <input v-model.trim="chapter.title">
            </h4>
            <div v-show="!chapter.editing" class="chapter-actions">
              <!-- Move up, move down, rename, archive -->
              <button @click="deleteChapter({ index })">Archive</button>
            </div>
          </div>
          <div class="chapter-content">
            <topic-list v-show="!chapter.editing" :chapter="chapter" :topics="viewingTopics"></topic-list>
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
import { ADD_CHAPTER, ADD_TOPIC, ARCHIVE_CHAPTER, ARCHIVE_TOPIC } from './outliner.store'
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
    viewingTopics () {
      return (this.allTopics
        .filter(topic => !topic.archived || this.filters.archived)
        .filter(topic => !this.filters.topic ||
                topic.title.toLowerCase().includes(this.filters.topic.toLowerCase()) ||
                topic.textContent.toLowerCase().includes(this.filters.topic.toLowerCase())))
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
        topics: []
      })
    },
    addTopic (title) {
      this.$store.commit(ADD_TOPIC, {
        archived: false,
        content: null,
        textContent: '',
        title
      })
    },
    deleteChapter ({ index }) {
      this.$store.commit(ARCHIVE_CHAPTER, this.allChapters[index])
    },
    deleteTopic ({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, this.allTopics[index])
    },
    helpClick (content, title) {
      swal({
        content,
        title
      })
    },
    showChip (chip) {
      return !chip.archived || this.filters.archived
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

.chapter-title {
  flex: 1;
  margin: 0;
}

.chapter-actions button {
  background-color: transparent;
  border-color: #FFF;
  color: #000;
  margin-right: 6px;
  transition: background-color 200ms;
}

.chapter-actions button:hover {
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