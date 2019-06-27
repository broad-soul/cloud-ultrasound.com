export default {
  installPrompt: null,
  initialComputerScale: 1,
  darwerSidebar: true,
  local_lang: 'en',

  // count sessions
  sessions_count: 0,
  current_sessions_count: 0,
  shared_sessions_count: 0,
  current_shared_sessions_count: 0,
  sidebar_active_window: 'sessions',
  // count sessions end

  // sidebar sessions
  all_sessions: [],
  sessions: [],
  shared_sessions: [],
  all_sessions_length: 0,
  // sidebar sessions end

  Auth: {
    token: localStorage.getItem('access_token') || null,
    user_id: localStorage.getItem('user_id') || null,
    name: localStorage.getItem('name') || null,
    email: localStorage.getItem('email') || null,
    role: localStorage.getItem('role') || null,
  },
  interval_sessions_update: '',
  interval_files_update: '',
  searching: false,
  search: {
    name: '',
    date_start: '',
    date_end: '',
    doc_email: '',
  },
  session_id: null,
  status_update_files: null,
}
