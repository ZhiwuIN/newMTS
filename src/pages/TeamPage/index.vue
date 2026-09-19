<template>
	<customnavbar :title="pageTitle" backgroundStr="#000" :whiteTitle="true" @mtop="mtop">
		<view class="team-page">
			<view class="hero" :style="topStyle">
				<view class="hero-copy">{{ $t('teamPage.accumulatedRewards') }}</view>
				<view class="hero-amount">{{ formatMoney(teamInfo.totalIncome) }}{{ currency }}<view class="today">
						{{ $t('teamPage.todayPlus', { amount: formatMoney(teamInfo.todayIncome) }) }}</view>
				</view>
				<view class="hero-actions">
					<view class="invite-button" @click="toPage('/pages/HomePage/teamExpansion')">
						{{ $t('teamPage.inviteFriends') }}</view>
					<view class="detail-button" @click="toPage('/pages/TeamPage/RewardDetails')">
						{{ $t('teamPage.rewardDetails') }}</view>
				</view>
				<view class="tip-card" @click="showTeamExplain = true">
					<view>
						<view class="tip-title">{{ $t('teamPage.increaseRevenue') }}</view>
						<view class="tip-description">{{ $t('teamPage.expandForRewards') }}</view>
					</view>
					<view class="tip-link">{{ $t('teamPage.goCheck') }}</view>
				</view>
			</view>
			<view class="page-body">
				<view class="section-title">{{ $t('teamPage.teamOverview') }}</view>
				<view class="overview-card">
					<view class="chart-side">
						<view class="donut" :style="donutStyle">
							<view class="donut-inner">
								<!-- 团队总人数 -->
								<text class="donut-total">{{ teamSize }}</text>
								<!-- 今日团队新增 -->
								<text class="donut-plus">+{{ newToday }}</text>
								<text class="donut-label">{{ $t('teamPage.myTeam') }}</text>
							</view>
						</view>
						<view class="chart-legend"><text class="member-color">{{ vipMemberCount }}
								{{ $t('teamPage.vip') }}</text><text class="intern-color">{{ ordinaryMemberCount }}
								{{ $t('teamPage.ordinary') }}</text></view>
					</view>
					<view class="level-list">
						<view class="level-item" v-for="item in levelItems" :key="item.name">
							<image :src="item.icon" class="level-icon" />
							<view class="level-main_box">
								<view class="level-main">
									<view class="level-count">{{ item.count }}</view>
									<view class="level-add">+{{ item.newCount }}</view>
								</view>
								<view class="level-main">
									<view class="level-name">{{ item.name }}</view>
									<view class="level-income">+{{ formatMoney(item.income) }}{{ currency }}</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="search-card"><input v-model="userAccount" :placeholder="$t('teamPage.accountPlaceholder')"
						placeholder-style="color:#999;font-size:30rpx" @confirm="searchMember" />
					<image class="search-icon" src="/static/team/search.png" @click="searchMember" />
				</view>
				<view class="tabs">
					<view v-for="(tab, index) in tabs" :key="tab" class="tab" :class="{ active: currentTab === index }"
						@click="switchTab(index)">{{ tab }}</view>
				</view>
				<view class="user-list" v-if="memberList.length">
					<view class="user-card" v-for="(user, index) in memberList" :key="user.uid || index"
						@click="toDetails(user.uid)">
						<image :src="user.image" class="user-avatar" mode="aspectFill" />
						<view class="user-info">
							<view class="user-name">{{ user.username }}</view>
							<view class="user-tag" :class="tagClass(user.type)">{{ user.type || $t('teamPage.member') }}
							</view>
						</view>
						<view class="reward-badge" :class="tagClass(user.type)">
							<view>{{ formatMoney(user.income) }}{{ currency }}</view>
							<text>{{ user.teamLevel === 'A' ? $t('teamPage.directLevel', { level: 'A' }) :
								$t('teamPage.level', { level: user.teamLevel }) }}</text>
						</view>
					</view>
					<listbottom :hasMore="hasMore" :loading="loading" :noData="nodata"
						image="/static/default/No content.png" :title="$t('default.NoContent')"
						:text="$t('default.NoContentText')" />
				</view>
				<view class="default_box" v-else>
					<image src="/static/mine/applicationRecord/nullPositionManage.png" mode="" class="default_image">
					</image>
					<view class="text1">{{ $t('暂无成员') }}</view>
					<view class="text2">{{ $t('团队越大, 奖励越丰富') }}</view>
					<view class="btn" @click="toPage('/pages/HomePage/teamExpansion')">{{ $t('teamPage.inviteFriends')
					}}</view>
				</view>
			</view>
		</view>
	</customnavbar>

	<!-- 说明弹窗 -->
	<teamExplainPopup :visible="showTeamExplain" @close="showTeamExplain = false" />
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue';
import teamExplainPopup from '@/components/teamExplainPopup/index.vue';
import listbottom from '@/component/list-bottom/list_bottom.vue';
import { teamApi, teamMemberApi } from '@/common/api/team.js'
export default {
	components: {
		customnavbar,
		teamExplainPopup,
		listbottom
	},
	data() {
		return {
			pageTitle: '',
			currency: '',
			teamInfo: {},
			currentTab: 0,
			userAccount: '',
			memberList: [],
			topStyle: '',
			nodata: false,
			hasMore: true,
			loading: false,
			showTeamExplain: false,
			page: {
				pageNum: 1,
				pageSize: 10
			}
		}
	},
	computed: {
		tabs() {
			return [this.$t('teamPage.all'), this.$t('teamPage.member'), this.$t('teamPage.intern')]
		},
		memberCount() {
			return Number(this.teamInfo.vipMemberCount) || 0
		},
		internCount() {
			return Number(this.teamInfo.ordinaryMemberCount) || 0
		},
		vipMemberCount() {
			return this.memberCount
		},
		ordinaryMemberCount() {
			return this.internCount
		},
		teamMemberCount() {
			return ['aMemberCount', 'bMemberCount', 'cMemberCount']
				.reduce((total, key) => total + (Number(this.teamInfo[key]) || 0), 0)
		},
		teamSize() {
			const value = Number(this.teamInfo.teamSize)
			return Number.isFinite(value) && value >= 0 ? value : this.teamMemberCount
		},
		newToday() {
			const value = Number(this.teamInfo.newToday)
			return Number.isFinite(value) ? value : 0
		},
		donutStyle() {
			let t = this.teamSize,
				p = t ? Math.min(100, Math.round(this.vipMemberCount / t * 100)) : 0;
			return {
				background: `conic-gradient(#ffd000 0 ${p}%,#0145f1 ${p}% 100%)`
			}
		},
		levelItems() {
			return [
				{
					name: this.$t('teamPage.directLevel', { level: 'A' }),
					count: Number(this.teamInfo.aMemberCount) || 0,
					newCount: Number(this.teamInfo.aTodayNewMemberCount) || 0,
					income: this.teamInfo.aTodayIncome,
					icon: '/static/team/teamA.png'
				},
				{
					name: this.$t('teamPage.level', { level: 'B' }),
					count: Number(this.teamInfo.bMemberCount) || 0,
					newCount: Number(this.teamInfo.bTodayNewMemberCount) || 0,
					income: this.teamInfo.bTodayIncome,
					icon: '/static/team/teamB.png'
				},
				{
					name: this.$t('teamPage.level', { level: 'C' }),
					count: Number(this.teamInfo.cMemberCount) || 0,
					newCount: Number(this.teamInfo.cTodayNewMemberCount) || 0,
					income: this.teamInfo.cTodayIncome,
					icon: '/static/team/teamC.png'
				}
			]
		}
	},
	onLoad(o) {
		this.pageTitle = uni.getStorageSync('pageTitle') || o.title || this.$t('teamPage.management')
	},
	onShow() {
		this.currency = (uni.getStorageSync('settings') || {}).currency || '';
		this.getTeamInfo();
		this.searchMember()
	},
	onReachBottom() {
		if (!this.loading && this.hasMore) {
			this.page.pageNum++;
			this.getMember()
		}
	},
	methods: {
		formatMoney(v) {
			let n = Number(v || 0);
			return Number.isFinite(n) ? n.toFixed(2) : '0.00'
		},
		getTeamInfo() {
			teamApi().then(r => {
				this.teamInfo = r.data || {}
			})
		},
		searchMember() {
			this.page.pageNum = 1;
			this.hasMore = true;
			this.getMember()
		},
		getMember() {
			let ts = ['all', 'member', 'ordinary'];
			this.loading = true;
			teamMemberApi(ts[this.currentTab], this.page, { userAccount: this.userAccount }).then(r => {
				let d = r.data || {},
					l = d.rows || [];
				this.memberList = this.page.pageNum === 1 ? l : this.memberList.concat(l);
				this.nodata = d.total === 0;
				this.hasMore = d.total == null
					? l.length === this.page.pageSize
					: this.memberList.length < Number(d.total)
			}).catch(() => {
				if (this.page.pageNum > 1) this.page.pageNum--
			}).finally(() => {
				this.loading = false
			})
		},
		switchTab(i) {
			if (this.currentTab !== i) {
				this.currentTab = i;
				this.searchMember()
			}
		},
		mtop(e) {
			this.topStyle = `margin-top:-${e}rpx;padding-top:${e}rpx`
		},
		toPage(url) {
			uni.navigateTo({ url })
		},
		toDetails(uid) {
			if (uid) uni.navigateTo({ url: '/pages/TeamPage/details?uid=' + uid })
		},
		tagClass(t) {
			return String(t || '').toLowerCase().includes('intern') ? 'intern' : 'member'
		}
	}
}
</script>

<style scoped lang="scss">
* {
	font-family: MiSans;
}

.team-page {
	min-height: 100vh;
	background: #f1f4ff;
}

.hero {
	box-sizing: border-box;
	background: $themeColor;
	color: #fff;
	overflow: hidden;

	.hero-copy {
		text-align: center;
		margin-top: 44rpx;
		font-size: 28rpx;
	}

	.hero-amount {
		display: flex;
		justify-content: center;
		align-items: baseline;
		margin-top: 18rpx;
		font-family: DingTalk JinBuTi;
		font-size: 48rpx;

		.today {
			margin-left: 18rpx;
			font-size: 22rpx;
			font-style: normal;
			color: #A1FF00;
			font-weight: normal;
		}
	}

	.hero-actions {
		display: flex;
		justify-content: center;
		gap: 20rpx;
		margin-top: 20rpx;

		>view {
			width: 294rpx;
			padding: 12rpx 0;
			border-radius: 10rpx;
			font-family: DingTalk JinBuTi;
			font-size: 28rpx;
			text-align: center;
		}

		.invite-button {
			background: #FFD400;
			color: #000;
		}

		.detail-button {
			background: rgba(255, 255, 255, 0.2);
			color: #fff;
		}
	}

	.tip-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 90rpx;
		margin: 28rpx 24rpx 0;
		padding: 0 16rpx;
		border: 2rpx solid #94c3ff;
		border-radius: 24rpx 24rpx 0 0;
		background: linear-gradient(90deg, #0449e0 0%, #458ffb 100%);
		box-sizing: border-box;

		.tip-title {
			font-family: DingTalk JinBuTi;
			font-size: 26rpx;
			color: #FFD400;
		}

		.tip-description {
			font-size: 20rpx;
			margin-top: 6rpx;
		}

		.tip-link {
			font-size: 24rpx;
			font-weight: 700;
		}
	}
}

.page-body {
	padding: 28rpx 24rpx 50rpx;

	.section-title {
		margin-bottom: 16rpx;
		font-family: DingTalk JinBuTi;
		font-size: 36rpx;
		color: #000;
	}

	.overview-card {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		padding: 18rpx 16rpx 24rpx 18rpx;
		border-radius: 16rpx;
		background: #fff;
		box-sizing: border-box;

		.chart-side {
			display: flex;
			padding-right: 16rpx;
			border-right: 2rpx solid #d4d4d4;
			box-sizing: border-box;
			flex-direction: column;
			align-items: center;

			.donut {
				width: 230rpx;
				height: 230rpx;
				margin-top: 0;
				border-radius: 50%;
				padding: 20rpx;
				box-sizing: border-box;

				.donut-inner {
					display: flex;
					height: 100%;
					flex-wrap: wrap;
					align-content: center;
					justify-content: center;
					border-radius: 50%;
					background: #fff;

					.donut-total {
						font-size: 40rpx;
						line-height: 46rpx;
						color: $themeColor;
					}

					.donut-plus {
						display: flex;
						align-items: end;
						font-size: 22rpx;
						line-height: 32rpx;
						color: #00c947;
					}

					.donut-label {
						width: 100%;
						text-align: center;
						font-size: 28rpx;
						line-height: 34rpx;
						color: #999;
					}
				}
			}

			.chart-legend {
				display: flex;
				justify-content: space-between;
				width: 100%;
				margin-top: 14rpx;
				font-size: 24rpx;
				line-height: 30rpx;

				.member-color {
					color: #e5b800;

					&::before {
						background: #ffd000;
					}
				}

				.intern-color {
					color: $themeColor;

					&::before {
						background: $themeColor;
					}
				}

				.member-color,
				.intern-color {
					display: inline-flex;
					align-items: center;

					&::before {
						content: '';
						display: inline-block;
						width: 16rpx;
						height: 16rpx;
						margin-right: 8rpx;
					}
				}
			}
		}

		.level-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding-left: 30rpx;

			.level-item {
				display: flex;
				align-items: center;

				.level-icon {
					width: 72rpx;
					height: 72rpx;
				}

				.level-main_box {
					flex: 1;
					margin-left: 12rpx;

					.level-main {
						display: flex;
						align-items: center;
						justify-content: space-between;

						.level-count {
							font-size: 32rpx;
							line-height: 44rpx;
							color: $themeColor;
						}

						.level-add {
							float: right;
							font-size: 26rpx;
							line-height: 36rpx;
							color: $themeColor;
						}

						.level-name {
							display: block;
							font-size: 20rpx;
							color: #999;
						}

						.level-income {
							font-size: 20rpx;
							white-space: nowrap;
						}
					}
				}

			}
		}
	}

	.search-card {
		display: flex;
		align-items: center;
		margin-top: 12rpx;
		padding: 6rpx 32rpx 6rpx 8rpx;
		border-radius: 16rpx;
		background: #fff;

		input {
			flex: 1;
			height: 70rpx;
			padding: 0 24rpx;
			border-radius: 14rpx;
			background: #f1f1f1;
			font-size: 30rpx;
		}

		.search-icon {
			width: 48rpx;
			height: 48rpx;
			margin-left: 20rpx;
		}
	}

	.tabs {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin-top: 12rpx;
		padding: 12rpx;
		box-sizing: border-box;
		border-radius: 16rpx;
		background: #fff;

		.tab {
			flex: 1;
			border-radius: 16rpx;
			font-size: 28rpx;
			font-weight: 700;
			line-height: 72rpx;
			text-align: center;

			&.active {
				background: $themeColor;
				color: #fff;
			}
		}
	}

	.user-list {
		margin-top: 16rpx;

		.user-card {
			display: flex;
			align-items: center;
			// height: 136rpx;
			margin-bottom: 16rpx;
			padding: 16rpx;
			border-radius: 20rpx;
			background: #fff;

			.user-avatar {
				width: 102rpx;
				height: 102rpx;
				border: 2rpx solid #d4d4d4;
				border-radius: 10rpx;
			}

			.user-info {
				margin-left: 12rpx;

				.user-name {
					font-size: 32rpx;
					font-weight: 700;
					color: #333;
				}

				.user-tag {
					display: inline-block;
					margin-top: 10rpx;
					padding: 0 8rpx;
					background: #e8f1ff;
					font-size: 22rpx;
					color: $themeColor;

					&.intern {
						background: #fff3ec;
						color: #ff6c26;
					}
				}
			}

			.reward-badge {
				// height: 104rpx;
				margin-left: auto;
				padding: 16rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				box-sizing: border-box;
				border-radius: 20rpx;
				background: #e2efff;
				color: $themeColor;
				text-align: right;

				>view {
					font-family: MiSans;
					font-size: 32rpx;
					font-weight: 600;
					color: #3d3d3d;
				}

				text {
					display: block;
					font-size: 24rpx;
				}

				&.intern {
					background: #fff4ec;
					color: #ff6c26;
				}
			}
		}
	}

	.default_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;

		.default_image {
			width: 466rpx;
			height: 466rpx;
		}

		.text1 {
			font-family: MiSans;
			font-size: 32rpx;
			font-weight: 500;
		}

		.text2 {
			font-family: MiSans;
			font-size: 28rpx;
			color: #A1A1A1;
		}

		.btn {
			font-family: MiSans;
			font-size: 24rpx;
			padding: 16rpx 24rpx;
			min-width: 442rpx;
			border-radius: 8rpx;
			background: #0145F1;
			text-align: center;
			color: #fff;
		}
	}
}
</style>
