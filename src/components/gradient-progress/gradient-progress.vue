<template>
	<view class="progress-wrap">
		<view class="progress">
			<view class="pro_index"
				:style="{ animationDuration: duration, animationFillMode: 'forwards', animationIterationCount: playNum, width: progress + '%', filter: `hue-rotate(${filterDeg}deg);` }">
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		color1: {
			type: String,
			default: '#72EDE3'
		},
		color2: {
			type: String,
			default: '#A08EFF'
		},
		progress: {
			type: Number,
			default: 10
		},
		filterDeg: {
			type: Number, // 滤镜设置色调旋转
			default: 0
		},
		playNum: {
			type: [Number, String],
			default: 1
		},
		duration: {
			type: String,
			default: '2s'
		}
	},
	data() {
		return {}
	},
}
</script>

<style lang="scss" scoped>
.progress-wrap {
	border-radius: 12rpx;
	width: 100%;
	// padding-left: 34rpx;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	overflow: hidden;

	.pro_titl {
		font-size: 28rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: bold;
		color: #333;
		line-height: 40rpx;
		margin-right: 20rpx;
	}

	.progress {
		width: 607rpx;
		height: 38rpx;
		background: rgba(255, 255, 255, 0.55);
		filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.22));
		border-radius: 12rpx;
		z-index: 1;
		overflow: hidden;

		/* 使用伪元素制造滚动条 */
		.pro_index {
			position: absolute;
			width: 0;
			left: 0;
			right: 90%;
			bottom: 0;
			top: 0;
			/* 背景色线性渐变 */
			background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
			border-radius: 12rpx;
			box-shadow: 0 14px 28px rgba(33, 150, 243, 0), 0 10px 10px rgba(9, 188, 215, 0.08);

			/* 滤镜设置色调旋转 */
			// filter: hue-rotate(90deg);
			animation: loading 1.5s linear infinite;
		}
	}

	@keyframes loading {
		0% {
			// filter: hue-rotate(0);
			left: -100%;
		}

		100% {
			// filter: hue-rotate(90deg);
			left: 0;
		}
	}


	.percentage {
		width: 62rpx;
		height: 40rpx;
		font-size: 28rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: bold;
		color: #333;
		line-height: 40rpx;
		margin-left: 24rpx;
	}
}
</style>