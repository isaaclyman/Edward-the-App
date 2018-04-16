<template>
  <div>
    <div class="actions" v-show="showActions">
      <div class="define-icon" v-html="defineIcon"></div>
      <div class="define-buttons">
        <a class="define-link" :href="gDefineUrl" target="_blank">
          <button class="define-button">Define</button>
        </a>
        <a class="define-link" :href="gSynonymUrl" target="_blank">
          <button class="define-button">Synonyms</button>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import Octicons from 'octicons'

export default {
  components: {},
  computed: {
    gDefineUrl () {
      const urlWord = this.word.trim().replace(/\s+/g, '+')
      return `https://www.google.com/#q=define+${urlWord}`
    },
    gSynonymUrl () {
      const urlWord = encodeURI(this.word.trim())
      return `http://www.thesaurus.com/browse/${urlWord}`
    },
    showActions () {
      return !!this.word.trim()
    }
  },
  data () {
    return {
      defineIcon: Octicons.book.toSVG({
        height: 30,
        width: 30
      }),
      linkIcon: Octicons['link-external'].toSVG({
        height: 20,
        width: 20
      }),
      xIcon: Octicons.x.toSVG({
        height: 20,
        width: 20
      })
    }
  },
  methods: {},
  props: {
    word: {
      required: true
    }
  }
}
</script>

<style scoped>
.actions {
  background-color: rgba(255, 255, 255, 0.9);
  bottom: 0;
  height: 50px;
  pointer-events: auto;
  position: absolute;
  right: 16px;
  width: 50px;
}

.define-icon {
  align-items: center;
  display: flex;
  fill: #444;
  height: 100%;
  justify-content: center;
  opacity: 1;
  transition: opacity 100ms;
  z-index: 1;
}

.actions:hover .define-icon {
  opacity: 0;
}

.define-buttons {
  align-items: flex-end;
  background-color: #FFF;
  bottom: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  position: absolute;
  opacity: 0;
  right: 0;
  transition: opacity 100ms;
  z-index: 10;
}

.actions:hover .define-buttons {
  pointer-events: auto;
  opacity: 1;
}

.define-link {
  width: 100%;
}

.define-button {
  background-color: #CCC;
  border: none;
  border-radius: 0;
  transition: background-color 100ms;
  width: 100%;
}

.define-button:hover {
  background-color: #AAA;
}
</style>
