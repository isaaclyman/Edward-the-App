<template>
  <div>
    <div class="topic" v-for="topic in getTopics" :key="topic.title">
      <div class="topic--head">
        <h3 class="topic--title">
          {{ topic.title }}
        </h3>
        <div class="topic--actions">
          <!-- Move up, move down, rename, archive -->
        </div>
      </div>
      <div class="topic--content">
        {{ topic.content }}
      </div>
    </div>
  </div>
</template>

<script>
import Octicons from 'octicons'

export default {
  beforeCreate () {

  },
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
    getTopic (chapter, topic) {
      if (!chapter.topics) {
        chapter.topics = {}
      }

      if (!chapter.topics[topic.key]) {
        chapter.topics[topic.key] = {
          content: null,
          title: topic.title
        }
      }

      return chapter.topics[topic.key]
    }
  },
  props: {
    chapter: {
      required: true,
      type: Object
    },
    topics: {
      required: true,
      type: Array
    }
  }
}
</script>

<style scoped>

</style>
