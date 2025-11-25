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
									<view class="row-item" style="align-items: center;">
										<view class="positionManage-info-title">{{ $t('positionManage.Payday') }}</view>
										<view v-if="userInfo.compliance == 0" class="positionManage-info-value"
											style="color: #FF0000;max-width: 320rpx;">
											This week's assessment has not been met
										</view>
										<view v-else>
											<view class="positionManage-info-value" v-if="info.payType == 'daily'">
												{{ $t("每天") }}
											</view>
											<view class="positionManage-info-value" v-else>
												{{ weekDay[infoData.payday - 1] ?? '-' }}
											</view>
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
									<view class="row-item" v-if="info?.latestId">
										<view class="positionManage-info-title">{{ $t('考核日') }}
										</view>
										<view class="positionManage-info-value">
											{{ infoData?.maturityTime?.split(' ')[0] }}
											<!-- ({{ weekList[info?.assessmentDay] }}) -->
										</view>
									</view>
									<view class="row-item progress_max_Box">
										<view class="progress_max_Box_title">
											<view class="positionManage-info-title">
												{{ $t('positionManage.WorkProgress') }}
											</view>
											<view class="positionManage-info-title">
												<view class="positionManage-info-value" style="color: #3FCF05;"
													v-if="infoData.status == 6">
													{{ $t('positionManage.Agreed') }}
												</view>
												<view class="positionManage-info-value" v-if="infoData.status == 3">
													{{ $t('positionManage.Failed') }}
												</view>
												<view class="positionManage-info-value" v-if="infoData.status == 2">
													{{ $t('positionManage.underReview') }}
												</view>
												<view class="positionManage-info-value" style="color: #FF0000;"
													v-if="infoData.status == 5">
													{{ $t('positionManage.notReach') }}
												</view>
												<view class="positionManage-info-value" style="color: #1167D1;"
													v-if="infoData.status == 4">
													{{ $t('positionManage.InProgress') }}
												</view>
											</view>
										</view>
										<view class="progress_max_Box_title">
											<view class="icon_box">
												<image class="icon" v-if="infoData?.complianceType == 'aLevel'"
													src="/static/positions/subordinate.png" mode=""></image>
												<image class="icon" v-if="infoData?.complianceType == 'team'"
													src="/static/positions/team.png" mode=""></image>
												<view class="completed_text">
													{{ infoData.completed }}/{{ infoData.target }}
												</view>
											</view>
											<view class="positionManage-info-value time">{{ time }}
											</view>
										</view>
										<view class="progressBox">
											<t-progress style="width: 100%;" :label="false"
												:percentage="infoData.completed / infoData.target * 100" />
										</view>
										<view class="info_text">
											{{ $t('考核要求') }}:
										</view>
										<view class="info_text">
											{{ infoData.assessmentRequirements || infoData.requirements }}
										</view>
										<view class="info_text" style="color: #FE9301;">
											**Once the assessment conditions are met, the salary will be paid in the
											next week**
										</view>
									</view>
								</view>
							</view>

							<view class="table">
								<t-config-provider :global-config="globalConfig">
									<t-table row-key="index" :data="salaryList" :columns="columns"
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
		userInfoApi
	} from "@/common/api/users.js";
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
				salaryList: [],
				infoData: {},
				time: '',
				countdownInterval: null,
				weekDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
				userInfo: {},
				// 新增用于倒计时计算的变量
				initialServerTime: null,
				localStartTime: null
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
				positionMyPositionApi().then(res => {
					if (res.code == 200) {
						this.info = res.data
						if (this.info?.latestId) {
							positionMyPositionInfoApi(this.info?.latestId).then(res => {
								if (res.code == 200) {
									this.infoData = res.data
									// 重置倒计时计算所需变量
									this.initialServerTime = null;
									this.localStartTime = null;
									// 清除之前的定时器
									if (this.countdownInterval) {
										clearInterval(this.countdownInterval);
									}
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
				// 第一次运行时记录初始时间
				if (!this.initialServerTime) {
					this.initialServerTime = new Date(this.infoData.systemTime).getTime();
					this.localStartTime = new Date().getTime();
				}

				if (!this.initialServerTime) {
					this.time = '0' + this.$t('day') + '0' + this.$t('hour') + '0' + this.$t('min') + '0' + this.$t(
						'second');
					return;
				}

				// 将后端返回的目标时间字符串转换为标准ISO格式
				const isoStr = this.infoData.maturityTime.replace(" ", "T");
				// 创建目标时间对象（考核截止时间）
				const targetTime = new Date(isoStr).getTime();

				// 基于初始服务器时间加上经过的本地时间差来计算当前服务器时间
				const elapsed = new Date().getTime() - this.localStartTime;
				const currentServerTime = this.initialServerTime + elapsed;

				// 计算时间差（毫秒）
				const diff = targetTime - currentServerTime;

				// 如果时间已过期，显示全零
				if (diff <= 0) {
					this.time = '0' + this.$t('day') + '0' + this.$t('hour') + '0' + this.$t('min') + '0' + this.$t(
						'second');
					return;
				}

				// 分别计算天、小时、分钟、秒
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((diff % (1000 * 60)) / 1000);

				// 格式化并更新显示文本
				this.time = days + this.$t('day') + hours + this.$t('hour') + minutes + this.$t('min') + seconds + this.$t(
					'second');
			},
			getPositionEffectivePositionApi() {
				positionEffectivePositionApi().then(res => {
					if (res.code == 200) {
						this.salaryList = res.rows || []

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

			userInfoApi().then((res) => {
				this.userInfo = res.data
				uni.setStorageSync('userInfo', res.data)
			}).catch((err) => {
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
		background: #3FCF05;
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
		box-shadow: 0rpx 22rpx 28rpx -6rpx #F9FCFF;
		border: 2rpx solid #F6F6F6;
		border-radius: 32rpx;
		padding: 30rpx 0 0;
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
			// gap: 40rpx;

			.row-item {
				display: flex;
				justify-content: space-between;
				padding: 30rpx;

				&:nth-child(2n) {
					background-color: #f5f8ff;
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

				&.progress_max_Box {
					display: flex;
					flex-direction: column;
					gap: 22rpx;

					.info_text {
						font-family: DIN, DIN;
						font-weight: normal;
						font-size: 24rpx;
						color: #000000;
						text-align: left;
						word-break: break-all
					}

					.progress_max_Box_title {
						display: flex;
						align-items: center;
						justify-content: space-between;

						.time {
							font-family: DINPro, DINPro;
							font-weight: 500;
							font-size: 24rpx;
							color: #FE9301;
							text-align: right;
							font-style: normal;
						}

						.icon_box {
							display: flex;
							align-items: center;
							gap: 10rpx;

							.completed_text {
								font-family: PingFangSC, PingFang SC;
								font-weight: 400;
								font-size: 24rpx;
								color: #000000;
								text-align: left;
								font-style: normal;
							}

							.icon {
								width: 32rpx;
								min-width: 32rpx;
								height: 32rpx;
							}
						}
					}
				}
			}
		}

		&.positionManage_info2 {
			padding: 0;

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