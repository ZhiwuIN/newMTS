<template>
	<view>
		<customnavbar :title="$t('mine.PositionManagement')"
			backgroundStr="url('/static/login/login_bg.png') top left/100%  no-repeat" @mtop="mtop" :showBack="true"
			:whiteTitle="true">
			<view class="positionManage_heradBox" :style="topStyle">
				<view class="positionManage-container">
					<view class="positionManage_info">
						<image :src=" info.image" mode="" class="positionManage-image"></image>
						<view class="positionManage-name">{{info.positionName}}</view>
						<view class="info-row">
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.Payday')}}</view>
								<view class="positionManage-info-value">
									{{info.payday ? $t('positionManage.EveryMonthOnThe') + ' ' + info.payday + $t('positionManage.Th') : '-'}}
								</view>
							</view>
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.PositionSalary')}}
								</view>
								<view class="positionManage-info-value">{{(+info.salary || 0).toFixed(4)}}</view>
							</view>
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.CumulativeSalary')}}
								</view>
								<view class="positionManage-info-value">{{(+info.totalSalary || 0).toFixed(4)}}</view>
							</view>
						</view>
					</view>
					<view class="positionManage_info positionManage_info2">
						<view class="info-row">
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.Status')}}</view>
								<view class="positionManage-info-value" v-if="info.status == 6">
									{{$t('positionManage.Agreed')}}
								</view>
								<view class="positionManage-info-value" v-if="info.status == 3">
									{{$t('positionManage.Failed')}}
								</view>
								<view class="positionManage-info-value" v-if="info.status == 2">
									{{$t('positionManage.underReview')}}
								</view>
								<view class="positionManage-info-value" v-if="info.status == 5">
									{{$t('positionManage.notReach')}}
								</view>
								<view class="positionManage-info-value" v-if="info.status == 4">
									{{$t('positionManage.InProgress')}}
								</view>
							</view>
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.JobRequirements')}}</view>
								<view class="positionManage-info-value">
									{{$t('JobRequirementsA') + info.target + $t('JobRequirementsB') + info.cycle + $t('JobRequirementsC')}}
								</view>
							</view>
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.WorkProgress')}}</view>
								<view class="progressBox">
									<t-progress style="width: 360rpx;" :label="false"
										:percentage="info.completed / info.target * 100" />
									<view>
										<text class="themeColor">{{info.completed}}</text>/{{info.target}}
									</view>
								</view>
							</view>
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.ApprovalTime')}}</view>
								<view class="positionManage-info-value">{{info.approveTime || '-'}}</view>
							</view>
							<view class="row-item">
								<view class="positionManage-info-title">{{$t('positionManage.RemainingTime')}}</view>
								<view class="positionManage-info-value" style="color: #FF3333;">{{time}}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</customnavbar>
	</view>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		positionMyPositionInfoApi
	} from '@/common/api/position.js'
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				url: 'http://13.245.95.135:8888',
				// url: 'http://192.168.2.35:8080',
				topStyle: 0,
				id: '',
				info: {},
				time: '',
				countdownInterval: null

			}
		},
		methods: {
			getMyPositionInfo() {
				positionMyPositionInfoApi(this.id).then(res => {
					if (res.code == 200) {
						this.info = res.data
						if(this.info.maturityTime) {
							this.countdownInterval = setInterval(this.updateCountdown, 1000)
							this.updateCountdown()
						}else {
							this.time = '-'
						}
						
					} else {
						this.$showMessage('error', res.msg || 'error')
					}
				}).catch(err => {
					console.error(err);
				});
			},
			mtop(e) {
				this.topStyle = "margin-top:-" + e + "rpx;height:" + (e + 396) +
					"rpx;background: url('/static/login/login_bg.png') top left/100% no-repeat;"
			},
			updateCountdown() {
				const isoStr = this.info.maturityTime.replace(" ", "T");
				const targetTime = new Date(isoStr);
				const now = new Date();
				const diff = targetTime - now;

				if (diff <= 0) {
					this.time = '0' + this.$t('day') + '0' + this.$t('hour') + '0' + this.$t('min') + '0' + this.$t(
						'second');
					return;
				}

				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((diff % (1000 * 60)) / 1000);
				this.time = days + this.$t('day') + hours + this.$t('hour') + minutes + this.$t('min') + seconds + this.$t(
					'second');
			}
		},
		onLoad(options) {
			this.id = options.id
		},
		onShow() {
			this.getMyPositionInfo()
		},
		onUnload() {
			// console.log('页面隐藏清除定时器');
			// 页面隐藏时清除定时器
			if (this.countdownInterval) {
				clearInterval(this.countdownInterval);
			}
		},
	}
</script>

<style scoped lang="scss">
	::v-deep .t-progress__inner {
		background: $themeColor;
	}

	.themeColor {
		color: $themeColor !important;
	}

	.progressBox {
		display: flex;
		align-items: center;
		gap: 22rpx;

		::v-deep .t-progress__bar {
			height: 12rpx;
			transform: translateY(1rpx);
		}
	}

	.positionManage-container {
		padding: 0 50rpx 50rpx;
		transform: translateY(250rpx);
	}

	.positionManage_info {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #FFFFFF;
		box-shadow: 0rpx 14rpx 22rpx 0rpx rgba(198, 198, 198, 0.5);
		border-radius: 32rpx;
		padding: 30rpx 40rpx 40rpx;
		margin-bottom: 40rpx;

		.positionManage-image {
			width: 180rpx;
			height: 180rpx;
			margin-bottom: 10rpx;
		}

		.positionManage-name {
			font-family: DINPro, DINPro;
			font-weight: bold;
			font-size: 36rpx;
			color: #000000;
			text-align: left;
			font-style: normal;
			margin-bottom: 50rpx;
		}

		.info-row {
			display: flex;
			flex-direction: column;
			width: 100%;
			gap: 40rpx;

			.row-item {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.positionManage-info-title {
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					color: #000000;
					text-align: center;
					font-style: normal;
				}

				.positionManage-info-value {
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					color: #000000;
					line-height: 34rpx;
					text-align: center;
					font-style: normal;
					text-align: right;
				}
			}
		}

		&.positionManage_info2 {
			padding: 40rpx;

			.info-row .row-item {
				.positionManage-info-title {
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					color: #1C2D57;
					text-align: left;
					font-style: normal;
				}

				.positionManage-info-value {
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					color: #1C2D57;
					font-style: normal;
				}
			}
		}
	}
</style>