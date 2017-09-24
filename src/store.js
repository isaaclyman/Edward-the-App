import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

import composer from './components/composer/composer.store.js'

const store = new Vuex.Store({
  modules: {
    composer
  },
  plugins: [createPersistedState()]
})

export default store
