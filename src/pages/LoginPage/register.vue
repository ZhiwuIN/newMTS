<template>
	<view class="register-container">
		<view class="login_top_bg" :style="topStyle">
			<view class="logo_text">{{ webTitle || 'VCIC' }}</view>
			<view class="login_desc">
				<view class="desc1">{{ $t('创建您的账户') }}</view>
				<view class="desc2">{{ $t('只需几个细节，你就可以开始啦') }}</view>
			</view>
		</view>

		<view class="language-entry" @click="showLanguagePopup = true">
			<image src="/static/language.png" class="language-entry-img" />
			<view>{{ currentLanguageName }}</view>
			<view class="chevron language-chevron"></view>
		</view>

		<view v-if="showLanguagePopup" class="language-mask" @click="showLanguagePopup = false">
			<view class="language-popup" @click.stop>
				<view class="language-popup-title">{{ $t('pages.language') }}</view>
				<view v-for="item in languageList" :key="item.code" class="language-option"
					@click="applyLanguage(item.code)">
					<text>{{ item.name }}</text>
					<text v-if="currentLanguage === item.code">✓</text>
				</view>
			</view>
		</view>

		<view class="form-item-box">
			<view class="form-item">
				<view class="login_title">
					<image src="/static/login/phone.png" class="login_icon" mode="aspectFit" />
					<text>{{ $t('register.phone') }}</text>
				</view>
				<view class="phone-input item_box">
					<view class="inpt_box">
						<view class="area-code-box">
							<picker class="area-code" mode="selector" :range="areaCodes" @change="handleAreaCodeChange">
								<view class="area-code-value">
									<text>+{{ selectedAreaCode }}</text>
									<view class="chevron"></view>
								</view>
							</picker>
						</view>
						<input type="number" v-model="phone" :placeholder="$t('register.phonePlaceHolder')"
							placeholder-class="login-placeholder" />
					</view>
				</view>
			</view>

			<view class="form-item">
				<view class="login_title">
					<image src="/static/login/pwd.png" class="login_icon" mode="aspectFit" />
					<text>{{ $t('register.password') }}</text>
				</view>
				<view class="password-input item_box">
					<view class="inpt_box">
						<input :type="showPwd ? 'text' : 'password'" v-model="password"
							:placeholder="$t('register.pwdPlaceHolder')" placeholder-class="login-placeholder" />
						<view class="password-toggle" @click="showPwd = !showPwd">
							<view class="eye-icon" :class="{ 'eye-icon-visible': showPwd }">
								<view class="eye-pupil"></view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="form-item">
				<view class="login_title">
					<image src="/static/login/pwd.png" class="login_icon" mode="aspectFit" />
					<text>{{ $t('password.Confirmpassword') }}</text>
				</view>
				<view class="password-input item_box">
					<view class="inpt_box">
						<input :type="showConfirmPwd ? 'text' : 'password'" v-model="confirmPassword"
							:placeholder="$t('password.placeholder3')" placeholder-class="login-placeholder" />
						<view class="password-toggle" @click="showConfirmPwd = !showConfirmPwd">
							<view class="eye-icon" :class="{ 'eye-icon-visible': showConfirmPwd }">
								<view class="eye-pupil"></view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="form-item form-item-last">
				<view class="login_title">
					<image src="/static/login/invite.png" class="login_icon" mode="aspectFit" />
					<text>{{ $t('register.invitation') }}</text>
				</view>
				<view class="invitation-input item_box">
					<view class="inpt_box">
						<input v-model="inviteCode" :placeholder="$t('register.invitationPlaceHolder')"
							placeholder-class="login-placeholder" />
					</view>
				</view>
			</view>

			<view class="login-btn" @click="handleRegister">
				<text>{{ $t('register.registerBtn') }}</text>
				<view class="button-arrow"></view>
			</view>
			<view class="line_box">
				<view class="line"></view>
				<view class="separator-label">{{ separatorLabel }}</view>
				<view class="line"></view>
			</view>
			<view class="navTo-btn" @click="goToLogin">
				<view>{{ $t('register.registerlink1') }}<text class="themeColor">{{ $t('register.registerlink2') }}</text></view>
				<view class="button-arrow"></view>
			</view>
		</view>
	</view>
</template>

<script>
import {
	registerApi
} from "@/common/api/users.js";
import {
	languageApi
} from "@/common/api/home.js";
export default {
	data() {
		return {
			areaCodes: ['225'],
			selectedAreaCode: '225',
			phone: '',
			password: '',
			confirmPassword: '',
			showPwd: false,
			showConfirmPwd: false,
			verfyCode: '',
			inviteCode: '',
			topStyle: 0,
			itemfocus: 0,
			webTitle: '',
			// 国际化
			languageList: [],
			currentLanguage: '',
			showLanguagePopup: false,
			backendDefaultLanguage: '',
			currentLanguageName: ''
		}
	},
	computed: {
		separatorLabel() {
			const locale = this.$i18n?.locale || this.currentLanguage || 'en'
			return { es: 'o', fr: 'ou', zh: '或', ru: 'или' }[locale] || 'or'
		}
	},
	methods: {
		mtop(e) {
			// #ifdef H5
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 44) + "rpx"
			// #endif
		},
		handleAreaCodeChange(e) {
			this.selectedAreaCode = this.areaCodes[e.detail.value]
		},
		validatePhoneFormat() {
			// 清除空格
			this.phone = this.phone.replace(/\s/g, '')
			const cleanedPhone = this.phone

			if (this.selectedAreaCode != '225') {
				return true
			}

			// 加纳手机号正则表达式
			//const ghanaPhoneRegex = /^0\d{9}$/;

			//if (!ghanaPhoneRegex.test(cleanedPhone)) {
			//	return false;
			//	}

			return true;
		},
		// 注册按钮
		handleRegister() {
			if (!this.validatePhoneFormat()) {
				this.$showMessage('warning', this.$t('login.invalidGhanaPhone'))
				return
			}
			if (!this.phone) {
				this.$showMessage('warning', this.$t('register.phonePlaceHolder'));
				return
			}
			if (!this.password) {
				this.$showMessage('warning', this.$t('register.pwdPlaceHolder'));
				return
			}
			if (this.password.length < 6) {
				this.$showMessage('warning', this.$t('register.pwdPlaceHolder1'));
				return
			}
			if (this.password !== this.confirmPassword) {
				this.$showMessage('warning', this.$t('register.pwdNotSame'));
				return
			}
			// TODO: 调用注册接口
			let params = {
				"confirmPassword": this.confirmPassword,
				"invitation": this.inviteCode,
				"password": this.password,
				"phone": this.phone,
				"verification": this.verfyCode
			}
			uni.showLoading({
				title: this.$t('BeRegistering')
			});
			registerApi(params).then((res) => {
				this.$showMessage('success', this.$t('register.registersuccess'));
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/LoginPage/login'
					})
				}, 500)
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})
		},
		goToLogin() {
			uni.navigateTo({
				url: '/pages/LoginPage/login'
			})
		},
		getLanguageApi() {
			languageApi().then(res => {
				this.languageList = res.data.languageList
				this.currentLanguage = uni.getStorageSync('Language') ||
					uni.getStorageSync('defaultLanguage') || res.data.defaultLanguage || 'en'
				this.currentLanguageName = this.languageList.find(item => item.code == this.currentLanguage).name
			})
		},
		// 选择语言
		applyLanguage(code) {
			this.currentLanguage = code || this.backendDefaultLanguage || 'en'
			uni.setStorageSync('Language', this.currentLanguage)
			uni.setLocale(this.currentLanguage)
			if (this.$i18n) this.$i18n.locale = this.currentLanguage
			this.showLanguagePopup = false
			this.currentLanguageName = this.languageList.find(item => item.code == this.currentLanguage).name
		}
	},
	onLoad() {
		this.webTitle = uni.getStorageSync('settings').webTitle
		uni.removeStorageSync('userInfo');
		this.inviteCode = uni.getStorageSync('InvitationCode')
		this.getLanguageApi()
		this.backendDefaultLanguage = uni.getStorageSync('Language') ||
			uni.getStorageSync('defaultLanguage') || this.backendDefaultLanguage || 'en'
	}
}
</script>

<style lang="scss" scoped>
.register-container {
	position: relative;
	box-sizing: border-box;
	min-height: 100vh;
	color: #073442;
	font-family: 'Roboto-regular', sans-serif;
	background-color: #fbfdfd;
	background-image: url('/static/login/register_bgImg.png'), linear-gradient(90deg, #fbfdfd 60%, #e9f7f8 60%), linear-gradient(180deg, #fbfdfd 60%, #f1f9fa 100%);
	background-position: center 18rpx, center top, center;
	background-size: 100% auto, 100% 18rpx, 100% 100%;
	background-repeat: no-repeat;
}

.login_top_bg {
	box-sizing: border-box;
	width: 100%;
	padding: 38rpx 56rpx 0;
	padding-top: calc(38rpx + var(--status-bar-height, 0px));
}

.logo_text {
	color: #004b56;
	font-family: 'Roboto-bold', sans-serif;
	font-size: 52rpx;
	font-weight: 700;
	line-height: 64rpx;
	letter-spacing: 1rpx;
}

.login_desc {
	margin-top: 278rpx;

	.desc1 {
		margin-bottom: 10rpx;
		color: #062f3d;
		font-family: 'Roboto-black', sans-serif;
		font-size: 54rpx;
		font-weight: 900;
		line-height: 62rpx;
		letter-spacing: -0.6rpx;
	}

	.desc2 {
		color: #718897;
		font-size: 30rpx;
		line-height: 41rpx;
	}
}

.language-entry {
	position: absolute;
	top: 38rpx;
	top: calc(38rpx + var(--status-bar-height, 0px));
	right: 34rpx;
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	box-sizing: border-box;
	min-height: 64rpx;
	padding: 12rpx 22rpx;
	border: 2rpx solid #e0f0f3;
	border-radius: 2026rpx;
	background: rgba(255, 255, 255, 0.28);
	color: #073442;
	font-size: 22rpx;
	line-height: 22rpx;

	.language-entry-img {
		width: 36rpx;
		height: 36rpx;
		flex-shrink: 0;
	}
}

.chevron {
	width: 10rpx;
	height: 10rpx;
	flex-shrink: 0;
	border-right: 2.5rpx solid currentColor;
	border-bottom: 2.5rpx solid currentColor;
	transform: translateY(-3rpx) rotate(45deg);
}

.language-chevron {
	margin-left: 4rpx;
}

.form-item-box {
	padding: 40rpx 52rpx 60rpx;
	padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
}

.form-item {
	margin-bottom: 42rpx;

	&.form-item-last {
		margin-bottom: 0;
	}

	input {
		flex: 1;
		min-width: 0;
		height: 90rpx;
		color: #073442;
		font-family: 'Roboto-regular', sans-serif;
		font-size: 26rpx;
	}

	:deep(.uni-input-placeholder),
	:deep(.login-placeholder) {
		color: #8498a9;
	}
}

.login_title {
	display: flex;
	align-items: center;
	gap: 24rpx;
	min-height: 36rpx;
	margin-bottom: 12rpx;
	color: #073442;
	font-family: 'Roboto-bold', sans-serif;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 0rpx;
}

.login_icon {
	width: 38rpx;
	height: 38rpx;
	flex-shrink: 0;
}

.item_box {
	position: relative;
	box-sizing: border-box;
	overflow: hidden;
	border: 2.5rpx solid #d6e1e8;
	border-radius: 18rpx;
	background: rgba(255, 255, 255, 0.62);
}

.inpt_box {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	min-height: 90rpx;
	padding: 0 30rpx;
}

.phone-input {
	.inpt_box {
		padding: 0;
	}

	input {
		padding: 0 30rpx;
	}

	.area-code-box {
		position: relative;
		width: 160rpx;
		align-self: stretch;
		flex-shrink: 0;
		background: rgba(227, 243, 245, 0.72);

		&::after {
			position: absolute;
			top: 0rpx;
			right: 0;
			bottom: 20rpx;
			width: 2rpx;
			height: 88rpx;
			background: #bfd6df;
			content: '';
		}
	}

	.area-code-value {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
		height: 90rpx;
		color: #073442;
		font-size: 26rpx;
	}
}

.password-toggle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44rpx;
	height: 90rpx;
	margin-left: 16rpx;
	flex-shrink: 0;
	color: #8197a8;
}

.eye-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: 30rpx;
	height: 30rpx;
	border: 2.5rpx solid currentColor;
	border-radius: 70% 15%;
	transform: rotate(45deg);
}

.eye-pupil {
	box-sizing: border-box;
	width: 13rpx;
	height: 13rpx;
	border: 2.5rpx solid currentColor;
	border-radius: 50%;
}

.eye-icon-visible .eye-pupil {
	background: currentColor;
}

.login-btn,
.navTo-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: 100%;
	min-height: 90rpx;
	padding: 16rpx 72rpx;
	border-radius: 100rpx;
	text-align: center;
}

.login-btn {
	position: relative;
	margin-top: 34rpx;
	background: linear-gradient(110deg, #07949f 0%, #006575 45%, #004653 100%);
	box-shadow: 0 16rpx 32rpx rgba(0, 137, 148, 0.16);
	color: #fff;
	font-family: 'Roboto-bold', sans-serif;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 38rpx;

	.button-arrow {
		position: absolute;
		right: 58rpx;
	}
}

.button-arrow {
	position: relative;
	width: 26rpx;
	height: 3rpx;
	flex-shrink: 0;
	border-radius: 2rpx;
	background: currentColor;

	&::after {
		position: absolute;
		top: -6rpx;
		right: 2rpx;
		width: 14rpx;
		height: 14rpx;
		border-top: 3rpx solid currentColor;
		border-right: 3rpx solid currentColor;
		border-radius: 1rpx;
		transform: rotate(45deg);
		content: '';
	}
}

.line_box {
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin: 28rpx 0;
	color: #647f91;

	.line {
		height: 2rpx;
		flex: 1;
		background: #d8e6ec;
	}
}

.separator-label {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	min-width: 58rpx;
	height: 44rpx;
	padding: 0 14rpx;
	border: 2rpx solid #e5f1f4;
	border-radius: 100rpx;
	background: rgba(255, 255, 255, 0.3);
	font-size: 24rpx;
	line-height: 32rpx;
}

.navTo-btn {
	gap: 32rpx;
	padding: 16rpx 32rpx;
	border: 2.5rpx solid #005566;
	background: rgba(255, 255, 255, 0.55);
	color: #004b5a;
	font-size: 28rpx;
	line-height: 38rpx;

	.themeColor {
		font-family: 'Roboto-bold', sans-serif;
		font-weight: 700;
	}
}

.language-mask {
	position: fixed;
	inset: 0;
	z-index: 99;
	background: rgba(0, 37, 47, 0.35);
}

.language-popup {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	max-height: 70vh;
	overflow-y: auto;
	padding: 28rpx 32rpx 40rpx;
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	border-radius: 28rpx 28rpx 0 0;
	background: #fff;
}

.language-popup-title {
	margin-bottom: 16rpx;
	color: #073442;
	font-family: 'Roboto-bold', sans-serif;
	font-size: 30rpx;
	font-weight: 700;
}

.language-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #e7eff2;
	color: #073442;
	font-size: 28rpx;
}
</style>
