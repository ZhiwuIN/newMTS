<template>
	<view>
		<customnavbar backgroundStr="url('/static/mine/mine_bg.png') top left/100%  no-repeat" @mtop="mtop"
			:white-title="true" :showBack="false" :isHome="true" :hasMessage="userInfo.hasMessage">
			<template #right-content>
				<!-- <img v-if="myPosition.image" :src="myPosition.image" style="width: 100%;height: 100%;"> -->
			</template>
			<view class="mine-container">
				<view class="mine_top_bg" :style="topStyle">
					<!-- 个人信息区域 -->
					<view class="user-info">
						<view class="avatarBox" @click="pushAccount">
							<image class="avatar_img" mode="aspectFill"
								:src="userInfo.avatar ? userInfo.avatar : '/static/default-avatar.png'">
							</image>
							<view class="avatarEdit_img_Box">
								<image class="avatarEdit_img" src="/static/mine/editAvatar.png"></image>
							</view>
						</view>

						<view class="user-detail">
							<view class="user_name">{{ userInfo.username || '--' }}</view>
							<view class="user_phone">{{ userInfo.phone || '--' }}</view>
						</view>
					</view>

					<!-- 资金明细卡片 -->
					<view class="money-card">
						<view class="money-grid">
							<view class="money_max_box">
								<view class="money_box">
									<view class="label">{{ $t('mine.AccountBalance') }}</view>
									<view class="amount">{{ userInfo.accountBalance || '0' }}</view>
									<view class="btn" v-if="userInfo.userType != 'test'"
										@click="toPage2('/pages/HomePage/RechargeChannel')">{{ $t('mine.Deposit') }}
									</view>
								</view>
								<view class="line"></view>
								<view class="money_box">
									<view class="label">{{ $t('mine.TotalIncome') }}</view>
									<view class="amount">{{ userInfo.totalRevenue || '0' }}</view>
									<view class="btn" style="background-color: #ffae31;"
										@click="isRestrictAccess ? this.$refs.promptpopup_access.open() : toPage2('/pages/MinePage/withdrawal')">
										{{
											$t('mine.Withdrawal') }}
									</view>
								</view>
							</view>

							<view>
								<view class="money_list">
									<view class="money-item">
										<view class="label">{{ $t('mine.Totalwithdrawals') }}</view>
										<view class="amount">{{ userInfo.totalWithdrawals || '0' }}</view>
									</view>
									<view class="money-item">
										<view class="label">{{ $t('mine.MonthlyRevenue') }}</view>
										<view class="amount">{{ userInfo.monthlyRevenue || '0' }}</view>
									</view>
									<view class="money-item">
										<view class="label">{{ $t('mine.DailyRevenue') }}</view>
										<view class="amount">{{ userInfo.dailyRevenue || '0' }}</view>
									</view>
									<view class="money-item">
										<view class="label">{{ $t('mine.TotalProfits') }}</view>
										<view class="amount">{{ userInfo.totalProfits || '0' }}</view>
									</view>
								</view>
								<view style="grid-template-columns: repeat(2, 1fr);padding: 0 30rpx;"
									class="money-grid">
									<view class="money-item">
										<view class="label"><text>{{ splitText($t('保证金')) }}</text></view>
										<view class="amount" v-if="userInfo.levelCode == '0'">{{ '0' }}</view>
										<view class="amount" v-else>{{ userInfo.depositAmount || '0' }}</view>
									</view>
									<view class="money-item">
										<view class="label"><text>{{ $t('第一次购买等级日期') }}</text></view>
										<view class="amount" v-if="userInfo.levelCode == '0'">{{ '--' }}</view>
										<view class="amount" v-else>{{ userInfo.firstPurchaseLevelDate || '--' }}</view>
									</view>
								</view>
							</view>


						</view>
					</view>
				</view>


				<!-- 邀请链接 区域 -->
				<!-- <view class="invitation_sction" v-if="userInfo.levelCode != 0">
					<view class="invitation_card">
						<img style="height: 100%;width: 100%;" src="/static/mine/share.png" alt="">
						<text class="link">{{ qrcodeUrl }}</text>
						<view v-if="userInfo.invitationCode" class="copy-btn" @click="copy_invitation_url">{{ $t("点击复制")
						}}</view>
					</view>
				</view> -->

				<!-- 功能入口卡片 -->
				<view class="function-card">
					<!-- 等级职位 -->
					<view class="user_card">
						<view class="member_card" @click="toPage3('/pages/LevelPage/index')">
							<view class="member_card_img" v-if="myvipInfo?.image">
								<image style="width: 100%;height: 100%;" :src="myvipInfo?.image"></image>
							</view>
							<view class="card_text">
								{{ userInfo?.levelName }}
							</view>
						</view>
						<view class="line"></view>
						<view class="member_card"
							@click="toPage3('/pages/HomePage/postManage?title=Management+Positions')">
							<view class="member_card_img" v-if="myPosition?.image">
								<image style="width: 100%;height: 100%;" :src="myPosition?.image">
								</image>
							</view>
							<view class="card_text"
								:style="{ paddingLeft: myPosition?.positionName ? '0' : '20rpx', fontSize: myPosition?.positionName ? '28rpx' : '24rpx' }">
								{{ myPosition?.positionName ? myPosition?.positionName : $t("暂无职位") }}
							</view>
						</view>
					</view>
					<view class="function-grid">
						<!-- 上面四个 -->
						<view class="function-item" @click="toPage(item)" v-for="item in firstFourItems">
							<image :src="item?.iconUrl" :lazy-load="true"></image>
							<text>{{ splitText(item?.menuName) }}</text>
						</view>
					</view>
				</view>

				<!-- k认证 -->
				<view class="shebaoFund_box" v-if="kAuthInfo.activitySwitch">
					<image @click="toPageUrl(kAuthInfo.targetUrl)"
						:src="kAuthInfo.image || '/static/Certification/kAuthImg.png'"
						class="shebaoFund_img" mode="widthFix">
					</image>
				</view>

				<!-- 社保基金 -->
				<view class="shebaoFund_box" v-if="showShebaoFund">
					<image @click="toPageUrl('/pages/SocialSecurityFundPage/index')"
						:src="shebaoFundImage || '/static/SocialSecurityFund/shebaoFundImage.png'"
						class="shebaoFund_img" mode="widthFix">
					</image>
				</view>


				<!-- 功能卡片2 -->
				<view class="function-card2">
					<view class="function-grid">
						<view class="function-item" @click="toPage(item)" v-for="item in remainingItems">
							<view class="item_left">
								<image :src="item?.iconUrl" :lazy-load="true"></image>
								<text>{{ (item?.menuName) }}</text>
							</view>
							<image class="item_right" src="/static/mine/right.png"></image>
						</view>
					</view>
				</view>
			</view>
		</customnavbar>
		<uni-popup ref="promptpopup" type="center">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ $t('请先实名') }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_cancel_btn" @click="prompt_cancel">{{ $t('pay.no') }}</button>
					<button class="prompt_confirm_btn" @click="prompt_confirm">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="promptpopup_yes" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ pop_message }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm_yes">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="promptpopup_access" type="center">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ this.$t("withdrawal.restrictedAccess") }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="this.$refs.promptpopup_access.close()">{{ $t('pay.yes')
					}}</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	kAuthInfoApi
} from '@/common/api/Certification.js'
import {
	userInfoApi,
	logoutApi,
	settingsApi
} from "@/common/api/users.js";
import {
	menuListApi
} from "@/common/api/home.js";
import {
	vipInfoApi,
} from "@/common/api/level.js";
import {
	positionMyPositionApi,
} from '@/common/api/position.js'
import {
	shebaoFundConfigApi
} from "@/common/api/SocialSecurityFund.js";
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			kAuthInfo: {},
			menuList: [],
			topStyle: 0,
			userInfo: {},
			myPosition: {},
			myvipInfo: {},
			isRestrictAccess: false,
			showShebaoFund: 0,
			shebaoFundImage: ''
		}
	},
	onShow() {
		positionMyPositionApi().then(res => this.myPosition = res.data)
		settingsApi().then((res) => {
			uni.setStorageSync('settings', res.data)
		}).catch(err => {
			console.log('request fail', err);
			if (err.data?.code == 403) {
				this.$showMessage('warning', err.data?.msg);
			} else {
				this.$showMessage('warning', err.msg);
			}
		})
		userInfoApi().then((res) => {
			this.userInfo = res.data
			if (this.userInfo.firstPurchaseLevelDate) {
				this.userInfo.firstPurchaseLevelDate = this.userInfo.firstPurchaseLevelDate.split(' ')[0]
			}
			this.isRestrictAccess = res.data.housekeeper == 1 ? true : false
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
			this.getMenuListApi()
			vipInfoApi().then(vipinfo => this.myvipInfo = vipinfo.data.list.filter(v => v.levelCode == res.data
				.levelCode)[0])
				.catch(err =>
					this.$showMessage('warning', err.msg)
				)
		}).catch((err) => {
			this.$showMessage('warning', err.msg);
		})
		this.getShebaoFundOverview()
		kAuthInfoApi().then(res => {
			this.kAuthInfo = res.data
		})
	},
	computed: {
		firstFourItems() {
			return this.menuList.slice(0, 4);
		},
		remainingItems() {
			return this.menuList.slice(4);
		}
	},
	methods: {
		// 社保基金
		getShebaoFundOverview() {
			shebaoFundConfigApi().then(res => {
				this.showShebaoFund = res.data.activitySwitch
				this.shebaoFundImage = res.data.image
			})
		},
		// 个人中心菜单
		getMenuListApi() {
			menuListApi({
				type: 'personal'
			}).then(res => {
				this.menuList = res.data
				if (this.userInfo.levelCode == '0') {
					this.menuList = this.menuList.filter(item => {
						return item.canEnterIntern != false;
					});
				}
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		// 实名校验
		toPage2(path) {
			if (!this.userInfo.realName) {
				this.$refs.promptpopup.open()
				return
			}
			uni.navigateTo({
				url: path
			})
		},
		// 实习生跳转限制
		toPageTeamExpansion(path) {
			if (this.userInfo.levelCode == '0') {
				this.$showMessage('warning', this.$t('实习生没有权限'))
				return
			}
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
		toPage(value) {
			uni.setStorageSync('pageTitle', value.menuName)
			const {
				canEnterButlerMode, // 管家模式
				canEnterIntern, // 实习生
				allowUnverifiedAccess, // 实名
				targetValue // 地址
			} = value
			// 实名校验
			if (allowUnverifiedAccess == false) {
				this.toPage2(targetValue)
				return
			}
			// 实习生不能进
			if (canEnterIntern == false && this.userInfo.levelCode == '0') {
				this.toPageTeamExpansion(targetValue)
				return
			}
			// 管家模式不允许进入
			if (canEnterButlerMode == false && this.isRestrictAccess) {
				this.$refs.promptpopup_access.open()
				return
			}
			uni.navigateTo({
				url: targetValue
			})
		},
		toPage3(path) {
			return
			if (path == '/pages/LevelPage/index') {
				uni.switchTab({
					url: path
				})
			} else {
				uni.navigateTo({
					url: path
				})
			}
		},
		toPageUrl(url) {
			uni.navigateTo({
				url
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
			// 添加缓存避免重复计算
			if (!t) return '';

			const lang = uni.getStorageSync('settings')?.defaultLanguage || 'fr';
			const cacheKey = `${lang}_${t}`;

			if (this.textCache && this.textCache[cacheKey]) {
				return this.textCache[cacheKey];
			}

			let result;
			if (lang === 'fr') {
				const parts = t.split(' ');
				result = parts.length > 1 ? parts[0] + ' ' + parts[1] + '\n' + parts.slice(2).join(' ') : t;
			} else {
				result = t.split(' ').join('\n');
			}

			// 缓存结果
			if (!this.textCache) this.textCache = {};
			this.textCache[cacheKey] = result;

			return result;
		}
	}
}
</script>

<style lang="scss" scoped>
.mine-container {
	background-color: #f5f5f5;
	padding-bottom: 40rpx;
}

.mine_top_bg {
	width: 750rpx;
	background: url('/static/mine/mine_bg.png') top left/100% no-repeat;
	// background-color: 	linear-gradient(225deg, rgb(255, 192, 20) 44%, rgb(255, 179, 27) 100%) 0% 0% / cover;
}

.user_card {
	display: flex;
	align-items: center;
	width: 690rpx;
	margin: 0 auto;
	background: linear-gradient(178deg, #7cb7ff 0%, #287DD4 100%);
	border-radius: 20rpx;
	// height: 128rpx;

	.line {
		width: 1rpx;
		height: 76rpx;
		background: #FFFFFF;
		opacity: 0.3;
	}

	.member_card {
		display: flex;
		align-items: center;
		padding: 20rpx;
		width: 344rpx;

		.member_card_img {
			width: 100rpx;
			min-width: 100rpx;
			height: 100rpx;
			margin-right: 20rpx;
		}

		.card_text {
			font-family: PingFangSC, PingFang SC;
			font-weight: 500;
			font-size: 28rpx;
			color: #fff;
			line-height: 34rpx;
			text-align: left;
			font-style: normal;
		}
	}
}

.user-info {
	display: flex;
	margin: 0rpx 38rpx;

	.avatarBox {
		position: relative;

		.avatar_img {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			background: #EBF5FF;
		}

		.avatarEdit_img_Box {
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			right: 4rpx;
			bottom: 4rpx;
			width: 40rpx;
			height: 40rpx;
			border-radius: 50%;
			background-color: rgba(0, 0, 0, .6);

			.avatarEdit_img {
				width: 20rpx;
				height: 20rpx;
			}
		}
	}

	.user-detail {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10rpx;
		height: 120rpx;
		margin-left: 30rpx;

		.user_name {
			font-family: PingFangSC, PingFang SC;
			font-weight: 500;
			font-size: 36rpx;
			color: #fff;
			text-align: left;
			font-style: normal;
			text-transform: none;
		}

		.user_phone {
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 24rpx;
			color: #FFFFFF;
			text-align: left;
			font-style: normal;
			text-transform: none;
		}

	}
}

.invitation_sction {
	padding: 0 40rpx;
	height: 200rpx;
	margin-top: 40rpx;

	.invitation_card {
		position: relative;

		.link {
			position: absolute;
			right: 10rpx;
			bottom: 80rpx;
			width: 46%;
			font-family: "DINPro-Regular";
			font-size: 20rpx;
		}

		.copy-btn {
			position: absolute;
			right: 40rpx;
			bottom: 40rpx;
			font-family: "DINPro-Regular";
			font-size: 20rpx;
			color: blue;
			cursor: pointer;
		}
	}
}

.money-card {
	width: 690rpx;
	margin: 40rpx auto 20rpx;
	padding: 40rpx 0;
	background: #fff;
	box-shadow: inset 0rpx 2rpx 4rpx 0rpx rgba(255, 255, 255, 0.5);
	border-radius: 20rpx;


	.money-grid {
		display: grid;
		border-radius: 8rpx;

		.money-item {
			text-align: center;
			background: #f4f7fe;
			padding: 14rpx 20rpx;

			.amount {
				font-family: PingFangSC, PingFang SC;
				font-weight: 500;
				font-size: 24rpx;
				color: #000000;
				// line-height: 34rpx;
				text-align: center;
				font-style: normal;
			}

			.label {
				display: flex;
				align-items: center;
				justify-content: center;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 16rpx;
				color: #666666;
				text-align: center;
				font-style: normal;
				height: 40rpx;
				margin-bottom: 10rpx;
				// white-space: nowrap;
			}
		}

		.money_max_box {
			display: flex;
			align-items: start;
			justify-content: center;
			margin-bottom: 20rpx;

			.line {
				width: 1rpx;
				height: 112rpx;
				background: #000000;
				opacity: 0.3;
				margin-top: 12rpx;
			}

			.money_box {
				width: 334rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				gap: 10rpx;

				.amount {
					font-family: PingFangSC, PingFang SC;
					font-weight: 500;
					font-size: 36rpx;
					color: #000000;
					text-align: center;
					font-style: normal;
				}

				.label {
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 20rpx;
					color: #666666;
					text-align: center;
					font-style: normal;
				}

				.btn {
					width: 148rpx;
					height: 44rpx;
					background: $themeColor;
					border-radius: 8rpx;
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 20rpx;
					color: #FFFFFF;
					line-height: 44rpx;
					text-align: center;
					font-style: normal;
					text-transform: none;
				}
			}
		}

		.money_list {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			margin: 0 30rpx;
			border-radius: 8rpx;

			.money-item {
				text-align: center;
				background: #f4f7fe;
				padding: 14rpx 20rpx;

				.amount {
					font-family: PingFangSC, PingFang SC;
					font-weight: 500;
					font-size: 24rpx;
					color: #000000;
					// line-height: 34rpx;
					text-align: center;
					font-style: normal;
				}

				.label {
					display: flex;
					align-items: center;
					justify-content: center;
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 16rpx;
					color: #666666;
					text-align: center;
					font-style: normal;
					height: 40rpx;
					margin-bottom: 10rpx;
					// white-space: nowrap;
				}
			}
		}


	}

}

.function-card {
	box-sizing: border-box;
	background-color: #fff;
	// box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 20rpx;
	width: 690rpx;
	margin: 20rpx auto;


	.function-grid {
		padding: 40rpx 12rpx;
		display: grid;
		grid-template-columns: repeat(4, 1fr);

		.function-item {
			text-align: center;
			// margin-bottom: 50rpx;

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

.shebaoFund_box {
	box-sizing: border-box;
	width: 690rpx;
	margin: 0 auto;
	margin-bottom: 16rpx;
	display: flex;
	justify-content: center;

	.shebaoFund_img {
		width: 690rpx;
	}

}

.function-card2 {
	box-sizing: border-box;
	background-color: #fff;
	width: 690rpx;
	margin: 0 auto;
	background: #FFFFFF;
	border-radius: 20rpx;


	.function-grid {
		padding: 0 30rpx;

		.function-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 0;
			border-bottom: 1rpx solid #EFEFEF;
			// margin-bottom: 50rpx;

			&:last-child {
				border-bottom: none;
			}

			.item_left {
				display: flex;
				align-items: center;

				image {
					width: 48rpx;
					height: 48rpx;
				}

				text {
					font-family: DINPro, DINPro;
					font-weight: 400;
					font-size: 24rpx;
					color: #1C2D57;
					// line-height: 30rpx;
					margin-left: 30rpx;
					text-align: left;
					font-style: normal;
				}
			}

			.item_right {
				width: 30rpx;
				height: 30rpx;
			}
		}
	}
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
		background: linear-gradient(90deg, $gradualColor2 0%, $gradualColor1 100%);
		// box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 16rpx;
		font-family: "DINPro-Black", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #fff;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}
}
</style>