import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
} from 'vue-router'

import getRoutes from '../utils/routes'

export function createRouter() {
  return _createRouter({
    // use appropriate history implementation for server/client
    // import.meta.env.SSR is injected by Vite.
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),

    routes: getRoutes([
      {
        path: '/main',
        component: () => import('@/views/Main.vue'),
      },
    ]),
  })
}
