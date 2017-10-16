<template>
<div class="wrap">
  <div class="sign-up">
    <div class="sign-up-text">Don't have an account?</div>
    <button class="button-link" @click="signUp()">Sign up for free.</button>
  </div>
  <hr class="divider">
  <div class="username">
    <label for="login-username-input">Email address:</label>
    <input id="login-username-input" class="login-field" type="text" v-model="username">
  </div>
  <div class="password">
    <label for="login-password-input">Password:</label>
    <input id="login-password-input" class="login-field" type="password" v-model="password">
  </div>
  <div class="actions">
    <button class="button-green" @click="logIn()">Log In</button>
  </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      password: '',
      username: ''
    }
  },
  methods: {
    logIn () {
      
    },
    signUp () {
      this.$router.push('/signup')
    }
  }
}
</script>

<style scoped>
.wrap {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 16px;
  justify-content: center;
}

.sign-up {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
}

.sign-up-text {
  display: flex;
  justify-content: center;
}

.divider {
  background-color: #CCC;
  height: 1px;
  margin: 0;
  width: 100%;
}

.username, .password {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 20px 0;
  width: 100%;
}

.login-field {
  border: none;
  border-bottom: 1px solid #e8cc84;
  width: 300px;
}

.actions {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
