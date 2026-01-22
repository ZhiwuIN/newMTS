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
				const userAgentInfo = window?.navigator.userAgent;
				const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
				const isInIframe = self.frameElement && self.frameElement.tagName === 'IFRAME';
				// 结合屏幕宽度判断，更准确识别移动设备场景（包括F12模拟）
				const isMobileWidth = window.innerWidth < 768;
				// 检测是否为移动设备（包括UA和屏幕宽度）
				const isMobileDevice = Agents.some(item =>
					userAgentInfo.toLowerCase().includes(item.toLowerCase())
				) || isMobileWidth;

				// 获取现有iframe
				const ifrTag = document.getElementsByTagName('iframe')[0];

				// 如果是移动设备或在iframe中，确保移除iframe
				if (isMobileDevice || isInIframe) {
					if (ifrTag) {
						ifrTag.remove();
						// 恢复原页面内容（如果之前被清空）
						if (document.body.innerHTML === '') {
							// 这里可以根据实际情况恢复页面内容
							// 或者重新加载页面（如果适合你的场景）
							window.location.reload();
						}
					}
					return;
				}

				// PC端处理逻辑
				if (!isInIframe) {
					if (ifrTag) {
						ifrTag.remove();
					}
					const newIfr = document.createElement('iframe');
					document.body.innerHTML = '';
					newIfr.setAttribute('src', window.location.href);
					const styleObj = {
						width: '480px',
						height: '920px',
						position: 'absolute',
						left: '50%',
						transform: 'translateX(-50%)',
						border: '1px solid #eee',
						boxShadow: '0 0 20px rgba(0,0,0,0.1)'
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

	.uni-tabbar__reddot {
		top: 32rpx !important;
		right: 8rpx !important;
		width: 20rpx !important;
		height: 20rpx !important;
	}

	.t-loading {
		justify-content: center;
	}

	.uni-input-placeholder.input-placeholder {
		white-space: nowrap;
		/* 禁止换行 */
		overflow: hidden;
		/* 隐藏溢出内容 */
		text-overflow: ellipsis;
		/* 显示省略号 */
	}
</style>