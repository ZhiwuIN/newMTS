<template>
	<view class="register-container">
		<view class="login_top_bg" :style="topStyle">
			<!-- <image src="/static/logo.png" alt="" class="login_top_title" /> -->
			<view class="logo_text">{{ webTitle }}</view>
			<view class="login_desc">
				<view class="desc1">{{ $t('创建您的账户') }}</view>
				<view class="desc2">{{ $t('只需几个细节，你就可以开始啦') }}</view>
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
				<view class="phone-input item_box">
					<view class="inpt_box">
						<view class="area-code-box">
							<!-- <picker class="area-code" mode="selector" :range="areaCodes" @change="handleAreaCodeChange"> -->
							<text>+{{ selectedAreaCode }}</text>
							<!-- <uni-icons type="down" size="16" style="margin-left: 10rpx;"></uni-icons> -->
							<!-- </picker> -->
						</view>
						<input type="number" v-model="phone" :placeholder="$t('register.phonePlaceHolder')" />
					</view>
				</view>
			</view>

			<view class="form-item">
				<view class="login_title">{{ $t('register.password') }}</view>
				<view class="password-input item_box">
					<view class="inpt_box">
						<input type="password" v-model="password" :placeholder="$t('register.pwdPlaceHolder')" />
					</view>
				</view>
			</view>
			<view class="form-item">
				<view class="login_title">{{ $t('register.password') }}</view>
				<view class="password-input item_box">
					<view class="inpt_box">
						<input type="password" v-model="confirmPassword" :placeholder="$t('register.pwdPlaceHolder')" />
					</view>
				</view>
			</view>

			<view class="form-item">
				<view class="login_title">{{ $t('register.invitation') }}</view>
				<view class="password-input item_box">
					<view class="inpt_box">
						<input v-model="inviteCode" :placeholder="$t('register.invitationPlaceHolder')" />
					</view>
				</view>
			</view>

			<!-- <t-loading v-if="isLoading" theme="dots" size="40px" style="margin-top: -34rpx;" /> -->
			<view class="login-btn" @click="handleRegister">{{ $t('register.registerBtn') }}
			</view>
			<view class="navTo-btn" @click="goToLogin">{{ $t('register.registerlink1') }}<text class="themeColor">{{
				$t('register.registerlink2') }}</text></view>
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

.form-item-box {
	padding: 42rpx 48rpx;
}

.register-container {

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
		margin-bottom: 24rpx;
	}

	.login-link {
		font-family: 'DINPro-Regular', sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #999999;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 56rpx;
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

.register_icon {
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


.language-mask {
	position: fixed;
	inset: 0;
	z-index: 99;
	background: rgba(0, 0, 0, 0.35);

	.language-popup {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		padding: 24rpx 24rpx 40rpx;
	}

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