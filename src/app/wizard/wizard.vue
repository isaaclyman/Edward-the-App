<template>
  <div class="wrap">
    <div class="container">
      <div class="header">
        <p>
          <strong>Welcome to Edward.</strong>
        </p>
        <p>
          New here? <a href="http://isaaclyman.com/blog/tags/edward/">Read the documentation.</a>
        </p>
      </div>
      <div class="content border-bottom">
        <div v-if="!hasDocuments">
          <p>You haven't created any documents yet.</p>
        </div>
        <div v-if="hasDocuments">
          <p>Choose a saved document:</p>
          <div class="document-picker-wrap">
            <document-picker></document-picker>
          </div>
        </div>
      </div>
      <div class="content">
        <div>
          <p>Create a new document:</p>
        </div>
        <div class="types">
          <button class="type" :class="{ 'selected': type === selectedType }"
                  v-for="type in documentTypes" :key="type.name"
                  @click="selectDocument(type)">
            <div v-html="type.svg"></div>
            <div>{{ type.name }}</div>
          </button>
        </div>
        <template v-if="selectedType">
          <div class="title">
            <label for="new-document-title">{{selectedType.name}} title:</label>
            <input id="new-document-title" v-model="title">
          </div>
          <div class="actions">
            <pulse-loader v-if="saving"></pulse-loader>
            <button v-if="!saving" class="button-green" @click="createDocument()" :disabled="!title">
              Create
            </button>
            <p class="error" v-if="error">
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
    PulseLoader
  },
  computed: {
    hasDocuments () {
      return this.$store.state.document.ownedDocuments.length > 0
    }
  },
  data () {
    return {
      documentTypes,
      error: false,
      saving: false,
      selectedType: null,
      title: ''
    }
  },
  methods: {
    createDocument () {
      const type = this.selectedType
      const name = this.title

      if (!type || !name) {
        return
      }

      const newDocument = {
        guid: guid(),
        name
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
    selectDocument (type) {
      this.selectedType = type
    }
  }
}
</script>

<style scoped>
.wrap {
  display: block;
  flex: 1;
}

.container {
  background-color: #FFF;
  border-radius: 3px;
  box-shadow: 0px 0px 15px 2px rgba(136,136,136,1);
  display: block;
  flex: 1;
  margin: 0 auto;
  max-width: 800px;
}

.header {
  border-bottom: 1px solid #CCC;
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
  font-family: 'Khula', sans-serif;
}

.content {
  padding: 12px;
}

.content /deep/ p {
  margin: 0;
}

.border-bottom {
  border-bottom: 1px solid #CCC;
}

.document-picker-wrap {
  margin-top: 6px;
}

.types {
  display: flex;
  margin-top: 8px;
}

.type {
  align-items: center;
  background-color: #FFF;
  border: 2px solid #CCC;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 90px;
  justify-content: center;
  margin-right: 6px;
  transition: background-color 100ms;
  padding: 8px;
  width: 90px;
}

.type:hover {
  background-color: #F0F0F0;
}

.type.selected {
  background-color: #F0F0F0;
  border-color: #8bc34a;
}

.title {
  display: flex;
  flex-direction: column;
  margin: 8px 0;
  max-width: 500px;
}

.error {
  color: red;
}
</style>
