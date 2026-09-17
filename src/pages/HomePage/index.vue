<template>
	<view class="">
		<homenavbar backgroundStr="''" :showBack="false" @mtop='mtop' :isHome="true">
			<view class="home_top_bg" :style="topStyle"></view>
			<view class="home_container">
				<view class="home_top_center">
					<view class="home_top_center_left">
						<view>
							<view class="avatar_box">
								<image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.png'"></image>
								<view class="text">
									{{ $t('Hi') }}, {{ userInfo?.levelName }}
								</view>
							</view>
							<view class="account_balance_box">{{ $t('home.Accountbalance') }}</view>
							<view class="account_balance_t">{{ userInfo?.accountBalance || '--' }} {{ currency }}</view>
						</view>
						<view class="home_top_center_left_b">
							<view class="withdrawal_btn Recharge" @click="toPage3('/pages/HomePage/RechargeChannel')"
								v-if="userType != 'test'">
								{{ $t('home.Recharge') }}
							</view>
							<view class="withdrawal_btn" @click="toWithdrawal" v-if="userType != 'test'">
								{{ $t('home.Withdrawal') }}
							</view>
						</view>
					</view>
					<!-- <view class="home_top_center_right" @click="toLevel"> -->
					<!-- <view class="level_img_bg"></view> -->
					<!-- <image :src="userInfo?.levelImg || '/static/level_img.png'" class="level_img" mode="aspectFit"> -->
					<!-- </image> -->
					<!-- <view class="level_img_mask"></view> -->
					<!-- <view class="level_name"> -->
					<!-- level_code -->
					<!-- <view class="level_title">{{ userInfo?.levelName || $t('product.Level') }}</view> -->
					<!-- <view class="level_title">{{ userInfo?.positionName || $t('pages.postApply') }}</view> -->
					<!-- <view class="level_upgrade">{{ $t('home.goUpgrade') }} →</view> -->
					<!-- </view> -->
					<!-- </view> -->
				</view>

				<!-- 等级展示 -->
				<!-- <view class="level_box">
					<view class="member_card_img">
						<image style="width: 100%;height: 100%;" :src="'/static/level/1.png'">
						</image>
					</view>
					<view class="text_box">
						<view class="card_text">
							{{ userInfo?.levelCode ? userInfo?.levelName : $t("暂无等级") }}
						</view>
						<view class="hint">
							{{ $t('Upgrade your level to get better benefits') }}
						</view>
					</view>
				</view> -->

				<!-- 滚动公告 -->
				<view class="noticebar" style="margin-bottom: 34rpx;" v-if="isShowMessage2">
					<l-notice-bar :marquee="true" :vertical="false" leftIcon="/static/home/horn.svg" :iconSize="40"
						:text="[rollContent]" />
				</view>
				<!-- 推荐产品 -->
				<template v-if="productRecommendList.length">
					<swiper class="growth-swiper" :autoplay="true" :circular="productRecommendList.length > 1"
						:indicator-dots="false" @change="recommendCurrent = $event.detail.current">
						<swiper-item v-for="item in productRecommendList" :key="item.productId">
							<view class="growth-card" @click="toProductDetail">
								<view class="growth-title">{{ item.productName || '--' }}</view>
								<view class="growth-desc">{{ item.introduction || item.recommendTag || '--' }}</view>
								<view class="growth-main">
									<text class="growth-rate">{{ item.dailyRateOfReturnStr || '--' }}</text>
									<view class="learn-btn">{{ $t('home.learnMore') }} →</view>
								</view>
								<view class="growth-income">{{ item.remaining ? `${$t('home.remaining')}
									${item.remaining}` : '' }}
								</view>
								<view class="growth-meta">
									<view class="meta-item"><text class="meta-value">{{ item.totalRevenue || '--'
									}}</text><text class="meta-label">{{ $t('home.productDeadline') }}</text>
									</view>
									<view class="meta-item"><text class="meta-value">{{
										getStartingAmount(item.startingAmount, 0) }}{{ currency
											}}</text><text class="meta-label">{{ $t('home.minPurchase') }}</text></view>
									<view class="meta-item"><text class="meta-value">{{
										getStartingAmount(item.startingAmount, 1) }}{{ currency
											}}</text><text class="meta-label">{{ $t('home.maxPurchase') }}</text></view>
								</view>
							</view>
						</swiper-item>
					</swiper>
					<view class="dots" v-if="productRecommendList.length > 1">
						<text v-for="(item, index) in productRecommendList" :key="item.productId || index" class="dot"
							:class="{ active: index === recommendCurrent }"></text>
					</view>
				</template>
				<!-- 灵活活动 -->
				<!-- <view class="customCycleOverview_box">
					<view class="title">
						Daily Quest
					</view>
					<view class="label_box">
						<view class="item_box">
							<view class="tag">{{ $t('CompletedToday') }}</view>
							<view class="value">0</view>
						</view>
						<view class="item_box">
							<view class="tag">{{ $t('RemainingToday') }}</view>
							<view class="value">0</view>
						</view>
						<view class="item_box">
							<view class="tag">{{ $t('income') }}</view>
							<view class="value">0</view>
						</view>
					</view>
				</view> -->

				<!-- 菜单模块 -->
				<!-- <view class="menu-row">
					<view class="menu-card" v-for="(item, index) in quickMenus" :key="index"
						:style="{ background: `url(${item.img}) top left/100% 100% no-repeat` }"
						@click="toPage3(item.url)">
						<view class="menu-title">{{ item.title }}</view>
						<view class="menu-go">Go now →</view>
					</view>
				</view> -->

				<!-- 功能菜单按钮 -->
				<view class="home_center_box">
					<view class="center_item_box" v-for="item in menuList">
						<template v-for="i in item">
							<view class="center_item" v-if="!(i?.showTestAccount == false && userType == 'test')"
								@click="toPage2(i)">
								<view class="flex_center">
									<view class="icon-wrapper_box">
										<image :src="i?.iconUrl" :lazy-load="true" class="icon-wrapper" />
									</view>
									<!-- <image src="/static/home/CompanyActivities.png" :lazy-load="true"
										class="icon-wrapper" /> -->
								</view>
								<view class="center_item_t">
									<text>{{ splitText(i?.menuName) }}</text>
								</view>
							</view>
						</template>
					</view>
				</view>
				<!-- 活动中心 -->
				<view class="section-head activity-head">
					<view class="section-title">{{ $t('home.activityCenter') }}</view>
					<view class="more-link" @click="toPage3('/pages/HomePage/activityCenter')">{{
						$t('home.moreActivities') }} →</view>
				</view>
				<view class="activity-grid">
					<image class="activity-big" @click="toPage3(activeCenterTop?.[0]?.targetUrl)"
						:src="activeCenterTop?.[0]?.image" mode="aspectFill"></image>
					<view class="activity-side">
						<image :src="activeCenterTop?.[1]?.image" mode="aspectFill"
							@click="toPage3(activeCenterTop?.[1]?.targetUrl)">
						</image>
						<image :src="activeCenterTop?.[2]?.image" mode="aspectFill"
							@click="toPage3(activeCenterTop?.[2]?.targetUrl)">
						</image>
					</view>
				</view>
				<!-- 精选帖子(加载锚点) -->
				<view id="community-section" class="section-head community-head">
					<view class="section-title">{{ $t('CommunitySelection') }}</view>
				</view>
				<!-- 发贴按钮 -->
				<view class="hero-row" style="margin-bottom: 24rpx;">
					<view class="news-card" @click="toPage('/pages/ArticlePage/introduce')">
						<view class="latest">{{ $t('home.latestNews') }}</view>
						<view class="news-title">{{ $t('home.shareAndDiscover') }}<br />{{ $t('home.valuableContent') }}
						</view>
						<view class="news-link">{{ $t('home.viewDetails') }}→</view>
					</view>
					<view class="publish-card" @click="toArticleCreation">
						<image class="plane" src="/static/article/paperPlane.png"></image>
						<view class="publish-title">{{ $t('home.writePost') }}</view>
						<view class="publish-link">{{ $t('home.goPublish') }}→</view>
					</view>
				</view>
				<!-- 帖子分类 -->
				<!-- <view class="tabs">
					<view class="tab active">Recommendation</view>
					<view class="tab">Latest</view>
				</view> -->
				<view v-if="postLoading && !postList.length" class="community-loading">
					<view class="community-loading-spinner"></view>
					<text>{{ $t('common.loading') }}</text>
				</view>
				<template v-if="postList.length">
					<article-post-card v-for="(post, index) in postList" :key="post.id || index" :post="post"
						:compact="index === 0" />
				</template>
				<view v-if="postLoading && postList.length" class="community-loading community-loading-more">
					<view class="community-loading-spinner"></view>
					<text>{{ $t('common.loading') }}</text>
				</view>
				<view id="community-bottom-anchor" class="community-bottom-anchor"></view>
			</view>

			<uni-popup ref="promptpopup2" type="center" :mask-click="false">
				<view class="prompt_pop_page">
					<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
					<view class="prompt_pop_taps">{{ pop_message_yes }}</view>
					<view class="prompt_pop_bottom">
						<button class="prompt_confirm_btn" @click="prompt_confirm2">{{ $t('pay.yes') }}</button>
					</view>
				</view>
			</uni-popup>
		</homenavbar>

		<!-- 弹窗 -->
		<t-overlay :visible="bigGG" v-if="bigGG" @touchmove.stop.prevent />
		<view class="bigGG" v-if="bigGG">
			<scroll-view class="bigGG_main" scroll-y @scroll="onBigGGScroll">
				<view class="bigGG_text" v-html="popWindowContent"></view>
			</scroll-view>
			<view v-if="bigGGBtnNum > 0" class="bigGGBtnClose">{{ bigGGBtnNum }}</view>
			<image v-else :class="['xImage', !bigGGScrolledToBottom ? 'xImage_disabled' : '']"
				src="/static/lottery/x.png" mode="" @click="closeBigGG" :lazy-load="true">
			</image>
		</view>

		<!-- 福袋弹窗 -->
		<t-overlay :visible="bigBag" v-if="bigBag" />
		<view class="bigBag" v-if="bigBag">
			<view class="bigBag_main">
				<image class="bigBag_img" :src="bagInfo.image" mode="" :lazy-load="true">
				</image>
				<view class="bigBag_text">{{ $t('GX') }}</view>
				<view class="bigBag_text">{{ $t('YHbag') }}</view>
				<!-- <view class="bigBag_text2">{{ $t('FIR') }}</view> -->
				<view class="getBtn" @click="toPage('/pages/luckyBagPage/index')">{{ $t('gitit') }}</view>
				<view @click="closeBigBag" class="not">{{ $t('NOTNOW') }}</view>
			</view>
		</view>

		<!-- 联系方式弹窗 -->
		<contactWay ref="contactWay" />

		<!-- 顶部弹出消息 -->
		<messagePopup v-model:isShow="isShowMessage" :data="msgData" @getMessageNoticeApi="getMessageNoticeApi">
		</messagePopup>

		<!-- 悬浮聊天 -->
		 <suspensionMsg />
	</view>
</template>

<script>
import homenavbar from '@/component/home-navbar/home-navbar.vue'
import contactWay from '@/components/contactWay/contactWay.vue';
import suspensionMsg from '@/components/suspension_msg/index.vue';
import { getArticleList } from '@/common/api/article.js'
import { productRecommendApi } from '@/common/api/product.js'
import ArticlePostCard from '@/components/article-post-card/article-post-card.vue'
import { getFirstTextTagWithEllipsis, showMessage } from '@/utils/utils'
import messagePopup from '@/component/message-popup/message-popup.vue';
import {
	activityCenterApi
} from '@/common/api/activity.js'
import {
	customCycleOverviewApi
} from '@/common/api/ActivityUpdates.js'
import {
	luckybagMaxApi,
} from "@/common/api/bag.js";
import {
	userInfoApi,
	settingsApi
} from "@/common/api/users.js";
import {
	settingsPopupsApi,
	activeCenterTopApi,
	menuListApi,
	messageNoticeApi
} from "@/common/api/home.js";
import {
	formatRichText,
	htmlToPlainText
} from "@/utils/utils.js"
export default {
	components: {
		homenavbar,
		ArticlePostCard,
		contactWay,
		messagePopup,
		suspensionMsg
	},
	data() {
		return {
			pop_message_yes: '',
			kAuthInfo: {},
			menuList: [],
			bagInfo: {},
			bigBag: false,
			isHouseKeeper: false,
			customCycleOverviewInfo: {},
			isShowMessage2: false,
			rollContent: '',
			_settingsReady: false,
			_popupChainStarted: false,
			webTitle: '',
			luckyBagSwitch: false,
			topStyle: '',
			currency: '',
			userInfo: {},
			userType: 'test',
			noticeList: [],
			postList: [],
			productRecommendList: [],
			recommendCurrent: 0,
			postLoading: false,
			postLoaded: false,
			postHasMore: true,
			communityObserver: null,
			communityBottomObserver: null,
			postQuery: {
				pageNum: 1,
				pageSize: 5,
				title: '',
				category: null
			},
			popWindowContentList: [],
			quickMenus: [
				{ title: 'About the\nPlatform', img: '/static/home/menu_img1.png', url: '/pages/HomePage/companyInfo' },
				{ title: 'Job\npromotion', img: '/static/home/menu_img2.png', url: '/pages/HomePage/postManage' },
				{ title: 'Team\nExpansion', img: '/static/home/menu_img3.png', url: '/pages/TeamPage/index' },
				{ title: 'Team\nExpansion', img: '/static/home/menu_img3.png', url: '/pages/TeamPage/index' },
			],
			popWindowContent: '',
			bigGGIndex: 0,
			// 全屏公告
			bigGG: false,
			bigGGIndex: 0,
			bigGGBtnNum: 0, // 按钮倒计时
			bigGGTimer: null, // 定时器
			bigGGScrolledToBottom: false, // 是否滚动到底部
			bigGGContainerHeight: 0, // 公告容器可视高度
			popWindowContent: '',
			activeCenterTop: [],
			// 顶部弹出消息
			msgData: {},
			isShowMessage: false
		}
	},
	methods: {
		// 顶部消息通知
		getMessageNoticeApi() {
			messageNoticeApi().then(res => {
				if (res.data?.id) {
					this.msgData = res.data
					this.isShowMessage = true
				}
			})
		},
		prompt_confirm2() {
			this.$refs.promptpopup2.close()
		},
		toArticleCreation() {
			uni.navigateTo({
				url: '/pages/ArticlePage/articleCreation',
			})
		},
		// 首页推荐产品
		getProductRecommend() {
			productRecommendApi().then(res => {
				this.productRecommendList = res.data || []
				this.recommendCurrent = 0
			})
		},
		getStartingAmount(value, index) {
			if (!value) return '--'
			const amountList = String(value).split('~').map(item => item.trim()).filter(Boolean)
			return amountList[index] || amountList[0] || '--'
		},
		toProductDetail() {
			uni.navigateTo({ url: '/pages/HomePage/financePage' })
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle = `margin-top:-${e}rpx;padding-top:${e + 88}rpx`
			// #endif

			// #ifdef APP-PLUS
			this.topStyle = `margin-top:-${e}rpx;padding-top:${e + 99}rpx`
			// #endif
		},
		toPage2(value) {
			if (value.targetValue == 'contactWay') {
				this.$refs.contactWay.unShow()
				return
			}

			uni.setStorageSync('pageTitle', value.menuName)
			const {
				canEnterButlerMode, // 管家模式
				canEnterIntern, // 实习生
				allowUnverifiedAccess, // 实名
				targetValue,
				targetType // 链接类型
			} = value
			// 原生跳转 
			if (targetType == 3 && targetValue.startsWith("/topage")) {
				const queryString = targetValue.split('?')[1] || ''
				const params = new URLSearchParams(queryString)
				if (params.get('type') && params.get('type') == "product") {
					const targetUrl = params.get('url')
					const crypto = new NativeCrypto();
					const token = crypto.encrypt(uni.getStorageSync('token'));
					const url = `${targetUrl}#${encodeURIComponent(token)}`;
					// #ifdef APP-PLUS
					plus.runtime.openURL(url);
					// #endif
					// #ifdef H5
					window.location.href = url
					// #endifF
					return
				}
			}
			// 实习生不能进
			if (canEnterIntern == false && this.userInfo.levelCode == '0') {
				this.toPageTeamExpansion(targetValue)
				return
			}

			// 管家模式不允许进入
			if (canEnterButlerMode == false && this.isHouseKeeper) {
				this.pop_message_yes = this.$t('home.accountRestricted')
				this.$refs.promptpopup2.open();
				return
			}
			// 未实名不允许进入
			if (allowUnverifiedAccess == false && !this.userInfo.realName) {
				this.$refs.promptpopup.open()
				return
			}

			// 外部链接
			if (targetType == 2) {
				// #ifdef APP-PLUS
				plus.runtime.openURL(targetValue);
				// #endif

				// #ifdef H5
				uni.navigateTo({
					url: '/pages/HomePage/RechargeWebView?checkoutUrl=' + targetValue
				})
				// #endifF
				return
			}
			// 幸运转盘
			if (targetValue == '/pages/HomePage/lotteryPage') {
				this.toPage3(targetValue)
				return
			}

			if (value.children) {
				uni.navigateTo({
					url: targetValue + '?pid=' + value.id
				})
			} else {
				uni.navigateTo({
					url: targetValue
				})
			}

		},
		toPage3(path) {
			if (path == '/pages/LevelPage/index') {
				this.toPageTabBar(path)
				return
			}
			uni.navigateTo({ url: path })
		},
		// 实习生跳转限制
		toPageTeamExpansion(path) {
			if (this.userInfo.levelCode == '0') {
				this.$showMessage('warning', this.$t('home.internNoPermission'))
				return
			}
			uni.navigateTo({
				url: path
			})
		},
		toPageTabBar(path) {
			uni.switchTab({ url: path })
		},
		toWithdrawal() {
			uni.navigateTo({ url: '/pages/MinePage/withdrawal' })
		},
		formatNumber(num) {
			if (!num && num !== 0) return '0'
			if (num > 9999) return '9,999+'
			return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
		},
		getSummary(value) {
			if (!value) return ''
			return getFirstTextTagWithEllipsis(value)
		},
		normalizeImages(images) {
			if (Array.isArray(images)) return images.filter(Boolean)
			if (typeof images === 'string') return images.split(',').map(item => item.trim()).filter(Boolean)
			return []
		},
		normalizePost(item) {
			const images = this.normalizeImages(item?.images)
			const settings = uni.getStorageSync('settings') || {}
			const author = item?.userType === 'vip_proxy' ? settings.webTitle : item?.username

			return {
				...item,
				type: 'images',
				author: author || 'Mira Studio',
				time: item?.publishTime || '--',
				featured: Boolean(item?.featured || item?.isTop || item?.recommend),
				title: item?.title || this.getSummary(item?.content),
				cover: images[0] || '',
				images,
				likes: this.formatNumber(item?.favoriteCount),
				comments: this.formatNumber(item?.commentCount),
				collects: this.formatNumber(item?.viewCount)
			}
		},
		async fetchPosts() {
			if (this.postLoading || !this.postHasMore) return
			this.postLoading = true
			try {
				const res = await getArticleList(this.postQuery)
				const rows = res?.rows || res?.data?.rows || []
				const total = res?.total ?? res?.data?.total
				const normalizedRows = rows.map(item => this.normalizePost(item))
				if (this.postQuery.pageNum === 1) {
					this.postList = normalizedRows
				} else {
					this.postList = this.postList.concat(normalizedRows)
				}
				this.postHasMore = total != null
					? this.postList.length < Number(total)
					: rows.length >= this.postQuery.pageSize
				this.postQuery.pageNum += 1
				this.postLoaded = true
			}
			catch (err) {
				showMessage('warning', err?.msg || this.$t('request.systemMaintenance'))
			}
			finally {
				this.postLoading = false
			}
		},
		onReachBottom() {
			this.fetchPosts()
		},
		observeCommunitySection() {
			this.communityObserver?.disconnect()
			this.communityObserver = uni.createIntersectionObserver(this, {
				thresholds: [0, 0.01]
			})
			// 减去底部tabbar高度
			const systemInfo = uni.getSystemInfoSync()
			const tabBarHeight = (110 * systemInfo.screenWidth / 750) + 50
			this.communityObserver.relativeToViewport({ bottom: -tabBarHeight })
			this.communityObserver.observe('#community-section', res => {
				if (res.intersectionRatio > 0 && !this.postLoaded) {
					this.fetchPosts()
					if (this.postLoaded || this.postLoading) {
						this.communityObserver.disconnect()
					}
				}
			})
		},
		observeCommunityBottom() {
			this.communityBottomObserver?.disconnect()
			this.communityBottomObserver = uni.createIntersectionObserver(this, {
				thresholds: [0, 0.01]
			})
			// 提前进入视口时触发，避免底部锚点只有 2rpx 导致部分端比例为 0
			this.communityBottomObserver.relativeToViewport({ bottom: 100 })
			this.communityBottomObserver.observe('#community-bottom-anchor', res => {
				const isVisible = res.intersectionRatio > 0 ||
					(res.intersectionRect && res.intersectionRect.height > 0)
				if (isVisible) {
					this.fetchPosts()
				}
				if (!this.postHasMore && !this.postLoading) {
					this.communityBottomObserver.disconnect()
				}
			})
		},
		// 灵活活动
		getActivityData() {
			customCycleOverviewApi().then(res => {
				this.customCycleOverviewInfo = res?.data
			})
		},
		// 最大星级福袋
		getluckybagMax() {
			luckybagMaxApi().then(res => {
				if (res.data?.starLevel) {
					this.bagInfo = res.data
					if (!uni.getStorageSync('bagShow')) {
						uni.hideTabBar();
						this.bigBag = true
					} else {
						uni.showTabBar();
					}
				} else {
					this.bagInfo = {}
					uni.showTabBar();
				}
			})
		},
		toPage(url) {
			uni.navigateTo({
				url
			})
		},
		// 关闭福袋
		closeBigBag() {
			this.bigBag = false
			uni.setStorageSync('bagShow', '1')
			uni.showTabBar();
		},
		getUserInfo() {
			userInfoApi().then((res) => {
				this.userInfo = res.data
				this.userType = res.data.userType
				if (res.data.housekeeper == 1) {
					this.isHouseKeeper = true
				} else {
					this.isHouseKeeper = false
				}
				uni.setStorageSync('userInfo', res.data)
				// settings 可能已先返回，这里统一判断弹窗链
				// this.tryStartPopupChain();
			}).catch((err) => {
				console.log('request fail', err);
				if (err.msg) {
					this.$showMessage('warning', err.msg);
				}
			})
		},
		// 首页弹窗(单独调出接口 后端判断逻辑)
		getSettingsPopupsApi() {
			settingsPopupsApi().then(res => {
				this.popWindowContentList = res.data
				if (this.popWindowContentList.length) {
					this.bigGGIndex = 0
					this.popWindowContent = formatRichText(this.popWindowContentList[this.bigGGIndex].imageUrl);
					this.bigGGScrolledToBottom = false;
					this.bigGG = true;
					uni.hideTabBar();
					this.$nextTick(() => this.checkBigGGOverflow());
					this.countdown(this.popWindowContentList[this.bigGGIndex].duration || 5);
					uni.setStorageSync('popWindowContentShow', '1');
				} else {
					this.getluckybagMax();
				}
			})
		},
		toLevel() {
			uni.switchTab({
				url: '/pages/levelPage/index'
			})
		},
		// 十秒倒计时
		countdown(time) {
			if (this.bigGGBtnNum > 0) {
				return
			}
			// 清除已存在的定时器
			if (this.bigGGTimer) {
				clearInterval(this.bigGGTimer);
			}
			this.bigGGBtnNum = time
			this.bigGGTimer = setInterval(() => {
				time--
				this.bigGGBtnNum = time
				if (time <= 0) {
					clearInterval(this.bigGGTimer)
				}
			}, 1000)
		},
		// 首页全屏公告(点击关闭)
		closeBigGG() {
			// 未滚动到底部不允许关闭
			if (!this.bigGGScrolledToBottom) {
				this.$showMessage('warning', this.$t('home.scrollToBottom'))
				return
			}
			// uni.showTabBar();
			this.bigGGIndex++
			if (this.bigGGIndex > this.popWindowContentList.length - 1) {
				this.bigGG = false;
				this.getluckybagMax()
			} else {
				this.bigGGScrolledToBottom = false;
				this.popWindowContent = formatRichText(this.popWindowContentList[this
					.bigGGIndex].imageUrl)
				this.$nextTick(() => this.checkBigGGOverflow());
				// 倒计时按钮
				this.countdown(this.popWindowContentList[this
					.bigGGIndex].duration || 5)
			}

		},
		// 监听公告滚动
		onBigGGScroll(e) {
			const detail = e.detail || {};
			const scrollTop = detail.scrollTop;
			const scrollHeight = detail.scrollHeight;
			const containerHeight = this.bigGGContainerHeight;
			if (scrollTop != null && scrollHeight != null && containerHeight) {
				// 允许 2px 误差
				if (scrollTop + containerHeight >= scrollHeight - 2) {
					this.bigGGScrolledToBottom = true;
				}
			}
		},
		// 检测公告内容是否需要滚动（一屏能显示完则直接标记为已到底部）
		checkBigGGOverflow() {
			const query = uni.createSelectorQuery().in(this);
			query.select('.bigGG_main').boundingClientRect();
			query.select('.bigGG_text').boundingClientRect();
			query.exec((res) => {
				if (res[0]) {
					this.bigGGContainerHeight = res[0].height;
				}
				if (res[0] && res[1] && res[1].height <= res[0].height) {
					this.bigGGScrolledToBottom = true;
				}
			});
		},
		// 首页三位活动
		getActiveCenterTop() {
			activeCenterTopApi().then(res => {
				this.activeCenterTop = res.data
			})
		},
		// 首页菜单
		getMenuListApi() {
			menuListApi({
				type: 'home'
			}).then(res => {
				let originalData = res.data;
				if (this.userInfo.levelCode == '0') {
					originalData = originalData.filter(item => {
						return item.canEnterIntern != false;
					});
				}
				const menuList = [];
				// 每4个元素分一组
				for (let i = 0; i < originalData.length; i += 4) {
					// 从当前索引开始，截取最多4个元素
					const group = originalData.slice(i, i + 4);
					menuList.push(group);
				}
				// console.log(menuList)
				this.menuList = menuList; // 赋值给数据属性
			}).catch((err) => {
				console.log('request fail', err);
				// this.$showMessage('warning', err.msg);
			})
		},
		splitText(t) {
			if (uni.getStorageSync('settings').defaultLanguage == 'fr') {
				const parts = t.split(' ');
				return parts.length > 1 ? parts[0] + ' ' + parts[1] + '\n' + parts.slice(2).join(' ') : t;
			} else {
				const newline = '\n';
				return t.split(' ').join(newline);
			}
		},
	},
	onShow() {
		// activityCenterApi().then(res => {
		// 	this.activityCenter = res.data
		// })
		// 灵活活动
		// this.getActivityData()
		this.getActiveCenterTop()
		this.getUserInfo()
		this.getMenuListApi()
		if (!uni.getStorageSync('popWindowContentShow')) {
			this.getSettingsPopupsApi()
		}
		this.noticeList = uni.getStorageSync('settings').noticeList
		this.luckyBagSwitch = uni.getStorageSync('settings').luckyBagSwitch
		this.webTitle = uni.getStorageSync('settings').webTitle
		settingsApi().then((res) => {
			uni.setStorageSync('settings', res.data)
			this.currency = uni.getStorageSync('settings').currency
			// 是否有滚动消息
			if (uni.getStorageSync('settings').rollSwitch == 1) {
				this.rollContent = htmlToPlainText(uni.getStorageSync('settings').rollContent)
				this.isShowMessage2 = true
			}
			// 标记 settings 已就绪，等 getUserInfo 也返回后统一判断弹窗
			this._settingsReady = true;
			// this.tryStartPopupChain();
		}).catch(err => {
			console.log('request fail', err);
			if (err.data?.code == 403) {
				this.$showMessage('warning', err.data?.msg);
			} else {
				this.$showMessage('warning', err.msg);
			}
		})
		this.getMessageNoticeApi()
	},
	mounted() {
		this.currency = uni.getStorageSync('settings').currency || ''
		this.noticeList = uni.getStorageSync('settings').noticeList || []
		this.userInfo = uni.getStorageSync('userInfo') || {}
		this.userType = this.userInfo.userType
		// 首页推荐产品
		this.getProductRecommend()
		setTimeout(() => {
			this.$nextTick(() => this.observeCommunitySection())
			this.$nextTick(() => this.observeCommunityBottom())
		}, 1000)
	},
	beforeUnmount() {
		this.communityObserver?.disconnect()
		this.communityBottomObserver?.disconnect()
	},
	onLoad() {
		if (uni.getStorageSync('popWindowContentShow')) {
			uni.removeStorageSync('popWindowContentShow')
		}
		if (uni.getStorageSync('bagShow')) {
			uni.removeStorageSync('bagShow')
		}
	}
}
</script>

<style lang="scss" scoped>
* {
	box-sizing: border-box;
	font-family: 'MiSans';
}

// 等级展示
.level_box {
	position: relative;
	z-index: 1;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	width: 702rpx;
	height: 96rpx;
	margin: 16rpx auto;
	padding: 12rpx 24rpx;
	border-radius: 16rpx;
	background: url('/static/mine/position2.png') top left/100% no-repeat;

	.member_card_img {
		width: 72rpx;
		min-width: 72rpx;
		height: 72rpx;
		margin-right: 12rpx;
	}

	.text_box {
		.card_text {
			font-family: DingTalk JinBuTi;
			font-weight: 500;
			font-size: 32rpx;
			color: #000;
		}

		.hint {
			font-family: MiSans;
			font-size: 24rpx;
			font-weight: 300;
			color: #797979;
		}
	}
}

// 菜单
.home_center_box {
	margin: 24rpx;

	// .center_item_box:nth-child(2) {
	// 	margin-top: 24rpx;
	// }
}

.center_item_box {
	display: grid;
	grid-template-columns: repeat(4, 1fr);

	.center_item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.icon-wrapper_box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 96rpx;
		height: 96rpx;
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0px 12px 16px 0px #E9F3FF;
	}

	.icon-wrapper {
		width: 64rpx;
		height: 64rpx;
	}

	.center_item_t {
		height: 48rpx;
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 20rpx;
		color: #1C2D57;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

::v-deep .l-notice-bar {
	border-radius: 24rpx;
	padding-right: 0;
}

::v-deep .l-notice-bar__left {
	padding: 0 !important;
}

::v-deep .l-notice-bar__content-scroll {
	transform: translateY(2rpx);
}

.bigGG {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 99999;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24rpx;

	.bigGG_main {
		box-sizing: border-box;
		width: 85vw;
		padding: 24rpx;
		border-radius: 12rpx;
		background-color: #fff;
		max-height: 84vh;
		overflow-y: auto;

		.bigGG_text {
			/* 移除截断限制，内容过多时由父容器 bigGG_main 的 overflow-y: auto 提供滚动 */
			word-break: break-all;
			white-space: pre-line;
		}
	}

	.xImage {
		width: 58rpx;
		height: 58rpx;
	}

	.xImage_disabled {
		opacity: 0.35;
	}


	.bigGGBtnClose {
		color: white;
		border-radius: 50%;
		border: 4rpx solid white;
		width: 52rpx;
		height: 52rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

.bigBag {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 9999;


	.bigBag_main {
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		width: 718rpx;
		height: 918rpx;
		border-radius: 12rpx;
		background: url('/static/bigBag/bigBagBgi.png') top left/100% no-repeat;

		.bigBag_img {
			width: 468rpx;
			height: 468rpx;
		}

		.bigBag_text {
			font-size: 36rpx;
			font-weight: bold;
			color: #000;
			width: 500rpx;
			text-align: center;
		}

		.bigBag_text2 {
			font-size: 28rpx;
			font-weight: normal;
			color: #000;
			margin-top: 16rpx;
		}

		.getBtn {
			background: $themeColor;
			border-radius: 44rpx;
			box-shadow: 0rpx 8rpx 8rpx 0rpx rgba(129, 62, 0, 0.24);
			padding: 20rpx 200rpx;
			font-size: 36rpx;
			font-weight: bold;
			color: #fff;
			text-align: center;
			margin: 32rpx 0;
		}

		.not {
			font-size: 28rpx;
			color: #404040;
		}

		.bigBag_img,
		.bigBag_text,
		.bigBag_text2,
		.getBtn,
		.not {
			transform: translateY(-30rpx);
		}
	}
}

.home_container {
	background: #f4f5fb;
	padding-bottom: 26rpx;
}

.home_top_bg {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1076rpx;
	background:
		radial-gradient(circle at 0% 0%, #69d6ec 0%, rgba(105, 214, 236, 0.55) 34%, transparent 62%),
		radial-gradient(circle at 100% 0%, #3aaff5 0%, rgba(58, 175, 245, 0.55) 36%, transparent 65%),
		radial-gradient(circle at 50% 45%, rgba(245, 248, 255, 0.9) 0%, rgba(245, 248, 255, 0.25) 42%, transparent 72%),
		linear-gradient(180deg, #b9e9f3 0%, rgba(234, 246, 248, 0.8) 55%, rgba(244, 245, 251, 0) 100%);
}

.home_top_center {
	position: relative;
	z-index: 1;
	margin: 24rpx 0;
	padding: 0 24rpx;
	display: flex;
	gap: 14rpx;
}

.home_top_center_left {
	// width: 464rpx;
	display: flex;
	justify-content: space-between;
	width: 100%;
	padding: 24rpx;
	border-radius: 24rpx;
	background: #fff;

	.avatar_box {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-bottom: 14rpx;

		.text {
			font-family: DingTalk JinBuTi;
			font-size: 36rpx;
		}

		.avatar {
			width: 46rpx;
			min-width: 46rpx;
			height: 46rpx;
			border-radius: 12rpx;
		}
	}
}

.home_top_center_left_b {
	display: flex;
	flex-direction: column;
	align-items: end;
	justify-content: space-between;
}

.home_top_center_right {
	position: relative;
	flex: 1;
	min-height: 210rpx;
	overflow: hidden;
	border-radius: 24rpx;
	background: #fff;
}

.level_img_bg {
	position: absolute;
	top: 0;
	right: 0;
	width: 146rpx;
	height: 60rpx;
	background: #ffd600;
	clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 54% 100%, 43% 100%, 34% 99%, 28% 96%, 23% 91%, 17% 83%, 13% 71%, 10% 59%);
}

.level_img {
	position: absolute;
	top: -12rpx;
	right: 0rpx;
	width: 112rpx;
	height: 112rpx;
}

.level_img_mask {
	position: absolute;
	top: 60rpx;
	right: 0;
	width: 100%;
	bottom: 0;
	background: #fff;
}

.level_name {
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-height: 210rpx;
	position: relative;
	z-index: 1;
	padding: 36rpx 16rpx 0;
}

.level_code {
	margin-bottom: 10rpx;
	font-family: DingTalk JinBuTi;
	font-size: 24rpx;
	color: #B8B8B8;
	width: 120rpx;
}

.level_title {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 34rpx;
	margin-bottom: 12rpx;
}

.level_upgrade {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: $themeColor;
}

.account_balance_box {
	font-size: 24rpx;
	color: $themeColor;
}

.account_balance_t {
	font-family: Dela Gothic One;
	font-size: 42rpx;
	color: #000;
	margin-top: 4rpx;
	line-height: 40rpx;
}

.withdrawal_btn {
	border-radius: 8rpx;
	padding: 13rpx 24rpx;
	background: rgba(1, 69, 241, .06);
	border: 2rpx solid $themeColor;
	font-size: 24rpx;
	color: $themeColor;

	&.Recharge {
		color: #fff;
		background-color: #000;
		border: 2rpx solid #000;
	}
}

.noticebar {
	position: relative;
	z-index: 1;
	box-sizing: border-box;
	width: 100%;
	height: 80rpx;
	padding: 0 24rpx;
}

.growth-card {
	position: relative;
	z-index: 1;
	margin: 0 24rpx;
	padding: 40rpx 24rpx 28rpx;
	border-radius: 24rpx;
	background: #15191f;
	color: #fff;
}

.growth-swiper {
	width: 100%;
	min-height: 426rpx;
}

.growth-title {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
}

.growth-desc {
	margin-top: 18rpx;
	color: #c8d6ef;
	font-size: 25rpx;
	line-height: 34rpx;
}

.growth-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16rpx;
}

.growth-rate {
	font-family: Dela Gothic One;
	font-size: 64rpx;
	line-height: 76rpx;
}

.learn-btn {
	width: 246rpx;
	height: 70rpx;
	border-radius: 22rpx;
	background: $themeColor;
	color: #fff;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 70rpx;
	text-align: center;
}

.growth-income {
	margin-top: 4rpx;
	color: #ffd900;
	font-size: 24rpx;
	font-weight: 700;
	line-height: 34rpx;
}

.growth-meta {
	display: flex;
	margin-top: 24rpx;
}

.meta-item {
	flex: 1;
	padding-left: 14rpx;
	border-left: 2rpx solid rgba(196, 210, 230, .35);
}

.meta-item:first-child {
	padding-left: 0;
	border-left: 0;
}

.meta-value,
.meta-label {
	display: block;
}

.meta-value {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 38rpx;
}

.meta-label {
	margin-top: 10rpx;
	color: #aeb9cc;
	font-size: 22rpx;
}

.dots {
	display: flex;
	justify-content: center;
	gap: 16rpx;
	margin: 16rpx 0 24rpx;
}

.dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #e3e3e3;
}

.dot.active {
	background: #2274ff;
}

.customCycleOverview_box {
	position: relative;
	z-index: 2;
	width: 704rpx;
	height: 154rpx;
	background: url('/static/home/customCycleOverviewBanner.png') top left/100% 100% no-repeat;
	margin: 0 24rpx 24rpx;
	padding-left: 24rpx;

	.title {
		font-family: initial;
		font-size: 44rpx;
		font-weight: 900;
		color: #7C36BF;
	}

	.label_box {
		display: flex;
		gap: 44rpx;

		.item_box {
			padding-left: 12rpx;

			&::after {
				content: '';
				width: 2rpx;
				height: 42rpx;
				background: #EAD4FF;
			}


			.tag {
				padding-top: 8rpx;
				font-size: 20rpx;
				color: #5F7BB2;
			}

			.value {
				font-size: 28rpx;
				font-weight: bold;
				color: #7C36BF;
			}
		}


	}
}

.menu-row {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
	padding: 0 24rpx;
}

.menu-card {
	position: relative;
	flex: 1;
	height: 144rpx;
	padding: 8rpx 16rpx;
	overflow: hidden;
}

.menu-title {
	white-space: pre-line;
	color: #000;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 32rpx;
}

.menu-go {
	margin-top: 8rpx;
	color: #a1a7b5;
	font-size: 20rpx;
}

.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24rpx;
}

.section-title {
	color: #14213D;
	font-size: 36rpx;
	font-weight: 800;
	position: relative;
	z-index: 2;
}

.activity-head {
	position: relative;
	z-index: 2;
	margin-top: 42rpx;
}

.more-link {
	color: #006dff;
	font-size: 24rpx;
}

.activity-grid {
	display: flex;
	gap: 8rpx;
	padding: 20rpx 24rpx 0;
	position: relative;
	z-index: 2;
}

.activity-big {
	width: 352rpx;
	height: 304rpx;
	border-radius: 24rpx;
}

.activity-side {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
	flex: 1;
}

.activity-side image {
	width: 100%;
	height: 145rpx;
	border-radius: 24rpx;
}

.community-head {
	margin-top: 42rpx;
	margin-bottom: 24rpx;
}

.community-loading {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	min-height: 180rpx;
	color: #8b93a7;
	font-size: 26rpx;
	position: relative;
	z-index: 2;
}

.community-loading-spinner {
	width: 34rpx;
	height: 34rpx;
	border: 4rpx solid #dce8ff;
	border-top-color: #006dff;
	border-radius: 50%;
	animation: community-loading-spin 0.8s linear infinite;
}

.community-bottom-anchor {
	height: 20rpx;
	width: 100%;
}

@keyframes community-loading-spin {
	to {
		transform: rotate(360deg);
	}
}

// 帖子
.hero-row {
	position: relative;
	z-index: 1;
	display: flex;
	gap: 14rpx;
	padding: 0 24rpx 0;

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


.prompt_pop_page {
	width: 570rpx;
	background: #FFFFFF;
	border-radius: 28rpx;
	padding: 40rpx 54rpx 28rpx 54rpx;

	.prompt_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.prompt_pop_taps {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.prompt_pop_bottom {
		display: flex;
		margin-top: 54rpx;
	}

	.prompt_cancel_btn {
		width: 212rpx;
		height: 72rpx;
		background: #EBEBEB;
		border-radius: 16rpx;
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}

	.prompt_confirm_btn {
		width: 212rpx;
		height: 72rpx;
		background: $themeColor;
		box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 16rpx;
		font-family: "DINPro-Black", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}
}
</style>
