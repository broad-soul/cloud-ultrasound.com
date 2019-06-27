<template>
  <v-navigation-drawer
    class="sidebar"
    ref="sidebar"
    mobile-break-point="1080"
    fixed
    width="350"
    app
    v-model="drawer"
  >
    <v-layout
      @click="drawer = false"
      v-touch="{ right: () => drawer = true, left: () => drawer = false}"
      class="touch_sidebar_mobile"
      v-if="mobileDetect"
    ></v-layout>
    <v-progress-circular
      v-if="sidebar_loading"
      :size="55"
      color="teal"
      indeterminate
      class="loading_big"
    ></v-progress-circular>
    <v-tabs grow v-model="active_tab" slider-color="teal" class="sidebar__tab">
      <v-tab
        href="#tab-sessions"
        v-if="getUser.role !== 'guest'"
        :disabled="!getSessionsCount || disabled_tab_sidebar"
        @click="tabChange('sessions')"
      >
        {{ $t('sessions') }}
        <span class="count_sessions ml-1">
          ( {{ getSessionsCount ? getCurrentSessionsCount + 1 : 0 }} /
          {{ animatedSessionsCount }} )
        </span>
      </v-tab>
      <v-tab
        href="#tab-shared"
        v-if="getSharedSessionsCount > 0"
        :disabled="!getSharedSessionsCount || disabled_tab_sidebar"
        @click="tabChange('shared')"
      >
        {{ $t('shared') }}
        <span class="count_sessions ml-1">
          ( {{ getSharedSessionsCount ? getCurrentSharedSessionsCount + 1 : 0 }} /
          {{ getSharedSessionsCount }} )
        </span>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="active_tab" touchless>
      <v-tab-item value="tab-sessions" class="tab_session" transition="fade-transition" reverseTransition="fade-transition">
        <v-btn
          v-if="getSessionsCount"
          v-for="(session, index) in paginatedSessions" :key="index"
          class="session_box"
          @click="getFiles(session, index)"
          @touchend="touchEndMobileSession(session, index, $event)"
          :class="{active: session.isActive, watched: session.watched  == 0}"
          :id="session.session_id"
        >
          <v-btn v-if="session.watched == 0" fab color="red" class="watched__btn"></v-btn>
          <div class="session_link" @click="changeSidebarMobile">
            <div style="width: 100%;">
              <div class="date_box py-2">
                <div v-if="getUser.role === 'doctor'">
                  <v-icon>mdi-email</v-icon>
                  <span style="text-transform: initial">{{ session.user_email }}</span>
                </div>
                <div v-if="getUser.role === 'doctor'">
                  <v-icon>mdi-account</v-icon>
                  <span style="text-transform: initial">{{ session.user_name }}</span>
                </div>
                <div>
                  <v-icon>mdi-calendar-range</v-icon>
                  {{ session.date }}
                </div>
                <div>
                  <v-icon>mdi-clock</v-icon>
                  {{ session.time }}
                </div>
              </div>
            </div>
          </div>
          <div class="share_comment_box">
            <v-btn flat class="btn_share" block @click="openShare(session)">
              {{$t('share')}}
            </v-btn>
            <v-btn flat class="btn_comment" block @click="commentDialog(session)">
              {{$t('comment')}}
            </v-btn>
          </div>
        </v-btn>
        <v-pagination
          v-model="pageNumber"
          :length="pageCount"
          color="teal"
          :total-visible="7"
          v-if="pageCount > 1"
        ></v-pagination>
        <div class="go_to_page_sessions" v-if="pageCount > 10">
          <v-text-field
            v-model="goToPageNumber"
            :label="$t('go_to_page_sessions')"
            solo
            @keyup.enter="goToPageSessions()"
          ></v-text-field>
          <v-btn color="teal" @click="goToPageSessions()">
            <v-icon>mdi-arrow-right-bold</v-icon>
          </v-btn>
        </div>
        <div v-if="getSessionsCount < 1 && getSearching" class="no_sessions_found">
          {{$t('no_sessions_found')}}
        </div>
      </v-tab-item>
      <v-tab-item value="tab-shared" class="tab_shared" reverseTransition="fade-transition">
        <v-btn
          v-if="getSharedSessionsCount"
          v-for="(session , index) in getSharedSessions" :key="index"
          class="session_box"
          @click="getFiles(session, index)"
          @touchend="touchEndMobileSession(session, index, $event)"
          :class="{active: session.isSharedActive, watched: session.watched  == 0}"
        >
          <v-btn v-if="session.watched == 0" fab color="red" class="watched__btn"></v-btn>
          <div class="session_link" @click="changeSidebarMobile">
            <div style="width: 100%;">
              <div class="date_box py-2">
                <div>
                  <v-icon>mdi-email</v-icon>
                  {{ session.user_email }}
                </div>
                <div>
                  <v-icon>mdi-account</v-icon>
                  {{ session.user_name }}
                </div>
                <div>
                  <v-icon>mdi-calendar-range</v-icon>
                  {{ session.date }}
                </div>
                <div>
                  <v-icon>mdi-clock</v-icon>
                  {{ session.time }}
                </div>
              </div>
              <div class="exp_date">
                {{$t('expiration_date')}} {{ session.expire_date }}
              </div>
            </div>
          </div>
          <div class="share_comment_box">
            <v-btn flat class="btn_comment" block @click="commentDialog(session)">{{$t('comment')}}</v-btn>
          </div>
        </v-btn>
        <div v-if="getSharedSessionsCount < 1 && getSearching" class="no_sessions_found">
          {{$t('no_sessions_found')}}
        </div>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog
      v-model="share_dialog"
      @keyup.esc="share_dialog=false"
      persistent
      max-width="500"
      content-class="share_dialog share_dialog_focus_ipad"
    >
      <v-card class="share_dialog">
        <v-card-title class="headline">{{$t('share')}}</v-card-title>
        <v-card-text>
          <v-form ref="share_form">
            <v-text-field
              :value="senders_name"
              class="senders_name"
              :label="$t('senders_name')"
              clearable
              prepend-icon="mdi-account"
              color="teal accent-4"
              browser-autocomplete="on"
              :disabled="share_loading"
            ></v-text-field>
            <v-text-field
              :value="senders_email"
              class="senders_email"
              :rules="sendersEmailRules"
              :label="$t('senders_email')"
              prepend-icon="mdi-email"
              color="teal accent-4"
              clearable
              :disabled="share_loading"
              @focus="resetValidation"
              @blur="resetValidation"
            ></v-text-field>
            <v-textarea
              :value="share_message"
              class="share_message"
              :label="$t('message')"
              prepend-icon="mdi-message"
              clearable
              color="teal accent-4"
              :disabled="share_loading"
            ></v-textarea>
            <v-text-field
              :value="name"
              class="receivers_name"
              :label="$t('receivers_name')"
              prepend-icon="mdi-account"
              color="teal accent-4"
              clearable
              browser-autocomplete="on"
              :disabled="share_loading"
            ></v-text-field>
            <v-autocomplete
              class="autocomplete_receivers_email"
              v-model.lazy="email"
              :items="share_email_items"
              item-text="email"
              item-value="email"
              required
              hide-no-data
              small-chips
              :label="$t('receivers_email')"
              :loading="isLoading"
              color="teal accent-4"
              prepend-icon="mdi-email"
              clearable
              :menu-props="{'maxHeight': 100}"
              :disabled="share_loading"
              @focus="resetValidation"
              :rules="receiversEmailRules"
              :error-messages="checkError('email')"
              multiple
              @click="shareSelect()"
              @keyup.enter="addEmailReceivers($event)"
              @keyup.space="addEmailReceivers($event)"
              @blur="blurAddEmailReceivers($event)"
              :filter="filter"
            >
              <template v-slot:selection="data">
                <v-chip
                  :selected="data.selected"
                  close
                  class="chip--select-multi"
                  @input="remove(data.item)"
                >
                  {{ data.item.email }}
                </v-chip>
              </template>
              <template v-slot:item="data">
                <v-list-tile-content>
                  <v-list-tile-title v-html="data.item.email"></v-list-tile-title>
                </v-list-tile-content>
              </template>
            </v-autocomplete>
            <v-radio-group v-model="radioGroup" row>
              <v-radio
                color="teal accent-4"
                :disabled="share_loading"
                :label="$t('day')"
                value="day"
              ></v-radio>
              <v-select
                :disabled="share_loading || disabled_day"
                color="teal accent-4"
                dense
                :items="days"
                v-model="day"
                single-line
                :menu-props="{contentClass: 'select_date'}"
              ></v-select>
              <v-radio
                color="teal accent-4"
                :disabled="share_loading"
                :label="$t('month')"
                value="month"
              ></v-radio>
              <v-select
                dense
                :disabled="share_loading || disabled_month"
                color="teal accent-4"
                :items="months"
                v-model="month"
                single-line
                :menu-props="{contentClass: 'select_date'}"
              ></v-select>
            </v-radio-group>
            <v-checkbox
              v-if="getUser.role === 'doctor'"
              :label="$t('comment_editing')"
              :disabled="share_loading"
              color="teal"
              v-model="editable"
              class="checkbox_comment_editing"
            ></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="teal accent-4"
            dark
            :loading="share_loading"
            @click.stop="sendShare"
          >
            {{$t('ok')}}
          </v-btn>
          <v-btn
            :disabled="share_loading"
            @click="cancelShare()"
          >
            {{$t('cancel')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="comment_dialog"
      persistent
      max-width="500"
      content-class="comment_dialog_content"
    >
      <v-card class="comment_dialog">
        <v-card-title class="headline">
          <span>{{$t('comment')}}</span>
          <v-btn
            v-if="!checkCommentEdit"
            flat
            dark
            class="close"
            @click="closeCommentDialog()"
            :disabled="comment_loading"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="comment_card">
          <v-textarea
            solo
            name="input-7-4"
            label="Solo textarea"
            no-resize
            placeholder=" "
            :value="comment"
            :disabled="comment_loading"
            :loading="comment_loading"
            :readonly="!checkCommentEdit"
            color="teal accent-4"
            class="comment_textarea"
          ></v-textarea>
        </v-card-text>
        <v-card-actions v-if="checkCommentEdit">
          <v-spacer></v-spacer>
          <v-btn
            color="teal accent-4"
            dark
            @click="editComment()"
            :loading="comment_loading"
          >
            {{$t('ok')}}
          </v-btn>
          <v-btn
            :disabled="comment_loading"
            @click="closeCommentDialog()"
          >
            {{$t('cancel')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
  require('../assets/js/TweenLite.min')
  import {
    disablePageScroll,
    enablePageScroll,
    getScrollState,
    addScrollableSelector,
    clearQueueScrollLocks,
  } from 'scroll-lock'

  import email_text
    from '../email/share'
  import Auth
    from '../helpers/Auth'
  import {
    mapState,
    mapGetters,
    mapActions,
  } from 'vuex'

  export default {
    props: {
      loading: Boolean,
      sidebar_loading: Boolean,
      sessions: Array,
      shared_sessions: Array,
      filter: {
        type: Function,
        default: (item, queryText, itemText) => {
          return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) == 0
        },
      },
    },
    name: 'Sidebar',
    mounted () {
      if (this.getUser.role === 'guest') {
        this.active_tab = 'tab-shared'
        this.share_tab_active = true
      }
      this.$store.subscribe((mutation, state) => {
        switch (mutation.type) {
          case 'SET_NUM_ALL_SESSIONS':
            TweenLite.to(this.$data, 2, { tweenedSessionsCount: state.sessions_count })

            this.enableSpaceTabChange()
            break
          case 'SET_SEARCH_INFO':
            this.pageNumber = 1
            break
        }
      })
    },
    data () {
      return {
        goToPageNumber: null,
        tweenedSessionsCount: 0,
        currentPage: 1,
        perPage: 10,
        pageNumber: 1,
        offset_top: 0,
        session_scroll_pos: 0,
        shared_session_scroll_pos: 0,
        share_email_items_length: 0,
        email: [],
        intervalTouchStart: '',
        timerTouchStart: 0,
        share_email_items: [],
        shareSelectClicked: false,
        resize: true,
        comment_edit: null,
        disabled_tab_sidebar: false,
        active_tab: 'tab-sessions',
        share_loading: false,
        radioGroup: 'day',
        comment_loading: true,
        session_id: null,
        files: [],
        share_tab_active: false,
        share_dialog: false,
        comment_dialog: false,
        comment: '',
        valid: false,
        editable: false,
        user_email: localStorage.getItem('email'),
        email_model: null,
        descriptionLimit: 45,
        entries: [],
        isLoading: false,
        name: null,
        day: 1,
        month: 1,
        comment_id: null,
        sessionDate: null,
        sessionTime: null,
        clientMessage: '',
        senders_name: '',
        senders_email: '',
        share_message: '',
        sendersEmailRules: [
          v => !!v || this.$t('senders_email_rules'),
          v => regExp.test(v) || this.$t('email_must_be_valid'),
        ],
        receiversEmailRules: [
          v => !!v || this.$t('receivers_email_rules'),
          v => regExp.test(v) || this.$t('email_must_be_valid'),
        ],
        form_errors: {},
        focus: true,
        interval_notification_sound: null,
        title: document.title,
      }
    },
    watch: {
      isUpdating (val) {
        if (val) {
          setTimeout(() => (this.isUpdating = false), 3000)
        }
      },
      email (mail) {
        let success = true
        if (mail[0]) {
          mail.forEach(elem => {
            success = regExp.test(elem)
          })
          if (!success) {
            this.receiversEmailRules = [this.$t('email_must_be_valid')]
          } else { this.receiversEmailRules = [true] }
        } else {
          this.receiversEmailRules = [this.$t('receivers_email_rules')]
        }
      },
    },
    created () {
      Auth.init()
      if (this.mobileWidth) {
        this.drawer = false
      }
      this.searching()
      this.onVisibilityChange((visible) => {
        this.focus = visible
        $('title').html(this.title)
        clearInterval(this.interval_notification_sound)
      })
    },
    computed: {
      ...mapState(['interval_sessions_update']),
      ...mapGetters([
        'iosDetect',
        'iPadDetect',
        'mobileDetect',
        'mobileWidth',
        'getUser',
        'getSidebarStatus',
        'getSessionsCount',
        'getCurrentSessionsCount',
        'getSharedSessionsCount',
        'getCurrentSharedSessionsCount',
        'getSidebarActiveWindow',
        'getSessions',
        'getSharedSessions',
        'getIntervalSessionsUpdate',
        'getSessionsLength',
        'getAllSessions',
        'getSearching',
        'getSearchInfo',
        'getSessionId',
      ]),
      animatedSessionsCount () {
        return this.tweenedSessionsCount.toFixed(0)
      },
      drawer: {
        get () {
          if (this.getSidebarStatus) {
            setTimeout(() => {
              disablePageScroll(document.querySelector('.sidebar .v-window'))
            }, 500)
          } else {
            enablePageScroll()
          }
          return this.getSidebarStatus
        },
        set (val) {
          enablePageScroll()
          this.toggleSidebarMenu(val)
        },
      },
      pageCount () {
        if (this.getSessions) {
          let l = this.getSessions.length,
            s = this.perPage
          return Math.ceil(l / s)
        }
        return 0
      },
      paginatedSessions () {
        if (this.getSessions) {
          const start = (this.pageNumber - 1) * this.perPage
          const end = start + this.perPage
          return this.getSessions.slice(start, end)
        }
      },
      checkCommentEdit () {
        if (this.comment_edit == 1 && this.share_tab_active && this.getUser.role === 'doctor') {
          return true
        } else if (!this.share_tab_active && this.getUser.role === 'doctor') {
          return true
        } else {
          return false
        }
      },
      days () {
        let res = []
        for (let i = 1; i <= 31; i++) {
          res.push(i)
        }
        return res
      },
      months () {
        let res = []
        for (let i = 1; i <= 12; i++) {
          res.push(i)
        }
        return res
      },
      disabled_day () {
        return (this.radioGroup === 'day') ? false : true
      },
      disabled_month () {
        return (this.radioGroup === 'month') ? false : true
      },
      items_senders_email () {
        return [this.getUser.email]
      },
    },
    methods: {
      ...mapActions([
        'toggleSidebarMenu',
        'updateSessions',
        'updateSharedSessions',
        'updateSessionsCount',
        'updateCurrentSessionsCount',
        'updateSharedSessionsCount',
        'updateCurrentSharedSessionsCount',
        'changeSidebarActiveWindow',
        'updateAllSessionsLength',
        'updateAllSessions',
        'onVisibilityChange',
        'updateSessionId',
        'changeStatusUpdateFiles',
      ]),
      enableSpaceTabChange () {
        setTimeout(() => {
          if (this.getSessionsCount > 0 && this.getSharedSessionsCount > 0) {
            let th = this
            $('.sidebar__tab .v-tabs__item').keyup(function (e) {
              if (e.keyCode === 32) {
                let href = $(this).attr('href').replace('#', '')
                setTimeout(() => th.active_tab = href)
                th.tabChange(href.replace('tab-', ''))
              }
            })
          }
        }, 600)
      },
      goToPageSessions () {
        this.pageNumber = +this.goToPageNumber
        this.goToPageNumber = null
      },
      touchEndMobileSession (session, index, event) {
        setTimeout(() => {
          let hover = $(event.target).parents('.session_box').hasClass('hover')
          if (hover) {
            this.getFiles(session, index)
            this.toggleSidebarMenu(false)
          }
        }, 50)
      },
      blurAddEmailReceivers (e) {
        let regExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3}\s{0,10})+$/
        if (e.target.value != undefined) {

          let email = e.target.value.trim()

          if (regExp.test(email)) {
            let access = (email != this.senders_email)
            if (access && this.email.indexOf(email) < 0) {
              this.share_email_items.push({ email: email })
              this.email.push(email)
            }
          }
        }
      },
      addEmailReceivers (e) {
        let regExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3}\s{0,10})+$/
        let email = e.target.value.trim()
        let searchRegex = new RegExp(email, 'i')
        if (searchRegex.test(this.email)) {
          $('.autocomplete_receivers_email input').val('')
        }
        if (regExp.test(email)) {
          setTimeout(() => {
            $('.autocomplete_receivers_email input').val('')
          }, 20)
          if (this.email.indexOf(email) < 0) {
            this.share_email_items.push({ email: email })
            this.email.push(email)
          }
        }
      },
      remove (item) {
        const index = this.email.indexOf(item.email)
        setTimeout(() => {
          $('.autocomplete_receivers_email input').val('')
        }, 50)
        this.share_email_items.forEach((obj, index) => {
          if (obj.email == item.email) {
            this.share_email_items.splice(index, 1)
          }
        })
        if (this.emailValidError()) {
        }
        if (index >= 0) this.email.splice(index, 1)
      },
      resetValidation () {
        this.$refs.share_form.resetValidation()
        this.form_errors = {}
      },
      checkError (field) {
        return this.form_errors.hasOwnProperty(field) ? this.form_errors[field][0] : []
      },
      changeSidebarMobile () {
        if (window.innerWidth <= 1080) {
          this.drawer = false
        }
      },
      getFiles (data, index) {
        $(document).off().keyup((e) => {
          if (e.keyCode === 27) {
            if (this.share_dialog) this.share_dialog = false
            if (this.comment_dialog) this.comment_dialog = false
          }
        })
        let isActive = false
        if (data) {
          this.updateSessionId(data.session_id)
          if (data.isActive === false) {
            this.getSessions.forEach(elem => elem.isActive = false)
            data.isActive = true
            isActive = true
            if (!this.share_tab_active) {
              this.currentPage = this.pageNumber
              let num = 0
              if (this.pageNumber > 1) num = (this.pageNumber - 1) * 10
              else num = 0
              num = index + num
              this.updateCurrentSessionsCount(num)
            }
          }
          if (data.isSharedActive === false) {
            this.getSharedSessions.forEach(elem => elem.isSharedActive = false)
            data.isSharedActive = true
            isActive = true
            if (this.share_tab_active) {
              this.updateCurrentSharedSessionsCount(index)
            }
          }
        }
        if (isActive) {
          if (parseInt(data.watched) === 0) {
            data.watched = 1
            axios.post('make_session_watched', {
              session_id: data.session_id,
            })
          }
          this.$emit('getFiles', {
            session_id: this.getSessionId,
            clear: true,
          })
        }
      },
      emailValidError () {
        let email_valid_error = false
        if (this.email) {
          for (let email of this.email) {
            if (this.user_email === email.trim()) email_valid_error = true
          }
        }
        if (email_valid_error) {
          return true
        } else {
          return false
        }

      },
      search (val) {
        $('.v-autocomplete__content .v-select-list').hide()
        this.isLoading = true
        if (val && val.length == 1) {
          this.shareSelectClicked = false
          this.shareSelect()
        }
        if (this.share_email_items_length > 0) {
          let searchRegex = new RegExp(val, 'i')
          if (val != '' && searchRegex.test(this.entries)) {
            $('.v-autocomplete__content .v-select-list').show()
            if (this.iosDetect) {
              if (!this.offset_top) this.offset_top = $('.autocomplete_receivers_email input').offset().top + 35
              setTimeout(() => {
                $('.menuable__content__active').css('top', this.offset_top + 'px')
              }, 120)
            }
            $('.v-autocomplete__content .v-list__tile').on('click', () => {
              $('.v-autocomplete__content .v-select-list').hide()
              $('.autocomplete_receivers_email input').val('')
            })
          }
          this.isLoading = false
        }
      },
      openShare (item) {
        $('.checkbox_comment_editing').keyup((e) => {
          console.log(e.keyCode)
          if (e.keyCode === 13) this.editable = !this.editable
        })
        let th = this
        let time = null
        $('.autocomplete_receivers_email input').on('input', function () {
          clearTimeout(time)
          time = setTimeout(() => th.search($(this).val()), 50)
        })
        $('.autocomplete_receivers_email .mdi-menu-down').parent().parent().hide()
        clearQueueScrollLocks()
        enablePageScroll()
        if (!this.iPadDetect) {
          addScrollableSelector('.share_dialog')
          addScrollableSelector('.v-menu__content')
          disablePageScroll()
        }
        this.senders_email = this.getUser.email
        this.share_dialog = true
        this.session_id = item.session_id
        this.sessionDate = item.date
        this.sessionTime = item.time
      },
      sendShare () {
        this.senders_name = $('.senders_name input').val()
        this.senders_email = $('.senders_email input').val()
        this.share_message = $('.share_message textarea').val()
        this.name = $('.receivers_name input').val()
        if (this.emailValidError()) {
          this.form_errors = {
            'email': [this.$t('can_not_share_email')],
          }
          this.$refs.share_form.validate()
        } else {
          if (this.$refs.share_form.validate()) {
            let pr = localStorage.getItem('locale_prefix_lang')
            this.share_loading = true
            let data = {
              user_id: this.$store.state.Auth.user_id,
              session_id: this.session_id,
              expire_period_type: this.radioGroup === 'day' ? 5 : 3,
              expire_day: this.radioGroup === 'day' ? this.day : this.month,
              email: this.email,
              name: this.name,
              editable: this.editable,
              sender: this.senders_name,
              senderEmail: this.senders_email,
              sessionDate: this.sessionDate,
              sessionTime: this.sessionTime,
              clientMessage: this.share_message.replace(/\r\n|\r|\n/g, '<br>'),
              text: email_text[pr],
            }

            axios.post('share_session', data).then(response => {
              this.showInfo(this.$t('email_sent'))
            }).catch(error => {
              console.log(error)
            }).finally(() => {
              this.cancelShare()
              this.share_loading = false
              this.share_dialog = false
            })
          }
        }
      },
      cancelShare () {
        this.share_dialog = false
        this.shareSelectClicked = false
        this.name = ''
        this.senders_name = ''
        this.senders_email = ''
        this.share_message = ''
        this.radioGroup = 'day'
        this.day = 1
        this.month = 1
        this.editable = false
        this.form_errors = {}
        document.querySelector('.v-autocomplete__content').style.display = 'none'
        this.email = []
        this.$refs.share_form.resetValidation()
      },
      shareSelect () {
        if (this.shareSelectClicked) return
        let user_id = localStorage.getItem('user_id')
        $('.v-autocomplete__content .v-select-list').hide()
        axios.post('get_shared_emails', { user_id: user_id }).then(res => {
          if (res.data) {
            res.data.map(entry => {
              return entry.Description.length > this.descriptionLimit
                ? entry.Description.slice(0, this.descriptionLimit) + '...'
                : entry.Description
            }).forEach((email) => {
              this.entries.push(email)
              this.share_email_items.push({ email: email })
            })
            this.share_email_items_length = this.share_email_items.length
            let input = $('.autocomplete_receivers_email input')
            let searchRegex = new RegExp(input.val(), 'i')
            if (searchRegex.test(this.entries) && !searchRegex.test(this.email)) {
              $('.v-autocomplete__content .v-select-list').show()
            }
            setTimeout(() => {
              $('.v-autocomplete__content .v-list__tile').on('click', () => {
                $('.v-autocomplete__content .v-select-list').hide()
                input.val('')
              })
            }, 100)
          } else {
            this.share_loading = false
          }
        }).catch(() => {
          this.isLoading = false
          this.share_loading = false
        }).finally(() => {
          this.shareSelectClicked = true
          this.isLoading = false
        })
      },
      commentDialog (item) {
        this.comment_dialog = true
        this.comment = ''
        this.comment_loading = true
        this.comment_edit = 0
        this.comment_id = item.session_id
        if (item.is_shared == 1 && item.comment_editable == 1) {
          this.comment_edit = 1
        } else if (item.is_shared == 0 && item.comment_editable == 0 && this.getUser.role === 'doctor') {
          this.comment_edit = 1
        }
        this.comment_loading = false
        enablePageScroll()
        disablePageScroll($('.comment_dialog_content')[0])
        if (item.comment != 'no comment') {
          setTimeout(() => this.comment = item.comment, 1)
        }
      },
      editComment () {
        this.comment_loading = true
        this.comment = $('.comment_textarea textarea').val()
        axios.post('edit_session_comment', {
          comment: this.comment,
          id: this.comment_id,
        }).then(() => {
          let index = this.getAllSessions.findIndex(x => x.session_id == this.comment_id)
          this.getAllSessions[index].comment = this.comment
          this.updateAllSessions(this.getAllSessions)
        }).finally(() => {
          this.$emit('commentSaved')
          this.comment_loading = false
          this.closeCommentDialog()
        })
      },
      closeCommentDialog () {
        disablePageScroll(document.querySelector('.sidebar .v-window'))
        this.comment_dialog = false
      },
      tabChange (item) {
        this.changeSidebarActiveWindow(item)
        setTimeout(() => {
          this.enableSpaceTabChange()
        }, 10)
        let session_id = null
        let session = null
        let num = 0
        if (this.pageNumber > 1) num = (this.pageNumber - 1) * 10
        else num = 0
        this.pageNumber = this.currentPage
        if (item === 'sessions' && this.active_tab !== 'tab-' + item) {
          this.share_tab_active = false
          if (this.getSessions) {
            session = this.getSessions[this.getCurrentSessionsCount]
            session_id = session.session_id
            this.getSessions.forEach(elem => elem.isActive = false)
            setTimeout(() => {
              let elem_session = $('.tab_session .session_box').removeClass('active').eq(this.getCurrentSessionsCount - num)
              elem_session.addClass('active')
              this.session_scroll_pos = elem_session[0].offsetTop
              $('.sidebar__tab + .v-window').animate({
                scrollTop: this.session_scroll_pos - 16,
              }, 800)
            }, 500)
          } else {
            session = null
          }
        }
        if (item === 'shared' && this.active_tab !== 'tab-' + item) {
          this.share_tab_active = true
          if (this.getSharedSessions) {
            session = this.getSharedSessions[this.getCurrentSharedSessionsCount]
            session_id = session.session_id
            if (parseInt(session.watched) === 0) {
              session.watched = 1
              axios.post('make_session_watched', {
                session_id: session.session_id,
              })
            }
            setTimeout(() => {
              let elem_shared_session = $('.tab_shared .session_box').removeClass('active').eq(this.getCurrentSharedSessionsCount)
              elem_shared_session.addClass('active')
              this.shared_session_scroll_pos = elem_shared_session[0].offsetTop
              $('.sidebar__tab + .v-window').animate({
                scrollTop: this.shared_session_scroll_pos - 16,
              }, 800)
            }, 500)
            this.getSharedSessions.forEach(elem => elem.isSharedActive = false)
          } else {
            session = null
          }
        }
        if (this.active_tab !== 'tab-' + item) {
          this.disabled_tab_sidebar = true
          this.$emit('tab_change', item)
          setTimeout(() => this.disabled_tab_sidebar = false, 500)
          if (item === 'sessions') this.getFiles(session, this.getCurrentSessionsCount - num)
          if (item === 'shared') this.getFiles(session, this.getCurrentSharedSessionsCount)
        }
      },
      showInfo (message) {
        this.$emit('showInfo', {
          show: true,
          text: message,
        })
      },
      updatePatientSession () {
        Auth.init()
        axios.post('get_patient_sessions', { user_id: this.getUser.user_id }).then(response => {
          let sessions = response.data
          this.$emit('checkStatusUpdateFiles', sessions[this.getCurrentSessionsCount])
          if (sessions != '' && (sessions.length > this.getSessionsLength)) {
            this.updateAllSessions(sessions)
            this.updateAllSessionsLength(sessions.length)
            this.filterSessionsAndShared(sessions)
          }
        })
      },
      updateDoctorSession () {
        axios.post('get_doctor_sessions', this.getSearchInfo).then(response => {
          let sessions = response.data
          this.$emit('checkStatusUpdateFiles', sessions[this.getCurrentSessionsCount])
          if (sessions != '' && (sessions.length > this.getSessionsLength)) {
            this.updateAllSessions(sessions)
            this.updateAllSessionsLength(sessions.length)
            this.filterSessionsAndShared(sessions)
          }
        })
      },
      filterSessionsAndShared (data) {
        this.notificationSound().play()
        if (!this.focus) {
          let flag = false
          this.interval_notification_sound = setInterval(() => {
            if (flag) {
              $('title').html(this.title)
              flag = false
            } else {
              flag = true
              $('title').html('New Session')
            }
          }, 3000)
        }
        let new_sessions = []
        let new_shared_sessions = []
        let session_id = null
        let session_shared_id = null
        let sessions_index = null
        let sessions_shared_index = null
        if (this.getSessions) {
          this.getSessions.forEach(elem => { if (elem.isActive) session_id = elem.session_id })
        }
        if (this.getSharedSessions) {
          this.getSharedSessions.forEach(elem => { if (elem.isSharedActive) session_shared_id = elem.session_id })
        }
        try {
          data.forEach((elem, index) => {
            if (elem.is_shared == 1) {
              new_shared_sessions.push(elem)
              elem.isSharedActive = false
            } else {
              new_sessions.push(elem)
              elem.isActive = false
            }
          })
          new_shared_sessions.forEach((elem, index) => {
            if (elem.session_id == session_shared_id) sessions_shared_index = index
          })
          new_sessions.forEach((elem, index) => {
            if (elem.session_id == session_id) sessions_index = index
          })
        } catch (e) {
          console.log(e.message)
        }
        if (!this.shared_sessions) {
          this.updateCurrentSharedSessionsCount(0)
        }
        if (new_sessions.length > this.getSessionsCount) {
          this.updateSessionsCount(new_sessions.length)
          this.updateSessions(new_sessions)
          new_sessions[sessions_index].isActive = true
          this.updateCurrentSessionsCount(sessions_index)
        }
        if (new_shared_sessions.length > this.getSharedSessionsCount) {
          this.updateSharedSessionsCount(new_shared_sessions.length)
          this.updateSharedSessions(new_shared_sessions)
          new_shared_sessions[sessions_shared_index].isSharedActive = true
          this.updateCurrentSharedSessionsCount(sessions_shared_index)
        }
      },
      searching () {
        clearInterval(this.getIntervalSessionsUpdate)
        this.$store.state.interval_sessions_update = setInterval(() => {
          if (this.getSearching) {
            if (this.getUser.role === 'doctor') this.updateDoctorSession()
            if (this.getUser.role === 'patient' || this.getUser.role === 'guest') this.updatePatientSession()
          }
        }, 30000)
      },
      notificationSound () {
        let sound = new Audio()
        sound.src = '/sound/prodvd-notification.mp3'
        return sound
      },
    },
  }
</script>


<style lang="stylus" scoped>
  body.mobile {
    .touch_sidebar_mobile {
      position: fixed
      width: 100px
      height: 100%
      top: 48px
      left: 350px
      z-index: 1
    }
  }
  
  .count_sessions {
    font-size: 12px
  }
  
  .no_comment {
    color: #90A4AE
  }
  
  .sidebar {
    overflow: visible
    top: 48px
    
    &__tab {
      position: absolute
      top: 0
      left: 0
      width: 100%
      z-index: 10
    }
    
    .v-window {
      max-height: calc(100% + 0px)
      height: calc(100% - 97px)
      overflow-y: scroll
      margin-top: 48px
      position: relative
      z-index: 2
      
      .v-card__text {
        padding-bottom: 0
        
        &:last-child {
          padding-bottom: 20px
        }
      }
    }
    
    .session_box {
      border-radius: 2px
      /*overflow: hidden*/
      position: relative
      z-index: 1
      
      .watched__btn {
        position: absolute
        left: 0
        top: 0
        z-index: 11
        width: 10px
        height: 10px
      }
      
      .v-icon {
        margin-right: 3px
      }
      
      .session_link {
        background-color: #CFD8DC
        color: #616161
        text-transform: initial
        
        .v-icon {
          transition none
        }
      }
      
      .date_box {
        font-weight: inherit
        
        div {
          display: flex
          align-items: center
          justify-content: center
          margin: 5px 0
        }
      }
      
      
      &.watched {
        .date_box {
          font-weight: 800
        }
        
        .exp_date {
          font-weight: 800
        }
      }
      
      .share_comment_box {
        display: flex
        
        .v-btn {
          margin: 0 !important
          border-radius: 0
          color: #fff
          align-items: center
          z-index: 10
        }
        
        .btn_share {
          background-color: #B0BEC5
        }
        
        .btn_comment {
          background-color: #90A4AE
        }
      }
      
      .exp_date {
        padding-bottom: 12px
        margin-top: -2px
      }
      
      &.active {
        .exp_date {
          background-color: #009688 // teal
          color: #fff
        }
        
        .session_link {
          background-color: #009688 // teal
          color: #fff
          
          .v-icon {
            color: #fff
          }
        }
        
        .share_comment_box {
          .v-btn {
            color: #fff
            /*font-weight: 600*/
          }
          
          .btn_share {
            background-color: #00695C // teal darken-2
          }
          
          .btn_comment {
            background-color: #00796B // teal darken-2
          }
        }
      }
      
      
      &:not(.active):not(.mobile):hover {
        .session_link {
          background: rgba(0, 150, 136, .6)
          color: #fff
          
          .v-icon {
            color: #fff
          }
        }
        
        .btn_share {
          background: rgba(0, 150, 136, .8)
          
        }
        
        .btn_comment {
          background: rgba(0, 150, 136, .7)
        }
        
        .exp_date {
          background: rgba(0, 150, 136, 0)
          color: #fff
        }
      }
      
      &.mobile:not(.active).hover {
        .session_link {
          background: rgba(0, 150, 136, .6)
          color: #fff
        }
        
        .btn_share {
          background: rgba(0, 150, 136, .8)
          
        }
        
        .btn_comment {
          background: rgba(0, 150, 136, .7)
        }
        
        .exp_date {
          background: rgba(0, 150, 136, .1)
          color: #fff
        }
      }
    }
    
  }
  
  .v-input--radio-group {
    &__input {
      .v-select {
        width: 13% !important
        flex-grow: 0 !important
        margin-right: 25px
      }
    }
    
    .v-messages {
      display: none
    }
  }
  
  
  .comment_dialog {
    .v-card__text {
      /*min-height: 250px*/
    }
  }
  
  .headline {
    background-color: #009688
    color: #fff
    
    .close {
      margin: 0
      margin-left: auto
      min-width: 0
      padding: 5px
    }
  }
  
  .v-dialog {
    max-width: 500px !important
  }
  
  .share_dialog {
    .v-input--selection-controls {
      padding-top: 0
      margin-top: 5px
    }
    
    .v-input--checkbox {
      margin-top: 0
    }
    
    .v-input__slot {
      margin-bottom: 0
    }
    
    .share_dialog .v-card__text {
      padding-bottom: 0
    }
    
    .v-card__text {
      padding-bottom: 0
    }
  }


</style>


<style lang="stylus">
  .sidebar {
    .session_box {
      height: auto
      min-width: auto
      padding: 0
      width: calc(100% - 30px)
      left: 50%
      transform: translateX(-50%)
      margin-right: auto
      margin-left: auto
      margin-bottom: 10px
      
      &:first-child {
        margin-top: 16px
      }
      
      .v-btn__content {
        flex-direction: column !important
        display: block
      }
    }
    
    .v-pagination {
      display: flex
      /*justify-content: space-between*/
      padding: 20px 12px
      
      li {
        &:first-child, &:last-child {
          display: none
        }
      }
      
      button {
        outline: none
        transition: none
        
        i {
          transition: none
        }
        @media (min-width: 1150px) {
          &:hover {
            background: rgba(0, 150, 136, .6)
            color: #fff
            
            i {
              color: #fff !important
            }
          }
        }
      }
    }
    
    .v-window__container, .v-window-item {
      height: auto !important
    }
    
    .v-window__container {
      .v-card {
        height: 100%
      }
      
      .no_sessions_found {
        transform translateY(calc(100vh / 2 - 50px))
        height: 100%
        display: flex
        justify-content: center
        color: #777
        text-transform: uppercase
      }
    }
    
    &__tab {
      .v-tabs__bar {
        box-shadow: -1px 2px 4px -1px rgba(0, 0, 0, 0.2), -1px 4px 5px 0 rgba(0, 0, 0, 0.14), -1px 1px 10px 0 rgba(0, 0, 0, 0.12)
      }
    }
    
    .v-tabs__item--active {
      font-weight: 600
      color: #009688
      
      .v-icon {
        color: #009688
      }
    }
    
    .go_to_page_sessions {
      display: flex
      margin: 0 15px
      margin-bottom: 30px
      
      .v-input__control {
        min-height: 36px !important
      }
      
      .v-input__slot {
        margin: 0
        border-radius: 0
        border-top-left-radius 3px
        border-bottom-left-radius 3px
      }
      
      .v-text-field__details {
        display: none
      }
      
      .v-btn {
        margin: 0
        height: auto
        border-radius: 0
        color: #fff
        min-width: auto
        width: 44px
        border-top-right-radius 3px
        border-bottom-right-radius 3px
      }
      
      label {
        font-size: 14px
      }
      
      input {
        font-size: 15px
      }
    }
  }

</style>
