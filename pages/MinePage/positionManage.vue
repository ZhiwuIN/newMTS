<template>
	<view>
		<customnavbar :title="$t('mine.PositionManagement')"
			backgroundStr="url('/static/login/login_bg.png') top left/100%  no-repeat" @mtop="mtop" :showBack="true"
			:whiteTitle="true" :isPositionManage="true">
			<uv-skeletons :loading="isLoading" :skeleton="skeleton" :style="isLoading ? 'margin: 0 40rpx;' : ''">
				<view class="positionManage_heradBox" :style="topStyle">
					<view class="positionManage-container">
						<view v-if="info?.uid">
							<view class="positionManage_info">
								<image :src="info.image" mode="" class="positionManage-image"></image>
								<view class="positionManage-name">{{ info.positionName }}</view>
								<view class="info-row">
									<view class="row-item">
										<view class="positionManage-info-title">{{ $t('mine.ElectronicContract') }}
										</view>
										<view class="positionManage-info-value" style="color: #1167D1 ;"
											@click="toPush()">
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
										<view class="positionManage-info-title">{{ $t('positionManage.Payday') }}</view>
										<view class="positionManage-info-value" v-if="info.payType == 'daily'">
											{{ $t("每天下午五点") }}
										</view>
										<view class="positionManage-info-value" v-else>
											Five o 'clock on {{ weekDay[infoData.payday - 1] ?? '-' }} afternoon
										</view>
									</view>
									<view class="row-item">
										<view class="positionManage-info-title">
											{{ $t('positionManage.PositionSalary') }}
										</view>
										<view class="positionManage-info-value">{{ (+info.salary || 0).toFixed(4) }}
										</view>
									</view>
									<view class="row-item">
										<view class="positionManage-info-title">
											{{ $t('positionManage.CumulativeSalary') }}
										</view>
										<view class="positionManage-info-value">
											{{ (+info.totalSalary || 0).toFixed(4) }}
										</view>
									</view>
									<view class="row-item" v-if="info.assessmentRequirements">
										<text style="font-size: 18rpx;">{{ info.assessmentRequirements }}</text>
									</view>
								</view>
							</view>

							<view class="positionManage_info positionManage_info2" v-if="infoData?.status">
								<view class="info-row">
									<view class="row-item">
										<view class="positionManage-info-title">{{ $t('positionManage.Status') }}</view>
										<view class="positionManage-info-value" v-if="infoData.status == 6">
											{{ $t('positionManage.Agreed') }}
										</view>
										<view class="positionManage-info-value" v-if="infoData.status == 3">
											{{ $t('positionManage.Failed') }}
										</view>
										<view class="positionManage-info-value" v-if="infoData.status == 2">
											{{ $t('positionManage.underReview') }}
										</view>
										<view class="positionManage-info-value" v-if="infoData.status == 5">
											{{ $t('positionManage.notReach') }}
										</view>
										<view class="positionManage-info-value" v-if="infoData.status == 4">
											{{ $t('positionManage.InProgress') }}
										</view>
									</view>
									<view class="row-item">
										<view class="positionManage-info-title">
											{{ $t('positionManage.JobRequirements') }}
										</view>
										<view class="positionManage-info-value" style="font-size: 20rpx;">
											{{infoData?.jobRequirements}}
										</view>
									</view>
									<view class="row-item">
										<view class="positionManage-info-title">
											Assessment Requirement
										</view>
										<view class="positionManage-info-value" style="font-size: 20rpx;">
											{{ $t('JobRequirementsA') }} {{ infoData.target }} {{ infoData.applicationType
											== "aLevel" ? "team" : "team" }} {{ $t('JobRequirementsB') }}
											{{ infoData.cycle }}
											{{
											$t('JobRequirementsC')
										}}({{infoData.applicationType == "aLevel" ? "A" : "A、B、C"}})
										</view>
									</view>
									<view class="row-item">
										<view class="positionManage-info-title">{{ $t('positionManage.WorkProgress') }}
										</view>
										<view class="progressBox">
											<t-progress style="width: 360rpx;" :label="false"
												:percentage="infoData.completed / infoData.target * 100" />
											<view>
												<text class="themeColor">{{ infoData.completed }}</text>/{{ infoData.target
											}}
											</view>
										</view>
									</view>
									<view class="row-item" v-if="info?.latestId">
										<view class="positionManage-info-title">{{ $t('考核日') }}
										</view>
										<view class="positionManage-info-value">{{ weekList[info?.assessmentDay] }}
										</view>
									</view>
									<view class="row-item">
										<view class="positionManage-info-title">{{ $t('positionManage.ApprovalTime') }}
										</view>
										<view class="positionManage-info-value">{{ infoData.approveTime || '-' }}</view>
									</view>
									<view class="row-item">
										<view class="positionManage-info-title">{{ $t('positionManage.RemainingTime') }}
										</view>
										<view class="positionManage-info-value" style="color: #FF3333;">{{ time }}
										</view>
									</view>

								</view>
							</view>

							<view class="table">
								<t-config-provider :global-config="globalConfig">
									<t-table row-key="index" :data="data" :columns="columns"
										:custom-class="'custom-table'">
									</t-table>
								</t-config-provider>
							</view>
						</view>

						<view v-else>
							<!-- 审核中 -->
							<view class="positionManage_info" v-if="audit" style="padding-left: 0;padding-right: 0;">
								<image src="/static/mine/applicationRecord/audit.png" mode=""
									class="positionManage-image">
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
			</uv-skeletons>
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
	import {
		vipInfoApi,
	} from "@/common/api/level.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				// 审核中
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
				// 骨架显示状态
				isLoading: true,
				skeleton: [{
						type: 'avatar',
						style: 'width: 120rpx;height: 120rpx;margin: 0 auto;marginTop: 220rpx'
					},
					{
						type: 'line',
						num: 4,
						gap: '40rpx',
						style: [
							'height: 50rpx;width: 300rpx; margin: 30rpx auto;',
							'marginTop: 20rpx'
						]
					}, {
						type: 'line',
						num: 5,
						gap: '40rpx',
						style: [
							"marginTop: 120rpx",
							null,
							"height: 60rpx"
						]
					},
					120, {
						type: 'flex',
						children: [{
							type: 'line',
							style: "width: 200rpx;"
						}, {
							type: 'line',
							style: "width: 200rpx;"
						}, {
							type: 'line',
							style: "width: 200rpx;"
						}]
					},
					30, {
						type: 'line',
						style: "height: 400rpx;"
					}
				],
				url: 'http://13.245.95.135:8888',

				// url: 'http://192.168.2.35:8080',
				info: {},
				topStyle: 0,
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
						colKey: 'date',
						title: '',
						align: 'center',
						width: 110
					},
				],
				data: [],
				infoData: {},
				time: '',
				countdownInterval: null,
				weekDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
				vipInfo: {}
			}
		},
		methods: {
			toPush() {
				uni.setStorageSync('privacyPolicyInfo', this.info.contract)
				uni.navigateTo({
					url: '/pages/MinePage/ElectronicContract?positionName=' + this.info.positionName
				})
			},
			// 计算考核剩余时间
			getAssessmentDay(targetDay) {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const currentDay = today.getDay();
				// 修正计算逻辑：直接计算正向天数差
				let daysUntilTarget = (targetDay - currentDay + 7) % 7;
				// 如果今天大于目标日，则自动指向下周目标日（不需要+7）
				// 例如：周四(4)到周三(3) → (3-4+7)=6 → 正确指向下周三
				// 周三(3)到周三(3) → 0 → 通过下面判断设为7（下周三）
				// 特殊处理：如果今天就是目标日，则计算到下周同一天
				if (daysUntilTarget === 0) {
					daysUntilTarget = 7;
				}
				const targetDate = new Date(today);
				targetDate.setDate(today.getDate() + daysUntilTarget);
				targetDate.setHours(0, 0, 0, 0);
				const diffMs = targetDate - today;
				const diffDays = Math.floor(diffMs / 86400000);
				return diffDays;
			},
			mtop(e) {
				this.topStyle = "margin-top:-" + e + "rpx;height:" + (e + 396) +
					"rpx;background: url('/static/login/login_bg.png') top left/100% no-repeat;"
			},
			getMyPosition() {
				positionMyPositionApi().then(res => {
					if (res.code == 200) {
						this.info = res.data
						if (this.info?.latestId) {
							positionMyPositionInfoApi(this.info?.latestId).then(res => {
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
								this.isLoading = false
							})
						} else {
							this.isLoading = false
						}
					} else {
						this.isLoading = false
						this.$showMessage('error', res.msg || 'error')
					}
				}).catch(err => {
					if (err.msg == 'Your job posting is currently under review.') {
						this.audit = true
					}
					console.error(err);
				}).finally(() => {
					this.isLoading = false
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
			this.getPositionEffectivePositionApi()
			vipInfoApi().then((res) => {
				this.vipInfo = res.data
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
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
	::v-deep .t-progress__inner {
		background: $themeColor;
	}

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
			gap: 40rpx;

			.row-item {
				display: flex;
				justify-content: space-between;

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