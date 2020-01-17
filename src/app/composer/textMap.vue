<template>
  <div class="wrap">
    <div 
      class="map" 
      @click="mapClick" 
      ref="mapWrap">
      <div 
        class="map-inner" 
        v-html="mapHtml" 
        ref="map"/>
    </div>
    <text-magnifier 
      :html="mapHtml" 
      :magnify-el="mapNode" 
      :mark="mark" 
      :wrap-el="mapWrapNode"/>
  </div>
</template>

<script>
import './map-shared.css'

import debounce from 'lodash/debounce'
import Mark from 'mark.js'
import TextMagnifier from './textMagnifier.vue'

export default {
  components: {
    TextMagnifier,
  },
  data() {
    return {
      mapHtml: '',
      mapNode: null,
      mapWrapNode: null,
      markInstance: null,
      mouse: {
        x: null,
        y: null,
      },
    }
  },
  methods: {
    mapClick({ target }) {
      if (target.tagName.toLowerCase() === 'mark') {
        this.markClick({ target })
        return
      }

      const parentClasses = [...target.parentNode.classList]

      if (parentClasses.includes('wrap')) {
        return
      }

      if (!parentClasses.includes('map-inner')) {
        this.mapClick({ target: target.parentNode })
        return
      }

      const index = [...target.parentNode.childNodes].indexOf(target)
      this.$emit('select', {
        paragraphIndex: index,
        searchTermIndex: -1,
      })
    },
    markClick({ target }) {
      const map = this.$refs.map
      const marks = [...map.querySelectorAll('mark')]
      const searchTermIndex = marks.indexOf(target)

      const paragraph = target.parentNode
      const paragraphIndex = [...paragraph.parentNode.childNodes].indexOf(paragraph)

      this.$emit('select', {
        paragraphIndex,
        searchTermIndex,
      })
    },
    updateMap() {
      if (!this.editorElement) {
        return
      }

      const textElement = this.editorElement.$el.querySelector('.ql-editor')
      this.mapHtml = textElement.innerHTML
    },
  },
  mounted() {
    this.$nextTick(this.updateMap)
    this.markInstance = new Mark(this.$refs.map)
    this.mapNode = this.$refs.map
    this.mapWrapNode = this.$refs.mapWrap
  },
  props: {
    dataStream: {
      required: true,
      type: null
    },
    editorElement: {
      required: true,
      type: null
    },
    mark: {
      default: null,
      type: String
    },
  },
  watch: {
    dataStream: debounce(function () {
      this.updateMap()
    }, 250),
    mark(text) {
      this.markInstance.unmark()

      if (text.length < 3 || getNumberOfWords(text) > 3) {
        return
      }

      this.markInstance.mark(text, {
        separateWordSearch: false,
      })
    },
  },
}

function getNumberOfWords(str) {
  return str.trim().split(/\s/).length
}
</script>

<style scoped>
.wrap {
  height: 100%;
  position: relative;
  width: 100%;
}

.map-inner {
  height: 100%;
}
</style>
