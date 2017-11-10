<template>
  <div class="wrap">
    <div class="editor" ref="container">
      <div ref="editor"></div>
    </div>
    <div v-if="showFullScreen">
      <quill-full-screen 
        :content="content" :selection="selection"
        @close="hideFullScreen()"
        @update:content="emitContent"
        @update:selection="emitSelection"></quill-full-screen>
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
  components: {
    QuillFullScreen
  },
  data () {
    return {
      quill: null,
      showFullScreen: false
    }
  },
  methods: {
    emitContent (content) {
      this.$emit('update:content', content)
    },
    emitSelection (selection) {
      this.$emit('update:selection', selection)
    },
    hideFullScreen () {
      this.showFullScreen = false
    },
    listenQuill (quill) {
      quill.on('text-change', debounce(() => {
        this.emitContent(quill.getContents())
      }, 1000))

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
      this.container || this.$refs.container,
      () => {
        this.showFullScreen = true
      }
    )

    this.updateQuill(this.quill, this.content)
    this.emitContent(this.quill.getContents())
    this.listenQuill(this.quill)
  },
  props: {
    container: {
      required: false
    },
    content: {
      required: true
    },
    scrollTo: {
      type: Object
    },
    selection: {
      type: Object
    }
  },
  watch: {
    content (delta) {
      if (delta === undefined || isEqual(delta, this.quill.getContents())) {
        return
      }

      this.quill.setContents(null, 'api')
      this.quill.setContents(delta, 'api')
    },
    scrollTo (descriptor) {
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
    selection (selection) {
      if (!selection || isEqual(selection, this.quill.getSelection())) {
        return
      }

      this.quill.setSelection(selection, 'api')
    }
  }
}

function getAllOccurrences (regex, str) {
  const ranges = []
  let result
  while ((result = regex.exec(str))) {
    ranges.push({
      index: result.index,
      length: result[0].length
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
  background-color: #F0F0F0;
}

.ql-container {
  background-color: #FFF;
}

.ql-editor {
  background-color: transparent;
  font-family: 'Khula', sans-serif;
  font-size: 14px;
  padding: 12px 20px 12px 10px;
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
  min-width: 40px;
  width: auto !important;
}

.ql-fullscreen:hover {
  fill: #06c;
}
</style>
