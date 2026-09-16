<template>
	<view>
		<customnavbar :title="$t('product.ProductDetails')" backgroundStr="#fff">
			<view class="design-details-page">
				<view class="design-hero">
					<view class="design-hero-title">{{ productDetails.productName || '--' }}</view>
					<view class="design-rate-row">
						<text class="design-rate">{{ productDetails.dailyRateOfReturnStr || '--' }}</text>
						<text class="design-rate-label">{{ $t('product.Annualized') }}</text>
					</view>
					<view class="design-progress">
						<view class="design-progress-fill" :style="{ width: remainingProgress + '%' }"></view>
					</view>
					<view class="design-remaining">{{ $t('product.RemainingColon') }} <text>{{ productDetails.remaining || '--' }}</text></view>
				</view>

				<view class="design-card">
					<view class="design-card-title">{{ $t('product.Information') }}</view>
					<view class="design-info-row"><text>{{ $t('product.InvestmentHorizon') }}</text><b>{{ productDetails.totalRevenue ||
						'--' }}</b></view>
					<view class="design-info-row"><text>{{ $t('product.MinimumInvestment') }}</text><b>{{ minAmount }} {{ currency }}</b>
					</view>
					<view class="design-info-row"><text>{{ $t('product.HighestInvestment') }}</text><b>{{ maxAmount }} {{ currency }}</b>
					</view>
					<view class="design-info-row"><text>{{ $t('product.RiskLevel') }}</text><b>{{ $t('product.ReturnUponExpiration') }}</b></view>
				</view>

				<view class="design-card">
					<view class="design-card-title">{{ $t('product.ProfitCalculation') }}</view>
					<view class="design-info-row"><text>{{ $t('product.PrincipalInvestment') }}</text><b>{{ displayPrincipal }} {{ currency
					}}</b></view>
					<view class="design-info-row"><text>{{ $t('product.EstimatedReturn') }}</text><b>{{ displayProfit }} {{ currency }}</b>
					</view>
					<view class="design-info-row"><text>{{ $t('product.DueAndCredited') }}</text><b>{{ displayTotal }} {{
						currency }}</b></view>
				</view>

				<view class="design-card design-rules-card">
					<view class="design-card-title">{{ $t('product.Rules') }}</view>
					<rich-text v-if="productDetails.description" :nodes="productDetails.description"></rich-text>
					<text v-else>{{ productDetails.introduction || $t('product.ReturnUponExpiration') }}</text>
				</view>

				<view class="design-bottom-space"></view>
				<view class="design-buy-button" @click="buyNow">{{ $t('product.BuyNow') }}</view>
			</view>
			<view class="product_container legacy-details">
				<view class="product_detaile_box">
					<view class="details_item_img_box">
						<image :src="productDetails.image" class="product_details_item_img">
						</image>
					</view>

					<view class="details_item_box bg_gray">
						<view class="details_item_title">
							{{ $t('product.StartingAmount') }}
						</view>
						<view class="details_item_desc">
							{{ productDetails.startingAmount }} {{ currency }}
						</view>
					</view>

					<view class="details_item_box">
						<view class="details_item_title">
							{{ $t('product.DailyRateOfReturn') }}
						</view>
						<view class="details_item_desc">
							{{ productDetails.dailyRateOfReturnStr }}
						</view>
					</view>
					<view class="details_item_box bg_gray">
						<view class="details_item_title">
							{{ $t('product.TotalRevenue') }}
						</view>
						<view class="details_item_desc">
							{{ productDetails.totalRevenue }}
						</view>
					</view>
					<view class="details_item_box">
						<view class="details_item_title">
							{{ $t('product.EndDate') }}
						</view>
						<view class="details_item_desc">
							{{ productDetails.endDate }}
						</view>
					</view>
					<view class="details_item_box bg_gray">
						<view class="details_item_title">
							{{ $t('product.Remaining') }}
						</view>
						<view class="details_item_desc">
							{{ productDetails.remaining }}
						</view>
					</view>
					<view class="details_item_box border_bottom">
						<view class="details_item_title">
							<view class="details_item_title">
								{{ $t('product.PurchaseConditions') }}
							</view>
							<view class="details_item_title" style="margin-top: 30rpx;">
								{{ $t('product.Level') }}
							</view>
						</view>
						<view class="details_item_desc">
							{{ productDetails.purchaseConditions.level }}
						</view>
					</view>
					<view class="details_item_box bg_gray" style="border-bottom: none;">
						<view class="details_item_title">
							{{ $t('product.CreditValue') }}
						</view>
						<view class="details_item_desc">
							{{ productDetails.purchaseConditions.creditValue }}
						</view>
					</view>
					<view class="details_item_box" style="border-bottom: none;" v-if="productDetails.buytimes">
						<view class="details_item_title">
							{{ $t('product.buytimes') }}
						</view>
						<view class="details_item_desc">
							{{ productDetails.buytimes }}
						</view>
					</view>
				</view>
				<view class="details_box" v-if="productDetails.description">
					<rich-text :nodes="productDetails.description"></rich-text>
				</view>
				<view class="flex-center">
					<view class="buynow_btn" @click="buyNow">{{ $t('product.BuyNow') }}</view>
				</view>

			</view>

		</customnavbar>
		<uni-popup ref="popup" type="bottom" border-radius="40rpx 40rpx 0 0" style="z-index: 10002;">
			<view class="financeDetails_pop_page">
				<view class="financeDetails_pop_top">{{ $t('product.Buy') }}</view>
				<view class="financeDetails_pop_content">
					<view class="pop_content_item pop_content_details_item_bottom_border">
						<view class="pop_content_details_item_title">{{ $t('product.Productname') }}</view>
						<view class="pop_content_details_item_desc">
							{{ productBuyDetails.productName }}
						</view>
					</view>
					<view class="pop_content_item">
						<view class="pop_content_details_item_title">{{ $t('product.StartingAmount') }}</view>
						<view class="pop_content_details_item_desc">
							{{ productBuyDetails.startingAmount }} {{ currency }}
						</view>
					</view>

					<view class="pop_content_item">
						<uni-number-box v-model="buyPurchase" background="#edf4ff" color="#000000"></uni-number-box>
					</view>
					<view class="max_tips pop_content_details_item_bottom_border">
						{{ $t('product.MaximumPurchase') }} {{ productBuyDetails.max }}
					</view>
					<view class="pop_content_item pop_content_details_item_bottom_border">
						<view class="pop_content_details_item_title">{{ $t('product.AccountBalance') }}
						</view>
						<view class="pop_content_details_item_desc" style="display: flex;">
							<view>{{ productBuyDetails.amountBalance }} {{ currency }}</view>
							<view class="pop_content_details_item_all" @click="inputAll">{{ $t('product.All') }}</view>
						</view>

					</view>
					<view class="pop_content_item pop_content_details_item_bottom_border">
						<view class="pop_content_details_item_title">{{ $t('product.ProfitFormula') }}</view>
						<view class="pop_content_details_item_desc">
							{{ '≈' + approximateEarnings() }}
						</view>
					</view>
					<view class="pop_content_item" style="border-bottom: none;">
						<view class="pop_content_details_item_title">{{ $t('product.Total') }}</view>
						<view class="pop_content_details_item_total">
							{{ +buyPurchase + +approximateEarnings() }} {{ currency }}
						</view>
					</view>
				</view>
				<view class="financeDetails_pop_bottom">
					<view class="financeDetails_pop_bottom_btn" v-if="!isPayLoading" @click="confirm">
						{{ $t('Deposit.pay') }}
					</view>
					<t-loading :loading="isPayLoading" :text="$t('loading.btn') + '...'" theme="dots" size="36px" />
				</view>
			</view>
		</uni-popup>
		<!-- 支付框 -->
		<uni-popup ref="paypopup" type="center">
			<view class="pay_pop_page">
				<view class="pay_pop_top">{{ $t('Deposit.pay') }}</view>
				<view class="pay_pop_no">{{ buyPurchase.toFixed(4) }}</view>
				<view class="pay_pop_content">{{ $t('pay.password') }}</view>
				<view class="password-box" @click="focusInput">
					<view class="input-box" v-for="(item, index) in 6" :key="index">
						<text v-if="password.length > index">●</text>
					</view>
				</view>
				<!-- 隐藏的输入框，用于调起键盘 -->
				<input type="number" :maxlength="6" v-model="password" class="hidden-input" @input="handleInput"
					:focus="isFocus" @blur="onBlur" />
				<button class="pay_confirm_btn" @click="payConfirm">{{ $t('Deposit.pay') }}</button>
			</view>
		</uni-popup>
		<uni-popup ref="payerrorpopup" type="center">
			<view class="pay_pop_page">
				<view class="pay_pop_top">{{ $t('home.Prompt') }}</view>
				<view style="display: flex;justify-content: center;">
					<view class="payerror_pop_taps">{{ $t('pay.promptInfo') }}</view>
				</view>
				<view class="payerror_pop_bottom">
					<button class="payerror_cancel_btn" @click="payerror_cancel">{{ $t('pay.no') }}</button>
					<button class="payerror_confirm_btn" @click="payerror_confirm">{{ $t('pay.yes') }}</button>
				</view>

			</view>
		</uni-popup>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	productDetailsApi,
	productBuyApi,
	productPayApi
} from '@/common/api/product.js'

import {
	formatRichText
} from "@/utils/utils.js"
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			url: 'http://13.245.95.135:8888',
			// url: 'http://192.168.2.35:8080',
			password: '',
			isFocus: false,
			productId: '',
			productDetails: {
				purchaseConditions: {
					level: '',
					creditValue: ''
				},

			},
			productBuyDetails: {},
			paymentAmount: 0,
			buyPurchase: 0,
			currency: '',
			isPayLoading: false
		}
	},
	onLoad(options) {
		this.productId = options.productId
		this.currency = uni.getStorageSync('settings').currency
	},
	onShow() {
		this.getProductDetails()
		this.getProductBuyDetails()
	},
	watch: {
		buyPurchase(newVal) {
			// 可以在这里做一些额外操作
			// console.log("buyPurchase 更新:", newVal);
			// 如果需要，可以手动更新 UI 或调用其他方法
		},
	},
	computed: {
		amountRange() {
			const value = this.productDetails.startingAmount || ''
			return String(value).split('~').map(item => item.trim()).filter(Boolean)
		},
		minAmount() {
			return this.amountRange[0] || '--'
		},
		maxAmount() {
			return this.amountRange[1] || this.amountRange[0] || '--'
		},
		remainingProgress() {
			const value = Number.parseFloat(String(this.productDetails.remaining || '').replace('%', ''))
			if (Number.isNaN(value)) return 0
			return Math.min(100, Math.max(0, value))
		},
		displayPrincipal() {
			const amount = Number(this.productBuyDetails.min || this.minAmount)
			return Number.isFinite(amount) ? amount.toFixed(2) : '1,000.00'
		},
		displayProfit() {
			const amount = Number(this.displayPrincipal)
			const rate = this.effectiveTotalRate / 100
			return Number.isFinite(amount) ? (amount * rate).toFixed(4) : '0.0000'
		},
		displayTotal() {
			return (Number(this.displayPrincipal) + Number(this.displayProfit)).toFixed(4)
		},
		effectiveTotalRate() {
			const buyRate = Number(this.productBuyDetails.totalRateOfReturn)
			if (Number.isFinite(buyRate)) return buyRate

			const detailRate = Number(this.productDetails.totalRateOfReturn)
			if (Number.isFinite(detailRate)) return detailRate

			// 详情接口没有总收益率时，用日收益率和期限估算预览值。
			const dailyRate = Number(this.productDetails.dailyRateOfReturn)
			const days = Number.parseInt(String(this.productDetails.totalRevenue || '').replace(/[^\d]/g, ''), 10)
			if (Number.isFinite(dailyRate) && Number.isFinite(days) && days > 0) {
				return dailyRate * days
			}
			return 0
		}
	},
	methods: {
		// 大概收益
		approximateEarnings() {
			const currentPrice = Number(this.buyPurchase) || 0
			const totalEarnings = currentPrice * this.effectiveTotalRate / 100
			return totalEarnings.toFixed(4)
		},
		// 时间差计算
		timeDifference(endDate) {
			// 将 endDate 转换为 Date 对象
			const endDateObj = new Date(endDate);
			// 获取当前日期
			const currentDate = new Date();
			// 计算时间差（以毫秒为单位）
			const timeDifference = endDateObj - currentDate;
			// 将时间差转换为天数
			return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
		},
		getProductDetails() {
			productDetailsApi(this.productId).then((res) => {
				this.productDetails = res.data
				if (this.productDetails.description) this.productDetails.description = formatRichText(this
					.productDetails.description)
			}).catch((err) => {
				this.$showMessage('warning', err.msg);
			})
		},
		getProductBuyDetails() {
			productBuyApi(this.productId).then((res) => {
				this.productBuyDetails = res.data || {}
			}).catch(() => {})
		},
		buyNow() {
			productBuyApi(this.productId).then((res) => {
				this.productBuyDetails = res.data
				this.$refs.popup.open()
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		confirm() {
			// this.$refs.paypopup.open()
			// this.isFocus = true
			if (this.buyPurchase == 0) {
				this.$showMessage('warning', this.$t('product.PleaseEnterPurchaseAmount'));
				return
			} else if (this.buyPurchase > this.productBuyDetails.max) {
				this.$showMessage('warning', this.$t('product.MaximumPurchase') + ':' + this.productBuyDetails.max);
				return
			} else if (this.buyPurchase < this.productBuyDetails.min) {
				this.$showMessage('warning', this.$t('product.MinimumPurchase') + ':' + this.productBuyDetails.min);
				return
			} else if (this.buyPurchase > this.productBuyDetails.amountBalance) {
				this.$showMessage('warning', this.$t('product.PurchaseAmountCannotBeLessThanStartingAmount'));
				return
			} else if (this.productBuyDetails.buytimes && this.productBuyDetails.buytimes <= 0) {
				this.$showMessage('warning', this.$t('product.Itisnolongeravailable'));
				return
			} else {
				this.isPayLoading = true
				this.payConfirm()
			}
		},
		handleInput(e) {
			if (this.password.length >= 6) {
				// 密码输入完成，这里处理密码提交逻辑
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
			let params = {
				"paymentAmount": this.buyPurchase.toFixed(4),
				"productId": this.productId
			}
			productPayApi(params).then((res) => {
				//支付结果
				this.$showMessage('success', this.$t('product.purchase'));


				setTimeout(() => {
					uni.redirectTo({
						url: '/pages/MinePage/financePage'
					})
				}, 30)
			}).catch((err) => {
				this.$showMessage('warning', err.msg);
				// uni.showToast({
				// 	title: err.msg,
				// 	icon: 'none'
				// })
			}).finally(() => {
				this.isPayLoading = false
			})

			//支付失败
			// this.$refs.payerrorpopup.open()
			//支付成功
		},
		payerror_cancel() {
			this.$refs.payerrorpopup.close()
		},
		payerror_confirm() {
			this.$refs.payerrorpopup.close()
			this.$refs.paypopup.open()
			this.password = []
		},
		inputAll() {
			this.buyPurchase = this.productBuyDetails.amountBalance > this.productBuyDetails.max ? this
				.productBuyDetails.max : this.productBuyDetails.amountBalance
		}
	}
}
</script>

<style lang="scss" scoped>
.legacy-details {
	display: none;
}

.design-details-page {
	min-height: 100vh;
	padding: 42rpx 32rpx 0;
	background: #f1f4ff;
	color: #080808;
}

.design-hero {
	padding: 24rpx;
	border-radius: 24rpx;
	background: linear-gradient(110deg, #102d63 0%, #0759dc 100%);
	color: #fff;
}

.design-hero-title {
	font-family: DingTalk JinBuTi;
	font-size: 32rpx;
	line-height: 44rpx;
}

.design-rate-row {
	display: flex;
	align-items: baseline;
	margin-top: 32rpx;
}

.design-rate {
	font-family: DingTalk JinBuTi;
	font-size: 48rpx;
	color: #07E192;
}

.design-rate-label {
	font-family: MiSans;
	font-size: 24rpx;
	padding-left: 14rpx;
}

.design-progress {
	height: 14rpx;
	margin-top: 24rpx;
	overflow: hidden;
	border-radius: 10rpx;
	background: rgba(72, 169, 255, .28);
}

.design-progress-fill {
	height: 100%;
	border-radius: inherit;
	background: #42d2f0;
}

.design-remaining {
	margin-top: 18rpx;
	font-family: MiSans;
	font-size: 20rpx;
	line-height: 34rpx;
}

.design-remaining text {
	margin-left: 14rpx;
}

.design-card {
	margin-top: 32rpx;
	padding: 24rpx;
	border-radius: 24rpx;
	background: #fff;
}

.design-card-title {
	margin-bottom: 24rpx;
	font-family: MiSans;
	font-size: 32rpx;
	font-weight: 600;
	line-height: 48rpx;
}

.design-info-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-top: 22rpx;
	font-family: MiSans;
	font-size: 24rpx;
	line-height: 38rpx;
}

.design-info-row text {
	flex: 1;
}

.design-info-row b {
	max-width: 58%;
	font-family: MiSans;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 38rpx;
	text-align: right;
}

.design-rules-card {
	line-height: 34rpx;
}

.design-rules-card rich-text,
.design-rules-card>text {
	font-size: 26rpx;
	line-height: 34rpx;
}

.design-bottom-space {
	height: 150rpx;
}

.design-buy-button {
	position: fixed;
	right: 32rpx;
	bottom: 34rpx;
	left: 32rpx;
	z-index: 10;
	height: 90rpx;
	border-radius: 24rpx;
	background: linear-gradient(97deg, #4183ff 0%, #0052d9 100%);
	box-shadow: 0px 18rpx 44rpx 0px rgba(73, 102, 255, 0.25);
	color: #fff;
	font-size: 34rpx;
	font-weight: 700;
	line-height: 90rpx;
	text-align: center;
}

.product_container {
	padding: 40rpx;
	padding: 40rpx;
}

.details_item_img_box {
	display: flex;
	justify-content: center;
	margin-top: 44rpx;
	margin-bottom: 42rpx;
}

.product_details_item_img {
	width: 200rpx;
	height: 200rpx;
	border-radius: 10rpx;
	overflow: hidden;
}

.title {
	display: flex;
	justify-content: center;
	margin-top: 40rpx;
	font-size: 36rpx;
	font-weight: 600;
}


.details_item_box {
	padding: 32rpx 40rpx 28rpx 40rpx;
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
}

.details_item_title {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 26rpx;
	color: #1C2D57;
	line-height: 34rpx;
	text-align: left;
	font-style: normal;
}

.details_item_desc {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 26rpx;
	color: #000000;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
	white-space: normal;
	word-break: break-all;
	text-align: right;
	flex-shrink: 1;
}

.details_t {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 28rpx;
	color: #1C2D57;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
	margin-bottom: 30rpx;

}

.content_t {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 26rpx;
	color: #1C2D57;
	line-height: 34rpx;
	text-align: left;
	font-style: normal;
}

.buynow_btn {
	width: 650rpx;
	margin: 40rpx 0;
	text-align: center;
	height: 96rpx;
	background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
	border-radius: 24rpx;
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 36rpx;
	color: #FFFFFF;
	line-height: 96rpx;
	font-style: normal;
	text-transform: none;
}

.financeDetails_pop_page {
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
}

.financeDetails_pop_top {
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
	padding-top: 40rpx;
}

.financeDetails_pop_content {
	padding: 0 40rpx;
}

.pop_content_item {
	display: flex;
	justify-content: space-between;
	padding: 30rpx 0;
}

.pop_content_details_item_title {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 26rpx;
	color: #1C2D57;
	line-height: 34rpx;
	text-align: left;
	font-style: normal;
}

.pop_content_details_item_desc {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 26rpx;
	color: #000000;
	line-height: 34rpx;
	text-align: right;
	font-style: normal;
}

.pop_content_details_item_bottom_border {
	border-bottom: 2rpx solid #F4F4F4;
}

.max_tips {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 22rpx;
	color: #000000;
	line-height: 28rpx;
	text-align: center;
	font-style: normal;
	padding-bottom: 30rpx;
}

.pop_content_details_item_all {
	width: 74rpx;
	height: 36rpx;
	border-radius: 18rpx;
	border: 2rpx solid $themeColor;
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 22rpx;
	color: $themeColor;
	line-height: 36rpx;
	text-align: center;
	font-style: normal;
	margin-left: 16rpx;
}

.pop_content_details_item_total {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: $themeColor;
	line-height: 42rpx;
	text-align: justify;
	font-style: normal;
}

.financeDetails_pop_bottom {
	display: flex;
	justify-content: center;
	padding: 44rpx 40rpx 46rpx 40rpx;
}

.financeDetails_pop_bottom_btn {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(98deg, #4183ff 0%, #0052d9 100%);
	box-shadow: 0px 18rpx 44rpx 0px rgba(73, 102, 255, 0.25);
	border-radius: 24rpx;
	font-size: 34rpx;
	font-weight: bold;
	color: #FFFFFF;
	line-height: 90rpx;
	text-align: center;
	font-style: normal;
	text-transform: none;
}

.pay_pop_page {
	background-color: #fff;
	border-radius: 32rpx;
	width: 574rpx;
	padding: 28rpx 32rpx 56rpx 32rpx;
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
	margin-top: 42rpx;
}

.pay_pop_content {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 24rpx;
	color: #000000;
	line-height: 30rpx;
	text-align: justify;
	font-style: normal;
	margin-top: 42rpx;
}

.password-box {
	display: flex;
	justify-content: space-between;
	padding-top: 20rpx;

	.input-box {
		width: 72rpx;
		height: 72rpx;
		background: #ECECEC;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
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
	margin-top: 44rpx;
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 36rpx;
	color: #FFFFFF;
	line-height: 96rpx;
	text-align: center;
	font-style: normal;
	text-transform: none;
}

.payerror_pop_taps {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 28rpx;
	color: #1C2D57;
	line-height: 36rpx;
	text-align: center;
	font-style: normal;
	margin-top: 56rpx;
	margin-bottom: 48rpx;
	width: 80%;
}

.payerror_pop_bottom {
	display: flex;
}

.payerror_cancel_btn {
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

.payerror_confirm_btn {
	width: 212rpx;
	height: 72rpx;
	background: $themeColor;
	box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
	border-radius: 16rpx;
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #FFFFFF;
	line-height: 72rpx;
	text-align: center;
	font-style: normal;
}

.bg_gray {
	background: #F5F8FF;
}

.border_bottom {
	border-bottom: 2rpx solid #F4F4F4;
}

.product_detaile_box {
	background: #FFFFFF;
	box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 18rpx;
	border: 2rpx solid #F8F8F8;
}

.details_box {
	background: #FFFFFF;
	box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 18rpx;
	border: 2rpx solid #F8F8F8;
	margin-top: 40rpx;
	padding: 54rpx 40rpx 54rpx 42rpx;
}

.mt30 {
	margin-top: 30rpx;
}

.flex-center {
	display: flex;
	justify-content: center;
}

::v-deep .uni-numbox {
	height: 84rpx;
	background: #edf4ff;
	border-radius: 12rpx;
	color: #000;
	display: flex;
	align-items: center;
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 36rpx;
	width: 100%;
}

::v-deep .uni-numbox__value {
	width: 100% !important;
}

::v-deep .uni-numbox-btns {
	padding: 0 24rpx
}
::v-deep .uni-numbox--text {
margin-bottom: 4rpx;
}
</style>
