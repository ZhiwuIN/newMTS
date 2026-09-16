<template>
  <view @click="handleClick" class="w-100  "
    :class="{ ios_scroll_style: iosScroll, 'position-fixed': !iosScroll, 'left-0': !iosScroll, 'bottom-0': !iosScroll }"
    style="z-index: 42" v-if="true" :style="barTop">
    <view v-show="focus">
      <view class="w_100 flex border-box justify-center mb-2" style="z-index: 42">
        <view v-show="firstKey == 0">
          <view class="flex w-678 flex-column shadow-lg bg-white border-box p-3 rounded-radius-l">
            <text class="mb-2 font-md font-weight-bold">{{ text0.title }}</text>
            <view class="flex justify-between">
              <view class="bg-page pl-3 py-2 flex align-center rounded-radius-l">
                <image v-for="item in text0.list1" @click="setTextStyle(item)" :key="item.id" class="mr-3 handle_icon"
                  :src="formats[item.key] == item.val ? item.iconAct : item.icon" mode=""></image>
              </view>
              <view class="bg-page pl-3 py-2 flex align-center rounded-radius-l">
                <image v-for="item in text0.list2" @click="setTextStyle(item)" :key="item.id" class="mr-3 handle_icon"
                  :src="formats[item.key] == item.val ? item.iconAct : item.icon" mode=""></image>
              </view>
            </view>
          </view>
        </view>
        <view v-show="firstKey == 1">
          <view class="flex w-678 flex-column shadow-lg bg-white border-box px-3 pt-3 rounded-radius-l">
            <view v-for="(item, index) in text1" class="mb-3 flex flex-column" :key="index">
              <text class="mb-2 font-md font-weight-bold">{{ item.title }}</text>
              <view class="flex align-center">
                <view @click="setTextStyle(it)" v-for="it in item.list" :style="'background: ' + it.color" :key="it.id"
                  class="mr-2 flex align-center justify-center color_item">
                  <image v-if="!it.icon && formats[it.key] == it.val" src="/static/edit_icon/success.png"
                    style="height: 30rpx; width: 30rpx;" mode=""></image>
                  <image v-if="it.icon" :src="it.icon" class="color_item" mode=""></image>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-show="firstKey == 2">
          <view class="flex w-678 flex-column shadow-lg bg-white border-box pl-3 py-3 rounded-radius-l">
            <text class="mb-2 font-md font-weight-bold">{{ text2.title }}</text>
            <scroll-view scroll-x style="width: 648rpx;" class="">
              <view class="flex align-center justify-start pr-4">
                <view @click="setTextStyle(item)" v-for="item in text2.list" :key="item.id"
                  :class="[formats[item.key] == item.val ? 'bg-admin-secoed' : 'bg-page']"
                  class="size_item px-2 mr-2 flex align-center justify-center">
                  <text :class="[formats[item.key] == item.val ? 'text-p-admin' : '']" class="font-md-l">{{ item.text
                  }}</text>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </view>
    <view v-show="focus">
      <view class="w_100 flex border-box pt-1 pb-2 bg-white " :class="{ 'border-top': !iosScroll }" style="z-index: 42">
        <view hover-class="bg-hover" class="flex-1 flex justify-center align-center" @click="topLTap(item)"
          v-for="item in handleList" :key="item.id">
          <view class="flex align-center justify-center handle_item">
            <image v-if="!item.text" :src="firstKey == item.id ? item.iconAct : item.icon" class="handle_icon"></image>
            <view v-else class="flex align-center">
              <text :style="'color: ' + (firstKey == item.id ? item.colorAct : item.color)" class="font-lg mr-1">{{
                item.text }}</text>
              <image v-if="firstKey == item.id" src="/static/edit_icon/down.png" style="height: 16rpx; width: 16rpx;"
                mode=""></image>
              <image v-else src="/static/edit_icon/up.png" style="height: 16rpx; width: 16rpx;" mode=""></image>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * @author			前端小能手
 * 富文本控件
 * 跟随键盘
 */
import component from './components.js'
export default {
  mixins: [component],
  props: {
    formats: Object,
    focus: Boolean,
    iosScroll: Boolean,
    pageScrollTop: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      firstKey: -1,
      keyHei: 0,
      handleList: [
        {
          id: 0,
          name: this.$t('文字样式'),
          icon: '/static/edit_icon/text.png',
          iconAct: '/static/edit_icon/text_act.png',
        },
        {
          id: 1,
          name: this.$t('颜色'),
          icon: '/static/edit_icon/color.png',
          iconAct: '/static/edit_icon/color_act.png',
        },
        {
          id: 2,
          name: this.$t('字号'),
          text: 20,
          icon: 'arrow-down-fill',
          iconAct: 'arrow-up-fill',
          color: '#333333',
          colorAct: '#6B5AF7',
        },
        // 新增：插入图片按钮
        {
          id: 5,
          name: '插入图片',
          icon: '/static/edit_icon/img.png',
          iconAct: '/static/edit_icon/img_act.png',
        },
        {
          id: 3,
          name: this.$t('撤销'),
          icon: '/static/edit_icon/last_act.png',
        },
        {
          id: 4,
          name: this.$t('下一步'),
          icon: '/static/edit_icon/next_act.png',
        },
      ],
      text0: {
        title: this.$t('文本选项'),
        list1: [
          {
            id: 0,
            icon: '/static/edit_icon/align_l.png',
            iconAct: '/static/edit_icon/align_l_act.png',
            key: 'align',
            val: 'left',
          },
          {
            id: 1,
            icon: '/static/edit_icon/align_c.png',
            iconAct: '/static/edit_icon/align_c_act.png',
            key: 'align',
            val: 'center',
          },
          {
            id: 2,
            icon: '/static/edit_icon/align_r.png',
            iconAct: '/static/edit_icon/align_r_act.png',
            key: 'align',
            val: 'right',
          },
        ],
        list2: [
          {
            id: 0,
            icon: '/static/edit_icon/overstriking.png',
            iconAct: '/static/edit_icon/overstriking_act.png',
            key: 'bold',
            // #ifdef APP-PLUS
            val: true,
            // #endif
            // #ifdef MP
            val: 'strong',
            // #endif
          },
          {
            id: 1,
            icon: '/static/edit_icon/incline.png',
            iconAct: '/static/edit_icon/incline_act.png',
            key: 'italic',
            // #ifdef APP-PLUS
            val: true,
            // #endif
            // #ifdef MP
            val: 'em',
            // #endif
          },
          {
            id: 2,
            icon: '/static/edit_icon/underline.png',
            iconAct: '/static/edit_icon/underline_act.png',
            key: 'underline',
            val: true,
          },
          {
            id: 3,
            icon: '/static/edit_icon/strikethrough.png',
            iconAct: '/static/edit_icon/strikethrough_act.png',
            key: 'strike',
            // #ifdef APP-PLUS
            val: true,
            // #endif
            // #ifdef MP
            val: 'del',
            // #endif
          },
        ],
      },
      text1: [
        {
          title: this.$t('文字颜色'),
          list: [
            { id: 0, color: '#333333', key: 'color', val: '#333333' },
            { id: 1, color: '#666666', key: 'color', val: '#666666' },
            { id: 2, color: '#999999', key: 'color', val: '#999999' },
            { id: 3, color: '#ff0000', key: 'color', val: '#ff0000' },
            { id: 4, color: '#ff5f2d', key: 'color', val: '#ff5f2d' },
            { id: 5, color: '#f1b000', key: 'color', val: '#f1b000' },
            { id: 6, color: '#00c878', key: 'color', val: '#00c878' },
            { id: 7, color: '#09abff', key: 'color', val: '#09abff' },
            { id: 8, color: '#0963ff', key: 'color', val: '#0963ff' },
            { id: 9, color: '#6b5af7', key: 'color', val: '#6b5af7' },
          ],
        },
        {
          title: this.$t('文字背景颜色'),
          list: [
            { id: 0, color: '#ffcfcf', key: 'backgroundColor', val: '#ffcfcf' },
            { id: 1, color: '#ffd6c9', key: 'backgroundColor', val: '#ffd6c9' },
            { id: 2, color: '#fff0c8', key: 'backgroundColor', val: '#fff0c8' },
            { id: 3, color: '#c2ffe6', key: 'backgroundColor', val: '#c2ffe6' },
            { id: 4, color: '#bee8ff', key: 'backgroundColor', val: '#bee8ff' },
            { id: 5, color: '#c5daff', key: 'backgroundColor', val: '#c5daff' },
            { id: 6, color: '#c9c2ff', key: 'backgroundColor', val: '#c9c2ff' },
            { id: 7, color: '', icon: '/static/edit_icon/empty_fill.png', key: 'backgroundColor', val: '', },
          ],
        },
      ],
      text2: {
        title: this.$t('字号'),
        list: [],
      },
      secondList: [],
    }
  },
  methods: {
    handleInput() {
      this.firstKey = -1
    },
    topLTap(item) {
      if (item.id == 3) {
        this.$emit('last')
        return
      }
      if (item.id == 4) {
        this.$emit('next')
        return
      }
      // 点击插入图片
      if (item.id === 5) {
        this.$emit('insertImg')
        return
      }

      const key = item.id
      if (this.firstKey != key) {
        this.firstKey = -1
        setTimeout(() => {
          this.firstKey = key
        }, 320)
      } else {
        this.firstKey = -1
      }
    },
    secondHandle(item) {
      this.$emit('secondHandle', item)
    },
    handleClick() {
      this.$emit('topLTap')
      this.$emit('handleClick')
    },
    setTextStyle(item) {
      this.$emit('secondHandle', item)
    },
  },
  computed: {
    barTop() {
      const keyHei = this.keyHei
      if (!keyHei) {
        return ''
      }
      const isIos = uni.getSystemInfoSync().platform == 'ios'
      // #ifndef APP-PLUS
      if (isIos && this.statusBarHeight > 20) {
        return `bottom: ${keyHei - this.pageScrollTop}px;`
      }
      return ''
      // #endif

      // #ifdef APP-PLUS
      const isNotch = plus.navigator.hasNotchInScreen()
      if (isNotch && isIos) {
        return `bottom: ${keyHei - this.pageScrollTop}px;`
      }
      // #endif
      return `bottom: ${keyHei}px;`
    },
    barTop1() {
      // #ifdef MP
      return ''
      // #endif
      const keyHei = this.keyHei
      if (!keyHei) {
        return ''
      }
      // #ifdef APP-PLUS
      const isNotch = plus.navigator.hasNotchInScreen()
      const isIos = uni.getSystemInfoSync().platform == 'ios'
      if (isNotch && isIos) {
        return `bottom: ${keyHei - this.pageScrollTop}px;`
      }
      // #endif
      return `bottom: ${keyHei}px;`
    },
  },
  mounted() {
    for (let i = 12; i <= 30; i++) {
      this.text2.list.push({
        id: i - 12,
        text: i,
        size: i + 'px',
        key: 'fontSize',
        val: i + 'px',
      })
    }
    uni.onKeyboardHeightChange((res) => {
      this.keyHei = res.height
    })
  },
  watch: {
    keyHei(val) {
      console.log(val)
    },
    focus(val) {
      if (val) {
        setTimeout(() => {
          uni.onKeyboardHeightChange((res) => {
            this.keyHei = res.height
          })
        }, 80)
      }
    },
  },
}
</script>

<style scoped>
@import url("./common.css");

.handle_item {
  height: 50rpx;
  width: 50rpx;
}

.handle_icon {
  height: 44rpx;
  width: 44rpx;
}

.item_active {
  border: 2px solid #8757fc;
  border-radius: 50%;
}

.color_item {
  height: 40rpx;
  width: 40rpx;
  border-radius: 10rpx;
}

.size_item {
  height: 80rpx;
  width: 80rpx;
  border-radius: 20rpx;
}

.ios_scroll_style {
  position: absolute;
  bottom: 0rpx;
  left: 0rpx;
  width: 100%;
}
</style>