<template>
	<customnavbar :title="$t('pages.FinancialProducts')">
		<view class="product-container">
			<view class="product-list">
				<view class="product-item">
					<!-- 第一行 -->
					<view class="header-row">
						<image class="product-image" :src=" productDetails.image" mode="aspectFit"></image>
						<view class="header-row_text">
							<text class="product-name">{{productDetails.productName}}</text>
							<text class="product-status"
								:class="productDetails.status === 'In Progress' ? 'themeColor' : 'gray'">{{productDetails.status}}</text>
							<!-- :style="{'color': productDetails.status == 'In Progress' ? '$themeColor' : '#999'}" -->
						</view>
					</view>

					<view class="item_box bg_gray">
						<view class="item_title">
							{{$t('product.PurchaseAmount')}}
						</view>
						<view class="item_desc">
							{{productDetails.purchaseAmount}} {{ currency }}
						</view>
					</view>
					<view class="item_box">
						<view class="item_title">
							{{$t('product.DailyRateOfReturn')}}:
						</view>
						<view class="item_desc">
							{{productDetails.dailyRateOfReturnStr}}
						</view>
					</view>
					<view class="item_box bg_gray">
						<view class="item_title">
							{{$t('product.ExpectedReturn')}}
						</view>
						<view class="item_desc">
							{{productDetails.expectedReturn}} {{ currency }}
						</view>
					</view>
					<!-- 进行中 -->
					<view class="item_box" v-if="productDetails.status === 'In Progress'">
						<view class="item_title">
							{{$t('product.ExpectedEarnings')}}
						</view>
						<view class="item_desc">
							{{productDetails.expectedEarnings || 0}} {{ currency }}
						</view>
					</view>
					<!-- 已结束 -->
					<view class="item_box" v-else>
						<view class="item_title">
							{{$t('product.CurrentEarnings')}}
						</view>
						<view class="item_desc">
							{{productDetails.currentEarnings || 0}} {{ currency }}
						</view>
					</view>
					<view class="item_box bg_gray">
						<view class="item_title">
							{{$t('product.PurchaseTime')}}
						</view>
						<view class="item_desc">
							{{productDetails.purchaseTime}}
						</view>
					</view>
					<view class="item_box">
						<view class="item_title">
							{{$t('product.ExpirationTime')}}
						</view>
						<view class="item_desc">
							{{productDetails.expirationTime}}
						</view>
					</view>
				</view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import listbottom from '../../component/list-bottom/list_bottom.vue'
	import {
		productMyApi
	} from '@/common/api/product.js'
	export default {
		components: {
			customnavbar: customnavbar,
			listbottom: listbottom
		},
		data() {
			return {
				url: 'http://13.245.95.135:8888',
				// url: 'http://192.168.2.35:8080',
				currency: '',
				loading: false,
				productDetails: {},
			}
		},
		methods: {
			getProductInfo() {
				productMyApi(this.productId).then((res) => {
					this.productDetails = res.data
				}).catch((err) => {
					this.$showMessage('warning', err.msg);
					// uni.showToast({
					// 	title: err.msg,
					// 	icon: 'none'
					// })
				})
			}
		},
		onLoad(options) {
			this.productId = options.productId
			this.currency = uni.getStorageSync('settings').currency
		},
		onShow() {
			this.getProductInfo()
		}
	}
</script>

<style scoped lang="scss">
	.themeColor {
		color: $themeColor !important;
	}

	.gray {
		color: #999 !important;
	}

	.product-list {
		padding: 50rpx;
	}

	.product-item {
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 18rpx;
		border: 2rpx solid #F8F8F8;
		margin-bottom: 40rpx;
	}

	.header-row {
		display: flex;
		align-items: center;
		padding: 40rpx 40rpx 28rpx;
		border-bottom: 1rpx solid #eee;
	}

	.product-image {
		width: 120rpx;
		height: 120rpx;
		margin-right: 40rpx;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.header-row_text {
		display: flex;
		flex-direction: column;
		align-items: start;
		justify-content: space-between;
		height: 120rpx;
	}

	.product-name {
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #1C2D57;
		line-height: 42rpx;
		text-align: left;
		font-style: normal;
	}

	.product-status {
		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: $themeColor;
		line-height: 40rpx;
		text-align: center;
		font-style: normal;
	}

	.arrow-right {
		color: #999;
		font-size: 32rpx;
	}

	.info-rows {
		padding: 20rpx 0;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 15rpx;
	}

	.label {
		color: #666;
		font-size: 28rpx;
	}

	.value {
		color: #333;
		font-size: 28rpx;
		font-weight: 500;
	}

	.detail-button-wrapper {
		text-align: center;
		padding-top: 20rpx;
	}

	.detail-button {
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		text-align: left;
		font-style: normal;
		text-transform: none;
	}

	.bg_gray {
		background: #F5F8FF;
	}

	.border_bottom {
		border-bottom: 2rpx solid #F4F4F4;
	}

	.item_box {
		padding: 32rpx 40rpx 28rpx 40rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.item_title {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #1C2D57;
		line-height: 34rpx;
		text-align: left;
		font-style: normal;
	}

	.item_desc {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #000000;
		line-height: 36rpx;
		text-align: left;
		font-style: normal;
	}
</style>