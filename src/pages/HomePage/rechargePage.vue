<template>
	<view>
		<customnavbar :title="$t('pages.Deposit')">

			<view class="recharge-container">
				<view>
					<view class="hint">
						<view class="ball">
							<view class="line"></view>
						</view>
						<view>{{ $t('recharge.Ratio:') }} 1{{ actualCurrency }}={{ usdtRate }}{{ currency }}</view>
					</view>
					<view class="amount-input">
						<input type="digit" v-model="amount" :placeholder="$t('Deposit.placeholder')"
							@input="handleInput"
							placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
						<text class="clear" @tap="clearAmount" v-if="amount">×</text>
					</view>

					<!-- 金额限制提示 -->
					<view class="amount-tip" v-if="minAmount || maxAmount">
						{{ $t('Deposit.min') }}: {{ minAmount }}{{ actualCurrency }} {{ $t('Deposit.max') }}:
						{{ maxAmount }}{{ actualCurrency }}
					</view>

					<!-- 快捷金额选择 -->
					<!-- 	<view class="quick-amount">
						<view class="amount-item" v-for="(item, index) in quickAmounts" :key="index"
							@tap="selectQuickAmount(item)" :class="{'active': amount == item}">
							{{item}}{{actualCurrency}}
						</view>
					</view> -->

					<!-- 支付渠道选择 -->
					<!-- 	<view class="pay-channels-title">{{$t('Deposit.choosechannel')}}</view>
					<view class="pay-channels">
						<view class="channel-item" v-for="(channel, index) in channels" :key="index"
							@tap="selectChannel(channel)" :class="{'active': selectedChannel.id === channel.id}">
							<view class="channel-name">{{channel.channel}}</view>
							<view class="check-icon" v-if="selectedChannel.id === channel.id">✓</view>
						</view>
					</view> -->

					<view class="recharge-btn" @tap="payConfirm">
						{{ $t('Deposit.TopUpNow') }}
					</view>
				</view>

			</view>
		</customnavbar>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	depositListApi,
	depositApi
} from '@/common/api/deposit.js'
export default {
	components: {
		customnavbar: customnavbar
	},
	data() {
		return {
			currency: '',
			actualCurrency: '', // 实际货币单位
			usdtRate: '', // 充值汇率
			password: '',
			isFocus: false,
			amount: '', // 充值金额
			minAmount: '--', // 最小充值金额
			maxAmount: '--', // 最大充值金额
			quickAmounts: [100, 200, 500, 1000, 2000, 5000], // 快捷金额选项
			channels: [{
				id: 1,
				name: 'Channel1',
				icon: '/static/wxpay.png'
			},
			{
				id: 2,
				name: 'Channel2',
				icon: '/static/alipay.png'
			},
			{
				id: 3,
				name: 'Channel3',
				icon: '/static/bankpay.png'
			}
			],
			selectedChannel: {}, // 选中的支付渠道
			rechargeStep: 0,
			paymentMethod: 0,
			withdrawAmount: '',
			selectedAccount: {},
			value: 0,
			accountList: [],
			payTips: '',
			userType: '',
			source: ''
		}
	},
	onLoad(options) {
		this.channel = options.id
		this.userType = uni.getStorageSync('userInfo').userType
		if (this.userType == 'test') {
			this.$customizeBack()
			return
		}
		this.source = options.source
		this.amount = options.amount
		this.currency = uni.getStorageSync('settings').currency
		this.actualCurrency = uni.getStorageSync('settings').actualCurrency
		this.usdtRate = uni.getStorageSync('settings').usdtRate
		this.getDepositList()
	},
	methods: {
		getDepositList() {
			depositListApi().then((res) => {
				this.channels = res.data
				this.selectChannel(this.channels[this.channels.findIndex(item => item.id == this.channel)])
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		// 处理输入
		handleInput(e) {
			const value = e.detail.value;
			// 限制只能输入数字和小数点
			this.amount = value.replace(/[^\d.]/g, '');
		},
		// 清空金额
		clearAmount() {
			this.amount = '';
		},
		// 选择快捷金额
		selectQuickAmount(amount) {
			this.amount = amount;
		},
		// 选择支付渠道
		selectChannel(channel) {
			this.selectedChannel = channel;
			this.minAmount = channel.min || 0;
			this.maxAmount = channel.max || 0;

			// 特殊情况：如果min和max相同或接近，直接返回固定值
			if (channel.max - channel.min <= 100) {
				this.quickAmounts = Array(6).fill(channel.min);
				return;
			}

			// 对数分布计算（6个点）
			const minLog = Math.log10(channel.min);
			const maxLog = Math.log10(channel.max);
			const logStep = (maxLog - minLog) / 5; // 分成5段

			this.quickAmounts = Array.from({
				length: 6
			}, (_, i) => {
				const logValue = minLog + logStep * i;
				let value = Math.pow(10, logValue);

				// 对结果取整（按千/百/十的倍数优化）
				if (value >= 1000) {
					value = Math.round(value / 1000) * 1000; // 按千取整
				} else if (value >= 100) {
					value = Math.round(value / 100) * 100; // 按百取整
				} else {
					value = Math.round(value / 10) * 10; // 按十取整
				}

				// 确保第一个和最后一个值严格等于min/max
				if (i === 0) return channel.min;
				if (i === 5) return channel.max;
				return value;
			});

			// 去重（防止min/max差距过小时生成重复值）
			this.quickAmounts = [...new Set(this.quickAmounts)];

			// 如果去重后不足6个，补足（线性插值）
			while (this.quickAmounts.length < 6) {
				const last = this.quickAmounts[this.quickAmounts.length - 1];
				this.quickAmounts.push(last + 1000); // 默认补1k间隔
			}
		},
		handlePwdInput(e) {
			if (this.password.length >= 6) {
				this.$emit('complete', this.password)
			}
		},
		focusInput() {
			this.isFocus = true
		},
		onBlur() {
			this.isFocus = false
		},
		payConfirm() {
			if (!this.amount) {
				this.$showMessage('warning', this.$t('Deposit.placeholder'));
				return;
			}
			if (this.amount < this.minAmount || this.amount > this.maxAmount && (this.minAmount && this.maxAmount)) {
				this.$showMessage('warning', this.$t('Deposit.amountRangeA') + this.minAmount + this.actualCurrency +
					this.$t('Deposit.amountRangeB') + this.maxAmount + this.actualCurrency + this.$t(
						'Deposit.amountRangeC'));
				return;
			}
			let params = {
				"source": this.source,
				"amount": this.amount,
				"cid": this.selectedChannel.id,
				"pageUrl": 'https://www.cwpc.vip/#/pages/paymentSettlement'
				// "password": this.password
			}
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			depositApi(params).then((res) => {
				const checkoutUrl = JSON.parse(res.msg).checkout;
				uni.navigateTo({
					url: `/pages/HomePage/RechargeWebView?checkoutUrl=${encodeURIComponent(checkoutUrl)}`
				});
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', (() => { try { return JSON.parse(err.msg).message } catch { return err.msg || 'error' } })())
			}).finally(() => {
				uni.hideLoading();
			})
		},
		changePaymentMethod(i) {
			this.paymentMethod = i
		},
		handleAccountChange(e) {
			console.log(e)
		},
		formatCardNumber(cardNumber) {
			// 确保输入是字符串
			const str = String(cardNumber);

			// 移除所有空格
			const clean = str.replace(/\s/g, '');

			// 检查是否是16位卡号
			if (clean.length !== 16) {
				return '请输入16位卡号';
			}

			// 将前12位替换为星号
			const masked = '*'.repeat(12) + clean.slice(12);

			// 每4位添加一个空格
			return masked.replace(/(.{4})/g, '$1 ').trim();
		}
	}
}
</script>

<style lang="scss" scoped>
.recharge-container {
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
			background: linear-gradient(180deg, $themeColor 0%, $themeColor2 100%);

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

	.amount-input {
		position: relative;
		padding: 0 34rpx;
		background: #FFFFFF;
		// box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 42rpx;
		border: 2rpx solid #e8e8e8;

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
			transform: translateY(-54%);
			font-size: 40rpx;
			color: #999;
		}
	}

	.withdraw-amount-input {
		position: relative;
		padding: 0 34rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 42rpx;
		border: 2rpx solid #F6F6F6;

		input {
			height: 84rpx;
			font-size: 28rpx;
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

	.quick-amount {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;

		.amount-item {
			width: 190rpx;
			height: 88rpx;
			background: #F5F8FF;
			border-radius: 12rpx;
			text-align: center;
			margin-bottom: 30rpx;
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

	.pay-channels-title {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 28rpx;
		color: #000000;
		line-height: 36rpx;
		text-align: left;
		font-style: normal;
		margin-top: 34rpx;
	}

	.pay-channels {
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 40rpx;

		.channel-item {
			position: relative;
			width: 190rpx;
			height: 190rpx;
			background: #FFFFFF;
			box-shadow: 0rpx 4rpx 12rpx 0rpx #DCDCDC;
			border-radius: 12rpx;
			border: 2rpx solid #E9E9E9;
			display: flex;
			justify-content: center;
			align-items: center;
			font-family: "DINPro-Medium", sans-serif;
			font-weight: 500;
			font-size: 28rpx;
			color: #000000;
			line-height: 36rpx;
			text-align: center;
			font-style: normal;

			&.active {
				font-family: "DINPro-Medium", sans-serif;
				font-weight: 500;
				font-size: 28rpx;
				color: $themeColor;
				line-height: 36rpx;
				text-align: center;
				font-style: normal;
			}

			.channel-icon {
				width: 60rpx;
				height: 60rpx;
				margin-right: 20rpx;
			}

			.channel-name {
				font-family: "DINPro-Medium", sans-serif;
				font-weight: 500;
				font-size: 28rpx;
				line-height: 36rpx;
				text-align: center;
				font-style: normal;
			}

			.check-icon {
				position: absolute;
				right: 20rpx;
				top: 20rpx;
				color: #007AFF;
				font-size: 32rpx;
				line-height: 30rpx;
			}

		}
	}

	.recharge-btn {
		margin-top: 46rpx;
		height: 96rpx;
		background: $themeColor;
		border-radius: 12rpx;
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
	border-radius: 12rpx;
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
	font-family: "DINPro-Black", sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
}

.prompt_pop_taps {
	font-family: "DINPro-Black", sans-serif;
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
	font-family: "DINPro-Black", sans-serif;
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

.recharge-amount-t {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 64rpx;
	color: #000000;
	line-height: 82rpx;
	text-align: center;
	font-style: normal;
	margin-top: 90rpx;
}

.recharge_Step2_t1 {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 28rpx;
	color: #000000;
	line-height: 36rpx;
	text-align: justify;
	font-style: normal;
	padding: 40rpx 0;
	margin-top: 32rpx;
	border-bottom: 2rpx solid #F4F4F4;
}

.recharge_Step2 {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 40rpx;
	margin-bottom: 86rpx;
}

.recharge_Step2_t2 {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 28rpx;
	color: #000000;
	line-height: 36rpx;
	text-align: justify;
	font-style: normal;


}

.checkbox {
	width: 22rpx;
	height: 22rpx;
	background: #E6E6E6;
	border-radius: 50%;
	border: 10rpx solid #E6E6E6;

	&.active {
		background: $gradualColor2;
		border: 10rpx solid #E6E6E6;
	}
}

.step2-t1 {
	font-family: "DINPro-Black", sans-serif;
	font-weight: 500;
	font-size: 40rpx;
	color: #000000;
	line-height: 52rpx;
	text-align: left;
	font-style: normal;
	margin-top: 46rpx;
	margin-bottom: 22rpx;
}

.step2-t2 {
	font-family: "DINPro-Black", sans-serif;
	font-weight: 400;
	font-size: 20rpx;
	color: #000000;
	line-height: 28rpx;
	text-align: center;
	font-style: normal;
	margin-top: 40rpx;
}

.step2-t3 {
	font-family: "DINPro-Black", sans-serif;
	font-weight: 500;
	font-size: 40rpx;
	color: #000000;
	line-height: 52rpx;
	text-align: left;
	font-style: normal;
	margin-top: 66rpx;
}

.account_box {
	height: 112rpx;
	background: #FFFFFF;
	box-shadow: 0rpx 16rpx 32rpx 4rpx rgba(119, 154, 241, 0.2);
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	padding: 0 34rpx;
	margin-top: 38rpx;
}

.account_card {
	width: 42rpx;
	height: 14rpx;
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
		color: $themeColor;
	}
}

::v-deep .uni-select__input-text {
	font-family: "DINPro-Black", sans-serif;
	font-weight: 500;
	font-size: 30rpx;
	color: #000000;
	font-style: normal;
}

.pay_details {
	background: #F5F8FF;
	border-radius: 10rpx;
	padding: 18rpx;
}

.pay_details_t {
	font-family: "DINPro-Black", sans-serif;
	font-weight: 400;
	font-size: 20rpx;
	color: #000000;
	line-height: 24rpx;
	text-align: left;
	font-style: normal;
}

.pay_details_margin {
	margin-top: 18rpx;
	margin-bottom: 10rpx;
}
</style>