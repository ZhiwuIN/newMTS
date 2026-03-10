<template>
	<customnavbar :title="$t('bagExplain')">
		<view class="privacyPolicy-page">
			<view class="privacyPolicy-info" v-html="privacyPolicyInfo"></view>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	luckybagListApi
} from '@/common/api/bag.js'
import {
	formatRichText
} from "@/utils/utils.js"
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			pageTitle: '',
			privacyPolicyInfo: "",
		}
	},
	onLoad() {
		// 福袋列表
		luckybagListApi().then(res => {
			this.privacyPolicyInfo = formatRichText(res.data.description)
		})
	}
}
</script>

<style scoped>
.privacyPolicy-page {
	position: relative;
	padding: 50rpx;
	padding-top: 10rpx;
}
</style>