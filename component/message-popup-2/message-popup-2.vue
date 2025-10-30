<template>
	<view class="message-popup_box" :class="{'conceal': !isShow}" @click="info()">
		<view style="display: flex;">
			<!-- 图标 -->
			<view>
				<image class="remind" src="/static/message-popup/remind.png" mode=""></image>
			</view>
			<!-- 主要内容 -->
			<view class="main">
				<!-- <view>{{data?.title}}</view> -->
				<view class="main_content" v-html="content"></view>
			</view>
		</view>
		<!-- 关闭按钮 -->
		<view @click.stop="close()">
			<image class="close" src="/static/message-popup/close.png" mode=""></image>
		</view>
	</view>
</template>

<script>
	import {
		messageReadApi
	} from "@/common/api/home.js";
	export default {
		data() {
			return {

			}
		},
		props: {
			content: {
				type: String,
				default: ''
			},
			isShow: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			close() {
				this.$emit('update:isShow', false)
			},
			info() {
				this.$emit('update:isShow', false)
				uni.navigateTo({
					url: '/pages/notificationDetails?type=rollContent'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.message-popup_box {
		box-sizing: border-box;
		position: fixed;
		// #ifdef H5
		top: 22rpx;
		// #endif
		// #ifdef APP-PLUS
		top: 5%;
		// #endif
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		justify-content: space-between;
		width: 92%;
		background-color: #fff;
		border-radius: 14rpx;
		z-index: 9999;
		padding: 24rpx;
		transition: all 0.3s linear;

		&.conceal {
			transform: translate(-50%, -200%);
		}

		.main {
			max-width: 540rpx;
			// flex: 1;
			font-family: "DINPro-Medium", sans-serif;
			font-size: 28rpx;
			line-height: 40rpx;
			overflow-wrap: break-word;

			.main_content {
				transform: translateY(8rpx);
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				-webkit-box-orient: vertical;
			}
		}

		.remind {
			width: 42rpx;
			height: 42rpx;
			margin-right: 24rpx;
			transform: translateY(8rpx);
		}

		.close {
			width: 24rpx;
			height: 24rpx;
			transform: translateY(4rpx);
		}
	}
</style>