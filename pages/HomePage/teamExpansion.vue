<template>
	<customnavbar backgroundStr="url('/static/teamExpansion_bg.jpg') top left/100%  no-repeat" @mtop='mtop'
		:whiteTitle="true">
		<view class="team_expansion_container" :style="topStyle">
			<!-- 二维码区域 -->

			<view class="qr-section">
				<view class="qr-section-box">
					<canvas v-show="!this.isRestrictAccess" canvas-id="qrcode"
						style="width: 149px; height:149px;"></canvas>
				</view>
			</view>

			<view class="qr_t1">
				<text v-show="!this.isRestrictAccess">{{$t('qrpage.code')+'：'+code}}</text>
			</view>
			<!-- 链接文字区域 -->
			<view class="qr_t2">
				<text v-show="!this.isRestrictAccess">{{qrcodeUrl + '?InvitationCode=' + code}}</text>
			</view>

			<!-- 按钮区域 -->
			<view class="btn-group" v-show="!this.isRestrictAccess">
				<button class="qr_btn" @click="generatePoster">{{$t('qrpage.GeneratePoster')}}</button>
				<button class="qr_btn" @click="copyLink">{{$t('qrpage.CopyLink')}}</button>
			</view>

			<!-- 海报区域 -->
			<view class="mask" v-if="showPoster" @click="showPoster = false"></view>
			<view class="poster-container" v-if="showPoster">
				<view class="poster" id="poster">
					<image :src="posterImage" mode="aspectFill" class="posterImage"></image>
					<view class="main">
						<view class="qr-section2">
							<view class="qr-section-box2">
								<canvas canvas-id="qrcode2" style="width: 100rpx;height: 100rpx;"></canvas>
							</view>
						</view>
						<view class="text">
							<view>{{$t('home.InvitationCode')}}</view>
							<view class="invitationCode">{{ code }}</view>
						</view>
					</view>
				</view>
				<view class="btn" @click="downloadPoster">
					{{ $t('home.Download') }}
				</view>
			</view>
		</view>
	</customnavbar>
	<canvas canvas-id="finalPosterCanvas" style="width: 375px; height: 600px; position: fixed; top: -9999px;"></canvas>
	<uni-popup ref="promptpopup" type="center" :mask-click="false" >
		<view class="prompt_pop_page">
			<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
			<view class="prompt_pop_taps" >{{this.$t("withdrawal.restrictedAccess")}}</view>
			<view class="prompt_pop_bottom">
				<button class="prompt_confirm_btn" @click="prompt_confirm">{{$t('pay.yes')}}</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	import UQRCode from '../../uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js';
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		userInfoApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				showPoster: false,
				topStyle: "",
				pageH: 0,
				code: "",
				// qrcodeUrl: 'http://localhost:5173/#/',
				qrcodeUrl: '',
				userInfo: {},
				posterImage: '',
				isRestrictAccess: false,
			}
		},
		onShow() {
			userInfoApi().then((res) => {
				this.userInfo = res.data
				if (this.userInfo.levelCode == '0') {
					this.$showMessage('warning', this.$t('实习生没有权限'))
					uni.switchTab({
						url: '/pages/HomePage/index'
					})
					return
				}
				if  (this.userInfo.housekeeper == 1) {
					this.isRestrictAccess = true 
					this.$refs.promptpopup.open()
				}
				this.qrcodeUrl = uni.getStorageSync('settings').regUrl + '/#/'
				this.code = res.data.invitationCode;
				uni.setStorageSync('userInfo', res.data)
				this.generateQrCode()
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		onReady() {
			this.posterImage = uni.getLocale() == 'fr' ? '/static/posterFR.jpg' : '/static/posterEN.jpg';
		},
		methods: {
			prompt_confirm(){
				this.$refs.promptpopup.close()
				uni.navigateBack()
			},
			generateQrCode() {
				// 获取uQRCode实例
				var qr = new UQRCode();
				// 设置二维码内容
				qr.data = this.qrcodeUrl + '?InvitationCode=' + this.code;
				// 设置二维码大小，必须与canvas设置的宽高一致
				qr.size = 149;
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
				qr.size = 58;
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
					data: this.qrcodeUrl + '?InvitationCode=' + this.code,
					success: () => {
						this.$showMessage('success', this.$t('home.copied'));
					}
				})
			},
			mtop(e) {
				uni.getSystemInfo({
					success: (res) => {
						this.pageH = res.windowHeight * 2
						// #ifdef H5
						this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) +
							"rpx;height:calc(100vh - " + (e + 88) + "rpx)"
						// #endif
						// #ifdef APP-PLUS
						this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + e +
							"rpx;height:calc(100vh - " + e + "rpx)"
						// #endif
					}
				});
			},
			// 下载海报方法
			async downloadPoster() {
				try {
					// 显示加载中
					uni.showLoading({
						title: this.$t("home.poster"),
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
					ctx.drawImage('/static/posterEN.jpg', 0, 0, canvasWidth, canvasHeight);
					ctx.restore();

					// 5. 绘制二维码（位置需要根据实际布局调整）
					const qrSize = 64; // 与你的样式一致
					const qrX = 90; // 左间距
					const qrY = canvasHeight - 44 - 54; // 底部间距（根据你的样式调整）

					ctx.save();
					ctx.drawImage(qrCodeRes.tempFilePath, qrX, qrY, qrSize, qrSize);
					ctx.restore();

					// 6. 绘制邀请码文本（位置需要根据实际布局调整）
					ctx.save();
					ctx.setFontSize(18);
					ctx.setFillStyle('#000000');
					ctx.fillText('Invitation Code', qrX + qrSize + 20, qrY + 20);

					ctx.setFontSize(19);
					ctx.setFillStyle('#000000');
					ctx.fillText(this.code, qrX + qrSize + 20, qrY + 60);
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
						title: this.$t("home.PosterSS"),
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
						title: this.$t("home.PosterSS"),
						icon: 'success'
					});
					// #endif

					this.showPoster = false; // 关闭海报预览

					// #endif
				} catch (error) {
					console.error('海报下载失败:', error);
					uni.showToast({
						title: this.$t("home.PosterDF"),
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			}
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
		opacity: 0.6;
		z-index: 9999;
	}

	.poster-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 650rpx;
		height: 1040rpx;
		z-index: 10000;

		.btn {
			width: 520rpx;
			height: 96rpx;
			margin: 0 auto;
			margin-top: 38rpx;
			background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
			border-radius: 24rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 600;
			font-size: 36rpx;
			color: #FFFFFF;
			line-height: 96rpx;
			text-align: center;
			font-style: normal;
			text-transform: none;
		}
	}

	.poster {
		position: relative;
		width: 100%;
		height: 100%;

		.main {
			position: absolute;
			bottom: 54rpx;
			left: 90rpx;
			display: flex;
			gap: 32rpx;

			.text {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				height: 120rpx;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 36rpx;
				color: #000000;
				text-align: left;
				font-style: normal;

				.invitationCode {
					display: flex;
					align-items: center;
					padding-left: 20rpx;
					width: 330rpx;
					height: 62rpx;
					background: rgba(255, 255, 255, 0.5);
					border-radius: 12rpx;
					font-family: DINPro, DINPro;
					font-weight: 600;
					font-size: 38rpx;
					color: #000000;
					font-style: normal;
				}
			}
		}
	}

	.posterImage {
		width: 100%;
		height: 100%;
		display: block;
	}

	.team_expansion_container {
		height: 100%;
		/* padding: 20px; */
		display: flex;
		flex-direction: column;
		align-items: center;
		background: url("/static/teamExpansion_bg.jpg") top left/100% no-repeat;
	}

	.qr-section {
		margin: 30px 0;
		display: flex;
		justify-content: center;
		width: 338rpx;
		height: 338rpx;
		background: #FFFFFF;
		border-radius: 14rpx;
		align-items: center;
	}

	.qr-section2 {
		display: flex;
		justify-content: center;
		width: 120rpx;
		height: 120rpx;
		background: #FFFFFF;
		border-radius: 14rpx;
		align-items: center;
	}

	.qr-section-box {
		width: 149px;
		height: 149px;
	}

	.qr-section-box2 {
		width: 100rpx;
		height: 100rpx;
	}

	.btn-group {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.qr_btn {
		width: 250rpx;
		height: 72rpx;
		background: #FFFFFF;
		border-radius: 36rpx;
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 28rpx;
		color: $themeColor;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}

	.qr_t1 {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #FFFFFF;
		line-height: 34rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.qr_t2 {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 26rpx;
		color: #FFFFFF;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 26rpx;
		margin-bottom: 74rpx;
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
		}
		
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
</style>