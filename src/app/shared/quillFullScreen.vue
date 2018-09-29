<template>
  <div class="full-screen-wrap full-screen">
    <div class="actions">
      <button 
        v-show="!isWideView" 
        class="action wide-view" 
        v-html="wideSvg" 
        @click="showWideView()"
        title="Wide view" 
        v-tooltip/>
      <button 
        v-show="isWideView" 
        class="action narrow-view" 
        v-html="narrowSvg" 
        @click="showNarrowView()"
        title="Book-width view" 
        v-tooltip/>
      <button 
        class="action close" 
        v-html="exitSvg" 
        @click="close()"/>
    </div>
    <div 
      class="container" 
      :class="{ 'wide': isWideView }" 
      ref="container">
      <div 
        class="editor" 
        ref="editor"/>
    </div>
  </div>
</template>

<script>
import Cache from './cache'
import createQuill from './quillBuilder'
import debounce from 'lodash/debounce'
import Octicons from 'octicons'
import tooltip from './tooltip.directive'

const width = new Cache('FULL_SCREEN_EDITOR_WIDTH')

export default {
  beforeDestroy() {
    this.handlers.forEach(([name, fn]) => this.quill.off(name, fn))
  },
  data() {
    return {
      exitSvg: Octicons.x.toSVG({
        height: 30,
        width: 30,
      }),
      handlers: [],
      isWideView: false,
      narrowSvg: Octicons['screen-normal'].toSVG({
        height: 30,
        width: 30,
      }),
      quill: null,
      wideSvg: Octicons['screen-full'].toSVG({
        height: 30,
        width: 30,
      }),
    }
  },
  directives: {
    tooltip,
  },
  methods: {
    close() {
      this.$emit('close')
    },
    emitContent(content, contentId) {
      this.$emit('update:content', { content, contentId })
    },
    emitSelection(selection) {
      this.$emit('update:selection', selection)
    },
    listenQuill(quill) {
      const textChanged = debounce((content, contentId) => {
        this.emitContent(content, contentId)
      }, 750, { maxWait: 2000 })

      const onTextChange = () => {
        const content = quill.getContents()
        const contentId = this.contentId
        textChanged(content, contentId)
      }

      const onSelectionChange = debounce((range) => {
        if (!range) {
          return
        }

        let selection
        if (!range.length) {
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

        this.emitSelection(selection)
      }, 500)

      quill.on('text-change', onTextChange)
      quill.on('selection-change', onSelectionChange)

      this.handlers.push(['text-change', onTextChange], ['selection-change', onSelectionChange])
    },
    showNarrowView() {
      this.isWideView = false
      width.cacheSet(false)
    },
    showWideView() {
      this.isWideView = true
      width.cacheSet(true)
    },
    updateQuill(quill, content) {
      if (content) {
        quill.setContents(content, 'api')
      }
    },
  },
  mounted() {
    this.isWideView = width.cacheGet() || false

    this.quill = createQuill(
      this.$refs.editor,
      'Write here.',
      this.$refs.container,
    )

    this.updateQuill(this.quill, this.content)
    this.listenQuill(this.quill)
  },
  props: {
    content: {
      required: true,
      type: Object
    },
    contentId: {
      default: null,
      required: false,
      type: String
    },
  },
}
</script>

<style scoped>
.full-screen-wrap {
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
  padding: 20px 0;
  width: 100%;
}

.container.wide {
  max-width: 1000px;
}
</style>
