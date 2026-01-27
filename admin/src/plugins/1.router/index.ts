import { setupLayouts } from 'virtual:meta-layouts'
import type { App } from 'vue'

import type { RouteRecordRaw } from 'vue-router/auto'

import { createRouter, createWebHistory } from 'vue-router/auto'
import { canNavigate } from '@layouts/plugins/casl'

function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])

    return route
  }

  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
  extendRoutes: pages => [
    ...[...pages].map(route => recursiveLayouts(route)),
  ],
})

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach(to => {
  const isLoggedIn = !!(useCookie('userData').value && useCookie('accessToken').value)

  if (to.meta.unauthenticatedOnly) {
    if (isLoggedIn)
      return '/'
    else
      return undefined
  }

  if (!canNavigate(to)) {
    if (!isLoggedIn)
      return { name: 'login' } as any

    // If logged in => not authorized
    return { name: 'not-authorized' } as any
  }
})

export { router }

export default function (app: App) {
  app.use(router)
}
