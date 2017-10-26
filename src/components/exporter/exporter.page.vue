<template>
  <div class="wrap">
    <div class="exporter">
      <h3>Export to Microsoft Word format (.docx)</h3>
      <button class="button-green" @click="exportDocxChapters()">
        Export all chapters
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    exportDocxChapters () {
      
    }
  }
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.exporter {
  display: block;
  flex: 1;
  max-width: 1050px;
}
</style>
