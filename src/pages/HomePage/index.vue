<template>
	<view class="">
		<customnavbar backgroundStr="url('/static/home/home_bg.png') top left/100%  no-repeat" :showBack="false"
			@mtop='mtop' :isHome="true" :hasMessage="userInfo.hasMessage">
			<view class="home_container">
				<view class="home_top_bg" :style="topStyle">
					<!-- :bgColor="'rgba(240, 248, 255, 0.2)'" -->
					<view class="noticebar noticebar_top" v-if="isShowMessage2" :style="topStyle2">
						<l-notice-bar :marquee="true" leftIcon="/static/home/horn4.png" :interval="0" :loop="-1"
							:delay="500" :iconSize="40" :text="[rollContent]"
							bgColor="url('/static/home/top_gg.png') no-repeat top left / cover" :color="'#fff'"
							@click="onclicktopgg()" style="box-sizing: border-box;margin: 0 36rpx;" />
					</view>

					<view class="home_top_title1">{{ $t('home.hello') }}{{ userInfo?.levelName || ' --' }}</view>
					<view class="home_top_title1" style="font-size: 48rpx;" v-if="userInfo?.positionName">
						{{ userInfo?.positionName }}
					</view>
					<view class="home_top_title2">{{ $t('home.Welcome') }}</view>
					<view class="flex_center">
						<view class="home_top_center">
							<view class="avatar_container">
								<view class="avatar_box">
									<image :lazy-load="true"
										:src="userInfo.avatar ? userInfo.avatar : '/static/default-avatar.png'"
										mode="aspectFill" alt="" class="avatar_img" />
								</view>
								<view class="level_box">
									<image :lazy-load="true" src="/static/home/level.svg" mode="" class="level_img">
									</image>
								</view>
							</view>
							<view class="home_top_center_right">
								<view class="account_balance_box">
									<image :lazy-load="true" src="/static/home/accountbalance.svg" mode=""
										class="account_balance_img">
									</image>
									<view class="">{{ $t('home.Accountbalance') }}</view>
								</view>
								<view class="account_balance_t">
									{{ userInfo?.accountBalance || '--' }} {{ currency }}
								</view>
								<view class="withdrawal_btn" @click="toWithdrawal" v-if="userType != 'test'">
									{{ $t('home.Withdrawal') }}
								</view>
							</view>
						</view>
					</view>
				</view>
				<!-- 每日工资提取 -->
				<view class="home_salary_box">
					<image src="/static/home/darller.png" :lazy-load="true" mode="" class="home_salary_box_img"></image>
					<view class="home_salary_box_v_c">
						<!-- 如果职位不存在 -->
						<text class="home_salary_box_v_c_t" v-if="!userInfo.position">{{
							$t('home.getPositions') }}</text>
						<!-- 已领取 -->
						<text class="home_salary_box_v_c_t" v-else-if="salaryIsGet">Received today</text>
						<!-- 职位任务未达标 -->
						<text class="home_salary_box_v_c_t" v-else-if="userInfo.compliance == 0">{{
							$t("Performancetargetnotmet") }}</text>
						<!-- 未到发薪日 -->
						<text class="home_salary_box_v_c_t" v-else-if="!salaryIsGet && NoPayday">{{ NoPayday }}</text>
						<!-- 薪资未领取 -->
						<text class="home_salary_box_v_c_t" v-else-if="!salaryIsGet">{{ $t('home.TodaySalary') }} :
							<text>{{ todaySalary }}</text> {{ currency }}</text>
						<text class="home_salary_box_v_c_t" v-else>Unable to receive</text>
					</view>
					<view @tap="isRestrictAccess ? this.$refs.promptpopup2.open() : onGetDailyWage()"
						:class="'home_salary_box_r_btn' + (salaryIsGet ? ' disable' : '')"
						v-if="!NoPayday && (userInfo.compliance || !userInfo.position)">
						<text v-if="!userInfo.position">Go</text>
						<text v-else-if="!salaryIsGet && todaySalary == 0 && userInfo.compliance">Details
						</text>
						<text v-else-if="userInfo.compliance">Get</text>
					</view>
				</view>

				<!-- 功能菜单按钮 -->
				<view class="home_center_box">
					<view class="center_item_box" v-for="item in menuList">
						<template v-for="i in item">
							<view class="center_item" v-if="!(i?.showTestAccount == false && userType == 'test')"
								@click="toPage(i)">
								<view class="flex_center">
									<image :src="i?.iconUrl" :lazy-load="true" class="icon-wrapper" />
								</view>
								<view class="center_item_t">
									<text>{{ splitText(i?.menuName) }}</text>
								</view>
							</view>
						</template>
					</view>
				</view>

				<!-- 提现滚动通知 -->
				<view class="noticebar" v-if="noticeList?.length">
					<l-notice-bar :marquee="true" :vertical="true" leftIcon="/static/home/horn.svg" :iconSize="40"
						:text="noticeList" />
				</view>

				<!-- 活动中心 -->
				<image v-if="activityCenter.activeSwitch" :lazy-load="true" @click="pushUrl2('/pages/HomePage/activityCenter')" :src="activityCenter.image"
					class="activityCenter" mode="widthFix"></image>

				<view style="padding: 62rpx 50rpx 0 50rpx;">
					<swiper :autoplay="true" @change="handleChange" style="height: 346rpx">
						<swiper-item v-for="(item, index) in swiperList" :key="index" style="height: 346rpx">
							<image :lazy-load="true" @click="pushUrl(item.pushUrl)" :src="item.imgPath"
								class="swiper_img"></image>
						</swiper-item>
					</swiper>
					<view class="dots_box">
						<view v-for="i in swiperList.length" :key="i">
							<view :class="currentSwiperi == (i - 1) ? 'dots_a' : 'dots'">
							</view>
						</view>
					</view>
				</view>
				<view style="padding:  4rpx 50rpx 50rpx 50rpx" @click="toCompanyInfo">
					<view style="display: flex;justify-content: space-between;">
						<view class="company_profile_t">{{ $t("home.CompanyProfile") }}</view>
						<image src="/static/home/more.svg" class="more_icon" :lazy-load="true"></image>
					</view>
					<rich-text :nodes="companyInfo" class="company_profile_t2">
					</rich-text>
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
		<uni-popup ref="promptpopup2" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ pop_message_yes }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm2">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>

		<!-- <uni-popup ref="promptpopup3" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps" v-html="popWindowContent"></view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm3">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup> -->

		<messagePopup v-model:isShow="isShowMessage" :data="msgData" @getMessageNoticeApi="getMessageNoticeApi">
		</messagePopup>

		<!-- <messagePopup2 v-model:isShow="isShowMessage2" :content="rollContent">
		</messagePopup2> -->
		<t-overlay :visible="bigGG" v-if="bigGG" />
		<view class="bigGG" v-if="bigGG">
			<view class="bigGG_main">
				<view @click="prompt_confirm3" class="bigGG_text" v-html="popWindowContent"></view>
			</view>
			<view v-if="bigGGBtnNum > 0" class="bigGGBtnClose">{{ bigGGBtnNum }}</view>
			<image v-else class="xImage" src="/static/lottery/x.png" mode="" @click="closeBigGG" :lazy-load="true">
			</image>
		</view>
	</view>
</template>

<script>
import getIcon from '/static/home/get.png';
import alreadyIcon from '/static/home/already.png';
import arrowIcon from '/static/home/arrowright.png';
import customnavbar from '@/component/custom-navbar/custom-navbar.vue';
import messagePopup from '@/component/message-popup/message-popup.vue';
import messagePopup2 from '@/component/message-popup-2/message-popup-2.vue';
import {
	companyInfoApi,
	slideListApi,
	messageNoticeApi,
	noticeListApi,
	menuListApi
} from "@/common/api/home.js";
import {
	userInfoApi,
	settingsApi
} from "@/common/api/users.js";
import {
	withdrawalSalaryApi
} from '@/common/api/withdrawal.js'
import {
	activityCenterApi
} from '@/common/api/activity.js'
import {
	formatRichText,
	getFirstTextTagWithEllipsis,
	showMessage,
	htmlToPlainText
} from "@/utils/utils.js"
export default {
	components: {
		customnavbar,
		messagePopup,
		messagePopup2
	},
	data() {
		return {
			activityCenter: {},
			NoPayday: '',
			popWindowContent: '',
			rollContent: '',
			isShowMessage2: false,
			msgData: {},
			isShowMessage: false,
			pop_message_yes: "",
			currency: '',
			topStyle: '',
			topStyle2: '',
			swiperList: [],
			companyInfo: '',
			currentSwiperi: 0,
			userInfo: {},
			noticeList: [],
			userType: 'test',
			icon: {
				get: getIcon,
				already: alreadyIcon,
				arrow: arrowIcon,
			},
			salary: {
				// 薪资类型 日 周 月
				payType: "daily",
				// 领取日期 类型为day时不生效
				payDay: "",
				// 是否可领取
				whetherItIsAvailable: false
			},
			// 今日薪资
			todaySalary: "",
			// 是否领取
			salaryIsGet: false,
			// 管家模式 访问限制
			isRestrictAccess: false,
			// 全屏公告
			bigGG: false,
			bigGGIndex: 0,
			bigGGBtnNum: 0, // 按钮倒计时
			bigGGTimer: null, // 定时器
			menuList: []
		}
	},
	methods: {
		// 五秒倒计时
		countdown(time) {
			if (this.bigGGBtnNum > 0) {
				return
			}
			// 清除已存在的定时器
			if (this.bigGGTimer) {
				clearInterval(this.bigGGTimer);
			}
			this.bigGGBtnNum = time
			this.bigGGTimer = setInterval(() => {
				time--
				this.bigGGBtnNum = time
				if (time <= 0) {
					clearInterval(this.bigGGTimer)
				}
			}, 1000)
		},
		// 首页全屏公告
		closeBigGG() {
			uni.showTabBar();
			this.bigGGIndex++
			if (this.bigGGIndex > uni.getStorageSync('settings').popWindowContentList.length - 1) {
				this.bigGG = false;
				// 隐藏遮罩层时显示 tabbar
				uni.showTabBar();
			} else {
				this.popWindowContent = formatRichText(uni.getStorageSync('settings').popWindowContentList[this
					.bigGGIndex])
				// 倒计时按钮
				this.countdown(3)
			}

		},
		// 顶部消息跳转详情
		onclicktopgg() {
			uni.navigateTo({
				url: '/pages/notificationDetails?type=rollContent'
			})
		},
		prompt_confirm3() {
			return
			this.bigGG = false
			uni.navigateTo({
				url: '/pages/notificationDetails?type=popWindowContent'
			})
		},
		// 顶部消息通知
		getMessageNoticeApi() {
			messageNoticeApi().then(res => {
				if (res.data?.id) {
					this.msgData = res.data
					this.isShowMessage = true
				}
			})
		},
		prompt_confirm2() {
			this.$refs.promptpopup2.close()
		},
		// 领取薪资
		onGetDailyWage() {
			const weekDays = [
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday',
				'Sunday'
			];
			if (!this.userInfo.position) {
				uni.navigateTo({
					url: '/pages/HomePage/postManage'
				})
				return
			}
			if (this.salaryIsGet) {
				return
			}
			if (this.isRestrictAccess) {
				this.pop_message_yes = this.$t("withdrawal.restrictedAccess")
				this.$refs.promptpopup2.open();
				return
			}
			if (this.userInfo.compliance == 0) {
				this.pop_message_yes = this.$t("Performancetargetnotmet")
				this.$refs.promptpopup2.open()
				return
			}
			if (!this.salaryIsGet && !this.todaySalary) {
				switch (this.salary.payType) {
					case 'weekly':
						this.pop_message_yes = `The next payday is ${weekDays[Number(this.salary.payDay) - 1]}`;
						break;
					default:
						this.pop_message_yes = this.$t('home.notYetCollectionDate');
						break;
				}
				this.$refs.promptpopup2.open()
				return
			}
			withdrawalSalaryApi(1).then(res => {
				this.salaryIsGet = res.data.whetherToReceive ? true : false;
				this.todaySalary = 0
				this.$showMessage('warning', this.$t("home.receivedSuccessfully"))
			}).catch(err => {
				this.$showMessage('warning', err.msg);
			}).finally(() => this.getUserInfo())
		},
		// 薪资
		getTadaySalary() {
			this.NoPayday = ''
			withdrawalSalaryApi("0").then(res => {
				this.todaySalary = res.data.todayAmount ?? 0
				this.salary.payType = res.data.payType
				this.salary.payDay = res.data.payDay
				if (res.data.whetherToReceive == 1) {
					this.salaryIsGet = true
				} else {
					this.salaryIsGet = false;
				}
				// this.salaryIsGet = false
			}).catch(err => {
				if (err.msg.includes("The next payday is")) {
					this.NoPayday = err.msg
				}
				// this.$showMessage('warning', err.msg);
			})
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
			this.topStyle2 = "top:" + (e) + "rpx"
			// #ifdef H5
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
			this.topStyle2 = "top:" + (e) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 99) + "rpx"
			this.topStyle2 = "top:" + (e + 24) + "rpx"
			// #endif
		},
		getUserInfo() {
			userInfoApi().then((res) => {
				this.isRestrictAccess = false
				this.userInfo = res.data
				this.userType = res.data.userType
				if (res.data.housekeeper == 1) {
					this.isRestrictAccess = true
					this.pop_message_yes = this.$t("withdrawal.restrictedAccess")
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
				this.getMenuListApi()
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		// 首页轮播图
		getSlideListApi() {
			slideListApi().then((res) => {
				this.swiperList = res.rows || []
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
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
		toPage(value) {
			// uni.removeStorageSync('pageTitle')
			uni.setStorageSync('pageTitle', value.menuName)
			const {
				canEnterButlerMode, // 管家模式
				canEnterIntern, // 实习生
				allowUnverifiedAccess, // 实名
				targetValue
			} = value
			// 幸运转盘
			if (targetValue == '/pages/HomePage/lotteryPage') {
				this.toPage2(targetValue)
				return
			}
			// 实习生不能进
			if (canEnterIntern == false && this.userInfo.levelCode == '0') {
				this.toPageTeamExpansion(targetValue)
				return
			}
			// 会员福利
			if (targetValue == '/pages/commonListPage?title=Member+Benefits&groupId=3') {
				this.toPageMemberBenefits()
				return
			}
			// 管家模式不允许进入
			if (canEnterButlerMode == false && this.isRestrictAccess) {
				this.pop_message_yes = this.$t("withdrawal.restrictedAccess")
				this.$refs.promptpopup2.open();
				return
			}
			// 未实名不允许进入
			if (allowUnverifiedAccess == false && !this.userInfo.realName) {
				this.$refs.promptpopup.open()
				return
			}
			uni.navigateTo({
				url: targetValue
			})
		},
		// 幸运转盘跳转
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
		// 会员福利
		toPageMemberBenefits() {
			noticeListApi(3, {
				pageNum: 1,
				pageSize: 10
			}).then((res) => {
				if (res.total) {
					uni.navigateTo({
						url: '/pages/commonDetailsPage?title=' + this.$t('home.Memberbenefits') +
							'&id=' + res.rows[0].noticeId
					})
				} else {
					uni.navigateTo({
						url: '/pages/commonListPage?title=' + this.$t('home.Memberbenefits') +
							'&groupId=3'
					})
				}

			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
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
		splitText(t) {
			if (uni.getStorageSync('settings').defaultLanguage == 'fr') {
				const parts = t.split(' ');
				return parts.length > 1 ? parts[0] + ' ' + parts[1] + '\n' + parts.slice(2).join(' ') : t;
			} else {
				const newline = '\n';
				return t.split(' ').join(newline);
			}
		},
		// 公司公告
		getCompanyInfo() {
			companyInfoApi().then((res) => {
				this.companyInfo = getFirstTextTagWithEllipsis(res.data.companyIntroduction)
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		// 提现跳转
		toWithdrawal() {
			if (this.isRestrictAccess) {
				this.pop_message_yes = this.$t("withdrawal.restrictedAccess")
				this.$refs.promptpopup2.open();
				return
			}
			if (!this.userInfo.realName) {
				this.$refs.promptpopup.open();
				return
			}
			uni.navigateTo({
				url: '/pages/MinePage/withdrawal'
			})
		},
		pushUrl2(url) {
			uni.navigateTo({
				url
			})
		},
		// 首页菜单
		getMenuListApi() {
			menuListApi({
				type: 'home'
			}).then(res => {
				let originalData = res.data;
				if (this.userInfo.levelCode == '0') {
					originalData = originalData.filter(item => {
						return item.canEnterIntern != false;
					});
				}
				const menuList = [];
				// 每4个元素分一组
				for (let i = 0; i < originalData.length; i += 4) {
					// 从当前索引开始，截取最多4个元素
					const group = originalData.slice(i, i + 4);
					menuList.push(group);
				}
				console.log(menuList)
				this.menuList = menuList; // 赋值给数据属性
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		}
	},
	onShow() {
		activityCenterApi().then(res => {
			this.activityCenter = res.data
		})
		settingsApi().then((res) => {
			uni.setStorageSync('settings', res.data)
			// 是否有滚动消息
			if (uni.getStorageSync('settings').rollSwitch == 1) {
				this.rollContent = htmlToPlainText(uni.getStorageSync('settings').rollContent)
				this.isShowMessage2 = true
			}
			// 是否有全屏公告
			if (uni.getStorageSync('settings').popWindowSwitch == 1 && uni.getStorageSync('settings')
				.popWindowContentList
				.length && !uni.getStorageSync('popWindowContentShow')) {
				// console.log(uni.getStorageSync('settings').popWindowContent)
				this.bigGGIndex = 0
				this.popWindowContent = formatRichText(uni.getStorageSync('settings').popWindowContentList[this
					.bigGGIndex])
				this.bigGG = true
				uni.hideTabBar();
				this.countdown(5);
				uni.setStorageSync('popWindowContentShow', '1')
			}
		}).catch(err => {
			console.log('request fail', err);
			if (err.data?.code == 403) {
				this.$showMessage('warning', err.data?.msg);
			} else {
				this.$showMessage('warning', err.msg);
			}
		})
		this.getCompanyInfo()
		this.getUserInfo()
		this.getSlideListApi()
		this.noticeList = uni.getStorageSync('settings').noticeList
		this.getTadaySalary()
		this.getMessageNoticeApi()
	},
	mounted() {
		this.currency = uni.getStorageSync('settings').currency
	},
	onLoad() {
		if (uni.getStorageSync('popWindowContentShow')) {
			uni.removeStorageSync('popWindowContentShow')
		}
	}
}
</script>

<style lang="scss" scoped>
.bigGG {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10001;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24rpx;

	.bigGG_main {
		box-sizing: border-box;
		width: 85vw;
		padding: 24rpx;
		border-radius: 12rpx;
		background-color: #fff;
		max-height: 84vh;
		overflow-y: auto;

		.bigGG_text {
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 20;
			-webkit-box-orient: vertical;
		}
	}

	.xImage {
		width: 58rpx;
		height: 58rpx;
	}

	.bigGGBtnClose {
		color: white;
		border-radius: 50%;
		border: 4rpx solid white;
		width: 52rpx;
		height: 52rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

@media (max-height: 700px) {
	.bigGG {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -51%);
		z-index: 10001;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;

		.bigGG_main {
			box-sizing: border-box;
			width: 75vw;
			padding: 24rpx;
			border-radius: 12rpx;
			background-color: #fff;
			max-height: 87vh;
			overflow-y: auto;

			.bigGG_text {
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 20;
				-webkit-box-orient: vertical;
			}
		}

		.xImage {
			width: 58rpx;
			height: 58rpx;
		}
	}
}

::v-deep .t-overlay {
	z-index: 10000 !important;
}

.home_salary_box {
	// width: 650rpx;
	margin: 40rpx 40rpx;
	padding: 30rpx 40rpx;
	background: rgb(23, 94, 183);
	background: linear-gradient(90deg, rgba(23, 94, 183, 1) 0%, rgba(40, 112, 204, 1) 56%, rgba(54, 133, 227, 1) 100%);
	border-radius: 20rpx;
	display: flex;
	// justify-content: space-around;
	align-items: center;
	color: white;

	.home_salary_box_img {
		width: 80rpx;
		min-width: 80rpx;
		height: 80rpx;
		margin-right: 40rpx;
	}

	.home_salary_box_v_c {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.home_salary_box_v_c_t {
			// line-height: 100rpx;
			font-family: "DINPro-Medium", sans-serif;
			font-weight: 300;
			font-size: 26rpx;
		}

		.money {
			font-size: 32rpx;
		}
	}

	.home_salary_box_r_btn {
		background-color: #ffb139;
		width: 120rpx;
		height: 40rpx;
		padding: 16rpx 20rpx;
		border-radius: 30rpx;
		font-family: "DINPro-Medium", sans-serif;
		font-size: 30rpx;
		font-weight: 200;
		text-align: center;
	}

	.disable {
		opacity: 60%;
	}
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

<style lang="scss" scoped>
.activityCenter {
	box-sizing: border-box;
	padding: 0 50rpx;
	width: 100%;
	transform: translateY(44rpx);
}

.home_container {
	background-color: #FFFFFF;
}

.home_top_bg {
	position: relative;
	width: 100%;
	background: url('/static/home/home_bg.png') top left/100% no-repeat;

	.noticebar.noticebar_top {
		box-sizing: border-box;
		position: absolute;
		padding: 0;

		// margin: 0 34rpx;
		::v-deep .level_img {
			width: 42rpx !important;
			height: 42rpx !important;
		}
	}
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

	.center_item_box:nth-child(2) {
		margin-top: 42rpx;
	}
}

.noticebar {
	box-sizing: border-box;
	width: 100%;
	height: 80rpx;
	padding: 0 50rpx;
}

.center_item_box {
	display: flex;
	justify-content: start;
	gap: 42rpx;
	padding: 0 12rpx;
}

.center_item {
	// flex: 1;
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
	width: 100%;
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