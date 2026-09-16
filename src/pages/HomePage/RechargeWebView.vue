<template>
	<view class="recharge-container">
		<!-- 返回按钮 -->
		<view class="back-btn" @click="handleBack">
			<text>{{ $t('back') }}</text>
		</view>

		<!-- WebView容器加载第三方页面 -->
		<web-view :src="decodedCheckoutUrl" @message="onWebMessage" @loaded="onWebViewLoaded"></web-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			checkoutUrl: '',
			decodedCheckoutUrl: '',
			// 记录充值是否成功的标记
			isRechargeSuccess: false
		};
	},
	onLoad(options) {
		// 接收从上个页面传递的支付链接
		this.checkoutUrl = options.checkoutUrl;
		this.checkoutUrl = options.checkoutUrl;
		// 对链接进行解码
		this.decodedCheckoutUrl = decodeURIComponent(this.checkoutUrl);
		console.log(this.checkoutUrl)
	},
	methods: {
		// 返回上一页
		handleBack() {
			// 可以添加确认提示
			uni.showModal({
				title: this.$t('home.Prompt'),
				content: this.$t('backtopage'),
				cancelText: 'Cancel',
				confirmText: 'Confirm',
				success: (res) => {
					if (res.confirm) {
						this.$customizeBack()
					}
				}
			});
		},

		// 监听WebView中的消息
		onWebMessage(e) {
			const data = e.detail.data[0];
			// 假设第三方页面会发送支付结果消息
			if (data.type === 'recharge_result') {
				this.isRechargeSuccess = data.success;
				if (data.success) {
					// 充值成功，延迟返回以显示结果
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
						// 可以通知上一页刷新数据
						uni.$emit('rechargeSuccess', data);
					}, 2000);
				}
			}
		},

		// 页面加载完成后检查URL变化
		onWebViewLoaded() {
			// 不同平台获取当前URL的方式不同
			// #ifdef APP-PLUS
			const currentWebview = this.$mp.page.$getAppWebview();
			const webview = currentWebview.children()[0];
			webview.evalJS(`window.location.href`).then(url => {
				this.checkUrlChange(url);
			});
			// #endif

			// #ifdef H5
			// H5可以通过监听hash变化来判断
			window.addEventListener('hashchange', () => {
				this.checkUrlChange(window.location.href);
			});
			// #endif
		},

		// 检查URL变化判断支付状态
		checkUrlChange(url) {
			// 根据第三方平台的URL规则判断是否支付成功
			if (url.includes('recharge=success') || url.includes('payment=completed')) {
				this.isRechargeSuccess = true;
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					});
					uni.$emit('rechargeSuccess');
				}, 2000);
			}
		}
	}
};
</script>

<style scoped>
.recharge-container {
	position: relative;
	width: 100%;
	height: 100vh;
	/* 确保高度填满整个视口 */
}

.back-btn {
	position: fixed;
	top: 32rpx;
	/* #ifndef APP-NVUE */
	top: 48rpx;
	/* #endif */
	left: 32rpx;
	z-index: 999;
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.9);
	padding: 16rpx 24rpx;
	border-radius: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.back-btn text {
	/* margin-left: 12rpx; */
	font-size: 28rpx;
}
</style>