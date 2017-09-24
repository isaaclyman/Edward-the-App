<template>
  <div class="editor">
    <div ref="editor"></div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default {
  data () {
    return {
      quill: null
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

    this.quill = new Quill(this.$refs.editor, {
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
  },
  name: 'quill-editor',
  props: {
    content: {
      required: true
    },
    scrollTo: {
      type: Number
    }
  },
  watch: {
    content (delta) {
      if (!delta || isEqual(delta, this.quill.getContents())) {
        return
      }

      this.quill.setContents(delta, 'api')
    },
    scrollTo (index) {
      const editor = this.$refs.editor.querySelector('.ql-editor')
      const element = editor.childNodes[index]
      element.scrollIntoView(true)
    }
  }
}
</script>

<style scoped>
.editor {
  height: calc(100% - 45px);
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
