<template>
	<view class="box">
		<image class="success_image" src="/static/success.png" mode=""></image>
		<view class="title">
			{{$t('订单提交成功')}}
		</view>
		<view class="tag">
			{{$t('稍后查看')}}
		</view>
		<view class="btn" @click="pushHome">{{$t('返回首页')}}</view>
	</view>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	export default {
		components: {
			customnavbar
		},
		data() {
			return {}
		},
		methods: {
			pushHome() {
				uni.switchTab({
					url: '/pages/HomePage/index'
				});
			},
		},
		onLoad(options) {},
		onShow() {}
	}
</script>

<style scoped lang="scss">
	.box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 180rpx;

		.success_image {
			width: 180rpx;
			height: 180rpx;
			margin-bottom: 60rpx;
		}

		.title {
			font-family: DINPro, DINPro;
			font-weight: bold;
			font-size: 38rpx;
			color: #000000;
			text-align: center;
			font-style: normal;
			margin-bottom: 20rpx;
		}

		.tag {
			font-family: DINPro, DINPro;
			font-size: 32rpx;
			color: #c8c8c8;
			text-align: center;
			font-style: normal;
		}

		.btn {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 58rpx;
			height: 98rpx;
			font-size: 38rpx;
			border: 2rpx solid #c8c8c8;
			border-radius: 49rpx;
			margin-top: 148rpx;
		}
	}
</style>