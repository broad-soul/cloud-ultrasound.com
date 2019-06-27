<template lang="pug">
  v-app(id="inspire" class="content")
    Sidebar(
      @commentSaved="commentSaved"
      @getFiles="getFiles"
      @showInfo="showInfo"
      @tab_change="tab_change"
      @checkStatusUpdateFiles="checkStatusUpdateFiles"
      :sessions="sessions"
      :shared_sessions="shared_sessions"
      :sidebar_loading="sidebar_loading"
      )
    Navbar(
      @commentSaved="commentSaved"
      @showInfo="showInfo"
      @clearContent="clearContent"
      @getFiles="getFiles"
      @searchSessions="searchSessions"
      @checkStatusUpdateFiles="checkStatusUpdateFiles"
      :active_tab="active_tab"
      )
    v-content
      v-progress-circular(
        v-if="content_loading"
        :size="55"
        color="teal"
        indeterminate
        class="loading_big"
        style="z-index: 1;"
        )
      v-tabs(
        v-model="currentItem"
        slider-color="teal"
        class="content__tab open_sidebar"
        transition="slide-y-transition"
        )
        v-tab(
          v-for="item in tab_content"
          :href="'#tab-' + item.id"
          :key="item.id"
          )
          v-icon(class="mr-2") {{ item.icon }}
          span(class="tab_content_title") {{ item.title }}
      v-tabs-items(v-model="currentItem" class="tab-wrap-content")
        v-tab-item(
          v-for="(item, i) in tabs"
          :key="i"
          :value="'tab-'+item"
          :class="'tab_'+item"
          class="tab-element"
          transition="fade-transition"
          reverseTransition="fade-transition"
          )
          v-layout(wrap)
            v-flex(
              v-for=`(file, index) in
                (item === 'all_files' ? video_photo_files : item === 'video' ?
                video_files : photo_files)`
              :key="index"
              class="content_box ma-3"
              )
              template(v-if="mobileDetect")
                v-card(tabindex="0")
                  card-item(
                    :index="index"
                    :item="item"
                    :file="file"
                    :notFoundImg="notFoundImg"
                    :showModal="showModal"
                    )
                  v-card-title
                    span(class="file_name mr-auto") {{ file.name }}
                    span(v-if="file.type === 'video'" class="duration") {{ file.duration}}
              template(v-else)
                v-hover
                  v-card(
                    tabindex="0"
                    @keyup.enter="showModal(index)"
                    @keyup.space="showModal(index)"
                    slot-scope="{ hover }"
                    :class="'elevation-'+`${hover ? 12 : 2}`"
                    )
                    card-item(
                      :index="index"
                      :item="item"
                      :hover="hover"
                      :file="file"
                      :notFoundImg="notFoundImg"
                      :showModal="showModal"
                      )
                    v-card-title
                      span(class="file_name mr-auto") {{ file.name }}
                      span(v-if="file.type === 'video'" class="duration") {{ file.duration}}
                      
      v-dialog(v-model="dialog" dark hide-overlay fullscreen persistent)
        fullscreen(
            ref="fullscreen"
            @change="fullscreenChange"
            class="fullscreen_component"
            )
            v-card(@mousemove="showPanelMouseMove()")
              v-card-title(
                class="headline"
                @mouseover="mouseHoverArrow"
                @mouseout="mouseOutArrow"
                v-if="show_panel"
                )
                div(class="count_session_info")
                  span(class="current_number") {{current_number}}
                  span(class="slash") /
                  span(class="all_files_count") {{all_files_count}}
                  
                div(class="file_not_found_dialog" v-if="file_not_found_dialog") {{$t('file_not_found')}}
                
                v-icon(
                  @click="download()"
                  class="download_link"
                  v-if="!iosDetect && !file_not_found_dialog"
                  ) mdi-download
                v-icon(
                  v-if="!iosDetect"
                  @click="toggle"
                  class="fullscreen_icon"
                  ) mdi-{{ fullscreen ? 'fullscreen-exit' : 'fullscreen'}}
                v-icon(
                  @click="closeDialog()"
                  class="close"
                  ) mdi-close
              v-card-text
                v-layout(v-touch="{ left: () => swipeLeft(), right: () => swipeRight() }")
                    div(
                      class="v-image"
                      v-if="show_image"
                      @dblclick="toggle($event)"
                      )
                      template(v-if="iosDetect")
                          img(
                              align="image"
                              class="image"
                              ref="photo"
                              :src="original_image"
                              @load="showImage()"
                              @error="dialogNotFoundImg('image')"
                              @click="mobileShowArrowFunc()"
                              )
                      template(v-else)
                            v-zoomer(
                                style="width: 100%; height: 100%"
                                :zoomed.sync="zoomed"
                                :max-scale="50"
                                ref="zoomer"
                                )
                                img(
                                    align="image"
                                    class="image"
                                    ref="photo"
                                    :src="original_image"
                                    @load="showImage()"
                                    @error="dialogNotFoundImg('image')"
                                    @click="mobileShowArrowFunc()"
                                    )
                    div(
                      class="v_video"
                      v-if="show_video"
                      style="width: 100%"
                      )
                      template(v-if="iosDetect")
                          vue-plyr(
                              ref="plyr" :options="playerOptions"
                              :emit="['dblclick', 'playing', 'pause', 'controlsshown', 'controlshidden', 'mousemove', 'loadedmetadata']"
                              @playing="playing"
                              @pause="pause"
                              @controlsshown="controlsShown()"
                              @controlshidden="controlsHidden()"
                              @loadedmetadata="loadedmetadata()"
                              )
                              video(
                                  playsinline
                                  :src="video_src"
                                  @loadeddata="showVideo"
                                  @error="dialogNotFoundImg('video')"
                                  )
                      template(v-else)
                        v-zoomer(
                          style="width: 100%; height: 100%"
                          :zoomed.sync="zoomed"
                          :max-scale="50"
                          ref="zoomer"
                          )
                          vue-plyr(
                            ref="plyr" :options="playerOptions"
                            :emit="['dblclick', 'playing', 'pause', 'controlsshown', 'controlshidden', 'mousemove', 'loadedmetadata']"
                            @dblclick="toggle($event)"
                            @playing="playing"
                            @pause="pause"
                            @controlsshown="controlsShown()"
                            @controlshidden="controlsHidden()"
                            @loadedmetadata="loadedmetadata()"
                            )
                            video(
                              playsinline
                              :src="video_src"
                              @loadeddata="showVideo"
                              @error="dialogNotFoundImg('video')"
                              )
                v-icon(
                  class="arrow_image arrow_image_left"
                  v-if="show_left_arrow && show_panel"
                  @click="prev"
                  @mouseover="mouseHoverArrow"
                  @mouseout="mouseOutArrow"
                  ) mdi-arrow-left
                v-icon(
                  class="arrow_image arrow_image_right"
                  v-if="show_right_arrow && show_panel"
                  @click="next"
                  @mouseover="mouseHoverArrow"
                  @mouseout="mouseOutArrow"
                  ) mdi-arrow-right
                v-progress-circular(
                  v-if="dialog_loading"
                  :size="55" color="teal"
                  indeterminate
                  class="loading_big loading_media"
                  )
      div(v-show="showInstallMessagePwaIos" class="install__message__pwa__ios")
          v-icon(class="plus") mdi-plus-box
          p(class="text") Install this webapp on your Device: tap
            svg(xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 192 192" style=" fill:#000;")
                g(fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal")
                    path(d="M0,192v-192h192v192z" fill="none")
                    g(fill="#3498db")
                        g(id="surface1")
                            path(d="M96,2.28l-2.76,2.64l-30.72,30.72c-1.53,1.53 -1.53,3.99 0,5.52c1.53,1.53 3.99,1.53 5.52,0l24.12,-24.12v105.84c-0.015,1.38 0.705,2.67 1.905,3.375c1.2,0.69 2.67,0.69 3.87,0c1.2,-0.705 1.92,-1.995 1.905,-3.375v-105.84l24.12,24.12c1.53,1.53 3.99,1.53 5.52,0c1.53,-1.53 1.53,-3.99 0,-5.52l-30.72,-30.72zM26.88,61.44v130.56h138.24v-130.56h-38.4c-1.38,-0.015 -2.67,0.705 -3.375,1.905c-0.69,1.2 -0.69,2.67 0,3.87c0.705,1.2 1.995,1.92 3.375,1.905h30.72v115.2h-122.88v-115.2h30.72c1.38,0.015 2.67,-0.705 3.375,-1.905c0.69,-1.2 0.69,-2.67 0,-3.87c-0.705,-1.2 -1.995,-1.92 -3.375,-1.905z")
            </svg> and then Add to homescreen
          v-spacer
          v-icon(class="close" @click="hideInstallMessagePwaIos()") mdi-close
      div(v-show="showInstallMessagePwaIos" @click="hideInstallMessagePwaIos()" class="overlay")
    v-snackbar(class="main_snackbar"
      absolute
      :top="true"
      :timeout="2000"
      v-model=`info.show`
      color="teal accent-4"
      )
      v-icon(color="white" class="icon") mdi-{{info.icon}}</v-icon> {{ info.text }}
      
    v-snackbar(class="online__status"
      v-model=`offline_status`
      :timeout="100000000000"
      :color="offline_status_color"
      bottom
      ) {{offline_status_text}}
</template>

<script>
  import Auth from '../helpers/Auth'
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { disablePageScroll, enablePageScroll, getScrollState } from 'scroll-lock'
  import CardItem from './CardItem'
  import Sidebar from './Sidebar'
  import Navbar from './Navbar'

  export default {
    name: 'Content',
    components: {
      CardItem,
      Sidebar,
      Navbar
    },
    mounted () {
      $('.v-tabs__item').on('click', function () {
        setTimeout(() => $(this).blur(), 50)
      })
      window.addEventListener('online', () => {
        this.offline_status_color = 'green accent-4'
        this.offline_status_text = this.$t('online_text')
        setTimeout(() => this.offline_status = false, 2000)
        if (this.all_files_count < 1) {
          this.content_loading = true
          this.axiosGetFiles({
            session_id: this.getSessionId,
            clear: true
          })
        }
      })
      window.addEventListener('offline', () => {
        this.offline_status_color = 'grey darken-4'
        this.offline_status_text = this.$t('offline_text')
        this.offline_status = true
      })
      //PWA
      if (!this.ieDetect) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful 😎 with scope: ', registration.scope)
          }).catch(function (err) {
            console.log('ServiceWorker registration failed 😢: ', err)
          })
        }
        if (this.mobileDetect) {
          window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault()
            this.setInstallPrompt(e)
            e.userChoice.then(res => {
              if (res.outcome == 'accepted') {
                this.$store.state.installPrompt = null
              } else {
                this.showInstallPromptPwa = false
              }
            })
          })
        }
  
        // delete cacheStorage
        let date_today_sw = new Date().getTime()
        let date_tomorrow_sw = localStorage.getItem('date_tomorrow_sw')
        let one_week_millesecond = 1000 * 60 * 60 * 24 * 7
  
        if (!date_tomorrow_sw) {
          localStorage.setItem('date_tomorrow_sw', date_today_sw + one_week_millesecond)
        }
  
        if (date_tomorrow_sw && date_today_sw > date_tomorrow_sw) {
          caches.delete('cache-v1').then(boolean => {
            console.log('Cache deleted: ', boolean)
            localStorage.setItem('date_tomorrow_sw', date_today_sw + one_week_millesecond)
          })
        }
      }
      //PWA End

      if (!this.mobileDetect) {
          this.changeComputerScale(window.devicePixelRatio)
          let difference = parseInt(this.getComputerScale.toString().split('.')[1])
          difference = difference ? difference : 0
          $(window).resize(() => {
            if (this.dialog) {
              this.browserZoomLevel = Math.round(window.devicePixelRatio * 100)
              if ((this.browserZoomLevel - difference) === 100) {
                if (this.$refs['zoomer']) {
                  this.$refs['zoomer'].scale = 1
                  this.zoomed = false
                }
                $('.fullscreen_component .image, .fullscreen_component video').css('transform', 'scale(1)')
              }

              if ((this.browserZoomLevel - difference) >= 110) {
                if (this.$refs['zoomer']) this.$refs['zoomer'].scale = this.browserZoomLevel / 100
                this.zoomed = true
              }
              if ((this.browserZoomLevel - difference) < 100) {
                $('.fullscreen_component .image, .fullscreen_component video').css('transform', 'scale(' + this.browserZoomLevel / 100 + ')')
              }
            }
          })
      }

      /*document.addEventListener('gesturestart', function (e) {
          e.preventDefault();
          // отключяет zoom, scroll остаётся
      });*/

      if (this.mobileDetect) {
        $('body').addClass('mobile')
      }

      if (this.iosDetect && !localStorage.getItem('f')) {
        localStorage.setItem('f', 'true')
        window.location.reload()
      }

      Auth.init()
      this.user_id = this.getUser.user_id

      this.role = localStorage.getItem('role')
      if (this.role === 'patient') {
        setTimeout(() => this.getSession(), 500)
        this.url = 'patient'
      } else if (this.role === 'doctor') {
        this.url = 'doctor'
        this.sidebar_loading = false
      } else if (this.role === 'guest') {
        setTimeout(() => this.getSession(), 500)
        this.url = 'guest'
      }
      this.onVisibilityChange((visible) => {
        if (this.player()) {
          visible ? this.player().play() : this.player().pause()
        }
      })
      $(window).on('contextmenu', function (e) {
        e.preventDefault()
      })

      if (this.iosDetect) {
        $(window).resize(() => {
          if (this.getZoomFactorIos() <= 1.01) this.zoomed = false
        })
        setTimeout(() => $('.tab-wrap-content .tab-element').addClass('ios'), 5)
      }
      
      if (this.mobileDetect && !this.iosDetect) {
        setTimeout(() => $('.tab-wrap-content .tab-element').addClass('mobile'), 5)
      }
    },
    data () {
      return {
        offline_status_text: this.$t('offline_text'),
        offline_status: false,
        offline_status_color: 'grey darken-4',
        showInstallMessagePwaIos: false,
        showInstallPromptPwa: true,
        controls_shown_time: null,
        swipe_on_video: false,
        browserZoomLevel: 100,
        zoomed: false,
        tabs: [
          'all_files',
          'video',
          'photo',
        ],
        is_allowed_swipe: true,
        // sidebar start
        user_id: null,
        active_tab: 'session',
        sessions: [],
        shared_sessions: [],
        sidebar_loading: true,
        // sidebar end
        file_not_found_dialog: false,
        mousemove_panel: false,
        show_panel_timeout: null,
        show_panel: true,
        download_error: false,
        download_link: null,
        current_number: null,
        all_files_count: null,
        video_files_count: null,
        photo_files_count: null,
        show_image: false,
        video_src: null,
        show_video: false,
        show_left_arrow: false,
        show_right_arrow: false,
        dialog: false,
        info: {
          timeout: 4000,
          show: false,
          text: null,
          icon: 'check',
        },
        url: '',
        currentItem: 'tab-all_files',
        tab_content: [
          {
            id: 'all_files',
            title: this.$t('all_files'),
            icon: 'mdi-collapse-all',
          },
          {
            id: 'video',
            title: this.$t('video'),
            icon: 'mdi-play-circle-outline',
          },
          {
            id: 'photo',
            title: this.$t('photo'),
            icon: 'mdi-camera',
          },
        ],
        role: '',
        all_files: [],
        video_photo_files: [],
        video_files: [],
        photo_files: [],
        content_loading: false,
        dialog_loading: false,
        items: [],
        thumbnail: '',
        original_image: '',
        fullscreen: false,
        pauseVideo: true,
        playVideo: false,
        controls: {
          desctop: `<div class="plyr__controls plyr__controls-desctop">
                          <button type="button" class="plyr__control  plyr__control--rewind" data-plyr="rewind" style="display: flex;padding: 2px;">
                              <img src="/img/backward-white.png" width="28" alt="backward-white">
                          </button>
                          <button type="button" class="plyr__control" aria-label="Play, {title}" data-plyr="play">
                              <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
                              <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
                          </button>
                          <button type="button" class="plyr__control plyr__control--forward" style="display: flex;padding: 2px;">
                              <img src="/img/forward-white.png" width="28" alt="forward-white">
                          </button>
                          <div class="plyr__progress">
                              <input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek">
                              <progress class="plyr__progress__buffer" min="0" max="100" value="0">% buffered</progress>
                              <span role="tooltip" class="plyr__tooltip">00:00</span>
                          </div>
                          <div class="plyr__time plyr__time--current" aria-label="Current time">00:00</div>
                          <span style="margin-left: 10px;font-size: 19px;">/</span>
                          <div class="plyr__time plyr__time--duration" aria-label="Duration">00:00</div>
                          <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute">
                              <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
                              <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
                          </button>
                          <div class="plyr__volume">
                              <input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume">
                          </div>
                      </div>
                      <div class="touch_show_hide_control_overlay"></div>
                      <button type="button" class="plyr__control plyr__control--overlaid plyr__control--overlaid_desctop"
                              data-plyr="play" aria-label="Play, This is an example video">
                          <svg role="presentation" class="icon--not-pressed" focusable="false"><use xlink:href="#plyr-play"></use></svg>
                          <svg role="presentation" class="icon--pressed pause"><use xlink:href="#plyr-pause"></use></svg>
                      </button>`,
          mobile: `<div class="plyr__controls plyr__controls-mobile">
                            <div class="plyr__time__wrap">
                                <div class="plyr__time plyr__time--current" aria-label="Current time">00:00</div>
                                <div class="plyr__volume__wrap">
                                    <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute">
                                        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
                                        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
                                    </button>
                                </div>
                                <div class="plyr__time plyr__time--duration" aria-label="Duration">00:00</div>
                            </div>
                            <div class="progress__volume__wrap">
                                <div class="plyr__progress">
                                    <input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek">
                                    <progress class="plyr__progress__buffer" min="0" max="100" value="0">% buffered</progress>
                                    <span role="tooltip" class="plyr__tooltip">00:00</span>
                                </div>
                            </div>
                        </div>
                        <div class="touch_show_hide_control_overlay"></div>
                        <button type="button"
                            class="plyr__control plyr__control--overlaid plyr__control--play"
                            data-plyr="play"
                            aria-label="Play, This is an example video"
                        >
                            <svg role="presentation" class="icon--not-pressed" focusable="false"><use xlink:href="#plyr-play"></use></svg>
                            <svg role="presentation" class="icon--pressed pause"><use xlink:href="#plyr-pause"></use></svg>
                        </button>
                        <button type="button" data-plyr="rewind" class="plyr__control__center__mobile--rewind">
                              <img src="/img/backward-white.png" alt="backward-white">
                        </button>
                        <button type="button" class="plyr__control--forward plyr__control__center__mobile--forward">
                              <img src="/img/forward-white.png" alt="forward-white">
                        </button>`,

        },
        statusClickMobileVideo: true,
      }
    },
    computed: {
      ...mapState(['Auth']),
      ...mapGetters([
        'ieDetect',
        'iPadDetect',
        'getCanInstallPrompt',
        'getInstallPrompt',
        'mobileDetect',
        'iosDetect',
        'iphoneDetect',
        'getSidebarStatus',
        'getUser',
        'getStatusUpdateFiles',
        'getSidebarActiveWindow',
        'getCurrentSessionsCount',
        'getSessions',
        'getSessionId',
        'getComputerScale',
      ]),
      canInstallPrompt () {
        return this.mobileDetect && this.getCanInstallPrompt
      },
      auth () {
        return this.$store.state.Auth
      },
      playerOptions () {
        let controls = this.controls.desctop
        if (this.mobileDetect) controls = this.controls.mobile
        const options = {
          title: 'This is an example video',
          autoplay: true,
          volume: 1,
          controls: controls,
          debug: false,
          playsinline: true,
          fullscreen: false,
        }
        return options
      },
    },
    watch: {
      all_files_count () {
        this.showArrow()
      },
      zoomed () {
        let elem = $('.zoomer')
        if (this.zoomed) {
          elem.addClass('zoom')
          this.controlsHidden()
          if (!this.mobileDetect) elem.addClass('all_scroll')
        } else {
          elem.removeClass('zoom')
          this.controlsShown()
          this.showPanelMouseMove()
          if (!this.mobileDetect) elem.removeClass('all_scroll')
        }
      },
    },
    methods: {
      ...mapActions([
        'setInstallPrompt',
        'toggleSidebarMenu',
        'updateSessionsCount',
        'updateSharedSessionsCount',
        'setSearching',
        'updateSessions',
        'updateSharedSessions',
        'onVisibilityChange',
        'updateAllSessions',
        'updateAllSessionsLength',
        'changeStatusUpdateFiles',
        'updateSessionId',
        'changeComputerScale',
      ]),
      hideInstallMessagePwaIos () {
        this.showInstallMessagePwaIos = false
        setTimeout(() => this.toggleSidebarMenu(true))
      },
      onInstallPwa () {
        this.getInstallPrompt.prompt()
      },
      mobileShowArrowFunc () {
        if (this.mobileDetect) {
          clearTimeout(this.show_panel_timeout)
          this.statusClickMobileVideo = !this.statusClickMobileVideo
          if (!this.statusClickMobileVideo) this.controlsHidden()
          else this.showPanelMouseMove()
        }
      },
      zoomEvent () {
        // for mobile
        let timeout = null
        let zoomed = this.zoomed
        window.addEventListener('touchmove', (e) => {
          if (e.touches.length == 2) {
            if (!this.iosDetect) {
              clearTimeout(this.controls_shown_time)
              this.controlsHidden()
            }
            if (this.iosDetect) {
              if (this.getZoomFactorIos() >= 1.01) {
                this.zoomed = true
                zoomed = true
                setTimeout(() => {
                  let mylatesttap = ''
                  $('.fullscreen_component .image, .fullscreen_component .v_video').on('touchstart', function (e) {
                    drag($(this), e)
                  })
                  let th = this

                  function drag (elementToDrag, e) {
                    if (e.touches.length == 1) {
                      let now = new Date().getTime()
                      let timesince = now - mylatesttap
                      if ((timesince < 200) && (timesince > 0)) {
                        th.zoomed = false
                        zoomed = false
                        th.is_allowed_swipe = true
                        $(window).off('touchmove', boxMove)
                        elementToDrag.css('position', 'static')
                      }
                      mylatesttap = new Date().getTime()
                    }

                    let deltaX = e.pageX - elementToDrag[0].offsetLeft
                    let deltaY = e.pageY - elementToDrag[0].offsetTop

                    $(window).on('touchmove', boxMove)
                    $(window).on('touchend', boxUp)

                    function boxMove (e) {
                      if (zoomed) {
                        setTimeout(() => {
                          elementToDrag.css({
                            'position': 'fixed',
                            'left': (e.pageX - deltaX) + 'px',
                            'top': (e.pageY - deltaY) + 'px',
                          })
                        }, 1)
                        th.zoomed = true
                        zoomed = true
                        th.is_allowed_swipe = false
                      } else {
                        setTimeout(() => {
                          elementToDrag.css('position', 'static')
                        }, 1)
                        th.zoomed = false
                        zoomed = false
                      }
                    }

                    function boxUp () {
                      $(window).off('touchmove', boxMove)
                    }
                  }
                }, 1)
              } else {
                this.zoomed = false
                zoomed = false
                th.is_allowed_swipe = true
                clearTimeout(this.controls_shown_time)
              }
            }
            this.is_allowed_swipe = false
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                this.is_allowed_swipe = true
            }, 700)
          }
        })
      },
      getZoomFactorIos () {
        return document.body.clientWidth / window.innerWidth
      },
      getFiles (data) {
        // PWA
        if (this.showInstallPromptPwa) {
          setTimeout(() => {
            if (this.canInstallPrompt) {
              this.onInstallPwa()
            }
            
            // Detects if device is in standalone mode
            const isInStandaloneMode = () => (navigator.standalone === true)
                                            || (window.matchMedia('display-mode: standalone').matches)
            if (this.iosDetect && !isInStandaloneMode) {
              if (this.iPadDetect) $('.install__message__pwa__ios').addClass('ipad')
              if (!localStorage.getItem('showInstallMessagePwaIos')) {
                this.showInstallMessagePwaIos = true
                localStorage.setItem('showInstallMessagePwaIos', 'false')
              }
            }
          }, 1000)
        }
        
        if (data.clear) {
          this.disabled_tab_sidebar = true
          this.content_loading = true
          this.all_files = []
          this.video_photo_files = []
          this.video_files = []
          this.photo_files = []
        }
        
        if (data != null) {
          if (navigator.onLine) {
            this.content_loading = true
          } else {
            this.content_loading = false
            this.all_files_count = 0
          }
          this.axiosGetFiles(data)
          clearInterval(this.$store.state.interval_files_update)
          this.$store.state.interval_files_update = setInterval(() => {
            if (this.getStatusUpdateFiles) {
              this.axiosGetFiles({
                session_id: this.getSessionId,
                clear: false,
              })
            }
          }, 10000)
        } else {
          this.content_loading = false
        }
      },
      axiosGetFiles (data) {
        setTimeout(() => $('.lds-ellipsis').show(), 500)
        axios.get('get_session_files/' + data.session_id).then(response => {
          setTimeout(() => {
            setTimeout(() => {
              $('.v-card__title').on('click', function () {
                setTimeout(() => $('.v-card').blur(), 50)
              })
            }, 500)
            if (data.clear) {
              this.currentItem = 'tab-all_files'
              this.content_loading = false
            }
            this.all_files = response.data
            this.video_photo_files = response.data
            this.all_files_count = this.all_files.length
            this.items = []
            this.video_files = []
            this.photo_files = []
            this.all_files.forEach((item) => {
              this.items.push({
                src: item.image,
                w: 1920,
                h: 1080,
              })
              if (item.type == 'video') {
                this.video_files.push(item)
              }
              if (item.type == 'photo') {
                this.photo_files.push(item)
              }
            })
            this.video_files_count = this.video_files.length
            this.photo_files_count = this.photo_files.length

            if (this.currentItem === 'tab-all_files') {
              this.all_files_count = this.all_files.length
            } else if (this.currentItem === 'tab-video') {
              this.all_files_count = this.video_files_count
            } else if (this.currentItem === 'tab-photo') {
              this.all_files_count = this.photo_files_count
            }
            if (this.mobileDetect) {
              setTimeout(() => {
                if (this.iosDetect) {
                  let no_scroll = true
                  let time = ''
                  $('.sidebar, .sidebar .session_box').on('touchmove', () => {
                    no_scroll = false
                    clearTimeout(time)
                    time = setTimeout(() => no_scroll = true, 600)
                  })
                  $(document).on('touchstart', '.sidebar .session_box', function () {
                    setTimeout(() => {
                      if (no_scroll) {
                        $('.sidebar .session_box').removeClass('hover')
                        $(this).not('.active').addClass('hover')
                      }
                    }, 500)
                  })
                } else {
                  $(document).on('mouseenter', '.sidebar .session_box', function () {
                    $(this).not('.active').addClass('hover')
                  })
                  $(document).on('mouseleave', '.sidebar .session_box', function () {
                    $('.sidebar .session_box').removeClass('hover')
                  })
                }
                $('.session_box').addClass('mobile')
              }, 100)
              window.scrollTo(0, 1)
            }
            setTimeout(() => $('.lds-ellipsis').hide(), 2000)
          }, 10)
        }).catch(error => {
          this.content_loading = false
          console.log(error)
          this.all_files = []
          this.video_photo_files = []
          this.video_files = []
          this.photo_files = []
        }).finally(() => {
          this.content_loading = false
        })
      },
      clearContent () {
        this.all_files = []
        this.video_photo_files = []
        this.video_files = []
        this.photo_files = []
      },
      mouseHoverArrow () {
        if (this.$refs.plyr) {
          this.$refs.plyr.player.config.hideControls = false
        }
      },
      mouseOutArrow () {
        if (this.$refs.plyr) {
          this.$refs.plyr.player.config.hideControls = true
        }
      },
      controlsShown () {
        if (!this.zoomed) {
          this.controls_shown_time = setTimeout(() => {
            this.show_panel = true
            if (this.mobileDetect) {
              this.statusClickMobileVideo = true
              $('.plyr__controls-mobile').css('visibility', 'visible')
              $('.plyr__volume__wrap, .plyr__progress input').show()
              $('.plyr__control__center__mobile--rewind, .plyr__control__center__mobile--forward').css('display', 'flex')
              $('.plyr__control.plyr__control--play').css({
                'visibility': 'visible',
                'opacity': 1,
              })
            } else {
              $('.plyr__controls.plyr__controls-desctop, .plyr__control.plyr__control--overlaid').show()
              this.mouseHoverArrow()
            }
          }, 300)
        }
      },
      controlsHidden () {
          setTimeout(() => {
              this.show_panel = false
              this.statusClickMobileVideo = false
              if (this.mobileDetect) {
                  $('.plyr__controls-mobile').css('visibility', 'hidden')
                  $('.plyr__volume__wrap, .plyr__progress input').hide()
                  $('.plyr__control__center__mobile--rewind, .plyr__control__center__mobile--forward').hide()
                  $('.plyr__control.plyr__control--overlaid').css({
                      'visibility': 'hidden',
                      'opacity': 0,
                  })
              } else {
                  $('.plyr__controls.plyr__controls-desctop, .plyr__control.plyr__control--overlaid').hide()
                  this.mouseOutArrow()
              }
          }, 300)
      },
      showPanelMouseMove () {
          if (this.mobileDetect) {
              setTimeout(() => {
                  clearTimeout(this.show_panel_timeout)
                  if (this.statusClickMobileVideo && !this.zoomed) this.controlsShown()
                  this.show_panel_timeout = setTimeout(() => {
                      if (!this.file_not_found_dialog) this.controlsHidden()
                      this.statusClickMobileVideo = false
                  }, 3000)
              }, 300)
          } else {
              clearTimeout(this.show_panel_timeout)
              if (!this.zoomed) this.controlsShown()
              if (this.player()) {
                  this.show_panel_timeout = setTimeout(() => {
                      if (!this.file_not_found_dialog) {
                          this.controlsHidden()
                          this.statusClickMobileVideo = false
                      }
                  }, 3000)
              }
              if (this.show_image) {
                  this.show_panel_timeout = setTimeout(() => {
                      if (!this.file_not_found_dialog) this.controlsHidden()
                  }, 3000)
              }
          }
      },
      download () {
        window.open(this.download_link)
      },
      commentSaved () {
        this.info.timeout = 2000
        this.info.show = true
        this.info.text = this.$t('status_saved')
      },
      toggle () {
        this.$refs['fullscreen'].toggle()
        if (this.mobileDetect) {
          if (this.fullscreen) {
            screen.orientation.unlock('portrait')
          } else {
            screen.orientation.lock('landscape')
          }
        }
      },
      fullscreenChange (fullscreen) {
        this.fullscreen = fullscreen
        setTimeout(() => {
          if (this.$refs['zoomer']) {
            this.$refs['zoomer'].reset()
            this.zoomed = false
          }
        }, 100)
        if (this.player()) {
          if (this.pauseVideo) this.player().pause()
          else this.player().play()
        }
      },
      showModal (index) {
        setTimeout(() => {
          $('img').on('contextmenu', (e) => e.preventDefault())
          $('img').on('mousedown', (e) => e.preventDefault())
        }, 1)
        $(document).off().keyup((e) => {
          if (this.dialog) {
            const keyCode = e.keyCode
            if (keyCode === 37) this.prev()
            if (keyCode === 39) this.next()
            if (keyCode === 27) {
              if (this.$refs['zoomer'] && this.zoomed) {
                this.$refs['zoomer'].reset()
                this.zoomed = false
              } else {
                if (!this.fullscreen) this.closeDialog()
              }
            }
          }
        })

        if (this.mobileDetect) {
          window.history.pushState('', '', '')
          window.addEventListener('popstate', () => this.closeDialog())

          enablePageScroll()
          disablePageScroll()
        }
        if (this.iphoneDetect) {
          $('.fullscreen_component').addClass('ios')
        }
        if (this.iosDetect) {
          setTimeout(() => $('.loading_big').addClass('iphone'), 50)
        }
        if (this.currentItem === 'tab-all_files') {
          this.all_files_count = this.video_photo_files.length
          this.all_files = this.video_photo_files
          this.download_link = this.video_photo_files[index].downloadLink
        } else if (this.currentItem === 'tab-video') {
          this.all_files_count = this.video_files_count
          this.all_files = this.video_files
          this.download_link = this.video_files[index].downloadLink
        } else if (this.currentItem === 'tab-photo') {
          this.all_files_count = this.photo_files_count
            this.all_files = this.photo_files
            this.download_link = this.photo_files[index].downloadLink
        }
        this.show_panel = true

        this.current_number = index + 1
        let current_file = this.all_files[index]
        this.thumbnail = current_file.thumbnail_image
        this.download_error = false
        this.dialog = true
        this.initial()
        if (current_file.type === 'video') {
          this.dialog_loading = true
          this.show_image = false
          this.loadVideo(current_file.resource_v2)
        } else {
          setTimeout(() => {
            if (!$('.fullscreen_component .image')[0]) {
              this.dialog_loading = true
            } else if (!$('.fullscreen_component .image')[0].complete) {
              this.dialog_loading = true
            }
          }, 200)
          this.loadImage(current_file.resource_v2)
        }

        if (this.iosDetect && !screen.orientation) {
          this.download_error = true
        }
      },
      closeDialog () {
          if (this.mobileDetect) this.statusClickMobileVideo = true
          this.dialog = false
          if (this.$refs['zoomer']) {
            this.zoomed = false
            this.$refs['zoomer'].reset()
          }
          enablePageScroll()
          if (this.fullscreen) {
            if (this.player()) setTimeout(() => this.player().pause(), 50)
            if (!this.iosDetect) this.toggle()
          }
          setTimeout(() => this.initial(), 50)
      },
      loadImage (current_file) {
          this.show_image = true
          if (this.original_image == current_file) {
            this.dialog_loading = false
            if (this.all_files_count > 1) {
              this.showArrow()
            }
          }
          this.original_image = current_file
          if (!this.iosDetect) setTimeout(() => this.$refs['zoomer'].onWindowResize(), 1)
          this.zoomEvent()
      },
      showImage () {
        clearTimeout(this.show_panel_timeout)
        this.statusClickMobileVideo = true
        this.showPanelMouseMove()
        this.dialog_loading = false
        if (this.all_files_count > 1) {
          this.showArrow()
        }
      },
      showVideo () {
        $('.plyr__control--forward').off().on('click', () => this.player().forward(30))
        if (this.all_files_count > 1) {
          this.showArrow()
        }
        if (this.player()) this.player().play()
        if (this.mobileDetect) {
          $('.plyr__progress input[type=range]').off().on('input', () => {
            clearTimeout(this.show_panel_timeout)
            clearTimeout(time)
            this.is_allowed_swipe = false
            let time = setTimeout(() => {
              this.showPanelMouseMove()
              this.is_allowed_swipe = true
            }, 800)
          })
          $('.plyr__controls').off().on('touchstart', () => {
            this.is_allowed_swipe = false
          })
          $('.plyr__controls').off().on('touchend', () => {
            clearTimeout(time)
            this.is_allowed_swipe = false
            let time = setTimeout(() => {
                this.is_allowed_swipe = true
            }, 800)
          })
        }
        $('.plyr .touch_show_hide_control_overlay').off().on('click', () => {
          this.statusClickMobileVideo = !this.statusClickMobileVideo
          clearTimeout(this.statusClickMobileVideo)
          if (!this.statusClickMobileVideo) this.controlsHidden()
          else this.showPanelMouseMove()
        })
      },
      loadedmetadata () {
        if (this.iosDetect) {
          if (this.player()) this.player().play()
          this.zoomEvent()
          if (this.swipe_on_video) {
            this.dialog_loading = false
            this.swipe_on_video = false
          }
        } else {
          if (this.$refs['zoomer']) setTimeout(() => this.$refs['zoomer'].onWindowResize(), 1)
        }
      },
      loadVideo (current_file) {
        this.show_video = true
        this.video_src = current_file
      },
      player () {
        if (this.$refs.plyr) {
          return this.$refs.plyr.player
        }
      },
      playing () {
        this.pauseVideo = false
        this.playVideo = true
        this.show_panel = false
        this.controlsHidden()
        this.dialog_loading = false
        clearTimeout(this.show_panel_timeout)
        this.statusClickMobileVideo = false
      },
      pause () {
        this.pauseVideo = true
        this.playVideo = false
        this.showPanelMouseMove()
      },
      initial () {
        if (this.video_src) {
          this.show_video = false
        }
        setTimeout(() => {
          this.file_not_found_dialog = false
        }, 50)
        clearTimeout(this.show_panel_timeout)
        this.hideArrow()
      },
      notFoundImg (index, selector, type) {
        let elem = $(selector + ' .content_box .v-image').eq(index)
        elem.addClass('img__not__found').find('.lds-ellipsis').hide()
        if (type == 'video') elem.addClass('video')
        else elem.addClass('image')
        elem.next().show()
      },
      dialogNotFoundImg (type) {
        if (this.dialog) {
          this.file_not_found_dialog = true
          setTimeout(() => {
            this.original_image = '/img/no-image.png'
          }, 50)
        }
        this.dialog_loading = false
        this.download_error = true
        if (this.all_files_count > 1) {
          this.showArrow()
          if (this.current_number == 1) this.show_left_arrow = false
          if (this.current_number == this.all_files_count) this.show_right_arrow = false
        }

        if (type === 'video') {
          this.show_video = false
          this.show_image = true
        }
      },
      swipeLeft () {
        if (this.show_right_arrow && this.is_allowed_swipe && !this.zoomed) {
          this.swipe_on_video = true
          this.next()
        }
      },
      swipeRight () {
        if (this.show_left_arrow && this.is_allowed_swipe && !this.zoomed) {
          this.swipe_on_video = true
          this.prev()
        }
      },
      prev () {
        if (this.current_number > 1) this.showModal(this.current_number - 2)
      },
      next () {
        if (this.current_number < this.all_files_count) this.showModal(this.current_number)
      },
      showArrow () {
        this.show_left_arrow = true
        this.show_right_arrow = true
        if (this.current_number == 1) this.show_left_arrow = false
        if (this.current_number == this.all_files_count) this.show_right_arrow = false
      },
      hideArrow () {
        this.show_left_arrow = false
        this.show_right_arrow = false
      },
      showInfo (message) {
        this.info.text = message.text
        this.info.show = message.show
      },
      // sidebar start
      searchSessions (data) {
        this.sessions = data.sessions
        this.shared_sessions = data.shared_sessions
      },
      checkStatusUpdateFiles (session) {
        if (session.session_closed == '1') {
          this.changeStatusUpdateFiles(false)
        } else {
          this.changeStatusUpdateFiles(true)
        }
      },
      getSession () {
        axios.post('get_patient_sessions').then(response => {
            let sessions = response.data
            if (sessions != '') {
                this.updateAllSessions(sessions)
                this.updateAllSessionsLength(sessions.length)
                sessions.forEach(elem => {
                    if (elem.is_shared == 1) {
                        this.shared_sessions.push(elem)
                        elem.isSharedActive = false
                    } else {
                        this.sessions.push(elem)
                        elem.isActive = false
                    }
                })
                if ($.isArray(this.sessions) && this.sessions[0]) {
                    if (parseInt(this.sessions[0].watched) === 0) {
                        this.sessions[0].watched = 1
                        axios.post('make_session_watched', {
                            session_id: this.sessions[0].session_id,
                        })
                    }
                    this.sessions[0].isActive = true
                    this.updateSessionId(this.sessions[0].session_id)
                } else {
                    this.sessions = []
                }
                if ($.isArray(this.shared_sessions) && this.shared_sessions[0]) {
                    this.shared_sessions[0].watched = 1
                    axios.post('make_session_watched', {
                        session_id: this.shared_sessions[0].session_id,
                    })
                    this.shared_sessions[0].isSharedActive = true
                } else {
                    this.shared_sessions = []
                }
                if (this.role === 'patient') {
                    this.updateSessionsCount(this.sessions.length)
                    this.updateSharedSessionsCount(this.shared_sessions.length)
                    this.getFiles({ session_id: this.sessions[0].session_id })
                    this.toggleSidebarMenu(true)
                    this.updateSessions(this.sessions)
                    this.checkStatusUpdateFiles(this.sessions[0])
                    this.updateSharedSessions(this.shared_sessions)
                } else if (this.role === 'guest') {
                    this.updateSharedSessionsCount(this.shared_sessions.length)
                    this.getFiles({ session_id: this.shared_sessions[0].session_id })
                    this.toggleSidebarMenu(true)
                    this.updateSharedSessions(this.shared_sessions)
                }
            }
        }).catch(error => {
          console.log(error)
          this.sessions = []
          this.shared_sessions = []
          this.$emit('getFiles', {
            session_id: null,
          })
        }).finally(() => {
          this.setSearching(true)
          this.sidebar_loading = false
          if (this.role === 'patient' || this.role === 'guest') {
            this.toggleSidebarMenu(true)
          }
        })
      },
      tab_change (item) {
        this.active_tab = item
        this.clearContent()
      },
      // sidebar end
    }
  }
</script>

<style lang="stylus" scoped>
  .fullscreen_component
    overflow: hidden !important
    
    &.ios
      .plyr__controls-mobile
        bottom 50px !important
        
        .plyr__progress
          padding 0 20px
    
    .headline
      //background: rgba(0, 150, 136, .4)
      background rgba(0, 0, 0, .8)
      height auto !important
      padding 10.25px 15px
      
      .count_session_info
        margin-right auto
      
      .fullscreen_icon
        margin-left 10px
        font-size 28px
      
      .close
        font-size 28px
        margin-left 10px
        position relative
        z-index 10

  
  .v-dialog {
      .fullscreen_component {
          height: 100%
          
          &.fullscreen {
              .image, .v_video {
                  position: absolute
                  top: 0
                  left: 0
                  height: 100%
                  object-fit: initial !important
                  width: 100%
              }
              
              video {
                  height: 100vh !important
              }
          }
      }
      
      .theme--dark.v-card {
          background-color: #000
          border-color: #000
          height: 100%
      }
      
      .headline {
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 50px
          z-index: 5
      }
      
      .v-card {
          display: flex
          
          &__text {
              margin: auto
              padding: 0
              height: calc(100vh - 105px)
              
              .v-image {
                  height: calc(100vh - 105px)
                  width: 100%
                  display: flex
                  justify-content: center
                  
                  .image {
                      width: auto
                      @supports (display: flex) {
                          width: 100%
                      }
                      height: 100%
                      object-fit: contain
                  }
              }
              
              .v_video {
                  height: calc(100vh - 105px)
                  
                  video {
                      width: 100%
                      height: calc(100vh - 105px)
                      object-fit: contain
                  }
                  
              }
              
              .arrow_image {
                  position: absolute
                  z-index: 3
                  top: 50%
                  transform: translateY(-50%)
                  font-size: 22px
                  padding: 3px
                  color: #fff
                  background: rgba(0, 150, 136, .7)
                  cursor: pointer
                  border-radius: 3px
                  
                  &:hover {
                      background: #009688
                  }
                  
                  &_left {
                      left: 30px
                  }
                  
                  &_right {
                      right: 30px
                  }
              }
          }
      }
      
      .file_not_found_dialog {
          position: absolute
          font-size: 30px
          color: #fff
          text-align: center
          left: 0
          right: 0
          margin: auto
          z-index: 1
          max-width: 500px
          width: 500px
          bottom: 0
          top: 12px
          @supports (display: flex) {
              width: auto
          }
          
          @media (max-width: 500px) {
              font-size: 25px
          }
      }
  }
  
  .tab-wrap-content {
    height: 100vh
    
    .tab-element {
      overflow-y: scroll
      position: relative
      top: 48px
      height: calc(100vh - 97px)
      
      &.ios {
        height: initial
      }
      
      &.mobile {
        height: calc(100vh - 97px)
      }
    }
    
  }

</style>

<style lang="stylus">
  .online__status
    .v-snack__wrapper
      width: 100%
      max-width: none
      border-radius: 0
      
      .v-snack__content
        justify-content: center
        height: auto
        padding: 2px 0

  .install__message__pwa__ios
    position: absolute
    bottom: 70px
    left: 0
    right: 0
    background: #CFD8DC
    border-radius: 5px
    padding: 5px
    display: flex
    align-items: center
    margin: 0 4px
    z-index: 9999
    
    &:before
      content: ''
      position: absolute
      bottom: -16px
      background: #CFD8DC
      clip-path: polygon(100% 0, 0 0, 50% 100%)
      height: 17px
      width: 30px
      margin: auto
      left: 0
      right: 0
    
    &.ipad
      bottom: initial
      top: -25px
      
      &:before
        transform rotate(180deg)
        right: 123px
        left: auto
        top: -16px
        bottom: initial
    
    .text
      margin: 0
      color: #424242
    
    .plus
      font-size: 40px
      margin-right: 10px
    
    .close
        padding: 5px
  
  .overlay
    position: fixed
    left: 0
    right: 0
    bottom: 0
    top: 0
    background: rgba(0, 0, 0, .6)
    z-index: 8888
  
  .zoomer
    &.all_scroll
      cursor all-scroll
</style>
