<template>
	<customnavbar :title="$t('home.Postmanage')">
		<view class="post-container">
			<view class="item-box">
				<view class="post-item" v-for="(item,index) in postList">
					<view class="flex-center">
						<image :src=" item.image" class="post-img"></image>
					</view>
					<view class="post-name">
						{{item.positionName}}
					</view>
					<view style="display: flex;justify-content: center;margin-top: 10px;"
						v-if="item.pid != userInfo.position">
						<view class="apply_button" @click="toApply(item)">{{$t("post.apply")}}</view>
					</view>
					<view style="display: flex;justify-content: center;margin-top: 10px;" v-else>
						<view class="apply_button disable">{{$t("post.apply")}}</view>
					</view>
				</view>
			</view>
		</view>
	</customnavbar>
	<uni-popup ref="promptpopup" type="center" :mask-click="false" >
		<view class="prompt_pop_page">
			<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
			<view class="prompt_pop_taps" >{{this.$t("withdrawal.restrictedAccess")}}</view>
			<view class="prompt_pop_bottom">
				<button class="prompt_confirm_btn" @click="prompt_confirm">{{$t('pay.yes')}}</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		positionApi
	} from "@/common/api/position.js";
	import {
		userInfoApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				url: 'http://13.245.95.135:8888',

				// url: 'http://192.168.2.35:8080',
				postList: [],
				userInfo: {},
				isRestrictAccess: false,
			}
		},
		onLoad() {
			positionApi().then((res) => {
				this.postList = res.data
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				// uni.showToast({
				// 	title: err.msg,
				// 	icon: 'none'
				// })
			})
			userInfoApi().then((res) => {
				uni.setStorageSync('userInfo', res.data)
				this.userInfo = res.data
				if (res.data.housekeeper == 1) {
					this.isRestrictAccess = true
					this.$refs.promptpopup.open()
				}
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				// uni.showToast({
				// 	title: err.msg,
				// 	icon: 'none'
				// })
				this.postList = res.data
			})
		},
		methods: {
			toApply(item) {
				uni.navigateTo({
					url: '/pages/HomePage/postAgreement?id=' + item.pid
				})
			},
			prompt_confirm(){
				this.$refs.promptpopup.close()
				uni.navigateBack()
			},
		},

	}
</script>

<style scoped lang="scss">
	.post-container {
		background-color: #FFFFFF;
		/* height: 100%; */
	}

	.item-box {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 50rpx 0;
		padding: 48rpx;
	}

	.post-item {
		width: 300rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 6rpx;
		border: 2rpx solid #FAFAFA;

	}

	.apply_button {
		width: 172rpx;
		height: 64rpx;
		background: $themeColor;
		box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 320rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 24rpx;
		color: #FFFFFF;
		line-height: 30rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 30rpx;

		&.disable {
			background: #999;
			box-shadow: 0rpx 4rpx 16rpx 0rpx #fbfbfb;
		}
	}

	.post-img {
		width: 160rpx;
		height: 160rpx;
		margin-top: 30rpx;
	}

	.flex-center {
		display: flex;
		justify-content: center;
	}

	.post-name {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 24rpx;
		color: #1C2D57;
		line-height: 30rpx;
		text-align: center;
		font-style: normal;
		margin-top: 20rpx;
		margin-bottom: 30rpx;
	}
	.prompt_pop_page {
		width: 570rpx;
		background: #FFFFFF;
		border-radius: 28rpx;
		padding: 40rpx 54rpx 28rpx 54rpx;
		.prompt_pop_top {
			font-family: "DINPro-Medium", sans-serif;
			font-weight: 500;
			font-size: 32rpx;
			color: #000000;
			line-height: 42rpx;
			text-align: center;
			font-style: normal;
		}
		.prompt_pop_taps {
			font-family: "DINPro-Regular", sans-serif;
			font-weight: 400;
			font-size: 28rpx;
			color: #1C2D57;
			line-height: 36rpx;
			text-align: center;
			font-style: normal;
			margin-top: 40rpx;
		}
		.prompt_pop_bottom {
			display: flex;
			margin-top: 54rpx;
		}
		
		.prompt_confirm_btn {
			width: 212rpx;
			height: 72rpx;
			background: $themeColor;
			box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
			border-radius: 16rpx;
			font-family: "DINPro-Black", sans-serif;
			font-family: DINPro, DINPro;
			font-weight: 500;
			font-size: 32rpx;
			color: #FFFFFF;
			line-height: 72rpx;
			text-align: center;
			font-style: normal;
		}
	}
</style>