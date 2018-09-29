import Vue from 'vue'
import Vuex from 'vuex'

import { chapterAutosaverPlugin } from './app/api/chapters.persist'
import composer from './app/composer/composer.store.js'
import chapters from './app/shared/chapters.store.js'
import document from './app/shared/document.store.js'
import status from './app/shared/status.store'
import user from './app/shared/user.store'
import workshop from './app/shared/workshops.store'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    composer,
    chapters,
    document,
    status,
    user,
    workshop,
  },
  plugins: [chapterAutosaverPlugin],
})

export default store
