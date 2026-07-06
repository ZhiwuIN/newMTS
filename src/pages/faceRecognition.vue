<template>
	<customnavbar title="Face verification">
		<view class="face-page">
			<view class="tip-title">{{ currentAction.title }}</view>
			<view class="tip-subtitle">{{ statusText }}</view>

			<view class="camera-wrap">
				<view ref="videoHost" class="camera-video-host"></view>
				<view class="face-mask"></view>
				<view class="scan-ring" :class="{ active: detecting }"></view>
			</view>

			<view class="progress-row">
				<view
					v-for="(item, index) in actions"
					:key="item.type"
					class="progress-dot"
					:class="{ done: index < actionIndex, current: index === actionIndex }"
				></view>
			</view>

			<view v-if="cameraError" class="error-box">{{ cameraError }}</view>

			<button v-if="!stream" class="start-btn" @click="restartCamera">
				{{ cameraError ? '重新打开摄像头' : '开始检测' }}
			</button>

			<canvas ref="canvas" canvas-id="faceCanvas" class="hidden-canvas"></canvas>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'

	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				actions: [
					{ type: 'blink', title: '请眨眼', region: 'eyes', threshold: 18, hold: 2 },
					{ type: 'turnRight', title: '向右缓慢转头', region: 'side', threshold: 12, hold: 5 },
					{ type: 'openMouth', title: '请张嘴', region: 'mouth', threshold: 16, hold: 3 }
				],
				actionIndex: 0,
				videoEl: null,
				stream: null,
				detecting: false,
				cameraError: '',
				statusText: '请点击开始并允许相机权限',
				lastFrame: null,
				stableFrame: null,
				passCount: 0,
				frameTimer: null,
				canvasContext: null,
				isCompleted: false,
				cameraTimer: null
			}
		},
		computed: {
			currentAction() {
				return this.actions[this.actionIndex] || { title: '验证完成' }
			}
		},
		methods: {
			createNativeVideo() {
				// H5 下使用原生 video 承载摄像头流。
				if (this.videoEl || !this.$refs.videoHost || typeof document === 'undefined') return

				const video = document.createElement('video')
				video.setAttribute('autoplay', 'autoplay')
				video.setAttribute('muted', 'muted')
				video.setAttribute('playsinline', 'true')
				video.setAttribute('webkit-playsinline', 'true')
				video.muted = true
				video.autoplay = true
				video.playsInline = true
				video.className = 'camera-video'
				this.$refs.videoHost.appendChild(video)
				this.videoEl = video
			},
			async startCamera() {
				this.cameraError = ''
				this.statusText = '正在打开摄像头...'
				this.createNativeVideo()

				if (typeof window === 'undefined' || typeof navigator === 'undefined') {
					this.cameraError = '当前环境不支持网页摄像头'
					this.statusText = '摄像头能力不可用'
					return
				}

				if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
					this.cameraError = '手机浏览器必须使用 HTTPS 地址才能打开摄像头，HTTP 地址会被系统禁止'
					this.statusText = '请使用 HTTPS 访问'
					return
				}

				const mediaDevices = navigator.mediaDevices
				if (!mediaDevices || !mediaDevices.getUserMedia) {
					this.cameraError = '当前浏览器不支持网页摄像头能力，请换 Safari/Chrome，或在 App 内打开'
					this.statusText = '摄像头能力不可用'
					return
				}

				this.cameraTimer = setTimeout(() => {
					if (!this.stream) {
						this.cameraError = '摄像头请求没有响应。请检查浏览器是否已禁止相机权限，或尝试点击浏览器地址栏左侧的权限设置重新允许'
						this.statusText = '摄像头打开超时'
					}
				}, 10000)

				try {
					const stream = await mediaDevices.getUserMedia({
						audio: false,
						video: {
							facingMode: 'user',
							width: { ideal: 640 },
							height: { ideal: 640 }
						}
					})

					clearTimeout(this.cameraTimer)
					this.cameraTimer = null
					this.stream = stream
					this.videoEl.srcObject = stream
					await this.waitVideoReady()
					await this.videoEl.play()
					this.detecting = true
					this.statusText = '按提示完成动作'
					this.prepareCanvas()
					this.startDetectLoop()
				} catch (error) {
					clearTimeout(this.cameraTimer)
					this.cameraTimer = null
					console.log('camera error', error)
					this.stopCamera()
					this.cameraError = this.getCameraErrorText(error)
					this.statusText = '摄像头不可用'
				}
			},
			waitVideoReady() {
				if (this.videoEl.readyState >= 1) return Promise.resolve()

				return new Promise((resolve) => {
					const done = () => {
						clearTimeout(timer)
						this.videoEl.removeEventListener('loadedmetadata', done)
						resolve()
					}
					const timer = setTimeout(done, 3000)
					this.videoEl.addEventListener('loadedmetadata', done, { once: true })
				})
			},
			getCameraErrorText(error) {
				const name = error && error.name
				if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
					return '相机权限被拒绝，请在浏览器设置中允许相机权限后重试'
				}
				if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
					return '没有找到可用摄像头'
				}
				if (name === 'NotReadableError' || name === 'TrackStartError') {
					return '摄像头被其他应用占用，请关闭后重试'
				}
				if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
					return '当前摄像头不支持要求的参数，请换设备或浏览器重试'
				}
				return '无法打开摄像头，请确认使用 HTTPS 并允许相机权限'
			},
			prepareCanvas() {
				const canvas = this.$refs.canvas
				canvas.width = 160
				canvas.height = 160
				this.canvasContext = canvas.getContext('2d', { willReadFrequently: true })
			},
			startDetectLoop() {
				this.stopDetectLoop()
				this.frameTimer = setInterval(() => {
					this.detectAction()
				}, 120)
			},
			stopDetectLoop() {
				if (this.frameTimer) {
					clearInterval(this.frameTimer)
					this.frameTimer = null
				}
			},
			detectAction() {
				if (!this.detecting || this.isCompleted || !this.canvasContext) return
				if (!this.videoEl || this.videoEl.readyState < 2) return

				const ctx = this.canvasContext
				ctx.save()
				ctx.scale(-1, 1)
				ctx.drawImage(this.videoEl, -160, 0, 160, 160)
				ctx.restore()

				const frame = ctx.getImageData(0, 0, 160, 160).data
				if (!this.lastFrame) {
					this.lastFrame = new Uint8ClampedArray(frame)
					this.stableFrame = new Uint8ClampedArray(frame)
					return
				}

				const score = this.getMotionScore(frame, this.currentAction.region)
				const stableScore = this.getStableScore(frame, this.currentAction.region)
				const passed = this.isActionPassed(score, stableScore)

				if (passed) {
					this.passCount += 1
					this.statusText = '动作已识别，请保持一会儿'
				} else {
					this.passCount = Math.max(0, this.passCount - 1)
					this.statusText = '按提示完成动作'
				}

				if (this.passCount >= this.currentAction.hold) {
					this.nextAction()
				}

				this.lastFrame = new Uint8ClampedArray(frame)
				if (stableScore < 6) {
					this.stableFrame = new Uint8ClampedArray(frame)
				}
			},
			isActionPassed(score, stableScore) {
				const action = this.currentAction
				if (action.type === 'turnRight') {
					return stableScore > action.threshold
				}
				return score > action.threshold || stableScore > action.threshold + 8
			},
			getMotionScore(frame, region) {
				return this.getDiffScore(frame, this.lastFrame, this.getRegion(region))
			},
			getStableScore(frame, region) {
				return this.getDiffScore(frame, this.stableFrame, this.getRegion(region))
			},
			getDiffScore(frame, target, region) {
				if (!target || !region) return 0

				let total = 0
				let count = 0
				for (let y = region.y; y < region.y + region.h; y += 4) {
					for (let x = region.x; x < region.x + region.w; x += 4) {
						const index = (y * 160 + x) * 4
						const light = (frame[index] + frame[index + 1] + frame[index + 2]) / 3
						const lastLight = (target[index] + target[index + 1] + target[index + 2]) / 3
						total += Math.abs(light - lastLight)
						count += 1
					}
				}
				return count ? total / count : 0
			},
			getRegion(region) {
				const regions = {
					eyes: { x: 38, y: 50, w: 84, h: 32 },
					mouth: { x: 50, y: 98, w: 60, h: 34 },
					side: { x: 18, y: 42, w: 124, h: 82 }
				}
				return regions[region]
			},
			nextAction() {
				this.passCount = 0
				this.lastFrame = null
				this.stableFrame = null

				if (this.actionIndex < this.actions.length - 1) {
					this.actionIndex += 1
					this.statusText = '很好，继续下一个动作'
					return
				}

				this.isCompleted = true
				this.detecting = false
				this.statusText = '验证完成'
				this.stopCamera()
				this.onLivenessComplete()
			},
			onLivenessComplete() {
				this.$showMessage && this.$showMessage('success', '活体检测完成')
				console.log('liveness complete')
			},
			restartCamera() {
				this.stopCamera()
				this.actionIndex = 0
				this.passCount = 0
				this.lastFrame = null
				this.stableFrame = null
				this.isCompleted = false
				this.$nextTick(() => {
					this.startCamera()
				})
			},
			stopCamera() {
				this.stopDetectLoop()
				this.detecting = false
				if (this.cameraTimer) {
					clearTimeout(this.cameraTimer)
					this.cameraTimer = null
				}
				if (this.stream) {
					this.stream.getTracks().forEach(track => track.stop())
					this.stream = null
				}
				if (this.videoEl) {
					this.videoEl.srcObject = null
				}
			}
		},
		mounted() {
			this.createNativeVideo()
		},
		onUnload() {
			this.stopCamera()
		},
		beforeUnmount() {
			this.stopCamera()
		}
	}
</script>

<style scoped lang="scss">
	.face-page {
		min-height: calc(100vh - 88rpx);
		background: #ffffff;
		padding: 28rpx 36rpx 60rpx;
		box-sizing: border-box;
		text-align: center;
	}

	.tip-title {
		font-weight: 700;
		font-size: 38rpx;
		color: #6b55b6;
		line-height: 54rpx;
		margin-top: 20rpx;
	}

	.tip-subtitle {
		font-size: 26rpx;
		color: #777777;
		line-height: 38rpx;
		margin-top: 12rpx;
		min-height: 38rpx;
	}

	.camera-wrap {
		position: relative;
		width: 520rpx;
		height: 520rpx;
		margin: 110rpx auto 0;
		border-radius: 50%;
		overflow: hidden;
		background: #f4f4f4;
	}

	.camera-video-host {
		width: 100%;
		height: 100%;
	}

	.camera-video-host ::v-deep .camera-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scaleX(-1);
	}

	.face-mask {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		box-shadow: inset 0 0 0 8rpx rgba(255, 255, 255, 0.92);
		pointer-events: none;
	}

	.scan-ring {
		position: absolute;
		inset: 4rpx;
		border-radius: 50%;
		border: 4rpx dashed #777777;
		pointer-events: none;
	}

	.scan-ring.active {
		animation: rotateRing 5s linear infinite;
	}

	.progress-row {
		display: flex;
		justify-content: center;
		gap: 18rpx;
		margin-top: 64rpx;
	}

	.progress-dot {
		width: 18rpx;
		height: 18rpx;
		border-radius: 50%;
		background: #d8d8d8;
	}

	.progress-dot.current {
		background: #6b55b6;
		transform: scale(1.22);
	}

	.progress-dot.done {
		background: #2dbb73;
	}

	.error-box {
		width: 620rpx;
		margin: 58rpx auto 0;
		padding: 24rpx;
		box-sizing: border-box;
		border-radius: 16rpx;
		background: #fff3f0;
		color: #c65343;
		font-size: 28rpx;
		line-height: 40rpx;
	}

	.start-btn {
		width: 360rpx;
		height: 82rpx;
		line-height: 82rpx;
		margin-top: 36rpx;
		border-radius: 41rpx;
		background: #6b55b6;
		color: #ffffff;
		font-size: 30rpx;
	}

	.hidden-canvas {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 160px;
		height: 160px;
		opacity: 0;
		pointer-events: none;
	}

	@keyframes rotateRing {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>
