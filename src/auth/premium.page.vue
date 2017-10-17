<template>
  <div class="wrap">
    <p>Getting a premium Author account is a great idea. You'll get:</p>
    <ul>
      <li>Permanent storage of all your documents on our servers.</li>
      <li>Unlimited access to any of your documents, from any computer.</li>
      <li>The warm, fuzzy feeling of supporting an app you love.</li>
    </ul>
    <p>We'll get:</p>
    <ul>
      <li>Two dollars.</li>
    </ul>
    <p>The full price is $2.46 / month. $2.00 for us, $0.46 for taxes and fees.</p>
    <p>
      Ready to get started? You'll be redirected to another page to enter your credit card number.
    </p>
    <button class="button-green" @click="goPremium()">
      Get my Author account
    </button>
    <button class="button-link" @click="noPremium()">
      No thanks, just go to the app
    </button>
  </div>
</template>

<script>
import { goToApp } from './shared'

export default {
  data () {
    return {}
  },
  methods: {
    goPremium () {
      // Go to Stripe to make the payment
    },
    noPremium () {
      goToApp()
    }
  },
  props: {}
}
</script>

<style scoped>

</style>
