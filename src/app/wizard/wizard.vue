<template>
  <div class="wrap">
    <div class="container">
      <div class="header">
        <h2>Welcome to Edward.</h2>
        <p>
          New here? <a 
            target="_blank" 
            href="https://www.youtube.com/watch?v=OvERL5CPPXM">Watch the introductory video.</a>
        </p>
      </div>
      <div class="content">
        <div v-if="!hasDocuments">
          <p>You haven't created any documents yet.</p>
        </div>
        <div v-if="hasDocuments">
          <h3>Choose a saved document:</h3>
          <div class="document-picker">
            <document-picker/>
          </div>
        </div>
      </div>
      <div class="content">
        <div>
          <h3>Create a new document:</h3>
        </div>
        <div class="types">
          <button 
            class="type" 
            :class="{ 'selected': type === selectedType }"
            v-for="type in documentTypes" 
            :key="type.name"
            @click="selectDocument(type)">
            <div
              class="type-img"
              v-html="type.svg"
            />
            <div>{{ type.name }}</div>
          </button>
        </div>
        <template v-if="selectedType">
          <div class="title">
            <label for="new-document-title">Title</label>
            <input 
              id="new-document-title"
              :placeholder="'My ' + selectedType.name"
              v-model="title"
              @keyup.enter="createDocument()">
          </div>
          <div class="actions">
            <pulse-loader v-if="saving"/>
            <button 
              v-if="!saving" 
              class="button-green" 
              @click="createDocument()" 
              :disabled="!title">
              Create
            </button>
            <p 
              class="error" 
              v-if="error">
              That didn't work. Please try again.
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { SET_UP_DOCUMENT } from '../shared/document.store'
import documentTypes from './documentTypes'
import DocumentPicker from '../shared/documentPicker.vue'
import guid from '../shared/guid'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  components: {
    DocumentPicker,
    PulseLoader,
  },
  computed: {
    hasDocuments() {
      return this.$store.state.document.ownedDocuments.length > 0
    },
    isPremium() {
      return this.$store.state.user.user.isPremium
    },
  },
  data() {
    return {
      documentTypes,
      error: false,
      saving: false,
      selectedType: null,
      title: '',
    }
  },
  methods: {
    createDocument() {
      const type = this.selectedType
      const name = this.title

      if (!type || !name) {
        return
      }

      const newDocument = {
        guid: guid(),
        name,
      }

      this.saving = true
      this.error = false

      this.$store.dispatch(SET_UP_DOCUMENT, { document: newDocument, type }).then(() => {
        this.saving = false
      }, () => {
        this.error = true
        this.saving = false
      })
    },
    selectDocument(type) {
      this.selectedType = type
    },
  },
}
</script>

<style scoped>
.wrap {
  display: block;
  flex: 1;
}

.container {
  background-color: #f0f0f0;
  display: block;
  flex: 1;
  margin: 0 auto;
  max-width: 800px;
  padding: 16px;
}

.header {
  display: flex;
  flex-direction: column;
  height: 75px;
  justify-content: center;
  padding: 0 12px;
}

.header /deep/ p {
  margin: 0;
}

.header /deep/ a {
  font-family: 'Source Serif Pro', sans-serif;
}

.content {
  padding: 12px;
}

.content /deep/ p {
  margin: 0;
}

.document-picker {
  margin-top: 6px;
}

.document-picker select {
  border: 2px solid #323232;
}

.types {
  display: flex;
  margin-top: 8px;
}

.type {
  align-items: center;
  background-color: #F0F0F0;
  border: 2px solid #323232;
  border-radius: 3px;
  color: #323232;
  cursor: pointer;
  display: flex;
  fill: #323232;
  flex-direction: column;
  height: 90px;
  justify-content: center;
  margin-right: 12px;
  transition: background-color 100ms, color 100ms, fill 1000ms;
  padding: 8px;
  width: 90px;
}

.type:not(.selected):hover {
  background-color: #fff;
}

.type.selected {
  background-color: #323232;
  color: #fff;
  fill: #fff;
}

.type-img {
  height: 36px;
}

.title {
  display: flex;
  flex-direction: column;
  margin: 16px 0;
  max-width: 500px;
}

.error {
  color: red;
}
</style>
