<template>
	<customnavbar :title="pageTitle" @mtop="mtop">
		<view class="bill-record">
			<view class="bill-record-content" :style="topStyle">
				<!-- 标签卡切换 -->
				<view class="tabs">
					<view v-for="(item, index) in tabs" :key="index"
						:class="['tab-item', currentTab === index ? 'active' : '']" @click="switchTab(index)">
						{{ item }}
					</view>
				</view>

				<!-- <view class="list"> -->
				<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
					@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
					class="scroll-view-box list">
					<view class="hint_box">
						<image src="/static/hint_img.png" class="hint_img"></image>
						{{ $t('show7Days') }}
					</view>
					<view class="list-item" v-for="(item, index) in billsList" :key="index"
						@click="pushInfo(currentTab, item.id)">
						<view class="item-left" v-if="currentTab == 3">
							<view class="item-left-t1">
								<view>{{ item.amount + item.fee }} {{ currency }}</view>
								<view class="item-left-t2">{{ $t('包含手续费') }}{{ item.fee * usdtRateOut || 0 }}
									{{ actualCurrency }}
								</view>
							</view>
							<view class="FAIL" v-if="item.status == 'REVIEW_FAILED'">{{ item.status }}</view>
							<view class="SUCCESS" v-if="item.status == 'SUCCESS'">{{ item.status }}</view>
							<view class="FAIL" v-if="item.status == 'FAIL'">{{ item.status }}
							</view>
							<view class="PROCESSING" v-if="item.status == 'PAID'">
								{{ $t('批准待付') }}
							</view>
							<view class="PROCESSING" v-if="item.status == 'REVIEW_SUCCESS'">
								{{ $t('批准待付') }}
							</view>
							<view class="PROCESSING" v-if="item.status == 'PENDING_REVIEW'">{{ item.status }}</view>
							<view class="item-left-t2">{{ item.tradeNo }}</view>
						</view>
						<view class="item-left" v-else>
							<view class="item-left-t1">{{ item.amount }} {{ currency }}</view>
							<view class="PROCESSING" v-if="item.status == 'PENDING_REVIEW'">{{ item.status }}</view>
							<view class="PROCESSING" v-if="item.status == 'PROCESSING'">{{ item.status }}</view>
							<view class="SUCCESS" v-if="item.status == 'SUCCESS'">{{ item.status }}</view>
							<view class="FAIL" v-if="item.status == 'unknown'">FAIL</view>
							<view class="FAIL" v-if="item.status == 'FAIL'">{{ item.status }}</view>
							<view class="item-left-t2">{{ item.tradeNo }}</view>
						</view>
						<view class="item-right">
							<view
								style="height: 114rpx;display: flex;flex-direction: column;align-items: end;justify-content: space-between;">
								<view class="item-right-t1">{{ item.typeName }}</view>
								<view class="item-right-t2">{{ item.operationTime }}</view>
							</view>
							<image v-if="currentTab == 3" class="right-icon" src="/static/back_icon.png" mode="">
							</image>
						</view>

					</view>
					<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
						image="/static/default/No bank card.png"></listbottom>
				</scroll-view>
				<!-- </view> -->

				<!-- 列表内容 -->
				<!-- <view class="list-content"> -->
				<!-- 收入列表 -->


				<!-- </view> -->
			</view>
		</view>

		<uni-popup ref="promptpopup" type="center" :mask-click="false" style="z-index: 9999;">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ $t('show7Days') }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm_yes">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>

	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	financialRecordsApi
} from '@/common/api/deposit.js'
export default {
	components: {
		customnavbar: customnavbar,
		listbottom: listbottom
	},
	data() {
		return {
			pageTitle: '',
			currency: '',
			currentTab: 0,
			tabs: [],
			billsList: [],
			page: {
				pageNum: 1,
				pageSize: 10
			},
			nodata: false,
			hasMore: true,
			loading: false,
			topStyle: 0,
			isRefreshing: false,
			usdtRateOut: '',
			actualCurrency: ''
		}
	},
	methods: {
		pushInfo(currentTab, id) {
			if (currentTab == 3) {
				uni.navigateTo({
					url: '/pages/MinePage/withdrawalInfo?id=' + id
				})
			}
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
			// #endif
		},
		switchTab(index) {
			this.page.pageNum = 1
			this.nodata = false
			this.hasMore = true
			this.loading = false
			this.currentTab = index
			this.getList()
		},
		showFilter() {
			// 显示筛选弹窗
		},
		getList() {
			// this.$showMessage('warning', 'Too many users are querying, please try again later');
			// return
			// 根据currentTab获取对应列表数据
			let type = ''
			switch (this.currentTab) {
				case 0:
					// 获取收入列表
					type = 'revenue'
					break
				case 1:
					// 获取支出列表
					type = 'expenditure'
					break
				case 2:
					// 获取充值列表
					type = 'deposit'
					break
				case 3:
					// 获取提现列表
					type = 'withdrawal'
					break
			}
			this.loading = true
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			financialRecordsApi(type, this.page).then((res) => {
				this.loading = false
				if (this.page.pageNum == 1) this.billsList = res.rows || []
				else this.billsList.push(...res.rows)
				this.nodata = res.total == 0
				if (this.billsList.length == res.total) this.hasMore = false

			}).catch((err) => {
				console.log('request fail', err);
				this.loading = false
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})

		},
		onRefresh() {
			this.isRefreshing = true;
			this.page.pageNum = 1
			this.nodata = false
			this.hasMore = true
			this.loading = false
			this.getList()
			setTimeout(() => {
				this.isRefreshing = false
			}, 500)
		},
		onReachBottom() {
			// console.log('加载')
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getList()
			}
		},
		prompt_confirm_yes() {
			this.$refs.promptpopup.close()
		}
	},
	onLoad(options) {
		if (uni.getStorageSync('pageTitle')) {
			this.pageTitle = uni.getStorageSync('pageTitle')
		} else {
			this.pageTitle = options.title
		}
		if (options.currentTab) {
			this.currentTab = +options.currentTab
		}
		this.currency = uni.getStorageSync('settings').currency
		this.tabs = [this.$t('bills.Revenue'), this.$t('bills.Expenditure'), this.$t('bills.Deposit'), this.$t(
			'bills.Withdrawal')]
		this.getList()
		// this.$nextTick(() => {
		// 	this.$refs.promptpopup.open()
		// })
		this.usdtRateOut = uni.getStorageSync('settings').usdtRateOut
		this.actualCurrency = uni.getStorageSync('settings').actualCurrency
	}
}
</script>

<style lang="scss" scoped>
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

.scroll-view-box {
	// min-height: 0;
	flex: 1;
	height: 1px;
}

.bill-record {
	height: 100%;

	.bill-record-content {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
		padding: 24rpx 40rpx 40rpx 40rpx;
		padding-bottom: 0;

		.tabs {
			display: flex;
			background: #fff;
			justify-content: center;

			.tab-item {
				position: relative;
				font-family: "DINPro-Regular", sans-serif;
				font-weight: 400;
				font-size: 26rpx;
				color: #000000;
				line-height: 70rpx;
				text-align: center;
				font-style: normal;
				height: 70rpx;
				width: 168rpx;

				&.active {
					color: #FFFFFF;
					font-weight: 600;
					background: $themeColor;
					box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
					border-radius: 36rpx;
				}
			}
		}

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

		.filter-btn {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			padding: 20rpx 0;

			.iconfont {
				margin-left: 10rpx;
			}
		}

		.list-content {
			padding-top: 40rpx;
			overflow: scroll;

			-ms-overflow-style: none;
			/* IE and Edge */
			scrollbar-width: none;


			.bill-record::-webkit-scrollbar {
				display: none;
				/* Chrome, Safari and Opera */
			}
		}

		.list {
			flex: 1;
			height: 1px;
			padding-top: 40rpx;

			.list-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				background: #FFFFFF;
				box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
				border-radius: 32rpx;
				border: 2rpx solid #F6F6F6;
				padding: 34rpx 40rpx 42rpx;
				margin-bottom: 30rpx;

				.item-left {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					height: 114rpx;

					.item-left-t1 {
						font-family: "DINPro-Bold", sans-serif;
						font-weight: bold;
						font-size: 28rpx;
						color: $themeColor;
						line-height: 36rpx;
						text-align: left;
						font-style: normal;
					}

					.PROCESSING {
						color: #e37318;
						font-size: 24rpx;
					}

					.SUCCESS {
						color: #07c160;
						font-size: 24rpx;
					}

					.FAIL {
						color: #ff4d4f;
						font-size: 24rpx;
					}

					.item-left-t2 {
						font-family: "DINPro-Regular", sans-serif;
						font-weight: 400;
						font-size: 24rpx;
						color: #999999;
						line-height: 30rpx;
						text-align: left;
						font-style: normal;
						// margin-top: 34rpx;
					}
				}

				.item-right {
					display: flex;
					// flex-direction: column;
					align-items: center;
					justify-content: space-between;
					height: 114rpx;

					.right-icon {
						width: 48rpx;
						height: 48rpx;
						transform: rotate(180deg);
						margin-right: -24rpx;
					}

					.item-right-t1 {
						font-family: "DINPro-Regular", sans-serif;
						font-weight: 400;
						font-size: 24rpx;
						color: #000000;
						line-height: 30rpx;
						text-align: right;
						font-style: normal;
					}

					.item-right-t2 {
						font-family: "DINPro-Regular", sans-serif;
						font-weight: 400;
						font-size: 24rpx;
						color: #999999;
						line-height: 30rpx;
						text-align: right;
						font-style: normal;
						// margin-top: 34rpx;
					}
				}

				.amount {
					font-size: 32rpx;
					font-weight: bold;

					&.income,
					&.recharge {
						color: #07c160;
					}

					&.expense,
					&.withdraw {
						color: #ff4d4f;
					}
				}
			}
		}
	}
}
</style>