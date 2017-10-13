<template>
  <div class="wrap">
    <div class="container">
      <div class="header">
        <p>
          <strong>Welcome to Sidebar.</strong>
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
import { ADD_FILE, CHANGE_FILE } from '../app/file.store'
import documentTypes from './documentTypes'
import FilePicker from '../app/filePicker.vue'
import guid from '../app/guid'
import { LOAD_CONTENT } from '../app/chapters.store'

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

      this.$store.commit(ADD_FILE, newFile)
      this.$store.dispatch(CHANGE_FILE, newFile)

      const chapters = type.chapters.map(title => ({
        archived: false,
        content: null,
        id: guid(),
        title,
        topics: {}
      }))

      const topics = type.topics.map(title => ({
        archived: false,
        id: guid(),
        title
      }))

      this.$store.commit(LOAD_CONTENT, { chapters, topics })
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
  align-items: center;
  border-bottom: 1px solid #CCC;
  display: flex;
  height: 48px;
  padding: 0 12px;
}

.header /deep/ p {
  margin: 0;
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
  transition: background-color 200ms;
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
