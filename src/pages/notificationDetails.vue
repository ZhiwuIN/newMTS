<template>
	<customnavbar :title="$t('通知详情')">
		<view class="common-page">
			<rich-text :nodes="content" class="common-info"></rich-text>
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		formatRichText
	} from "@/utils/utils.js"
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				content: '',
			}
		},
		methods: {

		},
		onLoad(options) {
			if(options.type == 'rollContent') {
				this.content = formatRichText(uni.getStorageSync('settings').rollContent)
			}else {
				this.content = formatRichText(uni.getStorageSync('settings').popWindowContent)
			}
		},
	}
</script>

<style scoped lang="scss">
	.common-page {
		padding: 50rpx;
	}

	.common-info {
		/* font-family: "DINPro", sans-serif; */
		/* font-weight: 600; */
		/* font-size: 28rpx; */
		/* color: #1C2D57; */
		/* line-height: 36rpx; */
		/* text-align: justify; */
		/* font-style: normal; */
		margin-bottom: 40rpx;

		img {
			max-width: 100%;
		}
	}
</style>