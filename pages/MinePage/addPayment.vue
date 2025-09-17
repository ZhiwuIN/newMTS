<template>
	<customnavbar :title="$t('mobilePayment.title')">
		<view class="password-set">
			<!-- 密码输入区域 -->
			<view class="set_t1">
				{{$t('mobilePayment.accountname')}}
			</view>
			<view class="set_input">
				<input v-model="accountName" :placeholder="$t('mobilePayment.accountname')"
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
			</view>
			<view class="set_t1" style="margin-top: 53rpx;">
				{{$t('mobilePayment.accountnumber')}}
			</view>
			<view class="set_input">
				<input v-model="accountNumber" :placeholder="$t('mobilePayment.accountnumber')"
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" maxlength="13" />
			</view>
			<view class="set_t1" style="margin-top: 53rpx;">{{$t('mobilePayment.MobileMoneyPayment')}}</view>
			<view class="set_input">
				<!-- <input v-model="bankName" :placeholder="$t('mobilePayment.MobileMoneyPayment')"
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" /> -->
				<uni-data-select v-model="bankCode" :localdata="bankList" @change="handleBankChange"
					:emptyTips="$t('noData')" :placeholder="$t('mobilePayment.MobileMoneyPayment')"
					:clear="false"></uni-data-select>
			</view>
			<view class="mobilePayment_tips">
				{{$t('mobilePayment.tips')}}
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
		bindPaymentApi
	} from "@/common/api/deposit.js";
	import {
		bankListApi,
		withdrawalbankSysListApi
	} from "@/common/api/withdrawal.js";
	import {
		userInfoApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar: customnavbar
		},
		data() {
			return {
				accountName: '',
				accountNumber: '',
				bankName: '',
				bankCode: '',
				bankList: [],
				userInfo: {},
				loading: false
			}
		},
		onShow() {
			this.getBankList()
		},
		methods: {
			getBankList() {
				withdrawalbankSysListApi().then((res) => {
					this.bankList = res.data.map(item => ({
						value: item.bankCode,
						text: item.bankName
					}))

				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			// 验证密码格式
			validatePayment() {
				if (!this.accountName) {
					this.$showMessage('warning', this.$t('mobilePayment.accountname'));
					// uni.showToast({
					// 	title: this.$t('mobilePayment.accountname'),
					// 	icon: 'none'
					// });
					this.loading = false
					return false;
				}
				if (!this.accountNumber) {
					this.$showMessage('warning', this.$t('mobilePayment.accountnumber'));
					this.loading = false
					return false;
				}
				this.accountNumber = this.accountNumber.replace(/\s/g, '')
				const cleaned = this.accountNumber
				// 银行卡号正则表达式
				const Regex = /^\d{10}$|^\d{13}$/;
				if (!Regex.test(cleaned)) {
					this.$showMessage('warning', this.$t('银行卡号校验'))
					this.loading = false
					return false;
				}

				if (!this.bankCode) {
					this.$showMessage('warning', this.$t('mobilePayment.MobileMoneyPayment'));
					this.loading = false
					return false;
				}
				return true;
			},
			// 确认提交
			handleConfirm() {
				if (!this.validatePayment()) return;
				console.log(this.loading)
				if (this.loading) return
				this.loading = true
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				userInfoApi().then((res) => {
					this.userInfo = res.data
					uni.setStorageSync('userInfo', res.data)
					let params = {
						"accountNumber": this.accountNumber,
						"accountName": this.accountName,
						"bankName": this.bankList.find(item => item.value === this.bankCode).text,
						"bankCode": this.bankCode,
						"userid": this.userInfo.userId
					}
					bindPaymentApi(params).then((res) => {
						this.$showMessage('success', this.$t('toast.success'));
						this.$customizeBack()
						setTimeout(() => {
							this.loading = false
						}, 2000)
					}).catch((err) => {
						console.log('request fail', err);
						this.$showMessage('warning', err.msg);
						this.loading = false
					})
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})
			},
		}

	}
</script>

<style lang="scss" scoped>
	::v-deep .uni-select {
		border: 0rpx solid;
		height: 112rpx;

		text::before {
			// font-family: "DINPro-Black", sans-serif;
			font-weight: 500;
			font-size: 30rpx;
			color: #4C69FF;
		}
	}

	::v-deep .uni-select__input-text {
		font-family: "DINPro-Black", sans-serif;
		font-weight: 500;
		font-size: 30rpx;
		color: #000000;
		font-style: normal;
	}

	::v-deep .uni-select__input-placeholder {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 400;
		font-size: 30rpx;
		color: #e5e5e5;
		font-style: normal;
	}

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

	.mobilePayment_tips {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #B6B6B6;
		line-height: 40rpx;
		text-align: left;
		font-style: normal;
		margin-top: 44rpx;
	}

	.pay_item {
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 32rpx;
		border: 2rpx solid #F6F6F6;
	}
</style>