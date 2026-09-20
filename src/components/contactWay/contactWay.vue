<template>
	<view class="contactWay_box" :class="{ hidden: isHidden }" @click="unShow" v-if="false">
		<!--  && levelCode != '0' -->
		<image src="/static/result.png" style="width: 48rpx; height: 48rpx;" mode=""></image>
		<view>{{ $t('代理') }}</view>
	</view>

	<uni-popup ref="logout_popup" type="center" border-radius="10px 10px 0 0" style="z-index: 99999;">
		<view class="logout_pop_page">
			<view class="logout_pop_top">{{ $t("代理联系方式") }}</view>
			<view class="function-card2">
				<view class="function-grid">
					<view class="function-item" v-for="item in list">
						<view class="item_left">
							<image :src="item.icon"></image>
							<text class="text_box">{{ item.contactInfo }}</text>
						</view>
						<image class="item_right" src="/static/copy.png" @click="copyLink(item.contactInfo)"></image>
					</view>
				</view>
			</view>
			<view class="logout_pop_bottom">
				<button class="btn_confirm" @click="confirm">{{ $t('home.Confirm') }}</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
import {
	getProxy
} from "@/common/api/home.js";
export default {
	data() {
		return {
			isHidden: false, // 控制元素显示/隐藏
			scrollTimer: null,// 滚动定时器
			list: [],
			levelCode: '0'
		}
	},
	methods: {
		unShow() {
			this.$refs.logout_popup.open()
		},
		confirm() {
			this.$refs.logout_popup.close()
		},
		handleScroll() {
			// 页面开始滚动时立即隐藏元素
			this.isHidden = true;

			// 清除之前的定时器
			if (this.scrollTimer) {
				clearTimeout(this.scrollTimer);
			}

			// 设置新的定时器，在停止滚动500ms后显示元素
			this.scrollTimer = setTimeout(() => {
				this.isHidden = false;
			}, 200);
		},
		// 复制
		copyLink(url) {
			uni.setClipboardData({
				data: url,
				success: () => {
					this.$showMessage('success', this.$t('home.copied'));
				}
			})
		},
	},
	mounted() {
		getProxy().then(res => {
			this.list = res.data || []
			this.levelCode = uni.getStorageSync('userInfo').levelCode
			// 监听页面滚动事件
			uni.$on('pageScroll', this.handleScroll);

			// 如果是H5平台，添加原生滚动监听
			// #ifdef H5
			window.addEventListener('scroll', this.handleScroll);
			// #endif
		})
	},
	beforeDestroy() {
		// 清理事件监听和定时器
		uni.$off('pageScroll', this.handleScroll);

		// #ifdef H5
		window.removeEventListener('scroll', this.handleScroll);
		// #endif

		if (this.scrollTimer) {
			clearTimeout(this.scrollTimer);
		}
	}
}
</script>

<style lang="scss" scoped>
.function-card2 {
	box-sizing: border-box;
	background-color: #fff;
	width: 100%;
	margin: 0 auto;
	background: #FFFFFF;
	border-radius: 20rpx;


	.function-grid {
		// padding: 0 30rpx;

		.function-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 0;
			border-bottom: 1rpx solid #EFEFEF;
			// margin-bottom: 50rpx;

			&:last-child {
				border-bottom: none;
			}

			.item_left {
				display: flex;
				align-items: center;

				image {
					width: 48rpx;
					height: 48rpx;
					min-width: 48rpx;
				}

				text {
					font-family: DINPro, DINPro;
					font-weight: 400;
					font-size: 24rpx;
					color: #000;
					// line-height: 30rpx;
					margin-left: 30rpx;
					text-align: left;
					font-style: normal;
					// white-space: nowrap;
					// overflow: hidden;
					// text-overflow: ellipsis;
				}
			}

			.item_right {
				width: 30rpx;
				height: 30rpx;
				min-width: 30rpx;
				margin-left: 24rpx;
			}
		}
	}
}


.contactWay_box {
	position: fixed;
	right: 10rpx;
	bottom: 320rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
	border-radius: 20rpx;
	padding: 16rpx;
	font-family: PingFangSC, PingFang SC;
	font-weight: 400;
	font-size: 20rpx;
	color: #FFFFFF;
	line-height: 28rpx;
	text-align: center;
	font-style: normal;

	/* 添加过渡效果使显示/隐藏更平滑 */
	transform: translateX(0);
	transition: all 0.3s ease-in-out;
	z-index: 99999;
	
}

/* 隐藏状态样式 */
.contactWay_box.hidden {
	transform: translateX(70%);
	pointer-events: none;
}

.logout_pop_page {
	width: 570rpx;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 40rpx 54rpx 28rpx 54rpx;

	.logout_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.logout_pop_content {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.logout_pop_bottom {
		display: flex;
		margin-top: 54rpx;
	}

	.btn_cancel {
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

	.btn_confirm {
		width: 212rpx;
		height: 72rpx;
		background: $themeColor;
		// // box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 12rpx;
		font-family: "DINPro-Black", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #fff;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}
}
</style>