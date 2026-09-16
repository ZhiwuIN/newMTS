export default {
	data() {
		return {
			sysInfo: null,
			statusBarHeight: 0,
			windowHeight: 0,
			windowWidth: 0
		}
	},
	mounted() { // 获取 屏幕 像素信息
		this.$nextTick(() => {
			const sysInfo = uni.getSystemInfoSync()
			this.sysInfo = sysInfo
			const { statusBarHeight, windowHeight, windowWidth } = sysInfo
			this.windowHeight = windowHeight
			this.statusBarHeight = statusBarHeight
			this.windowWidth = windowWidth
		})
	},
	computed: {
		scrollHBar() {
			const winH = this.windowHeight
			const statusBarHeight = this.statusBarHeight
			const navbarH = 44
			const top = statusBarHeight + navbarH
			const height = winH - top
			return `height: ${height}px;`
		},
		draH() {
			const winH = this.windowHeight
			const height = winH * 0.86 
			return `height: ${height}px;`
		},
		listScrollH() {
			const winH = this.windowHeight
			const bottomB = uni.upx2px(120)
			const titleH = uni.upx2px(80)
			const height = winH * 0.86 - titleH - bottomB
			return `height: ${height}px;`
		}
	},
}
