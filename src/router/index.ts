import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LayoutView from '../views/LayoutView.vue'
import SessionView from '../views/SessionView.vue'
import PreviewView from '../views/PreviewView.vue'

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/layout', name: 'layout', component: LayoutView },
    { path: '/session/:layout', name: 'session', component: SessionView },
    { path: '/preview', name: 'preview', component: PreviewView },
  ],
})

export default router