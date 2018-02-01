import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { chapterAutosaverPlugin } from './app/api/chapters.persist'
import composer from './app/composer/composer.store.js'
import chapters from './app/shared/chapters.store.js'
import document, { INIT_DOCUMENTS } from './app/shared/document.store.js'
import status from './app/shared/status.store'
import user from './app/shared/user.store'

const store = new Vuex.Store({
  modules: {
    composer,
    chapters,
    document,
    status,
    user
  },
  plugins: [chapterAutosaverPlugin]
})

store.dispatch(INIT_DOCUMENTS)

export default store
