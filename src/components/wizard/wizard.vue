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
          <file-picker></file-picker>
        </div>
      </div>
      <div class="content">
        <div>
          <p>Create a new document:</p>
        </div>
        <div class="types">
          <button class="type" v-for="type in documentTypes" :key="type.name" @click="createDocument(type)">
            <div v-html="type.svg"></div>
            <div>{{ type.name }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import documentTypes from './documentTypes'

export default {
  components: {},
  computed: {
    hasFiles () {
      return this.$store.state.file.ownedFiles.length > 0
    }
  },
  data () {
    return {
      documentTypes
    }
  },
  methods: {
    createDocument (type) {

    }
  },
  props: {}
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

.types {
  display: flex;
  margin-top: 8px;
}

.type {
  align-items: center;
  background-color: #FFF;
  border: 1px solid #CCC;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 6px;
  transition: background-color 200ms;
  padding: 8px;
}

.type:hover {
  background-color: #F0F0F0;
}
</style>
