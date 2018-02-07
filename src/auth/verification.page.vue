<template>
  <div class="wrap">
    <div class="content" v-if="!email">
      <pulse-loader></pulse-loader>
    </div>
    <div class="content" v-if="email">
      <h1>You're almost done.</h1>
      <p>
        Before you can use Edward, you'll need to verify your email address.
        <br>
        This helps protect your identity.
      </p>
      <p>
        <strong>Click the button below to email a verification link to {{email}}.</strong>
      </p>
      <div>
        <button class="button-green" @click="sendLink()" v-if="!sent">
          Send email
        </button>
        <p v-if="sent">
          Email sent.
        </p>
      </div>
      <p>
        Once you get the email, you can click the link to verify your account.
      </p>
      <div>
        <router-link to="/login">
          <button class="button-link">Log out</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import userApi from '../app/api/userApi'

export default {
  components: {
    PulseLoader
  },
  computed: {
    email () {
      return this.user && this.user.email
    },
    user () {
      const meta = this.$route.matched.find(record => record.meta.getCurrentUser).meta
      return meta.getCurrentUser()
    }
  },
  data () {
    return {
      sent: false
    }
  },
  methods: {
    sendLink () {
      userApi.sendVerifyLink()
      this.sent = true
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

.content {
  padding: 0 50px;
}

.button-link {
  padding: 6px 0;
}
</style>
