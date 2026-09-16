<script>
import {
  addFavoriteApi,
  commentAddApi,
  commentRootListApi,
  postInfoApi,
  removeFavoriteApi,
} from '@/common/api/article.js'

import {
  formatRichText,
} from '@/utils/utils'

export default {
  data() {
    return {
      commentTotal: 0,
      currentSwiperi: 1, // 轮播图指示器
      commentList: [],
      comment: {
        content: '',
      },
      webTitle: '',
      pageTitle: '',
      articleInfo: {},
      id: '',
      page: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      hasMore: true,
    }
  },
  methods: {
    // 图片预览
    unPreviewImage() {
      uni.previewImage({
        urls: this.articleInfo.images,
        showmenu: false,
        current: this.currentSwiperi - 1,
        longPressActions: {
          itemList: [''],
          success(data) {

          },
          fail(err) {
            console.log(err.errMsg)
          },
        },
      })
    },
    // 轮播图切换
    handleChange(e) {
      this.currentSwiperi = e.detail.current + 1
    },
    getCommentRootList() {
      if (this.loading)
        return
      this.loading = true
      commentRootListApi(this.id, this.page).then((res) => {
        if (this.page.pageNum === 1)
          this.commentList = res.data.rows || []
        else this.commentList.push(...res.data.rows)
        this.commentTotal = res.data.total
        this.hasMore = this.commentList.length < res.data.total
      }).catch((err) => {
        this.$showMessage('warning', err.msg)
      }).finally(() => {
        this.loading = false
      })
    },
    postComment() {
      if (this.loading)
        return
      this.comment.content = this.comment.content.trim()
      if (!this.comment.content) {
        this.$showMessage('warning', this.$t(('请输入内容')))
        return
      }
      this.loading = true
      commentAddApi({
        postId: this.id,
        content: this.comment.content,
      }).then((res) => {
        this.$showMessage('info', this.$t(('发布成功')))
        this.comment.content = ''
      }).catch((err) => {
        this.$showMessage('warning', err.msg)
      }).finally(() => {
        this.loading = false
      })
    },
    formatNumber(num) {
      if (!num && num !== 0)
        return '0'
      if (num > 9999) {
        return '9,999+'
      }
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    getNoticeDetails() {
      postInfoApi(this.id).then((res) => {
        this.articleInfo = res.data
        this.articleInfo.content = formatRichText(this.articleInfo.content)
      }).catch((err) => {
        this.$showMessage('warning', err.msg)
      })
    },
    onReachBottom() {
      if (!this.loading && this.hasMore) {
        this.page.pageNum = Math.floor(this.commentList.length / this.page.pageSize) + 1
        this.getCommentRootList()
      }
    },
    like() {
      const api = this.articleInfo.favorited ? removeFavoriteApi(this.id) : addFavoriteApi(this.id)
      api.then((res) => {
        this.articleInfo.favoriteCount += this.articleInfo.favorited ? -1 : 1
        this.articleInfo.favorited = !this.articleInfo.favorited

        if (this.articleInfo.favorited) {
          this.$showMessage('info', this.$t('点赞成功'))
        }

        // 通知列表页更新
        uni.$emit('articleLikeChange', {
          id: this.id,
          favorited: this.articleInfo.favorited,
          favoriteCount: this.articleInfo.favoriteCount,
        })
      }).catch((err) => {
        this.$showMessage('warning', err.msg)
      })
    },
    // 浏览量+1
    addViewCount() {
      uni.$emit('articleViewChange', {
        id: this.id,
      })
    },
  },
  onLoad(options) {
    this.pageTitle = options.title
    this.id = options.id
    this.webTitle = uni.getStorageSync('settings').webTitle
    this.getNoticeDetails()
    this.getCommentRootList()
    this.addViewCount()
  },
}
</script>

<template>
  <!-- <customnavbar :title="pageTitle || ''" backgroundStr="#fff" @mtop='mtop'> -->
  <view class="header_box">
    <view class="left_box">
      <image src="/static/back_icon.png" class="back_img" @click="$customizeBack" />
      <view class="author_box">
        <view class="ava_box">
          <image class="ava_img" mode="aspectFill" fit="fill"
            :src="articleInfo.userType == 'member' ? (articleInfo.avatar || '/static/default-avatar.png') : '/static/1024.png'" />
          <view class="text_box">
            <view>{{ articleInfo.userType !== 'member' ? webTitle : (articleInfo.username || '***') }}</view>
            <view class="date">
              {{ articleInfo.publishTime || '--' }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view>
      <view v-if="articleInfo?.vipLevel && articleInfo?.userType == 'member'" class="level_box">
        <image class="vipLevelImage" fit="fill" :src="articleInfo?.vipLevelImage" />
        <view>{{ articleInfo?.vipLevel }}</view>
      </view>
    </view>
  </view>
  <!-- 轮播图 -->
  <view v-if="articleInfo.images?.length" class="swiper_box">
    <swiper :autoplay="true" style="height: 620rpx;" @change="handleChange">
      <swiper-item v-for="(item, index) in articleInfo.images" :key="index" style="height: 620rpx;"
        @click="unPreviewImage">
        <image :src="item" mode="aspectFit" class="swiper_img" />
      </swiper-item>
    </swiper>
    <!-- <view class="look"></view> -->
    <view class="indicator">
      {{ `${currentSwiperi}/${articleInfo.images?.length}` }}
    </view>
  </view>
  <view class="common-page">
    <view class="main_box">
      <!-- 标题 -->
      <view class="article_title">
        {{ articleInfo.title }}
      </view>
      <!-- 内容 -->
      <text class="common-info" v-html="articleInfo.content" />
    </view>
    <view style="width: 100%;height: 36rpx;background-color: #f7f7f7;" />
    <!-- 评论 -->
    <view class="comment">
      <view class="title">
        {{ $t('comentarios') }} ({{ formatNumber(commentTotal) || 0 }})
      </view>
      <view v-if="commentList.length">
        <scroll-view scroll-y class="scroll-view-box" style="height: 900rpx;" @scrolltolower="onReachBottom">
          <view v-for="item in commentList" :key="item.id" class="item_box">
            <view class="item_top">
              <view class="left_box">
                <image class="ava_img" fit="fill" :src="item?.avatar || '/static/default-avatar.png'" />
                <view class="text_box">
                  <view class="name">
                    {{ item?.category === 1 ? webTitle : (item?.username || '***')
                    }}
                  </view>
                  <view class="date">
                    {{ item?.createTime || '--' }}
                  </view>
                </view>
              </view>
              <view class="item_Level" v-if="item?.vipLevel">
                <image class="vipLevelImage" v-if="item?.vipLevelImage" fit="fill" :src="item?.vipLevelImage" />
                <view>{{ item?.vipLevel }}</view>
              </view>
            </view>
            <text class="item_main">
              {{ item?.content }}
            </text>
          </view>
        </scroll-view>
      </view>
      <view v-else class="no_comment">
        <image class="no_comment_img" fit="fill" src="/static/article/no_comment.png" @click="like" />
        <view>{{ $t('请发表评论') }}</view>
      </view>
    </view>

    <view class="bottom_box">
      <view v-if="!comment.content" class="like_box">
        <image v-if="!articleInfo.favorited" class="like_img" fit="fill" src="/static/article/like.png" @click="like" />
        <image v-else class="like_img" fit="fill" src="/static/article/like_a.png" @click="like" />
        <view>{{ formatNumber(articleInfo.favoriteCount) }}</view>
      </view>
      <view class="comment_box">
        <textarea v-model="comment.content" :auto-height="true" :maxlength="250" :placeholder="$t('请输入评论')" />
        <view class="btn" @click="postComment">
          {{ $t('发送') }}
        </view>
      </view>
    </view>
  </view>
  <!-- </customnavbar> -->
</template>

<style scoped lang="scss">
.Big_bgi {
  position: fixed;
  left: 0;
  top: 0;
  z-index: -1;
  width: 100%;
  background: #fff;
}

.header_box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  /* #ifdef APP-PLUS */
  padding-top: 80rpx;
  /* #endif */

  .left_box {
    display: flex;
    align-items: center;
    gap: 18rpx;

    .back_img {
      width: 48rpx;
      height: 48rpx;
    }

    .author_box {
      display: flex;
      flex-direction: column;
      justify-content: start;
      gap: 16rpx;

      .ava_box {
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 12rpx;

        .ava_img {
          width: 72rpx;
          height: 72rpx;
          background: #D8D8D8;
          border-radius: 50%;
        }
      }

      .text_box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 28rpx;
        color: #313131;

        .date {
          font-size: 24rpx;
          color: rgba(175, 175, 175, 0.9);
        }
      }
    }
  }

  .level_box {
    display: flex;
    align-items: center;
    gap: 6rpx 16rpx;
    font-size: 24rpx;
    font-weight: 500;
    border-radius: 2026rpx;
    padding: 6rpx 16rpx;
    color: #74848E;
    background: rgba(117, 117, 117, 0.2);

    .vipLevelImage {
      width: 32rpx;
      height: 32rpx;
    }

  }

}

.swiper_box {
  position: relative;

  .swiper_img {
    width: 100vw;
    height: 620rpx;
  }

  // .look {
  //     border-radius: 94rpx;
  //     padding: 4rpx 16rpx;
  //     background: rgba(0, 0, 0, 0.4);
  // }

  .indicator {
    position: absolute;
    right: 32rpx;
    bottom: 32rpx;
    color: #FFFFFF;
    font-size: 24rpx;
    padding: 4rpx 18rpx;
    border-radius: 94rpx;
    background: rgba(0, 0, 0, 0.4);
  }
}

::v-deep .swiper_box uni-swiper-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d8d8d8;
}

.common-page {
  padding-bottom: 114rpx;

  .main_box {
    padding: 32rpx;
    padding-bottom: 48rpx;

    .article_title {
      font-size: 48rpx;
      font-weight: 600;
      margin-bottom: 32rpx;
      color: #3D3D3D;
    }

    .common-info {
      font-size: 32rpx;
      line-height: 40rpx;
      color: #3D3D3D;
    }
  }

  .comment {
    padding: 32rpx;

    .no_comment {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24rpx;
      color: #3D3D3D;
      font-size: 24rpx;

      .no_comment_img {
        width: 620rpx;
        height: 330rpx;
      }
    }

    .title {
      font-size: 28rpx;
      font-weight: 500;
      color: #3D3D3D;
      margin-bottom: 32rpx;
    }

    .item_box {
      padding: 24rpx 0;
      border-bottom: 2rpx solid #F6F6F6;

      .item_top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .left_box {
          display: flex;
          align-items: center;

          .ava_img {
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            margin-right: 16rpx;
          }

          .text_box {
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .name {
              font-size: 28rpx;
              color: #494949;
            }

            .date {
              font-size: 20rpx;
              color: rgba(175, 175, 175, 0.9);
            }
          }
        }

        .item_Level {
          display: flex;
          align-items: center;
          gap: 8rpx;
          font-size: 24rpx;
          font-weight: 500;
          border-radius: 2026rpx;
          padding: 6rpx 16rpx;
          color: #74848E;
          background: rgba(117, 117, 117, 0.2);

          .vipLevelImage {
            width: 32rpx;
            height: 32rpx;
          }

        }
      }
    }
  }

  .bottom_box {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    gap: 32rpx;
    padding: 12rpx 32rpx;
    background-color: #fff;
    border-top: 2rpx solid #EBEBEB;

    .like_box {
      display: flex;
      align-items: center;
      justify-content: start;
      gap: 8rpx;
      font-size: 28rpx;
      color: rgba(51, 51, 51, 0.9);

      .like_img {
        width: 48rpx;
        height: 48rpx;
      }
    }

    .comment_box {
      flex: 1;
      display: flex;
      align-items: end;
      padding-left: 24rpx;
      padding-right: 6rpx;
      min-height: 72rpx;
      border-radius: 36rpx;
      background-color: #f6f6f6;

      .btn {
        box-sizing: border-box;
        padding: 6rpx 26rpx;
        background: $themeColor;
        border-radius: 2026rpx;
        font-size: 28rpx;
        color: #FFFFFF;
        white-space: nowrap;
        line-height: 48rpx;
        margin-bottom: 6rpx;
      }
    }
  }
}

::v-deep uni-textarea {
  width: 100% !important;
}

::v-deep .uni-textarea-wrapper {
  box-sizing: border-box;
  margin-bottom: 16rpx;
}

::v-deep .uni-textarea-textarea {
  box-sizing: border-box;
  color: #202020;
}
</style>
