<template>
	<customnavbar :title="$t('兑换记录')" @mtop="mtop">
		<view class="bill-record">
			<view class="bill-record-content" :style="topStyle">
				<!-- 列表内容 -->
				<!-- <view class="list-content"> -->
				<!-- 兑换列表 -->
				<!-- <view class="list"> -->
				<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
					@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
					class="scroll-view-box list">
					<view class="list-item" v-for="(item, index) in billsList" :key="index">
						<image :src="item.imageUrl" mode="" class="item_img"></image>
						<view class="item-right">
							<view>
								<view class="item-productName">{{ item.productName }}</view>
								<view class="item-pointsUsed">
									<image class="image-pointsUsed" src="/static/lottery/intégration.png" mode="">
									</image>
									<view>{{ item.pointsUsed }}</view>
								</view>
							</view>
							<view class="top">Please contact the hiring manager</view>
							<view class="item-foot">
								<!-- <view v-if="item.status == 0" class="inProgress">{{$t('处理中')}}</view>
								<view v-if="item.status == 1" class="Completed">{{$t('已完成')}}</view> -->
								<view style="text-align: end;">{{ item.createTime }}</view>
							</view>
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
	pointPrizeOrdersApi
} from "@/common/api/home.js";
export default {
	components: {
		customnavbar,
		listbottom
	},
	data() {
		return {
			url: 'http://13.245.95.135:8888',
			// url: 'http://192.168.2.35:8080',
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
		toPage(url) {
			uni.navigateTo({
				url
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
			this.loading = true
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			pointPrizeOrdersApi(uni.getStorageSync('userInfo').userId, this.page).then((res) => {
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
			console.log('加载')
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
				gap: 30rpx;
				// justify-content: space-between;
				align-items: center;
				background: #FFFFFF;
				box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
				border-radius: 32rpx;
				border: 2rpx solid #F6F6F6;
				padding: 30rpx;
				margin-bottom: 30rpx;

				.item_img {
					width: 220rpx;
					height: 220rpx;
					background: #F5FAFF;
					border-radius: 18rpx;
				}

				.item-right {
					flex: 1;
					display: flex;
					flex-direction: column;
					height: 220rpx;
					justify-content: space-between;
				}

				.item-productName {
					font-family: DINPro, DINPro;
					font-weight: 500;
					font-size: 32rpx;
					color: #000000;
					margin-bottom: 10rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
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

				.top {
					font-size: 24rpx;
					color: #999999;
					word-break: break-all;
					line-height: 24rpx;
				}

				.item-foot {
					display: flex;
					align-items: end;
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