import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Greeting',
    component: () =>
      import(/* webpackChunkName: "greeting" */ '../views/Greeting.vue')
  },
  {
    path: '/:boardName/:eventId',
    name: 'Calendar',
    component: () =>
      import(/* webpackChunkName: "calendar" */ '../views/Calendar/index.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
