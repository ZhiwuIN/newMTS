<template>
	<view>
		<view :style="navStyle" class="custom-navbar">
			<image :lazy-load="true" src="/static/home/setting.svg" class="left-icon" v-if="isHome" @click="toLanguage">
			</image>
			<image :lazy-load="true" src="/static/back_icon.png" class="left-icon" v-if="showBack && !whiteTitle"
				@click="back"></image>
			<image :lazy-load="true" src="/static/back_icon2.png" class="left-icon" v-if="showBack && whiteTitle"
				@click="back"></image>
			<view class="nav-white-title" v-if="whiteTitle">{{ title }}</view>
			<view class="nav-title" v-else>{{ title }}</view>
			<view class="right-menu" v-if="rightMenu">{{ rightMenu }}</view>
			<!-- <image src="/static/home/message.svg" class="right-icon" v-if="isHome" @click="toMsg"></image> -->
			<!-- <view class="redDot"  v-if="isHome && hasMessage"></view> -->
			<image src="/static/mine/application_record.png" :lazy-load="true" class="right-icon"
				v-if="isPositionManage" @click="toApplication('/pages/MinePage/applicationRecord')">
			</image>
			<image :lazy-load="true" src="/static/home/Record.png" class="right-icon isFinancePage" v-if="isFinancePage"
				@click="toApplication('/pages/MinePage/financePage')">
			</image>
			<image :lazy-load="true" style="width: 48rpx;height: 48rpx;" src="/static/BlackStars/explain.png" class="right-icon isFinancePage"
				v-if="isBlackStars" @click="toApplication('/pages/BlackStarsPage/explain')">
			</image>
			<view class="right-text isLotteryRecord" v-if="isLotteryRecord"
				@click="toApplication('/pages/HomePage/tirageRecordPage')">
				{{ $t('记录') }}
			</view>
			<image src="/static/bigBag/Record.png" class="right-icon isFinancePage" v-if="isLuckyBag"
				@click="toApplication('/pages/luckyBagPage/luckyBagRecord')" mode="heightFix">
			</image>
			<!-- <view class="right-text" v-if="isPositionManage">申请记录</view> -->
		</view>
		<!-- <scroll-view class="page-content" scroll-y="true" :style="{'height':pageH+'rpx'}"
			@scrolltolower="scrolltolower">
			<slot></slot>
		</scroll-view> -->
		<view :style="{ 'padding-top': mtop + 'rpx' }">
			<slot></slot>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		title: {
			type: String,
			default: ''
		},
		hasMessage: {
			type: Boolean,
			default: false
		},
		backgroundStr: {
			type: String,
			default: '#FFFFFF'
		},
		showBack: {
			type: Boolean,
			default: true
		},
		rightMenu: {
			type: String,
			default: ""
		},
		isHome: {
			type: Boolean,
			default: false
		},
		isPositionManage: {
			type: Boolean,
			default: false
		},
		isFinancePage: {
			type: Boolean,
			default: false
		},
		isBlackStars: {
			type: Boolean,
			default: false
		},
		isLotteryRecord: {
			type: Boolean,
			default: false
		},
		isLuckyBag: {
			type: Boolean,
			default: false
		},
		whiteTitle: {
			type: Boolean,
			default: false
		},
	},
	data() {
		return {
			statusBarHeight: 0,
			navBarHeight: 88, // 默认导航栏高度
			scrollBackgroundStr: '#FFFFFF',
			mtop: 0,
			pageH: 0
		}
	},
	computed: {
		navStyle() {
			return {
				'padding-top': this.statusBarHeight + 'rpx',
				'height': this.mtop + 'rpx',
				'background': this.scrollBackgroundStr,
				'background-size': 'cover',
				'transform': 'translateY(-1px)',
				'transition': 'background 0.3s'
			}
		}
	},
	methods: {
		back() {
			this.$customizeBack()
		},
		toLanguage() {
			uni.navigateTo({
				url: '/pages/HomePage/setting'
			})
		},
		toMsg() {
			uni.navigateTo({
				url: '/pages/HomePage/messagePage'
			})
		},
		toApplication(url) {
			uni.navigateTo({
				url
			})
		},
		setNavBarInfo() {
			// #ifdef APP-PLUS
			// App端
			const sys = uni.getSystemInfoSync();
			this.statusBarHeight = sys.statusBarHeight;
			// 安卓/iOS导航栏高度适配
			if (sys.platform === 'android') {
				this.navBarHeight = 96;
			} else {
				this.navBarHeight = 88;
			}
			// #endif

			// #ifdef H5
			// H5端
			this.statusBarHeight = 0;
			this.navBarHeight = 88;
			// #endif

			// 计算scroll-view高度
			uni.getSystemInfo({
				success: (res) => {
					this.mtop = this.statusBarHeight / 2 + this.navBarHeight
					this.pageH = res.windowHeight * 2
					this.$emit('mtop', this.mtop)
				}
			});
		},
	},
	mounted() {
		this.setNavBarInfo();
		this.scrollBackgroundStr = this.$props.backgroundStr
	},
}
</script>

<style scoped>
.redDot {
	position: absolute;
	top: 26rpx;
	right: 50rpx;
	width: 18rpx;
	height: 18rpx;
	background-color: #FF0000;
	border-radius: 50%;
}

.custom-navbar {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	/* 背景色和透明度由js控制 */
	/* box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); */
}

.nav-white-title {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #FFFFFF;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
}

.nav-title {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
}

/* .page-content {
		width: 100%;
		box-sizing: border-box;
		overflow: scroll;
	} */

.left-icon {
	width: 48rpx;
	height: 48rpx;
	position: absolute;
	left: 48rpx;
}

.right-icon {
	width: 48rpx;
	height: 48rpx;
	position: absolute;
	right: 48rpx;
}

.right-icon.isFinancePage {
	width: 40rpx;
	height: 44rpx;
}

.right-text {
	position: absolute;
	right: 5%;
	top: 34%;
	font-family: PingFangSC, PingFang SC;
	font-weight: 400;
	font-size: 32rpx;
	color: #FFFFFF;
	line-height: 28rpx;
	text-align: center;
	font-style: normal;
}

.right-menu {
	position: absolute;
	right: 30rpx;
}
</style>