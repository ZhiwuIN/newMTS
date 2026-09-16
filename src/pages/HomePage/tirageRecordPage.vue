<template>
	<customnavbar :title="$t('获奖记录')" @mtop="mtop">
		<view class="bill-record">
			<view class="bill-record-content" :style="topStyle">
				<!-- 列表内容 -->
				<!-- <view class="list-content"> -->
				<!-- 获奖列表 -->
				<!-- <view class="list"> -->
				<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
					@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
					class="scroll-view-box list">
					<view class="list-item" v-for="(item, index) in billsList" :key="index">
						<view class="item-left">
							<view class="item-left-t1">{{item.resultDescribed}}</view>
							<view class="item-left-t2">{{item.module}}</view>
						</view>
						<view class="item-right">
							<view class="item-right-t1">{{item.date}}</view>
							<view class="item-right-t2">{{item.type}}</view>
						</view>

					</view>
					<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
						image="/static/default/No content.png"></listbottom>
				</scroll-view>
				<!-- </view> -->

				<!-- </view> -->
			</view>
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import listbottom from '../../component/list-bottom/list_bottom.vue'
	import {
		luckyRecordMyApi
	} from "@/common/api/home.js";
	export default {
		components: {
			customnavbar: customnavbar,
			listbottom: listbottom
		},
		data() {
			return {
				billsList: [],
				page: {
					pageNum: 1,
					pageSize: 10
				},
				nodata: false,
				hasMore: true,
				loading: false,
				topStyle: 0,
				isRefreshing: false
			}
		},
		methods: {
			mtop(e) {
				// #ifdef H5
				this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
				// #endif
			},
			switchTab() {
				this.page.pageNum = 1
				this.nodata = false
				this.hasMore = true
				this.loading = false
				this.getList()
			},
			getList() {
				this.loading = true
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				luckyRecordMyApi(this.page).then((res) => {
					this.loading = false
					if (this.page.pageNum == 1) this.billsList = res.data.rows || []
					else this.billsList.push(...res.data.rows)
					this.nodata = res.data.total == 0
					if (this.billsList.length == res.data.total) this.hasMore = false

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
			}
		},
		onLoad() {
			this.getList()
		},
	}
</script>

<style lang="scss" scoped>
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
			padding: 24rpx 40rpx 40rpx 40rpx;
			padding-bottom: 0;

			.list-content {
				// padding-top: 40rpx;
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
							color: #000000;
							line-height: 30rpx;
							text-align: left;
							font-style: normal;
							// margin-top: 34rpx;
						}
					}

					.item-right {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						height: 114rpx;

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