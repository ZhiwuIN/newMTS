<template>
	<!-- :title="$t('pages.Luckyturntable')" -->
	<customnavbar backgroundStr="url('/static/lottery/bgi.png') top left/100%  no-repeat" @mtop="mtop"
		:whiteTitle="true">
		<view class="container">
			<view class="lottery_top_bg" :style="topStyle">
				<view class="wheel-section">
					<image v-if="lang == 'fr'" src="/static/lottery/title-fr.png" mode="" class="titleImg"></image>
					<image v-if="lang == 'en'" src="/static/lottery/title-en.png" mode="" class="titleImg"></image>
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
								<view class="prizesItem" v-if="data.prizeName">
									<image class="prizeImg"
										:src="data.image ?  data.image : '/static/lottery/losing.png'" mode="">
									</image>
									<view class="prizeName">{{data.prizeName}}</view>
								</view>
							</template>
						</sh-draw-card>
					</view>
					<view class="footBox">
						<image src="/static/lottery/btn-fr.png" mode="" @click="start" class="btn"
							style="width: 592rpx;" v-if="isLoading != 'underway' && lang == 'fr'"></image>
						<image src="/static/lottery/btn-en.png" mode="" @click="start" class="btn"
							style="width: 542rpx;" v-if="isLoading != 'underway' && lang == 'en'"></image>
						<!--  && lang == 'fr' -->
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
											<image :src="item.img" mode="aspectFit" v-if="item.img"></image>
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
			<view class="popupsMain">
				<image class="popupsImage" :src="image || '/static/lottery/losing.png'" mode=""
					:style="{'height': image ?  '320rpx' : '220rpx', 'margin-bottom': image ?  '62rpx' : '152rpx'}">
				</image>
				<view style="margin-bottom: 58rpx;">{{content}}</view>
				<view v-if="isWin != '0' && prizeType != 'points' && prizeType != 'coin'" style="padding: 0 34rpx;">
					{{$t('getGift')}}
				</view>
				<view v-if="isWin != '0' && prizeType == 'points'" style="padding: 0 34rpx;">{{$t('convenience')}}
				</view>
				<view v-if="isWin != '0' && prizeType == 'coin'" style="padding: 0 34rpx;">{{$t('convenience')}}</view>
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
				url: 'http://13.245.95.135:8888',
				// url: 'http://192.168.2.35:8080',
				costs: 0, // 多少积分抽一次奖
				count: 0, // 剩余抽奖次数
				activeTab: 0,
				points: 0, // 剩余积分
				prizesIndex: 0,
				prizes: [],
				topStyle: 0,
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
				prizeType: ''
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
					this.image = prize.image ? prize.image : ''
					console.log(prize)
					this.prizeType = prize.prizeType
				} else {
					this.content = data.prizeName || this.$t('下次再试试吧')
					this.image = data.image ? data.image : ''
				}
				setTimeout(() => {
					// console.log(this.image)
					this.isShowPopups = true
				}, 1000)
			},
			// 奖品
			getLuckyPrize() {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				let api = this.activeTab == 1 ? luckyPrizeApi() : pointPrizeApi()
				api.then((res) => {
					this.prizes = res.data
					this.prizes.forEach(item => item.frontImg = '/static/lottery/frontImg.png')
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
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + e + "rpx"
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
			// min-height: 100vh;
			// padding-bottom: 28rpx;

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
						font-size: 30rpx;
						color: #000;
						text-align: center;
						font-style: normal;
						text-transform: none;

						.tabItem {
							display: flex;
							align-items: center;
							max-width: 280rpx;
							padding: 20rpx 35rpx;
							font-size: 26rpx;
							line-height: 26rpx;
							// white-space: nowrap;
							// overflow: hidden;
							// text-overflow: ellipsis;

							&.active {
								background: linear-gradient(to right, #00AAF6 0%, #063497 99%);
								box-shadow: 6rpx 0rpx 12rpx 0rpx #4F76E6;
								border-radius: 35rpx 35rpx 35rpx 35rpx;
								font-weight: 600;
								color: #fff;
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
							background-color: #f9e162;
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
					display: flex;
					flex-direction: column;
					align-items: center;

					.btn {
						width: 442rpx;
						height: 135rpx;
						margin-top: -20rpx;
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
		justify-content: end;
		gap: 42rpx;
		width: 209rpx;
		height: 288rpx;
		background: url('/static/lottery/prizeBgi.png') top left/100% 100% no-repeat;
		color: #fff;
		font-size: 34rpx;
		padding-bottom: 40rpx;

		.prizeImg {
			width: 110rpx;
			height: 110rpx;
		}

		.prizeName {
			width: 190rpx;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
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
			padding-top: 160rpx;
			width: 620rpx;
			height: 858rpx;
			background: url('/static/lottery/prizeBgi.png') top left/100% 100% no-repeat;
			color: #fff;
			font-size: 34rpx;

			.popupsImage {
				width: 320rpx;
				height: 220rpx;
				margin-bottom: 152rpx;
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