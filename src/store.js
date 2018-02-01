import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { chapterAutosaverPlugin } from './app/api/chapters.persist'
import composer from './app/composer/composer.store.js'
import chapters from './app/shared/chapters.store.js'
import file, { INIT_FILES } from './app/shared/file.store.js'
import status from './app/shared/status.store'
import user from './app/shared/user.store'

const store = new Vuex.Store({
  modules: {
    composer,
    chapters,
    file,
    status,
    user
  },
  plugins: [chapterAutosaverPlugin]
})

store.dispatch(INIT_FILES)

export default store
