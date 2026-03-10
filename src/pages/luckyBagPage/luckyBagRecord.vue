<template>
	<customnavbar :title="$t('记录')" @mtop="mtop" backgroundStr="#e1efff">
		<view class="Big_bgi" :style="topStyle2"></view>
		<uv-skeletons :loading="isLoading" :skeleton="skeleton" class="common-page"></uv-skeletons>
		<view class="bill-record">
			<view class="bill-record-content">
				<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
					@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
					class="scroll-view-box list">
					<view class="list-item" v-for="(item, index) in list" :key="index">
						<view class="item_left">
							<image class="bag_img" :src="item.image" mode="" :lazy-load="true">
							</image>
							<view class="left_box">
								<view class="level">{{ item.bagName }}</view>
								<view class="time">{{ item.openTime }}</view>
							</view>
						</view>
						<view class="number">+{{ item.rewardAmount }}</view>
					</view>
					<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
						image="/static/default/No bank card.png"></listbottom>
				</scroll-view>
			</view>
		</view>

	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	luckyBagRecordListApi
} from '@/common/api/bag.js'
export default {
	components: {
		customnavbar,
		listbottom
	},
	data() {
		return {
			list: [],
			page: {
				pageNum: 1,
				pageSize: 15
			},
			nodata: false,
			hasMore: true,
			loading: false,
			topStyle: '',
			topStyle2: '',
			isRefreshing: false,
		}
	},
	methods: {
		mtop(e) {
			// #ifdef H5
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
			this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
			this.topStyle2 = `height:calc(100vh);`
			// #endif
		},
		getList() {
			this.loading = true
			luckyBagRecordListApi(this.page).then((res) => {
				this.loading = false
				if (this.page.pageNum == 1) this.list = res.rows || []
				else this.list.push(...res.rows)
				this.nodata = res.total == 0
				if (this.list.length == res.total) this.hasMore = false

			}).catch((err) => {
				console.log('request fail', err);
				this.loading = false
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				this.isLoading = false
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
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getList()
			}
		}
	},
	onLoad() {
		this.getList()
	}
}
</script>

<style lang="scss" scoped>
.Big_bgi {
	background: #e1efff;
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

		.list {
			.list-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				background-color: #fff;
				margin-bottom: 16rpx;
				padding: 16rpx 24rpx 16rpx 16rpx;
				border-radius: 32rpx;

				.item_left {
					display: flex;
					gap: 16rpx;

					.bag_img {
						width: 96rpx;
						height: 96rpx;
						border-radius: 50%;
						background-color: #f7f7f7;
					}

					.left_box {
						display: flex;
						flex-direction: column;
						justify-content: center;
						gap: 6rpx;
						height: 96rpx;

						.level {
							font-size: 32rpx;
							color: #000;
						}

						.time {
							font-size: 24rpx;
							color: #3D3D3D;
						}
					}
				}

				.number {
					font-size: 48rpx;
					color: $themeColor;
				}
			}
		}
	}
}
</style>