(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-262f742b"],{"05eb":function(e,a,s){"use strict";s.r(a);var t=function(){var e=this,a=e.$createElement,s=e._self._c||a;return s("v-app",[s("v-layout",{staticClass:"align-center",attrs:{"fill-height":""}},[s("div",{staticClass:"card_wrap m-auto pa-3"},[s("v-card",{staticClass:"home_login"},[s("header",{staticClass:"header text-xs-center"},[e._v(e._s(e.$t("password_recovery_title")))]),s("v-card-text",{staticClass:"pt-4 pb-2"},[s("v-form",{ref:"form",staticClass:"my_form",attrs:{"lazy-validation":""},on:{submit:function(a){return a.preventDefault(),e.sendEmail()}},model:{value:e.valid,callback:function(a){e.valid=a},expression:"valid"}},[s("v-text-field",{staticClass:"email",attrs:{name:"email","error-messages":e.email_error,rules:e.emailRules,required:"",label:e.$t("your_email"),"prepend-inner-icon":"mdi-email",clearable:"",box:"",color:"teal accent-4"},on:{keyup:function(a){return!a.type.indexOf("key")&&e._k(a.keyCode,"enter",13,a.key,"Enter")?null:e.sendEmail()},focus:e.resetValidation,blur:e.resetValidation,input:e.resetValidation},model:{value:e.email,callback:function(a){e.email=a},expression:"email"}})],1),s("v-btn",{staticClass:"ml-0 login",attrs:{large:"",block:"",color:"teal",loading:e.loading,disabled:e.disabled},on:{click:function(a){return a.preventDefault(),e.sendEmail()}}},[e._v(e._s(e.$t("send")))])],1),s("footer",{staticClass:"footer"},[s("v-btn",{attrs:{outline:"",color:"cyan lighten-1",flat:"",to:"/"},on:{keyup:function(a){return!a.type.indexOf("key")&&e._k(a.keyCode,"space",32,a.key,[" ","Spacebar"])?null:e.$router.push("/")}}},[e._v(e._s(e.$t("back")))])],1)],1)],1),s("v-snackbar",{staticClass:"main_snackbar password_recovery",staticStyle:{"z-index":"9999"},attrs:{absolute:"",top:!0,timeout:4e3,color:"teal accent-4"},model:{value:e.info.show,callback:function(a){e.$set(e.info,"show",a)},expression:"info.show"}},[s("v-icon",{staticClass:"icon",attrs:{color:"white"}},[e._v("mdi-check")]),e._v(" "+e._s(e.info.text))],1)],1)],1)},o=[],i={en:["New videos and photos from ultrasound session are available on","","Please use your email address as your login id.","Your password is:"],de:["Neue Videos und Fotos von der Ultraschallsitzung sind auf","verfügbar","Bitte verwenden Sie Ihre E-Mail-Adresse als Login-ID.","Ihr Passwort lautet:"],ko:["초음파 세션의 새로운 비디오 및 사진은","에서 볼 수 있습니다.","이메일 주소를 로그인 ID로 사용하십시오..","귀하의 비밀번호:"],ja:["超音波セッションからの新しい動画や写真は","で入手できます","あなたのログインIDとしてあなたの電子メールアドレスを使用してください。","あなたのパスワードは："],zh:["超声会议的新视频和照片可在","上找到","请使用您的电子邮件地址作为您的登录ID。","您的密码是："],es:["Los nuevos videos y fotos de la sesión de ultrasonido están disponibles en","","Por favor, use su dirección de correo electrónico como su ID de inicio de sesión.","Tu contraseña es:"],pt:["Novos vídeos e fotos da sessão de ultra-som estão disponíveis em","","Por favor, use seu endereço de e-mail como seu ID de login.","Sua senha é:"],fr:["De nouvelles vidéos et photos de la séance d’échographie sont disponibles sur","","Veuillez utiliser votre adresse e-mail comme identifiant de connexion.","Votre mot de passe est:"],it:["Nuovi video e foto dalla sessione ad ultrasuoni sono disponibili su","","Si prega di utilizzare il tuo indirizzo email come ID di accesso.","La tua password è:"],ru:["Новые видео и фотографии с ультразвукового сеанса доступны на","","Пожалуйста, используйте свой адрес электронной почты в качестве идентификатора входа.","Ваш пароль:"]},r={name:"PasswordRecovery",data:function(){var e=this;return{info:{show:!1,text:null},color_snackbar:"",loading:!1,disabled:!1,email:null,emailRules:[function(a){return!!a||e.$t("email_is_required")},function(a){return regExp.test(a)||e.$t("email_must_be_valid")}],valid:!1,success:{status:!1,text:[]},email_error:[]}},methods:{checkError:function(e){return this.errors.hasOwnProperty(e)?this.errors[e][0]:[]},sendEmail:function(){var e=this,a=localStorage.getItem("locale_prefix_lang");this.loading=!0,setTimeout(function(){e.$refs.form.validate()?axios.post("forgot_password",{email:e.email,msg:i[a]}).then(function(){e.email="",e.$refs.form.reset(),e.color_snackbar="blue-grey darken-3",e.info.show=!0,e.info.text=e.$t("email_password_recovery_sent")}).catch(function(){e.disabled=!0,e.email_error=e.$t("email_is_not_found")}).finally(function(){e.loading=!1}):e.loading=!1},50)},resetValidation:function(){this.$refs.form.resetValidation(),this.email_error=[],this.disabled=!1}}},n=r,l=(s("3b11"),s("2877")),d=s("6544"),c=s.n(d),u=s("7496"),f=s("8336"),m=s("b0af"),v=s("99d9"),p=s("4bd4"),b=s("132d"),_=s("a722"),h=s("2db4"),k=s("2677"),g=Object(l["a"])(n,t,o,!1,null,"4a52ff5e",null);a["default"]=g.exports;c()(g,{VApp:u["a"],VBtn:f["a"],VCard:m["a"],VCardText:v["b"],VForm:p["a"],VIcon:b["a"],VLayout:_["a"],VSnackbar:h["a"],VTextField:k["a"]})},"3b11":function(e,a,s){"use strict";var t=s("5b20"),o=s.n(t);o.a},"5b20":function(e,a,s){}}]);