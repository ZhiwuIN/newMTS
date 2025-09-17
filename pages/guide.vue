<template>
	<view class="box">
		<view class="guide_top">
			<view class="skip_btn" @click="skip">
				{{$t('Skip')}}
			</view>
		</view>
		<swiper circular :autoplay="false" @change="swiperChange"
			style="width: 100%;height: 752rpx;position: absolute;bottom: 590rpx;" :current='currentPIndex'>
			<swiper-item class="guide-swiper-item" v-for="(item, index) in guideList" :key="index">
				<view class="swiper_container">
					<view class="flex_center">
						<image :src="item.img" alt="" class="guide_img" />
					</view>
				</view>
			</swiper-item>
		</swiper>
		<view class="guide_bottom">
			<view class="flex_center">
				<view class="guide_title ">
					{{guideList[currentPIndex].title}}
				</view>
			</view>
			<view class="flex_center">
				<view class="guide_desc ">
					{{guideList[currentPIndex].desc}}
				</view>
			</view>
			<view class="flex_center">
				<view v-for="i in guideList.length" :class="(i-1)==currentPIndex?'guide_dots_active':'guide_dots'">
				</view>
			</view>
			<view class="flex_center">
				<view class="guide_btn" @click="guideNext">
					{{currentPIndex==2?'Get started':'Next'}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentPIndex: 0,
				guideList: [{
					// title: this.$t('guideA'),
					title: 'Safe and Secure Worry-Free',
					desc: 'Real tasks, transparent processes, and escrowed payments — every step is designed to protect your safety.',
					img: '/static/guide1.png'
				}, {
					// title: this.$t('guideB'),
					title: 'Easy Tasks Visible Rewards',
					desc: 'Complete tasks to earn instantly. Fast withdrawals supported — your time deserves greater value.',
					img: '/static/guide2.svg'
				}, {
					// title: this.$t('guideC'),
					title: 'One-Tap to Start Zero Learning Curve',
					desc: 'Clear steps, simple submission, and automatic payouts — even beginners can start earning effortlessly.',
					img: '/static/guide3.svg'
				}],

			}
		},
		methods: {
			swiperChange(e) {
				this.currentPIndex = e.detail.current
			},
			guideNext() {
				if (this.currentPIndex == 2) {
					uni.setStorageSync('first_flag', true);
					if (uni.getStorageSync('userInfo')) {
						uni.switchTab({
							url: '/pages/HomePage/index'
						})
					} else {
						uni.redirectTo({
							url: '/pages/LoginPage/login'
						})
					}
				} else {
					this.currentPIndex += 1
				}
			},
			skip() {
				uni.setStorageSync('first_flag', true);
				if (uni.getStorageSync('userInfo')) {
					uni.switchTab({
						url: '/pages/HomePage/index'
					})
				} else {
					uni.redirectTo({
						url: '/pages/LoginPage/login'
					})
				}
			}
		}
	}
</script>

<style scoped>
	::v-deep .uni-swiper-wrapper {
		z-index: 999;
	}

	.box {
		height: calc(100vh - 686rpx);
		background: url('/static/ImageGuide.png');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
	}

	.guide_top {
		display: flex;
		justify-content: flex-end;
		padding-top: 80rpx;
	}

	.skip_btn {
		width: 140rpx;
		height: 64rpx;
		background: #DBDBDB;
		border-radius: 40rpx;
		font-family: 'DINPro-Regular', sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #000000;
		line-height: 64rpx;
		text-align: center;
		font-style: normal;
		margin: 12rpx 50rpx;
		margin-bottom: 38rpx;
		z-index: 9999999;
	}

	.swiper_container {
		height: 100%;
	}

	.guide-swiper-item {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.guide_img {
		width: 596rpx;
		height: 752rpx;
	}

	.guide_bottom {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 750rpx;
		height: 686rpx;
		/* background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%); */
		background: linear-gradient(180deg, #3B89E9 0%, #03459B 100%);
		border-radius: 76rpx 76rpx 0rpx 0rpx;
		/* z-index: -1; */
	}

	.flex_center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.guide_title {
		width: 616rpx;
		font-family: 'DINPro-Bold', sans-serif;
		font-weight: bold;
		font-size: 64rpx;
		color: #FFFFFF;
		line-height: 82rpx;
		text-align: center;
		font-style: normal;
		margin-top: 48rpx;
	}

	.guide_desc {
		width: 594rpx;
		font-family: 'DINPro-Bold', sans-serif;
		font-weight: 400;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 44rpx;
		text-align: center;
		font-style: normal;
		margin-top: 74rpx;
	}

	.guide_dots {
		width: 16rpx;
		height: 16rpx;
		background: #FFFFFF;
		opacity: 0.5;
		border-radius: 8rpx;
		margin: 26rpx 8rpx 46rpx 8rpx;
	}

	.guide_dots_active {
		width: 16rpx;
		height: 16rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
		margin: 26rpx 8rpx 46rpx 8rpx;
	}

	.guide_btn {
		width: 512rpx;
		height: 112rpx;
		background: #FFFFFF;
		/* box-shadow: 0rpx 8rpx 20rpx 0rpx #2E9FC5; */
		border-radius: 24rpx;
		font-family: 'DINPro-Bold', sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #000000;
		line-height: 112rpx;
		text-align: center;
		font-style: normal;
	}
</style>