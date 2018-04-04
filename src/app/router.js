import Vue from 'vue'
import Router from 'vue-router'

import Composer from './composer/composer.page.vue'
import DocumentEdit from './documentEdit/documentEdit.page.vue'
import Outliner from './outliner/outliner.page.vue'
import Planner from './planner/planner.page.vue'
import Settings from './settings/settings.page.vue'
import WFreeWrite from './workshops/freeWrite.page.vue'

import userApi from './api/userApi'

Vue.use(Router)

const assertPremium = (to, from, next) => {
  userApi.getUser().then(user => {
    if (user.isPremium) {
      next()
    } else {
      next({ path: '/write' })
    }
  }, err => {
    console.error(err)
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/write'
    },
    {
      path: '/plan',
      name: 'Plan',
      component: Planner
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
      component: () => import('./analyser/analyser.page.vue')
    },
    {
      path: '/export',
      name: 'Export',
      component: () => import('./exporter/exporter.page.vue')
    },
    {
      path: '/documentEdit',
      name: 'Document Edit',
      component: DocumentEdit
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/workshop/free-write',
      name: 'Free Write',
      component: WFreeWrite,
      beforeEnter: assertPremium
    }
  ]
})
