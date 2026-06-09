<template>
	<customnavbar :title="'Activity Description'">
		<view class="company-page">
			<!-- <rich-text :nodes="companyInfo" class="company-info"></rich-text> -->
			<view class="company-info" v-html="companyInfo"></view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		companyInfoApi
	} from "@/common/api/home.js";

	import {
		formatRichText
	} from "@/utils/utils.js"
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				companyInfo: '',
			}
		},
		methods: {

		},
		onShow() {
			this.companyInfo = uni.getStorageSync('BlackStarsRuleDescription')
		}
	}
</script>

<style scoped>
	.company-page {
		padding: 50rpx;
	}

	.company-info {
		/* font-family: "DINPro-Black", sans-serif; */
		/* font-weight: 400; */
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