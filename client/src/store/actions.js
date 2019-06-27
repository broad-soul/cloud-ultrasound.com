export default {
  toggleSidebarMenu ({ commit }, val) {
    commit('CHANGE_SIDEBAR_STATUS', val)
  },
  setLang ({ commit }, locale) {
    commit('SET_LANG', locale)
  },
  updateSessionsCount ({ commit }, locale) {
    commit('SET_NUM_ALL_SESSIONS', locale)
  },
  updateCurrentSessionsCount ({ commit }, locale) {
    commit('SET_NUM_CURRENT_SESSIONS', locale)
  },
  updateSharedSessionsCount ({ commit }, locale) {
    commit('SET_NUM_ALL_SHARED_SESSIONS', locale)
  },
  updateCurrentSharedSessionsCount ({ commit }, locale) {
    commit('SET_NUM_CURRENT_SHARED_SESSIONS', locale)
  },
  changeSidebarActiveWindow ({ commit }, locale) {
    commit('SET_NUM_SIDEBAR_ACTIVE_WINDOW', locale)
  },
  updateSessions ({ commit }, locale) {
    commit('SET_SESSIONS', locale)
  },
  updateSharedSessions ({ commit }, locale) {
    commit('SET_SHARED_SESSIONS', locale)
  },
  updateAllSessionsLength ({ commit }, locale) {
    commit('SET_ALL_SESSIONS_LENGTH', locale)
  },
  updateAllSessions ({ commit }, locale) {
    commit('SET_ALL_SESSIONS', locale)
  },
  setSearching ({ commit }, locale) {
    commit('SET_SEARCHING', locale)
  },
  updateSearchInfo ({ commit }, locale) {
    commit('SET_SEARCH_INFO', locale)
  },
  updateSessionId ({ commit }, locale) {
    commit('SET_SESSION_ID', locale)
  },
  changeStatusUpdateFiles ({ commit }, locale) {
    commit('SET_STATUS_UPDATE_FILES', locale)
  },
  changeComputerScale ({ commit }, locale) {
    commit('SET_COMPUTER_SCALE', locale)
  },
  onVisibilityChange ({ commit }, callback) {
    var visible = true

    if (!callback) {
      throw new Error('no callback given')
    }

    function focused () {
      if (!visible) {
        callback(visible = true)
      }
    }

    function unfocused () {
      if (visible) {
        callback(visible = false)
      }
    }

    // Standards:
    if ('hidden' in document) {
      document.addEventListener('visibilitychange',
        function () {(document.hidden ? unfocused : focused)()})
    } else if ('mozHidden' in document) {
      document.addEventListener('mozvisibilitychange',
        function () {(document.mozHidden ? unfocused : focused)()})
    } else if ('webkitHidden' in document) {
      document.addEventListener('webkitvisibilitychange',
        function () {(document.webkitHidden ? unfocused : focused)()})
    } else if ('msHidden' in document) {
      document.addEventListener('msvisibilitychange',
        function () {(document.msHidden ? unfocused : focused)()})
    } else if ('onfocusin' in document) {
      // IE 9 and lower:
      document.onfocusin = focused
      document.onfocusout = unfocused
    } else {
      // All others:
      window.onpageshow = window.onfocus = focused
      window.onpagehide = window.onblur = unfocused
    }
  },
  setInstallPrompt ({ commit }, locale) {
    commit('SET_INSTALL_PROMPT', locale)
  },
  async isAuthorized () {
    store.getters.getHeaderAuthorization
    return await axios.get('get_user')
  },
  clear_login_info () {
    localStorage.removeItem('user_id')
    localStorage.removeItem('email')
    localStorage.removeItem('access_token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
  },
  destroyToken () {
    localStorage.removeItem('user_id')
    localStorage.removeItem('email')
    localStorage.removeItem('access_token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    $cookies.remove('access_token')
    $cookies.remove('email')
    localStorage.removeItem('foo')
    clearInterval(this.getIntervalSessionsUpdate)
    axios.post('logout')
  },
}
