<template>
	<view class="appDownload_box">
		<image src="/static/back_icon2.png" class="left-icon" @click="back"></image>
		<view class="download_box">
			<view class="download_item">
				<view style="display: flex;align-items: center;">
					<image class="icon" src="@/static/1024.png" mode=""></image>
					<view>IOS</view>
				</view>
				<div class="btn" @click="showMask = true">{{ $t('home.Download') }}</div>
			</view>
			<view class="line"></view>
			<view class="download_item">
				<view style="display: flex;align-items: center;">
					<image class="icon" src="@/static/1024.png" mode=""></image>
					<view>Android</view>
				</view>
				<div class="btn" @click="onDownloadAnd()">{{ $t('home.Download') }}</div>
			</view>
		</view>

		<view class="title">{{ $t('iOS Installation process') }}</view>
		<view class="step_box">
			<view v-for="(item, index) in 10" class="step_item">
				<view class="sequence">{{index + 1}}</view>
				<image class="image-center" :src="`/static/appDownload/${index + 1}.png`" mode="widthFix"></image>
			</view>
		</view>

		<view class="mask" @click="showMask = false" v-if="showMask"></view>
		<view class="link_box" v-if="showMask">
			<image class="bigIcon" src="/static/appDownload/big.png" mode=""></image>
			<view class="text">
				<view>{{ $t('Copy the link and open it in Safari') }}</view>
				<image src="/static/appDownload/111.png" class="icon" mode=""></image>
			</view>
			<div class="btn" @click="copyLink">{{ $t('Copy Now') }}</div>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showMask: false
			}
		},
		methods: {
			back() {
				this.$customizeBack()
			},
			copyLink() {
				uni.setClipboardData({
					data: uni.getStorageSync('settings').appDownIos,
					success: () => {
						this.$showMessage('success', this.$t('home.copied'));
					}
				})
			},
			onDownloadAnd() {
				// 1. 获取存储的下载链接
				const downloadUrl = uni.getStorageSync('settings').appDownAndroid;
			
				window.location.href = downloadUrl;
			},
		}
	}
</script>

<style scoped lang="scss">
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100%;
		background: #000000;
		opacity: 0.71;
	}

	.link_box {
		position: fixed;
		bottom: 80rpx;
		left: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		transform: translateX(-50%);
		width: 700rpx;
		height: 394rpx;
		background: #FFFFFF;
		border-radius: 25rpx 25rpx 25rpx 25rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 34rpx;
		color: #000000;
		font-style: normal;
		text-transform: none;

		.text {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 13rpx;
			margin-top: 140rpx;
		}

		.bigIcon {
			position: absolute;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 120rpx;
			height: 120rpx;
		}

		.icon {
			width: 60rpx;
			height: 61rpx;
			transform: translateY(2%);
		}

		.btn {
			margin-top: 74rpx;
			width: 520rpx;
			height: 80rpx;
			background: $themeColor;
			// box-shadow: 5rpx 0rpx 4rpx 0rpx #1F68BF;
			border-radius: 40rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			line-height: 78rpx;
			text-align: center;
			color: #FFFEFE;
			font-style: normal;
			text-transform: none;
		}
	}

	.appDownload_box {
		background-color: $themeColor;
		padding: 36rpx;

		.left-icon {
			width: 48rpx;
			height: 48rpx;
		}

		.download_box {
			margin-top: 24rpx;
			padding: 30rpx 51rpx;
			background-color: #fff;
			border-radius: 34rpx;

			.line {
				height: 3rpx;
				background: #E8E8E8;
				margin: 38rpx 0;
			}

			.download_item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-family: PingFangSC, PingFang SC;
				font-weight: 600;
				font-size: 34rpx;
				color: #000000;
				font-style: normal;
				text-transform: none;

				.icon {
					width: 96rpx;
					height: 96rpx;
					border-radius: 18rpx;
					margin-right: 36rpx;
				}

				.btn {
					width: 180rpx;
					height: 67rpx;
					background: $themeColor;
					// box-shadow: 5rpx 0rpx 4rpx 0rpx #1F68BF;
					border-radius: 34rpx;
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 28rpx;
					color: #FFFFFF;
					line-height: 67rpx;
					text-align: center;
					font-style: normal;
					text-transform: none;
				}
			}
		}

		.title {
			font-family: PingFangSC, PingFang SC;
			font-weight: 600;
			font-size: 34rpx;
			color: #FFFFFF;
			font-style: normal;
			text-transform: none;
			margin: 78rpx 0 45rpx;
			text-align: center;
		}

		.step_box {
			display: flex;
			flex-direction: column;
			gap: 49rpx;

			.step_item {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.sequence {
					display: flex;
					// align-items: center;
					justify-content: center;
					width: 62rpx;
					height: 62rpx;
					background: #FFE50C;
					border-radius: 50%;
					font-family: AlimamaShuHeiTi, AlimamaShuHeiTi;
					font-weight: bold;
					font-size: 38rpx;
					line-height: 60rpx;
					color: #000000;
					font-style: normal;
					text-transform: none;
				}

				.image-center {
					width: 560rpx;
				}
			}
		}
	}
</style>
