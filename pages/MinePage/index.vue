<template>
	<view>
		<customnavbar backgroundStr="url('/static/mine/mine_bg.png') top left/100%  no-repeat" @mtop="mtop"
			:showBack="false" :isHome="true" :hasMessage="userInfo.hasMessage">
			<view class="mine-container">
				<view class="mine_top_bg" :style="topStyle">
					<!-- 个人信息区域 -->
					<view class="user-info">
						<view class="user_avatar" @click="pushAccount">
							<view class="avatarBox">
								<image class="avatar_img" mode="aspectFill"
									:src="userInfo.avatar ?  userInfo.avatar : '/static/default-avatar.png'">
								</image>
								<view class="avatarEdit_img_Box">
									<image class="avatarEdit_img" src="/static/mine/editAvatar.png"></image>
								</view>
							</view>
						</view>

						<view class="user-detail">
							<view class="username">{{userInfo?.levelName || '--'}}</view>
							<view class="username" style="margin-top: 0;">{{userInfo?.positionName || '--'}}</view>
							<!-- <view class="username" style="margin-top: 0;">{{userInfo.username || '--'}}</view> -->
							<view class="user-level">{{userInfo.username || ''}}</view>
						</view>
					</view>


					<!-- 资金明细卡片 -->
					<view class="money-card">
						<view class="money-grid">
							<view class="money-item">
								<view class="amount">{{userInfo.dailyRevenue || '0'}}</view>
								<view class="label"><text>{{splitText($t('mine.DailyRevenue'))}}</text></view>
							</view>
							<view class="money-item">
								<view class="amount">{{userInfo.monthlyRevenue || '0'}}</view>
								<view class="label"><text>{{splitText($t('mine.MonthlyRevenue'))}}</text></view>
							</view>
							<view class="money-item">
								<view class="amount">{{userInfo.totalRevenue || '0'}}</view>
								<view class="label"><text>{{splitText($t('mine.TotalIncome'))}}</text></view>
							</view>
							<view class="money-item">
								<view class="amount">{{userInfo.totalWithdrawals || '0'}}</view>
								<view class="label"><text>{{splitText($t('mine.Totalwithdrawals'))}}</text></view>
							</view>
							<view class="money-item">
								<view class="amount">{{userInfo.accountBalance || '0'}}</view>
								<view class="label"><text>{{splitText($t('mine.AccountBalance'))}}</text></view>
							</view>
							<view class="money-item">
								<view class="amount">{{userInfo.totalProfits || '0'}}</view>
								<view class="label"><text>{{splitText($t('mine.TotalProfits'))}}</text></view>
							</view>
						</view>
						<view style="grid-template-columns: repeat(2, 1fr);padding: 0 48rpx;" class="money-grid">
							<view class="money-item">
								<view class="amount">{{userInfo.depositAmount || '0'}}</view>
								<view class="label"><text>{{splitText($t('保证金'))}}</text></view>
							</view>
							<view class="money-item" style="transform: translateX(-6rpx);">
								<view class="amount">{{userInfo.firstPurchaseLevelDate || '--'}}</view>
								<view class="label"><text>{{$t('第一次购买等级日期')}}</text></view>
							</view>
						</view>
					</view>
					<view class="button-group" v-if="userInfo.userType != 'test'">
						<view class="btn deposit" @click="toPage2('/pages/HomePage/RechargeChannel')">
							{{$t('mine.Deposit')}}
						</view>
						<view class="btn withdraw" @click="toPage('/pages/MinePage/withdrawal')">
							{{$t('mine.Withdrawal')}}
						</view>
					</view>
				</view>


				<!-- 功能入口卡片 -->
				<view class="function-card">
					<view class="function-grid">
						<view class="function-item" @click="toPage('/pages/MinePage/license?groupId=4')">
							<image src="/static/mine/Business license.png"></image>
							<text>{{splitText($t('mine.Businesslicense'))}}</text>
						</view>
						<!-- <view class="function-item" @click="toPage('/pages/MinePage/identity')">
							<image src="/static/mine/dentity authentication.png"></image>
							<text>{{splitText($t('mine.Identityauthentication'))}}</text>
						</view> -->
						<view class="function-item" @click="toPage('/pages/MinePage/bills')">
							<image src="/static/mine/Financial Records.png"></image>
							<text>{{splitText($t('mine.FinancialRecords'))}}</text>
						</view>
						<view class="function-item" @click="toPage('/pages/MinePage/positionManage')">
							<image src="/static/mine/Position management.png"></image>
							<text>{{splitText($t('mine.PositionManagement'))}}</text>
						</view>
						<view class="function-item" @click="toPage('/pages/MinePage/financePage')">
							<image src="/static/mine/Financial management fund.png"></image>
							<text>{{splitText($t('mine.Financialmanagementfund'))}}</text>
						</view>
						<!-- 我的团队 -->
						<view class="function-item" @click="toPage('/pages/TeamPage/index')">
							<image src="/static/mine/Team Management.png"></image>
							<text>{{splitText($t('mine.myTeam'))}}</text>
						</view>
						<view class="function-item" @click="toPage('/pages/MinePage/account')">
							<image src="/static/mine/Account Security.png"></image>
							<text>{{splitText($t('mine.AccountSecurity'))}}</text>
						</view>
						<view class="function-item" @click="toPage('/pages/MinePage/privacyPolicy')">
							<image src="/static/mine/Privacy Policy.png"></image>
							<text>{{splitText($t('mine.PrivacyPolicy'))}}</text>
						</view>
						<view class="function-item" @click="toPage('/pages/MinePage/ElectronicContract')">
							<image src="/static/mine/Electronic Contract.svg"></image>
							<text>{{splitText($t('mine.ElectronicContract'))}}</text>
						</view>
						<!-- #ifdef H5 -->
						<view class="function-item" @click="onDownload()">
							<image src="/static/mine/APP Download.png"></image>
							<text>{{splitText($t('mine.APPDownload'))}}</text>
						</view>
						<!-- #endif -->
					</view>
				</view>
			</view>
		</customnavbar>
		<uni-popup ref="promptpopup" type="center">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
				<view class="prompt_pop_taps">{{$t('请先实名')}}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_cancel_btn" @click="prompt_cancel">{{$t('pay.no')}}</button>
					<button class="prompt_confirm_btn" @click="prompt_confirm">{{$t('pay.yes')}}</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		userInfoApi,
		logoutApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar: customnavbar
		},
		data() {
			return {
				url: 'http://13.245.95.135:8888',

				// url: 'http://192.168.2.35:8080',
				topStyle: 0,
				userInfo: {}
			}
		},
		onShow() {
			userInfoApi().then((res) => {
				this.userInfo = res.data
				if (this.userInfo.firstPurchaseLevelDate) {
					this.userInfo.firstPurchaseLevelDate = this.userInfo.firstPurchaseLevelDate.split(' ')[0]
				}
				if (this.userInfo.hasMessage) {
					uni.showTabBarRedDot({
						index: 2
					})
				} else {
					uni.hideTabBarRedDot({
						index: 2
					})
				}
				uni.setStorageSync('userInfo', res.data)
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		methods: {
			toPage2(path) {
				// if (!this.userInfo.realName) {
				// 	this.$refs.promptpopup.open()
				// 	return
				// }
				uni.navigateTo({
					url: path
				})
			},
			prompt_confirm() {
				this.$refs.promptpopup.close()
				uni.navigateTo({
					url: '/pages/MinePage/identity'
				})
			},
			prompt_cancel() {
				this.$refs.promptpopup.close()
			},
			onDownload() {
				uni.navigateTo({
					url: '/pages/appDownload'
				})
			},
			pushAccount() {
				uni.navigateTo({
					url: '/pages/MinePage/headPortrait'
				})
			},
			toPage(path) {
				uni.navigateTo({
					url: path
				})
			},
			mtop(e) {
				// #ifdef H5
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 66) + "rpx"
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 44) + "rpx"
				// #endif
			},
			splitText(t) {
				if (uni.getStorageSync('settings').defaultLanguage == 'fr') {
					const parts = t.split(' ');
					return parts.length > 1 ? parts[0] + ' ' + parts[1] + '\n' + parts.slice(2).join(' ') : t;
				} else {
					const newline = '\n';
					return t.split(' ').join(newline);
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.mine-container {
		// height: 100%;

	}

	.mine_top_bg {
		width: 750rpx;
		// height: 704rpx;
		background: url('/static/mine/mine_bg.png') top left/100% no-repeat;
	}

	.user-info {
		margin-top: 34rpx;

		.user_avatar {
			display: flex;
			justify-content: center;
			width: 100%;

		}


		.avatarBox {
			position: relative;

			.avatarEdit_img_Box {
				display: flex;
				align-items: center;
				justify-content: center;
				position: absolute;
				right: 4rpx;
				bottom: 4rpx;
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				background-color: rgba(0, 0, 0, .6);

				.avatarEdit_img {
					width: 30rpx;
					height: 30rpx;
				}
			}
		}

		.avatar_img {
			width: 200rpx;
			height: 200rpx;
			border-radius: 50%;
			background: #EBF5FF;
		}

		.user-detail {
			flex: 1;

			.username {
				font-family: "DINPro-Bold" sans-serif;
				font-size: 44rpx;
				color: #FFFFFF;
				line-height: 52rpx;
				text-align: center;
				font-style: normal;
				text-transform: none;
				margin-top: 24rpx;
			}

			.user-level {
				font-family: "DINPro-Bold" sans-serif;
				font-weight: normal;
				font-size: 28rpx;
				color: #FFFFFF;
				line-height: 34rpx;
				text-align: center;
				font-style: italic;
				text-transform: none;
			}
		}
	}

	.money-card {
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 28rpx;
		margin: 24rpx 38rpx 0 38rpx;
		padding: 26rpx 0;


		.money-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
		}

		.money-item {
			text-align: center;
			margin-bottom: 46rpx;

			.amount {
				font-family: "DINPro-Bold", sans-serif;
				font-weight: bold;
				font-size: 30rpx;
				color: #000000;
				line-height: 40rpx;
				text-align: center;
				font-style: normal;
				height: 40rpx;
			}

			.label {
				font-family: "DINPro-Regular", sans-serif;
				font-weight: 400;
				font-size: 20rpx;
				color: #1C2D57;
				line-height: 24rpx;
				text-align: center;
				font-style: normal;
				margin-top: 10rpx;
				height: 48rpx;
			}
		}

	}

	.button-group {
		display: flex;
		justify-content: space-evenly;
		margin-top: -32rpx;
		padding: 0 38rpx;

		.btn {
			width: 172rpx;
			height: 64rpx;
			border-radius: 320rpx;
			font-family: "DINPro-Bold", sans-serif;
			font-weight: bold;
			font-size: 24rpx;
			color: #FFFFFF;
			line-height: 64rpx;
			text-align: center;
			font-style: normal;
			text-transform: none;

			&.deposit {
				background: $themeColor;
				box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
			}

			&.withdraw {
				background: linear-gradient(45deg, #FFBD56 0%, #FFAB28 100%);
				box-shadow: 0rpx 4rpx 16rpx 0rpx #FFD89C;
			}
		}
	}

	.function-card {
		margin: 72rpx 80rpx 0 80rpx;


		.function-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);

			.function-item {
				text-align: center;
				margin-bottom: 50rpx;

				image {
					width: 80rpx;
					height: 80rpx;
				}

				text {
					display: block;
					font-family: "DINPro-Regular", sans-serif;
					font-weight: 400;
					font-size: 20rpx;
					color: #1C2D57;
					line-height: 24rpx;
					text-align: center;
					font-style: normal;
					margin-top: 12rpx;
				}
			}
		}
	}

	.btn_img {
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
	}

	.prompt_pop_page {
		width: 570rpx;
		background: #FFFFFF;
		border-radius: 28rpx;
		padding: 40rpx 54rpx 28rpx 54rpx;
	}

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

	.prompt_cancel_btn {
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
</style>