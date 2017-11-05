<template>
  <div class="wrap">
    <div class="actions">
      <button v-show="!isWideView" class="action" v-html="wideSvg" @click="showWideView()"
        title="Wide view" v-tooltip></button>
      <button v-show="isWideView" class="action" v-html="narrowSvg" @click="showNarrowView()"
        title="Book-width view" v-tooltip></button>
      <button class="action" v-html="exitSvg" @click="close()"></button>
    </div>
    <div class="container" :class="{ 'wide': isWideView }" ref="container">
      <div class="editor" ref="editor"></div>
    </div>
  </div>
</template>

<script>
import createQuill from './quillBuilder'
import debounce from 'lodash/debounce'
import Octicons from 'octicons'
import tooltip from './tooltip.directive'

export default {
  data () {
    return {
      exitSvg: Octicons.x.toSVG({
        height: 30,
        width: 30
      }),
      isWideView: false,
      narrowSvg: Octicons['screen-normal'].toSVG({
        height: 30,
        width: 30
      }),
      quill: null,
      wideSvg: Octicons['screen-full'].toSVG({
        height: 30,
        width: 30
      })
    }
  },
  directives: {
    tooltip
  },
  methods: {
    close () {
      this.$emit('close')
    },
    emitContent (content) {
      this.$emit('update:content', content)
    },
    emitSelection (selection) {
      this.$emit('update:selection', selection)
    },
    listenQuill (quill) {
      quill.on('text-change', debounce(() => {
        this.emitContent(quill.getContents())
      }, 250))

      quill.on('selection-change', debounce((range) => {
        if (!range) {
          return
        }

        let selection
        if (!range.length) {
          selection = {
            range: null,
            text: ''
          }
        } else {
          selection = {
            range: range,
            text: quill.getText(range.index, range.length)
          }
        }

        this.emitSelection(selection)
      }, 500))
    },
    showNarrowView () {
      this.isWideView = false
    },
    showWideView () {
      this.isWideView = true
    },
    updateQuill (quill, content) {
      if (content) {
        quill.setContents(content, 'api')
      }
    }
  },
  mounted () {
    this.quill = createQuill(
      this.$refs.editor,
      'Write here.',
      this.$refs.container
    )

    this.updateQuill(this.quill, this.content)
    this.emitContent(this.quill.getContents())
    this.listenQuill(this.quill)
  },
  props: {
    content: {
      required: true
    },
    selection: {
      type: Object
    }
  }
}
</script>

<style scoped>
.wrap {
  background-color: rgba(255, 255, 255, 0.98);
  display: flex;
  flex-direction: column;
  height: 100%;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
}

.actions {
  align-items: center;
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 5px;
  top: 5px;
}

.action {
  align-items: center;
  border: none;
  display: flex;
  fill: #000;
  height: 45px;
  justify-content: center;
  padding: 0;
  transition: fill 100ms;
  width: 45px;
}

.action:hover {
  fill: #CCC;
}

.container {
  align-self: center;
  height: calc(100% - 40px);
  max-width: 500px;
  padding-top: 20px;
}

.container.wide {
  max-width: 1000px;
}
</style>
