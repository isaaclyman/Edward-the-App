<template>
  <div class="wrap">
    <div class="delete">
      <h1>Is this goodbye?</h1>
      <p>
        All your data will be lost permanently. <strong>There is no way to undo this.</strong>
        If you want to keep your documents, you should download them first.
      </p>
      <p>To continue, type your account password below and click "Delete my account".</p>
      <div class="actions">
        <input class="password-input" type="password" v-model="password" autocomplete="off">
        <button class="button-red" @click="deleteAccount">Delete my account</button>
      </div>
      <div class="cancel">
        <router-link to="/account">
          <button class="button-link">Never mind, go back</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'

export default {
  data () {
    return {
      password: ''
    }
  },
  methods: {
    deleteAccount () {
      authApi.deleteAccount({ password: this.password })
    }
  }
}
</script>

<style scoped>
.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.delete {
  max-width: 1200px;
  padding: 0 50px;
  width: 100%;
}

.actions {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.password-input {
  margin-bottom: 12px;
  width: 300px;
}
</style>
