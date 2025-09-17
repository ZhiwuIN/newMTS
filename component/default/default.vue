<template>
	<view class="default_box">
		<image :src="image" mode="" class="default_image"></image>
		<view class="default_title">{{title}}</view>
		<view class="default_text">{{text}}</view>
	</view>
</template>

<script setup>
	const props = defineProps({
		image: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
		},
		text: {
			type: String,
			default: ''
		},
	})
</script>

<style scoped lang="scss">
	.default_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 220rpx;

		.default_image {
			width: 400rpx;
			height: 276rpx;
			margin-bottom: 74rpx;
		}

		.default_title {
			font-family: DINPro, DINPro;
			font-weight: 500;
			font-size: 36rpx;
			color: #333333;
			line-height: 46rpx;
			text-align: center;
			font-style: normal;
			margin-bottom: 10rpx;
		}

		.default_text {
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #909399;
			line-height: 40rpx;
			text-align: center;
			font-style: normal;
		}
	}
</style>