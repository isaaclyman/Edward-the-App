<template>
  <div class="wrap">
    <div class="map" v-html="mapHtml" @click="mapClick" ref="map"></div>
    <button class="help-icon" v-html="helpIconSvg" @click="helpClick"></button>
    <div style="display: none" ref="helpModal">
      <div class="help">
        <title>Tip</title>
        <p>This is the mini-map. It's the 10,000 foot view of your document. As you write, you'll see it fill up.</p>
        <p>It has a couple of helpful features:</p>
        <ul>
          <li>If you click a paragraph in the mini-map, you'll jump to that paragraph in the main window.</li>
          <li>If you highlight a word in the editor, every appearance of that word will be highlighted in the mini-map.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import Mark from 'mark.js'
import Octicons from 'octicons'
import swal from 'sweetalert'

export default {
  data () {
    return {
      helpIconSvg: Octicons.question.toSVG({
        class: 'help-icon--svg',
        height: 20,
        width: 20
      }),
      helpNode: null,
      mapHtml: '',
      markInstance: null
    }
  },
  methods: {
    helpClick () {
      swal({
        title: 'Tip',
        content: this.helpNode
      })
    },
    mapClick ({ target }) {
      if (![...target.parentNode.classList].includes('map')) {
        return
      }

      const index = [...target.parentNode.childNodes].indexOf(target)
      this.$emit('select', index)
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
    this.helpNode = this.$refs.helpModal.querySelector('.help')
    this.markInstance = new Mark(this.$refs.map)
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
      this.markInstance.mark(text)
    }
  }
}
</script>

<style scoped>
.wrap {
  height: 100%;
  position: relative;
  width: 100%;
}

.map {
  background-color: #F8F8F8;
  border: 1px solid #e8cc84;
  cursor: default;
  font-size: 2px;
  height: 100%;
  overflow-x: hidden;
  padding-top: 4px;
  user-select: none;
  width: 100%;
}

.map /deep/ p {
  margin: 0;
  padding: 0.8px 2px;
}

.map--img {
  width: 160px;
}

.help-icon {
  border: none;
  height: 20px;
  opacity: 0;
  padding: 0;
  position: absolute;
  right: 6px;
  top: 6px;
  transition: opacity 200ms;
  width: 20px;
}

.help {
  font-size: 14px;
}

.help /deep/ li {
  text-align: left;
}

.wrap:hover .help-icon {
  opacity: 1;
}
</style>

<style>
.help-icon--svg {
  fill: #444;
}

mark {
  background-color: #8bc34a;
  pointer-events: none;
}
</style>