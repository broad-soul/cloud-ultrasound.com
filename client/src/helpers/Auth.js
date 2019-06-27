export default {
  init () {
    store.commit('LOGIN')
  },

  login (data) {
    localStorage.setItem('user_id', data.user_id)
    localStorage.setItem('access_token', data.token)
    localStorage.setItem('name', data.name)
    localStorage.setItem('email', data.email)
  },

  logout () {
    localStorage.removeItem('user_id')
    localStorage.removeItem('email')
    localStorage.removeItem('access_token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    $cookies.remove('access_token')
    $cookies.remove('email')
    localStorage.removeItem('foo')
    axios.post('logout')
  },
}
