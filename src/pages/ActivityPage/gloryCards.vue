<template>
	<!-- :title="$t('pages.Luckyturntable')" -->
	<customnavbar backgroundStr="" @mtop="mtop" :whiteTitle="true">
		<view class="Big_bgi" :style="topStyle2"></view>
		<view class="container">
			<view class="lottery_top_bg" :style="topStyle">
				<view class="wheel-section">
					<view class="titleImg">
						{{ $t('开启你的幸运之旅') }}
					</view>
					<view style="display: flex;justify-content: center;padding: 0 16rpx;">
						<!-- :row="Math.ceil(this.prizes.length / 3)" -->
						<shDrawCard2 ref="drawCardRef" :list="prizes" :targetIndex="1"
							:row="Math.ceil(this.prizes.length / 3)" :col="3" :maxOpenCount="1" :endTurnAll="true"
							:shuffleAnimate="true" :shuffle="true" :shuffleTurnAll="true" :turnTime="0.3"
							:onOpenAsync="getRealPrize" :width="230" :height="272">
							<template #back="{ data }">
								<view class="prizesItem"
									:style="{ background: `url(${data.backgroundImage || '/static/gloryCards/backImg.png'}) top left / 100% 100% no-repeat` }">
									<image class="prizeImg"
										:src="data.image ? data.image : '/static/lottery/losing.png'" mode="heightFix">
									</image>
									<view class="prizeName">{{ data.prizeName }}</view>
								</view>
							</template>
						</shDrawCard2>
					</view>
					<view class="footBox" @click="start">
						<image class="btn_img" src="/static/gloryCards/btn_img.png">
						</image>
						<view class="btn" style="width: 592rpx;" v-if="isLoading != 'underway' && prizes.length">
							{{ $t('Startthelotterydraw') }}
						</view>
						<view class="times">
							{{ $t('Lucky.times') }}:{{ count }}
						</view>
					</view>
				</view>


				<!-- 说明 -->
				<view class="explain" v-html="desc" v-if="desc"></view>

				<!-- 展示 -->
				<view class="record" v-if="list.length">
					<view class="record-tab">
						<view class="record-tab-item">
							<view class="record-tab-item-text">
								<text>{{ $t('获奖记录') }}</text>
							</view>
						</view>
					</view>
					<view class="record-list">
						<swiper circular :indicator-dots="false" :autoplay="true" :interval='1500' :duration="1500"
							easing-function="linear" :acceleration="true" :disable-touch="true" :vertical="true"
							class="swiper" :display-multiple-items="list.length >= 4 ? 4 : list.length">
							<swiper-item v-for="(item, index) in list" :key="index.toFixed()" class="swiper_item"
								:class="list.length < 4 ? 'sItem' : ''">
								<view class="record-list-item">
									<view class="left">
										<view class="record-list-item-img">
											<image src="/static/default-avatar.png" class="record-list-item-img_img"
												mode="aspectFit">
											</image>
										</view>
										<view class="record-list-item-text">
											<view class="record-list-item-text-name">
												<text>{{ item.name }}</text>
											</view>
											<view class="record-list-item-text-con">
												<text>{{ item.con }}</text>
											</view>
										</view>
									</view>
									<view class="record-list-item-text-prizes">
										<text>{{ item.prizes }}</text>
									</view>
								</view>
							</swiper-item>
						</swiper>
					</view>
				</view>
			</view>
		</view>

		<!-- 抽奖反馈 -->
		<view class="popups" v-if="isShowPopups">
			<view class="popupsMain" :style="{ background: `url(${backgroundImage}) top left / 100% 100% no-repeat` }">
				<view class="text">
					{{ isWin != '0' ? rankType : $t('未中奖') }}
				</view>
				<view v-if="isWin != '0'" class="text">
					{{ $t('getGift2') }}
				</view>
				<image :src="image" mode="heightFix" class="img_box"></image>
				<view class="prizeName_box">
					<view v-if="isWin != '0'">{{ content }}</view>
					<view v-else class="prizeName_box_no">{{ content }}</view>
				</view>
				<view class="xImage" @click="isShowPopups = false">{{ $t('确定') }}</view>
			</view>
		</view>

		<!-- 抽奖记录按钮 -->
		<view class="enregistrer" @click="toPage('/pages/HomePage/tirageRecordPage')">
			{{ $t('记录') }}
		</view>

	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import shDrawCard2 from '@/components/sh-draw-card2/sh-draw-card.vue'

import {
	honorCustomDrawResultApi
} from "@/common/api/home.js";
import {
	honorPrizeApi,
	honorCountApi,
	honorApi
} from "@/common/api/gloryCards.js";
import {
	formatRichText
} from "@/utils/utils.js"
export default {
	components: {
		customnavbar,
		shDrawCard2
	},
	data() {
		return {
			desc: '', // 说明
			rankType: '',
			backgroundImage: '/static/gloryCards/prizeBgi1.png',
			costs: 0, // 多少积分抽一次奖
			count: 0, // 剩余抽奖次数
			points: 0, // 剩余积分
			prizesIndex: 0,
			prizes: [],
			topStyle2: '',
			topStyle: '',
			isWin: '0',
			content: '',
			image: '',
			isLoading: 'start',
			isShowPopups: false,
			list: [],
			lang: uni.getStorageSync('settings').defaultLanguage,
			pointWheel: 1,
			luckyWheel: 1,
			mallSwitch: 1,
			prizeType: '',
			money: ''
		}
	},
	onLoad() {
		this.mallSwitch = uni.getStorageSync('settings').mallSwitch
		this.pointWheel = uni.getStorageSync('settings').pointWheel
		this.luckyWheel = uni.getStorageSync('settings').luckyWheel
	},
	onShow() {
		if (this.pointWheel == 0 && this.luckyWheel == 0) {
			this.$showMessage('warning', this.$t('暂未开放'));
			this.$customizeBack()
			return
		}
		// 获取奖品
		this.getLuckyPrize()
		// 获取抽奖次数
		this.getLuckyCount()
		// 所有人获奖记录
		this.getLuckyRecord()
	},
	methods: {
		toPage(url) {
			uni.navigateTo({
				url
			})
		},
		start() {
			// 检查剩余抽奖次数
			if (!(this.isLoading != 'underway' && this.prizes.length)) {
				return
			}
			if (this.count < 1) {
				this.$showMessage('warning', `${this.$t('Lucky.times')}:${this.count}`);
				return
			}
			this.$refs.drawCardRef?.reset()
			this.$refs.drawCardRef?.start()
			this.isLoading = 'underway'
		},
		// 异步获取真实奖品
		async getRealPrize(params) {
			try {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				// 等待 API 结果
				let api = honorApi()
				const res = await api;
				if (res.data) {
					this.prizesIndex = this.prizes.findIndex(item => item.id == res.data.pid);
					this.isWin = res.data.isWin;
					this.backgroundImage = '/static/gloryCards/prizeBgi1.png'
					this.onDone(this.prizesIndex, res.data)
					this.isLoading = 'reset'
				}
				await this.getLuckyCount();
				return this.prizesIndex;
			} catch (error) {
				console.error('抽奖失败:', error);
				this.$showMessage('warning', error.msg);
				return;
			} finally {
				uni.hideLoading();
			}
		},
		// 抽奖完成反馈
		onDone(index, data) {
			if (index != -1) {
				const prize = this.prizes[index]
				this.content = prize.prizeName
				if (prize.prizeType == 'physical' && prize.money) {
					this.money = this.$t('价值') + ': ' + prize.money + ' ' + uni.getStorageSync('settings').currency
				}
				console.log(prize)
				this.backgroundImage = prize.backgroundImage || '/static/gloryCards/prizeBgi1.png'
				this.image = prize.image ? prize.image : ''
				this.prizeType = prize.prizeType
				this.rankType = prize.rankType
			} else {
				this.prizeType = ''
				this.content = data.prizeName || this.$t('下次再试试吧')
				this.image = data.image ? data.image : ''
			}
			setTimeout(() => {
				this.isShowPopups = true
				if (this.prizeType) {
					this.$music.play_winner()
				}
			}, 1000)
		},
		// 奖品
		getLuckyPrize() {
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			let api = honorPrizeApi()
			api.then((res) => {
				this.prizes = []
				this.prizes = res.data
				this.prizes.forEach(item => item.frontImg = item.winBackImage || '/static/gloryCards/frontImg.png')
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})
		},
		// 剩余抽奖次数
		getLuckyCount() {
			honorCountApi().then((res) => {
				if (res.data) {
					this.desc = res.data.desc ? formatRichText(res.data.desc) : ''
					this.count = res.data.times
					this.points = res.data.points
					this.costs = res.data.costs
				}
			})
		},
		mtop(e) {
			// #ifdef H5
			// this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e) + "rpx;height:" + `calc(100vh - ${e}rpx)`
			this.topStyle = "margin-top:-" + e + "rpx;"
			this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;"
			this.topStyle2 = `height:calc(100vh);`
			// #endif
		},
		// 获取中奖记录
		getLuckyRecord() {
			honorCustomDrawResultApi().then((res) => {
				let arr = res.data || []
				if (arr.length) {
					//  暂停使用
					// this.list = []
					this.list = res.data.map(item => ({
						img: item.img,
						name: item.username,
						con: item.type,
						prizes: item.resultDescribed
					}))
				}
			})
		},
	}
}
</script>

<style lang="scss" scoped>
.Big_bgi {
	background: url('/static/gloryCards/bgi.png') top left/100%;
}

::v-deep .front {
	height: 100% !important;
	background-color: transparent !important;
}

::v-deep .card-item .back {
	height: 100% !important;
}

* {
	box-sizing: border-box;
}

.enregistrer {
	position: fixed;
	right: -6rpx;
	top: 20%;
	padding: 18rpx 12rpx;
	// background: #2D81F5;
	background: #d97000;
	// box-shadow: 10rpx 0rpx 21rpx 0rpx #50B4D9;
	border-radius: 16rpx 0rpx 0rpx 16rpx;
	border: 1rpx solid #FFFFFF;
	font-family: DINPro, DINPro;
	font-weight: 400;
	font-size: 24rpx;
	color: #FFFFFF;
	// transform: rotate(90deg);
	writing-mode: vertical-rl;
}

.container {
	.lottery_top_bg {

		.wheel-section {
			.tabBox {
				display: flex;
				justify-content: center;
				margin-bottom: 40rpx;

				.tabs {
					display: flex;
					background: #FFE89A;
					border-radius: 50rpx 50rpx 50rpx 50rpx;
					padding: 15rpx;
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					color: #000000;
					text-align: center;
					font-style: normal;
					text-transform: none;

					.tabItem {
						display: flex;
						align-items: center;
						max-width: 280rpx;
						padding: 20rpx 35rpx;
						font-size: 24rpx;
						line-height: 26rpx;
						// white-space: nowrap;
						// overflow: hidden;
						// text-overflow: ellipsis;

						&.active {
							background: #FFC600;
							// box-shadow: 6rpx 0rpx 12rpx 0rpx #4F76E6;
							border-radius: 35rpx 35rpx 35rpx 35rpx;
							font-family: PingFangSC, PingFang SC;
							font-weight: 600;
							font-size: 24rpx;
							color: #000000;
							text-align: center;
							font-style: normal;
							text-transform: none;
						}
					}
				}
			}

			.titleImg {
				font-family: DingTalk JinBuTi;
				font-size: 48rpx;
				text-align: center;
				color: #D0AE84;
				text-shadow: 0px 8rpx 20rpx rgba(0, 0, 0, 0.3);
				margin-top: 120rpx;
				margin-bottom: 42rpx;
			}

			.dataBox {
				padding: 0 23rpx;

				.title {
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 32rpx;
					color: #333333;
					margin-bottom: 4rpx;
				}

				.row {
					display: flex;
					align-items: center;
					gap: 20rpx;

					.num {
						font-family: DINPro, DINPro;
						font-weight: 500;
						font-size: 55rpx;
						color: #000000;
						text-align: center;
						font-style: normal;
						text-transform: none;
					}

					.Mall {
						padding: 12rpx 15rpx;
						background: #FFD953;
						// box-shadow: 2rpx 0rpx 2rpx 0rpx #FFFFFF;
						color: #fff;
						font-family: PingFangSC, PingFang SC;
						font-weight: 400;
						font-size: 21rpx;
						color: #333333;
						border-radius: 26rpx;
					}
				}
			}


			.footBox {
				position: relative;
				width: 480rpx;
				height: 158rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				margin: 0 auto;
				z-index: 99;
				color: #D0AE84;
				text-shadow: 0px 8rpx 20rpx rgba(0, 0, 0, 0.3);
				transform: translateY(-46rpx);

				.btn_img {
					position: absolute;
					width: 480rpx;
					height: 158rpx;
				}

				.btn {
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 2025rpx;
					font-family: DingTalk JinBuTi;
					font-size: 36rpx;
					text-align: center;
					font-style: normal;
					text-transform: none;
					// margin-top: 36rpx;
					z-index: 2;
				}

				.times {
					font-family: MiSans;
					font-size: 28rpx;
					padding: 0 24rpx;
					z-index: 2;
				}
			}
		}

		.explain {
			margin: 0 32rpx;
			padding: 14rpx 32rpx;
			height: 500rpx;
			min-height: 500rpx;
			overflow-y: auto;
			border-radius: 30rpx;
			color: #fff;
			background: rgba(52, 31, 0, 0.4);
			border: 2rpx solid #e88e21;
		}

	}
}


.prizesItem {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	width: 230rpx;
	height: 272rpx;
	border-radius: 13rpx;
	overflow: hidden;
	padding-top: 66rpx;

	.prizeLogo {
		width: 69rpx;
		height: 21rpx;
		transform: translateX(-72%);
	}

	.prizeImg {
		height: 96rpx;
	}

	.prizeName {
		position: relative;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		// background-color: #fff;
		width: 100%;
		font-family: Alibaba-PuHuiTi, Alibaba-PuHuiTi;
		font-weight: normal;
		font-size: 25rpx;
		color: #FFD784;
		font-style: normal;
		text-transform: none;
		text-align: center;
		// white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-bottom: 54rpx;
		z-index: 6;
		max-width: 160rpx;
		line-height: 24rpx;
	}
}

.popups {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, .7);
	z-index: 9999;

	.xImage {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 374rpx;
		height: 60rpx;
		border-radius: 6rpx;
		background: #FF9900;
		font-family: DingTalk JinBuTi;
		font-size: 28rpx;
		color: #FFFFFF;
	}

	.popupsMain {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -60%);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 146rpx;
		width: 608rpx;
		height: 732rpx;
		background: url('/static/gloryCards/prizeBgi1.png') top left/100% 100% no-repeat;
		color: #fff;
		font-size: 34rpx;

		.prizeName_grade {
			font-family: DIN, DIN;
			font-weight: 800;
			font-size: 63rpx;
			color: #000000;
			text-align: center;
			text-transform: none;
			margin-bottom: 30rpx;
			font-style: italic;
		}

		.text {
			padding: 0 44rpx;
			word-break: break-all;
			font-family: DingTalk JinBuTi;
			font-size: 28rpx;
			color: #FF9900;
			text-align: center;
			font-style: italic;
			text-transform: none;
			// margin-bottom: 22rpx;
		}

		.img_box {
			height: 174rpx;
			margin: 30rpx 0;
		}

		.prizeName_box {
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			max-width: 390rpx;
			font-family: DingTalk JinBuTi;
			font-size: 28rpx;
			color: #FF9900;
			text-align: center;
			text-transform: none;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-bottom: 24rpx;

			.prizeName_box_no {
				font-family: DIN, DIN;
				font-weight: 800;
				font-size: 32rpx;
				color: #000000;
				line-height: 44rpx;
				text-align: center;
				font-style: italic;
				text-transform: none;
				margin-top: 44rpx;
			}
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
	margin: 32rpx;
	padding: 0 32rpx;
	background: rgba(52, 31, 0, 0.4);
	border-radius: 30rpx;
	border: 2rpx solid #E88E21;
}

.record-tab {
	display: flex;
	justify-content: space-around;
	margin-bottom: 50rpx;
}

.record-tab-item {
	color: #694907;
	padding: 20rpx 30rpx;
	border-radius: 10rpx;
	font-family: 'DINPro-Regular', sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #fff;
	text-align: center;
}

.record-list {
	margin-top: 50rpx;
	height: 500rpx;
}

.record-list-item {
	display: flex;
	margin-bottom: 50rpx;
	justify-content: space-between;
}

.left {
	display: flex;
}

.record-list-item-img {
	width: 80rpx;
	height: 80rpx;
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
	color: #fff;
	line-height: 30rpx;
	text-align: left;
	font-style: normal;
}

.record-list-item-text-con {
	font-family: 'DINPro-Regular', sans-serif;
	font-weight: 400;
	font-size: 20rpx;
	color: #fff;
	line-height: 28rpx;
	text-align: left;
	font-style: normal;
}

.record-list-item-text-prizes {
	font-family: 'DINPro-Bold', sans-serif;
	font-weight: bold;
	font-size: 32rpx;
	color: #fff;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
}
</style>