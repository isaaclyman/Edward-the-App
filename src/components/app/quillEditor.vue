<template>
  <div class="editor">
    <div ref="editor"></div>
    <div class="search" :class="{ 'active': isSearchActive }">
      <button v-html="caretLeftSvg" @click="searchPrev"></button>
      <div class="search-results">{{ searchText }}</div>
      <button v-html="caretRightSvg" @click="searchNext"></button>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import escapeStringRegexp from 'escape-string-regexp'
import findIndex from 'lodash/findIndex'
import isEqual from 'lodash/isEqual'
import Octicons from 'octicons'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default {
  computed: {
    isSearchActive () {
      return !!this.searchRanges.length
    },
    searchText () {
      return `${this.searchRangeCurrent + 1} / ${this.searchRanges.length} results`
    }
  },
  data () {
    return {
      caretLeftSvg: Octicons['chevron-left'].toSVG({
        class: 'search-icon--svg',
        height: 20,
        width: 20
      }),
      caretRightSvg: Octicons['chevron-right'].toSVG({
        class: 'search-icon--svg',
        height: 20,
        width: 20
      }),
      quill: null,
      searchRangeCurrent: -1,
      searchRanges: []
    }
  },
  methods: {
    searchNext () {
      if (!~this.searchRangeCurrent) {
        return
      }

      const maxedOut = (this.searchRangeCurrent + 1) >= this.searchRanges.length

      if (maxedOut) {
        this.searchRangeCurrent = 0
      } else {
        this.searchRangeCurrent++
      }

      const nextRange = this.searchRanges[this.searchRangeCurrent]
      this.quill.setSelection(nextRange.index, nextRange.length, 'api')
    },
    searchPrev () {
      if (this.searchRangeCurrent < 0) {
        return
      }

      if (this.searchRangeCurrent === 0) {
        this.searchRangeCurrent = this.searchRanges.length - 1
      } else {
        this.searchRangeCurrent--
      }

      const prevRange = this.searchRanges[this.searchRangeCurrent]
      this.quill.setSelection(prevRange.index, prevRange.length, 'api')
    }
  },
  mounted () {
    const toolbarOptions = [[
      { 'header': [1, 2, 3, false] }
    ], [
      'bold', 'italic', 'underline', 'strike'
    ], [
      { 'list': 'ordered' }, { 'list': 'bullet' }
    ], [
      'blockquote'
    ], [
      { 'indent': '-1' }, { 'indent': '+1' }
    ], [
      'clean'
    ]]

    const allowedFormats = [
      'size',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'list',
      'blockquote',
      'indent'
    ]

    this.quill = new Quill(this.$refs.editor, {
      formats: allowedFormats,
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Write here.',
      theme: 'snow'
    })

    if (this.content) {
      this.quill.setContents(this.content, 'api')
    }

    this.quill.on('text-change', debounce(() => {
      this.$emit('update:content', this.quill.getContents())
    }, 500))

    this.quill.on('selection-change', debounce((range) => {
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
          text: this.quill.getText(range.index, range.length)
        }
      }

      this.$emit('update:selection', selection)
    }, 500))
  },
  name: 'quill-editor',
  props: {
    content: {
      required: true
    },
    mark: {
      type: String
    },
    scrollTo: {
      type: Number
    },
    selection: {
      type: Object
    }
  },
  watch: {
    content (delta) {
      if (!delta || isEqual(delta, this.quill.getContents())) {
        return
      }

      this.quill.setContents(delta, 'api')
    },
    mark (text) {
      if (text.length < 3) {
        this.searchRangeCurrent = -1
        this.searchRanges = []
        return
      }

      const contents = this.quill.getText()
      const search = new RegExp(escapeStringRegexp(text), 'gi')

      this.searchRanges = getAllOccurrences(search, contents)
      this.searchRangeCurrent = getRangeIndex(this.searchRanges, this.quill.getSelection())
    },
    scrollTo (index) {
      const editor = this.$refs.editor.querySelector('.ql-editor')
      const element = editor.childNodes[index]
      element.scrollIntoView(true)
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

function getRangeIndex (ranges, selection) {
  return findIndex(ranges, (current) => {
    return current.index === selection.index
  })
}
</script>

<style scoped>
.editor {
  height: calc(100% - 45px);
  position: relative;
  width: 100%;
}

.search {
  background-color: rgba(240, 240, 240, 0.9);
  opacity: 0;
  padding: 6px;
  position: absolute;
  right: 16px;
  top: 42px;
  transition: opacity 200ms ease-in-out;
}

.search.active {
  opacity: 1;
}

.search-results {
  display: inline-block;
  padding: 0 4px;
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
  font-family: 'Libre Baskerville', serif;
  font-size: 12px;
}

.ql-editor p {
  padding-bottom: 6px;
}

.ql-editor h1, .ql-editor h2, .ql-editor h3 {
  font-family: 'Asap Condensed', sans-serif;
}

.ql-editor h1 {
  font-size: 25px;
}
</style>
