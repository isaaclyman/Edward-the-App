<template>
  <div class="wrap">
    <h3 class="signup-message">
      Edward is no longer accepting new signups.
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
  justify-content: flex-start;
  padding: 12px;
  width: 100%;
}

.signup-message {
  color: #323232;
  font-size: 34px;
  font-weight: normal;
  margin-bottom: 32px;
  margin-top: 0;
}

.signup-section {
  display: flex;
  margin-bottom: 12px;
  width: 100%;
}

.signup-field {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.signup-label {
  display: block;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  width: 200px;
}

.signup-input {
  border: 2px solid #323232;
  border-radius: 6px;
  color: #323232;
  font-size: 20px;
  font-weight: bold;
  height: 64px;
  margin-bottom: 32px;
  padding: 18px 16px;
  text-align: left;
  width: 100%;
}

input::placeholder {
  color: #323232;
  font-size: 20px;
  font-weight: bold;
}

.signup-input.invalid {
  border-color: #DA0000;
}

.field-info {
  border: none;
  height: 29px;
  width: 29px;
}

.field-info.invalid {
  fill: red;
}

.signup-textarea {
  flex: 1;
  height: 140px;
  resize: none;
}

.message {
  color: #DA0000;
  height: 20px;
  margin: 8px 0;
}

.message-text {
  font-size: 12px;
  margin: 0;
}

.legal {
  margin-bottom: 32px;
}

.legal, .legal a {
  color: #323232;
  font-size: 20px;
  font-weight: bold;
}

.divider {
  margin: 32px 0;
  width: 100%;
}

.log-in {
  display: block;
  font-size: 20px;
  font-weight: bold;
  width: 100%;
}

.log-in-link {
  padding: 0 3px;
}

</style>
