<script>
import {
  postAddApi,
} from '@/common/api/article.js'
import {
  s3upload,
  s3uploads,
} from '@/common/api/home.js'
import knEdit from '@/components/lf-kn-editor/kn_editor.vue'

export default {
  components: {
    knEdit,
  },
  data() {
    return {
      tempFilePathsList: [],
      title: '',
      content: '',
      cover: '',
      pageScrollTop: 0,
      isFB: false,
      topStyle2: '',
    }
  },
  onLoad() {
    this.mtop()
  },
  methods: {
    selectImage() {
      const that = this // 固定写法，解决 this 指向问题
      uni.chooseImage({
        count: 9, // 最多选9张
        sourceType: ['album', 'camera'],
        success(res) {
          that.tempFilePathsList = that.tempFilePathsList.concat(res.tempFilePaths)
        },
      })
    },
    // 删除图片
    delImage(index) {
      this.tempFilePathsList.splice(index, 1)
    },
    mtop() {
      let statusBarHeight
      let navBarHeight
      // #ifdef APP-PLUS
      // App端
      const sys = uni.getSystemInfoSync()
      statusBarHeight = sys.statusBarHeight
      // 安卓/iOS导航栏高度适配
      if (sys.platform === 'android') {
        navBarHeight = 96
      }
      else {
        navBarHeight = 88
      }
      // #endif

      // #ifdef H5
      // H5端
      statusBarHeight = 0
      navBarHeight = 88
      // #endif
      let mtopValue
      // 计算scroll-view高度
      uni.getSystemInfo({
        success: (res) => {
          mtopValue = statusBarHeight / 2 + navBarHeight
        },
      })
      // #ifdef H5
      this.topStyle2 = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
      // #endif
      // #ifdef APP-PLUS
      this.topStyle2 = `height:calc(100vh);`
      // #endif
    },
    bindblur(e) {
      this.content = e.detail.value.detail.html
    },
    // 发布
    async onPost() {
      if (this.isFB)
        return
      if (!this.title) {
        this.$showMessage('warning', this.$t('请输入标题'))
        return
      }
      if (!this.content) {
        this.$showMessage('warning', this.$t('请输入内容'))
        return
      }
      this.isFB = true
      uni.showLoading({
        title: this.$t('loading.btn'),
      })
      try {
        let images = []
        if (this.tempFilePathsList.length > 0) {
          const uploadRes = await s3uploads(this.tempFilePathsList)
          images = uploadRes.data
        }
        const postRes = await postAddApi({
          title: this.title,
          content: this.content,
          images,
        })
        this.$showMessage('info', this.$t('发布成功'))
        uni.hideLoading()
        setTimeout(() => {
          this.isFB = false
          this.$customizeBack()
        }, 1500)
      }
      catch (err) {
        this.isFB = false
        uni.hideLoading()
        console.log('发布失败', err)
        this.$showMessage('warning', err?.msg || 'error')
      }
    },
    // 清空标题
    clearWithdrawAmount() {
      this.title = ''
    },
    uploadImgBefore(tempFiles) {
      // 本地图片临时路径 tempFiles
      console.log(tempFiles)
      s3upload(tempFiles).then((res) => {
        // 拿到地址后
        let paht = res.data.url
        this.$refs.contentEdit.insertImage(paht)
      })
    },
  },
  onPageScroll(e) {
    console.log(e)
    this.pageScrollTop = e.scrollTop
  },
}
</script>

<template>
  <view class="Big_bgi" :style="topStyle2" />
  <view class="articleCreation">
    <view class="header">
      <view class="left_box">
        <image src="/static/back_icon.png" class="back_img" @click="$customizeBack" />
        <view>{{ $t('创作') }}</view>
      </view>
      <view class="right_box">
        <view class="main_box" @click="onPost">
          {{ $t('发布') }}
        </view>
      </view>
    </view>
    <!-- 主要区域 -->
    <view class="main_box">
      <view class="title">
        {{ $t('标题') }}
      </view>
      <!-- 标题 -->
      <view class="title_input">
        <input
          v-model="title" :placeholder="$t('请输入文章标题')"
          placeholder-style="color: rgba(0,0,0,.4);font-size: 32rpx;font-weight: 500;"
        >
        <text v-if="title" class="clear" @tap="clearWithdrawAmount">×</text>
      </view>
      <!-- 内容 -->
      <view class="content">
        <view class="title">
          {{ $t('文章内容') }}
        </view>
        <!-- <textarea v-model="content" :placeholder="$t('请输入主要文本')" :maxlength="250" /> -->
        <kn-edit
          ref="contentEdit" v-model="content" show-insert-img :page-scroll-top="pageScrollTop"
          @upload-img-before="uploadImgBefore" @bindblur="bindblur"
        />
      </view>
      <!-- 图片 -->
      <view class="content img_box">
        <view class="title">
          {{ $t('图片') }}
        </view>
        <view class="img_main_box">
          <view v-for="(item, index) in tempFilePathsList" v-if="tempFilePathsList.length" class="item_box">
            <image :src="item" class="item_img" />
            <!-- 删除按钮 -->
            <view class="del-btn" @click="delImage(index)">
              ×
            </view>
          </view>
          <view>
            <image src="/static/article/Wrapper.png" class="item_img" @click="selectImage" />
            <!-- <view>x</view> -->
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.img_box {
  border-bottom: 4rpx solid #f4f6f8;
  padding-bottom: 24rpx;

  .img_main_box {
    display: flex;
    flex-wrap: wrap;
    gap: 15.3rpx;

    .item_box {
      position: relative;
      width: 160rpx;
      height: 160rpx;
    }

    .item_img {
      width: 160rpx;
      height: 160rpx;
    }
  }
}

.del-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: red;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.Big_bgi {
  position: fixed;
  left: 0;
  top: 0;
  z-index: -1;
  width: 100%;
  background: #f4f6f8;
}

::v-deep .uni-textarea-placeholder {
  font-size: 32rpx;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.4);
}

::v-deep uni-textarea {
  width: 100%;
  height: 400rpx;
  border-bottom: 4rpx solid #f4f6f8;
}

::v-deep .uni-textarea-textarea {
  font-size: 32rpx;
  font-weight: 500;
  color: #3D3D3D;
}

::v-deep .ql-editor.ql-blank::before {
  font-family: MiSans;
  font-size: 32rpx;
  font-style: normal;
  color: rgba(0, 0, 0, 0.4);
}

.articleCreation {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 34rpx;
    background-color: #fff;
    /* #ifdef APP-PLUS */
    padding-top: 80rpx;
    /* #endif */

    .left_box {
      display: flex;
      align-items: center;
      gap: 16rpx;
      font-size: 36rpx;
      color: #000000;

      .back_img {
        width: 48rpx;
        height: 48rpx;
      }
    }

    .right_box {
      .main_box {
        display: flex;
        padding: 8rpx 16rpx;
        background-color: $themeColor;
        border-radius: 2026rpx;
        font-size: 32rpx;
        color: #fff;
      }
    }

  }

  .main_box {
    padding: 32rpx;
    background-color: #fff;

    .title_input {
      position: relative;
      background: #FFFFFF;

      input {
        height: 84rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #3D3D3D;
        line-height: 36rpx;
        text-align: left;
        font-style: normal;
        padding-right: 62rpx;
        border-bottom: 4rpx solid #f4f6f8;
      }

      .clear {
        position: absolute;
        right: 20rpx;
        top: 50%;
        transform: translateY(-54%);
        font-size: 40rpx;
        color: #999;
      }
    }

    .content {
      .title {
        margin-top: 32rpx;
        margin-bottom: 16rpx;
      }
    }
  }

}
</style>
