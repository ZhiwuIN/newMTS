<template>
	<customnavbar backgroundStr="#004f56" :title="pageTitle" @mtop='mtop' :whiteTitle="true">
		<view class="team_expansion_container" :style="topStyle">
			<view class="hero-copy">
				<view class="hero-title">{{ $t('invitePage.buildTeam') }}</view>
				<view class="hero-subtitle">{{ $t('invitePage.inviteSubTitle') }}</view>
			</view>
			<view class="invite-card" v-show="!isRestrictAccess">
				<view class="scan-title">{{ $t('invitePage.scanQrJoin') }}</view>
				<!-- 二维码 -->
				<view class="qr-section">
					<canvas canvas-id="qrcode" class="qr-canvas"></canvas>
				</view>
				<view class="invite-info">
					<view class="info-copy">
						<view class="info-label">{{ $t('invitePage.invitationCode') }}</view>
						<view class="info-value">{{ code }}</view>
					</view>
					<view class="copy-action" @click="copyCode">
						<view class="copy-icon"></view><text>{{ $t('invitePage.copy') }}</text>
					</view>
				</view>
				<view class="invite-info">
					<view class="info-copy">
						<view class="info-label">{{ $t('invitePage.invitationLink') }}</view>
						<view class="info-value link-value">{{ invitationLink }}</view>
					</view>
					<view class="copy-action" @click="copyLink">
						<view class="copy-icon"></view><text>{{ $t('invitePage.copy') }}</text>
					</view>
				</view>
				<view class="btn-group">
					<button class="qr_btn save-btn" @click="generatePoster">{{ $t('invitePage.generatePoster')
					}}</button>
				</view>
			</view>
			<!-- 海报区域 -->
			<view class="mask" v-if="showPoster" @click="showPoster = false"></view>
			<view class="poster-container" v-if="showPoster">
				<view class="poster" id="poster">
					<view class="poster-top">
						<view class="poster-heading">{{ $t('invitePage.posterHeading') }}</view>
						<view class="poster-description">{{ $t('invitePage.posterDesc') }}</view>
					</view>
					<view class="poster-bottom">
						<view class="poster-scan-title">{{ $t('invitePage.posterScanTitle') }}</view>
						<canvas canvas-id="qrcode2" class="poster-qr"></canvas>
						<view class="poster-field">
							<view class="field-label">{{ $t('invitePage.invitationCode') }}</view>
							<view class="field-value">{{ code }}</view>
						</view>
						<view class="poster-field">
							<view class="field-label">{{ $t('invitePage.invitationLink') }}</view>
							<view class="field-value link">{{ invitationLink }}</view>
						</view>
					</view>
				</view>
				<view class="poster-close" @click="showPoster = false">
					<view></view>
					<view></view>
				</view>
			</view>
		</view>
	</customnavbar>
	<canvas canvas-id="finalPosterCanvas"
		style="width: 750rpx; height: 1200rpx; position: fixed; top: -19998rpx;"></canvas>
	<uni-popup ref="promptpopup" type="center" :mask-click="false">
		<view class="prompt_pop_page">
			<view class="prompt_pop_top">{{ $t('invitePage.prompt') }}</view>
			<view class="prompt_pop_taps">{{ $t("invitePage.restrictedAccess") }}</view>
			<view class="prompt_pop_bottom">
				<button class="prompt_confirm_btn" @click="prompt_confirm">{{ $t('invitePage.yes') }}</button>
			</view>
		</view>
	</uni-popup>
</template>
<script>
import UQRCode from '../../uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js';
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	userInfoApi,
	settingsApi
} from "@/common/api/users.js";
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			pageTitle: '',
			showPoster: false,
			topStyle: "",
			pageH: 0,
			code: "",
			// qrcodeUrl: 'http://localhost:5173/#/',
			qrcodeUrl: '',
			userInfo: {},
			posterImage: '',
			isRestrictAccess: false,
			settings: {}
		}
	},
	computed: {
		invitationLink() {
			return this.qrcodeUrl + '?InvitationCode=' + this.code;
		}
	},
	onShow() {
		settingsApi().then((res) => {
			this.settings = res.data
			uni.setStorageSync('settings', res.data)
			userInfoApi().then((res) => {
				this.userInfo = res.data
				// if (this.userInfo.levelCode == '0') {
				//  this.$showMessage('warning', this.$t('实习生没有权限'))
				//  uni.switchTab({
				//      url: '/pages/HomePage/index'
				//  })
				//  return
				// }
				if (this.userInfo.housekeeper == 1) {
					this.isRestrictAccess = true
					this.$refs.promptpopup.open()
				}
				this.qrcodeUrl = this.settings.regUrl + '/#/'
				this.code = res.data.invitationCode;
				uni.setStorageSync('userInfo', res.data)
				this.generateQrCode()
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		}).catch(err => {
			console.log('request fail', err);
			if (err.data?.code == 403) {
				this.$showMessage('warning', err.data?.msg);
			} else {
				this.$showMessage('warning', err.msg);
			}
		})
	},
	onReady() {
		this.posterImage = uni.getLocale() == 'fr' ? '/static/posterFR.jpg' : '/static/posterEN.jpg';
	},
	methods: {
		prompt_confirm() {
			this.$refs.promptpopup.close()
			uni.navigateBack()
		},
		generateQrCode() {
			// 获取uQRCode实例
			var qr = new UQRCode();
			// 设置二维码内容
			qr.data = this.qrcodeUrl + '?InvitationCode=' + this.code;
			// 设置二维码大小，必须与canvas设置的宽高一致
			qr.size = 148;
			// 调用制作二维码方法
			qr.make();
			// 获取canvas上下文
			var canvasContext = uni.createCanvasContext('qrcode', this); // 如果是组件，this必须传入
			// 设置uQRCode实例的canvas上下文
			qr.canvasContext = canvasContext;
			// 调用绘制方法将二维码图案绘制到canvas上
			qr.drawCanvas();
		},
		generateQrCode2() {
			// 获取uQRCode实例
			var qr = new UQRCode();
			// 设置二维码内容
			qr.data = this.qrcodeUrl + '?InvitationCode=' + this.code;
			// 设置二维码大小，必须与canvas设置的宽高一致
			qr.size = 148;
			// 调用制作二维码方法
			qr.make();
			// 获取canvas上下文
			var canvasContext = uni.createCanvasContext('qrcode2', this); // 如果是组件，this必须传入
			// 设置uQRCode实例的canvas上下文
			qr.canvasContext = canvasContext;
			// 调用绘制方法将二维码图案绘制到canvas上
			qr.drawCanvas();
		},
		generatePoster() {
			// 实现生成海报的逻辑
			this.showPoster = true;
			setTimeout(() => {
				this.generateQrCode2();
			}, 100);
		},
		copyLink() {
			uni.setClipboardData({
				data: this.invitationLink,
				success: () => {
					this.$showMessage('success', this.$t('invitePage.copied'));
				}
			})
		},
		copyCode() {
			uni.setClipboardData({
				data: this.code,
				success: () => {
					this.$showMessage('success', this.$t('invitePage.copied'));
				}
			})
		},
		mtop(e) {
			uni.getSystemInfo({
				success: (res) => {
					this.pageH = res.windowHeight * 2
					// #ifdef H5
					this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
					// #endif
					// #ifdef APP-PLUS
					this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + e + "rpx"
					// #endif
				}
			});
		},
		// 下载海报方法
		async downloadPoster() {
			try {
				// 显示加载中
				uni.showLoading({
					title: this.$t("invitePage.posterLoading"),
					mask: true
				});
				// #ifdef APP-PLUS || H5
				// 1. 确保二维码已生成
				await new Promise(resolve => {
					this.generateQrCode2(); // 生成海报中的小二维码
					setTimeout(resolve, 300); // 等待canvas渲染完成
				});
				// 2. 获取二维码临时路径
				const qrCodeRes = await new Promise((resolve, reject) => {
					uni.canvasToTempFilePath({
						canvasId: 'qrcode2',
						success: resolve,
						fail: reject
					}, this);
				});
				// 3. 创建最终海报canvas
				const ctx = uni.createCanvasContext('finalPosterCanvas', this);
				const canvasWidth = 375; // 与你的海报宽度一致
				const canvasHeight = 600; // 与你的海报高度一致
				// 4. 绘制背景图
				ctx.save();
				ctx.setFillStyle('#0145f1'); ctx.fillRect(0, 0, canvasWidth, 236);
				ctx.setFillStyle('#ffffff'); ctx.fillRect(0, 226, canvasWidth, 374);
				ctx.setFillStyle('#ffd400'); ctx.setFontSize(26);
				ctx.fillText(this.$t('invitePage.posterHeading').replace('<br />', '\n'), 24, 44);
				ctx.fillText('With Us', 24, 74);
				ctx.setFillStyle('#ffffff'); ctx.setFontSize(14);
				ctx.fillText('You’ve been invited to join the platform. Register now', 24, 116);
				ctx.fillText('to explore products, activities, membership benefits,', 24, 138);
				ctx.fillText('and team opportunities. Build your own network, stay', 24, 160);
				ctx.fillText('active, and unlock more ways to participate and earn', 24, 182); ctx.fillText('rewards.', 24, 204);
				ctx.setFillStyle('#0145f1'); ctx.setFontSize(19); ctx.fillText(this.$t('invitePage.posterScanTitle'), 91, 262);
				ctx.restore();
				// 5. 绘制二维码（位置需要根据实际布局调整）
				const qrSize = 64; // 与你的样式一致
				const qrX = 90; // 左间距
				const qrY = 278;
				ctx.save();
				ctx.drawImage(qrCodeRes.tempFilePath, qrX, qrY, qrSize, qrSize);
				ctx.restore();
				// 6. 绘制邀请码文本（位置需要根据实际布局调整）
				ctx.save();
				ctx.setFontSize(18);
				ctx.setFillStyle('#000000');
				ctx.fillText(this.$t('invitePage.invitationCode'), 34, 484);
				ctx.setFontSize(19);
				ctx.setFillStyle('#000000');
				ctx.fillText(this.code, 34, 510);
				ctx.restore();
				// 7. 完成绘制
				await new Promise((resolve, reject) => {
					ctx.draw(false, () => {
						setTimeout(() => {
							uni.canvasToTempFilePath({
								canvasId: 'finalPosterCanvas',
								success: resolve,
								fail: reject
							}, this);
						}, 300);
					});
				});
				// 8. 获取最终图片路径
				const tempFilePath = await new Promise((resolve, reject) => {
					uni.canvasToTempFilePath({
						canvasId: 'finalPosterCanvas',
						success: resolve,
						fail: reject
					}, this);
				});
				// #ifdef APP-PLUS
				// APP端保存到相册
				await uni.saveImageToPhotosAlbum({
					filePath: tempFilePath.tempFilePath
				});
				uni.showToast({
					title: this.$t("invitePage.posterSaveSuccess"),
					icon: 'success'
				});
				// #endif
				// #ifdef H5
				// H5端创建下载链接
				const link = document.createElement('a');
				link.href = tempFilePath.tempFilePath;
				link.download = 'poster.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				uni.showToast({
					title: this.$t("invitePage.posterSaveSuccess"),
					icon: 'success'
				});
				// #endif
				this.showPoster = false; // 关闭海报预览
				// #endif
			} catch (error) {
				console.error('海报下载失败:', error);
				uni.showToast({
					title: this.$t("invitePage.posterDownloadFail"),
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		}
	},
	onLoad(options) {
		if (uni.getStorageSync('pageTitle')) {
			this.pageTitle = uni.getStorageSync('pageTitle') || 'Invite Friends'
		} else {
			this.pageTitle = options.title || 'Invite Friends'
		}

	},
}
</script>
<style scoped lang="scss">
.mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: #000000;
	opacity: 0.6;
	z-index: 9999;
}

.poster-container {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 678rpx;
	z-index: 10000;

	.poster {
		position: relative;
		width: 100%;
		border-radius: 30rpx;
		overflow: hidden;
		background: $themeColor;

		.poster-top {
			padding: 38rpx 22rpx 24rpx;
			box-sizing: border-box;
			background: $themeColor;
		}

		.poster-heading {
			font-family: DingTalk JinBuTi;
			font-size: 48rpx;
			line-height: 60rpx;
			color: #ffd400;
		}

		.poster-description {
			margin-top: 24rpx;
			font-size: 24rpx;
			line-height: normal;
			color: #ffffff;
		}

		.poster-bottom {
			padding: 44rpx 32rpx 34rpx;
			box-sizing: border-box;
			background: #ffffff;
			border-radius: 30rpx 30rpx 0 0;
		}

		.poster-scan-title {
			font-family: MiSans;
			font-size: 36rpx;
			color: $themeColor;
			text-align: center;
		}

		.poster-qr {
			display: block;
			width: 148px;
			height: 148px;
			margin: 24rpx auto 28rpx;
		}

		.poster-field {
			box-sizing: border-box;
			min-height: 110rpx;
			margin-top: 22rpx;
			padding: 16rpx;
			background: #f6f7f9;
			border-radius: 12rpx;
		}

		.field-label {
			font-family: Arial, sans-serif;
			font-size: 24rpx;
			line-height: 32rpx;
			color: #747474;
		}

		.field-value {
			margin-top: 4rpx;
			font-family: Arial, sans-serif;
			font-size: 30rpx;
			font-weight: 600;
			line-height: 38rpx;
			color: #000000;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.field-value.link {
			font-size: 27rpx;
		}
	}

	.poster-close {
		position: relative;
		width: 80rpx;
		height: 80rpx;
		margin: 36rpx auto 0;
		border-radius: 50%;
		background: #fff;
	}

	.poster-close view {
		position: absolute;
		top: 38rpx;
		left: 17rpx;
		width: 46rpx;
		height: 5rpx;
		background: #333;
		border-radius: 4rpx;
	}

	.poster-close view:first-child {
		transform: rotate(45deg);
	}

	.poster-close view:last-child {
		transform: rotate(-45deg);
	}
}

.team_expansion_container {
	min-height: 100vh;
	box-sizing: border-box;
	padding: 70rpx 24rpx 80rpx;
	background: linear-gradient(to bottom, $themeColor 0rpx, $themeColor 442rpx, #f1f4ff 442rpx, #f1f4ff 1334rpx);
	display: flex;
	flex-direction: column;
	align-items: center;

	.hero-copy {
		width: 702rpx;
		padding: 0 0 24rpx;
		color: #ffffff;
		text-align: center;

		.hero-title {
			font-family: Arial, sans-serif;
			font-style: italic;
			font-weight: 700;
			font-size: 52rpx;
			line-height: 68rpx;
		}

		.hero-subtitle {
			margin-top: 22rpx;
			font-family: Arial, sans-serif;
			font-size: 30rpx;
			line-height: 40rpx;
		}
	}

	.qr-section {
		margin: 24rpx auto 42rpx;
		display: flex;
		justify-content: center;
		width: 148px;
		height: 148px;
		align-items: center;

		.qr-canvas {
			width: 148px;
			height: 148px;
		}
	}

	.invite-card {
		box-sizing: border-box;
		width: 702rpx;
		padding: 48rpx 24rpx 54rpx;
		background: #ffffff;
		border-radius: 30rpx;

		.scan-title {
			font-family: Arial, sans-serif;
			font-size: 38rpx;
			font-weight: 600;
			line-height: 50rpx;
			color: $themeColor;
			text-align: center;
		}

		.invite-info {
			box-sizing: border-box;
			width: 670rpx;
			min-height: 110rpx;
			padding: 18rpx 18rpx 16rpx;
			margin-top: 24rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			background: #f6f7f9;
			border-radius: 12rpx;

			.info-copy {
				min-width: 0;
				flex: 1;

				.info-label {
					font-family: Arial, sans-serif;
					font-size: 24rpx;
					line-height: 32rpx;
					color: #747474;
				}

				.info-value {
					margin-top: 4rpx;
					font-family: Arial, sans-serif;
					font-size: 30rpx;
					font-weight: 600;
					line-height: 38rpx;
					color: #000000;

					&.link-value {
						font-size: 28rpx;
					}
				}
			}

			.copy-action {
				flex: 0 0 136rpx;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				gap: 20rpx;
				font-family: Arial, sans-serif;
				font-size: 32rpx;
				font-weight: 600;
				line-height: 40rpx;
				color: $themeColor;

				.copy-icon {
					position: relative;
					box-sizing: border-box;
					width: 32rpx;
					height: 36rpx;
					border: 5rpx solid $themeColor;
					border-radius: 5rpx;

					&::before {
						position: absolute;
						content: '';
						box-sizing: border-box;
						width: 32rpx;
						height: 36rpx;
						top: -12rpx;
						left: 8rpx;
						border: 5rpx solid $themeColor;
						border-radius: 5rpx;
						background-color: #f6f7f9;
					}
				}
			}
		}

		.btn-group {
			margin-top: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.qr_btn {
				width: 324rpx;
				height: 70rpx;
				margin: 0;
				padding: 0;
				border-radius: 10rpx;
				font-family: Arial, sans-serif;
				font-weight: 600;
				font-size: 30rpx;
				line-height: 70rpx;
				text-align: center;
				border: 0;

				&::after {
					border: 0;
				}

				&.save-btn {
					background: #ffd400;
					color: #000000;
				}

				&.share-btn {
					background: $themeColor;
					color: #ffffff;
				}
			}
		}
	}
}

.prompt_pop_page {
	width: 570rpx;
	background: #FFFFFF;
	border-radius: 28rpx;
	padding: 40rpx 54rpx 28rpx 54rpx;

	.prompt_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.prompt_pop_taps {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.prompt_pop_bottom {
		display: flex;
		margin-top: 54rpx;

		.prompt_confirm_btn {
			width: 212rpx;
			height: 72rpx;
			background: $themeColor;
			box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
			border-radius: 16rpx;
			font-family: "DINPro-Black", sans-serif;
			font-family: DINPro, DINPro;
			font-weight: 500;
			font-size: 32rpx;
			color: #FFFFFF;
			line-height: 72rpx;
			text-align: center;
			font-style: normal;
		}
	}
}
</style>
