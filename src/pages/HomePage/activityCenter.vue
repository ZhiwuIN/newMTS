<template>
	<homenavbar :title="$t('活动中心')" @mtop="mtop" backgroundStr="''">
		<view class="top-bg" :style="topStyle"></view>
		<!-- :isLotteryRecord="true" -->
		<view class="head">
			<view class="box" v-if="pointWheel">
				<view class="title">
					{{ $t('myBonusPoints') }}
				</view>
				<view class="number">
					{{ info?.points || 0 }}
				</view>
				<view class="btn" :style="{ opacity: mallSwitch ? 1 : 0 }"
					@click="toPage('/pages/HomePage/pointsMall')">
					<image src="/static/lottery/pointsMallLogo.png" mode="" class="head_img"></image>
					{{ $t('去使用') }}
				</view>
			</view>
		</view>
		<view class="bill-record">
			<view class="bill-record-content">
				<view class="scroll-view-box list">
					<view class="list_item" @click="toPage(item.url)" v-for="item in info?.list">
						<view class="item_img_box">
							<image :src="item.image" mode="widthFix" class="item_img"></image>
							<!-- <view class="img_productName">{{ item.name }}</view> -->
						</view>
						<view class="item_bottom">
							<view class="item-productName">{{ item.name }}</view>
							<image src="/static/lottery/arrows.png" mode="" class="arrows_img"></image>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="enregistrer" @click="toPage('/pages/HomePage/tirageRecordPage')">
			{{ $t('记录') }}
		</view>
	</homenavbar>
</template>

<script>
import homenavbar from '@/component/home-navbar/home-navbar.vue';
import {
	activityListApi
} from '@/common/api/activity.js'
export default {
	components: {
		homenavbar,
	},
	data() {
		return {
			pointWheel: 0,
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
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 99) + "rpx"
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
		this.pointWheel = uni.getStorageSync('settings').pointWheel
	},
}
</script>

<style lang="scss" scoped>
.top-bg {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1076rpx;
	background:
		radial-gradient(circle at 0% 0%, #69d6ec 0%, rgba(105, 214, 236, 0.55) 34%, transparent 62%),
		radial-gradient(circle at 100% 0%, #3aaff5 0%, rgba(58, 175, 245, 0.55) 36%, transparent 65%),
		radial-gradient(circle at 50% 45%, rgba(245, 248, 255, 0.9) 0%, rgba(245, 248, 255, 0.25) 42%, transparent 72%),
		linear-gradient(180deg, #b9e9f3 0%, rgba(234, 246, 248, 0.8) 55%, rgba(244, 245, 251, 0) 100%);
	z-index: 1;
}

.enregistrer {
	position: fixed;
	right: -6rpx;
	top: 20%;
	padding: 18rpx 12rpx;
	// background: #2D81F5;
	background: $themeColor;
	// box-shadow: 10rpx 0rpx 21rpx 0rpx #50B4D9;
	border-radius: 16rpx 0rpx 0rpx 16rpx;
	border: 1rpx solid #FFFFFF;
	font-family: DINPro, DINPro;
	font-weight: 400;
	font-size: 24rpx;
	color: #FFFFFF;
	// transform: rotate(90deg);
	writing-mode: vertical-rl;
	z-index: 1;
}

.head {
	position: relative;
	background-color: #fff;
	padding-left: 32rpx;
	z-index: 1;
	margin: 24rpx;
	margin-bottom: 0;
	border-radius: 24rpx;
	padding: 24rpx;

	.box {
		display: flex;
		flex-direction: column;
		align-items: start;
	}

	.title {
		font-family: Dela Gothic One;
		font-size: 40rpx;
		color: #0052D9;
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
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		margin-top: 16rpx;

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
	position: relative;
	z-index: 1;
	height: 100%;

	.bill-record-content {
		display: flex;
		flex-direction: column;
		padding: 24rpx 24rpx 40rpx 24rpx;
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
				box-shadow: 0px 8rpx 20rpx 0px #E9F3FF;
				border-radius: 24rpx;
				border: 2rpx solid #F6F6F6;
				// padding: 30rpx;
				margin-bottom: 26rpx;
				overflow: hidden;

				.item_img_box {
					position: relative;

					.item_img {
						width: 100%;
						background: #F5FAFF;
					}

					.img_productName {
						position: absolute;
						top: 50%;
						left: 24rpx;
						transform: translateY(-50%);
						width: 320rpx;
						font-family: Alfa Slab One;
						font-size: 58rpx;
						line-height: 68rpx;
						color: #FFFFFF;
						text-shadow: 0rpx 8rpx 10rpx rgba(0, 0, 0, 0.63);
					}
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
