<template lang="pug">
  v-app(id="inspire")
    v-layout(v-if="!authorization" class="align-center home_scroll_block")
      div(class="card_wrap pa-3")
        v-form(ref="form" class="my_form" v-model="valid" lazy-validation)
          v-card(class="home_login")
            header(class="header text-xs-center") cloud-ultrasound.com
            v-card-text(class="pt-4 pb-2")
              v-text-field(
                name="email"
                class="email"
                type="email"
                v-model="form.email"
                :rules="form.emailRules"
                :error-messages="checkError('email')"
                :label="$t('your_email')"
                required
                prepend-inner-icon="mdi-email"
                clearable
                box
                color="teal accent-4"
                @focus="resetValidation"
                @blur="resetValidation"
                @input="resetValidation"
                :loading="loading"
                :disabled="loading"
                )
              v-text-field(
                name="password"
                class="password"
                :append-icon="show_pass ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show_pass ? 'text' : 'password'"
                @click:append="show_pass = !show_pass"
                v-model="form.password"
                :rules="form.passwordRules"
                :error-messages="checkError('password')"
                :label="$t('your_password')"
                required
                prepend-inner-icon="mdi-textbox-password"
                clearable
                counter
                @keyup.enter="onLogin()"
                box
                color="teal accent-4"
                @focus="resetValidation"
                @blur="resetValidation"
                @input="resetValidation"
                :loading="loading"
                :disabled="loading"
                )
              v-btn(
                large
                block
                color="teal"
                class="ml-0 login"
                :loading="loading"
                @click.prevent="onLogin()"
                :disabled="disabled"
                type="submit"
                ) {{$t('log_in')}}
            footer(class="footer")
              v-menu(max-height="150" bottom transition="slide-y-transition" :disabled="loading")
                v-btn(
                  slot="activator"
                  color="teal accent-4"
                  dark
                  outline
                  @click="resetValidation()"
                  style="padding-right: 5px;"
                  class="btn_lang"
                  )
                    <span>{{local_lang_full}}</span>
                    <v-icon style="margin: 0 2px;">mdi-menu-down</v-icon>
                v-list
                  v-list-tile(v-for="(item, i) in langs" :key="i")
                      v-list-tile-title(@click="changeLang(item)" class="select_lang_home") {{ item.title }}
              v-btn(
                @keyup.space="$router.push('/password/recovery')" 
                outline color="cyan lighten-1" 
                class="btn_forgot_password" 
                flat to="/password/recovery" 
                :disabled="loading") {{$t('forgot_password')}}
      v-snackbar(
        style="z-index: 9999"
        absolute
        :top="true"
        :timeout="snackbar_timeout"
        v-model="info.show"
        color="teal accent-4"
        class="main_snackbar home"
        ) 
          v-icon(color="white" class="icon") mdi-{{info.icon}}</v-icon> {{ info.text }}
      
      v-dialog(v-model="select_role_dialog" persistent max-width="500")
          v-card(class="select_role_dialog transparent")
              v-card-title(class="headline")
                  span {{$t('how_would_you_like_to_login')}}
              v-card-text(class="white button__group-doc__or__patient")
                  v-btn(
                    dark large block color="teal" class="as_doctor" 
                    @click="selectRole('doctor')"
                    ) <v-icon>mdi-doctor</v-icon> {{$t('as_doctor')}}
                  v-btn(
                    dark large block color="teal" class="as_patient" 
                    @click="selectRole('patient')"
                    ) <v-icon>mdi-account</v-icon> {{$t('as_patient')}}
</template>

<script>
  import Auth from '../helpers/Auth'
  import { mapGetters, mapActions } from 'vuex'

  export default {
    mounted () {
      $(window).on('keyup', function (e) {
        if (e.keyCode == 32) {
          setTimeout(() => $('*').blur(), 50)
        }
      })
      $('.v-btn').on('click', function () {
        setTimeout(() => $('.v-btn').blur(), 50)
      })
      $('.v-label').addClass('v-label--active')
    },
    created () {
      setTimeout(() => {
          $('.select_lang_home').parent().addClass('select_lang_home_li')
      })
      Auth.init()
      this.role = this.getUser.role

      let cookie = $cookies.get('local_lang')
      if (!cookie) {
        this.setLang(navigator.language.split('-')[0])
        this.$cookies.set('local_lang', this.getLang)
        cookie = this.$cookies.get('local_lang')
        localStorage.setItem('locale_prefix_lang', cookie)
      }
      if (cookie) {
        this.locale_prefix_lang = cookie
        this.$i18n.locale = this.locale_prefix_lang
        this.local_lang_full = this.$t('lang_name')
      }
      let local_lang = this.local_lang_full
      setTimeout(() => {
          $('.v-list__tile__title').each(function () {
            if ($(this).text() === local_lang) $(this).parent().addClass('active')
          })
          $('.v-list__tile__title').on('click', function () {
            $('.v-list__tile__title').parent().removeClass('active')
            $(this).parent().addClass('active')
          })
      }, 5)

      clearInterval(int_logout)
      localStorage.setItem('foo', new Date().getTime() / 1000)
      let int_logout = setInterval(() => {
          localStorage.setItem('foo', new Date().getTime() / 1000)
      }, 5000)
    },
    computed: {
      ...mapGetters([
        'iphoneDetect',
        'mobileDetect',
        'getUser',
        'getLang',
        'getIntervalSessionsUpdate',
        'getSearchInfo',
        'getHeaderAuthorization',
      ]),
    },
    data () {
      return {
        snackbar_timeout: 2000,
        role: '',
        res: null,
        select_role_dialog: false,
        select_role_loading: false,
        info: {
          timeout: 1500,
          show: false,
          text: null,
          icon: 'check',
        },
        color_snackbar: '',
        local_lang_full: 'English',
        locale_prefix_lang: 'en',
        authorization: false,
        loading: false,
        langs: [
          {
            prefix: 'en',
            title: 'English',
          },
          {
            prefix: 'de',
            title: 'Deutsch',
          },
          {
            prefix: 'ko',
            title: '한국어',
          },
          {
            prefix: 'ja',
            title: '日本語',
          },
          {
            prefix: 'zh',
            title: '简体中文',
          },
          {
            prefix: 'es',
            title: 'Español',
          },
          {
            prefix: 'pt',
            title: 'Português',
          },
          {
            prefix: 'fr',
            title: 'Français',
          },
          {
            prefix: 'it',
            title: 'Italiano',
          },
          {
            prefix: 'ru',
            title: 'Русский',
          },
        ],
        valid: false,
        disabled: false,
        show_pass: false,
        form: {
            email: null,
            emailRules: [
                v => !!v || this.$t('email_is_required'),
                v => regExp.test(v) || this.$t('email_must_be_valid'),
            ],
            password: null,
            passwordRules: [
                v => !!v || this.$t('password_is_required'),
                v => (v && v.length > 5) || this.$t('password_length'),
            ],
        },
        form_errors: {},
      }
    },
    methods: {
      ...mapActions([
        'setLang',
        'updateSearchInfo',
        'toggleSidebarMenu',
      ]),
      changeLang (item) {
        this.info.show = false
        this.snackbar_timeout = 0
        if (item.prefix !== this.locale_prefix_lang) {
          this.local_lang_full = item.title
          this.locale_prefix_lang = item.prefix
          this.$i18n.locale = this.locale_prefix_lang
          $cookies.set('local_lang', this.locale_prefix_lang)
          localStorage.setItem('locale_prefix_lang', this.locale_prefix_lang)
          this.color_snackbar = 'blue-grey darken-3'
          setTimeout(() => {
              this.info.show = true
              this.info.text = this.$t('switch_lang') + this.$t('lang_name')
              this.snackbar_timeout = 2000
          }, 100)
        }
      },
      onLogin () {
        this.loading = true
        if (this.$refs.form.validate()) {
          axios.post('login', this.form).then(response => {
            let res = response.data

            if (res.doctor_role == 1 && res.patient_role == 1) {
                this.select_role_dialog = true
                setTimeout(() => {
                    $('.v-overlay').css('background', 'linear-gradient(-45deg,#5CF0F8,#ECDDFE)')
                }, 1)
                this.res = res
            } else if (res.patient_role == 1) {
                localStorage.setItem('role', 'patient')
                this.authInit(res)
                this.$router.push('/patient')
            } else if (res.doctor_role == 1) {
                this.updateSearchInfo({
                    name: '',
                    date_start: '',
                    date_end: '',
                    doc_email: res.email,
                })
                localStorage.setItem('role', 'doctor')
                this.authInit(res)
                this.$router.push('/doctor')
            } else if (res.shared_role == 1) {
                localStorage.setItem('role', 'guest')
                this.authInit(res)
                this.$router.push('/guest')
            }
          }).catch(() => {
            this.form_errors = { 'email': [this.$t('email_or_pass_error')] }
            this.disabled = true
          }).finally(() => {
            setTimeout(() => this.loading = false, 500)
          })
        } else {
          this.loading = false
        }
      },
      resetValidation () {
        this.$refs.form.resetValidation()
        this.disabled = false
        this.form_errors = []
      },
      selectRole (role) {
        if (role == 'patient') {
          localStorage.setItem('role', 'patient')
          this.authInit(this.res)
          this.$router.push('/patient')
        }
        if (role == 'doctor') {
          localStorage.setItem('role', 'doctor')
          this.authInit(this.res)
          this.$router.push('/doctor')
        }
      },
      authInit (res) {
        Auth.login(res)
        Auth.init()
      },
      checkError (field) {
        return this.form_errors.hasOwnProperty(field) ? this.form_errors[field][0] : []
      },
    },
  }
</script>

<style lang="stylus" scoped>
  @import '../assets/styles/variables.styl'
  
  @media (max-width: 500px) {
      .btn_forgot_password {
          font-size: 12px
          padding-left: 7px
          padding-right: 7px
      }
      
      .btn_lang {
          font-size: 12px
          padding-left: 7px
          padding-right: 7px
      }
  }
  
  @media (orientation: portrait) and (max-width: 600px) {
      .button__group-doc__or__patient {
          flex-direction: column
          
          button {
              padding: 10px 0
          }
      }
  }
  
  @media (max-width: 400px) {
      .btn_forgot_password {
          font-size: 10px
          padding-left: 5px
          padding-right: 5px
      }
      
      .btn_lang {
          font-size: 10px
          padding-left: 5px
          padding-right: 5px
      }
  }
  
  .home_scroll_block {
      overflow-y: auto
      height: 100vh
  }
  
  .gradient_overlay {
      background: linear-gradient(-45deg, #5CF0F8, #ECDDFE) !important
  }
  
  .v-menu__content {
      min-width: 120px !important
  }
  
  .select_role_dialog {
      .headline {
          background: gradient_1
          color: #fff
          font-size: 50px
          @media (max-width: 900px) {
              font-size: 40px;
          }
          
          @media (max-width: 700px) {
              font-size: 30px;
          }
      }
      
      .v-card__text {
          display: flex
          
          .as_doctor {
              margin-right: 15px
              font-weight: 700
          }
          
          .as_patient {
              font-weight: 700
          }
          
          .v-icon {
              margin-right: 5px
          }
      }
      
  }
  
  .card_wrap {
      width: 100%
      max-width: 600px
      margin: auto
      
      .home_login {
          .header {
              background: gradient_1
              color: #fff
              font-size: 50px
              padding: 10px 0
              @media (max-width: 900px) {
                  font-size: 40px;
              }
              
              @media (max-width: 700px) {
                  font-size: 30px;
              }
          }
          
          .login {
              font-size: 26px !important
              color: #fff
              height: 48px
              @media (max-width: 500px) {
                  font-size: 22px !important
                  height: 41px
              }
          }
          
          .footer {
              display: flex
              justify-content: space-between
              padding: 0 8px
              padding-bottom: 10px
              @media (max-width: 650px) {
                  flex-wrap: wrap;
              }
          }
          
          .btn_change_lang,
          .btn_change_lang .v-btn {
              padding: 0 !important
              min-width: auto
          }
          
          .btn_change_lang .v-btn__content {
              margin: 0 !important
          }
      }
      
  }
</style>

<style lang="stylus">
  input {
      &:-webkit-autofill {
          // Expose a hook for JavaScript when auto fill is shown.
          // JavaScript can capture 'animationstart' events
          animation-name: onAutoFillStart;
          
          // Make the backgound color become yellow _really slowly_
          transition: background-color 50000s ease-in-out 0s;
      }
      
      &:not(:-webkit-autofill) {
          // Expose a hook for JS onAutoFillCancel
          // JavaScript can capture 'animationstart' events
          animation-name: onAutoFillCancel;
      }
  }
  
  @keyframes onAutoFillStart {
      from {
      }
      to {
      }
  }
  
  @keyframes onAutoFillCancel {
      from {
      }
      to {
      }
  }
</style>
