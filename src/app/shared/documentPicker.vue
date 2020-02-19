<template>
  <select 
    class="document-dropdown" 
    v-model="documentValue" 
    @change="changeDocument" 
    :disabled="!isOnline"
  >
    <option 
      v-if="!currentDocument" 
      value=""
    >
      No document selected
    </option>
    <option 
      v-for="document in allDocuments" 
      :key="document.guid" 
      :value="document.guid"
    >
      {{ document.name }}
    </option>
  </select>
</template>

<script>
import api from '../api/api'
import { CHANGE_DOCUMENT } from './document.store'
import { Statuses, SET_STATUS_OFFLINE } from './status.store'

export default {
  computed: {
    allDocuments() {
      return this.$store.state.document.ownedDocuments
    },
    currentDocument() {
      return this.$store.state.document.currentDocument
    },
    isOnline() {
      return this.$store.state.status.status !== Statuses.OFFLINE
    },
  },
  data() {
    return {
      documentValue: '',
    }
  },
  mounted() {
    this.documentValue = this.currentDocument ? this.currentDocument.guid : ''
  },
  methods: {
    changeDocument() {
      api.isOnline().then(() => {
        const document = this.allDocuments.find(doc => doc.guid === this.documentValue)

        if (!document || (this.currentDocument && (document.guid === this.currentDocument.guid))) {
          return
        }

        this.$store.dispatch(CHANGE_DOCUMENT, document)
      }, () => {
        this.$store.commit(SET_STATUS_OFFLINE)
        this.documentValue = this.currentDocument.guid
      })
    },
  },
}
</script>

<style scoped>
.document-dropdown {
  background-color: transparent;
  border: none;
  color: #323232;
  font-size: 16px;
  font-weight: bold;
  opacity: 1;
  padding: 4px;
}

.document-dropdown[disabled] {
  opacity: 0.5;
}

.document-dropdown /deep/ option {
  background-color: #FFF;
  color: #323232;
}
</style>
