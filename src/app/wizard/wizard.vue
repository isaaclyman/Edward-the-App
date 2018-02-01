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
        <div v-if="!hasFiles">
          <p>You haven't created any documents yet.</p>
        </div>
        <div v-if="hasFiles">
          <p>Choose a saved document:</p>
          <div class="file-picker-wrap">
            <file-picker></file-picker>
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
            <button class="button-green" @click="createDocument()" :disabled="!title">
              Create
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { SET_UP_DOCUMENT } from '../shared/file.store'
import documentTypes from './documentTypes'
import FilePicker from '../shared/filePicker.vue'
import guid from '../shared/guid'

export default {
  components: {
    FilePicker
  },
  computed: {
    hasFiles () {
      return this.$store.state.file.ownedFiles.length > 0
    }
  },
  data () {
    return {
      documentTypes,
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

      const newFile = {
        id: guid(),
        name
      }

      this.$store.dispatch(SET_UP_DOCUMENT, { file: newFile, type })
    },
    selectDocument (type) {
      this.selectedType = type
    }
  }
}
</script>

<style scoped>
.wrap {
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
}

.container {
  background-color: #FFF;
  border-radius: 3px;
  box-shadow: 0px 0px 15px 2px rgba(136,136,136,1);
  display: block;
  flex: 1;
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

.file-picker-wrap {
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
</style>
