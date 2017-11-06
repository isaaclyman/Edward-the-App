<template>
<div class="wrap">
  <div class="document">
    <div class="title">
      <h3>
        "{{ fileName }}"
      </h3>
    </div>
    <div class="actions">
      <label class="name-label" for="fileNameInput">Change document name:</label>
      <div>
        <input class="name-input" id="fileNameInput" type="text" v-model="newFileName">
        <button class="button-green" @click="saveFileName()">Save</button>
      </div>
    </div>
    <hr>
    <div class="actions">
      <button class="button-red" @click="deleteFile()">Delete Document</button>
    </div>
  </div>
</div>
</template>

<script>
import swal from 'sweetalert'
import { DELETE_DOCUMENT, UPDATE_FILE_NAME } from '../app/file.store'

export default {
  components: {},
  computed: {
    fileId () {
      return this.$store.state.file.currentFile.id
    },
    fileName () {
      return this.$store.state.file.currentFile.name
    }
  },
  data () {
    return {
      newFileName: ''
    }
  },
  methods: {
    deleteFile () {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure you want to delete this document? All plans, outlines, and chapters will be lost. This cannot be undone.`,
        title: 'Delete Forever?'
      }).then((willDelete) => {
        if (!willDelete) {
          return
        }

        this.$store.dispatch(DELETE_DOCUMENT, { id: this.fileId })
      })
    },
    saveFileName () {
      this.$store.commit(UPDATE_FILE_NAME, { id: this.fileId, name: this.newFileName })
    }
  },
  mounted () {
    this.newFileName = this.fileName
  }
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.document {
  background-color: #FFF;
  border-radius: 5px;
  box-shadow: 0px -2px 12px -4px rgba(0,0,0,0.75);
  display: block;
  flex: 1;
  max-width: 1050px;
  padding: 15px;
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
