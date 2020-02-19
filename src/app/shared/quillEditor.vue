<template>
  <div class="wrap">
    <div 
      class="editor" 
      ref="container"
    >
      <div 
        ref="editor" 
        @keyup.ctrl.enter="emitDone"
      />
    </div>
    <div v-if="showFullScreen">
      <quill-full-screen
        :content="content" 
        :content-id="contentId"
        @close="hideFullScreen()"
        @update:content="emitFullscreenContent"
        @update:selection="emitSelection"
      />
    </div>
  </div>
</template>

<script>
import createQuill from './quillBuilder'
import debounce from 'lodash/debounce'
import escapeStringRegexp from 'escape-string-regexp'
import isEqual from 'lodash/isEqual'
import QuillFullScreen from './quillFullScreen.vue'

export default {
  beforeDestroy() {
    this.handlers.forEach(([name, fn]) => this.quill.off(name, fn))
  },
  components: {
    QuillFullScreen,
  },
  data() {
    return {
      cachedContentId: null,
      handlers: [],
      quill: null,
      showFullScreen: false,
    }
  },
  methods: {
    // disable/enable are provided for the parent component to use
    disable() {
      this.quill.enable(false)
    },
    enable() {
      this.quill.enable()
    },
    emitContent(content, contentId) {
      this.$emit('update:content', { content, contentId })
    },
    emitFullscreenContent({ content, contentId }) {
      this.emitContent(content, contentId)
    },
    emitDone() {
      this.$emit('shortcut:done')
    },
    emitSelection(selection) {
      this.$emit('update:selection', selection)
    },
    focus() {
      this.$nextTick(() => this.quill.setSelection(this.quill.getLength(), 0, 'silent'))
    },
    hideFullScreen() {
      this.showFullScreen = false
    },
    listenQuill(quill) {
      const selectionChanged = debounce((selection) => {
        this.emitSelection(selection)
      }, 500)

      const onSelectionChange = (range) => {
        let selection
        if (!range || !range.length) {
          selection = {
            range: null,
            text: '',
          }
        } else {
          selection = {
            range,
            text: quill.getText(range.index, range.length),
          }
        }

        selectionChanged(selection)
      }

      const textChanged = debounce((content, contentId) => {
        this.emitContent(content, contentId)
      }, 750, { maxWait: 2000 })

      const onTextChange = () => {
        const selection = quill.getSelection()
        onSelectionChange(selection)
        const content = quill.getContents()
        const contentId = this.contentId
        textChanged(content, contentId)
      }

      quill.on('text-change', onTextChange)
      quill.on('selection-change', onSelectionChange)

      this.handlers.push(['text-change', onTextChange], ['selection-change', onSelectionChange])
    },
    updateQuill(quill, content, silent) {
      if (content) {
        quill.setContents(content, silent ? 'silent' : 'api')
      }
    },
  },
  mounted() {
    this.quill = createQuill(
      this.$refs.editor,
      'Write here.',
      this.container || this.$refs.container,
      () => {
        this.showFullScreen = true
      },
    )

    this.updateQuill(this.quill, this.content, true)
    this.listenQuill(this.quill)
  },
  props: {
    container: {
      default: null,
      required: false,
      type: null
    },
    content: {
      required: true,
      type: null
    },
    contentId: {
      required: false,
      default: null,
      type: String
    },
    scrollTo: {
      default: null,
      type: Object
    },
  },
  watch: {
    content(delta) {
      if (delta === undefined || isEqual(delta, this.quill.getContents())) {
        return
      }

      if (this.contentId !== this.cachedContentId) {
        this.cachedContentId = this.contentId
        this.quill.setContents(null, 'silent')
        this.quill.setContents(delta, 'silent')
      } else {
        this.updateQuill(this.quill, delta, true)
      }
    },
    scrollTo(descriptor) {
      if (!descriptor || !~descriptor.paragraphIndex) {
        return
      }

      const editor = this.$refs.editor.querySelector('.ql-editor')
      const element = editor.childNodes[descriptor.paragraphIndex]
      element.parentNode.scrollTop = element.offsetTop

      if (!~descriptor.searchTermIndex) {
        return
      }

      const searchTerm = this.$store.state.composer.selection.text
      const contents = this.quill.getText()
      const search = new RegExp(escapeStringRegexp(searchTerm), 'gi')

      const searchRanges = getAllOccurrences(search, contents)
      const selectedRange = searchRanges[descriptor.searchTermIndex]
      this.quill.setSelection(selectedRange, 'api')
    },
  },
}

function getAllOccurrences(regex, str) {
  const ranges = []
  let result
  while ((result = regex.exec(str))) {
    ranges.push({
      index: result.index,
      length: result[0].length,
    })
  }
  return ranges
}
</script>

<style scoped>
.wrap {
  height: calc(100% - 40px);
}

.editor {
  height: 100%;
  position: relative;
  width: 100%;
}
</style>

<style>
.ql-toolbar {
  align-items: center;
  background-color: #D6D6D6;
  border: 0 !important;
  display: flex;
  flex-direction: row;
}

.ql-container {
  background-color: #FFF;
  border: 0 !important;
}

.ql-editor {
  background-color: transparent;
  font-family: 'Source Serif Pro', sans-serif;
  font-size: 16px;
  overflow-wrap: break-word;
  padding: 12px 20px 12px 10px;
  word-break: break-word;
}

.ql-editor p {
  padding-bottom: 6px;
}

.ql-editor h1, .ql-editor h2, .ql-editor h3 {
  font-family: 'Asap Condensed', sans-serif;
  margin-bottom: 10px;
}

.ql-editor h1 {
  font-size: 25px;
}

.ql-fullscreen {
  fill: #444;
  width: auto !important;
}

.ql-fullscreen:hover {
  fill: #06c;
}

.ql-picker {
  background-color: #fff;
  border: 2px solid #323232;
  height: 32px !important;
}

.ql-picker .ql-picker-label {
  align-items: center;
  display: flex;
  flex-direction: row;
  font-size: 16px;
  font-weight: bold;
}

.ql-formats, .ql-snow .ql-formats {
  display: flex;
}

.ql-formats button, .ql-snow .ql-formats button {
  background-color: #F0F0F0;
  border: 2px solid #323232;
  border-radius: 8px;
  color: #323232;
  fill: #323232;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  height: 32px;
  margin-right: 8px;
  opacity: 1;
  width: 32px;
}

.ql-formats button.ql-active, .ql-snow .ql-formats button.ql-active {
  background-color: #323232;
  color: #F0F0F0;
  fill: #F0F0F0;
}

.ql-snow .ql-formats button.ql-active .ql-stroke {
  stroke: #F0F0F0;
}

.ql-snow .ql-formats button.ql-active .ql-fill {
  fill: #F0F0F0;
}

.ql-formats:nth-of-type(3) {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  margin-right: 0 !important;
}
</style>
