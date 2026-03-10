<template>
	<view>
		<customnavbar :title="$t('luckyBagTitle')"
			backgroundStr="url('/static/lottery/bgi.png') top left/100%  no-repeat" @mtop='mtop' :isLuckyBag="true">
			<view class="Big_bgi" :style="topStyle2"></view>
			<view class="main" :style="topStyle2">
				<view>
					<view class="tabs_box">
						<uv-tabs :list="list" @change="changeIdx" :current="activeIdx">
							<template #badge="{ item, index }">
								<view class="bagbox" :class="{ 'active': index == this.activeIdx }">
									x{{ item.remainTimes }}
									<image class="bagbox_img" :src="item.image" mode="" :lazy-load="true">
									</image>
								</view>
							</template>
						</uv-tabs>
					</view>
					<view class="luck_box">
						<image class="bag_img" :src="info.image" mode="" :lazy-load="true">
						</image>
						<view class="title gradient-text">{{ info.bagName }}</view>
						<view class="number gradient-text">{{ info.minAmount }}-{{ info.maxAmount }}</view>
						<view class="open_btn" @click="luckybagOpen" v-if="info.remainTimes">{{ $t('OPEN') }}</view>
						<view class="open_btn gray" v-else>{{ $t('OPEN') }}</view>
						<image @click="handleSwipe(0)" class="arrows_img_left arrows_img"
							src="https://upload.cbc-app.com/left.png" mode="" :lazy-load="true">
						</image>
						<image @click="handleSwipe(1)" class="arrows_img_right arrows_img"
							src="/static/bigBag/right.png" mode="" :lazy-load="true">
						</image>
						<!-- 福袋说明 -->
						<!-- <view class="Explain" @click="toPage">{{ $t('bagExplain') }}</view> -->
					</view>
				</view>

				<view class="explain_box">
					<!-- 获奖记录 -->
					<view class="record" v-if="recordList.length">
						<view class="record-list">
							<swiper circular :indicator-dots="false" :autoplay="true" :interval='1500' :duration="1500"
								easing-function="linear" :acceleration="true" :disable-touch="true" :vertical="true"
								class="swiper" :display-multiple-items="recordList.length >= 4 ? 4 : recordList.length">
								<swiper-item v-for="(item, index) in recordList" :key="index.toFixed()"
									class="swiper_item" :class="recordList.length < 4 ? 'sItem' : ''">
									<view class="record-list-item">
										<view class="left">
											<view class="record-list-item-img">
												<image src="/static/default-avatar.png" class="record-list-item-img_img"
													mode="aspectFit"></image>
											</view>
											<view class="record-list-item-text">
												<view class="record-list-item-text-name">
													<text>{{ item.name }}</text>
												</view>
												<view class="record-list-item-text-con">
													<!-- <span class="level_name">Lv1</span> -->
													<!-- <view>{{ $t('luckyBagtitle') }}</view> -->
													<view>{{ item.con }}</view>
												</view>
											</view>
										</view>
										<view class="record-list-item-text-prizes">
											<text>+{{ item.prizes }}</text>
										</view>
									</view>
								</swiper-item>
							</swiper>
						</view>
					</view>

					<!-- 福袋说明 -->
					<!-- <view class="content" v-html="companyInfo"></view> -->
				</view>

			</view>
		</customnavbar>

		<!-- 领取成功提示 -->
		<t-overlay :visible="bigBag" v-if="bigBag" />
		<view class="bigBag" v-if="bigBag">
			<view class="title">{{ $t('获得奖励') }}</view>
			<view class="title2 gradient-text">{{ $t('恭喜') }}</view>
			<numberScroll :value="numberScrollValue" @changeIsBounce="changeBounce" />
			<!-- <view class="number gradient-text">{{ amount }}</view> -->
			<view class="title2 gradient-text" style="margin: 0;transform: translateY(-24rpx);">{{ currency }}</view>
			<view class="btn" @click="bigBag = false" v-if="!isBounce">{{ $t('确认') }}</view>
		</view>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue';
import numberScroll from '@/components/number-scroll/index.vue';
import {
	luckybagOpenApi,
	luckybagListApi,
	luckybagNoticeListApi
} from "@/common/api/bag.js";
export default {
	components: {
		customnavbar,
		numberScroll
	},
	data() {
		return {
			numberScrollValue: '',
			recordList: [], // 展示获奖记录
			bigBag: false,
			info: {},
			topStyle2: '',
			list: [],
			activeIdx: 0,
			companyInfo: '', // 说明
			loading: false,
			currency: '', // 币种
			amount: 0,
			isBounce: false
		}
	},
	methods: {
		changeBounce() {
			this.isBounce = false
		},
		toPage() {
			uni.navigateTo({
				url: '/pages/luckyBagPage/luckyBagExplain'
			})
		},
		// 获奖记录
		getRecordList() {
			luckybagNoticeListApi().then((res) => {
				let arr = res.data || []
				if (arr.length) {
					this.recordList = res.data.map(item => ({
						img: item.img,
						name: item.username,
						con: item.type,
						prizes: item.resultDescribed
					}))
				}
			})
		},
		// 福袋列表
		getList() {
			luckybagListApi().then(res => {
				this.list = res.data.list
				// this.companyInfo = formatRichText(res.data.description)
				if (!this.list?.length) return
				this.info = this.list[0]
			})
		},
		// 打开福袋
		luckybagOpen() {
			if (this.loading) return
			this.loading = true
			this.numberScrollValue = this.info.maxAmount
			luckybagOpenApi(this.info.starLevel).then(res => {
				this.list[this.activeIdx].remainTimes--
				this.amount = res.data?.amount || 0
				// 获取 maxAmount 的位数
				const maxAmountLength = this.info.maxAmount.toString().length
				// 将 amount 转换为字符串并补零
				this.amount = this.amount.toString().padStart(maxAmountLength, '0')
				this.numberScrollValue = this.amount
				this.isBounce = true
				this.bigBag = true
				// console.log(res)
			}).catch(err => {
				console.log('request fail', err);
			}).finally(() => {
				this.loading = false
			})
		},
		// 点击切换
		changeIdx(item) {
			this.activeIdx = item.index
			this.info = this.list[item.index]
		},
		// 箭头切换
		handleSwipe(direction) {
			if (direction === 0) {
				this.activeIdx = this.activeIdx === 0 ?
					this.list.length - 1 :
					this.activeIdx - 1;
			} else {
				this.activeIdx = this.activeIdx === this.list.length - 1 ?
					0 :
					this.activeIdx + 1;
			}
			this.info = this.list[this.activeIdx]
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx - ${e}rpx);`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle2 = `height:calc(100vh - ${e}rpx);`
			// #endif
		}
	},
	onShow() {
		this.getList()
		this.getRecordList()
		this.currency = uni.getStorageSync('settings').currency
	},
}
</script>

<style lang="scss" scoped>
* {
	box-sizing: border-box;
}

::v-deep .t-overlay {
	z-index: 10000 !important;
}

.bigBag {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10001;
	width: 718rpx;
	height: 844rpx;
	background: url('/static/bigBag/bagGet.png') top left/100% no-repeat;
	font-family: Alfa Slab One;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 146rpx;

	.title {
		font-size: 62rpx;
		color: #fff;
		transform: translateX(-100rpx);
	}

	.title2 {
		font-size: 48rpx;
		color: #fff;
		margin-top: 64rpx;
		-webkit-text-stroke: 2rpx #fff;
		text-stroke: 2rpx #fff;
	}

	.number {
		font-size: 120rpx;
		-webkit-text-stroke: 4rpx #fff;
		text-stroke: 4rpx #fff;
	}

	.btn {
		font-family: "DINPro-Medium", sans-serif;
		padding: 20rpx 214rpx;
		border-radius: 44rpx;
		// background: linear-gradient(90deg, $gradualColor1 0%, $gradualColor2 100%);
		background: $themeColor;
		box-shadow: 0px 8rpx 8rpx 0px rgba(129, 62, 0, 0.16);
		font-size: 36rpx;
		font-weight: bold;
		color: #fff;
		margin-top: 12rpx;
	}
}

.gradient-text {
	display: inline-block;
	// background: linear-gradient(90deg, $gradualColor1 0%, $gradualColor2 100%);
	background: $themeColor;
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	text-fill-color: transparent;
	color: transparent;
}

.Big_bgi {
	background: url('/static/lottery/bgi.png') top left/100% no-repeat;
}

.main {
	display: flex;
	flex-direction: column;
	// overflow: hidden;

	.explain_box {
		flex: 1;
		background: linear-gradient(90deg, $gradualColor1 0%, $gradualColor2 100%);
		border-radius: 40rpx 40rpx 0rpx 0rpx;
		padding: 32rpx 32rpx 0;

		.content {
			background-color: #fff;
			padding: 32rpx;
			height: 600rpx;
			border-radius: 12rpx 12rpx 0 0;
			overflow-y: auto;
		}
	}
}

.tabs_box {
	padding-top: 16rpx;
	padding-left: 9rpx;
	margin-bottom: 24rpx;

	.bagbox {
		position: relative;
		padding: 4rpx 32rpx 8rpx 88rpx;
		background: transparent;
		border-radius: 44rpx;
		font-size: 32rpx;
		font-weight: bold;
		color: #fff;
		border: 4rpx solid #FFFFFF;

		&.active {
			background: linear-gradient(90deg, $gradualColor1 0%, $gradualColor2 100%);
		}

		.bagbox_img {
			position: absolute;
			left: 14rpx;
			bottom: 0;
			width: 74rpx;
			height: 74rpx;
		}
	}
}

.luck_box {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;

	.Explain {
		color: #fff;
		position: absolute;
		right: 32rpx;
		top: 24rpx;
		font-size: 28rpx;
		text-decoration: underline;
	}

	.bag_img {
		width: 440rpx;
		height: 440rpx;
	}

	.title {
		position: absolute;
		top: 336rpx;
		left: 50%;
		transform: translateX(-50%);
		font-family: Alfa Slab One;
		// font-size: 48rpx;
		font-size: 42rpx;
		-webkit-text-stroke: 2rpx #fff;
		text-stroke: 2rpx #fff;
		white-space: nowrap;
	}

	.number {
		position: absolute;
		top: 396rpx;
		left: 50%;
		transform: translateX(-50%);
		font-family: Alfa Slab One;
		// font-size: 72rpx;
		font-size: 62rpx;
		-webkit-text-stroke: 4rpx #fff;
		text-stroke: 4rpx #fff;
		white-space: nowrap;
	}

	.open_btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 522rpx;
		height: 88rpx;
		border-radius: 44rpx;
		background: linear-gradient(90deg, $gradualColor1 0%, $gradualColor2 100%);
		box-shadow: 0px 8px 8px 0px rgba(129, 62, 0, 0.16);
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
		border: 4rpx solid #fff;
		margin-top: 44rpx;
		margin-bottom: 22rpx;

		&.gray {
			background: linear-gradient(90deg, #4F4F4F 0%, #B0B0B0 100%);
			border: 0px solid #000;
		}
	}

	.arrows_img {
		position: absolute;
		top: 34%;
		width: 40.83rpx;
		height: 90rpx;

		&_left {
			left: 26rpx;
		}

		&_right {
			right: 26rpx;
		}
	}
}
</style>

<style lang="scss" scoped>
uni-swiper {
	height: 100%;
}

.record {
	position: relative;
	background: #fff;
	// border-top-right-radius: 50rpx;
	// border-top-left-radius: 50rpx;
	padding: 0 24rpx;
	// margin-bottom: 22rpx;
	border-radius: 12rpx 12rpx 0 0;
	height: 100%;

	.record-list {
		height: 100%;
	}

	::v-deep .uni-swiper-slide-frame {
		height: 126rpx !important;
	}

	.swiper_item {
		height: 126rpx !important;
	}

	.record-list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 2rpx solid #EBEBEB;
		padding-bottom: 22rpx;
		padding-top: 18rpx;
	}

	.left {
		display: flex;
	}

	.record-list-item-img {
		width: 84rpx;
		height: 84rpx;
		background: #f5f8ff;
		border-radius: 50%;

		.record-list-item-img_img {
			width: 100%;
			height: 100%;
		}
	}

	.record-list-item-text {
		margin-left: 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}

	.record-list-item-text-name {
		font-family: 'DINPro-Regular', sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #000000;
		line-height: 30rpx;
		text-align: left;
		font-style: normal;
	}

	.record-list-item-text-con {
		font-family: 'DINPro-Regular', sans-serif;
		font-weight: 400;
		font-size: 24rpx;
		color: #909090;
		line-height: 28rpx;
		text-align: left;
		font-style: normal;

		.level_name {
			font-size: 24rpx;
			font-weight: 600;
			color: #FFBB00;
		}
	}

	.record-list-item-text-prizes {
		font-family: 'DINPro-Bold', sans-serif;
		font-weight: bold;
		font-size: 28rpx;
		color: $themeColor;
		text-align: center;
		font-style: normal;
	}
}
</style>