<template>
  <div class="editor">
    <div ref="editor"></div>
  </div>
</template>

<script>
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

    this.quill.on('text-change', () => {
      this.$emit('update:content', this.quill.getContents())
    })
  },
  name: 'quill-editor',
  props: {
    content: {
      required: true
    }
  },
  watch: {
    content (delta) {
      if (!delta || isEqual(delta, this.quill.getContents())) {
        return
      }

      this.quill.setContents(delta, 'api')
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
.ql-editor {
  background-color: #FFF;
  font-family: 'Libre Baskerville', serif;
}

.ql-editor p {
  padding-bottom: 2px;
}

.ql-editor h1, .ql-editor h2, .ql-editor h3 {
  font-family: 'Asap Condensed', sans-serif;
}

.ql-editor h1 {
  font-size: 25px;
}
</style>
