import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

import composer from './components/composer/composer.store.js'
import outliner from './components/outliner/outliner.store.js'

const store = new Vuex.Store({
  modules: {
    composer,
    outliner
  },
  plugins: [createPersistedState()]
})

export default store
