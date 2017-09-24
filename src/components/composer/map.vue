<template>
  <div class="wrap">
    <div class="map" v-html="mapHtml" @click="mapClick"></div>
    <button class="help-icon" v-html="helpIconSvg"></button>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import Octicons from 'octicons'

export default {
  data () {
    return {
      helpIconSvg: Octicons.question.toSVG({
        class: 'help-icon--svg',
        height: 20,
        width: 20
      }),
      mapHtml: ''
    }
  },
  methods: {
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
  },
  props: {
    dataStream: {
      required: true
    },
    editorElement: {
      required: true
    }
  },
  watch: {
    dataStream: debounce(function () {
      this.updateMap()
    }, 250)
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

.wrap:hover .help-icon {
  opacity: 1;
}
</style>

<style>
.help-icon--svg {
  fill: #444;
}
</style>