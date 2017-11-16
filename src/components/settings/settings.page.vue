<template>
<div class="wrap">
  <div class="settings">
    <div class="title">
      <h3>Account</h3>
    </div>
    <div class="change-email">
      <input class="email" v-model="account.email" :disabled="!editingEmail">
      <button class="button-link" v-if="notDemo" @click="editEmail()" :disabled="editingEmail">
        Edit
      </button>
      <button class="button-green" v-if="notDemo" @click="saveEmail()" :disabled="!editingEmail">
        Save
      </button>
    </div>
  </div>
</div>
</template>

<script>
import { UPDATE_EMAIL } from '../app/user.store'

export default {
  components: {},
  computed: {
    notDemo () {
      return this.$store.state.user.user.accountType.name !== 'DEMO'
    },
    user () {
      return this.$store.state.user.user
    },
    userPromise () {
      return this.$store.state.user.userPromise
    }
  },
  data () {
    return {
      account: {
        email: '',
        password: '************'
      },
      editingEmail: false
    }
  },
  methods: {
    editEmail () {
      this.editingEmail = true
    },
    saveEmail () {
      this.$store.commit(UPDATE_EMAIL, { email: this.account.email })
      this.editingEmail = false
    }
  },
  mounted () {
    this.userPromise.then(() => {
      this.account.email = this.user.email
    })
  }
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.settings {
  background-color: #FFF;
  border-radius: 5px;
  box-shadow: 0px -2px 12px -4px rgba(0,0,0,0.75);
  display: block;
  flex: 1;
  max-width: 1050px;
  padding: 15px;
}

.email {
  min-width: 250px;
}
</style>
