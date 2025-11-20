<template>
	<view>
		<customnavbar :title="$t('mine.PositionManagement')"
			backgroundStr="url('/static/login/login_bg.png') top left/100%  no-repeat" @mtop="mtop" :showBack="true"
			:whiteTitle="true" :isPositionManage="true">
			<view class="positionManage_heradBox" :style="topStyle">
				<view class="positionManage-container">
					<view v-if="info?.uid">
						<view class="positionManage_info">
							<image :src="info?.image" mode="" class="positionManage-image"></image>
							<view class="positionManage-name">{{ info?.positionName }}</view>
							<view class="info-row">
								<view class="row-item">
									<view class="positionManage-info-title">{{ $t('mine.ElectronicContract') }}</view>
									<view class="positionManage-info-value" style="color: #1167D1 ;" @click="toPush()">
										{{ $t('点击查看') }}
									</view>
								</view>
								<view class="row-item">
									<view class="positionManage-info-title">{{ $t('发薪方式') }}</view>
									<view class="positionManage-info-value">
										{{ info?.payType }}
									</view>
								</view>
								<view class="row-item">
									<view class="positionManage-info-title">{{ $t('positionManage.PositionSalary') }}
									</view>
									<view class="positionManage-info-value">{{ (+info.salary || 0).toFixed(4) }}</view>
								</view>
								<view class="row-item">
									<view class="positionManage-info-title">{{ $t('positionManage.CumulativeSalary') }}
									</view>
									<view class="positionManage-info-value">{{ (+info.totalSalary || 0).toFixed(4) }}
									</view>
								</view>
								<view class="row-item" v-if="info?.latestId">
									<view class="positionManage-info-title">{{ $t('考核日') }}
									</view>
									<view class="positionManage-info-value">{{ weekList[info?.assessmentDay] }}
									</view>
								</view>
								<view class="row-item row-item1" v-if="info?.latestId">
									<view class="title">{{ $t('考核要求') }}</view>
									<view class="condition_box" v-if="info?.complianceType == 'aLevel'">
										<view class="tag_box">
											<image class="icon" src="/static/positions/subordinate.png" mode=""></image>
											<view>{{ $t('A级下属人数') }}: {{ infoData?.target || 0 }}</view>
										</view>
										<view class="progress_box">
											<t-progress :color="'#8ada9b'" style="width: 506rpx;" :label="false"
												:percentage="infoData.completed / infoData.target * 100" />
											<view>
												<text class="themeColor">{{ infoData?.completed ||
													0 }}</text>/{{ infoData?.target || 0 }}
											</view>
										</view>
									</view>
									<view class="condition_box" v-else="infoData?.complianceType == 'team'">
										<view class="tag_box">
											<image class="icon" src="/static/positions/team.png" mode=""></image>
											<view>{{ $t('团队人数') }}: {{ infoData?.target }}</view>
										</view>
										<view class="progress_box">
											<t-progress :color="'#ffb139'" style="width: 506rpx;" :label="false"
												:percentage="infoData?.completed / infoData?.target * 100" />
											<view>
												<text class="themeColor">{{ infoData?.completed }}</text>/{{
													infoData?.target
												|| 0}}
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
						<view class="table">
							<t-config-provider :global-config="globalConfig">
								<t-table row-key="index" :data="data" :columns="columns" :custom-class="'custom-table'">
								</t-table>
							</t-config-provider>
						</view>
					</view>

					<view v-else>
						<!-- 审核中 -->
						<view class="positionManage_info" v-if="audit">
							<image src="/static/mine/applicationRecord/audit.png" mode="" class="positionManage-image">
							</image>
							<view class="positionManage-name">{{ $t('positionManage.audit') }}</view>
							<view class="positionManage-text">{{ $t('您的职位申请正在审核中') }}</view>
						</view>
						<!-- 没有职位 -->
						<view class="positionManage_info" v-else>
							<image src="/static/mine/applicationRecord/nullPositionManage.png" mode=""
								class="positionManage-image"></image>
							<view class="positionManage-name">{{ $t('positionManage.NoPosition') }}</view>
							<view class="positionManage-text">{{ $t('positionManage.Apply') }}</view>
						</view>
						<!-- 审核中不显示 -->
						<view class="btn" @click="toPositionList" v-if="!audit">
							{{ $t('positionManage.MorePositions') }}
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
	positionMyPositionApi,
	positionEffectivePositionApi,
	positionMyPositionInfoApi
} from '@/common/api/position.js'
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			audit: false,
			weekList: {
				1: 'Monday',
				2: 'Tuesday',
				3: 'Wednesday',
				4: 'Thursday',
				5: 'Friday',
				6: 'Saturday',
				7: 'Sunday'
			},
			info: {},
			topStyle: '',
			globalConfig: {
				table: {
					empty: this.$t('noData'),
				}
			},
			columns: [{
				colKey: 'positionName',
				title: '',
				width: 130
			},
			{
				colKey: 'salary',
				title: '',
				align: 'center',
				width: 75
			},
			{
				colKey: 'payday',
				title: '',
				align: 'center',
				width: 110
			},
			],
			data: [],
			infoData: {},
			time: '',
			countdownInterval: null
		}
	},
	methods: {
		toPush() {
			uni.setStorageSync('privacyPolicyInfo', this.info.contract)
			uni.navigateTo({
				url: '/pages/MinePage/ElectronicContract?positionName=' + this.info.positionName
			})
		},
		mtop(e) {
			this.topStyle = "margin-top:-" + e + "rpx;height:" + (e + 396) +
				"rpx;background: url('/static/login/login_bg.png') top left/100% no-repeat;"
		},
		getMyPosition() {
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			positionMyPositionApi().then(res => {
				if (res.code == 200) {
					this.info = res.data
					this.data = res.data.payrollRecords || []
					if (this.info.latestId) {
						positionMyPositionInfoApi(this.info.latestId).then(res => {
							if (res.code == 200) {
								this.infoData = res.data
								this.countdownInterval = setInterval(this.updateCountdown, 1000)
								this.updateCountdown()
							} else {
								this.$showMessage('error', res.msg || 'error')
							}
						}).catch(err => {
							console.error(err);
						}).finally(() => {
							uni.hideLoading();
						})
					} else {
						uni.hideLoading();
					}
				} else {
					this.$showMessage('error', res.msg || 'error')
				}
			}).catch(err => {
				if (err.msg == 'Your job posting is currently under review.') {
					this.audit = true
				}
				console.error(err);
			})
		},
		updateCountdown() {
			const isoStr = this.infoData.maturityTime.replace(" ", "T");
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
		},
		getPositionEffectivePositionApi() {
			positionEffectivePositionApi().then(res => {
				if (res.code == 200) {
					this.data = res.rows || []

				} else {
					this.$showMessage('error', res.msg || 'error')
				}
			}).catch(err => {
				console.error(err);
			});
		},
		toPositionList() {
			uni.navigateTo({
				url: '/pages/HomePage/postManage'
			})
		}
	},
	onShow() {
		this.columns[0].title = this.$t('positionManage.Position')
		this.columns[1].title = this.$t('positionManage.Salary')
		this.columns[2].title = this.$t('positionManage.Date')
		this.getMyPosition()
		// this.getPositionEffectivePositionApi()
	},
	onUnload() {
		// 页面隐藏时清除定时器
		if (this.countdownInterval) {
			clearInterval(this.countdownInterval);
			this.countdownInterval = null;
		}
	},
	onHide() {
		if (this.countdownInterval) {
			clearInterval(this.countdownInterval);
			this.countdownInterval = null;
		}
	}
}
</script>

<style scoped lang="scss">
.row-item1 {
	display: flex;
	flex-direction: column;
	background: #F5F8FF;
	border-radius: 10rpx;
	// padding: 20rpx 30rpx;

	.title {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 24rpx;
		color: #333333;
		line-height: 34rpx;
		text-align: left;
		font-style: normal;
	}

	.condition_box {
		margin-top: 22rpx;

		.tag_box {
			display: flex;
			align-items: center;
			gap: 10rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 24rpx;
			color: #666666;
			line-height: 34rpx;
			text-align: left;
			font-style: normal;
			margin-bottom: 20rpx;

			.icon {
				width: 32rpx;
				height: 32rpx;
				border-radius: 4rpx;
			}
		}

		.progress_box {
			display: flex;
			align-items: center;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 24rpx;
			color: #666666;
			text-align: left;
			font-style: normal;

			.themeColor {
				margin-left: 30rpx;
				color: #5385FA;
			}
		}
	}

}

// ::v-deep .t-progress__inner {
// 	background: $themeColor;
// }

.themeColor {
	color: $themeColor !important;
}

.positionManage-container {
	padding: 0 50rpx 50rpx;
	transform: translateY(250rpx);

	.btn {
		padding: 20rpx 0 26rpx;
		display: flex;
		justify-content: center;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 600;
		font-size: 36rpx;
		color: #FFFFFF;
		text-align: left;
		font-style: normal;
		text-transform: none;
	}
}

.positionManage_info {
	display: flex;
	flex-direction: column;
	align-items: center;
	background: #FFFFFF;
	box-shadow: 0rpx 14rpx 22rpx 0rpx rgba(198, 198, 198, 0.5);
	border-radius: 32rpx;
	// padding: 30rpx 40rpx 40rpx;
	margin-bottom: 40rpx;
	overflow: hidden;

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

	.positionManage-text {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 28rpx;
		color: #909399;
		text-align: left;
		font-style: normal;
		transform: translateY(-34rpx);
		margin-bottom: 56rpx;
	}

	.info-row {
		display: flex;
		flex-direction: column;
		width: 100%;
		// gap: 40rpx;

		.row-item {
			display: flex;
			justify-content: space-between;
			padding: 30rpx;

			&:nth-child(2n) {
				background: #F5F8FF;
			}

			.positionManage-info-title {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: #000000;
				text-align: left;
				font-style: normal;
			}

			.positionManage-info-value {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: #000000;
				line-height: 34rpx;
				font-style: normal;
				text-align: right;
			}
		}
	}

}

::v-deep .t-table th::after,
::v-deep .t-table td::after {
	height: 0px;
}

::v-deep .t-table th {
	font-family: PingFangSC, PingFang SC;
	font-weight: 400;
	font-size: 24rpx;
	color: #1C2D57;
	font-style: normal;

	&:nth-child(2) {
		text-align: center;
	}
}

.table {
	background: #FFFFFF;
	// box-shadow: 0rpx 14rpx 22rpx 0rpx rgba(198, 198, 198, 0.5);
	border-radius: 32rpx;
	overflow: hidden;
	padding: 24rpx 8rpx;
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
</style>