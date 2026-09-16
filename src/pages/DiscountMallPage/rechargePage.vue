<template>
	<view>
		<customnavbar :title="$t('pages.Deposit')" :backgroundStr="'#ff7e3e'" :whiteTitle="true" @mtop='mtop'>
			<view class="Big_bgi" :style="topStyle2"></view>
			<view class="bgc"></view>
			<view class="recharge-container">
				<view>
					<view class="main_box">
						<view class="title">{{ $t('充值金额') }}</view>
						<!-- 支付渠道 -->
						<view class="nationality_box">
							<view type="line" class="nationality_select">
								<dataSelect :arrayConfig="configParams" @change="selectChannel" v-model="channelValue"
									:localdata="channels" :emptyTips="$t('noData')" :placeholder="$t('请选择')"
									:clear="false">
								</dataSelect>
							</view>
						</view>

						<view class="input_box">
							<view class="amount-input">
								<view>{{ actualCurrency }}</view>
								<input type="digit" v-model="amount" :placeholder="$t('Deposit.placeholder')"
									@input="handleInput" :cursor-color="'#FF7647'"
									placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
								<text class="clear" @tap="clearAmount" v-if="amount">×</text>
							</view>
							<image src="/static/DiscountMall/transition.png" class="search_img"></image>
							<view class="amount-input amount-input1">
								<view>{{ $t('商城币') }}</view>
								<input type="digit" disabled v-model="mallCoin" :cursor-color="'#FF7647'"
									placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
							</view>
						</view>

						<!-- 提示 -->
						<view class="hint">
							<view class="gradient-text">{{ $t('recharge.Ratio:') }}
								1{{ actualCurrency }} = {{ shopConfig.nairaToPcoinRate }}{{ $t('商城币') }}</view>
						</view>

						<!-- 金额限制提示 -->
						<view class="amount-tip" v-if="minAmount || maxAmount">
							{{ $t('Deposit.min') }}: {{ minAmount }}{{ actualCurrency }} {{ $t('Deposit.max') }}:
							{{ maxAmount }}{{ actualCurrency }}
						</view>
					</view>

					<!-- 快捷金额选择 -->
					<view class="quick-amount">
						<view class="amount-item" v-for="(item, index) in quickAmounts" :key="index"
							@tap="selectQuickAmount(item)" :class="{ 'active': amount == item }">
							{{ item }}<span class="actualCurrency">{{ actualCurrency }}</span>
						</view>
					</view>

					<view class="recharge-btn" @tap="payConfirm">
						{{ $t('Deposit.TopUpNow') }}
					</view>

					<view class="Top_upBox" v-if="rechargeRule">
						<view class="title gradient-text">{{ $t('充值说明') }}</view>
						<view class="text gradient-text" v-html="rechargeRule">
						</view>
					</view>
				</view>

			</view>
		</customnavbar>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import dataSelect from '@/components/data-select/data-select.vue'
import {
	depositListApi,
	depositApi
} from '@/common/api/deposit.js'
import {
	shopConfigApi
} from "@/common/api/discountMall.js";
import {
	formatRichText
} from "@/utils/utils.js"
export default {
	components: {
		customnavbar,
		dataSelect
	},
	data() {
		return {
			mallCoin: '',
			configParams: {
				labelKey: "channel",
				valueKey: "id",
			},
			currency: '',
			actualCurrency: '', // 实际货币单位
			usdtRate: '', // 充值汇率
			password: '',
			isFocus: false,
			amount: '', // 充值金额
			minAmount: '--', // 最小充值金额
			maxAmount: '--', // 最大充值金额
			quickAmounts: [100, 200, 500, 1000, 2000, 5000], // 快捷金额选项
			channels: [],
			selectedChannel: {}, // 选中的支付渠道
			channelValue: 0,
			rechargeStep: 0,
			paymentMethod: 0,
			withdrawAmount: '',
			selectedAccount: {},
			value: 0,
			accountList: [],
			payTips: '',
			userType: '',
			topStyle2: '',
			rechargeRule: '',
			shopConfig: {}
		}
	},

	onLoad(options) {
		this.channel = options.id
		this.getShopConfig()
		this.userType = uni.getStorageSync('userInfo').userType
		if (this.userType == 'test') {
			this.$customizeBack()
			return
		}
		this.currency = uni.getStorageSync('settings').currency
		this.actualCurrency = uni.getStorageSync('settings').actualCurrency
		this.usdtRate = uni.getStorageSync('settings').usdtRate
		this.getDepositList()
	},
	methods: {
		getShopConfig() {
			shopConfigApi().then((res) => {
				this.shopConfig = res.data
				uni.setStorageSync('shopConfig', res.data)
				if (this.shopConfig.pcoinRuleHtml) {
					this.rechargeRule = formatRichText(this.shopConfig.pcoinRuleHtml)
				}
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle2 = `height:calc(100vh);`
			// #endif
		},
		getDepositList() {
			depositListApi().then((res) => {
				this.channels = res.data
				if (this.channel) {
					this.selectChannel(this.channels[this.channels.findIndex(item => item.id == this.channel)])
				}
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
			this.mallCoin = this.amount ? this.amount * this.shopConfig.nairaToPcoinRate : ''
		},
		// 清空金额
		clearAmount() {
			this.amount = '';
			this.mallCoin = '';
		},
		// 选择快捷金额
		selectQuickAmount(amount) {
			this.amount = amount;
			this.mallCoin = this.amount ? this.amount * this.shopConfig.nairaToPcoinRate : ''
		},
		// 选择支付渠道
		selectChannel(channel) {
			this.amount = ''
			this.mallCoin = '';
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
		payConfirm() {
			if (!this.amount) {
				this.$showMessage('warning', this.$t('Deposit.placeholder'));
				return;
			}
			if (!this.selectedChannel.id) {
				this.$showMessage('warning', this.$t('请选择支付渠道'));
				return;
			}
			if (this.amount < this.minAmount || this.amount > this.maxAmount && (this.minAmount && this.maxAmount)) {
				this.$showMessage('warning', this.$t('Deposit.amountRangeA') + this.minAmount + this.actualCurrency +
					this.$t('Deposit.amountRangeB') + this.maxAmount + this.actualCurrency + this.$t(
						'Deposit.amountRangeC'));
				return;
			}
			let params = {
				"amount": this.amount,
				"cid": this.selectedChannel.id,
				"pageUrl": uni.getStorageSync('settings').qserverName + '/#/pages/paymentSettlement',
				"source": "shop"
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
	}
}
</script>

<style lang="scss" scoped>
.Big_bgi {
	position: fixed;
	left: 0;
	top: 0;
	z-index: -1;
	width: 100%;
	background: #f5f5f5;
}

.bgc {
	position: fixed;
	top: 0;
	width: 100vw;
	height: 378rpx;
	background: linear-gradient(180deg, #FF734C 0%, #FF991C 80%, rgba(255, 179, 28, 0) 100%);
	z-index: -1;
}

.recharge-container {
	padding: 32rpx;

	.hint {
		display: flex;
		align-items: center;
		padding: 16rpx;
		background: #fff4da;
		border-radius: 12rpx;
		font-size: 24rpx;
		font-weight: 500;
		color: #3D3D3D;
		font-style: normal;
		margin-top: 24rpx;
		margin-bottom: 14rpx;
		gap: 24rpx;

		.star_box {
			width: 40rpx;
			height: 40rpx;

			.star {
				width: 40rpx;
				height: 40rpx;
			}

		}

		.ball {
			position: relative;
			min-width: 26rpx;
			min-height: 26rpx;
			border-radius: 50%;
			margin-right: 20rpx;
			background: linear-gradient(45deg, $gradualColor1 0%, $gradualColor2 100%);

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

	.main_box {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;

		.title {
			font-family: Abril Fatface;
			font-size: 32rpx;
			color: #3D3D3D;
			margin-bottom: 16rpx;
		}
	}

	// 选择器
	.nationality_box {
		box-sizing: border-box;
		background: #f5f5f5;
		// box-shadow: 0rpx 16rpx 32rpx 4rpx rgba(119, 154, 241, 0.2);
		border: 2rpx solid #f7f7f7;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		padding: 24rpx;
		margin-bottom: 24rpx;
	}

	.nationality_select {
		flex: 1;
	}

	::v-deep .uni-select {
		border: 0rpx solid;
		padding: 0;

		text::before {
			font-weight: 500;
			font-size: 30rpx;
			color: #000;
		}
	}

	::v-deep .uni-select__input-text {
		font-weight: 500;
		font-size: 28rpx;
		color: #3D3D3D;
		font-style: normal;
	}

	.input_box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14rpx;

		.search_img {
			width: 42rpx;
			height: 42rpx;
			min-width: 42rpx;
			min-height: 42rpx;
		}
	}

	.amount-input {
		position: relative;
		background: #f6f4ef;
		padding: 16rpx;
		border-radius: 24rpx;

		input {
			height: 84rpx;
			font-size: 48rpx;
			font-weight: 500;
			color: #3D3D3D;
			line-height: 36rpx;
			text-align: left;
			font-style: normal;
			padding-right: 62rpx;
			border-bottom: 4rpx solid #f5f5f5;
		}

		&.amount-input1 input {
			padding-right: 0;
		}

		.clear {
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-10%);
			font-size: 40rpx;
			color: #999;
		}
	}

	.amount-tip {
		font-weight: 400;
		line-height: 28rpx;
		text-align: center;
		font-style: normal;
		color: #757575;
		font-size: 20rpx;
	}

	.quick-amount {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;

		.amount-item {
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 218rpx;
			height: 112rpx;
			background: #fff;
			border-radius: 12rpx;
			text-align: center;
			margin-bottom: 16rpx;
			color: #000000;
			font-size: 36rpx;
			font-weight: 500;
			// line-height: 112rpx;
			text-align: center;
			font-style: normal;

			.actualCurrency {
				font-size: 24rpx;
				color: #3D3D3D;
				font-weight: 400;
				transform: translateY(6rpx);
				margin-left: 4rpx;
			}

			&.active {
				// background: $themeColor;
				border: 4rpx solid #FF7647;
				color: #FF7647;

				.actualCurrency {
					color: #FF7647;
				}
			}
		}
	}

	.pay-channels-title {
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
			font-weight: 500;
			font-size: 28rpx;
			color: #000000;
			line-height: 36rpx;
			text-align: center;
			font-style: normal;

			&.active {
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
		background: #BB0000;
		border-radius: 12rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
		font-size: 32rpx;
		font-weight: 600;
	}

	.Top_upBox {
		display: flex;
		flex-direction: column;
		align-items: start;
		// font-size: 24rpx;
		// font-weight: 500;
		// color: #3D3D3D;
		margin-top: 48rpx;

		.title {
			font-family: Abril Fatface;
			font-size: 32rpx;
			color: #000000;
			margin-bottom: 16rpx;
		}

		.text {
			text-align: left;
		}
	}
}

.pay_pop_page {
	background: #FFFFFF;
	border-radius: 26rpx;
	width: 574rpx;
	padding: 40rpx;
}

.pay_pop_top {
	font-weight: 500;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
}

.pay_pop_no {
	font-weight: bold;
	font-size: 64rpx;
	color: #000000;
	line-height: 82rpx;
	text-align: center;
	font-style: normal;
	margin-top: 32rpx;
}

.pay_pop_content {
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
	background: linear-gradient(45deg, $gradualColor1 0%, $gradualColor2 100%);
	border-radius: 48rpx;
	margin-top: 34rpx;
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
	font-weight: 500;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
}

.prompt_pop_taps {
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
	font-weight: 500;
	font-size: 32rpx;
	color: #FFFFFF;
	line-height: 72rpx;
	text-align: center;
	font-style: normal;
}

.recharge-amount-t {
	font-weight: bold;
	font-size: 64rpx;
	color: #000000;
	line-height: 82rpx;
	text-align: center;
	font-style: normal;
	margin-top: 90rpx;
}

.recharge_Step2_t1 {
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
	font-weight: 400;
	font-size: 20rpx;
	color: #000000;
	line-height: 28rpx;
	text-align: center;
	font-style: normal;
	margin-top: 40rpx;
}

.step2-t3 {
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
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	padding: 0 34rpx;
	margin-top: 38rpx;
}

::v-deep .uni-select {
	border: 0rpx solid;
	background-color: #f5f5f5;

	text::before {
		font-weight: 500;
		font-size: 30rpx;
		color: #4C69FF;
	}
}

::v-deep .uni-select__input-text {
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