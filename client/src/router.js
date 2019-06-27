import Vue from 'vue'
import Router from 'vue-router'

const Main = () => import('./views/Main')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '*',
      name: 'not-found',
      component: () => import('./views/404'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home'),
    },
    {
      path: '/doctor',
      name: 'doctor',
      component: Main,
      meta: { needsAuthorization: true },
    },
    {
      path: '/patient',
      name: 'patient',
      component: Main,
      meta: { needsAuthorization: true },
    },
    {
      path: '/guest',
      name: 'guest',
      component: Main,
      meta: { needsAuthorization: true },
    },
    {
      path: '/password/recovery',
      name: 'password-recovery',
      component: () => import('./views/PasswordRecovery'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  let role = store.state.Auth.role
  if (to.matched.some(record => record.meta.needsAuthorization)) {
    if (((new Date().getTime() / 1000) - localStorage.getItem('foo')) > 30) {
      store.getters.getHeaderAuthorization
      store.dispatch('destroyToken')
      next('/')
    } else {
      store.dispatch('isAuthorized').then(() => to.name == role ? next() : next('/' + role)).catch(() => {
        store.dispatch('clear_login_info')
        next('/')
      })
    }
  } else next()
})

export default router
