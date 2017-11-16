import Vue from 'vue'
import Router from 'vue-router'

import Analyser from '../components/analyser/analyser.page.vue'
import Composer from '../components/composer/composer.page.vue'
import DocumentEdit from '../components/documentEdit/documentEdit.page.vue'
import Exporter from '../components/exporter/exporter.page.vue'
import Outliner from '../components/outliner/outliner.page.vue'
import Planner from '../components/planner/planner.page.vue'
import Settings from '../components/settings/settings.page.vue'

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
    }
  ]
})
