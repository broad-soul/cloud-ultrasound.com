<template lang="pug">
  clazy-load(
    :src=`file.type === 'video' ? file.thumbnail : file.resource_v2`
    @error="notFoundImgA(index, '.tab_'+item, file.type)")
    v-img(
      height="200px"
      :src=`file.type === 'video' ? file.thumbnail : file.resource_v2`
      @click="showModalA(index)"
      )
      div(
        v-if="item === 'all_files'"
        class="file_icon_inner_img"
        :class=`file.type`
        )
        v-icon mdi-{{ file.type === 'video' ? 'play-circle-outline' : 'camera' }}
      v-fade-transition(v-if="!mobileDetect")
        v-btn(v-if="hover" class="btn_active_carousel")
    div(class="preloader" slot="placeholder")
      v-img(
        class="gradient_img"
        height="200px"
        @click="showModalA(index)"
        )
        div(class="lds-ellipsis")
          each i in [1, 2, 3, 4]
            div

</template>

<script>
  import {
    mapState,
    mapGetters,
    mapActions,
  } from 'vuex'

  export default {
    name: 'CardItem',
    props: {
      index: Number,
      item: String,
      hover: Boolean,
      file: Object,
      showModal: Function,
      notFoundImg: Function,
    },
    computed: {
      ...mapGetters([
        'mobileDetect',
        'iosDetect',
        'iphoneDetect',
      ]),
    },
    methods: {
      showModalA (index) {
        this.showModal(index)
      },
      notFoundImgA (index, selector, type) {
        this.notFoundImg(index, selector, type)
      },
    },
  }
</script>


<style lang="stylus" scoped>
  .btn_active_carousel {
    height: 100%
    width: 100%
    margin: 0
    background: linear-gradient(45deg, rgba(71, 174, 163, 0.7), rgba(8, 177, 197, 0.8)) !important
    color: #fff
    
    .eye {
      font-size: 30px
    }
  }
  
  .lds-ellipsis {
    display: inline-block
    position: absolute
    width: 64px
    height: 64px
    margin: auto
    left: 0
    right: 0
    bottom: 0
    top: 0
    
    div {
      position: absolute
      top: 27px
      width: 11px
      height: 11px
      border-radius: 50%
      background: #fff
      animation-timing-function: cubic-bezier(0, 1, 1, 0)
      
      &:nth-child(1) {
        left: 6px
        animation: lds-ellipsis1 0.6s infinite
      }
      
      &:nth-child(2) {
        left: 6px
        animation: lds-ellipsis2 0.6s infinite
      }
      
      &:nth-child(3) {
        left: 26px
        animation: lds-ellipsis2 0.6s infinite
      }
      
      &:nth-child(4) {
        left: 45px
        animation: lds-ellipsis3 0.6s infinite
      }
    }
  }
  
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0)
    }
    100% {
      transform: scale(1)
    }
  }
  
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1)
    }
    100% {
      transform: scale(0)
    }
  }
  
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0)
    }
    100% {
      transform: translate(19px, 0)
    }
  }
</style>
