<template>
  <div class="wrap">
    <div class="document">
      <div class="title">
        <h1>
          {{ documentName }}
        </h1>
      </div>
      <div class="actions">
        <label 
          class="name-label" 
          for="documentNameInput"
        >Change document name:</label>
        <div>
          <input 
            class="name-input" 
            id="documentNameInput" 
            type="text" 
            v-model="newDocumentName"
          >
          <button 
            class="button-green" 
            @click="saveDocumentName()"
          >
            Save
          </button>
        </div>
      </div>
      <hr>
      <div class="actions">
        <button 
          class="button-red" 
          @click="deleteDocument()"
        >
          Delete Document
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import swal from 'sweetalert'
import { DELETE_DOCUMENT, UPDATE_DOCUMENT_NAME } from '../shared/document.store'

export default {
  components: {},
  computed: {
    documentGuid() {
      return this.$store.state.document.currentDocument.guid
    },
    documentName() {
      return this.$store.state.document.currentDocument.name
    },
  },
  data() {
    return {
      newDocumentName: '',
    }
  },
  methods: {
    deleteDocument() {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: 'Are you sure you want to delete this document? All plans, outlines, and chapters will be lost. This cannot be undone.',
        title: 'Delete Forever?',
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.dispatch(DELETE_DOCUMENT, { guid: this.documentGuid })
      })
    },
    saveDocumentName() {
      this.$store.commit(UPDATE_DOCUMENT_NAME, { guid: this.documentGuid, name: this.newDocumentName })
    },
  },
  mounted() {
    this.newDocumentName = this.documentName
  },
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.document {
  background-color: #F2F9F8;
  display: block;
  height: min-content;
  margin-bottom: 32px;
  max-width: 1050px;
  padding: 32px;
  width: 100%;
}

.actions {
  margin-bottom: 10px;
}

.name-label {
  display: inline-block;
  margin-bottom: 6px;
}

.name-input {
  margin-right: 6px;
}
</style>
