<template>
  <div>
    <p>
      <strong>Data Recovery</strong>
    </p>
    <div class="pad">
      <p>Enter user ID:</p>
      <input 
        type="number" 
        v-model="userId"
      >
    </div>
    <div v-if="userId">
      <button 
        class="button-green" 
        @click="getBackup()"
      >
        Get backup for this user
      </button>
    </div>
    <div v-if="userId">
      <label for="dataRecoveryUpload">Upload a backup for this user: </label>
      <input 
        id="dataRecoveryUpload" 
        type="file" 
        accept=".json" 
        @change="setFile"
      >
    </div>
  </div>
</template>

<script>
import adminApi from './api'
import FileSaver from 'file-saver'
import swal from 'sweetalert'

export default {
  data() {
    return {
      backupFile: null,
      userId: null,
    }
  },
  methods: {
    getBackup() {
      adminApi.getBackup({ userId: this.userId }).then((backup) => {
        const json = JSON.stringify(backup)
        const blob = new Blob([json], { type: 'application/json' })
        const today = new Date()
        const date = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`

        FileSaver.saveAs(blob, `ADMIN_BACKUP_${this.userId}--${date}.json`)
      })
    },
    importBackup(file) {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const json = reader.result
          const backup = JSON.parse(json)
          adminApi.restoreBackup({ userId: this.userId, documents: backup }).then(() => {
            swal('Backup was restored!')
          }, (err) => {
            throw err
          })
        } catch (e) {
          console.error(e)
        }
      }
      reader.readAsText(file)
    },
    setFile(event) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: 'Are you sure you want to import this file? It will overwrite all of this user\'s content.',
        title: 'Overwrite user content?',
      }).then((willOverwrite) => {
        if (!willOverwrite) {
          return
        }

        this.importBackup(event.target.files[0])
      })
    },
  },
}
</script>

<style scoped>
.pad {
  margin: 6px 0;
}
</style>
