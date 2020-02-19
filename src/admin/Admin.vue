<template>
  <div class="wrap">
    <h4>This is a restricted Admin page.</h4>
    <hr>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>

<style scoped>
.wrap {
  margin-bottom: 100px;
  padding: 10px;
}
</style>
