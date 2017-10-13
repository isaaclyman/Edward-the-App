<template>
  <div class="wrap">
    <div class="topic" v-for="(topic, index) in chapterTopics" v-show="showTopic(topic)" :key="topic.id">
      <div class="topic-head">
        <h5 class="topic-title">
          {{ getMasterTopic(topic).title }}
        </h5>
        <div class="topic-actions">
          <button class="topic-action" v-show="!getMasterTopic(topic).archived" @click="archiveTopic({ index })">Archive</button>
          <button class="topic-action" v-show="getMasterTopic(topic).archived" @click="restoreTopic({ index })">Restore</button>
          <button class="topic-action button-red" v-show="getMasterTopic(topic).archived" @click="deleteTopic({ index })">Delete Forever</button>
        </div>
      </div>
      <div class="topic-content">
        <div class="content-actions" v-if="!getMasterTopic(topic).archived">
          <button class="button-link" v-if="!isEditing(index)" @click="editTopic(index)">
            <span class="button-link-icon" v-html="editSvg"></span>Edit
          </button>
          <button class="button-link" v-if="isEditing(index)" @click="endEditTopic(index)">
            <span class="button-link-icon" v-html="doneSvg"></span>Done Editing
          </button>
        </div>
        <div class="content-static" v-if="!isEditing(index)">
          <p v-text="topic.textContent"></p>
          <span class="content-placeholder" v-if="!topic.textContent && !getMasterTopic(topic).archived">
            No content yet. Click "Edit" to add some.
          </span>
        </div>
        <div class="content-editable" v-if="isEditing(index)">
          <quill-editor :content="topic.content" @update:content="updateContent(topic, $event)"
                        @update:textContent="updateTextContent(topic, $event)"></quill-editor>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ARCHIVE_TOPIC, ADD_TOPIC_TO_CHAPTER, DELETE_TOPIC, RESTORE_TOPIC,
         UPDATE_TOPIC_CONTENT, UPDATE_TOPIC_TEXT_CONTENT } from '../app/chapters.store'
import Octicons from 'octicons'
import QuillEditor from '../app/quillEditor.vue'
import swal from 'sweetalert'

export default {
  components: {
    QuillEditor
  },
  computed: {
    chapterTopics () {
      return this.topics.map(topic => this.getTopic(this.chapter, topic))
    }
  },
  data () {
    return {
      doneSvg: Octicons.check.toSVG({
        height: 14,
        width: 14
      }),
      editingTopicIndex: -1,
      editSvg: Octicons.pencil.toSVG({
        height: 14,
        width: 14
      })
    }
  },
  methods: {
    archiveTopic ({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, { topic: this.topics[index] })
    },
    deleteTopic ({ index }) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this topic? It will be deleted from every chapter.
               This cannot be undone.`,
        title: 'Delete Forever?'
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_TOPIC, { topic: this.topics[index] })
      })
    },
    editTopic (index) {
      this.editingTopicIndex = index
    },
    endEditTopic (index) {
      this.editingTopicIndex = -1
    },
    getMasterTopic (chapterTopic) {
      return this.topics.find(topic => topic.id === chapterTopic.id)
    },
    getTopic (chapter, topic) {
      if (!chapter.topics) {
        throw new Error(`Chapter ${chapter.title} was created incorrectly and has no 'topics' dictionary.`)
      }

      if (!chapter.topics[topic.id]) {
        this.$store.commit(ADD_TOPIC_TO_CHAPTER, { chapter, topic })
      }

      return chapter.topics[topic.id]
    },
    isEditing (index) {
      return this.editingTopicIndex === index
    },
    restoreTopic ({ index }) {
      this.$store.commit(RESTORE_TOPIC, { topic: this.topics[index] })
    },
    showTopic (chapterTopic) {
      if (!chapterTopic) {
        return false
      }

      return this.filterTopics(chapterTopic)
    },
    updateContent (topic, newContent) {
      this.$store.commit(UPDATE_TOPIC_CONTENT, {
        chapter: this.chapter,
        newContent,
        topic
      })
    },
    updateTextContent (topic, newTextContent) {
      this.$store.commit(UPDATE_TOPIC_TEXT_CONTENT, {
        chapter: this.chapter,
        newTextContent: newTextContent.trim(),
        topic
      })
    }
  },
  props: {
    chapter: {
      required: true,
      type: Object
    },
    filterTopics: {
      required: true,
      type: Function
    },
    topics: {
      required: true,
      type: Array
    }
  }
}
</script>

<style scoped>
.wrap {
  width: 100%;
}

.topic {
  border: 1px solid #e8cc84;
  border-top: none;  
  margin-bottom: 20px;
}

.topic-head {
  align-items: center;
  background-color: #e8cc84;
  display: flex;
  flex-direction: row;
  height: 28px;
  padding: 0 8px;
}

.topic-title {
  flex: 1;
  padding: 2px 0;
}

.topic-actions {
  height: 100%;
}

.topic-action {
  background-color: transparent;
  border: none;
  border-left: 1px solid #fff;
  border-radius: 0;
  border-right: 1px solid #fff;
  color: #000;
  height: 100%;
  margin-right: 6px;
  padding: 3px 6px;
  transition: background-color 200ms;
}

.topic-action:hover {
  background-color: #FFF;
}

.topic-content {
  background-color: #FFF;
  padding-bottom: 6px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 1px;
}

.content-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.content-static {
  font-family: 'Libre Baskerville', serif;
  font-size: 13px;
  white-space: pre-wrap;
}

.content-placeholder {
  color: #444;
  white-space: normal;
}
</style>
