<template>
	<customnavbar
		:title="type=='login'?$t('pages.SetLoginPwd'):type=='payment'?$t('pages.SetPayPwd'):$t('pages.SetWithdrawPwd')">
		<view class="password-set">
			<!-- 密码输入区域 -->
			<view class="set_t1" v-if="!hasWithdrawalPassword && type == 'withdraw'">
				{{ (type == 'withdraw' ? '' : $t('password.old'))+ " " +(type=='login'?$t('pages.SetLoginPwd'):type=='payment'?$t('pages.SetPayPwd'):$t('pages.SetLoginPwd'))}}
			</view>
			<view class="set_t1" v-if="hasWithdrawalPassword && type == 'withdraw'">
				{{$t('旧的取款密码')}}
			</view>
			<view class="set_t1" v-if="type == 'login'">
				{{ (type == 'withdraw' ? '' : $t('password.old'))+ " " +(type=='login'?$t('pages.SetLoginPwd'):type=='payment'?$t('pages.SetPayPwd'):$t('pages.SetLoginPwd'))}}
			</view>
			<view class="set_input" v-if="!hasWithdrawalPassword && type == 'withdraw'">
				<input type="password" v-model="oldPassword"
					:placeholder="type == 'withdraw' ? $t('register.pwdPlaceHolder') : $t('password.placeholder1')"
					password placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
			</view>
			<view class="set_input" v-if="hasWithdrawalPassword && type == 'withdraw'">
				<input type="password" v-model="oldPassword" :placeholder="$t('请输入旧的取款密码')" password
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
			</view>
			<view class="set_input" v-if="type == 'login'">
				<input type="password" v-model="oldPassword"
					:placeholder="type == 'withdraw' ? $t('register.pwdPlaceHolder') : $t('password.placeholder1')"
					password placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
			</view>
			<view class="set_t1" style="margin-top: 53rpx;">
				{{$t('password.new')+" "+(type=='login'?$t('pages.SetLoginPwd'):type=='payment'?$t('pages.SetPayPwd'):$t('pages.SetWithdrawPwd'))}}
			</view>
			<view class="set_input">
				<input type="password" v-model="newPassword" :placeholder="$t('password.placeholder2')" password
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
			</view>
			<view class="set_t1" style="margin-top: 53rpx;">{{$t('password.Confirmpassword')}}</view>
			<view class="set_input">
				<input type="password" v-model="confirmPassword" :placeholder="$t('password.placeholder3')" password
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
			</view>

			<!-- 确认按钮 -->
			<view class="btn-section">
				<button class="confirm-btn" @click="handleConfirm">{{$t("password.Submit")}}</button>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		changePasswordApi
	} from "@/common/api/users.js";
	import {
		withdrawalPasswordApi
	} from "@/common/api/withdrawal.js";
	export default {
		components: {
			customnavbar: customnavbar
		},
		data() {
			return {
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
				type: 'login', // login, payment, withdraw
				hasWithdrawalPassword: false
			}
		},
		onLoad(options) {
			// 获取路由参数
			this.type = options.type;
			this.hasWithdrawalPassword = uni.getStorageSync('userInfo').hasWithdrawalPassword
		},
		methods: {
			// 验证密码格式
			validatePassword() {
				
				if (!this.oldPassword) {
					this.$showMessage('warning', this.$t('password.placeholder1'));
					return false;
				}
				if (!this.newPassword) {
					this.$showMessage('warning', this.$t('password.placeholder2'));
					return false;
				}
				if (this.type == 'login' && this.newPassword.length < 6 || this.newPassword.length > 20) {
					this.$showMessage('warning', this.$t('password.passwordlength'));
					return false;
				}
				if (this.newPassword !== this.confirmPassword) {
					this.$showMessage('warning', this.$t('password.passworddiffer'));
					return false;
				}
				if (this.type == 'withdraw' && this.newPassword.length != 6) {
					this.$showMessage('warning', this.$t('提现密码请输入六位'));
					return false;
				}
				
				if (this.type == 'withdraw' && this.newPassword.length != 6) {
					this.$showMessage('warning', this.$t('提现密码请输入六位'));
					return false;
				}
				
				
				if (this.type == 'withdraw' && !(/^\d+$/.test(this.newPassword))) {
					this.$showMessage('warning', this.$t('提现密码需要为纯数字'));
					return false;
				}
				
				
				return true;
			},

			// 确认修改密码
			handleConfirm() {
				if (!this.validatePassword()) return;
				let params = {}
				switch (this.type) {
					case 'withdraw':
						if(this.hasWithdrawalPassword) {
							params = {
								"newWithdrawPassword": this.newPassword,
								"oldWithdrawPassword": this.oldPassword,
								"confirmWithdrawPassword": this.confirmPassword
							}
						}else {
							params = {
								"newWithdrawPassword": this.newPassword,
								"loginPassword": this.oldPassword,
								"confirmWithdrawPassword": this.confirmPassword
							}
						}
						this.changeWithdrawalPasswordApi(params)
						break;
					case 'login':
						params = {
							"newPassword": this.newPassword,
							"oldPassword": this.oldPassword,
							"confirmPassword": this.confirmPassword
						}
						this.changeLoginPasswordApi(params)
						break;
					default:
						break;
				}

			},
			changeWithdrawalPasswordApi(params) {
				withdrawalPasswordApi(params).then((res) => {
					this.$showMessage('success', this.$t('toast.success'));
					// 返回上一页
					setTimeout(() => {
						this.$customizeBack()
					}, 500);
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
					// uni.showToast({
					// 	title: err.msg,
					// 	icon: 'none'
					// })
				})
			},
			changeLoginPasswordApi(params) {
				changePasswordApi(params).then((res) => {
					this.$showMessage('success', this.$t('toast.success'));
					// uni.showToast({
					// 	title: this.$t('toast.success'),
					// 	icon: 'none'
					// });
					// 返回上一页
					setTimeout(() => {
						this.$customizeBack()
					}, 1500);
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);

					// uni.showToast({

					// 	title: err.msg,

					// 	icon: 'none'

					// })
				})
			}
		}

	}
</script>

<style lang="scss" scoped>
	.password-set {
		padding: 70rpx 40rpx;

		.btn-section {
			margin-top: 92rpx;

			.confirm-btn {
				height: 96rpx;
				background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
				border-radius: 24rpx;
				font-family: "DINPro-Bold", sans-serif;
				font-weight: bold;
				font-size: 36rpx;
				color: #FFFFFF;
				line-height: 96rpx;
				text-align: center;
				font-style: normal;
				text-transform: none;
			}
		}
	}

	.set_t1 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 44rpx;
		text-align: left;
		font-style: normal;
	}

	.set_input {
		padding: 0 34rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 42rpx;
		border: 2rpx solid #F6F6F6;
		margin-top: 24rpx;
	}

	input {
		height: 112rpx;
		font-size: 28rpx;
	}
</style>