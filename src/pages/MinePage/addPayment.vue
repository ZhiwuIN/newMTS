<script>
import {
	bindPaymentApi,
} from '@/common/api/deposit.js'
import {
	userInfoApi,
} from '@/common/api/users.js'
import {
	bankListApi,
	withdrawalbankSysListApi,
} from '@/common/api/withdrawal.js'
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'

export default {
	components: {
		customnavbar,
	},
	data() {
		return {
			accountName: '',
			accountNumber: '',
			bankName: '',
			bankCode: '',
			bankList: [],
			userInfo: {},
			loading: false,
		}
	},
	onShow() {
		if (uni.getStorageSync('bankInfo')) {
			this.bankName = JSON.parse(uni.getStorageSync('bankInfo')).bankName
			this.bankCode = JSON.parse(uni.getStorageSync('bankInfo')).bankCode
			uni.removeStorageSync('bankInfo')
		}

		// this.getBankList()
	},
	methods: {
		pushBankList() {
			uni.navigateTo({
				url: '/pages/MinePage/bankList',
			})
		},
		getBankList() {
			withdrawalbankSysListApi().then((res) => {
				this.bankList = res.data.map(item => ({
					value: item.bankCode,
					text: item.bankName,
				}))
			}).catch((err) => {
				console.log('request fail', err)
				this.$showMessage('warning', err.msg)
			})
		},
		// 验证密码格式
		validatePayment() {
			if (!this.accountName) {
				this.$showMessage('warning', this.$t('mobilePayment.accountname'))
				// uni.showToast({
				// 	title: this.$t('mobilePayment.accountname'),
				// 	icon: 'none'
				// });
				this.loading = false
				return false
			}
			if (!this.accountNumber) {
				this.$showMessage('warning', this.$t('mobilePayment.accountnumber'))
				this.loading = false
				return false
			}
			this.accountNumber = this.accountNumber.replace(/\s/g, '')
			const cleaned = this.accountNumber
			// 银行卡号正则表达式
			const Regex = /^\d{1,18}$/
			if (!Regex.test(cleaned)) {
				this.$showMessage('warning', this.$t('银行卡号校验'))
				this.loading = false
				return false
			}

			if (!this.bankCode) {
				this.$showMessage('warning', this.$t('mobilePayment.MobileMoneyPayment'))
				this.loading = false
				return false
			}
			return true
		},
		// 确认提交
		handleConfirm() {
			if (!this.validatePayment())
				return
			if (this.loading)
				return
			this.loading = true
			uni.showLoading({
				title: this.$t('loading.btn'),
			})
			userInfoApi().then((res) => {
				this.userInfo = res.data
				uni.setStorageSync('userInfo', res.data)
				let params = {
					accountNumber: this.accountNumber,
					accountName: this.accountName,
					bankName: this.bankName,
					bankCode: this.bankCode,
					userid: this.userInfo.userId,
				}
				bindPaymentApi(params).then((res) => {
					this.$showMessage('success', this.$t('toast.success'))
					this.$customizeBack()
					setTimeout(() => {
						this.loading = false
					}, 2000)
				}).catch((err) => {
					console.log('request fail', err)
					this.$showMessage('warning', err.msg)
					this.loading = false
				})
			}).catch((err) => {
				console.log('request fail', err)
				this.$showMessage('warning', err.msg)
			}).finally(() => {
				uni.hideLoading()
			})
		},
	},

}
</script>

<template>
	<customnavbar :title="$t('mobilePayment.title')">
		<view class="password-set">
			<!-- 密码输入区域 -->
			<view class="set_t1">
				{{ $t('mobilePayment.accountname') }}
			</view>
			<view class="set_input">
				<input v-model="accountName" :placeholder="$t('mobilePayment.accountname')"
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;">
			</view>
			<view class="set_t1" style="margin-top: 53rpx;">
				{{ $t('mobilePayment.accountnumber') }}
			</view>
			<view class="set_input">
				<input v-model="accountNumber" type="number" :placeholder="$t('mobilePayment.accountnumber')"
					placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" maxlength="18">
			</view>
			<view class="set_t1" style="margin-top: 53rpx;">
				{{ $t('mobilePayment.MobileMoneyPayment') }}
			</view>
			<view class="set_input" style="padding: 24rpx 34rpx;">
				<view v-if="!bankName" style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;"
					@click="pushBankList()">
					{{ $t('mobilePayment.MobileMoneyPayment') }}
				</view>
				<view v-else style="color: #000;font-size: 28rpx;font-weight: 500;" @click="pushBankList()">
					{{ bankName }}
				</view>
			</view>
			<view class="mobilePayment_tips">
				{{ $t('mobilePayment.tips') }}
			</view>

			<!-- 确认按钮 -->
			<view class="btn-section">
				<button class="confirm-btn" @click="handleConfirm">
					{{ $t("password.Submit") }}
				</button>
			</view>
		</view>
	</customnavbar>
</template>

<style lang="scss" scoped>
::v-deep .uni-select {
	border: 0rpx solid;
	height: 104rpx;

	text::before {
		font-weight: 500;
		font-size: 30rpx;
		color: #000;
	}
}

::v-deep .uni-select__input-text {
	font-weight: 500;
	font-size: 30rpx;
	color: #000000;
	font-style: normal;
}

::v-deep .uni-select__input-placeholder {
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
			background: $themeColor;
			border-radius: 16rpx;
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
	// box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 16rpx;
	border: 2rpx solid rgb(228, 228, 228);
	margin-top: 24rpx;
}

input {
	height: 112rpx;
	font-size: 28rpx;
}

.mobilePayment_tips {
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
