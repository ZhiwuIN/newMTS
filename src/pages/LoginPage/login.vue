<template>
	<view class="login-container">
		<view class="login_top_bg" :style="topStyle">
			<!-- <image src="/static/logo.png" alt="" class="login_top_title" /> -->
			<view class="logo_text">{{ webTitle }}</view>
			<view class="login_desc">
				<view class="desc1">{{ $t('登录您的账户') }}</view>
				<view class="desc2">{{ $t('使用您的电话号码和密码继续') }}</view>
			</view>
		</view>

		<!-- 国际化 -->
		<view class="language-entry" @click="showLanguagePopup = true">
			<image src="/static/language.png" class="language-entry-img" />
			<view>{{ currentLanguageName }}</view>
			<image src="/static/down_arrow.png" style="width: 32rpx;height: 32rpx;transform: translateY(-2rpx);"
				class="language-entry-img" />
		</view>

		<view v-if="showLanguagePopup" class="language-mask" @click="showLanguagePopup = false">
			<view class="language-popup" @click.stop>
				<view class="language-popup-title">
					{{ t('pages.language') || 'Language' }}
				</view>
				<view v-for="item in languageList" :key="item.code" class="language-option"
					@click="applyLanguage(item.code)">
					<text>{{ item.name }}</text>
					<text v-if="currentLanguage === item.code">✓</text>
				</view>
			</view>
		</view>

		<view class="form-item-box">
			<view class="form-item">
				<view class="login_title">{{ $t('register.phone') }}</view>
				<view class="phone-input item_box" @click="inputfocus(0)">
					<view class="inpt_box">
						<!-- <image v-if="itemfocus == 0" src="/static/login/phone_a.svg" alt="" class="item_img"
							style="margin-right: 10rpx;" />
						<image v-else src="/static/login/phone_a.svg" alt="" class="item_img"
							style="margin-right: 10rpx;" /> -->
						<view class="area-code-box">
							<!-- <picker class="area-code" mode="selector" :range="areaCodes" @change="handleAreaCodeChange"> -->
							<text>+{{ selectedAreaCode }}</text>
							<!-- <uni-icons type="down" size="16" style="margin-left: 10rpx;"></uni-icons> -->
							<!-- </picker> -->
						</view>
						<input type="text" v-model="phone" :placeholder="$t('请输入账号')" @focus="inputfocus(0)" />
					</view>
				</view>
			</view>

			<view class="form-item">
				<view class="login_title">{{ $t('register.password') }}</view>
				<view class="password-input item_box">
					<view class="inpt_box">
						<input :type="showPwd ? 'text' : 'password'" v-model="password"
							:placeholder="$t('register.pwdPlaceHolder')" @focus="inputfocus(1)" />
						<image v-if="!showPwd" src="/static/login/eye_close.png" alt="" class="item_right_img"
							@click="showPwd = !showPwd" />
						<image v-else src="/static/login/eye_open.png" alt="" class="item_right_img"
							@click="showPwd = !showPwd" />
					</view>
				</view>
			</view>
			<view class="remember_check_box" @click="remember = !remember">
				<view v-if="!remember" class="remember_unchecked"></view>
				<view v-else class="remember_checked"></view>
				<view class="remember_tips">{{ $t('login.remember') }}</view>
			</view>
			<view class="login-btn" @click="handlelogin">{{ $t('login.loginBtn') }}</view>
			<view class="line_box">
				<view class="line"></view>
				<view>or</view>
				<view class="line"></view>
			</view>
			<view class="navTo-btn" @click="goToLogin">{{ $t('login.loginlink1') }}<text class="themeColor">{{
				$t('login.loginlink2') }}</text></view>
		</view>
	</view>
</template>

<script>
import {
	loginApi
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
			topStyle: 0,
			itemfocus: 0,
			remember: false,
			showPwd: false,
			webTitle: '',
			// 国际化
			languageList: [],
			currentLanguage: '',
			showLanguagePopup: false,
			backendDefaultLanguage: '',
			currentLanguageName: '',
		}
	},
	onLoad() {
		this.webTitle = uni.getStorageSync('settings').webTitle
		uni.removeStorageSync('userInfo');
		this.remember = uni.getStorageSync('remember', false);
		if (this.remember) {
			this.phone = uni.getStorageSync('phone', '');
			this.password = uni.getStorageSync('password', '');
		}
		this.getLanguageApi()
		this.backendDefaultLanguage = uni.getStorageSync('Language') ||
			uni.getStorageSync('defaultLanguage') || this.backendDefaultLanguage || 'en'
	},
	methods: {
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
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 44) + "rpx"
			// #endif
		},
		inputfocus(i) {
			this.itemfocus = i
		},
		handleAreaCodeChange(e) {
			this.selectedAreaCode = this.areaCodes[e.detail.value]
		},
		/**
		 * 验证加纳手机号格式
		 * 支持格式:
		 * - 本地格式: 0XXXXXXXX (10位数字，以0开头)
		 */
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
		handlelogin() {
			// if (!this.validatePhoneFormat()) {
			// 	this.$showMessage('warning', this.$t('login.invalidGhanaPhone'))
			// 	return
			// }
			if (!this.phone) {
				this.$showMessage('warning', this.$t('请输入账号'))
				return
			}
			if (!this.password) {
				this.$showMessage('warning', this.$t('register.pwdPlaceHolder'))
				return
			}
			// TODO: 调用登录接口
			let parms = {
				"password": this.password,
				"username": this.phone,
				"version": "100"
			}
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			loginApi(parms).then((res) => {
				uni.setStorageSync('token', res.data.token);
				uni.setStorageSync('remember', this.remember);
				if (this.remember) {
					uni.setStorageSync('phone', this.phone);
					uni.setStorageSync('password', this.password);
				} else {
					uni.removeStorageSync('phone')
					uni.removeStorageSync('password')
				}
				uni.reLaunch({
					url: '/pages/HomePage/index'
				})
			}).catch((err) => {
				console.log('request fail', err);

				const errorMessages = {
					'用户不存在/密码错误': '用户不存在/密码错误',
					'密码输入错误5次，帐户锁定10分钟': '密码输入错误5次，帐户锁定10分钟'
				};

				if (err.data?.code == 403) {
					this.$showMessage('warning', err.data?.msg);
				} else {
					const msg = errorMessages[err.msg] ? this.$t(errorMessages[err.msg]) : err.msg;
					this.$showMessage('warning', msg);
				}
			}).finally(() => {
				uni.hideLoading();
			})
		},
		goToLogin() {
			uni.navigateTo({
				url: '/pages/LoginPage/register'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.login_top_bg {
	width: 100%;
}

.login_top_title {
	width: 186rpx;
	height: 64rpx;
	margin: 48rpx 0 74rpx 48rpx;
}

.logo_text {
	font-size: 52rpx;
	font-weight: bold;
	color: #000000;
	margin: 48rpx 0 74rpx 48rpx;
}

.login_desc {
	margin-left: 48rpx;

	.desc1 {
		font-size: 48rpx;
		font-weight: 900;
		margin-bottom: 16rpx;
	}

	.desc2 {
		font-size: 32rpx;
	}
}

.language-entry {
	position: absolute;
	right: 32rpx;
	top: 52rpx;
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 10rpx 18rpx;
	border-radius: 2026rpx;
	background: rgba(255, 255, 255, 0.16);
	color: #000;
	font-size: 24rpx;

	.language-entry-img {
		width: 48rpx;
		height: 48rpx;
	}
}

.form-item-box {
	padding: 42rpx 48rpx;
}

.login-container {

	.form-item {
		margin-bottom: 32rpx;

		&:last-child {
			margin-bottom: 46rpx;
		}

		.phone-input {
			display: flex;
			align-items: center;
			justify-content: center;

			.area-code-box {
				display: flex;
				align-items: center;
				justify-content: center;
				border-right: 2rpx solid #2F2F2F;
				margin-right: 16rpx;
				height: 102rpx;
				padding-right: 24rpx;
			}

			.area-code {
				font-family: 'DINPro-Regular', sans-serif;
				font-weight: 400;
				font-size: 32rpx;
				color: #6C6C74;
				line-height: 36rpx;
				text-align: center;
				font-style: normal;
			}
		}


		input {
			flex: 1;
			height: 102rpx;
			font-size: 28rpx;
			font-family: 'DINPro-Regular', sans-serif;
		}

		::v-deep .uni-input-placeholder {
			color: #ADADAD;
		}
	}

	.login-btn {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		background: #000000;
		border-radius: 2026rpx;
		font-family: 'DINPro-Bold', sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		text-align: center;
		font-style: normal;
		text-transform: none;
		margin-top: 60rpx;
	}

	.line_box {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24rpx;
		margin: 94rpx 0 52rpx;
		color: #D0D0D0;
		font-size: 24rpx;

		.line {
			width: 100%;
			height: 2rpx;
			background-color: #D0D0D0;
		}
	}



	.navTo-btn {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		background: #fff;
		border-radius: 2026rpx;
		font-size: 32rpx;
		color: #000;
		text-align: center;
		font-style: normal;
		text-transform: none;
		border: 2rpx solid #000000;

		.themeColor {
			font-weight: bold;
		}
	}
}

.login_icon {
	width: 40rpx;
	height: 40rpx;
}

.login_title {
	width: auto;
	height: 42rpx;
	background: #FFFFFF;
	font-family: 'DINPro-Bold', sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	font-style: normal;
	margin-bottom: 16rpx;
}

.inpt_box {
	display: flex;
	padding: 0 24rpx;
	height: 102rpx;
	flex: 1;
	align-items: center;
	justify-content: center;
}


.item_box {
	border-radius: 10rpx;
	border: 2rpx solid #2F2F2F;
	position: relative;
}

.item_img {
	width: 40rpx;
	height: 40rpx;
	margin-right: 30rpx;
}

.item_right_img {
	width: 46rpx;
	height: 46rpx;
}

.remember_check_box {
	display: flex;
	align-items: center;
}

.remember_unchecked {
	width: 28rpx;
	height: 28rpx;
	border: 2rpx solid #898989;
	border-radius: 50%;
	box-sizing: border-box;
}

.remember_checked {
	box-sizing: border-box;
	width: 28rpx;
	height: 28rpx;
	background: #000;
	border: 6rpx solid #EDEDED;
	border-radius: 50%;
}

.remember_tips {
	font-weight: 400;
	font-size: 24rpx;
	color: #000;
	line-height: 24rpx;
	text-align: center;
	font-style: normal;
	margin-left: 8rpx;
}

.language-popup {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding: 24rpx 24rpx 40rpx;
}


.language-mask {
	position: fixed;
	inset: 0;
	z-index: 99;
	background: rgba(0, 0, 0, 0.35);

	.language-popup-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #111;
		margin-bottom: 16rpx;
	}

	.language-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f1f1f1;
		color: #333;
		font-size: 28rpx;
	}
}
</style>
