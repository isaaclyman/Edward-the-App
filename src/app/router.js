import Vue from 'vue'
import Router from 'vue-router'

import NotFound from './NotFound.vue'

import Composer from './composer/composer.page.vue'
import DocumentEdit from './documentEdit/documentEdit.page.vue'
import Outliner from './outliner/outliner.page.vue'
import Planner from './planner/planner.page.vue'
import Search from './search/search.page.vue'
import Settings from './settings/settings.page.vue'

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
      path: '/search',
      name: 'Search',
      component: Search
    },
    {
      path: '/workshop/free-write',
      name: 'Free Write',
      component: () => import('./workshops/freeWrite.page.vue'),
      beforeEnter: assertPremium
    },
    {
      path: '/workshop/novel-quickstart',
      name: 'Novel Quickstart',
      component: () => import('./workshops/novelQuickstart.page.vue'),
      beforeEnter: assertPremium
    },
    {
      path: '/workshop/unblock',
      name: `Writer's Unblock`,
      component: () => import('./workshops/writersUnblock.vue'),
      beforeEnter: assertPremium
    },
    {
      path: '*',
      name: 'Page does not exist',
      component: NotFound
    }
  ]
})
