<template>
	<view class="">
		<customnavbar backgroundStr="url('/static/home/home_bg.png') top left/100%  no-repeat" :showBack="false"
			@mtop='mtop' :isHome="true" :hasMessage="userInfo.hasMessage">
			<view class="home_container">
				<view class="home_top_bg" :style="topStyle">
					<view class="home_top_title1">{{$t('home.hello')}}{{userInfo?.levelName || ' --'}}</view>
					<view class="home_top_title1" style="font-size: 48rpx;" v-if="userInfo?.positionName">
						{{userInfo?.positionName}}
					</view>
					<view class="home_top_title2">{{$t('home.Welcome')}}</view>
					<view class="flex_center">
						<view class="home_top_center">
							<view class="avatar_container">
								<view class="avatar_box">
									<image :src="userInfo.avatar ?  userInfo.avatar : '/static/default-avatar.png'"
										mode="aspectFill" alt="" class="avatar_img" />
								</view>
								<view class="level_box">
									<image src="/static/home/level.svg" mode="" class="level_img"></image>
								</view>
							</view>
							<view class="home_top_center_right">
								<view class="account_balance_box">
									<image src="/static/home/accountbalance.svg" mode="" class="account_balance_img">
									</image>
									<view class="">{{$t('home.Accountbalance')}}</view>
								</view>
								<view class="account_balance_t">
									{{userInfo?.accountBalance || '--'}} {{ currency }}
								</view>
								<view class="withdrawal_btn" @click="toWithdrawal" v-if="userType != 'test'">
									{{$t('home.Withdrawal')}}
								</view>
							</view>
						</view>
					</view>

				</view>
				<view class="home_center_box">
					<view class="center_item_box">
						<view class="center_item"
							@click="toPage('/pages/commonListPage?title='+$t('home.CompanyActivity')+'&groupId=1')">
							<view class="flex_center">
								<image src="/static/home/Company Activities.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("home.CompanyActivity"))}}</text>
							</view>
						</view>
						<view class="center_item"
							@click="toPage('/pages/commonListPage?title='+$t('home.ConferenceNews')+'&groupId=2')">
							<view class="flex_center">
								<image src="/static/home/Conference News.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("home.ConferenceNews"))}}</text>
							</view>
						</view>
						<view class="center_item"
							@click="toPage('/pages/commonListPage?title='+$t('home.Memberbenefits')+'&groupId=3')">
							<view class="flex_center">
								<image src="/static/home/Member Benefits.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("home.Memberbenefits"))}}</text>
							</view>
						</view>
						<view class="center_item" @click="toPage('/pages/HomePage/postManage')">
							<view class="flex_center">
								<image src="/static/home/Management Positions.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("home.Postmanage"))}}</text>
							</view>
						</view>
					</view>
					<view class="center_item_box" style="margin-top: 40rpx;">
						<view class="center_item" @click="toPageTeamExpansion('/pages/HomePage/teamExpansion')">
							<view class="flex_center">
								<image src="/static/home/Team Expansion.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("home.Teamexpansion"))}}</text>
							</view>
						</view>
						<view class="center_item" @click="toPage2('/pages/HomePage/lotteryPage')">
							<view class="flex_center">
								<image src="/static/home/Lucky_Wheel.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("home.Luckyturntable"))}}</text>
							</view>
						</view>
						<view class="center_item" @click="toPage('/pages/HomePage/financePage')">
							<view class="flex_center">
								<image src="/static/home/Financial Products.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("home.Financialproducts"))}}</text>
							</view>
						</view>
						<view class="center_item" @click="toPage('/pages/HomePage/RechargeChannel')"
							v-if="userType != 'test'">
							<view class="flex_center">
								<image src="/static/home/Deposit.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("mine.Deposit"))}}</text>
							</view>
						</view>
						<view class="center_item" style="opacity: 0;" v-if="userType == 'test'">
							<view class="flex_center">
								<image src="/static/home/Deposit.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("mine.Deposit"))}}</text>
							</view>
						</view>
						<!-- 	<view class="center_item">
							<view class="flex_center">
								<image src="/static/home/appDownload.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("mine.APPDownload"))}}</text>
							</view>
						</view> -->
					</view>
					<!-- 	<view class="center_item_box" style="margin-top: 40rpx;" v-if="userType != 'test'">
						<view class="center_item">
							<view class="flex_center">
								<image src="/static/home/appDownload.png" class="icon-wrapper" />
							</view>
							<view class="center_item_t">
								<text>{{splitText($t("mine.APPDownload"))}}</text>
							</view>
						</view>
					</view> -->
				</view>

				<view class="noticebar" v-if="noticeList?.length">
					<l-notice-bar :marquee="true" :vertical="true" leftIcon="/static/home/horn.svg" :iconSize="40"
						:text="noticeList" />
				</view>

				<view style="padding: 62rpx 0 0 50rpx;">
					<swiper :autoplay="true" @change="handleChange" style="height: 346rpx" next-margin="46rpx">
						<swiper-item v-for="(item, index) in swiperList" :key="index" style="height: 346rpx">
							<image @click="pushUrl(item.pushUrl)" :src=" item.imgPath" class="swiper_img"></image>
						</swiper-item>
					</swiper>
					<view class="dots_box">
						<view v-for="i in swiperList.length" :key="i">
							<view :class="currentSwiperi == (i-1)?'dots_a':'dots'">
							</view>
						</view>
					</view>
				</view>
				<view style="padding:  4rpx 50rpx 50rpx 50rpx" @click="toCompanyInfo">
					<view style="display: flex;justify-content: space-between;">
						<view class="company_profile_t">{{$t("home.CompanyProfile")}}</view>
						<image src="/static/home/more.svg" class="more_icon"></image>
					</view>
					<rich-text :nodes="companyInfo" class="company_profile_t2">
					</rich-text>
				</view>
			</view>
		</customnavbar>
		<uni-popup ref="popup" placement="center" destroy-on-close>
			<view class="login_pop">
				<view class="flex_center mt_58">
					<image src="/static/home/login_icon.png" alt="" class="login_icon" />
				</view>
				<view class="pop_title">{{$t("home.Prompt")}}</view>
				<view class="flex_center">
					<view class="pop_desc">{{$t("home.PromptTips")}}</view>
				</view>
				<view class="flex_center">
					<view class="pop_logon_btn" @click="toLogon">{{$t("home.logon")}}</view>
				</view>
				<view class="flex_center">
					<view class="pop_cancel_btn" @click="popCancel">{{$t("home.cancel")}}</view>
				</view>
			</view>
		</uni-popup>

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
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue';
	import {
		companyInfoApi,
		slideListApi
	} from "@/common/api/home.js";
	import {
		userInfoApi,
		settingsApi
	} from "@/common/api/users.js";

	import {
		formatRichText,
		getFirstTextTagWithEllipsis
	} from "@/utils/utils.js"
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				url: 'http://13.245.95.135:8888',
				// url: 'http://192.168.2.35:8080',
				content1: ['xxx成功提现2000余额', '恭喜xxx抽中4000奖励'],
				currency: '',
				topStyle: '',
				swiperList: [],
				companyInfo: '',
				currentSwiperi: 0,
				userInfo: {},
				noticeList: [],
				userType: 'test'
			}
		},
		methods: {
			handleMessage(event) {
				console.log('Message from web:', event.detail.data);
			},
			// 跳转链接
			pushUrl(url) {
				if (url) {
					// #ifdef APP-PLUS
					plus.runtime.openURL(url);
					// #endif

					// #ifdef H5
					window.location.href = url;
					// #endif
				} else {
					return
				}
			},
			mtop(e) {
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
				// #ifdef H5
				// #endif
				// #ifdef APP-PLUS
				// this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + e + "rpx"
				// #endif
			},
			getSettings() {
				settingsApi().then((res) => {
					uni.setStorageSync('settings', res.data)
					this.currency = uni.getStorageSync('settings').currency
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
					// uni.showToast({
					// 	title: err.msg,
					// 	icon: 'none'
					// })
				})
			},
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				if (!token) {
					this.$refs.popup.open()
					return false;
				}
				return true;
			},
			getUserInfo() {
				userInfoApi().then((res) => {
					this.userInfo = res.data
					this.userType = res.data.userType
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
					// uni.showToast({
					// 	title: err.msg,
					// 	icon: 'none'
					// })
				})
			},
			getSlideListApi() {
				slideListApi().then((res) => {
					this.swiperList = res.rows || []
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
					// uni.showToast({
					// 	title: err.msg,
					// 	icon: 'none'
					// })
				})
			},
			toPage(path) {
				// if (path == '/pages/HomePage/RechargeChannel' && !this.userInfo.realName) {
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
			toPage2(path) {
				let {
					pointWheel,
					luckyWheel
				} = uni.getStorageSync('settings')
				if (pointWheel == 0 && luckyWheel == 0) {
					this.$showMessage('warning', this.$t('暂未开放'));
					return
				}
				uni.navigateTo({
					url: path
				})
			},
			toPageTeamExpansion(path) {
				if (this.userInfo.levelCode == '0') {
					this.$showMessage('warning', this.$t('实习生没有邀请权限'))
					return
				}
				uni.navigateTo({
					url: path
				})
			},
			handleChange(e) {
				this.currentSwiperi = e.detail.current
			},
			toCompanyInfo() {
				uni.navigateTo({
					url: "/pages/HomePage/companyInfo"
				})
			},
			toLogon() {
				uni.navigateTo({
					url: "/pages/LoginPage/login"
				})
			},
			popCancel() {
				this.$refs.popup.close()
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
			getCompanyInfo() {
				companyInfoApi().then((res) => {
					this.companyInfo = getFirstTextTagWithEllipsis(res.data.companyIntroduction)
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
					// uni.showToast({
					// 	title: err.msg,
					// 	icon: 'none'
					// })
				})
			},
			toWithdrawal() {
				uni.navigateTo({
					url: '/pages/MinePage/withdrawal'
				})
			}

		},
		onShow() {
			this.getCompanyInfo()
			this.getUserInfo()
			this.getSlideListApi()
			this.noticeList = uni.getStorageSync('settings').noticeList
			// uni.setTabBarBadge({index: 2})
		},
		mounted() {
			this.getSettings()
			this.checkLoginStatus()
		}
	}
</script>

<style lang="scss" scoped>
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

<style lang="scss" scoped>
	.home_container {
		background-color: #FFFFFF;
	}

	.home_top_bg {
		width: 100%;
		background: url('/static/home/home_bg.png') top left/100% no-repeat;
	}

	.home_top_center {
		width: 650rpx;
		height: 256rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 40rpx;
		margin-top: 52rpx;
		display: flex;
	}

	.home_center_box {
		margin: 72rpx 24rpx 32rpx;
	}

	.noticebar {
		box-sizing: border-box;
		width: 100%;
		height: 80rpx;
		padding: 0 50rpx;
	}

	.center_item_box {
		display: flex;
	}

	.center_item {
		flex: 1;
	}

	.icon-wrapper {
		width: 140rpx;
		height: 140rpx;
		// background: #F5F8FF;
		// box-shadow: 0rpx 12rpx 16rpx 0rpx #E9F3FF;
		// border-radius: 24rpx;
		// border: 2rpx solid;
		// border-image: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 254, 254, 1)) 2 2;
	}

	.center_item_t {
		height: 48rpx;
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 20rpx;
		color: #1C2D57;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateY(-39%);
		// margin-top: 12rpx;
	}

	.swiper_img {
		width: 606rpx;
		height: 346rpx;
		border-radius: 32rpx;
	}

	// uni-swiper-item:nth-child(2) {
	// 	transform: translate(calc(100% - 48rpx), 0px) translateZ(0px) !important;
	// }

	.speaker_icon {
		width: 40rpx;
		height: 40rpx;
	}

	.more_icon {
		width: 40rpx;
		height: 40rpx;
	}

	.login_pop {
		width: 616rpx;
		border-radius: 40rpx;
		background-color: rgba(255, 255, 255, 1);
	}

	.login_icon {
		width: 248rpx;
		height: 218rpx;
		margin-top: 90rpx;
	}

	.flex_center {
		display: flex;
		justify-content: center;
	}

	.mt_58 {
		margin-top: 58rpx;
	}

	.pop_title {
		line-height: 50rpx;
		color: rgba(0, 211, 224, 1);
		font-size: 36rpx;
		text-align: center;
		font-family: "Roboto-regular", sans-serif;
		margin-top: 27rpx;
	}

	.pop_desc {
		width: 360rpx;
		line-height: 36rpx;
		color: rgba(51, 51, 51, 1);
		font-size: 30rpx;
		font-family: "Roboto-regular", sans-serif;
		text-align: center;
		margin-top: 25rpx;
	}

	.pop_logon_btn {
		width: 500rpx;
		height: 80rpx;
		line-height: 80rpx;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		font-family: 'DINPro-Bold', DINPro;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		text-align: center;
		font-style: normal;
		text-transform: none;
		margin-top: 78rpx;
	}

	.pop_cancel_btn {
		width: 500rpx;
		height: 80rpx;
		line-height: 80rpx;
		color: rgba(51, 51, 51, 1);
		background-color: rgba(244, 244, 244, 1);
		border-radius: 24rpx;
		font-family: 'DINPro-Bold', DINPro;
		font-weight: bold;
		text-align: center;
		font-style: normal;
		text-transform: none;
		font-size: 36rpx;
		margin-top: 30rpx;
		margin-bottom: 70rpx;
	}


	.home_top_title1 {
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 72rpx;
		color: #FFFFFF;
		margin-left: 48rpx;
	}

	.home_top_title2 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #EDEDED;
		line-height: 42rpx;
		text-align: left;
		font-style: normal;
		margin-left: 48rpx;
		margin-top: 6rpx;
	}

	.avatar_box {
		position: relative;
		width: 124rpx;
		height: 140rpx;
		background: #EBF5FF;
		clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
	}

	.avatar_img {
		width: 124rpx;
		height: 140rpx;
	}

	.avatar_mask {
		width: 124rpx;
		height: 140rpx;
		position: absolute;
		top: 0;
		left: 0;
	}

	.level_img {
		width: 92rpx;
		height: 86rpx;
	}

	.avatar_container {
		margin: 38rpx 62rpx 0rpx 52rpx;
		width: 124rpx;
	}

	.level_box {
		display: flex;
		justify-content: center;
		margin-top: -50rpx;
	}

	.account_balance_box {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		display: flex;
		margin-top: 36rpx;
		align-items: center;
		margin-left: 8rpx;
	}

	.account_balance_img {
		width: 34rpx;
		height: 34rpx;
		margin-right: 20rpx;
	}

	.account_balance_t {
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 48rpx;
		color: #000000;
		line-height: 62rpx;
		text-align: left;
		font-style: normal;
		margin-top: 24rpx;
		margin-bottom: 20rpx;
		margin-left: 8rpx;
	}

	.withdrawal_btn {
		width: 172rpx;
		height: 52rpx;
		background-color: $themeColor;
		border-radius: 26rpx;
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 24rpx;
		color: #FFFFFF;
		line-height: 52rpx;
		text-align: center;
		font-style: normal;
	}

	.company_profile_t {
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 32rpx;
		color: #1C2D57;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.company_profile_t2 {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #1C2D57;
		line-height: 38rpx;
		text-align: justify;
		font-style: normal;
		margin-top: 18rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dots_box {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20rpx;
		margin-bottom: 32rpx;
	}

	.dots {
		width: 16rpx;
		height: 16rpx;
		background: #C6D7FF;
		border-radius: 8rpx;
		margin: 0 8rpx;
	}

	.dots_a {
		width: 16rpx;
		height: 16rpx;
		background-color: $themeColor;
		border-radius: 8rpx;
		margin: 0 8rpx;
	}
</style>