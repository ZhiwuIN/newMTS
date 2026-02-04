<template>
	<!-- :title="$t('pages.Luckyturntable')" -->
	<customnavbar backgroundStr="url('/static/lottery/bgi.png') top left/100%  no-repeat" @mtop="mtop"
		:whiteTitle="true">
		<view class="container">
			<view class="lottery_top_bg" :style="topStyle">
				<view class="wheel-section">
					<image v-if="lang == 'fr'" src="/static/lottery/title-fr.png" mode="" class="titleImg"></image>
					<image v-else src="/static/lottery/title-en.png" mode="" class="titleImg"></image>
					<view class="tabBox" v-if="pointWheel == 1 && luckyWheel == 1">
						<view class="tabs">
							<view class="tabItem" @click="onchangeActiveTab(0)" :class="{'active': activeTab == 0}">
								{{$t('积分卡牌')}}
							</view>
							<view class="tabItem" @click="onchangeActiveTab(1)" :class="{'active': activeTab == 1}">
								{{$t('幸运卡牌')}}
							</view>
						</view>
					</view>
					<!-- 我的积分 -->
					<view class="dataBox">
						<view class="title">{{$t('myBonusPoints')}}</view>
						<view class="row">
							<view class="num">{{points}}</view>
							<view class="Mall" @click="toPage('/pages/HomePage/pointsMall')" v-if="mallSwitch == 1">
								{{$t('pointsMall')}}
								&nbsp;▶
							</view>
						</view>
					</view>
					<view style="display: flex;justify-content: center;padding-top: 30rpx;">
						<!-- :row="Math.ceil(this.prizes.length / 3)" -->
						<sh-draw-card ref="drawCardRef" :list="prizes" :targetIndex="1" :gap="38"
							:row="Math.ceil(this.prizes.length / 3)" :col="3" :maxOpenCount="1" :endTurnAll="true"
							:shuffleAnimate="true" :shuffle="true" :shuffleTurnAll="true" :turnTime="0.3"
							:onOpenAsync="getRealPrize" :width="209" :height="330">
							<template #back="{data}">
								<view class="prizesItem"
									:style="{background: `url(${data.backgroundImage || '/static/lottery/backImg.png'}) top left / 100% 100% no-repeat`}">
									<image class="prizeLogo"
										:src="data.logoImage || 'https://upload.cwpc.cc/upload_1767641716569_2b895ca75b604daba280.png'"
										mode="">
									</image>
									<image class="prizeImg"
										:src="data.image ?  data.image : '/static/lottery/losing.png'" mode="">
									</image>
									<view class="prizeName">{{data.prizeName}}</view>
								</view>
							</template>
						</sh-draw-card>
					</view>
					<view class="footBox">
						<view @click="start" class="btn" style="width: 592rpx;"
							v-if="isLoading != 'underway' && prizes.length">
							{{$t('Startthelotterydraw')}}
						</view>
						<view class="times" v-if="isLoading != 'underway' && activeTab == 0">
							{{ costs }}{{$t('每次抽奖消耗积分')}}
						</view>
						<view class="times" v-if="isLoading != 'underway' && activeTab == 1">
							{{$t('Lucky.times')}}:{{ count }}
						</view>
					</view>
				</view>


				<!-- 展示 -->
				<view class="record" v-if="list.length">
					<view class="record-tab">
						<view class="record-tab-item">
							<view class="record-tab-item-text">
								<text>{{$t('获奖记录')}}</text>
							</view>
						</view>
					</view>
					<view class="record-list">
						<swiper circular :indicator-dots="false" :autoplay="true" :interval='1500' :duration="1500"
							easing-function="linear" :acceleration="true" :disable-touch="true" :vertical="true"
							class="swiper" :display-multiple-items="list.length>=4?4:list.length">
							<swiper-item v-for="(item, index) in list" :key="index.toFixed()" class="swiper_item"
								:class="list.length<4?'sItem':''">
								<view class="record-list-item">
									<view class="left">
										<view class="record-list-item-img">
											<image src="/static/default-avatar.png" class="record-list-item-img_img"
												mode="aspectFit"></image>
										</view>
										<view class="record-list-item-text">
											<view class="record-list-item-text-name">
												<text>{{item.name}}</text>
											</view>
											<view class="record-list-item-text-con">
												<text>{{item.con}}</text>
											</view>
										</view>
									</view>
									<view class="record-list-item-text-prizes">
										<text>{{item.prizes}}</text>
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
			<view class="popupsMain" :style="{background: `url(${backgroundImage}) top left / 100% 100% no-repeat`}">
				<!-- <image class="popupsImage" :src="image || '/static/lottery/losing.png'" mode=""
					:style="{'height': image ?  '320rpx' : '220rpx', 'margin-bottom': image ?  '62rpx' : '152rpx'}">
				</image> -->
				<view class="prizeName_grade" :data-text="isWin != '0' ? rankType : $t('未中奖')">
					{{isWin != '0' ? rankType : $t('未中奖')}}
				</view>
				<view v-if="isWin != '0' && prizeType != 'points' && prizeType != 'coin'" class="text">
					{{$t('getGift')}}
				</view>
				<view v-if="isWin != '0' && prizeType == 'points'" class="text">
					{{$t('convenience')}}
				</view>
				<view v-if="isWin != '0' && prizeType == 'coin'" class="text">
					{{$t('convenience')}}
				</view>
				<view class="prizeName_img_box">
					<view class="prizeName_box">
						<image v-if="prizeType == 'coin'" style="width: 68rpx;min-width: 68rpx;height: 60rpx;"
							src="/static/lottery/money.png" mode=""></image>
						<view>{{content}}</view>
					</view>
				</view>
				<!-- 礼花 -->
				<image v-if="this.prizeType" class="Fireworks Fireworks_left" src="/static/lottery/Fireworks.gif"
					mode="widthFix"></image>
				<image v-if="this.prizeType" class="Fireworks Fireworks_right" src="/static/lottery/Fireworks.gif"
					mode="widthFix"></image>
				<!-- 关闭按钮 -->
				<image class="xImage" src="/static/lottery/x.png" mode="" @click="isShowPopups = false"></image>
			</view>
		</view>

		<!-- 抽奖记录按钮 -->
		<view class="enregistrer" @click="toPage('/pages/HomePage/tirageRecordPage')">
			{{$t('记录')}}
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		pointPrizeApi,
		luckyPrizeApi,
		luckyCountApi,
		pointApi,
		luckyApi,
		// luckyRecordApi,
		luckyCustomDrawResultApi
	} from "@/common/api/home.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				rankType: '',
				backgroundImage: '/static/lottery/prizeBgi.png',
				costs: 0, // 多少积分抽一次奖
				count: 0, // 剩余抽奖次数
				activeTab: 0,
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
			}
		},
		watch: {
			activeTab: {
				async handler(newValue) {
					await this.getLuckyPrize()
					this.$refs.drawCardRef?.reset()
				}
			}
		},
		onLoad() {
			this.mallSwitch = uni.getStorageSync('settings').mallSwitch
			this.pointWheel = uni.getStorageSync('settings').pointWheel
			this.luckyWheel = uni.getStorageSync('settings').luckyWheel
			if (this.pointWheel == 0 || this.luckyWheel == 0) {
				this.activeTab = this.pointWheel == 0 ? 1 : 0
			}
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
			onchangeActiveTab(tab) {
				if (this.isLoading == 'underway') return
				this.activeTab = tab
			},
			toPage(url) {
				uni.navigateTo({
					url
				})
			},
			start() {
				// 检查剩余抽奖次数
				if (this.points < this.costs && this.activeTab == 0) {
					this.$showMessage('warning', `${this.$t('积分不足')}:${this.points}`);
					return;
				} else if (this.count < 1 && this.activeTab == 1) {
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
					let api = this.activeTab == 1 ? luckyApi() : pointApi()
					const res = await api;
					if (res.data) {
						this.prizesIndex = this.prizes.findIndex(item => item.id == res.data.pid);
						this.isWin = res.data.isWin;
						this.backgroundImage = '/static/lottery/prizeBgi.png'
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
					console.log(prize)
					this.backgroundImage = prize.winBackImage || '/static/lottery/prizeBgi.png'
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
				let api = this.activeTab == 1 ? luckyPrizeApi() : pointPrizeApi()
				api.then((res) => {
					this.prizes = []
					this.prizes = res.data
					this.prizes.forEach(item => item.frontImg = '/static/lottery/frontImg3.png')
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})
			},
			// 剩余抽奖次数
			getLuckyCount() {
				luckyCountApi().then((res) => {
					if (res.data) {
						this.count = res.data.times
						this.points = res.data.points
						this.costs = res.data.costs
					}
				})
			},
			mtop(e) {
				// #ifdef H5
				// this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e) + "rpx;height:" + `calc(100vh - ${e}rpx)`
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e) + "rpx"
				this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + e + "rpx"
				this.topStyle2 = `height:calc(100vh);`
				// #endif
			},
			// 获取中奖记录
			getLuckyRecord() {
				luckyCustomDrawResultApi().then((res) => {
					let arr = res.data || []
					if (arr.length) {
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
	* {
		box-sizing: border-box;
	}

	.enregistrer {
		position: fixed;
		right: -6rpx;
		top: 20%;
		padding: 18rpx 12rpx;
		// background: #2D81F5;
		background: #1167D1;
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
			background: url('/static/lottery/bgi.png') top left/100% 100% no-repeat;

			.wheel-section {
				.tabBox {
					display: flex;
					justify-content: center;
					margin-bottom: 40rpx;

					.tabs {
						display: flex;
						background-color: #9ed4ff;
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
								background: #1167D1;
								// box-shadow: 6rpx 0rpx 12rpx 0rpx #4F76E6;
								border-radius: 35rpx 35rpx 35rpx 35rpx;
								font-family: PingFangSC, PingFang SC;
								font-weight: 600;
								font-size: 24rpx;
								color: #fff;
								text-align: center;
								font-style: normal;
								text-transform: none;
							}
						}
					}
				}

				.titleImg {
					width: 100%;
					height: 266rpx;
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
							background: #1167D1;
							// box-shadow: 2rpx 0rpx 2rpx 0rpx #FFFFFF;
							color: #fff;
							font-family: PingFangSC, PingFang SC;
							font-weight: 400;
							font-size: 21rpx;
							border-radius: 26rpx;
						}
					}
				}


				.footBox {
					display: flex;
					flex-direction: column;
					align-items: center;

					.btn {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 442rpx;
						height: 100rpx;
						margin-top: -20rpx;
						background: #1167D1;
						border: 4rpx solid #fff;
						border-radius: 2025rpx;
						font-family: DIN, DIN;
						font-weight: 800;
						font-size: 34rpx;
						color: #FFFFFF;
						text-align: center;
						font-style: normal;
						text-transform: none;
					}

					.times {
						margin-top: 12rpx;
						font-size: 32rpx;
						color: #fff;
						padding: 0 24rpx;
						padding-bottom: 50rpx;
					}
				}
			}
		}
	}


	.prizesItem {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		// gap: 42rpx;
		width: 209rpx;
		height: 288rpx;
		background: url('/static/lottery/backImg.png') top left/100% 100% no-repeat;
		border-radius: 13rpx;
		overflow: hidden;
		padding-top: 18rpx;

		.prizeLogo {
			width: 69rpx;
			height: 56rpx;
			transform: translateX(-72%);
		}

		.prizeImg {
			width: 102rpx;
			height: 103rpx;
			transform: translateY(-12rpx);
		}

		.prizeName {
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #fff;
			width: 100%;
			height: 71rpx;
			font-family: Alibaba-PuHuiTi, Alibaba-PuHuiTi;
			font-weight: normal;
			font-size: 25rpx;
			color: #000000;
			font-style: normal;
			text-transform: none;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			padding-bottom: 4rpx;
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
			position: fixed;
			bottom: -16%;
			left: 50%;
			transform: translate(-50%, 0%);
			width: 58rpx;
			height: 58rpx;
		}

		.popupsMain {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -60%);
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 204rpx;
			width: 620rpx;
			height: 984rpx;
			background: url('/static/lottery/prizeBgi.png') top left/100% 100% no-repeat;
			color: #fff;
			font-size: 34rpx;

			// 礼花
			.Fireworks {
				position: absolute;
				bottom: 12rpx;
				width: 360rpx;

				&.Fireworks_left {
					left: 12rpx;
				}

				&.Fireworks_right {
					right: 12rpx;
					transform: scaleX(-1)
				}
			}

			.prizeName_grade {
				position: relative;
				font-family: DIN, DIN;
				font-weight: 900;
				font-size: 74rpx;
				text-align: center;
				margin-bottom: 30rpx;
				transform: skewX(-6deg);
				transform-origin: left center;
			}

			/* 底层：外描边 + 阴影 */
			.prizeName_grade::before {
				content: attr(data-text);
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				transform: skewX(-6deg);
				transform-origin: left center;
				/* 外描边：黑色，宽度2rpx */
				-webkit-text-stroke: 8rpx #000;
				text-stroke: 8rpx #000;
				color: transparent;
				/* 阴影效果 */
				text-shadow: 5rpx 7rpx 0px #307cfe;
				z-index: 0;
			}

			/* 上层：渐变文字 */
			.prizeName_grade::after {
				content: attr(data-text);
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				transform: skewX(-6deg);
				transform-origin: left center;
				background: linear-gradient(to bottom, #fff, #fdf6e6, #307cfe, #b3dfff);
				-webkit-background-clip: text;
				background-clip: text;
				color: transparent;
				/* 可选：给渐变层加极细描边，增强层次 */
				/* -webkit-text-stroke: 0.5rpx #ffbf5a; */
				z-index: 1;
			}

			.text {
				padding: 0 34rpx;
				word-break: break-all;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 33rpx;
				color: #fff;
				text-align: center;
				font-style: normal;
				text-transform: none;
				// margin-bottom: 84rpx;

			}

			.prizeName_img_box {
				position: relative;
				top: 54rpx;
				// #ifdef APP-PLUS
				top: 74rpx;
				// #endif
				width: 562rpx;
				height: 140rpx;
				// background: url('/static/lottery/1.png') top left/100% no-repeat;
				padding-top: 12rpx;
				// #ifdef APP-PLUS
				padding-top: 16rpx;
				// #endif
			}

			.prizeName_box {
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				min-width: 407rpx;
				padding: 29rpx 40rpx;
				// background: #000000;
				border-radius: 2025rpx;
				font-family: Alibaba-PuHuiTi, Alibaba-PuHuiTi;
				font-weight: 700;
				font-size: 50rpx;
				color: #FFFFFF;
				line-height: 47.5rpx;
				text-align: center;
				text-transform: none;
				gap: 40rpx;
				transform: skewX(-12deg);
				transform-origin: left center;
				text-shadow: 0px 5rpx 0px #307cfe;

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
		// background: #fff;
		// border-top-right-radius: 50rpx;
		// border-top-left-radius: 50rpx;
		padding: 0 50rpx;
		// padding-bottom: 0;
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
		font-size: 24rpx;
		color: #000000;
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
		color: #0962ff;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}
</style>