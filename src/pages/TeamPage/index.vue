<template>
	<customnavbar :title="pageTitle" backgroundStr="url('/static/team/team_bg.png') top left/100%  no-repeat"
		@mtop="mtop" :whiteTitle="true" @scrolltolower="onLower">
		<view>
			<view class="team_top_bg" :style="topStyle">
				<!-- 数据展示区域 -->
				<view class="data-section">
					<view class="data-grid">
						<view class="data-item">
							<view class="data-value">{{ teamInfo.teamSize || 0 }}</view>
							<view class="data-label">{{ $t('team.Teamsize') }}</view>
						</view>
						<view class="data-item">
							<!-- <view class="data-value">{{ teamInfo.member || 0}}</view> -->
							<!-- <view class="data-label">{{$t('team.Member')}}</view> -->
							<view class="data-value">{{ teamInfo.dailyEarnings || 0 }}</view>
							<view class="data-label">{{ $t('team.TodayEarnings') }}</view>
						</view>
						<view class="data-item">
							<view class="data-value">{{ teamInfo.newToday || 0 }}</view>
							<view class="data-label">{{ $t('team.Newtoday') }}</view>
						</view>
						<view class="data-item">
							<view class="data-value">{{ teamInfo.cumulativeIncome || 0 }}</view>
							<view class="data-label">{{ $t('team.Cumulativeincome') }}</view>
						</view>
						<view class="data-item">
							<view class="data-value">{{ teamInfo.directMember || 0 }}</view>
							<view class="data-label">{{ $t('team.Directmember') }}</view>
						</view>
						<view class="data-item">
							<view class="data-value">{{ teamInfo?.joinTime?.split(' ')[0] || 0 }}</view>
							<view class="data-label">{{ $t('team.Jointime') }}</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 时间段选择器 -->
			<!-- <view class="tab-header tab-headerDate">
				<view class="tab-item" v-for="(tab, index) in tabsDate" :key="index"
					:class="{ 'active': currentDateTab === index }" @click="switchDateTab(index)">
					{{ tab }}
				</view>
			</view> -->
			<!-- Tab选项卡区域 -->
			<view class="tab-section">
				<view class="search-box">
					<input type="text" v-model="userAccount" :placeholder="$t('team.placeholder')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
					<image class="search-img" src="/static/search.png" alt="" srcset="" @click="searchMember()" />
				</view>
				<view class="tab-header">
					<view class="tab-item" v-for="(tab, index) in tabs" :key="index"
						:class="{ 'active': currentTab === index }" @click="switchTab(index)">
						{{ tab }}
					</view>
				</view>

				<!-- 内容区域 -->
				<scroll-view scroll-y="true" direction="vertical" style="height: 714rpx;"
					@scrolltolower="onReachBottom">
					<view class="content-section">
						<view class="user-list">
							<view class="user-item" v-for="(user, index) in memberList" :key="index"
								@click="toDetails(user.uid)">
								<view style="display: flex;align-items: center;">
									<image :src="user.image" alt="" class="user-ava" />
									<view>
										<view class="user-item-t1">{{ user.username }}</view>
										<view class="user-item-t2">
											{{ $t('team.joinTime') }}:{{ (user.joinTime).split(' ')[0] }}
										</view>
									</view>
								</view>
								<view>
									<view class="user-item-t3">{{ user.type }}</view>
									<view class="user-item-t4">{{ user.income }} {{ currency }}</view>
								</view>

							</view>
						</view>
						<view class="list_status_box" :style="{ 'auto': '800rpx' }">
							<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
								image="/static/default/No content.png" :title="$t('default.NoContent')"
								:text="$t('default.NoContentText')"></listbottom>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	teamApi,
	teamMemberApi
} from '@/common/api/team.js'
export default {
	components: {
		customnavbar,
		listbottom
	},
	data() {
		return {
			pageTitle: '',
			currency: '',
			teamInfo: {
				joinTime: ''
			},
			// currentDateTab: 0,
			currentTab: 0,
			userAccount: '',
			memberList: [],
			topStyle: 0,
			nodata: false,
			hasMore: true,
			loading: false,
			page: {
				pageNum: 1,
				pageSize: 10
			},
		}
	},
	computed: {
		tabs() {
			return [this.$t('team.All'), this.$t('team.VIP'), this.$t('team.Ordinary')]
		},
		// tabsDate() {
		// 	return [this.$t('一天'), this.$t('七天'), this.$t('一个月'), this.$t('全部')]
		// }
	},
	onShow() {

		this.currency = uni.getStorageSync('settings').currency
		this.getTeamInfo()
		this.getMember()
	},
	onLoad(options) {
		if (uni.getStorageSync('pageTitle')) {
			this.pageTitle = uni.getStorageSync('pageTitle')
		} else {
			this.pageTitle = options.title
		}
	},

	methods: {
		getTeamInfo() {
			// let timeRange = ''
			// switch (this.currentDateTab) {
			// 	case 0:
			// 		timeRange = 'oneDay'
			// 		break;
			// 	case 1:
			// 		timeRange = 'sevenDay'
			// 		break;
			// 	case 2:
			// 		timeRange = 'oneMonth'
			// 		break;
			// 	case 3:
			// 		timeRange = 'all'
			// 		break;
			// 	default:
			// 		break;
			// }
			teamApi().then((res) => {
				this.teamInfo = res.data
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);

				// uni.showToast({

				// 	title: err.msg,

				// 	icon: 'none'

				// })
			})
		},
		searchMember() {
			this.memberList = []
			this.hasMore = true
			this.page.pageNum = 1
			this.getMember()
		},
		getMember() {
			let type = ''
			switch (this.currentTab) {
				case 0:
					type = 'all'
					break;
				case 1:
					type = 'member'
					break;
				case 2:
					type = 'ordinary'
					break;
				default:
					break;
			}
			// let timeRange = ''
			// switch (this.currentDateTab) {
			// 	case 0:
			// 		timeRange = 'oneDay'
			// 		break;
			// 	case 1:
			// 		timeRange = 'sevenDay'
			// 		break;
			// 	case 2:
			// 		timeRange = 'oneMonth'
			// 		break;
			// 	case 3:
			// 		timeRange = 'all'
			// 		break;
			// 	default:
			// 		break;
			// }
			this.loading = true
			let params = {
				userAccount: this.userAccount
			}
			teamMemberApi(type, this.page, params).then((res) => {
				this.loading = false
				if (this.page.pageNum == 1) this.memberList = res.data.list || []
				else this.memberList.push(...res.data.list)
				this.nodata = res.data.total == 0
				this.hasMore = this.memberList.length != res.data.total
			}).catch((err) => {
				this.loading = false
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);

				// uni.showToast({

				// 	title: err.msg,

				// 	icon: 'none'

				// })
			})
		},
		// 切换选项卡
		switchTab(index) {
			if (this.currentTab == index) return
			this.memberList = []
			this.hasMore = true
			this.currentTab = index
			this.page.pageNum = 1
			this.getMember()
		},
		// 切换时间段
		// switchDateTab(index) {
		// 	if (this.currentDateTab == index) return
		// 	this.memberList = []
		// 	this.hasMore = true
		// 	this.currentDateTab = index
		// 	this.page.pageNum = 1
		// 	this.getMember()
		// 	this.getTeamInfo()
		// },
		mtop(e) {
			// #ifdef H5
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + e + "rpx"
			// #endif
		},
		toDetails(uid) {
			uni.navigateTo({
				url: '/pages/TeamPage/details?uid=' + uid
			})
		},
		onReachBottom() {
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getMember()
			}
		}
	}
}
</script>

<style scoped lang="scss">
::v-deep .default_box {
	margin-top: 0;
}

.team_top_bg {
	width: 100%;
	background: url('/static/team/team_bg.png') top left/100% no-repeat;
}



.data-section {
	width: 650rpx;
	background: #FFFFFF;
	box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 40rpx;
	margin: 54rpx 50rpx 0 50rpx;
	padding: 28rpx 0 0 0;

}

.data-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
}

.data-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 38rpx;
}

.data-value {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 28rpx;
	color: #000000;
	line-height: 46rpx;
	text-align: center;
	font-style: normal;
	/* margin-bottom: 10rpx; */
}

.data-label {
	/* min-width: 60rpx; */
	max-width: 122rpx;
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 24rpx;
	color: #1C2D57;
	line-height: 30rpx;
	text-align: center;
	font-style: normal;
	height: 60rpx;
	display: flex;
	align-items: center;
}

.tab-section {
	margin-top: 10rpx;
	padding: 50rpx;
	padding-bottom: 0;
}

.tab-header {
	display: flex;
	margin-top: 70rpx;
	margin-bottom: 40rpx;

	.tab-item {
		flex: 1;
		height: 70rpx;
		text-align: center;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 28rpx;
		color: #B1B1B1;
		line-height: 70rpx;
		text-align: center;
		font-style: normal;
	}

	&.tab-headerDate {
		margin-top: 50rpx;
		background-color: #fff;

		.tab-item {
			flex: auto;
			height: 90rpx;
			line-height: 90rpx;
			color: #000;
			margin: 0 10rpx;

			&.active {
				border-radius: 0;
				background: transparent;
				box-shadow: 0rpx 4rpx 16rpx 0rpx transparent;
				border-bottom: 4rpx solid $themeColor;
			}
		}
	}
}



.tab-item.active {
	background: $themeColor;
	box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
	border-radius: 36rpx;
	color: #FFFFFF;
}

.search-box {
	position: relative;
}

.search-img {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 40rpx;
	height: 40rpx;
}

.search-box input {
	height: 70rpx;
	background: #FFFFFF;
	box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 36rpx;
	border: 2rpx solid #F6F6F6;
	padding: 0 52rpx;
}

.user-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #FFFFFF;
	box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 32rpx;
	border: 2rpx solid #F6F6F6;
	margin-bottom: 30rpx;
	padding: 40rpx 30rpx;

}

.user-ava {
	width: 96rpx;
	height: 96rpx;
	box-shadow: 0rpx 40rpx 80rpx 0rpx rgba(0, 0, 0, 0.04);
	border-radius: 30rpx;
	margin-right: 20rpx;
	background-color: #ebf5ff;
	overflow: hidden;
}

.user-item-t1 {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 28rpx;
	color: #1C2D57;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
	text-transform: none;
}

.user-item-t2 {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 22rpx;
	color: #1C2D57;
	line-height: 28rpx;
	text-align: left;
	font-style: normal;
	text-transform: none;
	margin-top: 32rpx;
}

.user-item-t3 {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 24rpx;
	color: #CDCDCD;
	line-height: 30rpx;
	text-align: right;
	font-style: normal;
}

.user-item-t4 {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 28rpx;
	color: $themeColor;
	line-height: 36rpx;
	text-align: right;
	font-style: normal;
	text-transform: none;
	margin-top: 28rpx;
}

.list_status_box {
	position: relative;
}
</style>