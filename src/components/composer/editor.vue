<template>
  <div id="editor" class="editor">
    
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default {
  mounted () {
    const quill = new Quill('#editor', {
      theme: 'snow'
    })

    console.log(quill)
  },
  components: {},
  computed: {},
  data () {
    return {}
  },
  props: {}
}
</script>

<style>
.editor {
  display: flex;
  height: 100%;
  width: 100%;
}

.editor--textarea {
  border-bottom: none;
  border-top: none;
  display: flex;
  font-family: 'Libre Baskerville', serif;
  height: 100%;
  padding: 12px;
  resize: none;
  width: 100%;
}
</style>
