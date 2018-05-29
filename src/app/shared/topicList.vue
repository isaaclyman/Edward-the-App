<template>
  <div class="wrap">
    <div class="topic" v-for="(topic, index) in chapterTopics" v-show="showTopic(topic)" :key="topic.guid">
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
        <div class="content-actions" v-if="showActions(topic)">
          <button class="button-link" v-if="!isEditing(index)" @click="editTopic(index)">
            <span class="button-link-icon" v-html="editSvg"></span>Edit
          </button>
          <button class="button-link" v-if="isEditing(index)" @click="endEditTopic(index)">
            <span class="button-link-icon" v-html="doneSvg"></span>Done Editing
          </button>
        </div>
        <div class="content-static" :class="{ 'space-above': !showActions(topic) }" v-if="!isEditing(index)">
          <div v-html="getHtml(topic)"></div>
          <span class="content-placeholder" v-if="showActions(topic) && !getTextContent(topic.content)">
            No content yet. Click "Edit" to add some.
          </span>
        </div>
        <div class="content-editable" v-show="isEditing(index)">
          <quill-editor :content="topic.content" :content-id="chapter.guid" ref="quillEditor" @update:content="updateContent(topic, $event)"
            @shortcut:done="endEditTopic(index)"></quill-editor>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ARCHIVE_TOPIC, ADD_TOPIC_TO_CHAPTER, DELETE_TOPIC, RESTORE_TOPIC,
         UPDATE_TOPIC_CONTENT } from '../shared/chapters.store'
import { GetContentString, GetHtml } from './deltaParser'
import Octicons from 'octicons'
import QuillEditor from '../shared/quillEditor.vue'
import swal from 'sweetalert'

export default {
  components: {
    QuillEditor
  },
  computed: {
    allChapters () {
      return this.$store.state.chapters.chapters
    },
    chapterTopics () {
      return this.topics.map(topic => this.getTopic(this.chapter, topic)).filter(topic => !!topic)
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
        title: 'Delete from every chapter?'
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.commit(DELETE_TOPIC, { topic: this.topics[index] })
      })
    },
    editTopic (index) {
      this.editingTopicIndex = index
      this.$refs.quillEditor[index].focus()
    },
    endEditTopic (index) {
      this.editingTopicIndex = -1
    },
    getHtml (topic) {
      return GetHtml(topic.content)
    },
    getMasterTopic (chapterTopic) {
      return this.topics.find(topic => topic.guid === chapterTopic.guid) || {}
    },
    getTopic (chapter, topic) {
      if (!chapter.topics) {
        throw new Error(`Chapter ${chapter.title} was created incorrectly and has no 'topics' dictionary.`)
      }

      if (!chapter.topics[topic.guid]) {
        this.$store.commit(ADD_TOPIC_TO_CHAPTER, { chapter, topic })
      }

      return chapter.topics[topic.guid]
    },
    getTextContent (content) {
      return GetContentString(content)
    },
    isEditing (index) {
      return this.editingTopicIndex === index
    },
    restoreTopic ({ index }) {
      this.$store.commit(RESTORE_TOPIC, { topic: this.topics[index] })
    },
    showActions (chapterTopic) {
      return !this.getMasterTopic(chapterTopic).archived && !this.chapter.archived
    },
    showTopic (chapterTopic) {
      if (!chapterTopic) {
        return false
      }

      return this.filterTopics(chapterTopic)
    },
    updateContent (topic, { content: newContent, contentId: guid }) {
      const chapter = this.allChapters.find(chapter => chapter.guid === guid)
      const chapterTopic = chapter.topics[topic.guid]
      this.$store.commit(UPDATE_TOPIC_CONTENT, {
        chapter,
        newContent,
        topic: chapterTopic
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
  border: 1px solid rgba(5, 133, 157, 1);
  border-top: none;
  color: #000;
  margin-bottom: 20px;
}

.topic-head {
  align-items: center;
  background-color: rgba(5, 133, 157, 1);
  color: #FFF;
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
  color: #FFF;
  height: 100%;
  margin-right: 6px;
  padding: 3px 6px;
  transition: background-color 100ms;
}

.topic-action:hover {
  background-color: #FFF;
  color: #000;
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

.content-static, .content-editable {
  max-height: 275px;
  overflow-y: auto;
}

.content-static {
  font-family: 'Khula', sans-serif;
  font-size: 13px;
  white-space: pre-wrap;
}

.content-static.space-above {
  margin-top: 30px;
}

.content-placeholder {
  color: #444;
  white-space: normal;
}
</style>
