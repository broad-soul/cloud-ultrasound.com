export default {
  LOGIN (state) {
    state.Auth.user_id = localStorage.getItem('user_id')
    state.Auth.token = localStorage.getItem('access_token')
    state.Auth.name = localStorage.getItem('name')
    state.Auth.email = localStorage.getItem('email')
    state.Auth.role = localStorage.getItem('role')
  },
  CHANGE_SIDEBAR_STATUS (state, val) {
    state.darwerSidebar = val
  },
  SET_LANG (state, locale) {
    state.locale = locale
  },
  SET_NUM_ALL_SESSIONS (state, locale) {
    state.sessions_count = locale
  },
  SET_NUM_CURRENT_SESSIONS (state, locale) {
    state.current_sessions_count = locale
  },
  SET_NUM_ALL_SHARED_SESSIONS (state, locale) {
    state.shared_sessions_count = locale
  },
  SET_NUM_CURRENT_SHARED_SESSIONS (state, locale) {
    state.current_shared_sessions_count = locale
  },
  SET_NUM_SIDEBAR_ACTIVE_WINDOW (state, locale) {
    state.sidebar_active_window = locale
  },
  SET_SESSIONS (state, locale) {
    state.sessions = locale
  },
  SET_SHARED_SESSIONS (state, locale) {
    state.shared_sessions = locale
  },
  SET_ALL_SESSIONS_LENGTH (state, locale) {
    state.all_sessions_length = locale
  },
  SET_ALL_SESSIONS (state, locale) {
    state.all_sessions = locale
  },
  SET_SEARCHING (state, locale) {
    state.searching = locale
  },
  SET_SEARCH_INFO (state, locale) {
    state.search = locale
  },
  SET_SESSION_ID (state, locale) {
    state.session_id = locale
  },
  SET_STATUS_UPDATE_FILES (state, locale) {
    state.status_update_files = locale
  },
  SET_COMPUTER_SCALE (state, locale) {
    state.initialComputerScale = locale
  },
  SET_INSTALL_PROMPT (state, data) {
    state.installPrompt = data
  },
}
