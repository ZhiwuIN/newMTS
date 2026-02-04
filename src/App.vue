<script>
	import {
		settingsApi
	} from "@/common/api/users.js";
	import {
		versionApi
	} from "@/common/api/home.js";
	export default {
		onLaunch: function(options) {
			// #ifdef H5
			// 1. 处理邀请码（保留原逻辑）
			if (options.query?.InvitationCode) {
				uni.setStorageSync('InvitationCode', options.query.InvitationCode)
				uni.reLaunch({
					url: '/pages/LoginPage/register'
				})
			} else {
				// 2. 判断是否是首次启动（而非刷新）
				const isInitialized = uni.getStorageSync('app_initialized')
				if (!isInitialized) {
					// 首次启动：执行引导页/首页逻辑
					if (!uni.getStorageSync('first_flag')) {
						console.log('跳转引导页')
						uni.redirectTo({
							url: '/pages/guide'
						})
					} else {
						console.log('跳转首页')
						uni.reLaunch({
							url: '/pages/HomePage/index'
						})
					}
					// 标记为已初始化
					uni.setStorageSync('app_initialized', true)
				}
			}
			// #endif
			// #ifdef APP-PLUS
			plus.runtime.getProperty(plus.runtime.appid, (inf) => {
				//获取服务器的版本号
				versionApi().then(res => {
					let data = res.data
					data.describe = res.data.description
					data.edition_name = res.data.editionName
					data.edition_url = res.data.editionUrl
					data.package_type = res.data.packageType
					data.edition_force = res.data.editionForce
					if (Number(res.data.editionNumber) > Number(inf.versionCode)) {
						setTimeout(() => {
							console.log('跳转更新')
							uni.reLaunch({
								url: '/uni_modules/rt-uni-update/components/rt-uni-update/rt-uni-update?obj=' +
									JSON.stringify(data),
								success: () => {
									//跳转完页面后再关闭启动页
									plus.navigator.closeSplashscreen();
								}
							});
						}, 100)
					} else {
						// 首次启动：执行引导页/首页逻辑
						if (!uni.getStorageSync('first_flag')) {
							console.log('跳转引导页')
							uni.redirectTo({
								url: '/pages/guide',
								success: () => {
									//跳转完页面后再关闭启动页
									plus.navigator.closeSplashscreen();
								}
							})
						} else {
							console.log('跳转首页')
							uni.reLaunch({
								url: '/pages/HomePage/index',
								success: () => {
									//跳转完页面后再关闭启动页
									plus.navigator.closeSplashscreen();
								}
							})
						}
					}
				})
			});
			// #endif

		},
		onShow: function() {
			console.log('App onShow')
			// #ifdef APP-PLUS
			if (uni.$yeIM) {
				uni.$yeIM.intoApp();
			} else {
				console.warn('yeIM 未初始化，跳过 intoApp 调用');
			}
			// #endif
			settingsApi().then((res) => {
				uni.setStorageSync('settings', res.data)
				uni.setLocale('en');
				this.$i18n.locale = 'en';
			}).catch(err => {
				console.log('request fail', err);
				if (err.data?.code == 403) {
					this.$showMessage('warning', err.data?.msg);
				} else {
					this.$showMessage('warning', err.msg);
				}
			})
		},
		onHide: function() {
			console.log('App Hide')
			// #ifdef APP-PLUS
			uni.$yeIM.leaveApp();
			// #endif
		},
		mounted() {
			// #ifdef H5
			// 提取设备检测和iframe处理逻辑为独立函数
			this.handleDeviceDetection();
			// 监听窗口大小变化，适应F12设备模式切换
			// window.addEventListener('resize', this.handleDeviceDetection);
			// #endif
		},

		beforeUnmount() {
			// #ifdef H5
			// 移除事件监听，防止内存泄漏
			// window.removeEventListener('resize', this.handleDeviceDetection);
			// #endif
		},

		methods: {
			handleDeviceDetection() {
				// 空值兜底，避免 undefined 报错
				const userAgentInfo = window?.navigator.userAgent || '';
				const ua = userAgentInfo.toLowerCase(); // 统一转小写，消除大小写影响
				const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
				const isInIframe = self.frameElement && self.frameElement.tagName === 'IFRAME';
				const isMobileWidth = window.innerWidth < 768;

				// 原有手机判定逻辑（保持不变）
				const isMobileDevice = Agents.some(item =>
					ua.includes(item.toLowerCase())
				) && isMobileWidth;

				// 🔥 核心修复：重构平板判定，重点解决 iPad 识别问题
				// 1. 苹果平板（iPad Mini/Air/Pro 全系列）：覆盖所有 iPad UA 格式
				const isIpad =
					ua.includes('ipad') || // 基础判定：含 ipad 关键词
					(ua.includes('mac os x') && ua.includes('mobile') && !ua.includes(
						'iphone')); // 适配 iPadOS 伪装 Mac OS 的情况
				// 2. Android 平板：仅含 android，不含 mobile
				const isAndroidTablet = ua.includes('android') && !ua.includes('mobile');
				// 3. 谷歌智能屏：Nest Hub 系列
				const isNestHub = ua.includes('nest hub');
				// 4. Windows 平板：Surface Pro 系列
				const isSurfaceTablet = ua.includes('surface pro');
				// 最终平板判定：满足任一平板类型 + 非手机小屏幕（≥768px）
				const isTabletDevice = (isIpad || isAndroidTablet || isNestHub || isSurfaceTablet) && !isMobileWidth;

				// 获取现有 iframe
				const ifrTag = document.getElementsByTagName('iframe')[0];

				// 手机端/iframe 内：移除 iframe，恢复原页面（保持不变）
				if (isMobileDevice || isInIframe) {
					if (ifrTag) {
						ifrTag.remove();
						if (document.body.innerHTML === '') {
							window.location.reload();
						}
					}
					return;
				}

				// 平板/电脑端：创建 iframe，动态设置样式（保持不变）
				if (!isInIframe) {
					if (ifrTag) {
						ifrTag.remove();
					}
					const newIfr = document.createElement('iframe');
					document.body.innerHTML = '';
					newIfr.setAttribute('src', window.location.href);
					const styleObj = {
						width: '480px',
						height: isTabletDevice ? '100vh' : '920px', // 平板100vh自适应，电脑920px固定
						position: 'absolute',
						left: '50%',
						transform: 'translateX(-50%)',
						border: '1px solid #eee',
						boxShadow: '0 0 20px rgba(0,0,0,0.1)',
						...(isTabletDevice && {
							top: 0,
							bottom: 0,
							margin: 0,
							border: 'none'
						}) // 平板清除间距，全屏适配
					};
					Object.entries(styleObj).forEach(([key, value]) => {
						newIfr.style[key] = value;
					});
					document.body.appendChild(newIfr);
				}
			}
		}
	}
</script>

<style>
	@import "common/font.css";

	/* ========== APP-PLUS 平板端固定480px宽度（核心修复滚动） ========== */
	/* #ifdef APP-PLUS */
	/* 根容器：固定宽度+水平居中，仅隐藏横向滚动，释放纵向滚动，最小高度适配内容 */
	uni-app,
	body,
	html {
		width: 480px !important;
		margin: 0 auto !important;
		min-height: 100% !important;
		/* 修复：替换height为min-height，适配内容高度 */
		overflow-x: hidden !important;
		/* 修复：仅禁止横向滚动，允许纵向滚动 */
		position: relative !important;
	}

	/* 页面容器：继承宽度，允许纵向滚动，防止内容溢出 */
	.page {
		width: 100% !important;
		max-width: 480px !important;
		overflow-x: hidden !important;
		overflow-y: auto !important;
		/* 显式允许纵向滚动 */
		min-height: 100vh !important;
	}

	/* #endif */

	/* ========== H5端：平板/电脑端样式（核心修复滚动） ========== */
	/* #ifdef H5 */
	html,
	body {
		width: 100%;
		min-height: 100%;
		/* 修复：替换height为min-height */
		margin: 0;
		padding: 0;
		overflow-x: hidden !important;
		/* 修复：仅隐藏横向滚动 */
		position: relative;
	}

	/* #endif */

	/* ========== 通用样式：隐藏所有滚动条，多端兼容（不影响滚动功能） ========== */
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}

	/* 兼容 Firefox */
	html {
		scrollbar-width: none;
	}

	/* 兼容 IE */
	* {
		-ms-overflow-style: none;
	}

	/* ========== tabbar 样式重置，去除边框/阴影 ========== */
	.uni-tabbar-border {
		background-color: transparent !important;
		height: 0px !important;
		border: none !important;
	}

	uni-tabbar .uni-tabbar__border {
		display: none !important;
	}

	.uni-tabbar.uni-tabbar--topselected {
		border-top: none !important;
	}

	.uni-tabbar {
		border-top-color: transparent !important;
		border-top-width: 0px !important;
		box-shadow: none !important;
	}

	.uni-tabbar__content {
		background-image: none !important;
	}

	/* ========== 小红点样式调整 ========== */
	.uni-tabbar__reddot {
		top: 32rpx !important;
		right: 8rpx !important;
		width: 20rpx !important;
		height: 20rpx !important;
	}

	/* ========== 加载样式居中 ========== */
	.t-loading {
		justify-content: center;
	}

	/* ========== 输入框占位符不换行，显示省略号 ========== */
	.uni-input-placeholder.input-placeholder {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>