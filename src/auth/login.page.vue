<template>
  <div class="wrap">
    <h3 class="signup-message">
      Edward is out of business.
    </h3>
  </div>
</template>

<script>
export default {
  
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
  margin-bottom: 20px;
}

.sign-up {
  font-size: 20px;
  font-weight: bold;
  width: 100%;
}

.sign-up .button-link {
  padding: 0 3px;
}

.username, .password {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  margin-bottom: 32px;
  width: 100%;
}

.username label, .password label {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: left;
  width: 100%;
}

.username input, .password input {
  border: 2px solid #323232;
  border-radius: 6px;
  color: #323232;
  font-size: 20px;
  font-weight: bold;
  height: 64px;
  padding: 18px 16px;
  text-align: left;
  width: 100%;
}

input::placeholder {
  color: #323232;
  font-size: 20px;
  font-weight: bold;
}

.forgot-password {
  margin-bottom: 32px;
}

.forgot-password, .forgot-password button {
  font-size: 20px;
  font-weight: bold;
  padding: 0 3px;
}

.login-field {
  width: 300px;
}

.captcha {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 32px;
  width: 100%;
}

.messages {
  align-items: center;
  color: #DA0000;
  display: flex;
  font-size: 20px;
  font-weight: bold;
  justify-content: center;
  margin: 0;
  margin-bottom: 32px;
  width: 100%;
}

.actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 32px;
  width: 100%;
}

hr {
  margin-bottom: 32px;
}
</style>
