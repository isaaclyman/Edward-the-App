<template>
  <div>
    <div class="topic" v-for="(topic, index) in getTopics" v-show="showTopic(topic)" :key="topic.title">
      <div class="topic-head">
        <h5 class="topic-title">
          {{ topic.title }}
        </h5>
        <div class="topic-actions">
          <button class="topic-action" v-show="!getMasterTopic(topic).archived" @click="archiveTopic({ index })">Archive</button>
          <button class="topic-action" v-show="getMasterTopic(topic).archived" @click="restoreTopic({ index })">Restore</button>
          <button class="topic-action button-red" v-show="getMasterTopic(topic).archived" @click="deleteTopic({ index })">Delete Forever</button>
        </div>
      </div>
      <div class="topic-content">
        {{ topic.content }}
      </div>
    </div>
  </div>
</template>

<script>
import { ARCHIVE_TOPIC, ADD_TOPIC_TO_CHAPTER, DELETE_TOPIC, RESTORE_TOPIC } from '../outliner/outliner.store'
import Octicons from 'octicons'
import swal from 'sweetalert'

export default {
  computed: {
    getTopics () {
      return this.topics.map(topic => this.getTopic(this.chapter, topic))
    }
  },
  data () {
    return {
      addSvg: Octicons.plus.toSVG({
        class: 'add-icon--svg',
        height: 14,
        width: 14
      })
    }
  },
  methods: {
    archiveTopic ({ index }) {
      this.$store.commit(ARCHIVE_TOPIC, this.topics[index])
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

        this.$store.commit(DELETE_TOPIC, this.topics[index])
      })
    },
    getMasterTopic (chapterTopic) {
      return this.topics.find(topic => topic.title === chapterTopic.title)
    },
    getTopic (chapter, topic) {
      if (!chapter.topics) {
        throw new Error(`Chapter ${chapter.title} was created incorrectly and has no 'topics' dictionary.`)
      }

      if (!chapter.topics[topic.title]) {
        this.$store.commit(ADD_TOPIC_TO_CHAPTER, { chapter, topic })
      }

      return chapter.topics[topic.title]
    },
    restoreTopic ({ index }) {
      this.$store.commit(RESTORE_TOPIC, this.topics[index])
    },
    showTopic (chapterTopic) {
      if (!chapterTopic) {
        return false
      }

      return this.filterTopics(chapterTopic)
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
.topic {
  margin: 10px 0;
}

.topic-head {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.topic-title {
  flex: 1;
}
</style>
