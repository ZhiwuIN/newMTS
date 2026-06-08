<template>
	<customnavbar :title="$t('pages.login')" backgroundStr="url('/static/login/login_bg.png') top left/100%  no-repeat"
		@mtop="mtop" :showBack="true" :whiteTitle="true">
		<view class="login-container">
			<view class="login_top_bg" :style="topStyle">
				<view class="login_top_title">
					CWPC
				</view>
				<view class="login_desc">
					{{$t('register.desc2')}}
				</view>

			</view>
			<view class="form-item-box">
				<view class="form-item">
					<view class="phone-input" :class="itemfocus==0?'item_box_a':'item_box'" @click="inputfocus(0)">
						<view class="login_title">{{$t('register.phone')}}</view>
						<view class="inpt_box">
							<image v-if="itemfocus==0" src="/static/login/phone_a.svg" alt="" class="item_img"
								style="margin-right: 10rpx;" />
							<image v-else src="/static/login/phone_a.svg" alt="" class="item_img"
								style="margin-right: 10rpx;" />
							<picker class="area-code" mode="selector" :range="areaCodes" @change="handleAreaCodeChange">
								<!-- <text>+{{selectedAreaCode}}</text> -->
								<!-- <uni-icons type="down" size="16" style="margin-left: 10rpx;"></uni-icons> -->
							</picker>
							<input type="text" v-model="phone" :placeholder="$t('请输入账号')"
								@focus="inputfocus(0)" />
						</view>
					</view>
				</view>

				<view class="form-item">
					<view class="password-input" :class="itemfocus==1?'item_box_a':'item_box'">
						<view class="login_title">{{$t('register.password')}}</view>
						<view class="inpt_box">
							<image src="/static/login/pwd.png" alt="" class="item_img" />
							<input :type="showPwd?'text':'password'" v-model="password"
								:placeholder="$t('register.pwdPlaceHolder')" @focus="inputfocus(1)" />
							<image v-if="!showPwd" src="/static/login/eye_close.png" alt="" class="item_right_img"
								@click="showPwd=!showPwd" />
							<image v-else src="/static/login/eye_open.png" alt="" class="item_right_img"
								@click="showPwd=!showPwd" />
						</view>
					</view>
				</view>
				<view class="remember_check_box" @click="remember=!remember">
					<view v-if="!remember" class="remember_unchecked"></view>
					<view v-else class="remember_checked"></view>
					<view class="remember_tips">{{$t('login.remember')}}</view>
				</view>
				<view class="login-btn" @click="handlelogin">{{$t('login.loginBtn')}}</view>
				<view class="login-link" @click="goToLogin">{{$t('login.loginlink1')}}<text
						class="themeColor">{{$t('login.loginlink2')}}</text></view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		loginApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar: customnavbar
		},
		data() {
			return {
				areaCodes: ['233'],
				selectedAreaCode: '233',
				phone: '',
				password: '',
				topStyle: 0,
				itemfocus: 0,
				remember: false,
				showPwd: false,
			}
		},
		onLoad() {
			uni.removeStorageSync('userInfo');
			this.remember = uni.getStorageSync('remember', false);
			if (this.remember) {
				this.phone = uni.getStorageSync('phone', '');
				this.password = uni.getStorageSync('password', '');
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

				if (this.selectedAreaCode != '233') {
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
	.themeColor {
		color: $themeColor !important;
	}

	.login_top_bg {
		width: 100%;
		background: url('/static/login/login_bg.png') top left/100% no-repeat;
		padding-bottom: 68rpx;
	}

	.login_top_title {
		font-family: 'DINPro-Bold', sans-serif;
		font-weight: bold;
		font-size: 64rpx;
		color: #FFFFFF;
		line-height: 82rpx;
		text-align: left;
		font-style: normal;
		padding-left: 60rpx;
	}

	.login_desc {
		font-family: 'DINPro-Regular', sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #FFFFFF;
		line-height: 34rpx;
		text-align: left;
		font-style: normal;
		padding-left: 60rpx;
	}

	.form-item-box {
		background: #FFFFFF;
		border-radius: 48rpx 48rpx 0rpx 0rpx;
		margin-top: -48rpx;
		padding: 80rpx 60rpx 52rpx 60rpx;
	}

	.login-container {

		.form-item {
			margin-bottom: 80rpx;

			.phone-input {
				display: flex;
				align-items: center;
				justify-content: center;

				.area-code {
					font-family: 'DINPro-Regular', sans-serif;
					margin-right: 22rpx;
					font-weight: 400;
					font-size: 26rpx;
					color: #6C6C74;
					line-height: 36rpx;
					text-align: center;
					font-style: normal;
				}
			}


			input {
				flex: 1;
				height: 112rpx;
				font-size: 26rpx;
				font-family: 'DINPro-Regular', sans-serif;
			}
		}

		.login-btn {
			width: 100%;
			height: 96rpx;
			line-height: 96rpx;
			background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
			border-radius: 24rpx;
			font-family: 'DINPro-Bold', sans-serif;
			font-weight: bold;
			font-size: 36rpx;
			color: #FFFFFF;
			text-align: center;
			font-style: normal;
			text-transform: none;
			margin-top: 60rpx;
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
		text-align: center;
		font-style: normal;
		position: absolute;
		left: 26rpx;
		top: -24rpx
	}

	.inpt_box {
		display: flex;
		padding: 0 30rpx;
		flex: 1;
		align-items: center;
		justify-content: center;
	}


	.item_box {
		border-radius: 24rpx;
		border: 2rpx solid #E6E6E7;
		position: relative;
	}

	.item_box_a {
		border-radius: 24rpx;
		border: 2rpx solid #0A0A17;
		position: relative;
	}

	.item_img {
		width: 40rpx;
		height: 40rpx;
		margin-right: 30rpx;
	}

	.item_right_img {
		width: 32rpx;
		height: 32rpx;
	}

	.remember_check_box {
		display: flex;
		align-items: center;
		margin-top: -60rpx;
	}

	.remember_unchecked {
		width: 20rpx;
		height: 20rpx;
		background: #EDEDED;
		box-shadow: 0rpx 4rpx 8rpx 0rpx #B2C8FB;
		border: 6rpx solid #EDEDED;
		border-radius: 50%;
	}

	.remember_checked {
		width: 20rpx;
		height: 20rpx;
		background: $themeColor;
		box-shadow: 0rpx 4rpx 8rpx 0rpx #B2C8FB;
		border: 6rpx solid #EDEDED;
		border-radius: 50%;
	}

	.remember_tips {
		font-family: 'DINPro-Regular', sans-serif;
		font-weight: 400;
		font-size: 20rpx;
		color: #999999;
		line-height: 28rpx;
		text-align: center;
		font-style: normal;
		margin-left: 20rpx;
		transform: translateY(2rpx);
	}
</style>