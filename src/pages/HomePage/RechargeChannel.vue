<template>
	<customnavbar :title="$t('充值通道')" @mtop="mtop">
		<view class="bill-record">
			<view class="bill-record-content" :style="topStyle">
				<view class="scroll-view-box list">
					<view class="list-item" v-for="(item, index) in billsList" :key="index" @click="toPage(item.id)">
						<image :src=" item.image" mode="" class="item_img"></image>
						<view class="item-right">
							<view>
								<view class="item-productName">{{item.channel}}</view>
							</view>
							<view class="item-foot" v-if="item.min && item.max">
								<view style="text-align: left;">{{$t('充值限额')}}</view>
								<view>{{item.min}}~{{item.max}}{{actualCurrency}}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		depositListApi
	} from '@/common/api/deposit.js'
	export default {
		components: {
			customnavbar,
		},
		data() {
			return {
				billsList: [],
				page: {
					pageNum: 1,
					pageSize: 10
				},
				source: '',
				amount: '',
				actualCurrency: '', // 实际货币单位
			}
		},
		methods: {
			toPage(id) {
				const query = [
					`id=${encodeURIComponent(id)}`,
					this.source ? `source=${encodeURIComponent(this.source)}` : '',
					this.amount ? `amount=${encodeURIComponent(this.amount)}` : '',
				].filter(Boolean).join('&')
				uni.navigateTo({
					url: `/pages/HomePage/rechargePage?${query}`
				})
			},
			mtop(e) {
				// #ifdef H5
				this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
				// #endif
			},
			getList() {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				depositListApi().then((res) => {
					this.billsList = res.data || []
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})

			},
		},
		onLoad(options = {}) {
			this.source = options.source || ''
			this.amount = options.amount || ''
			this.getList()
			this.actualCurrency = uni.getStorageSync('settings').actualCurrency
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
					gap: 30rpx;
					// justify-content: space-between;
					align-items: center;
					background: #FFFFFF;
					// box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
					border-radius: 16rpx;
					border: 2rpx solid rgb(228, 228, 228);
					padding: 30rpx;
					margin-bottom: 30rpx;

					.item_img {
						width: 160rpx;
						height: 160rpx;
						background: #F5FAFF;
						border-radius: 18rpx;
					}

					.item-right {
						flex: 1;
						display: flex;
						flex-direction: column;
						height: 160rpx;
						justify-content: space-between;
					}

					.item-productName {
						font-family: DINPro, DINPro;
						font-weight: 500;
						font-size: 32rpx;
						color: #000000;
						margin-bottom: 20rpx;
					}

					.item-pointsUsed {
						display: flex;
						align-items: center;
						gap: 10rpx;
						font-family: DINPro, DINPro;
						font-weight: 500;
						font-size: 28rpx;
						color: #FFBD56;
					}

					.image-pointsUsed {
						width: 34rpx;
						height: 34rpx;
					}

					.item-foot {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						font-family: DINPro, DINPro;
						font-weight: 400;
						font-size: 24rpx;
						color: #999999;

						.inProgress {
							color: $themeColor;
						}

						.Completed {
							color: #999;
						}
					}
				}
			}
		}
	}
</style>
