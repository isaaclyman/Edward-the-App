import Vue from 'vue'
import Router from 'vue-router'

import Analyser from './analyser/analyser.page.vue'
import Composer from './composer/composer.page.vue'
import DocumentEdit from './documentEdit/documentEdit.page.vue'
import Exporter from './exporter/exporter.page.vue'
import Outliner from './outliner/outliner.page.vue'
import Planner from './planner/planner.page.vue'
import Settings from './settings/settings.page.vue'
import WFreeWrite from './workshops/freeWrite.page.vue'

Vue.use(Router)

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
      component: Analyser
    },
    {
      path: '/export',
      name: 'Export',
      component: Exporter
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
      component: WFreeWrite
    }
  ]
})
