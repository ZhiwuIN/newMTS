<template>
	<customnavbar :title="$t('team.title')">
		<view>
			<view class="team_top_bg">
				<view class="team-user-info">
					<image :src="memberInfo.image" class="team-user-info-img"></image>
					<view class="team-user-info-right">
						<view>
							<view class="team-user-info-right-t1">{{ memberInfo.username }}</view>
							<view class="team-user-info-right-t2">{{ $t('team.joinTime') }}: {{ memberInfo.joinTime }}
							</view>
						</view>
						<view>
							<view class="team-user-info-right-t3">{{ memberInfo.levelName }}</view>
							<view class="team-user-info-right-t4">{{ memberInfo.income }} {{ memberInfo.currency }}
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="record-title">
				Rebate Record
			</view>
			<view class="record-list">
				<view class="hint_box">
					<image src="/static/hint_img.png" class="hint_img"></image>
					{{ $t('show7Days') }}
				</view>
				<view class="record-list-item" v-for="(item, index) in memberRebateRecordList" :key="index">
					<view>
						<view class="record-item-t1">{{ item.income }} {{ item.currency }}</view>
						<view class="record-item-t2">{{ item.tradeNo }}</view>
					</view>
					<view>
						<view class="record-item-t3">{{ item.typeName }}</view>
						<view class="record-item-t4">{{ item.tradeTime }}</view>
					</view>

				</view>
			</view>

			<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'></listbottom>
		</view>
	</customnavbar>

	<uni-popup ref="promptpopup" type="center" :mask-click="false" style="z-index: 9999;">
		<view class="prompt_pop_page">
			<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
			<view class="prompt_pop_taps">{{ $t('show7Days') }}</view>
			<view class="prompt_pop_bottom">
				<button class="prompt_confirm_btn" @click="prompt_confirm_yes">{{ $t('pay.yes') }}</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	memberInfoApi,
	memberRebateRecordApi
} from '@/common/api/team.js'
export default {
	components: {
		customnavbar: customnavbar,
		listbottom: listbottom
	},
	data() {
		return {
			memberInfo: {},
			memberRebateRecordList: [],
			nodata: false,
			hasMore: true,
			loading: false,
			page: {
				pageNum: 1,
				pageSize: 10
			},
		}
	},
	onLoad(options) {
		this.memberId = options.uid
		// this.$nextTick(() => {
		// 	this.$refs.promptpopup.open()
		// })
	},
	onShow() {
		this.getMemberInfo()
		this.getMemberRebateRecord()
	},
	methods: {
		getMemberInfo() {
			memberInfoApi(this.memberId).then((res) => {
				this.memberInfo = res.data
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				// uni.showToast({
				// 	title: err.msg,
				// 	icon: 'none'
				// })
			})
		},
		getMemberRebateRecord() {
			memberRebateRecordApi(this.memberId, this.page).then((res) => {
				this.loading = false
				if (this.page.pageNum == 1) this.memberRebateRecordList = res.rows || []
				else this.memberRebateRecordList.concat(res.rows)
				this.memberRebateRecordList = res.rows || []
				this.nodata = res.total == 0
				this.hasMore = this.memberRebateRecordList.length != res.total
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				// uni.showToast({
				// 	title: err.msg,
				// 	icon: 'none'
				// })
			})
		},
		onReachBottom() {
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getMemberRebateRecord()
			}
		},
		prompt_confirm_yes() {
			this.$refs.promptpopup.close()
		}
	}
}
</script>

<style scoped lang="scss">
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
		box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 16rpx;
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

.team_top_bg {
	width: 100%;
	background: url('/static/team/team_bg.png') top left/100% no-repeat;
	padding: 76rpx 0;
}


.team-user-info {
	display: flex;
	width: 100%;
}

.team-user-info-img {
	width: 96rpx;
	height: 96rpx;
	border-radius: 30rpx;
	border: 2rpx solid #FFFFFF;
	margin-left: 74rpx;
	background-color: #ebf5ff;
	overflow: hidden;
}

.team-user-info-right {
	margin-left: 38rpx;
	display: flex;
	justify-content: space-between;
	flex: 1;
	margin-right: 70rpx;
}

.team-user-info-right-t1 {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 28rpx;
	color: #FFFFFF;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
	text-transform: none;
}

.team-user-info-right-t2 {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 22rpx;
	color: #FFFFFF;
	line-height: 28rpx;
	text-align: left;
	font-style: normal;
	text-transform: none;
	margin-top: 28rpx;
}

.team-user-info-right-t3 {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 24rpx;
	color: #FFFFFF;
	line-height: 30rpx;
	text-align: right;
	font-style: normal;
}

.team-user-info-right-t4 {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	text-align: right;
	font-style: normal;
	text-transform: none;
	margin-top: 24rpx;
}

.record-title {
	font-family: "DINPro-Black", sans-serif;
	font-weight: 500;
	font-size: 28rpx;
	color: #000000;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
	margin: 42rpx 0 28rpx 40rpx;
}

.record-list {
	padding: 0 40rpx 40rpx 40rpx;

	.hint_box {
		display: flex;
		align-items: center;
		gap: 6rpx;
		font-size: 24rpx;
		color: #333;
		margin-bottom: 24rpx;

		.hint_img {
			width: 32rpx;
			height: 32rpx;
		}
	}

}

.record-list-item {
	background: #FFFFFF;
	box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 32rpx;
	border: 2rpx solid #F6F6F6;
	margin-bottom: 30rpx;
	padding: 34rpx 40rpx 42rpx 40rpx;
	display: flex;
	justify-content: space-between;
}



.record-item-t1 {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 28rpx;
	color: $themeColor;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
}

.record-item-t2 {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 24rpx;
	color: #999999;
	line-height: 30rpx;
	text-align: left;
	font-style: normal;
	margin-top: 34rpx;
}

.record-item-t3 {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 24rpx;
	color: #000000;
	line-height: 30rpx;
	text-align: right;
	font-style: normal;
}

.record-item-t4 {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 24rpx;
	color: #999999;
	line-height: 30rpx;
	text-align: right;
	font-style: normal;
	margin-top: 34rpx;
}
</style>