<template>
	<view class="pdf-viewer" v-if="!noData">
		<!-- H5端使用PDF.js -->
		<template v-if="isH5">
			<view class="pdf-container">
				<!-- 使用标准canvas标签 -->
				<canvas 
					id="pdfCanvas" 
					class="pdf-canvas"
				></canvas>
				<view class="pdf-controls">
					<button @click="prevPage" :disabled="currentPage <= 1 || loading">上一页</button>
					<text>{{ currentPage }} / {{ totalPages }}</text>
					<button @click="nextPage" :disabled="currentPage >= totalPages || loading">下一页</button>
				</view>
			</view>
		</template>

		<!-- 安卓APP端使用web-view -->
		<template v-else-if="isApp">
			<web-view :src="pdfUrl" class="web-view" :style="topStyle"></web-view>
		</template>

		<!-- 加载提示 -->
		<view class="loading" v-if="loading">
			<view class="loading-spinner"></view>
			<text>{{ $t('loading.btn') }}...</text>
		</view>
		
		<!-- 错误提示 -->
		<view class="error" v-if="errors">
			<text>{{ errorMsg }}</text>
			<button @click="retryLoad">{{ $t('重新加载') }}</button>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		pdfUrl: {
			type: String,
			required: true,
			default: ''
		},
		mtopHeight: {
			type: Number,
			required: true,
			default: 0
		}
	},
	data() {
		return {
			isH5: false,
			isApp: false,
			loading: true,
			pdfDoc: null,
			currentPage: 1,
			totalPages: 0,
			pdfJsLib: null,
			noData: false,
			topStyle: '',
			retryCount: 0,
			maxRetries: 3,
			errorMsg: '',
			pdfVersion: '2.9.359',
			scriptsLoaded: {
				worker: false,
				main: false
			},
			canvasEl: null
		};
	},
	mounted() {
		// 判断运行环境
		this.isH5 = process.env.VUE_APP_PLATFORM === 'h5';
		this.isApp = process.env.VUE_APP_PLATFORM === 'app-plus';
		
		if (!this.pdfUrl) {
			this.handleError(this.$t('暂无内容'));
			return;
		}

		this.topStyle = `height:calc(100vh - ${this.mtopHeight}rpx);`

		// 初始化PDF预览
		if (this.isH5) {
			// 等待DOM完全渲染后再初始化
			this.$nextTick(() => {
				this.cleanupPdfJs();
				this.initPdfJs();
			});
		} else if (this.isApp) {
			this.loading = false;
		}
	},
	// 添加 activated 钩子，处理 keep-alive 情况
	activated() {
		if (this.isH5 && !this.pdfDoc && !this.loading && !this.errorMsg) {
			this.retryLoad();
		}
	},
	methods: {
		// 清理PDF.js相关资源
		cleanupPdfJs() {
			// 清除全局变量
			window.pdfjsLib = null;
			window['pdfjs-dist'] = null;
			
			// 移除已加载的脚本
			document.querySelectorAll('script[src*="pdf.js"]').forEach(script => {
				script.remove();
			});
			
			// 重置状态
			this.scriptsLoaded = { worker: false, main: false };
			this.pdfJsLib = null;
			this.pdfDoc = null;
			this.canvasEl = null;
		},
		
		// 重试加载
		retryLoad() {
			this.errorMsg = '';
			this.noData = false;
			this.loading = true;
			this.retryCount = 0;
			
			// 等待DOM更新后再重试
			this.$nextTick(() => {
				this.cleanupPdfJs();
				this.initPdfJs();
			});
		},
		
		// 初始化PDF.js（H5）
		initPdfJs() {
			// 使用IIFE确保加载顺序和作用域隔离
			(function(vm) {
				// 先加载worker
				vm.loadScript(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${vm.pdfVersion}/pdf.worker.min.js`)
					.then(() => {
						vm.scriptsLoaded.worker = true;
						// 再加载主库
						return vm.loadScript(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${vm.pdfVersion}/pdf.min.js`);
					})
					.then(() => {
						vm.scriptsLoaded.main = true;
						
						// 确保获取正确的库引用
						vm.pdfJsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
						
						if (!vm.pdfJsLib) {
							throw new Error('PDF.js库未正确加载');
						}
						
						// 强制设置worker源，确保版本匹配
						vm.pdfJsLib.GlobalWorkerOptions.workerSrc = 
							`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${vm.pdfVersion}/pdf.worker.min.js`;
						
						vm.loadPdf();
					})
					.catch(error => {
						console.error('PDF.js初始化失败:', error);
						vm.handleLoadError();
					});
			})(this);
		},
		
		// 通用脚本加载函数
		loadScript(src) {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = `${src}?t=${new Date().getTime()}`;
				script.type = 'text/javascript';
				script.crossOrigin = 'anonymous';
				
				// 超时控制
				const timeout = setTimeout(() => {
					reject(new Error(`加载脚本超时: ${src}`));
				}, 15000);
				
				script.onload = () => {
					clearTimeout(timeout);
					resolve();
				};
				
				script.onerror = () => {
					clearTimeout(timeout);
					reject(new Error(`加载脚本失败: ${src}`));
				};
				
				document.head.appendChild(script);
			});
		},

		// 加载PDF文件（H5）
		async loadPdf() {
			try {
				if (!this.pdfJsLib) {
					throw new Error('PDF.js库未初始化');
				}

				let pdfSource = this.pdfUrl;
				if (this.pdfUrl.startsWith('/') || this.pdfUrl.startsWith('static/')) {
					pdfSource = window.location.origin + this.pdfUrl;
				}

				const pdfConfig = {
					url: pdfSource,
					rangeChunkSize: 65536,
					cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${this.pdfVersion}/cmaps/`,
					cMapPacked: true,
					disableStream: true
				};

				const loadingTask = this.pdfJsLib.getDocument(pdfConfig);
				
				// 添加加载进度监听
				loadingTask.onProgress = (progress) => {
					console.log('PDF加载进度:', progress);
				};
				
				// 设置超时
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => reject(new Error('PDF加载超时')), 30000);
				});

				this.pdfDoc = await Promise.race([loadingTask.promise, timeoutPromise]);
				
				if (!this.pdfDoc || typeof this.pdfDoc.getPage !== 'function') {
					throw new Error('PDF文档对象无效或损坏');
				}
				
				this.totalPages = this.pdfDoc.numPages;
				this.loading = false;
				
				// 确保DOM更新后再渲染页面
				this.$nextTick(() => {
					this.renderPage(this.currentPage);
				});
			} catch (error) {
				console.error('加载PDF失败:', error);
				this.handleLoadError();
			}
		},

		// 渲染PDF页面（H5）
		async renderPage(num) {
			try {
				// 1. 验证PDF文档
				if (!this.pdfDoc || typeof this.pdfDoc.getPage !== 'function') {
					throw new Error('PDF文档未正确初始化');
				}
				
				// 2. 获取页面
				let page;
				try {
					page = await this.pdfDoc.getPage(num);
				} catch (getPageError) {
					throw new Error(`获取页面失败: ${getPageError.message}`);
				}
				
				if (!page) {
					throw new Error('无法获取PDF页面对象');
				}
				
				// 3. 确保Canvas元素已准备好（专门处理uni-app的canvas）
				let canvasEl = document.getElementById('pdfCanvas');
				
				// 如果未找到，等待并重试
				if (!canvasEl) {
					// 等待下一个tick确保DOM更新
					await new Promise(resolve => this.$nextTick(resolve));
					canvasEl = document.getElementById('pdfCanvas');
				}
				
				// 处理uni-app中canvas被包装的情况
				if (canvasEl && canvasEl.tagName.toLowerCase() === 'uni-canvas') {
					console.log('检测到uni-canvas元素，尝试获取真实canvas');
					// 获取真正的canvas元素（uni-canvas的子元素）
					const realCanvas = canvasEl.querySelector('canvas');
					if (realCanvas) {
						canvasEl = realCanvas;
						console.log('找到子级canvas元素');
					} else {
						// 如果没有找到真正的canvas，尝试获取shadow DOM中的canvas
						if (canvasEl.shadowRoot) {
							const shadowCanvas = canvasEl.shadowRoot.querySelector('canvas');
							if (shadowCanvas) {
								canvasEl = shadowCanvas;
								console.log('找到shadow DOM中的canvas元素');
							}
						}
					}
				}
				
				// 最后检查
				if (!canvasEl) {
					throw new Error('无法找到Canvas元素');
				}
				
				// 验证元素类型
				if (canvasEl.tagName.toLowerCase() !== 'canvas') {
					console.warn('找到的元素类型:', canvasEl.tagName);
					throw new Error(`获取的元素不是Canvas标签，而是${canvasEl.tagName}`);
				}
				
				// 保存Canvas元素引用
				this.canvasEl = canvasEl;
				console.log('成功获取canvas元素:', canvasEl);
				
				// 4. 获取Canvas上下文
				let ctx;
				try {
					ctx = this.canvasEl.getContext('2d');
					if (!ctx) {
						throw new Error('无法获取Canvas 2D上下文');
					}
				} catch (ctxError) {
					throw new Error(`获取Canvas上下文失败: ${ctxError.message}`);
				}
				
				// 5. 渲染页面
				const dpr = uni.getSystemInfoSync().pixelRatio || 1;
				const viewport = page.getViewport({ scale: 1.5 });

				const canvasWidth = viewport.width * dpr;
				const canvasHeight = viewport.height * dpr;

				// 添加尺寸检查
				console.log('Canvas 尺寸:', {
					width: canvasWidth,
					height: canvasHeight,
					viewport: { width: viewport.width, height: viewport.height },
					dpr: dpr
				});

				// 设置canvas尺寸
				this.canvasEl.style.width = `${viewport.width}px`;
				this.canvasEl.style.height = `${viewport.height}px`;
				this.canvasEl.width = canvasWidth;
				this.canvasEl.height = canvasHeight;

				// 添加尺寸验证
				if (canvasWidth <= 0 || canvasHeight <= 0) {
					throw new Error('Canvas 尺寸无效');
				}

				// 清除画布
				ctx.clearRect(0, 0, canvasWidth, canvasHeight);

				// 设置缩放
				ctx.scale(dpr, dpr);

				const renderContext = {
					canvasContext: ctx,
					viewport: viewport
				};

				console.log('开始渲染PDF页面...');
				await page.render(renderContext).promise;
				console.log('PDF页面渲染完成');
			} catch (error) {
				console.error('渲染PDF页面失败:', error);
				this.handleLoadError();
			}
		},

		// 处理加载错误
		handleLoadError() {
			if (this.retryCount < this.maxRetries) {
				this.retryCount++;
				console.log(`PDF加载失败，第${this.retryCount}次重试...`);
				setTimeout(() => {
					this.cleanupPdfJs();
					// 等待DOM更新后再重试
					this.$nextTick(() => {
						this.initPdfJs();
					});
				}, 1000 * this.retryCount);
			} else {
				this.handleError(this.$t('PDF加载失败，请重试'));
			}
		},
		
		// 通用错误处理
		handleError(message) {
			this.loading = false;
			this.errorMsg = message;
			this.noData = true;
			console.error('PDF Viewer 错误:', message);
			uni.showToast({
				title: message,
				icon: 'none'
			});
		},

		// 上一页（H5）
		prevPage() {
			if (this.currentPage <= 1 || this.loading) return;
			this.currentPage--;
			this.renderPage(this.currentPage);
		},

		// 下一页（H5）
		nextPage() {
			if (this.currentPage >= this.totalPages || this.loading) return;
			this.currentPage++;
			this.renderPage(this.currentPage);
		}
	},
	beforeDestroy() {
		if (this.pdfDoc) {
			this.pdfDoc.destroy();
		}
		this.cleanupPdfJs();
	}
};
</script>

<style scoped>
.pdf-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 600rpx;
}

.pdf-canvas {
	width: 100%;
	background-color: #fff;
	min-height: 80vh;
	/* 确保Canvas元素正确显示 */
	display: block;
	border: 1px solid #eee; /* 添加边框便于调试 */
	min-width: 300px;
}

.pdf-controls {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 20rpx 0;
	gap: 30rpx;
}

.web-view {
	width: 100%;
}

.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 500rpx;
}

.loading-spinner {
	width: 50rpx;
	height: 50rpx;
	border: 5rpx solid #eee;
	border-top-color: #007aff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

.error {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 500rpx;
	gap: 20rpx;
}

.error text {
	color: #ff4d4f;
	font-size: 32rpx;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>