<template>
	<customnavbar :title="$t('pages.register')"
		backgroundStr="url('/static/login/login_bg.png') top left/100%  no-repeat" @mtop="mtop" :showBack="true"
		:whiteTitle="true">
		<view class="register-container">
			<view class="register_top_bg" :style="topStyle">
				<view class="login_title">
					CWPC
				</view>
				<view class="login_desc">
					{{$t('register.desc')}}
				</view>

			</view>
			<view class="form-item-box">
				<view class="form-item">
					<view class="phone-input" :class="itemfocus==0?'item_box_a':'item_box'" @click="inputfocus(0)">
						<view class="register_title">{{$t('register.phone')}}</view>
						<view class="inpt_box">
							<image src="/static/login/phone_a.svg" alt="" class="item_img" />
							<picker class="area-code" mode="selector" :range="areaCodes" @change="handleAreaCodeChange">
								<text>+{{selectedAreaCode}}</text>
								<uni-icons type="down" size="16" style="margin-left: 10rpx;"></uni-icons>
							</picker>
							<input type="number" v-model="phone" :placeholder="$t('register.phonePlaceHolder')"
								maxlength="10" @focus="inputfocus(0)" />
						</view>
					</view>
				</view>

				<view class="form-item">
					<view class="password-input" :class="itemfocus==1?'item_box_a':'item_box'">
						<view class="register_title">{{$t('register.password')}}</view>
						<view class="inpt_box">
							<image src="/static/login/pwd.png" alt="" class="item_img" />
							<input type="password" v-model="password" :placeholder="$t('register.pwdPlaceHolder')"
								@focus="inputfocus(1)" />
						</view>
					</view>
				</view>
				<view class="form-item">
					<view class="password-input" :class="itemfocus==2?'item_box_a':'item_box'">
						<view class="register_title">{{$t('register.password')}}</view>
						<view class="inpt_box">
							<image src="/static/login/pwd.png" alt="" class="item_img" />
							<input type="password" v-model="confirmPassword"
								:placeholder="$t('register.pwdPlaceHolder')" @focus="inputfocus(2)" />
						</view>
					</view>
				</view>
				<!-- <view class="form-item">
					<view class="password-input" :class="itemfocus==3?'item_box_a':'item_box'">
						<view class="register_title">{{$t('register.verification')}}</view>
						<view class="inpt_box">
							<image v-if="itemfocus==3" src="/static/login/verfy_a.svg" alt="" class="item_img" />
							<image v-else src="/static/login/verfy.svg" alt="" class="item_img" />
							<input v-model="verfyCode"
								:placeholder="$t('register.verificationPlaceHolder')" @focus="inputfocus(3)" />
						</view>
					</view>
				</view> -->

				<view class="form-item">
					<view class="password-input" :class="itemfocus==4?'item_box_a':'item_box'">
						<view class="register_title">{{$t('register.invitation')}}</view>
						<view class="inpt_box">
							<image src="/static/login/invitation_a.svg" alt="" class="item_img" />
							<input v-model="inviteCode" :placeholder="$t('register.invitationPlaceHolder')"
								@focus="inputfocus(4)" />
						</view>
					</view>
				</view>

				<!-- <t-loading v-if="isLoading" theme="dots" size="40px" style="margin-top: -34rpx;" /> -->
				<view class="register-btn" @click="handleRegister">{{$t('register.registerBtn')}}
				</view>
				<view class="login-link" @click="goToLogin">{{$t('register.registerlink1')}}<text
						class="themeColor">{{$t('register.registerlink2')}}</text></view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		registerApi
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
				confirmPassword: '',
				verfyCode: '',
				inviteCode: '',
				topStyle: 0,
				itemfocus: 0,
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
			validatePhoneFormat() {
				// 清除空格
				this.phone = this.phone.replace(/\s/g, '')
				const cleanedPhone = this.phone

				if (this.selectedAreaCode != '233') {
					return true
				}

				// 加纳手机号正则表达式
				const ghanaPhoneRegex = /^0\d{9}$/;

				if (!ghanaPhoneRegex.test(cleanedPhone)) {
					return false;
				}

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
			}
		},
		onLoad() {
			uni.removeStorageSync('userInfo');
			this.inviteCode = uni.getStorageSync('InvitationCode')
			// console.log('邀请码:', code);
		}
	}
</script>

<style lang="scss" scoped>
	.themeColor {
		color: $themeColor !important;
	}

	.register_top_bg {
		width: 750rpx;
		background: url('/static/login/login_bg.png') top left/100% no-repeat;
		padding-bottom: 68rpx;
	}

	.login_title {
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

	.register-container {

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

		.register-btn {
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
			margin-top: -34rpx;
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

	.register_icon {
		width: 40rpx;
		height: 40rpx;
	}

	.register_title {
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
</style>