<template>
  <div class="wrap">
    <div class="header">
      Welcome to Sidebar
    </div>
    <div class="content">
      <div class="no-file" v-if="!hasFiles">
        You haven't created any documents yet.
      </div>
      <div class="has-file" v-if="hasFiles">
        Current files:
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  computed: {
    hasFiles () {
      return this.$store.state.file.ownedFiles.length > 0
    }
  },
  data () {
    return {}
  },
  props: {}
}
</script>

<style scoped>

</style>
