<template>
  <div class="composer">
    <div class="editor">

    </div>
    <div class="map">

    </div>
    <div class="sidebar">

    </div>
  </div>
</template>

<script>
export default {
  beforeCreate () {

  },
  components: {},
  computed: {},
  data () {
    return {}
  },
  name: 'composer',
  props: {}
}
</script>

<style scoped>
.composer {
  display: flex;
  flex: 1;
  min-height: 300px;
}

.editor {
  display: flex;
  flex: 1;
}

.map {
  display: flex;
  height: 100%;
  width: 120px;
}

.sidebar {
  display: flex;
  height: 100%;
  width: 300px;
}

/* MOBILE */
@media (max-width: 500px) {
  .map {
    display: none;
  }
}
</style>
