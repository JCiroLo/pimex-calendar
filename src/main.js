import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import firebase from '@/lib/firebase'

Vue.use(VCalendar, {
  componentPrefix: 'vc'
})

Vue.config.productionTip = false

window.db = firebase.db
window.firestore = firebase.firestore

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
