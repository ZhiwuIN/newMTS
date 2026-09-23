<script setup lang="ts">
import type { ArticleItem, getArticleCategoryListParams } from '@shared/api'
import { onLoad } from '@dcloudio/uni-app'
import { customizeBack, showToast } from '@shared/utils'
import { onBeforeUnmount, onUnmounted, reactive, ref } from 'vue'
import { articleApi } from '@/common/api'
import listbottom from '@/component/list-bottom/list_bottom.vue'
import { t } from '@/locale'
import { getFirstTextTagWithEllipsis } from '@/utils/utils'

const state = ref<string | number | null>('liked-posts')
const webTitle = ref('')
const pageTitle = ref('')
const groupId = ref(0)
const list = ref<ArticleItem[]>([])
const page = reactive<getArticleCategoryListParams>({
  pageNum: 1,
  pageSize: 7,
  title: '',
  type: null,
})
const nodata = ref(false)
const hasMore = ref(true)
const loading = ref(false)
const topStyle2 = ref('')
const topStyle = ref('')
const isRefreshing = ref(false)
let searchTimer: number | null = null
const searchDebounceTime = 500
const getTheSalary = ref(false) // 获取薪资

// 格式化富文本
function unGetFirstTextTagWithEllipsis(value: string): string {
  if (!value)
    return ''
  return getFirstTextTagWithEllipsis(value)
}

// 数字格式化
function formatNumber(num?: number): string {
  if (!num && num !== 0)
    return '0'
  if (num > 9999) {
    return '9,999+'
  }

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 图片预览
function unPreviewImage(urls: string[], current: number): void {
  uni.previewImage({
    urls,
    showmenu: false,
    current,
    longPressActions: {
      itemList: [''],
      success() {
      },
    },
  })
}

// 跳转页面
function toPage(path: string): void {
  uni.navigateTo({
    url: path,
  })
}

// 计算顶部样式
function mtop(): void {
  let statusBarHeight: number
  let navBarHeight: number

  // #ifdef APP-PLUS
  const sys = uni.getSystemInfoSync()
  statusBarHeight = sys.statusBarHeight ?? 0
  if (sys.platform === 'android') {
    navBarHeight = 96
  }
  else {
    navBarHeight = 88
  }
  // #endif

  // #ifdef H5
  statusBarHeight = 0
  navBarHeight = 88
  // #endif

  uni.getSystemInfo({
    success: () => {
      const mtopValue = statusBarHeight / 2 + navBarHeight
      // #ifdef H5
      topStyle2.value = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
      topStyle.value = `padding-top:${mtopValue - 44}rpx`
      // #endif

      // #ifdef APP-PLUS
      topStyle2.value = `height:calc(100vh);`
      topStyle.value = `padding-top:${mtopValue + 22}rpx`
      // #endif
    },
  })
}

// 跳转详情
function toDeatils(item: ArticleItem): void {
  // 领取薪资
  if (state.value === 1 && getTheSalary.value) {
    uni.navigateTo({
      url: `/pages/commonDetailsPage?title=${item.title}&id=${item.id}`,
      success: () => {
        uni.$off('getTheSalary', handleGetTheSalary)
      },
    })
    return
  }
  uni.navigateTo({
    url: `/pages/ArticlePage/articleInfo?title=${item.title}&id=${item.id}`,
  })
}

// 与我有关的文章列表
async function getCommunityMyQueryApi(type: string | number | null) {
  if (loading.value)
    return
  loading.value = true

  uni.showLoading({
    title: t('loading.btn'),
  })
  try {
    const res = await articleApi.getArticleCategoryList({
      ...page,
      type,
    })
    if (page.pageNum === 1) {
      list.value = res.data?.rows || []
    }
    else {
      list.value.push(...(res.data?.rows || []))
    }
    nodata.value = res.data?.total === 0
    hasMore.value = list.value.length < (res.data?.total ?? 0)
  }
  catch (err: any) {
    showToast(err.msg || t('systemMaintenance'))
  }
  finally {
    uni.hideLoading()
    loading.value = false
  }
}
// 切换标签
function changeTab(value: string | number | null): void {
  state.value = value
  list.value = []
  page.pageNum = 1
  page.category = null
  getCommunityMyQueryApi(value)
}

// 下拉刷新
function onRefresh(): void {
  isRefreshing.value = true
  page.pageNum = 1
  nodata.value = false
  hasMore.value = true
  loading.value = false
  getCommunityMyQueryApi(state.value)

  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

// 上拉加载更多
function onReachBottom(): void {
  if (!loading.value && hasMore.value) {
    page.pageNum = Math.floor(list.value.length / page.pageSize) + 1
    getCommunityMyQueryApi(state.value)
  }
}

// 搜索
function searchList(): void {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    list.value = []
    page.pageNum = 1
    getCommunityMyQueryApi(state.value)
  }, searchDebounceTime) as unknown as number
}

// 事件监听处理函数
function handleArticleLikeChange(data: any): void {
  const target = list.value.find(item => item.id === data.id)
  if (target) {
    target.favorited = data.favorited
    target.favoriteCount = data.favoriteCount
  }
}

function handleArticleViewChange(data: any): void {
  const target = list.value.find(item => item.id === data.id)
  if (target) {
    target.viewCount = Number(target.viewCount || 0) + 1
  }
}

function handleGetTheSalary(): void {
  getTheSalary.value = true
  changeTab(1)
}

// 生命周期
onLoad(() => {
  getTheSalary.value = false
  pageTitle.value = uni.getStorageSync('settings').pageTitle || t('新闻')
  groupId.value = 2
  webTitle.value = uni.getStorageSync('settings').webTitle
  mtop()
  page.pageNum = 1

  // 监听事件
  uni.$on('getTheSalary', handleGetTheSalary)
  uni.$on('articleLikeChange', handleArticleLikeChange)
  uni.$on('articleViewChange', handleArticleViewChange)
  getCommunityMyQueryApi(state.value)
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

onUnmounted(() => {
  // 移除事件监听
  uni.$off('articleLikeChange', handleArticleLikeChange)
  uni.$off('articleViewChange', handleArticleViewChange)
  uni.$off('getTheSalary', handleGetTheSalary)
})
</script>

<template>
  <!-- <customnavbar :title="pageTitle" backgroundStr="url('/static/bg_dark.jpg') top left/100%  no-repeat" @mtop='mtop' :showBack="false"> -->
  <view class="Big_bgi" :style="topStyle2" />
  <!-- 头部区域 -->
  <view class="top_box" :style="topStyle">
    <view class="header_box">
      <!-- 标题 -->
      <image src="/src/static/back_icon2.png" class="back_img" @click="customizeBack" />
      <view class="right_box">
        <view class="main_box" @click="toPage('/pages/ArticlePage/articleCreation')">
          <image src="/src/static/article/create.png" class="msg_img" />
          <view>{{ $t('创作') }}</view>
        </view>
      </view>
    </view>
    <!-- 搜索栏 -->
    <view class="set_input">
      <image src="/src/static/search.png" class="search_img" />
      <input
        v-model="page.title" :placeholder="$t('搜索文章')"
        placeholder-style="color: #E4E4E4;font-size: 32rpx;padding-left: 22%;" @input="searchList"
      >
    </view>
  </view>
  <!-- 标签栏 -->
  <view class="tab_list_box">
    <l-tabs
      :model-value="state" :space-evenly="false" :split="false" active-color="#2BBE63" line-color="#2BBE63"
      @change="changeTab"
    >
      <l-tab-panel value="liked-posts" :label="$t('我点赞的帖子')" />
      <l-tab-panel value="posts" :label="$t('我发布的帖子')" />
      <l-tab-panel value="commented-posts" :label="$t('我评论过的帖子')" />
    </l-tabs>
  </view>
  <view class="common-list-page">
    <!-- 新增scroll-view实现滚动分页和下拉刷新 -->
    <keep-alive v-if="list.length">
      <scroll-view
        scroll-y class="scroll-view-box" :refresher-enabled="true" :refresher-triggered="isRefreshing"
        :refresher-threshold="120" @scrolltolower="onReachBottom" @refresherrefresh="onRefresh"
      >
        <view v-for="(item, index) in list" :key="index" class="list_box" @click="toDeatils(item)">
          <!-- list.sort((a, b) => b.publishTime.localeCompare(a.publishTime)) -->
          <view class="list_box_top">
            <view class="common-list-info">
              <view class="item_top_box">
                <view class="author_box">
                  <!-- 头像 -->
                  <view class="ava_box">
                    <image
                      class="ava_img" fit="fill" mode="aspectFill"
                      :src="item?.userType !== 'vip_proxy' ? (item.avatar || '/static/default-avatar.png') : '/static/1024.png'"
                    />
                    <view class="text_box">
                      <view>{{ item?.userType === 'vip_proxy' ? webTitle : item.username }}</view>
                      <view class="date">
                        {{ item.publishTime || '--' }}
                      </view>
                    </view>
                  </view>
                </view>
                <!-- 等级 -->
                <view>
                  <view v-if="item?.vipLevel && item?.category !== 1" class="level_box">
                    <image class="vipLevelImage" fit="fill" :src="item?.vipLevelImage" />
                    <view>{{ item?.vipLevel }}</view>
                  </view>
                </view>
              </view>
              <view class="title">
                {{ item.title }}
              </view>
              <view class="content" v-html="unGetFirstTextTagWithEllipsis(item.content)" />
              <!-- 图片列表 -->
              <view v-if="item.images?.length" class="img_box">
                <view v-for="(i, idx) in item.images" :key="i" class="item_img_box">
                  <image
                    v-if="idx < 3" class="item_img" mode="aspectFill" fit="fill" :src="i"
                    @click.stop="unPreviewImage(item.images, idx)"
                  />
                </view>
                <view v-if="item.images?.length > 3" class="mask" @click.stop="unPreviewImage(item.images, 2)">
                  +{{ item.images?.length - 3 }}
                </view>
              </view>
              <view class="list_box_bottom">
                <view class="tag_box">
                  <!-- 浏览 -->
                  <view class="tag_item_box">
                    <image class="image_tag" fit="fill" src="/static/article/eye.png" />
                    <view>{{ formatNumber(item.viewCount) }}</view>
                  </view>
                  <!-- 点赞&收藏 -->
                  <view class="tag_item_box">
                    <image v-if="!item.favorited" class="image_tag" fit="fill" src="/static/article/like.png" />
                    <image v-else class="image_tag" fit="fill" src="/static/article/like_a.png" />
                    <view>{{ formatNumber(item.favoriteCount) }}</view>
                  </view>
                  <!-- 评论 -->
                  <view class="tag_item_box">
                    <image class="image_tag" fit="fill" src="/static/article/comment.png" />
                    <view>{{ formatNumber(item.commentCount) }}</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 分页底部状态组件 -->
        <listbottom :has-more="hasMore" :loading="loading" :no-data="nodata" image="/static/default/Nocontent.png" />
      </scroll-view>
    </keep-alive>
    <view v-else class="undraw_empty_box">
      <image src="/static/article/undraw_empty.png" class="undraw_empty_img" />
      <view class="text">
        {{ $t('没有相关文章') }}
      </view>
      <view class="btn" @click="toPage('/pages/ArticlePage/articleCreation')">
        {{ $t('创作') }}
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

.unfold_img {
  width: 48px;
  height: 48px;
}

.unfold_img {
  width: 48px;
  height: 48px;
}

.tab_list_box {
  position: relative;
  display: flex;
  border-bottom: 2rpx solid #F3F3F3;

  .main_box {
    position: absolute;
    top: 52px;
    right: 0;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    z-index: 2;
    border-radius: 12rpx;
    border: 2rpx solid #EBEEF5;
    padding: 6rpx 0;

    .item {
      padding: 6rpx 14rpx;
      font-size: 24rpx;
      color: #3D3D3D;

      &.active {
        color: $themeColor2;
      }
    }
  }
}

::v-deep .l-tabs {
  flex: 1;
  width: 1rpx;
}

.top_box {
  display: flex;
  flex-direction: column;
  justify-content: end;
  box-sizing: border-box;
  padding: 32rpx;
  padding-bottom: 16rpx;
  background: url('/static/mine/mine_bg.png') top left/100% no-repeat;
  color: #FFFFFF;

  .header_box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 80rpx;

    .back_img {
      width: 48rpx;
      height: 48rpx;
    }

    .title {
      font-size: 32rpx;
    }

    .right_box {
      box-sizing: border-box;
      padding: 2rpx;
      border-radius: 2026rpx;
      background: linear-gradient(-20deg, rgba(255, 255, 255, .4) 0%, rgba(255, 255, 255, 0) 46%, rgba(255, 255, 255, .4) 81%);

      .main_box {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        padding: 14rpx 32rpx;
        background: $translucence;
        border-radius: 2026rpx;
        backdrop-filter: blur(20rpx);
        font-size: 24rpx;

        .msg_img {
          width: 48rpx;
          height: 48rpx;
        }
      }
    }

  }

  .set_input {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 0 24rpx;
    background: rgba(243, 243, 243, 0.2);
    backdrop-filter: blur(20rpx);
    border-radius: 12rpx;
    margin-top: 24rpx;

    .search_img {
      width: 48rpx;
      height: 48rpx;
    }

    input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
    }
  }
}

.common-list-page {
  display: flex;
  flex-direction: column;
  // padding: 24rpx 32rpx;
  height: calc(100vh - 240rpx);
  /* #ifdef APP-PLUS */
  height: calc(100vh - 300rpx);
  /* #endif */
  // padding-bottom: 148rpx;

  .undraw_empty_box {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 76rpx;

    .undraw_empty_img {
      width: 620rpx;
      height: 460rpx;
    }

    .text {
      font-size: 36rpx;
      margin: 16rpx 0 32rpx;
      color: #3D3D3D;
    }

    .btn {
      border-radius: 266rpx;
      padding: 8rpx 16rpx;
      background: $themeColor2;
      font-size: 24rpx;
      line-height: 36rpx;
      color: #FFFFFF;
    }
  }
}

.scroll-view-box {
  flex: 1;
  height: 1px;
}

.list_box {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 18rpx;
  background: #FFFFFF;
  // border-radius: 12rpx;
  border-bottom: 2rpx solid #DEDEDE;
  // margin-bottom: 18rpx;

  .list_box_top {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .common-list-info {
      box-sizing: border-box;
      padding: 32rpx;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;

      .item_top_box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16rpx;

        .ava_box {
          display: flex;
          gap: 12rpx;
          font-size: 28rpx;
          align-items: center;
          color: #313131;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;

          .ava_img {
            width: 72rpx;
            height: 72rpx;
            min-width: 72rpx;
            background: #D8D8D8;
            border-radius: 50%;
          }
        }

        .text_box {
          .date {
            font-size: 24rpx;
            color: rgba(175, 175, 175, 0.9);
            font-style: normal;
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

      .title {
        font-size: 32rpx;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.9);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-bottom: 16rpx;
      }

      .content {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        line-height: 44rpx;
        color: #000000;
        font-size: 32rpx;
        margin-bottom: 16rpx;
      }

      .img_box {
        display: flex;
        align-items: center;
        gap: 8rpx;
        margin-bottom: 16rpx;
        position: relative;
        overflow: hidden;

        .item_img_box {
          width: 224rpx;
          height: 224rpx;
          // background-color: #e3e3e3;
        }

        .item_img {
          width: 224rpx;
          height: 224rpx;
          background-color: #e3e3e3;
        }

        .mask {
          position: absolute;
          right: 0.6rpx;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 224rpx;
          height: 224rpx;
          background-color: rgba(0, 0, 0, 0.4);
          font-size: 36rpx;
          color: #FFFFFF;
        }
      }

    }

    .image-container {
      width: 254rpx;
      height: 304rpx;
      min-width: 254rpx;
      min-height: 304rpx;
      background: #D8D8D8;
      border-radius: 12rpx 0 0 12rpx;
    }

  }

  .list_box_bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    &.isImg {
      flex-direction: column;
      align-items: start;
      gap: 8rpx;
    }

    .tag_box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .tag_item_box {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16rpx;
        font-size: 24rpx;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.9);

        .image_tag {
          width: 48rpx;
          height: 48rpx;
        }
      }
    }
  }
}

.common-list-title {
  color: rgba(51, 51, 51, 1);
  font-size: 32rpx;
  text-align: left;
  margin: 40rpx 0;
  height: 48rpx;
  line-height: 46rpx;
}
</style>
