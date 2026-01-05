<template>
	<customnavbar :title="pageTitle" :isFinancePage="true" @mtop="mtop">
		<view class="product-container">
			<view class="product-list" :style="topStyle">
				<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
					@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
					style="flex: 1;height: 1px;">
					<view class="product-item" v-for="(item, index) in productList" :key="index">
						<!-- 第一行 -->
						<view class="header-row">
							<image class="product-image" :src=" item.image" mode="aspectFit"></image>
							<text class="product-name">{{item.productName}}</text>
						</view>

						<view class="item_box bg_gray">
							<view class="item_title">
								{{$t('product.StartingAmount')}}
							</view>
							<view class="item_desc">
								{{item.startingAmount}} {{ currency }}
							</view>
						</view>
						<view class="item_box">
							<view class="item_title">
								{{$t('product.DailyRateOfReturn')}}
							</view>
							<view class="item_desc">
								{{item.dailyRateOfReturnStr}}
							</view>
						</view>
						<view class="item_box bg_gray">
							<view class="item_title">
								{{$t('product.TotalRevenue')}}
							</view>
							<view class="item_desc">
								{{item.totalRevenue}}
							</view>
						</view>
						<view class="item_box">
							<view class="item_title">
								{{$t('product.EndDate')}}
							</view>
							<view class="item_desc">
								{{item.endDate}}
							</view>
						</view>
						<view class="item_box bg_gray">
							<view class="item_title">
								{{$t('product.Remaining')}}
							</view>
							<view class="item_desc">
								{{item.remaining}}
							</view>
						</view>
						<view class="item_box border_bottom">
							<view class="item_title">
								<view class="item_title">
									{{$t('product.PurchaseConditions')}}
								</view>
								<view class="item_title" style="margin-top: 30rpx;">
									{{$t('product.Level')}}
								</view>
							</view>
							<view class="item_desc">
								{{item.purchaseConditions.level}}
							</view>
						</view>
						<view class="item_box" style="border-bottom: none;">
							<view class="item_title">
								{{$t('product.CreditValue')}}
							</view>
							<view class="item_desc">
								{{item.purchaseConditions.creditValue}}
							</view>
						</view>

						<!-- 详情按钮 -->
						<view class="detail-button-wrapper">
							<view class="detail-button" @click="toProduct(item.productId)">{{$t('product.Details2')}}
							</view>
						</view>
					</view>
					<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
						image="/static/default/No content.png"></listbottom>
				</scroll-view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import listbottom from '../../component/list-bottom/list_bottom.vue'
	import {
		productListApi
	} from '@/common/api/product.js'
	export default {
		components: {
			customnavbar: customnavbar,
			listbottom: listbottom
		},
		data() {
			return {
				pageTitle: '',
				currency: '',
				productList: [],
				nodata: false,
				hasMore: true,
				loading: false,
				page: {
					pageNum: 1,
					pageSize: 10
				},
				isRefreshing: false,
				topStyle: 0
			}
		},
		methods: {
			mtop(e) {
				// #ifdef H5
				this.topStyle = `padding-top:${e - 44}rpx;height:calc(100vh - ${e}rpx - 44rpx)`;
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = `padding-top:${e - 54}rpx;height:calc(100vh - ${e}rpx - 54rpx)`;
				// #endif
			},
			// 下拉刷新
			async onRefresh() {
				this.isRefreshing = true
				this.page.pageNum = 1
				await this.getProductList()
				setTimeout(() => {
					this.isRefreshing = false
				}, 500)
			},
			toProduct(id) {
				uni.navigateTo({
					url: '/pages/HomePage/financeDetails?productId=' + id
				})
			},
			getProductList() {
				this.loading = true
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				productListApi(this.page).then((res) => {
					this.loading = false
					if (this.page.pageNum == 1) this.productList = res.rows || []
					else this.productList.push(...res.rows)
					this.productList = res.rows || []
					this.nodata = res.total == 0
					this.hasMore = this.productList.length != res.total

				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})

			},
			onReachBottom() {
				if (!this.loading && this.hasMore) {
					this.page.pageNum += 1
					this.productListApi()
				}
			}
		},
		onShow() {
			if (uni.getStorageSync('pageTitle')) {
				this.pageTitle = uni.getStorageSync('pageTitle')
			}
			this.currency = uni.getStorageSync('settings').currency
			this.getProductList()
		},
	}
</script>

<style scoped lang="scss">
	.product-list {
		display: flex;
		flex-direction: column;
		padding: 50rpx;
		padding-bottom: 0;
	}

	.product-item {
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 18rpx;
		border: 2rpx solid #F8F8F8;
		margin-bottom: 40rpx;
		padding: 40rpx;
	}

	.header-row {
		display: flex;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.product-image {
		width: 120rpx;
		height: 120rpx;
		margin-right: 40rpx;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.product-name {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #1C2D57;
		line-height: 42rpx;
		text-align: left;
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