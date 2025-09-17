<template>
	<customnavbar :title="$t('pages.setting')">
		<view class="language_list">
			<!-- <view class="language_item" v-for="(item,index) in languageList" :key="index"
				@click="changeLanguage(item.code)">
				<view class="item_left">
					<image :src="item.img" alt="" class="language_icon" />

					<view class="language_title">
						{{item.name}}
					</view>
				</view>

				<view v-if="LocaleLangue == item.code " class="language_checkbox_checked"></view>
				<view v-else class="language_checkbox_unchecked"></view>
			</view> -->
			<view class="btn" @click="showLogout">
				{{$t('mine.LogOut')}}
			</view>
		</view>

		<uni-popup ref="logout_popup" type="center" border-radius="10px 10px 0 0">
			<view class="logout_pop_page">
				<view class="logout_pop_top">{{$t("home.Prompt")}}</view>
				<view class="logout_pop_content">{{$t("logout.tips")}}</view>
				<view class="logout_pop_bottom">
					<button class="btn_cancel" @click="cancel">{{$t('home.cancel')}}</button>
					<button class="btn_confirm" @click="confirm">{{$t('home.Sure')}}</button>
				</view>
			</view>
		</uni-popup>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	// import {
	// 	languageApi
	// } from "@/common/api/home.js";
	import {
		logoutApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar: customnavbar
		},
		data() {
			return {
			}
		},
		onLoad() {
			let systemInfo = uni.getSystemInfoSync();
			this.systemLocale = systemInfo.language;
			this.isAndroid = systemInfo.platform.toLowerCase() === 'android';
		},
		methods: {
			showLogout() {
				this.$refs.logout_popup.open()
			},
			cancel() {
				this.$refs.logout_popup.close()
			},
			confirm() {
				this.$refs.logout_popup?.close()
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				logoutApi().then((res) => {
					uni.removeStorageSync('token')
					uni.removeStorageSync('userInfo')
					uni.removeStorageSync('remember');
					uni.removeStorageSync('phone')
					uni.removeStorageSync('password')
					if (uni.getStorageSync('imToken')) {
						uni.removeStorageSync('imToken')
						this.$yeIM.getInstance().disConnect();
					}
					uni.reLaunch({
						url: '/pages/LoginPage/login'
					})
				}).catch((err) => {
					// this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.logout_pop_page {
		width: 570rpx;
		background: #FFFFFF;
		border-radius: 28rpx;
		padding: 40rpx 54rpx 28rpx 54rpx;
	}

	.logout_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.logout_pop_content {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.logout_pop_bottom {
		display: flex;
		margin-top: 54rpx;
	}

	.btn_cancel {
		width: 212rpx;
		height: 72rpx;
		background: #EBEBEB;
		border-radius: 16rpx;
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}

	.btn_confirm {
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

	.btn {
		padding: 20rpx 0 26rpx;
		display: flex;
		justify-content: center;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 600;
		font-size: 36rpx;
		color: #FFFFFF;
		text-align: left;
		font-style: normal;
		text-transform: none;
		margin-top: 24rpx;
	}

	.language_list {
		padding: 14rpx 40rpx;
	}

	.language_item {
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 24rpx;
		border: 2rpx solid #F6F6F6;
		padding: 40rpx;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.language_icon {
		width: 66rpx;
		height: 66rpx;
		margin-right: 30rpx;
	}

	.language_title {
		font-family: 'DINPro-Regular', sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #000000;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
	}

	.language_checkbox_checked {
		width: 24rpx;
		height: 24rpx;
		background: $themeColor;
		box-shadow: 0rpx 4rpx 8rpx 0rpx #B2C8FB;
		border-radius: 50%;
		border: 4rpx solid #EDEDED;
	}

	.language_checkbox_unchecked {
		width: 24rpx;
		height: 24rpx;
		background: #EDEDED;
		box-shadow: 0rpx 4rpx 8rpx 0rpx #B2C8FB;
		border-radius: 50%;
		border: 4rpx solid #EDEDED;
	}

	.item_left {
		display: flex;
		align-items: center;
	}
</style>