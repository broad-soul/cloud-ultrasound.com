<template lang="pug">

  div(class="wrap")
    div(class="center")
      h1 Whoops, 404
      p(class="white--text") The page you were looking for does not exist
      
      v-btn(
        outline
        color="indigo accent-2"
        large
        class="button"
        @click="goBack()"
        ) Go back
        
      v-btn(
        outline
        color="indigo accent-2"
        large
        class="button"
        @click="goHome()"
      ) Go home
      
</template>

<script>
  export default {
    name: 'Error',
    created () {
      clearInterval(int)
      let int = setInterval(() => {
        localStorage.setItem('foo', new Date().getTime() / 1000)
      }, 5000)
    },
    methods: {
      goBack () {
        this.$router.go(-1)
      },
      goHome () {
        this.$router.push({ path: '/' })
      },
    },
  }
</script>

<style scoped lang="stylus">
  .wrap
    height 100vh
    background linear-gradient(-45deg, #97F7FB, #8D8AFC)
    display flex
    
    h1
      color #536DFE
    
    .center 
      max-width 600px
      margin auto
      text-align center
      font-size 25px
      
      .button
        font-size 16px !important
</style>
