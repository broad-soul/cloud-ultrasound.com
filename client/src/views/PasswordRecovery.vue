<template lang="pug">
  v-app
    v-layout(fill-height class="align-center")
      div(class="card_wrap m-auto pa-3")
        v-card(class="home_login")
          header(class="header text-xs-center") {{$t('password_recovery_title')}}
          v-card-text(class="pt-4 pb-2")
            v-form(
              ref="form" 
              class="my_form" 
              v-model="valid" 
              lazy-validation 
              @submit.prevent="sendEmail()"
              )
                v-text-field(
                  name="email"
                  @keyup.enter="sendEmail()"
                  v-model="email"
                  :error-messages="email_error"
                  :rules="emailRules"
                  required
                  class="email"
                  :label="$t('your_email')"
                  prepend-inner-icon="mdi-email"
                  clearable
                  box
                  color="teal accent-4"
                  @focus="resetValidation"
                  @blur="resetValidation"
                  @input="resetValidation"
                  )
            v-btn(
                large 
                block 
                color="teal" 
                class="ml-0 login" 
                :loading="loading" 
                @click.prevent="sendEmail()" 
                :disabled="disabled") {{$t('send')}}
          footer(class="footer")
            v-btn(
              @keyup.space="$router.push('/')" 
              outline color="cyan lighten-1" 
              flat to="/") {{$t('back')}}
      v-snackbar(
        style="z-index: 9999"
        absolute
        :top="true"
        :timeout="4000"
        v-model="info.show"
        color="teal accent-4"
        class="main_snackbar password_recovery"
        )
          v-icon(color="white" class="icon") mdi-check</v-icon> {{ info.text }}
</template>

<script>
  import email_message from '../email/password-recovery'

  export default {
    name: 'PasswordRecovery',
    data () {
      return {
        info: {
          show: false,
          text: null
        },
        color_snackbar: '',
        loading: false,
        disabled: false,
        email: null,
        emailRules: [
          v => !!v || this.$t('email_is_required'),
          v => regExp.test(v) || this.$t('email_must_be_valid'),
        ],
        valid: false,
        success: {
          status: false,
          text: [],
        },
        email_error: [],
      }
    },
    methods: {
      checkError (field) {
        return this.errors.hasOwnProperty(field) ? this.errors[field][0] : []
      },
      sendEmail () {
        let pr = localStorage.getItem('locale_prefix_lang')
        this.loading = true
        setTimeout(() => {
          if (this.$refs.form.validate()) {
            axios.post('forgot_password', {
              email: this.email,
              msg: email_message[pr],
            }).then(() => {
              this.email = ''
              this.$refs.form.reset()
              this.color_snackbar = 'blue-grey darken-3'
              this.info.show = true
              this.info.text = this.$t('email_password_recovery_sent')
            }).catch(() => {
              this.disabled = true
              this.email_error = this.$t('email_is_not_found')
            }).finally(() => {
              this.loading = false
            })
          } else {
            this.loading = false
          }
        }, 50)
      },
      resetValidation () {
        this.$refs.form.resetValidation()
        this.email_error = []
        this.disabled = false
      },
    },
  }
</script>

<style lang="stylus" scoped>
  @import '../assets/styles/variables.styl'
  
  .card_wrap {
    width: 100%
    max-width: 600px
    
    .home_login {
      .header {
        background: gradient_1
        color: #fff
        font-size: 40px
        padding: 10px 0
        @media (max-width: 900px) {
            font-size: 40px
        }
        @media (max-width: 700px) {
            font-size: 30px
        }
      }
      
      .login {
        font-size: 26px !important
        color: #fff
        height: 48px
      }
      
      .footer {
        display: flex
        justify-content: flex-end
        padding: 0 8px
        padding-bottom: 10px
    }
    }
  }
</style>
