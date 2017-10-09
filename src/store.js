import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

import composer from './components/composer/composer.store.js'
import chapters from './components/app/chapters.store.js'
import file from './components/app/file.store.js'

const store = new Vuex.Store({
  modules: {
    composer,
    chapters,
    file
  },
  plugins: [createPersistedState()]
})

export default store
