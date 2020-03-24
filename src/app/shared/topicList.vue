<template>
  <div class="wrap">
    <div 
      class="topic" 
      v-for="(topic, index) in chapterTopics" 
      v-show="showTopic(topic)" 
      :key="topic.guid"
    >
      <div class="topic-head">
        <h5 class="topic-title">
          {{ getMasterTopic(topic).title }}
        </h5>
        <div class="topic-actions">
          <button
            class="topic-action"
            v-show="!isEditing(index)"
            @click="editTopic(index)"
            title="Edit"
            v-tooltip
          >
            <span class="fas fa-edit" />
          </button>
          <button 
            class="topic-action"
            v-show="isEditing(index)" 
            @click="endEditTopic()"
            title="Save"
            v-tooltip
          >
            <span class="fas fa-check" />
          </button>
          <button 
            class="topic-action" 
            v-show="!getMasterTopic(topic).archived" 
            @click="archiveTopic({ index })"
            title="Archive"
            v-tooltip
          >
            <span class="fas fa-archive" />
          </button>
          <button 
            class="topic-action" 
            v-show="getMasterTopic(topic).archived" 
            @click="restoreTopic({ index })"
            title="Un-archive"
            v-tooltip
          >
            <span class="fas fa-box-open" />
          </button>
          <button 
            class="topic-action button-red" 
            v-show="getMasterTopic(topic).archived" 
            @click="deleteTopic({ index })"
            title="Delete forever"
            v-tooltip
          >
            <span class="fas fa-trash" />
          </button>
        </div>
      </div>
      <div class="topic-content">
        <div 
          class="content-static" 
          v-if="!isEditing(index)"
        >
          <div v-html="getHtml(topic)" />
          <span 
            class="content-placeholder" 
            v-if="showActions(topic) && !getTextContent(topic.content)"
          >
            No content yet. Click <span class="fas fa-edit" /> to add some.
          </span>
        </div>
        <div 
          class="content-editable" 
          v-show="isEditing(index)"
        >
          <quill-editor 
            :content="topic.content" 
            :content-id="chapter.guid" 
            ref="quillEditor" 
            @update:content="updateContent(topic, $event)"
            @shortcut:done="endEditTopic()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ARCHIVE_TOPIC, ADD_TOPIC_TO_CHAPTER, DELETE_TOPIC, RESTORE_TOPIC,
  UPDATE_TOPIC_CONTENT,
} from '../shared/chapters.store'
import { GetContentString, GetHtml } from './deltaParser'
import QuillEditor from '../shared/quillEditor.vue'
import swal from 'sweetalert'
import tooltip from '../shared/tooltip.directive'

export default {
  components: {
    QuillEditor,
  },
  directives: {
    tooltip
  },
  computed: {
    allChapters() {
      return this.$store.state.chapters.chapters
    },
    chapterTopics() {
      if (!this.chapter) {
        return []
      }

      return this.topics.map(topic => this.getTopic(this.chapter, topic)).filter(topic => !!topic)
    },
  },
  data() {
    return {
      editingTopicIndex: -1,
    }
  },
  methods: {
    archiveTopic({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, { topic: this.topics[index] })
    },
    deleteTopic({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this topic? It will be deleted from every chapter.
               This cannot be undone.`,
        title: 'Delete from every chapter?',
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_TOPIC, { topic: this.topics[index] })
      })
    },
    editTopic(index) {
      this.editingTopicIndex = index
      this.$refs.quillEditor[index].focus()
    },
    endEditTopic() {
      this.editingTopicIndex = -1
    },
    getHtml(topic) {
      return GetHtml(topic.content)
    },
    getMasterTopic(chapterTopic) {
      return this.topics.find(topic => topic.guid === chapterTopic.guid) || {}
    },
    getTopic(chapter, topic) {
      if (!chapter.topics) {
        chapter.topics = {}
      }

      if (!chapter.topics[topic.guid]) {
        this.$store.commit(ADD_TOPIC_TO_CHAPTER, { chapter, topic })
      }

      return chapter.topics[topic.guid]
    },
    getTextContent(content) {
      return GetContentString(content)
    },
    isEditing(index) {
      return this.editingTopicIndex === index
    },
    restoreTopic({ index }) {
      this.$store.commit(RESTORE_TOPIC, { topic: this.topics[index] })
    },
    showActions(chapterTopic) {
      return !this.getMasterTopic(chapterTopic).archived && !this.chapter.archived
    },
    showTopic(chapterTopic) {
      if (!chapterTopic) {
        return false
      }

      return this.filterTopics(chapterTopic)
    },
    updateContent(topic, { content: newContent, contentId: guid }) {
      const chapter = this.allChapters.find(chapter => chapter.guid === guid)
      const chapterTopic = chapter.topics[topic.guid]
      this.$store.commit(UPDATE_TOPIC_CONTENT, {
        chapter,
        newContent,
        topic: chapterTopic,
      })
    },
  },
  props: {
    chapter: {
      required: true,
      type: Object,
    },
    filterTopics: {
      required: true,
      type: Function,
    },
    topics: {
      required: true,
      type: Array,
    },
  },
}
</script>

<style scoped>
.wrap {
  width: 100%;
}

.topic {
  border: none;
  border-top: none;
  color: #000;
  margin-bottom: 20px;
}

.topic-head {
  align-items: center;
  background-color: #00866F;
  color: #FFF;
  display: flex;
  flex-direction: row;
  height: 48px;
  padding-left: 16px;
  padding-right: 8px;
}

.topic-title {
  color: #fff;
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  padding: 2px 0;
}

.topic-actions {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.topic-action {
  align-items: center;
  background-color: #fff;
  border: none;
  border-radius: 8px;
  color: #323232;
  display: flex;
  font-size: 16px;
  justify-content: center;
  height: 32px;
  margin: 8px;
  padding: 0;
  transition: background-color 100ms;
  width: 32px;
}

.topic-action:hover {
  background-color: #FFF;
  color: #000;
}

.topic-action span {
  align-items: center;
  display: flex;
  justify-content: center;
}

.topic-content {
  background-color: #FFF;
  font-size: 16px;
  padding: 16px;
}

.content-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.content-static, .content-editable {
  max-height: 275px;
  overflow-y: auto;
}

.content-static {
  white-space: pre-wrap;
}

.content-placeholder {
  color: #444;
  white-space: normal;
}
</style>
