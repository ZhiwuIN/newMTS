<template>
	<customnavbar :title="$t('活动中心')" @mtop="mtop" backgroundStr="#056aeb" :whiteTitle="true" :isLotteryRecord="true">
		<view class="head" :style="topStyle">
			<view class="box">
				<view class="title">
					{{ $t('myBonusPoints') }}
				</view>
				<view class="number">
					{{ info?.points }}
				</view>
				<view class="btn" :style="{ opacity: mallSwitch ? 1 : 0 }"
					@click="toPage('/pages/HomePage/pointsMall')">
					<image src="/static/lottery/pointsMallLogo.png" mode="" class="head_img"></image>
					Go to use
				</view>
				<image src="/static/lottery/store_img.png" mode="heightFix" class="store_img"></image>
			</view>
		</view>
		<view class="bill-record">
			<view class="bill-record-content">
				<view class="scroll-view-box list">
					<view class="list_item" @click="toPage(item.url)" v-for="item in info?.list">
						<image :src="item.image" mode="widthFix" class="item_img"></image>
						<view class="item_bottom">
							<view class="item-productName">{{ item.name }}</view>
							<image src="/static/lottery/arrows.png" mode="" class="arrows_img"></image>
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
	activityListApi
} from '@/common/api/activity.js'
export default {
	components: {
		customnavbar,
	},
	data() {
		return {
			topStyle: '',
			info: {},
			page: {
				pageNum: 1,
				pageSize: 10
			},
			mallSwitch: 0
		}
	},
	methods: {
		mtop(e) {
			// #ifdef H5
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 24) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 24) + "rpx"
			// #endif
		},
		toPage(url) {
			if (url == '/pages/HomePage/pointsMall' && !this.mallSwitch) return
			uni.navigateTo({
				url
			})
		},
		getList() {
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			activityListApi().then((res) => {
				this.info = res.data
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})

		},
	},
	onLoad() {
		this.getList()
		this.mallSwitch = uni.getStorageSync('settings').mallSwitch
	},
}
</script>

<style lang="scss" scoped>
.head {
	position: relative;
	// padding: 80rpx 0 60rpx;
	background: #056aeb;
	color: #FFFFFF;
	padding-left: 32rpx;

	.box {
		display: flex;
		flex-direction: column;
		align-items: start;
	}

	.title {
		font-size: 32rpx;
	}

	.number {
		font-size: 64rpx;
		font-weight: 900;
		line-height: 92rpx;
	}

	.btn {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 8rpx 26rpx 8rpx 18rpx;
		border-radius: 278rpx;
		background: #000000;
		font-size: 28rpx;
		font-weight: bold;
		margin-top: 16rpx;
		margin-bottom: 28rpx;

		.head_img {
			width: 42rpx;
			height: 42rpx;
		}
	}
	.store_img {
		position: absolute;
		right: 0;
		bottom: 0;
		height: 228rpx;
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
		padding: 24rpx 32rpx 40rpx 32rpx;
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
			.list_item {
				display: flex;
				flex-direction: column;
				gap: 14rpx;
				// // justify-content: space-between;
				// align-items: center;
				background: #FFFFFF;
				box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
				border-radius: 24rpx;
				border: 2rpx solid #F6F6F6;
				// padding: 30rpx;
				margin-bottom: 26rpx;
				overflow: hidden;

				.item_img {
					width: 100%;
					background: #F5FAFF;
				}

				.item_bottom {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12rpx;
					padding: 0 14rpx 0 16rpx;
					margin-bottom: 20rpx;

					.item-productName {
						font-family: DINPro, DINPro;
						font-weight: 500;
						font-size: 28rpx;
						color: #3d3d3d;
					}

					.arrows_img {
						width: 72rpx;
						min-width: 72rpx;
						height: 72rpx;
					}
				}

			}
		}
	}
}
</style>