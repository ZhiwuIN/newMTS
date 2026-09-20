<template>
	<view style="background-color: #f4f5fb;">
		<homenavbar backgroundStr="''" @mtop="mtop" :isHome="true" :showBack="false" :whiteBackgroundOnScroll="true">
			<view class="mine-top-bg" :style="topStyle"></view>
			<view class="mine-container">
				<view class="profile-row">
					<view class="user-info">
						<view class="user-info_box">
							<view class="avatar-box" @click="pushAccount">
								<image class="avatar-img" mode="aspectFill"
									:src="userInfo.avatar || '/static/mine_a.png'">
								</image>
								<!-- <view class="level-tag">LV1</view> -->
							</view>
							<view class="user-detail">
								<view class="user-name">{{ userInfo.username || '--' }}</view>
								<view class="user-id">{{ $t('minePage.cqaiId') }}: {{ displayUserId }}</view>
							</view>
						</view>
						<!-- 保证金 -->
						<view class="earnestMoney_box">
							<view>{{ $t('minePage.workDeposit') }} <span>{{ userInfo?.depositAmount }}</span></view>
						</view>
					</view>
					<!-- 用户指南 -->
					<view class="guide-card" @click="toPage3('/pages/MinePage/userNotice')">
						<image class="guide-book" src="/static/mine/book_img.png" mode="aspectFit"></image>
						<view class="guide-title">{{ $t('minePage.userGuide') }}</view>
						<view class="guide-subtitle">{{ $t('minePage.goCheck') }}</view>
					</view>
				</view>

				<!-- 工资领取 -->
				<view class="salary_box">
					<view class="main_box">
						<!-- 职位不存在 -->
						<view class="desc" v-if="!userInfo.position">
							{{ $t('申请您的职位来领取工资') }}
						</view>
						<!-- 已领取 -->
						<view class="desc" v-else-if="salaryIsGet">
							{{ $t('工资已领取') }}
						</view>
						<!-- 职位任务未达标 -->
						<view class="desc" v-else-if="userInfo.compliance == 0">
							{{ $t("职位任务未完成") }}
						</view>
						<!-- 未到发薪日 -->
						<view class="desc" v-else-if="!salaryIsGet && NoPayday">
							{{ NoPayday }}
						</view>
						<!-- 薪资未领取 -->
						<view class="desc" v-else-if="!salaryIsGet && !NoPayday">
							{{ $t('home.TodaySalary') }} : {{ todaySalary }} {{ currency }}
						</view>
						<!-- /////////////////////////////////////////////// -->
						<view class="tag"
							v-if="!(!salaryIsGet && userInfo.compliance && !NoPayday && userInfo.position)"
							@click="toPostManage">{{ $t('去看看') }}</view>
						<view class="btn" @click="onGetDailyWage"
							v-if="!salaryIsGet && userInfo.compliance && !NoPayday && userInfo.position">{{
								$t('领取工资') }}
						</view>
					</view>
					<image class="position_img" :src="myPosition?.image || '/static/level/1.png'" mode="aspectFit">
					</image>
				</view>



				<view class="fund-card">
					<view class="position-card" @click="toPage3('/pages/HomePage/postManage')">
						<image class="position-icon" v-if="myPosition?.image" :src="myPosition?.image"
							mode="aspectFill"></image>
						<view class="position-name">{{ myPosition?.positionName
							|| $t('minePage.noPositionActivated') }}</view>
						<image class="position-arrow" src="/static/mine/right.png" mode="aspectFit"></image>
					</view>
					<!-- <view class="fund-right">
						<image class="fund-eye"
							:src="eyeOpen ? '/static/mine/eye_open.png' : '/static/mine/eye_close.png'"
							@click.stop="eyeOpen = !eyeOpen"></image>
					</view> -->
					<view class="max-fund-body">
						<view class="fund-body">
							<view class="fund-label">{{ $t('minePage.availableFunds') }} ({{ currency }})</view>
							<view class="fund-amount">{{ eyeOpen ? money(userInfo.accountBalance) : '****.**' }}</view>
						</view>
						<view class="fund-body">
							<view class="fund-top">
								<image class="top-img" src="/static/mine/TodayIsincome.png" mode="aspectFit"></image>
								<view class="fund-label">{{ $t('minePage.todayIncome') }}</view>
							</view>
							<view class="fund-amount red">{{ signedMoney(userInfoAmount.dailyRevenue) }}</view>
						</view>
						<view class="fund-body">
							<view class="fund-top">
								<image class="top-img" src="/static/mine/MonthlyIncome.png" mode="aspectFit"></image>
								<view class="fund-label">{{ $t('minePage.monthlyIncome') }}</view>
							</view>
							<view class="fund-amount red">{{ signedMoney(userInfoAmount.monthlyRevenue) }}</view>
						</view>
						<view class="fund-body">
							<view class="fund-top">
								<image class="top-img" src="/static/mine/TotalRevenue.png" mode="aspectFit"></image>
								<view class="fund-label">{{ $t('minePage.totalRevenue') }}</view>
							</view>
							<view class="fund-amount red">{{ signedMoney(userInfoAmount.totalRevenue) }}</view>
						</view>
					</view>

					<!-- 职位信息 -->
					<view class="position_info_box" v-if="myPosition?.positionName">
						<view class="item_box">
							<view>{{ $t('minePage.monthlySalary') }}</view>
							<view class="number">{{ myPosition?.salary }} {{ currency }}</view>
						</view>
						<view class="item_box">
							<view>{{ $t('minePage.payday') }}</view>
							<view class="number">{{ myPosition?.paydayText }}</view>
						</view>
						<view class="item_box">
							<view>{{ $t('minePage.payType') }}</view>
							<view class="number">{{ myPosition?.payType }}</view>
						</view>
					</view>
					<!-- 充值提现按钮 -->
					<view class="fund-actions">
						<view class="fund-btn" @click="toPage2('/pages/HomePage/RechargeChannel')">{{
							$t('minePage.recharge') }}</view>
						<view class="fund-btn"
							@click="isRestrictAccess ? $refs.promptpopup_access.open() : toPage2('/pages/MinePage/withdrawal')">
							{{ $t('minePage.withdraw') }}</view>
					</view>
				</view>

				<!-- <view class="info-card">
					<view class="info-title">Account Overview</view>
					<view class="info-grid">
						<view class="info-item">
							<view class="info-label">Total Assets</view>
							<view class="info-value">{{ eyeOpen ? money(userInfo.accountBalance) : '****.**' }} {{
								currency || 'FOX' }}</view>
						</view>
						<view class="info-item">
							<view class="info-label">Lock in funds</view>
							<view class="info-value">{{ eyeOpen ? money(userInfo.lockFunds) : '****.**' }} {{ currency
							}}</view>
						</view>
					</view>
				</view> -->

				<!-- <view class="info-card">
					<view class="info-title">Revenue Overview</view>
					<view class="info-grid">
						<view class="info-item">
							<view class="info-label">Today's Earnings</view>
							<view class="info-value income">{{ eyeOpen ? signedMoney(userInfoAmount.dailyRevenue) :
								'****.**' }} {{ currency
								}}</view>
						</view>
						<view class="info-item">
							<view class="info-label">Monthly Revenue</view>
							<view class="info-value income">{{ eyeOpen ? signedMoney(userInfoAmount.monthlyRevenue) :
								'****.**' }}{{ currency
								}}</view>
						</view>
					</view>
				</view> -->

				<!-- k认证 -->
				<view class="shebaoFund_box" v-if="kAuthInfo.activitySwitch">
					<image @click="toPageUrl(kAuthInfo.targetUrl)"
						:src="kAuthInfo.image || '/static/Certification/kAuthImg.png'" class="shebaoFund_img"
						mode="widthFix">
					</image>
				</view>

				<!-- 我的产品 -->
				<view class="products-card">
					<view class="products-head" @click="toPageProducts">
						<text>{{ $t('minePage.myFundProducts') }}</text>
						<image class="products-arrow" src="/static/mine/right.png" mode="aspectFit"></image>
					</view>
					<view class="products-grid" v-if="productMyPreferred.length">
						<view class="products-item" v-for="value in productMyPreferred">
							<view class="products-name">{{ value.productName }}</view>
							<view class="products-value">+{{ eyeOpen ? value.expectedReturn : '****.**' }} {{ currency
							}}</view>
						</view>
					</view>
					<view v-else class="not">
						{{ $t('minePage.noProducts') }}
					</view>
				</view>

				<view class="shortcut-card" v-if="gridMenuItems.length">
					<view class="shortcut-grid">
						<view class="shortcut-item" @click="toPage(item)" v-for="item in gridMenuItems"
							:key="item.id || item.menuName || item.targetValue">
							<image class="shortcut-icon" :src="item.iconUrl" mode="aspectFit"></image>
							<text>{{ splitText(item.menuName) }}</text>
						</view>
					</view>
				</view>

				<!-- <view class="logout-card" @click="logout">{{ $t('languageChange') }}</view> -->
				<view class="logout-card" @click="logout">{{ $t('minePage.logOut') }}</view>

				<view class="privacy-links" v-if="false">
					<view @click="toPageUrl('/pages/MinePage/privacyPolicy')">{{
						$t('minePage.personalInformationSharingList') }}</view>
					<view @click="toPageUrl('/pages/MinePage/privacyPolicy')">{{
						$t('minePage.personalInformationCollectedList') }}</view>
					<view @click="toPageUrl('/pages/MinePage/privacyPolicy')">{{ $t('minePage.privacyPolicy') }}</view>
				</view>
			</view>
		</homenavbar>

		<uni-popup ref="promptpopup" type="center">
			<view class="prompt-pop-page">
				<view class="prompt-pop-top">{{ $t('home.Prompt') }}</view>
				<view class="prompt-pop-tips">{{ $t('璇峰厛瀹炲悕') }}</view>
				<view class="prompt-pop-bottom">
					<button class="prompt-cancel-btn" @click="prompt_cancel">{{ $t('pay.no') }}</button>
					<button class="prompt-confirm-btn" @click="prompt_confirm">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="promptpopup_access" type="center">
			<view class="prompt-pop-page">
				<view class="prompt-pop-top">{{ $t('home.Prompt') }}</view>
				<view class="prompt-pop-tips">{{ $t('withdrawal.restrictedAccess') }}</view>
				<view class="prompt-pop-bottom only-confirm">
					<button class="prompt-confirm-btn" @click="$refs.promptpopup_access.close()">{{ $t('pay.yes')
					}}</button>
				</view>
			</view>
		</uni-popup>
		<contactWay />

		<!-- 报错提示 -->
		<uni-popup ref="promptpopup2" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ pop_message_yes }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm2">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import homenavbar from '@/component/home-navbar/home-navbar.vue';
import contactWay from '@/components/contactWay/contactWay.vue';
import { kAuthInfoApi } from '@/common/api/Certification.js';
import { userInfoApi, settingsApi, userInfoAmountApi } from '@/common/api/users.js';
import { menuListApi } from '@/common/api/home.js';
import { vipInfoApi } from '@/common/api/level.js';
import { positionMyPositionApi } from '@/common/api/position.js';
import { productMyPreferredApi } from '@/common/api/product.js';
import { shebaoFundConfigApi } from '@/common/api/SocialSecurityFund.js';
import {
	withdrawalSalaryApi
} from '@/common/api/withdrawal.js'

export default {
	components: {
		homenavbar,
		contactWay
	},
	data() {
		return {
			salary: {
				// 薪资类型 日 周 月
				payType: "daily",
				// 领取日期 类型为day时不生效
				payDay: "",
				// 是否可领取
				whetherItIsAvailable: false
			},
			// 今日工资
			todaySalary: '',
			// 不在发薪日提示
			NoPayday: '',
			// 是否领取了工资
			salaryIsGet: false,
			// 是否限制访问
			isHouseKeeper: false,
			productMyPreferred: [],
			kAuthInfo: {},
			menuList: [],
			topStyle: '',
			userInfo: {},
			myPosition: {},
			myvipInfo: {},
			isRestrictAccess: false,
			showShebaoFund: 0,
			shebaoFundImage: '',
			textCache: {},
			currency: '',
			eyeOpen: true,
			userInfoAmount: {}
		};
	},
	computed: {
		displayUserId() {
			return this.userInfo.cqaiId || this.userInfo.userId || this.userInfo.uid || this.userInfo.id || this.userInfo.phone || '--';
		},
		gridMenuItems() {
			// return this.menuList.slice(0, 9);
			return this.menuList
		}
	},
	onLoad() {
		this.getTadaySalary()
	},
	onShow() {
		positionMyPositionApi().then(r => {
			this.myPosition = r.data || {}
			const weekList = {
				1: this.$t('minePage.weekdays.monday'),
				2: this.$t('minePage.weekdays.tuesday'),
				3: this.$t('minePage.weekdays.wednesday'),
				4: this.$t('minePage.weekdays.thursday'),
				5: this.$t('minePage.weekdays.friday'),
				6: this.$t('minePage.weekdays.saturday'),
				7: this.$t('minePage.weekdays.sunday')
			}
			if (this.myPosition.payday) {
				this.myPosition.paydayText = weekList[this.myPosition.payday]
			}
		});
		settingsApi().then(r => uni.setStorageSync('settings', r.data));
		this.currency = uni.getStorageSync('settings').currency;
		userInfoApi().then(r => {
			this.userInfo = r.data || {};
			this.isRestrictAccess = r.data.housekeeper == 1;
			if (r.data.housekeeper == 1) {
				this.isHouseKeeper = true
			} else {
				this.isHouseKeeper = false
			}
			uni.setStorageSync('userInfo', r.data);
			this.getMenuListApi();
			this.getUserInfoAmount()
			vipInfoApi().then(v => {
				this.myvipInfo = (v.data.list || []).find(x => x.levelCode == r.data.levelCode) || {};
			});
		}).catch(e => this.$showMessage('warning', e.msg));

		this.getShebaoFundOverview();
		// 我的产品
		this.getProductMyPreferred()
		kAuthInfoApi().then(r => this.kAuthInfo = r.data || {});
	},
	methods: {
		toPostManage() {
			uni.setStorageSync('pageTitle', ' ')
			uni.navigateTo({
				url: '/pages/HomePage/postManage'
			})
		},
		// 领取薪资按钮
		onGetDailyWage() {
			if (this.isHouseKeeper) {
				this.pop_message_yes = this.$t("您的帐户已被限制")
				this.$refs.promptpopup2.open()
				return
			}
			const weekDays = {
				1: this.$t('minePage.weekdays.monday'),
				2: this.$t('minePage.weekdays.tuesday'),
				3: this.$t('minePage.weekdays.wednesday'),
				4: this.$t('minePage.weekdays.thursday'),
				5: this.$t('minePage.weekdays.friday'),
				6: this.$t('minePage.weekdays.saturday'),
				7: this.$t('minePage.weekdays.sunday')
			}
			if (!this.userInfo.position) {
				uni.navigateTo({
					url: '/pages/HomePage/postManage'
				})
				return
			}
			if (this.salaryIsGet) {
				return
			}
			if (!this.salaryIsGet && !this.todaySalary) {
				switch (this.salary.payType) {
					case 'weekly':
						this.pop_message_yes = this.$t('minePage.nextPayday', {
							day: weekDays[Number(this.salary.payDay)]
						});
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
		// 获取今日薪水
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
				if (!res.data.isPayDay && res.data.whetherToReceive) {
					const weekDays = {
						1: this.$t('minePage.weekdays.monday'),
						2: this.$t('minePage.weekdays.tuesday'),
						3: this.$t('minePage.weekdays.wednesday'),
						4: this.$t('minePage.weekdays.thursday'),
						5: this.$t('minePage.weekdays.friday'),
						6: this.$t('minePage.weekdays.saturday'),
						7: this.$t('minePage.weekdays.sunday')
					}
					this.NoPayday = this.$t('minePage.nextPayday', {
						day: weekDays[Number(this.salary.payDay)]
					});
				}
			}).catch(err => {
				// this.NoPayday = err.msg
			})
		},
		prompt_confirm2() {
			this.$refs.promptpopup2.close()
		},
		// 产品跳转判断
		toPageProducts() {
			let url = this.productMyPreferred.length ? '/pages/MinePage/financePage' : '/pages/HomePage/financePage'
			// 无产品跳转购买页
			uni.navigateTo({
				url
			})
		},
		// 我的产品
		getProductMyPreferred() {
			productMyPreferredApi().then(res => {
				this.productMyPreferred = res.data
			})
		},
		// 用户金额接口
		getUserInfoAmount() {
			userInfoAmountApi().then(res => {
				this.userInfoAmount = res.data
			})
		},
		getShebaoFundOverview() {
			shebaoFundConfigApi().then(r => {
				this.showShebaoFund = r.data.activitySwitch;
				this.shebaoFundImage = r.data.image;
			});
		},
		getMenuListApi() {
			menuListApi({ type: 'personal' }).then(r => {
				this.menuList = r.data || [];
				if (this.userInfo.levelCode == '0') {
					this.menuList = this.menuList.filter(x => x.canEnterIntern != false);
				}
			}).catch(e => this.$showMessage('warning', e.msg));
		},
		money(v) {
			return Number(v || 0).toLocaleString('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		},
		signedMoney(v) {
			const n = Number(v || 0);
			return (n > 0 ? '+' : '') + this.money(n);
		},
		toPage2(path) {
			if (!this.userInfo.realName) {
				this.$refs.promptpopup.open();
				return;
			}
			uni.navigateTo({ url: path });
		},
		prompt_confirm() {
			this.$refs.promptpopup.close();
			uni.navigateTo({ url: '/pages/MinePage/identity' });
		},
		prompt_cancel() {
			this.$refs.promptpopup.close();
		},
		// 跳转换头像
		pushAccount() {
			uni.navigateTo({ url: '/pages/MinePage/headPortrait' });
		},
		toPage(v) {
			uni.setStorageSync('pageTitle', v.menuName);

			if (v.allowUnverifiedAccess == false) {
				this.toPage2(v.targetValue);
				return;
			}
			if (v.canEnterIntern == false && this.userInfo.levelCode == '0') {
				this.$showMessage('warning', this.$t('minePage.internNoPermission'));
				return;
			}
			if (v.canEnterButlerMode == false && this.isRestrictAccess) {
				this.$refs.promptpopup_access.open();
				return;
			}
			uni.navigateTo({ url: v.targetValue });
		},
		toPage3(path) {
			path === '/pages/LevelPage/index'
				? uni.switchTab({ url: path })
				: uni.navigateTo({ url: path });
		},
		toPageUrl(url) {
			uni.navigateTo({ url });
		},
		logout() {
			uni.removeStorageSync('token');
			uni.removeStorageSync('userInfo');
			uni.reLaunch({ url: '/pages/HomePage/index' });
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle = `margin-top:-${e}rpx;padding-top:${e + 88}rpx`
			// #endif

			// #ifdef APP-PLUS
			this.topStyle = `margin-top:-${e}rpx;padding-top:${e + 99}rpx`
			// #endif
		},
		splitText(t) {
			if (!t) return '';
			const l = uni.getStorageSync('settings')?.defaultLanguage || 'fr';
			const k = l + '_' + t;

			if (this.textCache[k]) {
				return this.textCache[k];
			}

			let r;
			if (l === 'fr') {
				r = t.split(' ').length > 2
					? t.split(' ').slice(0, 2).join(' ') + '\n' + t.split(' ').slice(2).join(' ')
					: t;
			} else {
				r = t.split(' ').join('\n');
			}

			return this.textCache[k] = r;
		}
	}
}
</script>

<style lang="scss" scoped>
* {
	box-sizing: border-box;
	font-family: 'MiSans', PingFangSC, sans-serif;
}

.shebaoFund_box {
	box-sizing: border-box;
	width: 702rpx;
	margin: 0 auto;
	margin-bottom: 16rpx;
	display: flex;
	justify-content: center;

	.shebaoFund_img {
		width: 702rpx;
	}

}

.mine-container {
	position: relative;
	z-index: 1;
	padding: 26rpx 12rpx 40rpx;
}

.mine-top-bg {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1076rpx;
	background:
		radial-gradient(circle at 0% 0%, #69d6ec 0%, rgba(105, 214, 236, 0.55) 34%, transparent 62%),
		radial-gradient(circle at 100% 0%, #3aaff5 0%, rgba(58, 175, 245, 0.55) 36%, transparent 65%),
		radial-gradient(circle at 50% 45%, rgba(245, 248, 255, 0.9) 0%, rgba(245, 248, 255, 0.25) 42%, transparent 72%),
		linear-gradient(180deg, #b9e9f3 0%, rgba(234, 246, 248, 0.8) 55%, rgba(244, 245, 251, 0) 100%);
}

.profile-row {
	display: flex;
	// align-items: center;
	justify-content: space-between;
	gap: 18rpx;
}

.user-info {
	flex: 1;
	border-radius: 16rpx;
	background-color: #fff;
	padding: 14rpx 24rpx;

	.user-info_box {
		display: flex;
	}

	.earnestMoney_box {
		border-top: 2rpx solid #F9F9F9;
		padding-top: 16rpx;
		font-size: 28rpx;
		transform: translateY(-4rpx);

		span {
			font-weight: bold;
			color: #B65300;
		}
	}
}

.avatar-box {
	box-sizing: border-box;
	position: relative;
	width: 120rpx;
	height: 120rpx;
	border: 4rpx solid #01d1ef;
	border-radius: 50%;
	background: #e9f3ff;
	flex: 0 0 auto;
	transform: translateY(-40rpx);
}

.avatar-img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	border: 2rpx solid #fff;
}

.level-tag {
	position: absolute;
	left: 50%;
	bottom: -12rpx;
	transform: translateX(-50%);
	min-width: 62rpx;
	height: 30rpx;
	padding: 0 10rpx;
	border-radius: 16rpx;
	font-size: 18rpx;
	line-height: 30rpx;
	text-align: center;
	color: #fff;
	background: #01D1EF;
}

.user-detail {
	margin-left: 18rpx;
	min-width: 0;
}

.user-name {
	font-weight: 700;
	font-size: 30rpx;
	line-height: 40rpx;
	color: #000;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-id {
	margin-top: 8rpx;
	font-size: 28rpx;
	line-height: 30rpx;
	color: #727272;
	word-break: break-all;
}

// 用户指南
.guide-card {
	position: relative;
	min-width: 224rpx;
	padding: 116rpx 16rpx 14rpx;
	border-radius: 16rpx;
	background: #fff;
	box-shadow: 0 8rpx 24rpx rgba(26, 50, 112, 0.08);

	.guide-book {
		position: absolute;
		top: -20rpx;
		right: 0;
		width: 132rpx;
		height: 132rpx;
	}

	.guide-title {
		max-width: 224rpx;
		font-size: 32rpx;
		line-height: 36rpx;
		font-weight: 700;
		color: #000;
		word-break: break-all;
	}

	.guide-subtitle {
		margin-top: 4rpx;
		font-size: 24rpx;
		color: #000;
		white-space: nowrap;
	}
}

.position-card {
	display: flex;
	align-items: center;
	width: 100%;
	height: 94rpx;
	padding: 0 24rpx;
	border-radius: 16rpx 16rpx 0 0;
	background: url('/static/mine/position1.png') 0 0/100% 100% no-repeat;
}

.position-icon {
	width: 62rpx;
	height: 62rpx;
	margin-right: 16rpx;
}

.position-name {
	flex: 1;
	font-family: DingTalk JinBuTi;
	font-size: 32rpx;
	color: #C7C7C7;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.position-arrow,
.products-arrow {
	width: 26rpx;
	height: 26rpx;
}

.salary_box {
	display: flex;
	justify-content: space-between;
	padding: 20rpx 32rpx;
	background-color: #fff;
	margin-top: 16rpx;
	border-radius: 16rpx;

	.main_box {
		display: flex;
		flex-direction: column;
		align-items: start;

		.desc {
			font-family: MiSans;
			font-size: 28rpx;
			font-weight: 500;
			color: #3D3D3D;
			margin-bottom: 16rpx;
		}

		.tag {
			font-family: MiSans;
			font-size: 24rpx;
			color: $themeColor;
		}

		.btn {
			padding: 8rpx 14rpx;
			font-family: MiSans;
			font-size: 24rpx;
			background-color: $themeColor;
			color: #fff;
			border-radius: 2026rpx;
		}

	}

	.position_img {
		width: 74rpx;
		min-width: 74rpx;
		height: 74rpx;
	}
}

.fund-card,
.info-card,
.products-card,
.shortcut-card,
.logout-card {
	width: 100%;
	margin: 0 auto 18rpx;
	border-radius: 16rpx;
	background: #fff;
	box-shadow: 0 8rpx 24rpx rgba(26, 50, 112, 0.06);
}

.fund-card {
	padding-bottom: 24rpx;
	margin-top: 16rpx;
	overflow: hidden;
}

.fund-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 24rpx;
	background: linear-gradient(90deg, #2b2424 0%, #3a3130 100%);
}

.fund-head-left {
	display: flex;
	align-items: center;
	min-width: 0;
}

.fund-head-icon {
	width: 34rpx;
	height: 34rpx;
	margin-right: 12rpx;
}

.fund-head-left text {
	font-size: 26rpx;
	line-height: 34rpx;
	font-style: italic;
	color: rgba(255, 255, 255, .82);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.fund-head-arrow {
	width: 24rpx;
	height: 24rpx;
	filter: brightness(2);
}

.max-fund-body {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
}

.fund-body {
	position: relative;
	padding: 14rpx 24rpx 0;

	.fund-top {
		display: flex;
		align-items: center;
		gap: 8rpx;

		.top-img {
			width: 32rpx;
			min-width: 32rpx;
			height: 32rpx;
		}

		.fund-label {
			color: #9F9F9F;
			font-size: 24rpx;
			font-weight: 500;
		}
	}
}

.fund-label {
	font-size: 28rpx;
	line-height: 32rpx;
	color: #000;
}

.fund-right {
	position: absolute;
	top: 10rpx;
	right: 20rpx;
}

.fund-eye {
	width: 48rpx;
	height: 48rpx;
}

.fund-amount {
	margin-top: 8rpx;
	font-family: initial;
	font-size: 44rpx;
	font-weight: bold;
	line-height: normal;
	color: #000;

	&.red {
		font-size: 32rpx;
		color: #FF0000;
	}
}

.fund-unit {
	position: absolute;
	right: 24rpx;
	top: 88rpx;
	font-size: 34rpx;
	line-height: 36rpx;
	color: #111;
}

.position_info_box {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	padding: 20rpx;
	border-radius: 16rpx;
	background-color: #f8f9fd;
	margin: 24rpx;

	.item_box {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 14rpx;
		font-size: 24rpx;
		color: #818181;

		.number {
			font-size: 28rpx;
			font-weight: bold;
			color: $themeColor;
		}
	}
}

.fund-actions {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
	margin-top: 32rpx;
	padding: 0 24rpx;
}

.fund-btn {
	height: 70rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	line-height: 70rpx;
	text-align: center;
	color: #fff;
	background: #000;
}

.info-card {
	padding: 24rpx;
}

.info-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #000;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
	margin-top: 10rpx;
}

.info-label {
	font-size: 24rpx;
	line-height: 30rpx;
	color: #9F9F9F;
}

.info-value {
	margin-top: 10rpx;
	font-size: 32rpx;
	line-height: 34rpx;
	font-weight: 700;
	color: #111;
	white-space: nowrap;
}

.products-card {
	padding: 24rpx;

	.not {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 24rpx;
		color: #9F9F9F;
	}
}

.products-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 32rpx;
	font-weight: bold;
	color: #000;
}

.products-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	margin-top: 10rpx;
}

.products-item {
	padding-right: 18rpx;
}

.products-item+.products-item {
	padding-left: 18rpx;
	border-left: 1rpx solid #e7e7e7;
}

.products-name {
	font-size: 24rpx;
	line-height: 30rpx;
	color: #9F9F9F;
}

.products-value {
	margin-top: 10rpx;
	font-size: 32rpx;
	line-height: 36rpx;
	font-weight: 700;
	color: #C20000;
}

.shortcut-card {
	padding: 24rpx 0;
}

.shortcut-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	row-gap: 48rpx;
}

.shortcut-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.shortcut-icon {
	width: 48rpx;
	height: 48rpx;
}

.shortcut-item text {
	margin-top: 18rpx;
	width: 170rpx;
	font-size: 24rpx;
	line-height: 28rpx;
	text-align: center;
	color: #000;
	white-space: pre-line;
}

.logout-card {
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	font-size: 28rpx;
	font-weight: 700;
	color: #FF0000;
}

.privacy-links {
	padding: 14rpx 0 28rpx;
}

.privacy-links view {
	font-size: 22rpx;
	line-height: 34rpx;
	text-align: center;
	color: #2f7cff;
}

.shebao-fund-box {
	width: 702rpx;
	margin: 0 auto 24rpx;
}

.shebao-fund-img {
	width: 702rpx;
}

.settings-card {
	width: 702rpx;
	margin: 0 auto;
	background: #fff;
}

.settings-title {
	height: 92rpx;
	padding-left: 32rpx;
	font-size: 28rpx;
	line-height: 92rpx;
	color: rgba(0, 0, 0, 0.4);
	border-bottom: 1rpx solid #E7E7E7;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 112rpx;
	padding: 0 32rpx;
	border-bottom: 1rpx solid #E7E7E7;
}

.setting-left {
	display: flex;
	align-items: center;
	min-width: 0;
}

.setting-icon {
	width: 48rpx;
	height: 48rpx;
	margin-right: 22rpx;
}

.setting-left text {
	font-size: 32rpx;
	color: rgba(0, 0, 0, 0.9);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.setting-arrow {
	font-size: 42rpx;
	color: #777;
}

.prompt-pop-page {
	width: 570rpx;
	padding: 40rpx 54rpx 28rpx;
	border-radius: 28rpx;
	background: #fff;
}

.prompt-pop-top {
	font-size: 32rpx;
	text-align: center;
}

.prompt-pop-tips {
	margin-top: 40rpx;
	font-size: 28rpx;
	text-align: center;
	color: #1c2d57;
}

.prompt-pop-bottom {
	display: flex;
	justify-content: space-between;
	margin-top: 54rpx;
}

.only-confirm {
	justify-content: center;
}

.prompt-cancel-btn,
.prompt-confirm-btn {
	width: 212rpx;
	height: 72rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	line-height: 72rpx;
	text-align: center;
}

.prompt-cancel-btn {
	background: #ebebeb;
}

.prompt-confirm-btn {
	background: $themeColor;
	color: #fff;
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
</style>
