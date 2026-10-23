<template>
	<customnavbar class="position-page" :title="$t('home.Postmanage')"
		backgroundStr="url('/static/positions/top_bgi.png') left top / 100% auto no-repeat" @mtop="mtop">
		<view class="task-page">
			<view class="position-hero" :style="topStyle">
				<view class="hero-main">
					<view class="hero-copy">
						<view class="hero-eyebrow">{{ $t('当前职位') }}</view>
						<view class="hero-name">{{ userInfo?.positionName || '--' }}</view>
						<view class="hero-description">{{ $t('post.growthHint') }}</view>
					</view>
					<image v-if="userInfo?.image" class="hero-badge" :src="userInfo.image" mode="aspectFit" />
				</view>
				<view class="team-stats">
					<view class="stat-card">
						<image class="stat-icon" src="/static/positions/subordinate.png" mode="aspectFit" />
						<view class="stat-copy">
							<view class="stat-value">{{ userInfo?.lv1Count || 0 }}</view>
							<view class="stat-label">{{ $t('A级下属人数') }}</view>
						</view>
					</view>
					<view class="stat-card stat-card-team">
						<image class="stat-icon" src="/static/positions/team.png" mode="aspectFit" />
						<view class="stat-copy">
							<view class="stat-value">{{ userInfo?.totalCount || 0 }}</view>
							<view class="stat-label">{{ $t('团队人数') }}</view>
						</view>
					</view>
				</view>
			</view>

			<view class="position-list">
				<view v-for="(item, index) in postList" :key="item.pId ?? index" class="position-card">
					<view class="position-header">
						<view class="position-badge" :class="{ 'position-badge-2': idx >= 0 && index === idx }">
							<image class="position-image" :src="item.image" mode="aspectFit" />
						</view>
						<view class="position-info">
							<view class="position-name">{{ item.positionName }}</view>
							<view class="position-status status-current" v-if="idx >= 0 && index === idx">
								<image class="status-crown" src="/static/positions/diadema.png" mode="aspectFit" />
								<text>{{ $t('当前职位') }}</text>
							</view>
							<view class="position-status status-achieved" v-else-if="idx >= 0 && index < idx">
								{{ $t('当前职位大于此职位') }}
							</view>
							<view class="position-status status-achieved" v-else-if="item.isItDone">
								{{ $t('已达成') }}
							</view>
							<view class="position-status" v-else>
								<image class="status-lock" src="/static/positions/lock.png" mode="aspectFit" />
								<text>{{ $t('未达成') }}</text>
							</view>
						</view>
						<view v-if="item.isItDone && index > idx" class="position-actions">
							<button class="apply-button" @click.stop="toApply(item)">
								{{ $t('post.apply') }}
							</button>
						</view>
					</view>

					<view class="requirements-panel">
						<view class="panel-heading">
							<image class="panel-icon requirement-icon"
								:src="item.applicationType === 'aLevel' ? '/static/positions/subordinate.png' : '/static/positions/team.png'"
								mode="aspectFit" />
							<view class="requirement-copy">
								<view class="panel-title">{{ $t('职位要求') }}</view>
								<view class="requirement-description">
									{{ $t(item.applicationType === 'aLevel' ? 'A级下属人数' : '团队人数') }}:
									{{ item.numberAchievements || 0 }}
								</view>
							</view>
						</view>
						<view class="progress-row">
							<view class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100"
								:aria-valuenow="getProgress(item)" :aria-label="$t('职位要求')">
								<view class="progress-fill" :style="{ width: getProgress(item) + '%' }" />
							</view>
							<view class="progress-count">
								<text class="progress-completed">{{ item.completed || 0 }}</text>/{{
									item.numberAchievements || 0 }}
							</view>
						</view>
					</view>

					<view class="benefits-panel">
						<view class="panel-heading benefits-heading">
							<image class="panel-icon" src="/static/positions/JobAdvantages.png" mode="aspectFit" />
							<view class="panel-title">{{ $t('post.jobBenefits') }}</view>
						</view>
						<view class="benefits-list">
							<view class="benefit-row">
								<image class="benefit-icon" src="/static/positions/salary.png" mode="aspectFit" />
								<text class="benefit-label">{{ $t('基本工资') }}</text>
								<text class="benefit-value">{{ item.salary || 0 }}</text>
							</view>
							<view class="benefit-row">
								<image class="benefit-icon" src="/static/positions/paymentMethod.png"
									mode="aspectFit" />
								<text class="benefit-label">{{ $t('发薪方式') }}</text>
								<text class="benefit-value">{{ getPayTypeText(item.payType) }}</text>
							</view>
							<view class="benefit-row">
								<image class="benefit-icon" src="/static/positions/date.png" mode="aspectFit" />
								<text class="benefit-label">{{ $t('考核日') }}</text>
								<text class="benefit-value">{{ weekList[item.assessmentDay] ?
									$t(weekList[item.assessmentDay]) : '--' }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</customnavbar>
	<uni-popup ref="promptpopup" type="center" :mask-click="false">
		<view class="prompt_pop_page">
			<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
			<view class="prompt_pop_taps">{{ pop_message }}</view>
			<view class="prompt_pop_bottom">
				<button class="prompt_confirm_btn" @click="prompt_confirm">{{ $t('pay.yes') }}</button>
			</view>
		</view>
	</uni-popup>
	<uni-popup ref="popup" type="center" border-radius="10px 10px 0 0">
		<view class="pop_page">
			<view class="pop_top">{{ $t('home.Prompt') }}</view>
			<view class="pop_content">{{ pop_message }}</view>
			<view class="pop_bottom">
				<view class="pop_bottom_btn" @click="confirm2">{{ $t('home.Postmanage') }}</view>
				<view class="pop_bottom_btn" @click="confirm">{{ $t('home.Sure') }}</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	positionApi,
	subordinateInformationApi
} from "@/common/api/position.js";
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			pageTitle: '',
			weekList: {
				1: 'positionManage.weekdays.monday',
				2: 'positionManage.weekdays.tuesday',
				3: 'positionManage.weekdays.wednesday',
				4: 'positionManage.weekdays.thursday',
				5: 'positionManage.weekdays.friday',
				6: 'positionManage.weekdays.saturday',
				7: 'positionManage.weekdays.sunday'
			},
			pop_message: "",
			postList: [],
			userInfo: {},
			topStyle: '',
			idx: -1,
		}
	},
	onLoad(options) {
		if (options.title) {
			this.pageTitle = options.title
		} else {
			this.pageTitle = uni.getStorageSync('pageTitle')
		}
	},
	onShow(options) {
		positionApi().then((res) => {
			this.postList = res.data
			subordinateInformationApi(uni.getStorageSync('userInfo').userId).then((res) => {
				this.userInfo = res.data
				this.idx = this.postList?.findIndex(item => item?.pId == this.userInfo?.position) ?? -1
				// if (res.data.housekeeper == 1) {
				// 	this.pop_message = this.$t("withdrawal.restrictedAccess")
				// 	this.$refs.promptpopup.open()
				// }
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				this.postList = res.data
			})
		}).catch((err) => {
			console.log('request fail', err);
			this.$showMessage('warning', err.msg);
		})
	},
	methods: {
		getProgress(item) {
			const target = Number(item.numberAchievements);
			const completed = Number(item.completed);
			if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(completed)) return 0;
			return Math.min(100, Math.max(0, completed / target * 100));
		},
		getPayTypeText(payType) {
			return ['daily', 'weekly', 'monthly'].includes(payType)
				? this.$t(`minePage.payTypes.${payType}`)
				: payType || '--';
		},
		mtop(e) {
			this.topStyle = `margin-top:-${e}rpx;padding-top:${e + 24}rpx`;
		},
		toApply(item) {
			uni.navigateTo({
				url: '/pages/HomePage/postAgreement?id=' + item.pId
			})
		},
		prompt_confirm() {
			this.$refs.promptpopup.close()
			this.pop_message = ""
			uni.navigateBack()
		},
		confirm() {
			this.$refs.popup.close()
		},
		confirm2() {
			this.$refs.popup.close()
			uni.navigateTo({
				url: '/pages/MinePage/applicationRecord'
			})
		},
	},

}
</script>

<style scoped lang="scss">
.position-page {
	min-height: 100vh;
	background: #edf7ff;
	color: #101833;
	font-family: "DINPro-Regular", "PingFang SC", sans-serif;
}

:deep(.nav-title) {
	font-size: 28rpx;
	font-weight: 700;
	color: #101833;
}

:deep(.left-icon) {
	left: 32rpx;
	width: 36rpx;
	height: 36rpx;
}

.task-page {
	min-height: 100vh;
	padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
	background: linear-gradient(180deg, #e0f5ff 0, #edf7ff 650rpx, #f3f9ff 100%);
}

.position-hero {
	box-sizing: border-box;
	padding: 0 30rpx 24rpx;
	background-image: linear-gradient(180deg, rgba(237, 247, 255, 0) 70%, #edf7ff 100%),
		url('/static/positions/top_bgi.png');
	background-position: left top;
	background-size: 100% 100%, 100% auto;
	background-repeat: no-repeat;
}

.hero-main {
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	min-height: 172rpx;
	padding: 20rpx 32rpx 18rpx;
}

.hero-copy {
	position: relative;
	z-index: 1;
	width: 64%;
	min-width: 0;
}

.hero-eyebrow {
	margin-bottom: 8rpx;
	color: #4e6c95;
	font-size: 22rpx;
	font-weight: 700;
	line-height: 20rpx;
	letter-spacing: 4rpx;
	text-transform: uppercase;
	overflow-wrap: anywhere;
}

.hero-name {
	font-size: 38rpx;
	font-weight: 900;
	line-height: 46rpx;
	overflow-wrap: anywhere;
}

.hero-description {
	max-width: 330rpx;
	margin-top: 6rpx;
	color: #6e829e;
	font-size: 20rpx;
	line-height: 27rpx;
}

.hero-badge {
	position: absolute;
	right: 20rpx;
	bottom: 0;
	width: 216rpx;
	height: 190rpx;
}

.team-stats {
	position: relative;
	display: flex;
	align-items: stretch;
	gap: 14rpx;
	padding: 0 22rpx;
}

.stat-card {
	display: flex;
	flex: 1;
	align-items: center;
	gap: 14rpx;
	box-sizing: border-box;
	min-width: 0;
	min-height: 86rpx;
	padding: 12rpx 18rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.65);
	border-radius: 20rpx;
	background: rgba(255, 255, 255, 0.7);
}

.stat-card-team {
	background: rgba(239, 238, 255, 0.8);
}

.stat-icon {
	flex-shrink: 0;
	width: 54rpx;
	height: 54rpx;
}

.stat-copy {
	min-width: 0;
}

.stat-value {
	font-size: 27rpx;
	font-weight: 700;
	line-height: 29rpx;
	overflow-wrap: anywhere;
}

.stat-label {
	margin-top: 2rpx;
	color: #72809c;
	font-size: 20rpx;
	line-height: 20rpx;
	word-break: break-all;
}

.position-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding: 8rpx 30rpx 0;
}

.position-card {
	min-width: 0;
	padding: 18rpx 24rpx 20rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.95);
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 8rpx 28rpx rgba(63, 110, 165, 0.07);
}

.position-header {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 14rpx;
}

.position-badge {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: 110rpx;
	height: 92rpx;
	border-radius: 18rpx;
	background: #ebf3ff;
}

.position-badge-1 {
	background: #e8f4ff;
}

.position-badge-2 {
	background: #f5f0ff;
}

.position-image {
	width: 82rpx;
	height: 82rpx;
}

.position-info {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: flex-start;
	gap: 10rpx;
	min-width: 0;
}

.position-name {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 34rpx;
	overflow-wrap: anywhere;
}

.position-status {
	display: flex;
	align-items: center;
	gap: 10rpx;
	box-sizing: border-box;
	max-width: 100%;
	min-height: 38rpx;
	padding: 6rpx 22rpx;
	border-radius: 22rpx;
	background: #edf1f6;
	color: #77859a;
	font-size: 20rpx;
	overflow-wrap: anywhere;
}

.status-current {
	background: linear-gradient(100deg, #1682ff, #04b4ff);
	color: #fff;
}

.status-achieved {
	background: #e8f3ff;
	color: #1274ef;
}

.status-crown {
	flex-shrink: 0;
	width: 24rpx;
	height: 24rpx;
}

.status-lock {
	flex-shrink: 0;
	width: 24rpx;
	height: 24rpx;
}

.position-actions {
	display: flex;
	flex-shrink: 0;
	flex-direction: column;
	align-items: flex-end;
	gap: 10rpx;
	max-width: 34%;
}

.apply-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	box-sizing: border-box;
	max-width: 100%;
	min-height: 44rpx;
	margin: 0;
	padding: 8rpx 20rpx;
	border: none;
	border-radius: 24rpx;
	background: #edf4ff;
	color: #075cff;
	font-family: inherit;
	font-size: 22rpx;
	font-weight: 500;
	line-height: 26rpx;
	text-align: center;

	&::after {
		border: none;
	}

	&:active {
		opacity: 0.75;
	}
}

.apply-button {
	background: linear-gradient(100deg, #1682ff, #04b4ff);
	color: #fff;
}

.requirements-panel,
.benefits-panel {
	padding: 16rpx 18rpx;
	border-radius: 16rpx;
	background: linear-gradient(110deg, #edf5ff, #f0f7ff);
}

.panel-heading {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.panel-icon {
	flex-shrink: 0;
	width: 52rpx;
	height: 52rpx;
}

.requirement-icon {
	filter: hue-rotate(315deg);
}

.requirement-copy {
	flex: 1;
	min-width: 0;
}

.panel-title {
	font-size: 24rpx;
	font-weight: 700;
	line-height: 28rpx;
	overflow-wrap: anywhere;
}

.requirement-description {
	margin-top: 3rpx;
	color: #7b88a0;
	font-size: 22rpx;
	line-height: 25rpx;
	overflow-wrap: anywhere;
}

.progress-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-top: 12rpx;
}

.progress-track {
	flex: 1;
	height: 18rpx;
	overflow: hidden;
	border-radius: 12rpx;
	background: #dce8f9;
}

.progress-fill {
	height: 100%;
	border-radius: inherit;
	background: repeating-linear-gradient(135deg, transparent 0, transparent 10rpx, rgba(0, 88, 255, 0.25) 10rpx, rgba(0, 88, 255, 0.25) 20rpx),
		linear-gradient(90deg, #0879ff, #11a7ff);
	transition: width 0.25s ease;
}

.progress-count {
	flex-shrink: 0;
	min-width: 54rpx;
	color: #224781;
	font-size: 20rpx;
	line-height: 26rpx;
	text-align: right;
	white-space: nowrap;
}

.progress-completed {
	color: #0878ff;
	font-size: 24rpx;
}

.benefits-panel {
	margin-top: 14rpx;
	padding-top: 10rpx;
}

.benefits-heading {
	margin-bottom: 8rpx;
}

.benefits-list {
	padding: 0 16rpx;
	border-radius: 16rpx;
	background: rgba(255, 255, 255, 0.94);
}

.benefit-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	min-height: 52rpx;

	&+& {
		border-top: 1rpx solid #eaf0f8;
	}
}

.benefit-icon {
	flex-shrink: 0;
	width: 38rpx;
	height: 38rpx;
}

.benefit-label {
	flex: 1;
	min-width: 0;
	padding: 8rpx 0;
	font-size: 22rpx;
	// line-height: 26rpx;
	overflow-wrap: anywhere;
}

.benefit-value {
	max-width: 45%;
	padding: 8rpx 0;
	font-size: 22rpx;
	// line-height: 26rpx;
	text-align: right;
	overflow-wrap: anywhere;
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

	.prompt_confirm_btn {
		width: 212rpx;
		height: 72rpx;
		background: $themeColor;
		// box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 12rpx;
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

.pop_page {
	box-sizing: border-box;
	background-color: #fff;
	width: 600rpx;
	border-radius: 28rpx;
	padding: 40rpx 54rpx 28rpx 54rpx;

	.pop_top {
		display: flex;
		justify-content: center;
		align-items: center;
		/* padding: 30rpx 0 20rpx 0; */
		/* border-bottom: 1px solid #D8D8D8; */
		;
		font-weight: 600;
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: left;
		font-style: normal;
	}

	.pop_content {
		font-family: "DINPro-Black", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.pop_bottom {
		display: flex;
		margin-top: 54rpx;
		justify-content: space-between;
	}

	.pop_bottom_btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 212rpx;
		/* height: 72rpx; */
		background: $themeColor;
		// box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 12rpx;
		font-family: "DINPro-Black", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 32rpx;
		padding: 12rpx 0;
		text-align: center;
		font-style: normal;
	}
}
</style>
