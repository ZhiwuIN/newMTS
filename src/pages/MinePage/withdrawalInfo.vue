<template>
	<view class="withdrawal-page">
		<customnavbar :title="$t('withdrawalDetail.title')" backgroundStr="rgba(249, 253, 254, 0.96)">
			<view class="withdrawal-info">
				<view class="status-banner">
					<view class="banner-content">
						<view class="status-badge" :class="statusConfig.tone">
							<view v-if="statusConfig.tone === 'pending'" class="clock-icon badge-icon"><view class="clock-face" /></view>
							<text v-else class="status-symbol">{{ statusConfig.tone === 'success' ? '✓' : '!' }}</text>
							<text>{{ statusText }}</text>
						</view>
						<text class="banner-description">{{ $t(statusConfig.summary) }}</text>
					</view>
				</view>

				<view class="info-card">
					<view class="card-heading">
						<image class="heading-icon" src="/static/withdrawalInfo/form.png" mode="aspectFit" />
						<text>{{ $t('withdrawalDetail.generalInfo') }}</text>
					</view>
					<view v-for="field in generalFields" :key="field.key" class="info-row">
						<image class="row-icon" :src="field.icon" mode="aspectFit" />
						<view class="row-content">
							<text class="field-label">{{ $t(field.label) }}</text>
							<text class="field-value">{{ field.value }}</text>
						</view>
					</view>
				</view>

				<view class="info-card">
					<view class="card-heading">
						<image class="heading-icon" src="/static/withdrawalInfo/bank.png" mode="aspectFit" />
						<text>{{ $t('withdrawalDetail.withdrawalInfo') }}</text>
					</view>
					<view v-for="field in withdrawalFields" :key="field.key" class="info-row">
						<image class="row-icon" :src="field.icon" mode="aspectFit" />
						<view class="row-content">
							<text class="field-label">{{ $t(field.label) }}</text>
							<text class="field-value">{{ field.value }}</text>
						</view>
					</view>
					<text v-if="unparsedRemark" class="remark-text">{{ unparsedRemark }}</text>
				</view>

				<view class="info-card result-card">
					<view class="card-heading">
						<image class="heading-icon" src="/static/withdrawalInfo/form.png" mode="aspectFit" />
						<text>{{ $t('withdrawalDetail.result') }}</text>
					</view>
					<view class="result-content" :class="statusConfig.tone">
						<view v-if="statusConfig.tone === 'pending'" class="clock-icon result-icon"><view class="clock-face" /></view>
						<view v-else class="result-symbol status-symbol">{{ statusConfig.tone === 'success' ? '✓' : '!' }}</view>
						<view class="row-content">
							<text class="field-label">{{ $t('withdrawalDetail.status') }}</text>
							<text class="result-value">{{ statusText }}</text>
						</view>
					</view>
				</view>

				<view class="info-card instructions-card">
					<view class="card-heading">
						<image class="heading-icon" src="/static/withdrawalInfo/plaint.png" mode="aspectFit" />
						<text>{{ $t('withdrawalDetail.instructions') }}</text>
					</view>
					<view class="instructions-content">
						<image class="instructions-icon" src="/static/withdrawalInfo/plaint.png" mode="aspectFit" />
						<text class="instructions-text">{{ processingExplanation }}</text>
					</view>
				</view>
			</view>
		</customnavbar>
	</view>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import { finanWithdrawalApi } from '@/common/api/deposit.js'

	const assetPath = '/static/withdrawalInfo/'
	const withdrawalFieldConfig = [
		{ key: 'accountName', icon: 'user.png', aliases: ['Nom dutilisateur de retrait', 'Withdrawal username', 'Withdrawal account name', '取款用户名', '提现用户名', 'Nombre de usuario de retiro', 'Имя получателя', 'Tên người rút tiền'] },
		{ key: 'accountNumber', icon: 'bank_card.png', aliases: ['Compte de retrait', 'Withdrawal account', '取款账户', '提现账户', 'Cuenta de retiro', 'Счёт для вывода', 'Tài khoản rút tiền'] },
		{ key: 'bankName', icon: 'bank.png', aliases: ['Nom de la banque', 'Bank name', '银行名称', 'Nombre del banco', 'Название банка', 'Tên ngân hàng'] },
		{ key: 'bankCode', icon: 'QR_code.png', aliases: ['Code bancaire', 'Bank code', '银行代码', 'Código bancario', 'Код банка', 'Mã ngân hàng'] }
	]
	const statusConfigs = {
		success: { tone: 'success', label: 'success', summary: 'successSummary', instructions: 'successInstructions' },
		failed: { tone: 'failed', label: 'failed', summary: 'failedSummary', instructions: 'failedInstructions' },
		pendingReview: { tone: 'pending', label: 'pendingReview', summary: 'pendingSummary', instructions: 'pendingInstructions' },
		reviewRejected: { tone: 'failed', label: 'reviewRejected', summary: 'rejectedSummary', instructions: 'failedInstructions' },
		pendingPayment: { tone: 'pending', label: 'pendingPayment', summary: 'paymentSummary', instructions: 'paymentInstructions' },
		unknown: { tone: 'neutral', label: 'unknown', summary: 'unknownSummary', instructions: 'unknownSummary' }
	}

	function displayValue(value) {
		const text = value == null ? '' : String(value).trim()
		return !text || /^(null|undefined)$/i.test(text) ? '—' : text
	}

	function normalizeLabel(label) {
		return label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\s'’_-]/g, '')
	}

	export default {
		components: { customnavbar },
		data() {
			return {
				currency: '',
				id: '',
				info: {},
				usdtRateOut: null,
				actualCurrency: ''
			}
		},
		computed: {
			statusConfig() {
				// Keep the detail API's numeric status mapping, including both payout states.
				const status = { 1: 'success', 2: 'failed', 3: 'pendingReview', 4: 'reviewRejected', 5: 'pendingPayment', 6: 'pendingPayment' }[this.info.status]
				const config = statusConfigs[status] || statusConfigs.unknown
				return {
					...config,
					label: 'withdrawalDetail.' + config.label,
					summary: 'withdrawalDetail.' + config.summary,
					instructions: 'withdrawalDetail.' + config.instructions
				}
			},
			statusText() {
				return this.$t(this.statusConfig.label)
			},
			generalFields() {
				const price = this.numericValue(this.info.price)
				const fee = this.numericValue(this.info.fee)
				const rate = this.numericValue(this.usdtRateOut)
				// Preserve the existing gross withdrawal amount and service-fee conversion.
				const amount = price == null ? null : price + (fee || 0)
				const convertedFee = fee === 0 ? 0 : (fee != null && rate > 0 ? fee * rate : null)
				return [
					{ key: 'orderNumber', label: 'withdrawalDetail.orderNumber', icon: assetPath + 'service_charge.png', value: displayValue(this.info.orderNumber) },
					{ key: 'amount', label: 'withdrawalDetail.amount', icon: assetPath + 'gold.png', value: this.formatMoney(amount, this.currency) },
					{ key: 'fee', label: 'withdrawalDetail.fee', icon: assetPath + 'percentage.png', value: this.formatMoney(convertedFee, this.actualCurrency || this.currency) }
				]
			},
			parsedRemark() {
				const values = {}
				const remaining = []
				// Historical remarks can use a different language from the current UI.
				String(this.info.remark || '').split(/\r?\n/).forEach(line => {
					if (!line.trim()) return
					const separator = line.search(/[:：]/)
					const label = normalizeLabel(separator < 0 ? '' : line.slice(0, separator))
					const field = withdrawalFieldConfig.find(item =>
						[...item.aliases, this.$t('withdrawalDetail.' + item.key)].some(alias => normalizeLabel(alias) === label)
					)
					if (field) {
						values[field.key] = displayValue(line.slice(separator + 1))
					} else {
						remaining.push(line.trim())
					}
				})
				return { values, remaining }
			},
			withdrawalFields() {
				return withdrawalFieldConfig.map(field => ({
					key: field.key,
					label: 'withdrawalDetail.' + field.key,
					icon: assetPath + field.icon,
					value: this.parsedRemark.values[field.key] || '—'
				}))
			},
			unparsedRemark() {
				return this.parsedRemark.remaining.join('\n')
			},
			processingExplanation() {
				return displayValue(this.info.userExplanation) === '—'
					? this.$t(this.statusConfig.instructions)
					: this.info.userExplanation
			}
		},
		onLoad(options) {
			const settings = uni.getStorageSync('settings') || {}
			this.id = options.id
			this.currency = settings.currency || ''
			this.usdtRateOut = settings.usdtRateOut
			this.actualCurrency = settings.actualCurrency || ''
			this.getInfo()
		},
		methods: {
			numericValue(value) {
				if (value == null || String(value).trim() === '') return null
				const number = Number(value)
				return Number.isFinite(number) ? number : null
			},
			formatMoney(value, currency) {
				if (value == null || !Number.isFinite(value)) return '—'
				return [String(Number(value.toFixed(4))), currency].filter(Boolean).join(' ')
			},
			getInfo() {
				uni.showLoading({ title: this.$t('loading.btn') })
				finanWithdrawalApi(this.id).then(res => {
					if (res.code != 200 || !res.data) {
						throw new Error(res.msg || this.$t('withdrawalDetail.loadFailed'))
					}
					this.info = res.data
				}).catch(err => {
					this.$showMessage('warning', err && (err.msg || err.message) || this.$t('withdrawalDetail.loadFailed'))
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.withdrawal-page {
		min-height: 100vh;
		background: radial-gradient(circle at 110% -100rpx, #def7fa 0, #def7fa 270rpx, transparent 271rpx), linear-gradient(180deg, #fbfefe, #f4fbfd);
		color: #101827;
		font-family: "Roboto-regular", sans-serif;
	}

	.withdrawal-page :deep(.nav-title) {
		max-width: calc(100% - 140rpx);
		color: #073650;
		font-size: 28rpx;
		font-weight: 700;
		line-height: 34rpx;
	}

	.withdrawal-page :deep(.left-icon) {
		left: 28rpx;
		width: 36rpx;
		height: 36rpx;
		filter: brightness(0) saturate(100%) invert(32%) sepia(83%) saturate(1046%) hue-rotate(145deg) brightness(92%) contrast(100%);
	}

	.withdrawal-info {
		padding: 0 26rpx 36rpx;
		padding-bottom: calc(36rpx + env(safe-area-inset-bottom));
	}

	.status-banner {
		min-height: 200rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		border: 1rpx solid #ddf0f5;
		border-radius: 22rpx;
		background: url('/static/withdrawalInfo/topBig.png') center / 100% 100% no-repeat;
	}

	.banner-content {
		flex: 1;
		min-width: 0;
		padding: 28rpx 26rpx 28rpx 260rpx;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		max-width: 100%;
		box-sizing: border-box;
		padding: 6rpx 16rpx 6rpx 10rpx;
		border-radius: 40rpx;
		font-size: 24rpx;
		font-weight: 700;
		line-height: 28rpx;
	}

	.pending { color: #00577f; background: #dcf5fa; }
	.success { color: #08723d; background: #eaf7ed; }
	.failed { color: #c74940; background: #fff0ed; }
	.neutral { color: #677888; background: #f0f4f5; }

	.badge-icon {
		width: 34rpx;
		height: 34rpx;
		flex-shrink: 0;
		margin-right: 6rpx;
	}

	.clock-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: #00577f;
		background: #d9f4f8;
	}

	.clock-face {
		position: relative;
		width: 66%;
		height: 66%;
		box-sizing: border-box;
		border: 2rpx solid currentColor;
		border-radius: 50%;
		background: #f5fcfe;

		&::before, &::after {
			content: '';
			position: absolute;
			left: 50%;
			border-radius: 2rpx;
			background: currentColor;
		}

		&::before { top: 16%; width: 2rpx; height: 36%; }
		&::after { top: 50%; width: 30%; height: 2rpx; transform: rotate(25deg); transform-origin: left center; }
	}

	.status-symbol {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: 26rpx;
		height: 26rpx;
		flex-shrink: 0;
		margin-right: 10rpx;
		border: 2rpx solid currentColor;
		border-radius: 50%;
		font-size: 20rpx;
		font-weight: 700;
	}

	.banner-description {
		display: block;
		margin-top: 12rpx;
		padding-left: 6rpx;
		color: #6e819f;
		font-size: 22rpx;
		line-height: 29rpx;
		overflow-wrap: anywhere;
	}

	.info-card {
		margin-bottom: 14rpx;
		padding: 8rpx 22rpx 14rpx;
		border: 1rpx solid #dbeaf3;
		border-radius: 18rpx;
		background: rgba(255, 255, 255, 0.86);
	}

	.card-heading {
		display: flex;
		align-items: center;
		min-height: 56rpx;
		color: #073650;
		font-family: "Roboto-bold", sans-serif;
		font-size: 24rpx;
		font-weight: 700;
		line-height: 28rpx;
	}

	.heading-icon {
		width: 68rpx;
		height: 68rpx;
		flex-shrink: 0;
		margin-left: -4rpx;
		margin-right: 14rpx;
	}

	.info-row {
		display: flex;
		align-items: center;
		min-height: 78rpx;
		box-sizing: border-box;
		padding: 10rpx 0;
		border-bottom: 1rpx solid #dfe9f3;

		&:last-of-type { border-bottom: 0; }
	}

	.row-icon {
		width: 68rpx;
		height: 68rpx;
		flex-shrink: 0;
		margin-left: -4rpx;
		margin-right: 18rpx;
	}

	.row-content {
		flex: 1;
		min-width: 0;
	}

	.field-label {
		display: block;
		color: #6e819f;
		font-size: 22rpx;
		line-height: 24rpx;
	}

	.field-value {
		display: block;
		margin-top: 2rpx;
		font-size: 22rpx;
		line-height: 28rpx;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.result-card { padding-bottom: 12rpx; }

	.result-content {
		display: flex;
		align-items: center;
		min-height: 70rpx;
		margin-top: 2rpx;
		padding: 4rpx 10rpx;
		box-sizing: border-box;
		border-radius: 16rpx;

		&.pending { background: #edfafd; }
	}

	.result-icon {
		width: 62rpx;
		height: 62rpx;
		flex-shrink: 0;
		margin-right: 12rpx;
	}

	.result-symbol {
		width: 42rpx;
		height: 42rpx;
		margin: 10rpx 22rpx 10rpx 10rpx;
		font-size: 30rpx;
	}

	.result-value {
		display: block;
		margin-top: 2rpx;
		color: #101827;
		font-size: 19rpx;
		font-weight: 700;
		line-height: 26rpx;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.instructions-card { margin-bottom: 0; }

	.instructions-content {
		display: flex;
		align-items: center;
		margin-top: 2rpx;
		padding: 14rpx 12rpx;
		border-radius: 16rpx;
		background: #eaf7fa;
	}

	.instructions-icon {
		width: 62rpx;
		height: 62rpx;
		flex-shrink: 0;
		margin-right: 12rpx;
	}

	.instructions-text, .remark-text {
		color: #687f99;
		font-size: 22rpx;
		line-height: 22rpx;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	.remark-text { display: block; padding: 12rpx 0; }
</style>
