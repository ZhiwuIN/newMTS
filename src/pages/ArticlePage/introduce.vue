<template>
	<customnavbar :title="$t('introduce')">
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
import { getRewardSettingApi } from '@/common/api/article.js'
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
	onLoad() {
		getRewardSettingApi().then(res => {
			this.content = res.data.luckyDesc
		})
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