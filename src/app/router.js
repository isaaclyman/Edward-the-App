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
import api from './api/api'

Vue.use(Router)

const assertPremium = () => {
  return userApi.getUser().then(user => {
    if (user.isPremium) {
      return true
    } else {
      throw new Error('Can\'t access this route with a Limited account.')
    }
  })
}

const assertOnline = () => {
  return api.isOnline().then(
    () => true,
    () => {
      throw new Error('Can\'t access this route while offline.')
    }
  )
}

/*
We can't use next(false) in any guard because there's no global hook that's called
 when navigation is cancelled. This would leave the app in a 'loading' state forever
 (see App.vue). Instead, we need to use next(error) to cancel navigation.
*/
const compose = (...guards) => {
  return function (to, from, next) {
    const guardPromises = guards.map(guard => guard())
    Promise.all(guardPromises).then((...results) => {
      const blocks = results.filter(res => res !== true)
      if (blocks.length === 0) {
        return next()
      }

      const nav = results.filter(res => typeof res === 'object')[0]
      if (nav) {
        return next(nav)
      }

      return next(new Error('Navigation was not allowed.'))
    }, err => {
      return next(err)
    })
  }
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
      component: () => import('./analyser/analyser.page.vue'),
      beforeEnter: compose(assertOnline)
    },
    {
      path: '/export',
      name: 'Export',
      component: () => import('./exporter/exporter.page.vue'),
      beforeEnter: compose(assertOnline)
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
      beforeEnter: compose(assertOnline, assertPremium)
    },
    {
      path: '/workshop/novel-quickstart',
      name: 'Novel Quickstart',
      component: () => import('./workshops/novelQuickstart.page.vue'),
      beforeEnter: compose(assertOnline, assertPremium)
    },
    {
      path: '/workshop/unblock',
      name: `Writer's Unblock`,
      component: () => import('./workshops/writersUnblock.vue'),
      beforeEnter: compose(assertOnline, assertPremium)
    },
    {
      path: '/workshop/plot',
      name: `Plot Workshop`,
      component: () => import('./workshops/plotWorkshop.vue'),
      beforeEnter: compose(assertOnline, assertPremium)
    },
    {
      path: '*',
      name: 'Page does not exist',
      component: NotFound
    }
  ]
})
