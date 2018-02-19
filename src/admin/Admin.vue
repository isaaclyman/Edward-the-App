<template>
  <div class="wrap">
    <h4>This is a restricted Admin page.</h4>
    <hr>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  }
}
</script>

<style scoped>
.wrap {
  padding: 10px;
}
</style>
