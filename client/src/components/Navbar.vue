<template>
  <v-toolbar
    dense
    fixed
    container
    class="my_nav teal darken-1 justify-content-between"
    dark
  >
    <v-toolbar-side-icon
      class="toolbar_burger"
      @click.stop="toggleSidebarMenu(true)"
    ></v-toolbar-side-icon>
    <v-dialog
      content-class="dialog_search_content"
      class="dialog_search"
      v-if="getUser.role === 'doctor'"
      v-model="dialog"
      persistent
      max-width="500"
    >
      <v-btn slot="activator" @click="enableEscCloseDialog()" class="search" flat dark>
        <v-icon class="mr-2">mdi-magnify</v-icon>
        <span class="xs">{{$t('search_btn')}}</span>
      </v-btn>
      <v-form class="dialog_search_form">
        <v-card>
          <v-card-title class="headline teal">
            <v-icon class="headline_search_icon">mdi-file-search-outline</v-icon>
            <span class="xs">{{$t('search_title')}}</span>
            <v-btn
              flat
              dark
              class="search_close"
              :disabled="search_loading"
              @click="searchClose()"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-combobox
              v-model="search.name"
              :no-data-text="$t('search_user_not_found')"
              :items="items"
              :loading="isLoading"
              color="teal accent-4"
              item-text="Description"
              :label="$t('search_name_placeholder')"
              prepend-icon="mdi-email"
              clearable
              :menu-props="{'maxHeight': 100}"
              @keyup.enter="searchSubmit()"
              :disabled="search_loading"
              @click="searchSelectLoad()"
              :search-input.sync="search_watch"
              :filter="filter"
            ></v-combobox>
            <v-menu
              v-model="menu_from"
              ref="menu_from"
              :close-on-content-click="false"
              :nudge-right="32"
              :nudge-top="-45"
              transition="slide-y-transition"
              full-width
              min-width="290px"
              :disabled="search_loading"
            >
              <v-text-field
                slot="activator"
                v-model="search.date_start"
                :label="$t('from')+$t('date_format')"
                prepend-icon="mdi-calendar-range"
                readonly
                clearable
                color="teal accent-4"
                :disabled="search_loading"
              ></v-text-field>
              <v-date-picker
                :locale="locale"
                v-model="search.date_start"
                @input="menu_from= false"
                color="teal accent-4"
              >
                <v-btn flat color="warning" @click="clearFromDate()">{{$t('clear_date')}}</v-btn>
                <v-btn flat color="teal accent-4" @click="fromDateToday()">{{$t('today')}}</v-btn>
              </v-date-picker>
            </v-menu>
            <v-menu
              v-model="menu_to"
              ref="menu_to"
              :close-on-content-click="false"
              :nudge-right="32"
              :nudge-top="-45"
              transition="slide-y-transition"
              full-width
              min-width="290px"
              :disabled="search_loading"
            >
              <v-text-field
                slot="activator"
                v-model="search.date_end"
                :label="$t('to')+$t('date_format')"
                prepend-icon="mdi-calendar-range"
                readonly
                clearable
                color="teal accent-4"
                :disabled="search_loading"
              ></v-text-field>
              <v-date-picker
                :locale="locale"
                v-model="search.date_end"
                @input="menu_to= false"
                color="teal accent-4"
              >
                <v-btn flat color="warning" @click="clearToDate()">{{$t('clear_date')}}</v-btn>
                <v-btn flat color="teal accent-4" @click="toDateToday()">{{$t('today')}}</v-btn>
              </v-date-picker>
            </v-menu>
            <div class="error_search_message" v-if="error_search_message">
              {{error_search_message_text}}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="teal"
              dark
              block
              @click="searchSubmit()"
              :loading="search_loading"
            >
              {{$t('search_btn')}}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-toolbar-items class="ml-auto">
      <transition name="fade-transition">
        <div class="gauntlet_thanos" v-if="gauntlet_thanos" @click="snapThanos()">
          <img src="/img/thanos/thanos_idle.png" alt="thanos_idle" class="thanos_idle">
          <canvas id="thanosAnimation" width="80" height="80"></canvas>
        </div>
      </transition>
      <div class="email">
        {{ getUser.email }}
      </div>
      <v-btn flat dark class="logout" @click="logOut()">
        <v-icon class="mr-2">mdi-logout-variant</v-icon>
        <span class="xs">{{$t('logout')}}</span>
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
  import ThanosSnap
    from '../../public/sound/thanos/thanos_snap_sound.mp3'
  import ThanosReverse
    from '../../public/sound/thanos/thanos_reverse_sound.mp3'
  import {
    disablePageScroll,
    enablePageScroll,
    getScrollState,
  } from 'scroll-lock'
  import Auth
    from '../helpers/Auth'
  import {
    mapState,
    mapGetters,
    mapActions,
  } from 'vuex'

  let ThanosDust = []
  for (let i = 1; i < 7; i++) {
    ThanosDust.push(`../../public/sound/thanos/thanos_dust_${i}.mp3`)
  }

  export default {
    props: {
      active_tab: String,
      filter: {
        type: Function,
        default: (item, queryText, itemText) => {
          return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) == 0
        },
      },
    },
    name: 'Navbar',
    watch: {
      dialog () {
        if (this.dialog) {
          disablePageScroll($('.dialog_search_content')[0])
        } else {
          enablePageScroll()
        }

      },
      search_watch (val) {
        let searchRegex = new RegExp(val, 'i')
        if (val != '' && searchRegex.test(this.items)) {
          $('.v-autocomplete__content .v-select-list').show()
        } else {
          $('.v-autocomplete__content .v-select-list').hide()
        }
      },
    },
    created () {
      if (this.mobileDetect) {
        setTimeout(() => disablePageScroll($('.dialog_search_content')[0]), 500)
      }
      clearInterval(this.int_logout)
      this.int_logout = setInterval(() => {
        localStorage.setItem('foo', new Date().getTime() / 1000)
      }, 5000)
      if (window.innerWidth <= 1080) {
        this.drawer = false
      }
    },
    computed: {
      ...mapState(['Auth']),
      ...mapGetters([
        'getHeaderAuthorization',
        'getSidebarStatus',
        'currentSessions',
        'currentSharedSessions',
        'getSessions',
        'getSharedSessions',
        'getIntervalSessionsUpdate',
        'getSearchInfo',
        'getSessionId',
        'getCurrentSessionsCount',
        'getCurrentSharedSessionsCount',
        'mobileDetect',
        'getUser',
        'getSessionsCount',
      ]),
      auth () {
        return this.$store.state.Auth
      },
      items () {
        return this.entries.map(entry => {
          const Description = entry.Description.length > this.descriptionLimit
            ? entry.Description.slice(0, this.descriptionLimit) + '...'
            : entry.Description
          return Description
        })
      },
    },
    data () {
      return {
        error_search_message_text: this.$t('no_sessions_found'),
        // thanos
        thanos_dust_arr: ThanosDust,
        thanos_dust_count: 0,
        temporary_sessions_count: 0,
        thanos_elem_sessions: null,
        thanos_sessions_length: 0,
        thanos_loop_count: 0,
        search_thanos: false,
        thanosAnimated: false,
        frameIndex: 0,
        tickCount: 0,
        ticksPerFrame: 0,
        requestId: null,
        thanosCanvasContext: null,
        thanosWidth: 80,
        thanosHeight: 80,
        thanosGauntletClick: 0,
        thanosImage: new Image(),
        thanosTicksPerFrame: 2,
        gauntlet_thanos: null,
        thanos_idle: null,
        // thanos end
        searchSelectClicked: false,
        search_watch: null,
        int_logout: '',
        locale: localStorage.getItem('locale_prefix_lang'),
        descriptionLimit: 45,
        entries: [],
        isLoading: false,
        disabled: false,
        error_search_message: false,
        menu_from: false,
        menu_to: false,
        modal: false,
        dialog: true,
        search_loading: false,
        loading: false,
        search: {
          name: '',
          date_start: '',
          date_end: '',
        },
      }
    },
    methods: {
      ...mapActions([
        'toggleSidebarMenu',
        'updateSessionsCount',
        'updateCurrentSessionsCount',
        'updateSharedSessionsCount',
        'updateCurrentSharedSessionsCount',
        'updateSessions',
        'updateSharedSessions',
        'updateAllSessionsLength',
        'updateAllSessions',
        'setSearching',
        'updateSearchInfo',
        'updateSessionId',
        'changeStatusUpdateFiles',
      ]),
      enableEscCloseDialog () {
        $(document).off().keyup((e) => {
          if (e.keyCode === 27) {
            if (this.dialog) this.dialog = false
          }
        })
      },
      searchSubmit () {
        let name = this.search.name
        name = name ? name.toLowerCase() : ''
        if (name === 'таноссс' || name === 'thanosss') {
          if (!$('script[src="/js/html2canvas.min.js"]')[0]) {
            let script = document.createElement('script')
            script.src = '/js/html2canvas.min.js'
            $('body').append(script)

          }
          this.thanosImage.src = '/img/thanos/thanos_snap.png'
          setTimeout(() => $('.v-autocomplete__content').hide(), 200)
          this.searchClose()
          setTimeout(() => {
            this.search_thanos = true
            this.searchSubmit()
            $('.application').append('<div class="thanos"></div>')
          }, 10)
          this.search.name = ''
        } else {
          if (navigator.onLine) {
            this.search_loading = true
            this.disabled = true
            this.error_search_message = false
            this.updateSearchInfo(this.search)

            axios.post('get_doctor_sessions', this.search).then(response => {
              if (response.data != '') {
                setTimeout(() => {
                  if (this.search_thanos) {
                    this.gauntlet_thanos = true
                    this.search_thanos = false
                  } else {
                    this.gauntlet_thanos = false
                  }
                }, 500)
                this.searchClose()
                let new_sessions = []
                let new_shared_sessions = []
                let sessions = response.data
                this.updateAllSessions(sessions)
                this.updateAllSessionsLength(sessions.length)
                let session_id = null
                sessions.forEach(elem => {
                  if (elem.is_shared == 1) {
                    new_shared_sessions.push(elem)
                    elem.isSharedActive = false
                  } else {
                    new_sessions.push(elem)
                    elem.isActive = false
                  }
                })
                if ($.isArray(new_sessions) && new_sessions[0]) {
                  new_sessions[0].isActive = true
                  session_id = new_sessions[0].session_id
                  this.updateSessionsCount(new_sessions.length)
                  if (parseInt(new_sessions[0].watched) === 0) {
                    new_sessions[0].watched = 1
                    axios.post('make_session_watched', {
                      session_id: new_sessions[0].session_id,
                    })
                  }
                } else {
                  this.updateSessionsCount(0)
                  new_sessions = null
                  session_id = null
                }
                if ($.isArray(new_shared_sessions) && new_shared_sessions[0]) {
                  if (parseInt(new_shared_sessions[0].watched) === 0) {
                    new_shared_sessions[0].watched = 1
                    axios.post('make_session_watched', {
                      session_id: new_shared_sessions[0].session_id,
                    })
                  }
                  new_shared_sessions[0].isSharedActive = true
                  this.updateSharedSessionsCount(new_shared_sessions.length)
                } else {
                  new_shared_sessions = null
                  this.updateSharedSessionsCount(0)
                }
                this.updateCurrentSessionsCount(0)
                this.updateCurrentSharedSessionsCount(0)
                if (this.active_tab === 'shared') {
                  if (new_shared_sessions && new_shared_sessions[0]) {
                    session_id = new_shared_sessions[0].session_id
                  } else {
                    session_id = null
                  }
                }
                this.$emit('clearContent')
                this.updateSessions(new_sessions)
                this.updateSharedSessions(new_shared_sessions)
                if (new_sessions) this.$emit('checkStatusUpdateFiles', new_sessions[0])
                else this.$emit('checkStatusUpdateFiles', { session_closed: '1' })

                this.updateSessionId(session_id)
                if (this.getSessionId) {
                  this.$emit('getFiles', {
                    session_id: this.getSessionId,
                    clear: true,
                  })
                }
                setTimeout(() => {
                  $('.sidebar__tab + .v-window').animate({
                    scrollTop: 0,
                  }, 800)
                }, 500)
              }
            }).catch(error => {
              console.log(error)
              this.error_search_message_text = this.$t('no_sessions_found')
              this.error_search_message = true
              setTimeout(() => this.error_search_message = false, 1000)
            }).finally(() => {
              this.disabled = false
              setTimeout(() => this.search_loading = false, 50)
              setTimeout(() => this.setSearching(true), 500)
              if (window.innerWidth <= 1080) {
                setTimeout(() => {
                  if (!this.error_search_message) this.toggleSidebarMenu(true)
                }, 500)
              }
            })
          } else {
            this.error_search_message_text = this.$t('offline_text')
            this.error_search_message = true
            setTimeout(() => this.error_search_message = false, 1000)
          }
        }
      },
      searchClose () {
        this.searchSelectClicked = false
        this.dialog = false
        this.error_search_message = false
      },
      searchSelectLoad () {
        if (this.getUser.role === 'doctor') {
          if (this.searchSelectClicked) return
          this.isLoading = true
          this.searchSelectClicked = true
          axios.post('get_linked_patients', { email: this.getUser.email }).then(res => {
            this.entries = res.data
            $('.v-autocomplete__content .v-select-list').hide()
          }).catch(err => {
            console.log(err)
          }).finally(() => (this.isLoading = false))
        }
      },
      logOut () {
        this.$router.push('/')
        clearInterval(this.int_logout)
        clearInterval(this.getIntervalSessionsUpdate)
        this.updateSessionsCount(0)
        this.updateCurrentSessionsCount(0)
        this.updateSharedSessionsCount(0)
        this.updateCurrentSharedSessionsCount(0)
        this.updateSessions([])
        this.updateSharedSessions([])
        this.updateAllSessions([])
        this.setSearching(false)
        Auth.logout()
        Auth.init()
      },
      fromDateToday () {
        this.search.date_start = new Date().toISOString().substr(0, 10)
        this.menu_from = false
      },
      clearFromDate () {
        this.search.date_start = ''
        this.menu_from = false
      },
      toDateToday () {
        this.search.date_end = new Date().toISOString().substr(0, 10)
        this.menu_to = false
      },
      clearToDate () {
        this.search.date_end = ''
        this.menu_to = false
      },
      // thanos,
      thanosSound (file_mp3) {
        let audio = new Audio()
        audio.src = file_mp3
        return audio
      },
      magic (elem) {
        html2canvas(elem).then(canvas => {
          canvas.className = 'canvas_session'
          let width = canvas.width
          let height = canvas.height
          let ctx = canvas.getContext('2d')
          let idata = ctx.getImageData(0, 0, width, height)
          let datums = []
          $(canvas).css({
            'top': $(elem).offset().top,
          })
          setTimeout(() => {
          }, 100)

          for (let i = 0; i < 36; i++) {
            datums.push(ctx.createImageData(width, height))
          }

          for (let f = 0; f < width; f++) {
            for (let k = 0; k < height; k++) {
              for (let l = 0; l < 2; l++) {
                let n = 4 * (k * width + f)
                let m = Math.floor(36 * (Math.random() + 2 * f / width) / 3)
                for (let p = 0; p < 4; p++) {
                  datums[m].data[n + p] = idata.data[n + p]
                }
              }
            }
          }
          let time = 0
          this.thanosSound(this.thanos_dust_arr[this.thanos_dust_count]).play()
          if (this.thanos_dust_count < 6) this.thanos_dust_count++
          else this.thanos_dust_count = 0

          datums.forEach((imagedata, i) => {
            let cloned = canvas.cloneNode()
            cloned.style.transition = 'all 1s ease-out ' + 1.5 * i / 36 + 's'
            cloned.getContext('2d').putImageData(imagedata, 0, 0)
            $('.thanos').append(cloned)
            setTimeout(() => {
              let angle = (Math.random() - 0.5) * 2 * Math.PI
              let rotateAngle = 15 * (Math.random() - 0.5)
              let cosAngle = 60 * Math.cos(angle)
              let sinAngle = 60 * Math.sin(angle)
              cloned.style.transform = `rotate(${rotateAngle}deg) translate(${cosAngle}px, ${sinAngle}px)`
              cloned.style.opacity = 0
              clearTimeout(time)
              time = setTimeout(() => {
                if (this.thanos_loop_count === Math.floor(this.thanos_elem_sessions.length / 2)) {
                  this.thanos_loop_count = 0
                  this.thanosImage.src = '/img/thanos/thanos_time.png'
                  this.thanosAnimated = false
                  this.temporary_sessions_count = this.getSessionsCount
                  this.thanos_dust_count = 0
                  setTimeout(() => this.updateSessionsCount(this.temporary_sessions_count / 2), 2500)
                }
                $('.canvas_session').remove()
                if ($(elem).hasClass('active') && $('.tab_all_files .wrap .content_box')[0]) {
                  if (this.mobileDetect) this.toggleSidebarMenu(false)
                  setTimeout(() => {
                    let content_elem = $('.tab_all_files')[0]
                    $('.tab_all_files .v-image').addClass('thanos')
                    html2canvas(content_elem).then(canvas => {
                      canvas.className = 'canvas_content'
                      let width = canvas.width
                      let height = canvas.height
                      let ctx = canvas.getContext('2d')
                      let idata = ctx.getImageData(0, 0, width, height)
                      let datums = []

                      for (let i = 0; i < 36; i++) {
                        datums.push(ctx.createImageData(width, height))
                      }
                      for (let f = 0; f < width; f++) {
                        for (let k = 0; k < height; k++) {
                          let n = 4 * (k * width + f)
                          let m = Math.floor(36 * (Math.random() + 2 * f / width) / 3)
                          for (let p = 0; p < 4; p++) {
                            datums[m].data[n + p] = idata.data[n + p]
                          }
                        }
                      }
                      let time = 0
                      this.thanosSound(this.thanos_dust_arr[this.thanos_dust_count]).play()
                      if (this.thanos_dust_count < 6) this.thanos_dust_count++
                      else this.thanos_dust_count = 0

                      datums.forEach((imagedata, i) => {
                        let cloned = canvas.cloneNode()

                        cloned.style.transition = 'all 1s ease-out ' + 1.5 * i / 36 + 's'

                        cloned.getContext('2d').putImageData(imagedata, 0, 0)
                        $('.thanos').append(cloned)
                        setTimeout(() => {
                          let angle = (Math.random() - 0.5) * 2 * Math.PI
                          let rotateAngle = 15 * (Math.random() - 0.5)
                          let cosAngle = 60 * Math.cos(angle)
                          let sinAngle = 60 * Math.sin(angle)
                          cloned.style.transform = `rotate(${rotateAngle}deg) translate(${cosAngle}px, ${sinAngle}px)`
                          cloned.style.opacity = 0
                          clearTimeout(time)
                          time = setTimeout(() => {
                            $('.canvas_content').remove()
                            setTimeout(() => {
                              if (this.mobileDetect) this.toggleSidebarMenu(true)
                              if (this.thanosAnimated) this.loop()
                            }, 100)
                          }, 2000)
                        })
                      })
                      $(content_elem).css({
                        'transition': 'opacity 1.5s ease 0s',
                        'opacity': 0,
                        'visibility': 'hidden',
                      })
                    })
                  }, 100)
                } else {
                  setTimeout(() => {
                    if (this.thanosAnimated) this.loop()
                  }, 100)
                }
              }, 2000)
            })
          })
          $(elem).css({
            'transition': 'opacity 1.5s ease 0s',
            'opacity': 0,
            'visibility': 'hidden',
          })
        })
      },
      intRandom (min, max) {
        let data = []
        let rundomnumber = null
        for (let i = 0; i < 20; i++) {
          rundomnumber = parseInt(min + Math.random() * (max - min + 1))
          if (data.indexOf(rundomnumber) == -1) data.push(rundomnumber)
        }
        return data.slice(0, 10)
      },
      snapThanos () {
        if (!this.thanosAnimated) {
          this.thanosCanvasContext = document.getElementById('thanosAnimation').getContext('2d')
          this.gauntlet_thanos = $('.gauntlet_thanos')
          this.thanos_idle = $('.thanos_idle')
          this.thanos_idle.hide()
          this.frameIndex = 0
          this.thanosGauntletClick++
          this.thanosAnimated = true
          this.thanosAnimateStart()
          setTimeout(() => { if (this.mobileDetect) this.toggleSidebarMenu(true) })
          if (this.thanosGauntletClick === 1) {
            this.thanosSound(ThanosSnap).play()
            setTimeout(() => {
              this.thanos_elem_sessions = document.querySelectorAll('.tab_session .session_box')
              this.thanos_sessions_length = this.thanos_elem_sessions.length >= 20 ? 19 : this.thanos_elem_sessions.length - 1
              this.thanos_random_num = this.intRandom(0, this.thanos_sessions_length)
              this.loop()
            }, 2400)
          } else {
            this.thanosGauntletClick = 0
            this.thanosSound(ThanosReverse).play()
            setTimeout(() => {
              $(this.thanos_elem_sessions).css({
                'opacity': 1,
                'visibility': 'visible',
              })
              $('.tab_all_files').css({
                'opacity': 1,
                'visibility': 'visible',
              })
              $('.tab_all_files .v-image').removeClass('thanos')
            }, 1000)
            setTimeout(() => {
              this.thanosAnimated = false
              this.thanosImage.src = '/img/thanos/thanos_snap.png'
            }, 4000)
            setTimeout(() => {
              this.updateSessionsCount(this.temporary_sessions_count)
            }, 3000)
          }
        }
      },
      loop () {
        setTimeout(() => {
          let elem_session = this.thanos_elem_sessions[this.thanos_random_num[this.thanos_loop_count]]
          let offset = this.thanos_random_num[this.thanos_loop_count] == 0 ? 16 : 100
          offset = elem_session.offsetTop - offset
          $('.sidebar__tab + .v-window').animate({
            scrollTop: offset,
          }, 400)
          setTimeout(() => {
            this.magic(elem_session)
          }, 450)
          this.thanos_loop_count++
        })
      },
      thanosAnimateRender () {
        this.thanosCanvasContext.clearRect(0, 0, this.thanosWidth, this.thanosHeight)
        this.thanosCanvasContext.drawImage(
          this.thanosImage,
          this.frameIndex * this.thanosWidth,
          0,
          this.thanosImage.width,
          this.thanosHeight,
          0,
          0,
          this.thanosImage.width,
          this.thanosHeight,
        )
      },
      thanosAnimateupdate () {
        this.tickCount++

        if (this.tickCount > this.thanosTicksPerFrame) {
          this.tickCount = 0

          let offset = this.frameIndex * this.thanosWidth

          if (offset < this.thanosImage.width - this.thanosWidth) {
            this.frameIndex += 1
          } else {
            this.thanos_idle.show()
            setTimeout(() => cancelAnimationFrame(this.requestId), 0)
          }
        }
      },
      thanosAnimateStart () {
        let loop = () => {
          this.thanosAnimateRender()
          this.thanosAnimateupdate()

          this.requestId = requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)
      },
      // thanos end
    },
  }
</script>


<style lang="stylus" scoped>
  
  .dialog_search {
    position: absolute
    left: 0
    right: 0
    top: 0
    margin: auto !important
    width: 124px
  }
  
  .toolbar_burger {
    @media (min-width: 1080px) {
      display: none
    }
  }
  
  .error_search_message {
    text-align: center
    color: #f00
    position: absolute
    left: 0
    right: 0
    margin: auto
    bottom: 55px
  }
  
  .sidebar {
    top: 48px
  }
  
  .my_nav {
    z-index: 100
    
    .logout {
      height: 35px !important
      margin-right: -12px !important
      padding-right: 14px
      padding-left: 13px
      font-weight: 600
      @media (max-width: 500px) {
        padding: 0
        min-width: 50px
        .v-btn__content {
          margin: 0
        }
        
        i {
          margin: 0 !important
        }
      }
    }
    
    .email {
      height: 100%
      padding: 0 20px
      display: flex
      align-items: center
      font-size: 18px
      user-select: text !important
      -webkit-touch-callout: default !important
      @media (max-width: 768px) {
        display: none
      }
    }
    
    .v-dialog__container {
      margin-left: 245px
    }
  }
  
  .search_close {
    margin: 0
    margin-left: auto
    min-width: 0
    padding: 5px
  }
  
  .headline {
    color: #fff
    
    &_search_icon {
      color: #fff
      margin-right: 7px
      font-size: 30px
    }
  }
</style>

<style lang="stylus">
  .tab_all_files .v-image.thanos:after {
    content ''
    position: absolute
    left: 0
    right: 0
    top: 0
    bottom: 0
    background #009688
  }
  
  .canvas_session {
    position: absolute
    left: 16px
    z-index: 9999
  }
  
  .canvas_content {
    position: absolute
    z-index: 9999
    right: 0
    top: 96px
  }
  
  .gauntlet_thanos {
    position: absolute
    top: -5px
    left: 50px
    width: 85px
    z-index: 9999
    
    canvas {
      cursor: pointer
      width: 55px
      height: 55px
    }
    
    .thanos_idle {
      cursor: pointer
      position: absolute
      left: 0
      top: 0
      width: 55px
      height: 55px
    }
  }
</style>
