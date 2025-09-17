<template>
	<customnavbar :title="$t('提现详情')" @mtop="mtop">
		<view class="withdrawalInfo">
			<view class="identity_set_t1">{{$t('订单编号')}}</view>
			<view class="identity_set_input">
				{{info.orderNumber}}
			</view>
			<view class="identity_set_t1">{{$t('取款金额')}}</view>
			<view class="identity_set_input">
				{{info.price + info.fee}} {{currency}}
			</view>
			<view class="identity_set_t1">{{$t('手续费')}}</view>
			<view class="identity_set_input">
				{{info.fee * usdtRateOut || 0}} {{actualCurrency}}
			</view>
			<view class="identity_set_t1">{{$t('取款信息')}}</view>
			<view class="identity_set_input">
				{{info.remark}}
			</view>
			<view class="identity_set_t1">{{$t('处理结果')}}</view>
			<view class="identity_set_input" v-if="info.status == 1">
				{{$t('提款成功')}}
			</view>
			<view class="identity_set_input" v-if="info.status == 5 || info.status == 6">
				{{$t('审核成功待支付')}}
			</view>
			<view class="identity_set_input" v-if="info.status == 2">
				{{$t('取款失败')}}
			</view>
			<view class="identity_set_input" v-if="info.status == 3">
				{{$t('未审核')}}
			</view>
			<view class="identity_set_input" v-if="info.status == 4">
				{{$t('审核失败')}}
			</view>
			<view class="identity_set_t1">{{$t('处理说明')}}</view>
			<view class="identity_set_input">
				{{info.userExplanation}}
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		finanWithdrawalApi
	} from '@/common/api/deposit.js'
	export default {
		components: {
			customnavbar,
		},
		data() {
			return {
				currency: '',
				id: '',
				info: {},
				usdtRateOut: '',
				actualCurrency: ''
			}
		},
		onLoad(options) {
			this.id = options.id
			this.currency = uni.getStorageSync('settings').currency
			this.getInfo()
			this.usdtRateOut = uni.getStorageSync('settings').usdtRateOut
			this.actualCurrency = uni.getStorageSync('settings').actualCurrency
		},
		methods: {
			getInfo() {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				finanWithdrawalApi(this.id).then(res => {
					this.info = res.data
				}).catch(err => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.withdrawalInfo {
		padding: 40rpx;
	}

	.identity_set_t1 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 600;
		font-size: 32rpx;
		line-height: 30rpx;
		text-align: left;
		font-style: normal;
		margin-bottom: 12rpx;
	}

	.identity_set_input {
		margin-bottom: 32rpx;
		// color: #999;
		white-space: pre-line;
	}
</style>