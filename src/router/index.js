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
    path: '/verify/:meetingId',
    component: () =>
      import(
        /* webpackChunkName: "greeting" */ '../views/VerifyEvent/index.vue'
      )
  },
  {
    path: '/cancel/:meetingId',
    component: () =>
      import(
        /* webpackChunkName: "greeting" */ '../views/CancelEvent/index.vue'
      )
  },
  ,
  {
    path: '/reschedule/:meetingId',
    name: 'Calendar',
    component: () =>
      import(
        /* webpackChunkName: "calendar" */ '../views/RescheduleEvent/index.vue'
      )
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
