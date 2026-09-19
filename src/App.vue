<script>
import {
	settingsApi
} from "@/common/api/users.js";
import {
	versionApi
} from "@/common/api/home.js";
import { messageBadgeManager } from '@/common/api/messageBadge.js';
export default {
	onLaunch: function (options) {
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
				uni.reLaunch({
					url: '/pages/HomePage/index'
				})
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
						// console.log('跳转更新')
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
					uni.reLaunch({
						url: '/pages/LoginPage/login',
						success: () => {
							//跳转完页面后再关闭启动页
							plus.navigator.closeSplashscreen();
						}
					})

				}
			})
		});
		// #endif

	},
	onShow: function () {
		console.log('App onShow')
		// 刷新 IM 未读，驱动右上角消息红点 / 会话列表红点
		messageBadgeManager.refresh()
		settingsApi().then((res) => {
			const settings = res.data || {}
			uni.setStorageSync('settings', settings)
			uni.setStorageSync('defaultLanguage', settings.defaultLanguage || 'en')
			const savedLanguage = uni.getStorageSync('Language') ||
				uni.getStorageSync('defaultLanguage') || settings.defaultLanguage || 'en'
			if (typeof document !== 'undefined') {
				document.documentElement.setAttribute('lang', savedLanguage)
			}
			uni.setLocale(savedLanguage)
			if (this.$i18n) {
				this.$i18n.locale = savedLanguage
			}
		}).catch(err => {
			console.log('request fail', err);
			if (err.data?.code == 403) {
				this.$showMessage('warning', err.data?.msg);
			} else {
				this.$showMessage('warning', err.msg);
			}
		})
	},
	// onLaunch() {
	// 	// 延迟发送，确保消息页已加载
	// 	setTimeout(() => {
	// 		uni.$emit('updateMessageBadge', true);
	// 	}, 1000);
	// },
	onHide: function () {
		console.log('App Hide')
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

<style lang="scss">
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

.Big_bgi {
	position: fixed;
	left: 0;
	top: 0;
	z-index: -1;
	width: 100%;
	background: $themeColor;
}
</style>
