import Vue from 'vue'
import Router from 'vue-router'

import Analyser from '../components/analyser/analyser.page.vue'
import Composer from '../components/composer/composer.page.vue'
import Outliner from '../components/outliner/outliner.page.vue'
import Tools from '../components/tools/tools.page.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/write'
    },
    {
      path: '/outline',
      name: 'Outline',
      component: Outliner
    },
    {
      path: '/write',
      name: 'Write',
      component: Composer
    },
    {
      path: '/analyze',
      name: 'Analyze',
      component: Analyser
    },
    {
      path: '/tools',
      name: 'Tools',
      component: Tools
    }
  ]
})
