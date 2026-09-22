<template>
	<view class="page">
		<customnavbar backgroundStr="#fff" :title="$t('financePage.title')" @mtop="mtop">
			<view class="hero" :style="topStyle"></view>
			<view class="content">
				<view class="account-card">
					<view class="Mybtn_box">
						<text class="account-label">{{ $t('financePage.totalPurchasedRevenue') }}</text>
						<text class="Mybtn" @click="toPage('/pages/MinePage/financePage')">{{ $t('financePage.myFund')
							}}</text>
					</view>
					<view class="account-total">{{ productIncomeSummary?.totalIncome || 0 }} <text>{{ currency }}</text>
					</view>
					<view class="balance-row">
						<view><text>{{ $t('financePage.availableBalance') }}</text><b>{{
							productIncomeSummary?.accountBalance || 0 }} {{
									currency
								}}</b></view>
						<view><text>{{ $t('financePage.settledIncome') }}</text><b class="mint">+{{
							productIncomeSummary?.settledIncome || 0 }}
								{{ currency }}</b></view>
						<view><text>{{ $t('financePage.pendingIncome') }}</text><b>{{
							productIncomeSummary?.unsettledIncome || 0 }} {{ currency
								}}</b></view>
					</view>
				</view>
				<!-- <scroll-view class="filters" scroll-x>
					<view v-for="(item, index) in filters" :key="item" :class="['filter', { active: index === 0 }]">{{
						item }}</view>
				</scroll-view> -->
				<view v-for="(item, index) in productList" :key="item.productId || index"
					:class="['product-card', { dark: item.recommendFlag }]" @click="toProduct(item.productId)">
					<view class="recommendation" v-if="item.recommendTag">{{ item.recommendTag }}</view>
					<view class="product-title">{{ item.productName || '--' }}</view>
					<view class="scope">
						{{ item.introduction || $t('financePage.purchaseScope') }}
						<text v-if="item.totalRevenue">{{ $t('financePage.totalRevenueSeparator') }}{{ item.totalRevenue
							}}</text>
					</view>
					<view class="product-stats">
						<view><b>{{ item.dailyRateOfReturnStr || '--' }}</b><text>{{ $t('financePage.dailyRateOfReturn')
								}}</text></view>
						<view><b>{{ getStartingAmount(item.startingAmount, 0) }} {{ currency }}</b><text>{{
							$t('financePage.minPurchase') }}</text></view>
						<view><b>{{ getStartingAmount(item.startingAmount, 1) }} {{ currency }}</b><text>{{
							$t('financePage.maxPurchase') }}</text></view>
					</view>
					<view class="card-footer">
						<view class="progress-wrap">
							<view class="progress"><i :style="{ width: getProgress(item.remaining) + '%' }"></i></view>
							<text>{{ $t('financePage.remaining') }} {{ item.remaining || '--' }}</text>
						</view>
						<button>{{ $t('financePage.viewDetails') }}</button>
					</view>
				</view>
				<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
					image="/static/default/NoContent.png">
				</listbottom>
			</view>
		</customnavbar>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	productListApi,
	productIncomeSummaryApi
} from '@/common/api/product.js'
export default {
	components: {
		customnavbar,
		listbottom
	},
	data() {
		return {
			productIncomeSummary: {}, // 统计信息
			currency: '',
			topStyle: '',
			filters: ['All deadlines', '7 days', '14 days', '30 days'],
			page: {
				pageNum: 1,
				pageSize: 7,
			},
			productList: [],
			nodata: false,
			hasMore: true,
			loading: false,
		}
	},
	methods: {
		mtop(height) {
			this.topStyle = `margin-top:-${height}rpx;padding-top:${height + 88}rpx`
		},
		toPage(url) {
			uni.navigateTo({ url })
		},
		toProduct(productId) {
			if (!productId) return
			uni.navigateTo({ url: '/pages/HomePage/financeDetails?productId=' + productId })
		},
		getStartingAmount(value, index) {
			if (!value) return '--'
			const amounts = String(value).split('~').map(item => item.trim()).filter(Boolean)
			return amounts[index] || amounts[0] || '--'
		},
		getProgress(value) {
			const progress = Number.parseFloat(String(value || '').replace('%', ''))
			if (Number.isNaN(progress)) return 0
			return Math.min(100, Math.max(0, progress))
		},
		// 产品列表
		getProductList() {
			if (this.loading || !this.hasMore) return
			this.loading = true
			productListApi(this.page).then(res => {
				const rows = Array.isArray(res?.rows) ? res.rows : []
				const total = Number(res?.total || 0)

				if (this.page.pageNum === 1) this.productList = rows
				else this.productList.push(...rows)

				this.nodata = total === 0
				this.hasMore = this.productList.length < total
			}).catch(err => {
				this.nodata = this.productList.length == 0
			}).finally(() => {
				this.loading = false
			})
		},
		// 统计信息
		getProductIncomeSummary() {
			productIncomeSummaryApi().then(res => {
				this.productIncomeSummary = res.data
			})
		}
	},
	mounted() {
		this.currency = uni.getStorageSync('settings').currency || ''
		this.getProductIncomeSummary()
		this.getProductList()
	}
}
</script>

<style lang="scss" scoped>
* {
	box-sizing: border-box;
	font-family: 'MiSans';
}

.page {
	min-height: 100vh;
	background: #f2f4fd;

	.hero {
		position: absolute;
		top: 0;
		width: 100%;
		height: 1076rpx;
		background: #f2f5ff;
	}

	.search-button {
		image {
			width: 100%;
			height: 100%;
		}
	}

	.content {
		position: relative;
		z-index: 1;
		padding: 24rpx 14rpx 130rpx;

		.account-card {
			padding: 42rpx 24rpx 28rpx;
			border-radius: 12rpx;
			color: #fff;
			background: $themeColor;
			margin-bottom: 16rpx;

			.Mybtn_box {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.Mybtn {
					font-size: 24rpx;
					font-weight: bold;
				}
			}

			.account-label {
				font-size: 24rpx;
				color: $themeColor2;
			}

			.account-total {
				margin-top: 14rpx;
				font-size: 64rpx;
				line-height: 78rpx;
				font-weight: 700;
				white-space: nowrap;

				text {
					font-size: 34rpx;
					font-weight: 400;
				}
			}

			.balance-row {
				display: flex;
				justify-content: space-between;
				margin-top: 28rpx;

				view {
					width: 33.333%;

					text,
					b {
						display: block;
						white-space: nowrap;
					}

					text {
						font-size: 23rpx;
						color: $themeColor2;
					}

					b {
						margin-top: 12rpx;
						font-size: 29rpx;
						line-height: 36rpx;
					}
				}
			}
		}

		.mint {
			color: #63ead1;
		}

		.filters {
			display: flex;
			width: calc(100% + 24rpx);
			margin-bottom: 16rpx;
			white-space: nowrap;

			.filter {
				display: inline-block;
				height: 64rpx;
				margin-right: 16rpx;
				padding: 0 32rpx;
				border-radius: 34rpx;
				background: #fff;
				color: #999;
				font-size: 27rpx;
				line-height: 64rpx;

				&.active {
					background: #1049eb;
					color: #fff;
				}
			}
		}

		.product-card {
			margin-bottom: 24rpx;
			padding: 32rpx;
			border-radius: 12rpx;
			background: #fff;
			color: #000;

			.recommendation {
				display: inline-block;
				padding: 12rpx 18rpx;
				border-radius: 12rpx;
				background: #edf3ff;
				color: $themeColor;
				font-size: 27rpx;
				line-height: 34rpx;
				margin-bottom: 26rpx;
			}

			.product-title {
				font-size: 31rpx;
				line-height: 40rpx;
				font-weight: 700;
			}

			.scope {
				margin-top: 16rpx;
				color: #616161;
				font-size: 24rpx;
				line-height: 32rpx;
			}

			.product-stats {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				margin-top: 26rpx;

				view {
					padding-left: 16rpx;
					border-left: 2rpx solid #61708c;

					&:first-child {
						padding-left: 0;
						border-left: 0;

						b {
							color: $themeColor;
						}
					}

					b,
					text {
						display: block;
						white-space: nowrap;
					}

					b {
						font-size: 33rpx;
						line-height: 40rpx;
					}

					text {
						margin-top: 10rpx;
						color: #666;
						font-size: 22rpx;
						line-height: 30rpx;
					}
				}
			}

			.card-footer {
				display: flex;
				align-items: flex-end;
				justify-content: space-between;
				margin-top: 28rpx;

				.progress-wrap {
					width: 62%;

					.progress {
						height: 14rpx;
						overflow: hidden;
						border-radius: 10rpx;
						background: #E8EEF7;

						i {
							display: block;
							width: 79%;
							height: 100%;
							border-radius: inherit;
							background: linear-gradient(90deg, #43d6ff 0%, $themeColor 100%);
						}
					}

					>text {
						display: block;
						margin-top: 12rpx;
						color: #a9b9d8;
						font-size: 24rpx;
					}
				}

				button {
					width: 220rpx;
					height: 70rpx;
					margin: 0;
					padding: 0;
					border: 0;
					border-radius: 34rpx;
					background: $themeColor;
					color: #fff;
					font-size: 28rpx;
					font-weight: 700;
					line-height: 70rpx;

					&::after {
						border: 0;
					}
				}
			}

			&.dark {
				color: #fff;
				background: #13171c;

				.recommendation {
					background: rgba(138, 180, 255, .18);
					color: #63ead1;
				}

				.scope,
				.product-stats text,
				.progress-wrap>text {
					color: #AAB5CB;
				}

				.progress {
					background: rgba(255, 255, 255, 0.08);
				}

				.product-stats view:first-child b {
					color: #63ead1;
				}
			}
		}
	}
}
</style>
