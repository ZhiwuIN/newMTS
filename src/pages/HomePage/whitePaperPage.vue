<template>
	<customnavbar :title="pageTitle" @mtop='mtop'>
		<view class="common-list-page">
			<!-- <PdfViewer :pdfUrl="data" :mtopHeight="mtopHeight"></PdfViewer> -->
			<web-view :src="pdfUrl" :style="topStyle"></web-view>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import PdfViewer from '@/component/PdfViewer/PdfViewer.vue'
export default {
	components: {
		customnavbar,
		PdfViewer
	},
	data() {
		return {
			topStyle: '',
			topStyle2: '',
			data: '',
			mtopHeight: '',
			pdfUrl: '',
			pageTitle: ''
		}
	},
	methods: {
		mtop(e) {
			this.mtopHeight = e
			// #ifdef H5
			this.topStyle = `top: ${e}rpx`
			this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle2 = `height:calc(100vh);`
			// #endif
			// #ifdef APP-PLUS
			var currentWebview = this.$scope.$getAppWebview(); //获取当前web-view
			setTimeout(function () {
				var wv = currentWebview.children()[0];
				wv.setStyle({ //设置web-view距离顶部的距离以及自己的高度，单位为px
					top: plus.navigator.getStatusbarHeight() + e - 80, //此处是距离顶部的高度，应该是你页面的头部
					height: uni.getSystemInfoSync().windowHeight - e + 58,
					// plus.navigator.getStatusbarHeight(), //webview的高度
					scalable: true //webview的页面是否可以缩放，双指放大缩小
				})
			}, 1000); //如页面初始化调用需要写延迟
			// #endif
		}
	},
	onLoad(options) {
		if (uni.getStorageSync('pageTitle')) {
			this.pageTitle = uni.getStorageSync('pageTitle')
		} else {
			this.pageTitle = options.title
		}
		if (uni.getStorageSync('settings').whitePaper) {
			this.pdfUrl = '/hybrid/html/web/viewer.html?file=' + encodeURIComponent(uni.getStorageSync('settings').whitePaper)
		}
	}
}
</script>

<style scoped lang="scss">
.common-list-page {
	padding: 50rpx;
}
</style>