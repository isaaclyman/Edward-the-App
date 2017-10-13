import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { chapterAutosaverPlugin } from './components/app/chapters.persist'
import composer from './components/composer/composer.store.js'
import chapters from './components/app/chapters.store.js'
import file, { INIT_FILES } from './components/app/file.store.js'

const store = new Vuex.Store({
  modules: {
    composer,
    chapters,
    file
  },
  plugins: [chapterAutosaverPlugin]
})

store.dispatch(INIT_FILES)

export default store
