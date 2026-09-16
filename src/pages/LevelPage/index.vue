<template>
	<homenavbar :backgroundStr="''" :showBack="false" @mtop="mtop" :isHome="true" class="page">
		<!-- :whiteBackgroundOnScroll="activeHeadline !== 'grade'" -->
		<!-- :class="{ black: activeHeadline === 'grade' }" -->
		<view class="top-bg" :style="topStyle"></view>

		<level-home v-if="activeHeadline === 'grade'" ref="levelHome" />

	</homenavbar>
</template>

<script>
import homenavbar from '@/component/home-navbar/home-navbar.vue';
import levelHome from '@/components/levelHome/levelHome.vue';
import {
	positionApi,
	positionMyPositionApi,
	subordinateInformationApi,
	positionApplyApi
} from "@/common/api/position.js";
import {
	userInfoApi
} from "@/common/api/users.js";
export default {
	components: {
		homenavbar,
		levelHome
	},
	data() {
		return {
			currency: '',
			topStyle: '',
			activeHeadline: 'grade',
			activeJobIndex: 0,
			jobScrollLeft: 0,
			userInfo: {},
			myJob: {},
			jobs: []
		}
	},
	computed: {
		currentJob() {
			return this.jobs[this.activeJobIndex] || this.jobs[0]
		},
		currentBenefitsJob() {
			return this.userInfo.position ? this.myJob : (this.jobs[0] || {})
		},
		nextJobName() {
			if (!this.userInfo.position && !this.myJob.id) {
				return this.jobs[0]?.name || '--'
			}
			return this.jobs[this.activeJobIndex + 1]?.name || this.currentJob.name
		},
		headlineWaveWidth() {
			const text = this.activeHeadline === 'position'
				? `${this.$t('levelPage.position')}: ${this.currentJob.name}`
				: `${this.$t('levelPage.grade')}: ${this.currentJob.level}`
			return Math.min(500, Math.max(126, text.length * 16))
		},
		triangleLeft() {
			return Math.max(96, Math.min(580, 198 + this.activeJobIndex * 320 - this.jobScrollLeft))
		},
		navbarBackground() {
			return this.activeHeadline === 'grade' ? '#000000' : "''"
		},
		navbarLogoSrc() {
			return this.activeHeadline === 'grade' ? '/static/logo_white.png' : '/static/logo.png'
		},
		navbarMessageSrc() {
			return this.activeHeadline === 'grade' ? '/static/message_white.png' : '/static/message.png'
		}
	},
	mounted() {
		this.currency = uni.getStorageSync('settings').currency || ''
		this.userInfo = uni.getStorageSync('userInfo') || {}
	},
	methods: {
		// 申请职位
		positionApply(item) {
			// console.log(!item?.pId || !this.canShowApply(item) || !this.canApply(item))
			if (!item?.pId || !this.canShowApply(item) || !this.canApply(item)) return
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			positionApplyApi(item.pId).then(res => {
				this.$showMessage('warning', res.msg);
			}).catch(err => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			});
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 99) + "rpx"
			// #endif
		},
		changeHeadline(type) {
			this.activeHeadline = type
		},
		selectJob(index) {
			this.activeJobIndex = index
			this.jobScrollLeft = Math.max(0, index * 280)
		},
		normalizeJob(item = {}) {
			const completed = Number(item?.completed || 0)
			const target = Number(item.numberAchievements || 0)
			const assessmentRequirement = item.assessmentRequirements
			const weekList = {
				1: this.$t('levelPage.weekdays.monday'),
				2: this.$t('levelPage.weekdays.tuesday'),
				3: this.$t('levelPage.weekdays.wednesday'),
				4: this.$t('levelPage.weekdays.thursday'),
				5: this.$t('levelPage.weekdays.friday'),
				6: this.$t('levelPage.weekdays.saturday'),
				7: this.$t('levelPage.weekdays.sunday')
			}
			const payDay = item.payDay ?? item.assessmentDay
			const assessment = item.payType === 'daily'
				? this.$t('levelPage.daily')
				: item.payType === 'weekly'
					? weekList[payDay] || item.assessment || '--'
					: item.assessment || item.assessmentDay || '--'
			const conditions = []
			if (item.jobRequirements) {
				conditions.push({
					type: 'job',
					label: item.jobRequirements,
					done: completed,
					total: target
				})
			}
			if (assessmentRequirement) {
				const assessmentCompleted = typeof assessmentRequirement === 'object'
					? Number(assessmentRequirement.completed || 0)
					: completed
				const assessmentTarget = typeof assessmentRequirement === 'object'
					? Number(assessmentRequirement.numbers || 0)
					: Number(item.numbers || 0)
				const assessmentLabel = typeof assessmentRequirement === 'object'
					? assessmentRequirement.label || assessmentRequirement.name || assessmentRequirement.requirements || this.$t('levelPage.assessmentRequirements')
					: assessmentRequirement
				conditions.push({
					type: 'assessment',
					label: assessmentLabel,
					done: assessmentCompleted,
					total: assessmentTarget
				})
			}
			const jobCondition = conditions.find(condition => condition.type === 'job')
			return {
				...item,
				id: item.id || item.pid,
				name: item.name || item.positionName || '--',
				subtitle: item.subtitle || '',
				level: item.level || item.subType || '',
				rank: item.rank || item.applicationType || '',
				payCycle: item.payCycle || item.payType || '--',
				assessment,
				assessmentDay: weekList[payDay] || item.assessmentDay || '--',
				jobRequirements: item.jobRequirements || '',
				assessmentRequirements: item.assessmentRequirements || '',
				completed,
				numberAchievements: target,
				reached: !!jobCondition && jobCondition.total > 0 && jobCondition.done >= jobCondition.total,
				conditions: conditions.length ? conditions : [{ label: '--', done: 0, total: 0 }]
			}
		},
		conditionPercent(condition) {
			if (!condition.total) return 0
			return Math.min(100, Math.round(condition.done / condition.total * 100))
		},
		canApply(item) {
			const jobCondition = item?.conditions?.find(condition => condition.type === 'job')
			return !!jobCondition && jobCondition.total > 0 && jobCondition.done >= jobCondition.total
		},
		positionSort(item) {
			const value = item?.sort ?? item?.sortOrder ?? item?.levelSort ?? item?.level ?? item?.rank
			if (value === undefined || value === null || value === '') return null
			const text = String(value).trim()
			const number = Number(text.replace(/^lv\.?\s*/i, ''))
			return Number.isNaN(number) ? null : number
		},
		canShowApply(item) {
			if (!item?.id || !this.myJob?.id) return true

			const currentSort = this.positionSort(item)
			const mySort = this.positionSort(this.myJob)
			if (currentSort !== null && mySort !== null) return currentSort >= mySort

			const currentIndex = this.jobs.findIndex(job => `${job.id}` === `${item.id}`)
			const myIndex = this.jobs.findIndex(job => `${job.id}` === `${this.myJob.id}`)
			return myIndex === -1 || currentIndex === -1 || currentIndex >= myIndex
		}
	},
	onShow() {
		if (this.activeHeadline === 'grade') {
			this.$nextTick(() => {
				this.$refs.levelHome?.initData?.()
			})
			return
		}
		positionApi().then((res) => {
			this.jobs = (res.data || []).map(this.normalizeJob)
			return positionMyPositionApi().then((myPositionRes) => {
				if (myPositionRes && myPositionRes.data) {
					this.myJob = this.normalizeJob(myPositionRes.data)
				}
			})
		}).then(() => {
			userInfoApi().then((res) => {
				uni.setStorageSync('userInfo', res.data)
				this.userInfo = res.data
				if (res.data.housekeeper == 1) {
					this.pop_message = this.$t("您的帐户已被限制")
					this.$refs.promptpopup.open()
				}
				subordinateInformationApi(res.data.userId).then((res => {
					this.subordinateInformation = res.data;
				})).catch(err => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				if (!this.myJob.id) {
					const myPosition = this.jobs.find(item => item.id == res.data.position)
					if (myPosition) this.myJob = myPosition
				}
			})
		}).catch((err) => {
			console.log('request fail', err);
			this.$showMessage('warning', err.msg);
		}).finally(() => {
			this.isLoading = false
		});
	}
}
</script>

<style lang="scss" scoped>
* {
	box-sizing: border-box;
	font-family: 'MiSans';
}

.top-bg {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1076rpx;
	background:
		radial-gradient(circle at 0% 0%, #69d6ec 0%, rgba(105, 214, 236, 0.55) 34%, transparent 62%),
		radial-gradient(circle at 100% 0%, #3aaff5 0%, rgba(58, 175, 245, 0.55) 36%, transparent 65%),
		radial-gradient(circle at 50% 45%, rgba(245, 248, 255, 0.9) 0%, rgba(245, 248, 255, 0.25) 42%, transparent 72%),
		linear-gradient(180deg, #b9e9f3 0%, rgba(234, 246, 248, 0.8) 55%, rgba(244, 245, 251, 0) 100%);
	z-index: 0;
}

.top-bg.black {
	background: #000000;
}

.page {
	// min-height: 100vh;
	color: #050505;
	background: #f2f5ff;
	width: 100vw;
	overflow: hidden;
}

.hero {
	position: relative;
	// height: 336rpx;
	padding: 24rpx 24rpx 46rpx;
	overflow: hidden;
}

.headline {
	position: relative;
	z-index: 3;
	// margin-top: 58rpx;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	// gap: 28rpx;
	font-size: 36rpx;
	line-height: 48rpx;
	white-space: nowrap;
	padding: 12rpx 18rpx;
	border-radius: 30rpx;
	background: rgba(255, 255, 255, 0.6);
}

.headline-item {
	position: relative;
	display: inline-block;
	max-width: none;
	padding: 18rpx 24rpx 24rpx;

	.tag {
		font-family: MiSans;
		font-size: 24rpx;
		line-height: 24rpx;
		margin-bottom: 14rpx;
		color: #868686;
	}

	.name {
		font-family: MiSans;
		font-size: 28rpx;
		line-height: 28rpx;
		font-weight: bold;
	}
}

.headline-item.active {
	color: #fff;
	border-radius: 24rpx;
	background: #0145F1;

	.tag {
		color: #fff;
	}
}

.top-bg.black~.hero .headline-item,
.top-bg.black~.hero .headline-item.active {
	color: #ffffff;
}

.headline-text {
	position: relative;
	z-index: 2;
}

.mint-stroke {
	position: absolute;
	left: 50%;
	bottom: -20rpx;
	z-index: 1;
	transform: translateX(-50%) rotate(-1deg);
	width: 100%;
	height: 64rpx;
	margin-top: 0;
	pointer-events: none;
}

.content {
	position: relative;
	padding: 0 24rpx 0;
	z-index: 1;
}

.profile-card {
	position: relative;
	min-height: 412rpx;
	padding: 36rpx 32rpx 32rpx;
	border-radius: 32rpx;
	background: radial-gradient(54% 123% at 96% 4%, #a5c3f0 0%, #ffffff00 100%), linear-gradient(0deg, #EEF8FF, #EEF8FF), #F6F1FF;
	box-sizing: border-box;
	border: 2rpx solid #F6F1FF;
	box-shadow: 0px 8rpx 20rpx 0px rgba(113, 159, 228, 0.2);
	// overflow: hidden;
}

.card-crown {
	position: absolute;
	top: -58rpx;
	right: -4rpx;
	width: 190rpx;
	height: 190rpx;
}

.profile-head {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
}

.avatar-wrap {
	position: relative;
	width: 132rpx;
	height: 132rpx;
	border: 6rpx solid #ffffff;
	border-radius: 50%;
	flex-shrink: 0;
}

.avatar-wrap image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-wrap text {
	position: absolute;
	left: 30rpx;
	bottom: -27rpx;
	padding: 1rpx 7rpx;
	border: 4rpx solid #f0cfb4;
	border-radius: 5rpx;
	background: #4b2a22;
	color: #ffffff;
	font-size: 22rpx;
	font-weight: 800;
	line-height: 26rpx;
}

.profile-info {
	display: flex;
	flex-direction: column;
	align-items: start;
	justify-content: space-between;
	margin-left: 18rpx;
	padding-top: 4rpx;
	min-width: 0;
}

.name {
	// font-family: serif;
	font-size: 38rpx;
	line-height: 46rpx;
}

.rank {
	display: inline-flex;
	align-items: center;
	margin-top: 14rpx;
	padding: 8rpx 20rpx;
	border-radius: 28rpx;
	background: #d8e9ff;
	color: #075fe0;
	font-size: 26rpx;
	line-height: 32rpx;

	&.node {
		opacity: 0;
	}
}

.rank image {
	width: 32rpx;
	height: 32rpx;
	margin-right: 8rpx;
}

.stats {
	position: relative;
	z-index: 1;
	display: grid;
	grid-template-columns: 1fr 1.22fr;
	gap: 30rpx 36rpx;
	margin-top: 38rpx;
}

.stats strong,
.stats text {
	display: block;
}

.stats strong {
	font-size: 28rpx;
	font-weight: 800;
	line-height: 38rpx;
}

.stats text {
	margin-top: 8rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	white-space: nowrap;
}

.section-title {
	margin: 32rpx 0 20rpx;
	font-size: 28rpx;
	font-weight: 800;
	line-height: 40rpx;
}

.benefits {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx 14rpx;
}

.benefit {
	height: 134rpx;
	padding: 26rpx 24rpx;
	border-radius: 13rpx;
	background: #ffffff;
}

.benefit.wide {
	grid-column: 1 / -1;
}

.benefit text,
.benefit strong {
	display: block;
}

.benefit text {
	color: #5e5e5e;
	font-size: 26rpx;
	line-height: 32rpx;
}

.benefit strong {
	margin-top: 15rpx;
	font-size: 30rpx;
	font-weight: 800;
	line-height: 36rpx;
	white-space: nowrap;
}

.job-scroll {
	width: calc(100% + 48rpx);
	margin-left: -24rpx;
	white-space: nowrap;
}

.job {
	display: inline-flex;
	align-items: center;
	width: 480rpx;
	height: 110rpx;
	margin-right: 14rpx;
	padding: 18rpx 22rpx;
	border: 2rpx solid transparent;
	border-radius: 20rpx;
	background: #ffffff;
	vertical-align: top;
}

.job:first-child {
	margin-left: 24rpx;
}

.job.active {
	background: linear-gradient(270deg, #e5edff 0%, #ffffff 100%);
	box-sizing: border-box;
	border: 2rpx solid #0052D9;
}

.job image {
	width: 76rpx;
	height: 76rpx;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.job strong,
.job text {
	display: block;
}

.job strong {
	font-size: 28rpx;
	font-weight: 800;
	line-height: 34rpx;
	white-space: nowrap;
}

.job text {
	margin-top: 12rpx;
	color: #555555;
	font-size: 26rpx;
	line-height: 32rpx;
	white-space: nowrap;
}

.conditions {
	position: relative;
	margin: 30rpx -24rpx 0;
	padding: 34rpx 32rpx 42rpx;
	border-radius: 32rpx 32rpx 0 0;
	background: #ffffff;
}

.triangle {
	position: absolute;
	top: -30rpx;
	width: 0;
	height: 0;
	border-left: 30rpx solid transparent;
	border-right: 30rpx solid transparent;
	border-bottom: 30rpx solid #ffffff;
	transition: left .2s ease;
}

.condition-title {
	margin-bottom: 28rpx;
	font-size: 32rpx;
	font-weight: 800;
	line-height: 42rpx;
}

.condition-box {
	padding: 26rpx 22rpx 28rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 14rpx;
}

.job-requirement {
	margin-bottom: 26rpx;
	padding: 18rpx 20rpx;
	border-radius: 10rpx;
	background: #f5f8ff;
	color: #666666;
	font-size: 26rpx;
	line-height: 36rpx;
	word-break: break-word;
}

.progress-row+.progress-row {
	margin-top: 28rpx;
}

.progress-label {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	color: #444444;
	font-size: 27rpx;
	line-height: 34rpx;
}

.progress-label text {
	white-space: normal;
}

.progress-label em {
	color: #0661e5;
	font-size: 28rpx;
	font-style: normal;
	flex-shrink: 0;
}

.track {
	height: 18rpx;
	margin-top: 20rpx;
	border-radius: 15rpx;
	background: #e2ecff;
	overflow: hidden;
}

.track view {
	height: 100%;
	border-radius: 15rpx;
	background: #075dde;
	transition: width .2s ease;
}

.disabled {
	height: 86rpx;
	margin-top: 46rpx;
	border-radius: 50rpx;
	background: #e3edff;
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 800;
	line-height: 86rpx;
	text-align: center;
}

.disabled.reached {
	background: #075dde;
}

.post-title {
	margin-top: 54rpx;
}

.post .benefit {
	background: #FAFAFA;
}
</style>
