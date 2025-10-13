<template>
	<view>
		<customnavbar :title="$t('pages.withdrawal')">

			<view class="withdrawal-container">
				<view>
					<view class="hint">
						<view class="ball">
							<view class="line"></view>
						</view>
						<view>{{$t('Withdrawal.Ratio:')}}
							{{usdtRateOut}}{{withdrawalInfo.currency}}≈{{(1 - ( 1 / withdrawalInfo.fee)).toFixed(4)}}{{actualCurrency}}
							<br />
							{{ $t('withdrawalRules.feeMessageA')+(withdrawalInfo.fee || '-')+$t('withdrawalRules.feeMessageB')+(withdrawalInfo.dailyTimes || '-')+$t('withdrawalRules.feeMessageC') }}
						</view>
					</view>
					<view class="step2-t1">
						{{$t('Deposit.WithdrawAmount')}}
					</view>
					<view class="withdraw-amount-input" v-if="!customizedAmountList.length">
						<input type="digit" v-model="withdrawAmount" :placeholder="$t('Deposit.placeholder2')"
							@input="handleWithdrawInput"
							placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
						<text class="clear" @tap="clearWithdrawAmount" v-if="withdrawAmount">×</text>
					</view>
					<view class="step2-t2" v-if="!customizedAmountList.length">
						{{$t('Deposit.min')}}: {{minAmount}}{{withdrawalInfo.currency}} {{$t('Deposit.max')}}:
						{{maxAmount}}{{withdrawalInfo.currency}}
						<br />
						{{$t('Deposit.balance')}}{{withdrawalInfo.balance}}{{withdrawalInfo.currency}}
					</view>
					<view class="quick-amount">
						<view class="amount-item" v-for="(item, index) in customizedAmountList" :key="index"
							@tap="selectQuickAmount(item)" :class="{'active': withdrawAmount == item}">
							{{item}}
						</view>
					</view>
					<view class="withdraw-amount-input" v-if="customizedAmountList.length && userInfo.levelCode == '0'">
						<input type="digit" v-model="withdrawAmount" :placeholder="withdrawalInfo.limitAmount ? $t('自由输入') + withdrawalInfo.limitAmount + '+' : $t('自由输入2')"
							@input="handleWithdrawInput" @blur="handleWithdrawInputBlur"
							:disabled="withdrawalInfo.balance < withdrawalInfo.limitAmount"
							placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
						<text class="clear" @tap="clearWithdrawAmount" v-if="withdrawAmount">×</text>
					</view>
					<view class="step2-t2"
						v-if="customizedAmountList.length && userInfo.levelCode == '0' && withdrawalInfo.balance < withdrawalInfo.limitAmount">
						{{$t('余额达到才可输入') + withdrawalInfo.limitAmount}}{{withdrawalInfo.currency}}
					</view>
					<view class="step2-t2" v-if="customizedAmountList.length">
						{{$t('Deposit.balance')}}{{withdrawalInfo.balance}}{{withdrawalInfo.currency}}
					</view>
					<view class="step2-t3">
						{{$t('Deposit.WithdrawAccount')}}
					</view>
					<view class="account_box">
						<image src="/static/mine/visa.png" class="account_card"></image>
						<view type="line" class="account_select">
							<uni-data-select v-model="bankId" :localdata="withdrawalInfo.banks"
								@change="handleBankChange" :emptyTips="$t('noData')" :placeholder="$t('task.asktips')"
								:clear="false"></uni-data-select>
						</view>
					</view>
					<view class="withdrawal-btn" @click="handleWithdraw()">
						{{$t('task.Submit')}}
					</view>
				</view>

			</view>
		</customnavbar>
		<uni-popup ref="paypopup" type="center" border-radius="10px 10px 0 0">
			<view class="pay_pop_page">
				<view class="pay_pop_top">{{$t('pages.withdrawal')}}</view>
				<view class="pay_pop_no">{{withdrawAmount}} {{withdrawalInfo.currency}}</view>
				<view class="pay_details">
					<!--  手续费 -->
					<view class="pay_details_t">{{$t('pay.ServiceCharge')}}: {{Fee.fee * usdtRateOut}} {{actualCurrency}}
					</view>
					<!--  费率 -->
					<view class="pay_details_t">
						{{$t('pay.Rate')}}: {{Fee.rate}}
					</view>
					<!--  实际到账 -->
					<view class="pay_details_t">
						{{$t('pay.AAR')}}: {{(withdrawAmount - Fee.fee) / usdtRateOut}} {{actualCurrency}}
					</view>
					<!-- 账户 -->
					<view class="pay_details_t">
						{{$t('pay.WithdrawToAccount')}}：{{formatCardNumber(cardNo)}}
					</view>
				</view>
				<view class="pay_pop_content">{{$t('pay.password')}}</view>
				<view class="password-box" @click="focusInput">
					<view class="input-box" v-for="(item, index) in 6" :key="index">
						<text v-if="password.length > index">●</text>
					</view>
				</view>
				<!-- 隐藏的输入框，用于调起键盘 -->
				<input type="number" :maxlength="6" v-model="password" class="hidden-input" :focus="isFocus"
					@blur="onBlur" />
				<button class="pay_confirm_btn" @click="payConfirm">{{$t('home.Confirm')}}</button>
			</view>
		</uni-popup>
		<uni-popup ref="promptpopup" type="center" :mask-click="false" >
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
				<view class="prompt_pop_taps">{{failTips}}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_cancel_btn"
						v-if="this.promptConfirm == 'toSetPwd' || this.promptConfirm == 'toAddBank'"
						@click="prompt_cancel">{{$t('pay.no')}}</button>
					<button class="prompt_confirm_btn" @click="prompt_confirm">{{$t('pay.yes')}}</button>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="promptpopup2" type="center" :mask-click="false" >
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
				<view class="prompt_pop_taps" v-html="failTips"></view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm2">{{$t('pay.yes')}}</button>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="promptpopup3" type="center" :mask-click="false" >
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
				<view class="prompt_pop_taps">
					{{errTips}}
				</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm3">{{$t('pay.yes')}}</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		withdrawalApi,
		withdrawalInfoApi,
		withdrawalFeeApi,
		withdrawalCustomizedAmountApi
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
				errTips: '',
				password: '',
				isFocus: false,
				withdrawAmount: '',
				withdrawalInfo: {
					banks: []
				},
				failTips: '',
				bankId: -1,
				cardNo: '',
				Fee: {},
				promptConfirm: '',
				customizedAmountList: [],
				minAmount: '-',
				maxAmount: '-',
				userInfo: {},
				actualCurrency: '',
				usdtRateOut: '',
				isRestrictedAccess: false
			}
		},
		onShow() {
			
			this.userType = uni.getStorageSync('userInfo').userType
			if (this.userType == 'test') {
				this.$customizeBack()
				return
			}
			this.getUserInfo()
			this.getWithdrawalInfo()
			this.minAmount = uni.getStorageSync('settings').minWithdrawal
			this.maxAmount = uni.getStorageSync('settings').maxWithdrawal
			this.actualCurrency = uni.getStorageSync('settings').actualCurrency
			this.usdtRateOut = uni.getStorageSync('settings').usdtRateOut
		},
		methods: {
			getUserInfo() {
				userInfoApi().then((res) => {
					this.userInfo = res.data
					this.getCustomizedAmount(this.userInfo.levelCode)
					if(res.data.housekeeper == 1){
						this.isRestrictedAccess = true
						this.failTips = this.$t("withdrawal.restrictedAccess")
						this.$refs.promptpopup.open()
					}
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			getCustomizedAmount(levelCode) {
				withdrawalCustomizedAmountApi(levelCode).then((res) => {
					this.customizedAmountList = res.data || []
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			getWithdrawalInfo() {
				this.promptConfirm = ''
				withdrawalInfoApi().then((res) => {
					this.withdrawalInfo = res.data
					if (!this.withdrawalInfo.existWithdrawalPassword && !this.isRestrictedAccess ) {
						this.failTips = this.$t('withdrawal.failTips1')
						this.promptConfirm = 'toSetPwd'
						this.$refs.promptpopup.open()
					}
					if (this.withdrawalInfo.banks.length == 0 && !this.isRestrictedAccess) {
						this.failTips = this.$t('withdrawal.failTips2')
						this.promptConfirm = 'toAddBank'
						this.$refs.promptpopup.open()
					}
					this.withdrawalInfo.banks = this.withdrawalInfo.banks.map((item) => {
						return {
							cardNo: item.cardNo,
							value: item.bid,
							text: item.bankName + ' ' + item.cardNo
						}
					})
				}).catch((err) => {
					console.log('request fail', err);
					if (err.code == 800) {
						this.failTips = err.msg
						this.$refs.promptpopup2.open()
					} else {
						this.$showMessage('warning', err.msg);
					}
				})
			},
			selectQuickAmount(amount) {
				this.withdrawAmount = amount;
			},
			handleWithdrawInput(e) {
				let value = e.detail.value;
				// 限制只能输入数字和小数点
				value = value.replace(/[^\d.]/g, '');

				// 处理多个小数点的情况
				const dotIndex = value.indexOf('.');
				if (dotIndex !== -1) {
					// 只保留第一个小数点，后面的替换为空
					value = value.slice(0, dotIndex + 1) + value.slice(dotIndex + 1).replace(/\./g, '');
				}
			},
			handleWithdrawInputBlur(e) {
				let value = e.detail.value;
				const numValue = parseFloat(value);
				if (!isNaN(numValue) && numValue < this.withdrawalInfo.limitAmount) {
					this.withdrawAmount = this.withdrawalInfo.limitAmount
				} else {
					this.withdrawAmount = value;
				}
			},
			// 清空金额
			clearWithdrawAmount() {
				this.withdrawAmount = '';
			},
			// 处理充值
			handleWithdraw() {
				// 每天提现限制
				if (this.withdrawalInfo.currentDailyTimes >= this.withdrawalInfo.dailyTimes) {
					this.$showMessage('warning', this.$t('withdrawalRules.dailyTimes'));
					return
				}
				// 每月提现限制
				// if (this.withdrawalInfo.currentMonthTimes >= this.withdrawalInfo.monthTimes) {
				// 	this.$showMessage('warning', this.$t('withdrawalRules.monthTimes'));
				// 	return
				// }
				// 不为空
				if (!this.withdrawAmount) {
					this.$showMessage('warning', this.$t('Deposit.placeholder2'));
					return
				}
				if ((this.withdrawAmount < this.minAmount && !this.customizedAmountList.length) || (this.withdrawAmount >
						this.maxAmount && !this.customizedAmountList.length)) {
					this.$showMessage('warning', this.$t('withdrawal.amountRangeA') + this.minAmount + this.withdrawalInfo
						.currency + this.$t('withdrawal.amountRangeB') + this.maxAmount + this.withdrawalInfo
						.currency + this.$t('withdrawal.amountRangeC'));
					return;
				}

				// 余额不足
				if (this.withdrawAmount > this.withdrawalInfo.balance) {
					this.$showMessage('warning', this.$t('Deposit.balance') + this.withdrawalInfo.balance);
					return
				}
				if (this.bankId == -1) {
					this.$showMessage('warning', this.$t('task.asktips') + ' ' + this.$t('Deposit.WithdrawAccount'));
					return
				}

				if (!this.withdrawalInfo.existWithdrawalPassword && !this.isRestrictedAccess) {
					this.failTips = this.$t('withdrawal.failTips1')
					this.promptConfirm = 'toSetPwd'
					this.$refs.promptpopup.open()
					return
				}
				
				// 实习提现强校验
				if(this.userInfo.levelCode == '0' && this.withdrawAmount < this.withdrawalInfo.limitAmount && !this.customizedAmountList.includes(this.withdrawAmount)) {
					this.$showMessage('warning', this.$t('请遵循正确的提现规则'));
					return
				}
				
				// console.log(this.withdrawAmount + (this.withdrawAmount * (this.withdrawalInfo.fee / 100)))
				this.getFee()

			},
			getFee() {
				withdrawalFeeApi({
					'amount': this.withdrawAmount,
					'userId': this.userInfo.userId,
				}).then((res) => {
					this.Fee = res.data
					this.$refs.paypopup.open()
					this.password = []
				}).catch((err) => {
					this.errTips = err.msg
					this.$refs.promptpopup3.open()
					console.log('request fail', err);
					// this.$showMessage('warning', err.msg);
				})
			},
			handleBankChange(e) {
				// console.log(e)
				this.withdrawalInfo.banks.forEach((item) => {
					if (item.value == e) this.cardNo = item.cardNo
				})
			},
			focusInput() {
				this.isFocus = true
			},
			onBlur() {
				this.isFocus = false
			},
			payConfirm() {
				if (this.password == '' || this.password.length < 6) {
					this.$showMessage('warning', this.$t('password.placeholder3'));
					return
				}
				this.$refs.paypopup.close()
				//支付失败
				let userInfo = uni.getStorageSync('userInfo')
				let params = {
					"amount": this.withdrawAmount,
					"bid": this.bankId,
					"password": this.password,
					"requestId": "string",
					"uid": userInfo.userId,
					"username": userInfo.username
				}
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				withdrawalApi(params).then((res) => {
					//充值结果
					if (res.code == 200) {
						this.failTips = this.$t('post.applicationApproved')
					} else {
						this.failTips = res.msg
					}
					this.$refs.promptpopup.open()
				}).catch((err) => {
					this.$showMessage('warning', err.msg);
					console.log('request fail', err);
				}).finally(() => {
					uni.hideLoading();
				})
			},
			prompt_cancel() {
				this.$refs.promptpopup.close()
			},
			prompt_confirm() {
				this.$refs.promptpopup.close()
				if (this.promptConfirm == 'toSetPwd') {
					uni.navigateTo({
						url: '/pages/MinePage/password?type=withdraw'
					})
				} else if (this.promptConfirm == 'toAddBank') {
					uni.navigateTo({
						url: '/pages/MinePage/mobilePayment'
					})
				}else if (this.isRestrictedAccess) {
					uni.navigateBack()
				}else {
					uni.redirectTo({
						url: '/pages/MinePage/bills?currentTab=3'
					})
				}
			},
			// 提现关闭
			prompt_confirm2() {
				this.$customizeBack()
			},
			// 规定时间内提现
			prompt_confirm3() {
				this.$customizeBack()
			},
			formatCardNumber(cardNumber) {
				// 确保输入是字符串
				const str = String(cardNumber);

				// 移除所有空格
				const clean = str.replace(/\s/g, '');

				// // 检查是否是16位卡号
				// if (clean.length !== 16) {
				// 	return '请输入16位卡号';
				// }

				// 将前12位替换为星号
				const masked = clean.slice(0, -4) + '*'.repeat(4);

				// 每4位添加一个空格
				return masked.replace(/(.{4})/g, '$1 ').trim();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.withdrawal-container {
		padding: 40rpx;

		.hint {
			display: flex;
			align-items: center;
			padding: 26rpx 30rpx;
			background: #F5F8FF;
			border-radius: 16rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 20rpx;
			color: $themeColor;
			font-style: normal;
			margin-bottom: 30rpx;

			.ball {
				position: relative;
				min-width: 26rpx;
				min-height: 26rpx;
				border-radius: 50%;
				margin-right: 20rpx;
				background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);

				.line {
					position: absolute;
					width: 9rpx;
					height: 9rpx;
					top: 6rpx;
					left: 6rpx;
					border-radius: 50%;
					border-top: 2rpx solid #FFFFFF;
					transform: rotate(-45deg);
				}
			}
		}

		.withdraw-amount-input {
			position: relative;
			padding: 0 34rpx;
			background: #FFFFFF;
			box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
			border-radius: 42rpx;
			border: 2rpx solid #F6F6F6;
			margin-bottom: 30rpx;

			input {
				height: 84rpx;
				font-size: 28rpx;
				font-family: 'DINPro-Medium', sans-serif;
				font-weight: 500;
				font-size: 28rpx;
				color: #000;
				line-height: 36rpx;
				text-align: left;
				font-style: normal;
			}

			.clear {
				position: absolute;
				right: 20rpx;
				top: 50%;
				transform: translateY(-50%);
				font-size: 40rpx;
				color: #999;
			}
		}

		.amount-tip {
			margin: 20rpx 0;
			font-family: "DINPro-Regular", sans-serif;
			font-weight: 400;
			font-size: 20rpx;
			color: #000000;
			line-height: 28rpx;
			text-align: center;
			font-style: normal;
			margin-bottom: 55rpx;
		}


		.withdrawal-btn {
			margin-top: 46rpx;
			height: 96rpx;
			background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
			border-radius: 24rpx;
			font-family: 'DINPro-Bold', sans-serif;
			font-weight: bold;
			font-size: 36rpx;
			color: #FFFFFF;
			line-height: 96rpx;
			text-align: center;
			font-style: normal;
			text-transform: none;
		}
	}

	.pay_pop_page {
		background: #FFFFFF;
		border-radius: 26rpx;
		width: 574rpx;
		padding: 40rpx;
	}

	.pay_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.pay_pop_no {
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 64rpx;
		color: #000000;
		line-height: 82rpx;
		text-align: center;
		font-style: normal;
		margin-top: 32rpx;
	}

	.pay_pop_content {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 24rpx;
		color: #000000;
		line-height: 30rpx;
		text-align: justify;
		font-style: normal;
		margin-top: 6rpx;
	}

	.password-box {
		display: flex;
		justify-content: space-between;
		margin-top: 22rpx;

		.input-box {
			width: 72rpx;
			height: 72rpx;
			border-radius: 8rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 40rpx;
			background-color: #ECECEC;
		}
	}

	.hidden-input {
		position: absolute;
		top: -999px;
		left: -999px;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.pay_confirm_btn {
		height: 96rpx;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		margin-top: 34rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
		margin-bottom: 14rpx;
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


	.step2-t1 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 28rpx;
		color: #000000;
		line-height: 52rpx;
		text-align: left;
		font-style: normal;
		margin-bottom: 22rpx;
	}

	.step2-t2 {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 20rpx;
		color: #000000;
		line-height: 28rpx;
		text-align: center;
		font-style: normal;
		margin-bottom: 50rpx;
	}

	.step2-t3 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 28rpx;
		color: #000000;
		line-height: 52rpx;
		text-align: left;
		font-style: normal;
		margin-top: 50rpx;
	}

	.account_box {
		height: 112rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 16rpx 32rpx 4rpx rgba(119, 154, 241, 0.2);
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		padding: 0 34rpx;
		margin-top: 38rpx;
		font-family: "DINPro-Medium", sans-serif;
		font-size: 30rpx;
		font-weight: 500;
	}

	.account_card {
		width: 96rpx;
		height: 96rpx;
		margin-right: 42rpx;
	}

	.account_select {
		flex: 1;
	}

	::v-deep .uni-select {
		border: 0rpx solid;

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
		color: #B6B6B6;
		font-style: normal;
	}

	.pay_details {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		background: #F5F8FF;
		border-radius: 10rpx;
		padding: 18rpx;
		margin: 20rpx 0 30rpx;
	}

	.pay_details_t {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 20rpx;
		color: #000000;
		line-height: 24rpx;
		text-align: left;
		font-style: normal;
	}

	.quick-amount {
		display: flex;
		flex-wrap: wrap;
		gap: 30rpx 50rpx;
		margin-bottom: 50rpx;

		.amount-item {
			width: 190rpx;
			height: 88rpx;
			background: #F5F8FF;
			border-radius: 12rpx;
			text-align: center;
			// margin-bottom: 30rpx;
			font-family: "DINPro-Medium", sans-serif;
			font-weight: 500;
			font-size: 28rpx;
			color: #000000;
			line-height: 88rpx;
			text-align: center;
			font-style: normal;

			&.active {
				background: $themeColor;
				color: #FFFFFF;
			}
		}
	}
</style>