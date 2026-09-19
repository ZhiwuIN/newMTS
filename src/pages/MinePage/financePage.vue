<template>
	<customnavbar :title="pageTitle" @mtop="mtop">
		<view class="product-container" :style="topStyle">
			<view class="tabs">
				<view v-for="(item, index) in tabs" :key="index"
					:class="['tab-item', currentTab === index ? 'active' : '']" @click="switchTab(index)">
					{{ item }}
				</view>
			</view>
			<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
				@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
				class="scroll-view-box" v-if="productList.length">
				<view class="product-list">
					<view class="product-item" v-for="(item, index) in productList" :key="index">
						<!-- @click="toProduct(item.productId)" -->
						<!-- 产品名称 -->
						<view class="header-row">
							<view class="left_box">
								<view class="header-row_text">
									<text class="product-name">{{ item.productName }}</text>
								</view>
							</view>
							<view class="recommendation" :class="currentTab == 0 ? 'themeColor' : 'gray'">{{
								item.status }}</view>
						</view>
						<!-- 购买金额&预期收益 -->
						<view class="number_box">
							<view class="item_box">
								<view>{{ $t('product.PurchaseAmount') }}</view>
								<view class="bold">{{ item.purchaseAmount }} {{ currency }}</view>
							</view>
							<view v-if="currentTab == 0" class="item_box">
								<view>{{ $t('product.ExpectedEarnings') }}</view>
								<view class="bold">{{ item.expectedEarnings || 0 }} {{ currency }}</view>
							</view>
						</view>
						<view class="item_box_main">
							<view class="item_box">
								<view class="item_title">
									{{ $t('product.ExpectedReturn') }}
								</view>
								<view class="item_desc">
									{{ item.expectedReturn }} {{ currency }}
								</view>
							</view>
							<view class="item_box">
								<view class="item_title">
									{{ $t('product.PurchaseTime') }}
								</view>
								<view class="item_desc">
									{{ item.purchaseTime }}
								</view>
							</view>
							<view class="item_box">
								<view class="item_title">
									{{ $t('product.ExpirationTime') }}
								</view>
								<view class="item_desc">
									{{ item.expirationTime }}
								</view>
							</view>

						</view>
					</view>
				</view>
				<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata' image="/static/default/No order.png">
				</listbottom>
			</scroll-view>
			<view v-else class="default_box">
				<image src="/static/mine/applicationRecord/nullPositionManage.png" mode="" class="default_image">
				</image>
			</view>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	productMyRunningApi,
	productMyCompleteApi
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
			currentTab: 0,
			tabs: [],
			topStyle: 0,
			isRefreshing: false
		}
	},
	methods: {
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
		mtop(e) {
			// #ifdef H5
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
			// #endif
		},
		switchTab(index) {
			this.currentTab = index
			this.page.pageNum = 1
			this.nodata = false
			this.hasMore = true
			this.loading = false
			this.productList = []
			this.getList()
		},
		toProduct(id) {
			uni.navigateTo({
				url: '/pages/MinePage/financeDetails?productId=' + id
			})
		},
		getList() {
			this.loading = true
			const api = this.currentTab == 0 ? productMyRunningApi : productMyCompleteApi;
			api(this.page).then((res) => {
				this.loading = false
				if (this.page.pageNum == 1) this.productList = res.data.rows || []
				else this.productList.push(...res.data.rows)
				this.nodata = res.data.total == 0
				this.hasMore = this.productList.length != res.data.total

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
			console.log('到底了')
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getList()
			}
		}
	},
	onLoad(options) {
		if (uni.getStorageSync('pageTitle')) {
			this.pageTitle = uni.getStorageSync('pageTitle')
		} else {
			this.pageTitle = options.title
		}
		this.tabs = [
			this.$t('pages.InProgress'),
			this.$t('pages.Finished')
		]
		this.getList()
	},
	onShow() {
		this.currency = uni.getStorageSync('settings').currency
	},

}
</script>

<style scoped lang="scss">
.default_box {
	display: flex;
	justify-content: center;

	.default_image {
		width: 466rpx;
		height: 466rpx;
	}
}

.scroll-view-box {
	flex: 1; // 自动填充剩余高度
	overflow-y: auto; // 确保滚动生效
}

.list {
	flex: 1;
	height: 1px;
	padding-top: 40rpx;
}

.themeColor {
	color: $themeColor !important;
}

.gray {
	color: #999 !important;
}

.product-container {
	display: flex;
	flex-direction: column;
	padding-top: 24rpx;
	background-color: #f2f5ff;
}

.product-list {
	padding: 32rpx;
}

.tabs {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	background: #fff;
	justify-content: space-evenly;
	margin: 0 32rpx;
	border-radius: 2026rpx;
	padding: 8rpx;

	.tab-item {
		position: relative;
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #000000;
		line-height: 70rpx;
		text-align: center;
		font-style: normal;

		&.active {
			color: #FFFFFF;
			font-weight: 600;
			background: $themeColor;
			// box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
			border-radius: 36rpx;
		}
	}
}

.product-item {
	background: #FFFFFF;
	box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 24rpx;
	border: 2rpx solid #F6F6F6;
	margin-bottom: 24rpx;
	padding: 24rpx;

	.recommendation {
		display: inline-block;
		padding: 12rpx 18rpx;
		border-radius: 12rpx;
		background: #edf3ff;
		color: $themeColor;
		font-size: 27rpx;
		line-height: 34rpx;
		white-space: nowrap;
	}
}

.header-row {
	display: flex;
	align-items: start;
	justify-content: space-between;
	padding-bottom: 10rpx;
}

.number_box {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	padding-bottom: 16rpx;
	border-bottom: 2rpx solid #879BBB;

	.item_box {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 8rpx;
		font-family: MiSans;
		font-size: 24rpx;

		.bold {
			font-family: MiSans;
			font-size: 32rpx;
			font-weight: 500;
			line-height: 32rpx;
		}
	}
}

.left_box {
	display: flex;
	align-items: center;
}

.rigth_img {
	width: 48rpx;
	min-width: 48rpx;
	height: 48rpx;
	transform: rotate(180deg);
}

.header-row_text {}

.product-image {
	width: 96rpx;
	height: 96rpx;
	margin-right: 20rpx;
	background: #D8D8D8;
	border-radius: 10rpx;
}

.product-name {
	font-family: DingTalk JinBuTi;
	font-size: 32rpx;
	line-height: 36rpx;
	color: #000000;
	text-align: left;
	font-style: normal;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

.product-status {
	font-family: DINPro, DINPro;
	font-weight: 500;
	font-size: 24rpx;
	line-height: 30rpx;
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

.item_box_main {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 16rpx;
	margin-top: 16rpx;
}

.item_box {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.item_title {
	font-family: MiSans;
	font-size: 24rpx;
	color: #000;
	line-height: 34rpx;
	text-align: center;
	font-style: normal;
}

.item_desc {
	font-family: MiSans;
	font-size: 24rpx;
	color: #000;
	line-height: 34rpx;
	text-align: center;
	font-style: normal;
}
</style>