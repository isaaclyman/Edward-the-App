<template>
  <div class="wrap">
    <div class="not-found">
      <h3>Something went wrong.</h3>
      <p>
        This page doesn't exist. If you're having trouble with the app, please contact us at
        <a href="mailto:support@edwardtheapp.com">support@edwardtheapp.com</a>.
      </p>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.not-found {
  display: block;
  flex: 1;
  max-width: 1050px;
}
</style>
