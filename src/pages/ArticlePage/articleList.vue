<template>
  <homenavbar backgroundStr="''" :showBack="false" @mtop='mtop' :isHome="true">
    <view class="top-bg" :style="topStyle"></view>
    <view class="community-page">
      <view class="hero-row">
        <view class="news-card">
          <view class="latest">Latest News</view>
          <view class="news-title">Share opinions and discover<br />valuable content</view>
          <view class="news-link">View details→</view>
        </view>
        <view class="publish-card" @click="toArticleCreation">
          <image class="plane" src="/static/article/paperPlane.png"></image>
          <view class="publish-title">Write a post</view>
          <view class="publish-link">Go publish→</view>
        </view>
      </view>
      <view class="tabs">
        <view class="tab active">Recommendation</view>
        <view class="tab">Latest</view>
      </view>
      <article-post-card :post="posts[0]" />
      <article-post-card v-for="(post, index) in posts.slice(1)" :key="index" :post="post" />
    </view>
  </homenavbar>
</template>

<script setup lang="ts">
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { onBeforeUnmount, onUnmounted, reactive, ref } from 'vue'
import { getArticleList } from '@/common/api/article.js'
import homenavbar from '@/component/home-navbar/home-navbar.vue'
import ArticlePostCard from '@/components/article-post-card/article-post-card.vue'
import { getFirstTextTagWithEllipsis, showMessage } from '@/utils/utils'

const topStyle = ref('')
const posts = ref<any[]>([])
const list = ref<any[]>([])
const page = reactive({
  pageNum: 1,
  pageSize: 7,
  title: '',
  category: null as string | number | null,
})
const nodata = ref(false)
const hasMore = ref(true)
const loading = ref(false)
let searchTimer: number | null = null
const searchDebounceTime = 500

function mtop(e: number): void {
  // #ifdef H5
  topStyle.value = `margin-top:-${e}rpx;padding-top:${e + 88}rpx`
  // #endif

  // #ifdef APP-PLUS
  topStyle.value = `margin-top:-${e}rpx;padding-top:${e + 99}rpx`
  // #endif
}

function toArticleCreation(): void {
  uni.navigateTo({
    url: '/pages/ArticlePage/articleCreation',
  })
}

function formatNumber(num?: number): string {
  if (!num && num !== 0)
    return '0'
  if (num > 9999)
    return '9,999+'

  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getSummary(value?: string): string {
  if (!value)
    return ''

  return getFirstTextTagWithEllipsis(value)
}

function normalizeImages(images: any): string[] {
  if (Array.isArray(images))
    return images.filter(Boolean)
  if (typeof images === 'string')
    return images.split(',').map(item => item.trim()).filter(Boolean)

  return []
}

function normalizePost(item: any) {
  const images = normalizeImages(item?.images)
  const settings = uni.getStorageSync('settings') || {}
  const author = item?.userType === 'vip_proxy' ? settings.webTitle : item?.username

  return {
    ...item,
    type: 'images',
    author: author || 'Mira Studio',
    time: item?.publishTime || '--',
    featured: Boolean(item?.featured || item?.isTop || item?.recommend),
    title: item?.title || getSummary(item?.content),
    cover: images[0] || '',
    images: images,
    likes: formatNumber(item?.favoriteCount),
    comments: formatNumber(item?.commentCount),
    collects: formatNumber(item?.viewCount),
  }
}

function setPostList(rows: any[], isFirstPage: boolean): void {
  if (isFirstPage)
    list.value = rows
  else
    list.value.push(...rows)

  posts.value = list.value.map(normalizePost)
}

async function getNotice(): Promise<void> {
  if (loading.value)
    return

  loading.value = true
  uni.showLoading({
    title: 'Loading',
  })

  try {
    const res: any = await getArticleList(page)
    const rows = res?.rows || res?.data?.rows || []
    const total = res?.total ?? res?.data?.total ?? 0

    setPostList(rows, page.pageNum === 1)
    nodata.value = total === 0
    hasMore.value = list.value.length < total
  }
  catch (err: any) {
    showMessage('warning', err?.msg || 'System maintenance')
  }
  finally {
    uni.hideLoading()
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

function refreshList(): void {
  page.pageNum = 1
  nodata.value = false
  hasMore.value = true
  loading.value = false
  getNotice()
}

function searchList(): void {
  if (searchTimer)
    clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    refreshList()
  }, searchDebounceTime) as unknown as number
}

function handleArticleLikeChange(data: any): void {
  const target = list.value.find(item => item.id === data.id)
  if (!target)
    return

  target.favorited = data.favorited
  target.favoriteCount = data.favoriteCount
  posts.value = list.value.map(normalizePost)
}

function handleArticleViewChange(data: any): void {
  const target = list.value.find(item => item.id === data.id)
  if (!target)
    return

  target.viewCount = Number(target.viewCount || 0) + 1
  posts.value = list.value.map(normalizePost)
}

onLoad(() => {
  page.pageNum = 1
  uni.$on('articleLikeChange', handleArticleLikeChange)
  uni.$on('articleViewChange', handleArticleViewChange)
  getNotice()
})

onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    page.pageNum = Math.floor(list.value.length / page.pageSize) + 1
    getNotice()
  }
})

onPullDownRefresh(() => {
  refreshList()
})

onBeforeUnmount(() => {
  if (searchTimer)
    clearTimeout(searchTimer)
})

onUnmounted(() => {
  uni.$off('articleLikeChange', handleArticleLikeChange)
  uni.$off('articleViewChange', handleArticleViewChange)
})
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  font-family: 'MiSans';
}

::v-deep .post-card {
  position: relative;
  z-index: 2;
}

.top-bg {
  position: absolute;
  top: 0;
  width: 100%;
  height: 1076rpx;
  background:
    radial-gradient(circle at 0% 0%, #69d6ec 0%, rgba(105, 214, 236, 0.55) 34%, transparent 62%),
    radial-gradient(circle at 100% 0%, #3aaff5 0%, rgba(58, 175, 245, 0.55) 36%, transparent 65%),
    radial-gradient(circle at 50% 45%, rgba(245, 248, 255, 0.9) 0%, rgba(245, 248, 255, 0.25) 42%, transparent 72%),
    linear-gradient(180deg, #b9e9f3 0%, rgba(234, 246, 248, 0.8) 55%, rgba(244, 245, 251, 0) 100%);
  z-index: 1;
}

.community-page {
  position: relative;
  min-height: 100vh;
  padding-bottom: 32rpx;
  background: #f4f5fb;
  overflow: hidden;

  .status-space {
    position: relative;
    height: 92rpx;
  }

  .brand-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;

    .box-icon {
      &::before {
        content: '';
        position: absolute;
        left: 20rpx;
        top: 28rpx;
        width: 36rpx;
        height: 28rpx;
        border: 6rpx solid #51565d;
        border-top: 0;
      }

      &::after {
        content: '';
        position: absolute;
        left: 26rpx;
        top: 18rpx;
        width: 26rpx;
        height: 26rpx;
        border-left: 6rpx solid #51565d;
        border-bottom: 6rpx solid #51565d;
        transform: rotate(-45deg);
      }
    }
  }

  .hero-row {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 14rpx;
    padding: 24rpx 24rpx 0;

    .news-card,
    .publish-card {
      height: 204rpx;
      border-radius: 20rpx;
      overflow: hidden;
    }

    .news-card {
      flex: 1;
      padding: 20rpx 24rpx;
      background: #0b49f3;
      color: #fff;

      .latest {
        width: 148rpx;
        height: 30rpx;
        border: 2rpx solid #ffde00;
        border-radius: 17rpx;
        color: #ffde00;
        font-size: 20rpx;
        line-height: 27rpx;
        text-align: center;
      }

      .news-title {
        margin-top: 22rpx;
        font-size: 28rpx;
        font-weight: 700;
        line-height: 42rpx;
      }

      .news-link {
        margin-top: 4rpx;
        font-size: 24rpx;
        line-height: 30rpx;
      }
    }

    .publish-card {
      position: relative;
      width: 224rpx;
      padding: 16rpx 16rpx 18rpx;
      background: #fff;

      .plane {
        width: 96rpx;
        height: 84rpx;
      }

      .publish-title {
        color: $themeColor;
        font-size: 28rpx;
        font-weight: 700;
        line-height: 36rpx;
      }

      .publish-link {
        margin-top: 6rpx;
        color: #000;
        font-size: 24rpx;
        line-height: 32rpx;
      }
    }
  }

  .tabs {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 92rpx;
    padding: 28rpx 0 44rpx;

    .tab {
      position: relative;
      color: #14213D;
      font-size: 36rpx;
      line-height: 48rpx;

      &.active {
        font-weight: 800;

        &::after {
          content: '';
          position: absolute;
          left: -16rpx;
          right: -16rpx;
          bottom: -10rpx;
          z-index: -1;
          height: 34rpx;
          background: url('/static/home/GreenWaveLine.png') no-repeat center / 100% 100%;
        }
      }
    }
  }
}
</style>
