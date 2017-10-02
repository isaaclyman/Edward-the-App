<template>
  <div class="wrap">
    <div class="map" @click="mapClick" ref="mapWrap">
      <div class="map-inner" v-html="mapHtml" ref="map"></div>
    </div>
    <button class="help-icon" v-html="helpIconSvg" @click="helpClick"></button>
    <text-magnifier :html="mapHtml" :magnify-el="mapNode" :mark="mark" :wrap-el="mapWrapNode"></text-magnifier>

    <!-- [?] Modal -->
    <div style="display: none">
      <div class="help" ref="helpModal">
        <p>This is the mini-map. It's the 10,000 foot view of your document. As you write, you'll see it fill up.</p>
        <p>It has a couple of helpful features:</p>
        <ul>
          <li>If you click a paragraph in the mini-map, you'll jump to that paragraph in the editor.</li>
          <li>If you highlight a word in the editor, every appearance of that word will be highlighted in the mini-map.</li>
          <li>If you click a highlighted word in the mini-map, you'll jump to that word in the editor and highlight it.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import './map-shared.css'

import debounce from 'lodash/debounce'
import Mark from 'mark.js'
import Octicons from 'octicons'
import swal from 'sweetalert'
import TextMagnifier from './textMagnifier.vue'

export default {
  components: {
    TextMagnifier
  },
  data () {
    return {
      helpIconSvg: Octicons.question.toSVG({
        class: 'help-icon--svg',
        height: 20,
        width: 20
      }),
      helpNode: null,
      mapHtml: '',
      mapNode: null,
      mapWrapNode: null,
      markInstance: null,
      mouse: {
        x: null,
        y: null
      }
    }
  },
  methods: {
    helpClick () {
      swal({
        content: this.helpNode,
        title: 'Tip'
      })
    },
    mapClick ({ target }) {
      if (target.tagName.toLowerCase() === 'mark') {
        this.markClick({ target })
        return
      }

      if (![...target.parentNode.classList].includes('map-inner')) {
        return
      }

      const index = [...target.parentNode.childNodes].indexOf(target)
      this.$emit('select', {
        paragraphIndex: index,
        searchTermIndex: -1
      })
    },
    markClick ({ target }) {
      const map = this.$refs.map
      const marks = [...map.querySelectorAll('mark')]
      const searchTermIndex = marks.indexOf(target)

      const paragraph = target.parentNode
      const paragraphIndex = [...paragraph.parentNode.childNodes].indexOf(paragraph)

      this.$emit('select', {
        paragraphIndex,
        searchTermIndex
      })
    },
    updateMap () {
      if (!this.editorElement) {
        return
      }

      const textElement = this.editorElement.$el.querySelector('.ql-editor')
      this.mapHtml = textElement.innerHTML
    }
  },
  mounted () {
    this.$nextTick(this.updateMap)
    this.helpNode = this.$refs.helpModal
    this.markInstance = new Mark(this.$refs.map)
    this.mapNode = this.$refs.map
    this.mapWrapNode = this.$refs.mapWrap
  },
  props: {
    dataStream: {
      required: true
    },
    editorElement: {
      required: true
    },
    mark: {
      type: String
    }
  },
  watch: {
    dataStream: debounce(function () {
      this.updateMap()
    }, 250),
    mark (text) {
      this.markInstance.unmark()

      if (text.length < 3 || getNumberOfWords(text) > 3) {
        return
      }

      this.markInstance.mark(text, {
        separateWordSearch: false
      })
    }
  }
}

function getNumberOfWords (str) {
  return str.trim().split(/\s/).length
}
</script>

<style scoped>
.wrap {
  height: 100%;
  position: relative;
  width: 100%;
}

.wrap:hover .help-icon {
  opacity: 1;
}

.map-inner {
  height: 100%;
}

.help-icon {
  opacity: 0;
  position: absolute;
  right: 6px;
  top: 6px;
}
</style>
