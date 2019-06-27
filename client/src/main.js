require('./assets/js/rangetouch')

import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/src/stylus/app.styl'
import './assets/styles/imports.styl'
import VeeValidate from 'vee-validate'

Vue.use(VeeValidate)

import 'intersection-observer'

import VueZoomer from 'vue-zoomer'
import 'vue-zoomer/dist/vue-zoomer.css'

Vue.use(VueZoomer)

import VueClazyLoad from 'vue-clazy-load'

Vue.use(VueClazyLoad)
import fullscreen from 'vue-fullscreen'

Vue.use(fullscreen)
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'

Vue.use(VuePlyr)
import Vuex from 'vuex'

Vue.use(Vuex)
import state from './store/state'
import getters from './store/getters'
import mutations from './store/mutations'
import actions from './store/actions'

const VuexStore = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
})
window.store = VuexStore
window.regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/

window.$ = window.jQuery = require('jquery')

window.axios = require('axios')
window.axios.defaults.baseURL = '/api/'
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

//let token = document.head.querySelector('meta[name="csrf-token"]')
//
//if (token) window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content
//else console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token')

import VueCookies from 'vue-cookies'

Vue.use(VueCookies)
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
import messages from './vue-i18n-locales.js'

const i18n = new VueI18n({
  locale: localStorage.getItem('locale_prefix_lang') || 'en',
  messages,
})

Vue.config.productionTip = false
new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
