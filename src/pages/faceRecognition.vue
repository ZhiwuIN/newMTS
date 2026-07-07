<template>
	<customnavbar title="Face Liveness">
		<view class="page">
			<view class="hero">
				<view class="hero-title">{{ currentStep.title }}</view>
				<view class="hero-desc">{{ currentStep.desc }}</view>
			</view>

			<!-- #ifdef H5 || APP-PLUS -->
			<view class="camera-shell">
				<video
					ref="videoRef"
					class="camera-video"
					autoplay
					playsinline
					muted
				></video>
				<canvas ref="canvasRef" class="camera-overlay"></canvas>
				<view class="scan-ring"></view>
			</view>

			<view class="progress-card">
				<view class="progress-row" v-for="(step, index) in steps" :key="step.key">
					<view class="progress-index" :class="{ done: step.done, active: activeStepIndex === index }">
						{{ index + 1 }}
					</view>
					<view class="progress-text">
						<view class="progress-title">{{ step.title }}</view>
						<view class="progress-desc">{{ step.done ? '已完成' : '等待执行' }}</view>
					</view>
				</view>
			</view>

			<view class="tips-card">
				<view class="tips-title">状态</view>
				<view class="status-text">{{ statusText }}</view>
				<view class="permission-text">首次进入会申请摄像头权限，仅用于本地活体动作检测。</view>
			</view>

			<view class="action-bar">
				<button class="primary-btn" @click="startDetection" :disabled="isStarting">
					{{ started ? '重新开始' : '开始检测' }}
				</button>
			</view>
			<!-- #endif -->

			<!-- #ifndef H5 || APP-PLUS -->
			<view class="tips-card">
				<view class="tips-title">当前平台暂未接入</view>
				<view class="status-text">这个基础版只先接入 H5 和 Android App WebView 场景。</view>
			</view>
			<!-- #endif -->
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'

const MODEL_ASSET_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

function createSteps() {
	return [
		{ key: 'blink', title: '请眨眼', desc: '自然眨眼 1 次', done: false },
		{ key: 'mouth', title: '请张嘴', desc: '嘴巴张开后再闭合', done: false },
		{ key: 'turnRight', title: '请向右转头', desc: '头部缓慢转向右侧', done: false }
	]
}

export default {
	components: {
		customnavbar
	},
	data() {
		return {
			started: false,
			isStarting: false,
			statusText: '点击开始检测后，将申请摄像头权限。',
			steps: createSteps(),
			activeStepIndex: 0,
			stream: null,
			faceLandmarker: null,
			filesetResolver: null,
			animationFrameId: null,
			lastVideoTime: -1,
			blinkPrimed: false,
			mouthPrimed: false,
			headTurnFrames: 0
		}
	},
	computed: {
		currentStep() {
			return this.steps[this.activeStepIndex] || {
				title: '检测完成',
				desc: '活体动作已通过'
			}
		}
	},
	methods: {
		async startDetection() {
			if (this.isStarting) {
				return
			}
			this.resetState()
			this.isStarting = true
			this.statusText = '正在初始化摄像头和模型...'
			try {
				await this.prepareModel()
				await this.openCamera()
				this.started = true
				this.statusText = '请保持正脸在取景框内，准备开始。'
				this.startLoop()
			} catch (error) {
				console.error('face liveness start failed', error)
				this.statusText = error && error.message ? error.message : '启动失败，请检查权限或 HTTPS 配置。'
				this.stopCamera()
			} finally {
				this.isStarting = false
			}
		},
		resetState() {
			this.stopLoop()
			this.stopCamera()
			this.steps = createSteps()
			this.activeStepIndex = 0
			this.blinkPrimed = false
			this.mouthPrimed = false
			this.headTurnFrames = 0
			this.lastVideoTime = -1
		},
		async prepareModel() {
			if (this.faceLandmarker) {
				return
			}
			if (typeof window === 'undefined') {
				throw new Error('当前环境不支持浏览器摄像头能力。')
			}

			const vision = await import('@mediapipe/tasks-vision')
			const { FilesetResolver, FaceLandmarker } = vision
			this.filesetResolver = await FilesetResolver.forVisionTasks(MODEL_ASSET_ROOT)
			this.faceLandmarker = await FaceLandmarker.createFromOptions(this.filesetResolver, {
				baseOptions: {
					modelAssetPath: MODEL_PATH
				},
				outputFaceBlendshapes: true,
				outputFacialTransformationMatrixes: true,
				runningMode: 'VIDEO',
				numFaces: 1
			})
		},
		async openCamera() {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error('当前浏览器不支持摄像头采集。')
			}

			const video = this.$refs.videoRef
			if (!video) {
				throw new Error('视频容器初始化失败。')
			}

			const stream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					facingMode: 'user',
					width: { ideal: 720 },
					height: { ideal: 1280 }
				}
			})

			video.srcObject = stream
			this.stream = stream

			await new Promise((resolve, reject) => {
				video.onloadedmetadata = async () => {
					try {
						await video.play()
						this.syncCanvasSize()
						resolve()
					} catch (error) {
						reject(error)
					}
				}
			})
		},
		syncCanvasSize() {
			const video = this.$refs.videoRef
			const canvas = this.$refs.canvasRef
			if (!video || !canvas) {
				return
			}
			canvas.width = video.videoWidth || 720
			canvas.height = video.videoHeight || 1280
		},
		startLoop() {
			this.stopLoop()
			const tick = () => {
				this.detectFrame()
				this.animationFrameId = requestAnimationFrame(tick)
			}
			tick()
		},
		stopLoop() {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId)
				this.animationFrameId = null
			}
		},
		detectFrame() {
			const video = this.$refs.videoRef
			const canvas = this.$refs.canvasRef
			if (!video || !canvas || !this.faceLandmarker || video.readyState < 2) {
				return
			}
			if (video.currentTime === this.lastVideoTime) {
				return
			}
			this.lastVideoTime = video.currentTime

			const result = this.faceLandmarker.detectForVideo(video, performance.now())
			const context = canvas.getContext('2d')
			context.clearRect(0, 0, canvas.width, canvas.height)

			if (!result.faceLandmarks || !result.faceLandmarks.length) {
				this.statusText = '未检测到人脸，请把脸放到取景框中央。'
				return
			}

			const landmarks = result.faceLandmarks[0]
			const blendShapeList = result.faceBlendshapes && result.faceBlendshapes[0] ? result.faceBlendshapes[0].categories : []
			this.drawOutline(context, landmarks, canvas.width, canvas.height)
			this.handleStep(landmarks, blendShapeList)
		},
		handleStep(landmarks, blendShapeList) {
			const step = this.steps[this.activeStepIndex]
			if (!step) {
				this.statusText = '活体检测已完成。'
				return
			}

			if (step.key === 'blink') {
				const blinkScore = Math.max(this.getBlendshapeScore(blendShapeList, 'eyeBlinkLeft'), this.getBlendshapeScore(blendShapeList, 'eyeBlinkRight'))
				this.statusText = `请眨眼，当前眨眼强度 ${blinkScore.toFixed(2)}`
				if (blinkScore > 0.55) {
					this.blinkPrimed = true
				}
				if (this.blinkPrimed && blinkScore < 0.2) {
					this.completeCurrentStep('眨眼完成，请继续张嘴。')
				}
				return
			}

			if (step.key === 'mouth') {
				const jawOpen = this.getBlendshapeScore(blendShapeList, 'jawOpen')
				this.statusText = `请张嘴，当前张嘴强度 ${jawOpen.toFixed(2)}`
				if (jawOpen > 0.3) {
					this.mouthPrimed = true
				}
				if (this.mouthPrimed && jawOpen < 0.1) {
					this.completeCurrentStep('张嘴完成，请向右转头。')
				}
				return
			}

			if (step.key === 'turnRight') {
				const turnRatio = this.getTurnRatio(landmarks)
				this.statusText = `请向右转头，当前转头值 ${turnRatio.toFixed(2)}`
				if (turnRatio > 0.12) {
					this.headTurnFrames += 1
				} else {
					this.headTurnFrames = 0
				}
				if (this.headTurnFrames >= 6) {
					this.completeCurrentStep('已完成全部活体动作。')
				}
			}
		},
		getBlendshapeScore(blendShapeList, categoryName) {
			const matched = blendShapeList.find(item => item.categoryName === categoryName)
			return matched ? matched.score : 0
		},
		getTurnRatio(landmarks) {
			const nose = landmarks[1]
			const leftFace = landmarks[234]
			const rightFace = landmarks[454]
			const faceCenter = (leftFace.x + rightFace.x) / 2
			const faceWidth = Math.max(rightFace.x - leftFace.x, 0.0001)
			return (faceCenter - nose.x) / faceWidth
		},
		completeCurrentStep(message) {
			if (!this.steps[this.activeStepIndex]) {
				return
			}
			this.steps[this.activeStepIndex].done = true
			this.activeStepIndex += 1
			this.blinkPrimed = false
			this.mouthPrimed = false
			this.headTurnFrames = 0
			this.statusText = message

			if (this.activeStepIndex >= this.steps.length) {
				this.stopLoop()
				this.statusText = '活体检测通过，可以进入下一步业务流程。'
			}
		},
		drawOutline(context, landmarks, width, height) {
			context.save()
			context.strokeStyle = 'rgba(130, 98, 255, 0.95)'
			context.lineWidth = 2
			context.beginPath()
			landmarks.forEach((point, index) => {
				const x = point.x * width
				const y = point.y * height
				if (index === 0) {
					context.moveTo(x, y)
				} else {
					context.lineTo(x, y)
				}
			})
			context.stroke()
			context.restore()
		},
		stopCamera() {
			if (this.stream) {
				this.stream.getTracks().forEach(track => track.stop())
				this.stream = null
			}
			const video = this.$refs.videoRef
			if (video) {
				video.srcObject = null
			}
		}
	},
	beforeUnmount() {
		this.stopLoop()
		this.stopCamera()
	},
	onHide() {
		this.stopLoop()
		this.stopCamera()
	},
	onUnload() {
		this.stopLoop()
		this.stopCamera()
	}
}
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	padding: 32rpx 28rpx 56rpx;
	background:
		radial-gradient(circle at top, rgba(133, 118, 255, 0.14), transparent 34%),
		linear-gradient(180deg, #fbfbff 0%, #f3f5ff 100%);
}

.hero {
	padding: 36rpx 12rpx 28rpx;
	text-align: center;
}

.hero-title {
	color: #6356c8;
	font-size: 40rpx;
	font-weight: 600;
}

.hero-desc {
	margin-top: 12rpx;
	color: #7d7f91;
	font-size: 26rpx;
}

.camera-shell {
	position: relative;
	width: 560rpx;
	height: 560rpx;
	margin: 0 auto;
	border-radius: 50%;
	overflow: hidden;
	background: #111;
	box-shadow: 0 28rpx 80rpx rgba(79, 71, 153, 0.18);
}

.camera-video,
.camera-overlay,
.scan-ring {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
}

.camera-video {
	object-fit: cover;
	transform: scaleX(-1);
}

.camera-overlay {
	pointer-events: none;
}

.scan-ring {
	border: 4rpx solid rgba(255, 255, 255, 0.9);
	border-radius: 50%;
	box-sizing: border-box;
	box-shadow: inset 0 0 0 18rpx rgba(255, 255, 255, 0.18);
	pointer-events: none;
}

.progress-card,
.tips-card {
	margin-top: 36rpx;
	padding: 28rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.82);
	box-shadow: 0 20rpx 60rpx rgba(83, 87, 126, 0.08);
	backdrop-filter: blur(10px);
}

.progress-row {
	display: flex;
	align-items: center;
}

.progress-row + .progress-row {
	margin-top: 22rpx;
}

.progress-index {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: #ece8ff;
	color: #776dcf;
	font-size: 26rpx;
	font-weight: 600;
}

.progress-index.active {
	background: #776dcf;
	color: #fff;
}

.progress-index.done {
	background: #1fa971;
	color: #fff;
}

.progress-text {
	margin-left: 20rpx;
}

.progress-title,
.tips-title {
	color: #2a2d3a;
	font-size: 28rpx;
	font-weight: 600;
}

.progress-desc,
.permission-text {
	margin-top: 8rpx;
	color: #8c8f9e;
	font-size: 24rpx;
	line-height: 1.6;
}

.status-text {
	margin-top: 12rpx;
	color: #4c4f61;
	font-size: 26rpx;
	line-height: 1.7;
}

.action-bar {
	margin-top: 44rpx;
}

.primary-btn {
	height: 92rpx;
	line-height: 92rpx;
	border: none;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #7a6bff 0%, #6154d8 100%);
	color: #fff;
	font-size: 30rpx;
	font-weight: 600;
	box-shadow: 0 18rpx 50rpx rgba(100, 84, 216, 0.24);
}

.primary-btn[disabled] {
	opacity: 0.7;
}
</style>
