<template>
	<customnavbar :title="$t('mine.AccountSecurity')">
		<view class="account-security">
			<!-- 头像部分 -->
			<!-- <view class="avatar-section">
			<image class="avatar" :src="userAvatar" mode="aspectFill"></image>
			<text class="nickname">{{nickname}}</text>
		</view> -->

			<!-- 账户信息列表 -->
			<view class="info-list">
				<view class="info-item" @click="changeHeadportrait">
					<view class="info-left-t">{{$t('Account.Headportrait')}}</view>
					<uni-icons type="right" size="23"></uni-icons>
				</view>
				<view class="info-item">
					<view class="info-left-t">{{$t('Account.AccountNumber')}}</view>
					<view class="info-left-t2">
						{{userInfo.username}}
					</view>
				</view>
				<!-- <view class="info-item" @click="navigateToIdentity(`/pages/MinePage/cellPhoneNumber`)">
					<view class="info-left-t">{{$t('Account.CellPhoneNumber')}}</view>
					<view style="display: flex;align-items: center;gap: 24rpx;">
						<view class="info-left-t2">
							{{userInfo.phone}}
						</view>
						<uni-icons type="right" size="23"></uni-icons>
					</view>
				</view> -->

				<view class="info-item" @click="navigateToIdentity(`/pages/MinePage/identity`)">
					<view class="info-left-t">{{$t('mine.Identityauthentication')}}</view>
					<uni-icons type="right" size="23"></uni-icons>
				</view>

				<view class="info-item" @click="navigateToPasswordSet('login')">
					<view class="info-left-t">{{$t('Account.LoginPassword')}}</view>
					<uni-icons type="right" size="23"></uni-icons>
				</view>

				<view class="info-item" @click="navigateToMobilePatment('payment')">
					<view class="info-left-t">{{$t('Account.MobileMoneyPayment')}}</view>
					<uni-icons type="right" size="23"></uni-icons>
				</view>

				<view class="info-item" @click="navigateToPasswordSet('withdraw')">
					<view class="info-left-t">{{$t('Account.WithdrawalPassword')}}</view>
					<uni-icons type="right" size="23"></uni-icons>
				</view>

				<!-- <view class="info-item" @click="navigateToAccountManage">
				<view class="info-left-t">{{$t('Account.Accountsettings')}}</view>
				<uni-icons type="right" size="23"></uni-icons>
			</view> -->
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		userInfoApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				userInfo: {}
			}
		},
		onShow() {
			userInfoApi().then((res) => {
				this.userInfo = res.data
				uni.setStorageSync('userInfo', res.data)
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		methods: {
			// 跳转到修改头像
			changeHeadportrait() {
				uni.navigateTo({
					url: `/pages/MinePage/headPortrait`
				});
			},
			// 身份认证
			navigateToIdentity(url) {
				uni.navigateTo({
					url
				});
			},
			navigateToPasswordSet(type) {
				let title = '';
				uni.navigateTo({
					url: `/pages/MinePage/password?type=${type}`
				});
			},
			// 跳转到账户管理页面
			navigateToAccountManage() {
				uni.navigateTo({
					url: '/pages/account-manage/account-manage'
				});
			},
			// 跳转到移动支付管理页面
			navigateToMobilePatment() {
				uni.navigateTo({
					url: '/pages/MinePage/mobilePayment'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.account-security {

		.info-list {
			.info-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 40rpx;
				border-bottom: 2rpx solid #F4F4F4;

				&:last-child {
					border-bottom: none;
				}
			}
		}
	}

	.info-left-t {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 30rpx;
		color: #000000;
		line-height: 40rpx;
		text-align: center;
		font-style: normal;
	}

	.info-left-t2 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}
</style>