export default {
  getUser (state) {
    return state.Auth
  },
  getSidebarStatus (state) {
    return state.darwerSidebar
  },
  mobileWidth () {
    if (window.innerWidth <= 992) {
      return true
    }
  },
  ieDetect() {
    var msie = window.navigator.userAgent.indexOf("MSIE ")
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true
    }
    return false;
  },
  mobileDetect () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
  },
  iosDetect () {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent)
  },
  iPadDetect () {
    return /iPad|iPod/i.test(navigator.userAgent)
  },
  iphoneDetect () {
    return /iPhone/i.test(navigator.userAgent)
  },
  getLang (state) {
    return state.locale
  },
  getSessionsCount (state) {
    return state.sessions_count
  },
  getCurrentSessionsCount (state) {
    return state.current_sessions_count
  },
  getSharedSessionsCount (state) {
    return state.shared_sessions_count
  },
  getCurrentSharedSessionsCount (state) {
    return state.current_shared_sessions_count
  },
  getSidebarActiveWindow (state) {
    return state.sidebar_active_window
  },
  getSessions (state) {
    return state.sessions
  },
  getSharedSessions (state) {
    return state.shared_sessions
  },
  getIntervalSessionsUpdate (state) {
    return state.interval_sessions_update
  },
  getSessionsLength (state) {
    return state.all_sessions_length
  },
  getAllSessions (state) {
    return state.all_sessions
  },
  getSearching (state) {
    return state.searching
  },
  getSearchInfo (state) {
    return state.search
  },
  getSessionId (state) {
    return state.session_id
  },
  getStatusUpdateFiles (state) {
    return state.status_update_files
  },
  getComputerScale (state) {
    return state.initialComputerScale
  },
  getInstallPrompt (state) {
    return state.installPrompt
  },
  getCanInstallPrompt (state) {
    return 'BeforeInstallPromptEvent' in window &&
      state.installPrompt instanceof BeforeInstallPromptEvent
  },
  getHeaderAuthorization () {
    axios.defaults.headers.Authorization = 'Bearer ' + store.state.Auth.token
  },
}
