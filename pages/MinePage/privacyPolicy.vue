<template>
	<customnavbar :title="$t('pages.privacyPolicy')">
		<view class="privacyPolicy-page">
			<view class="privacyPolicy-info" v-html="privacyPolicyInfo"></view>
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		noticeListApi
	} from '@/common/api/home.js'
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				privacyPolicyInfo: "",
			}
		},
		onLoad() {
			noticeListApi(5, {
				pageNum: 1
			}).then((res) => {
				if (res.data.list.length) {
					this.privacyPolicyInfo = res.data.list[0]?.content
				}
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		}
	}
</script>

<style scoped>
	.privacyPolicy-page {
		padding: 50rpx;
	}

	.privacyPolicy-info {
		/* font-family: "DINPro-Regular", sans-serif; */
		/* font-weight: 400; */
		/* font-size: 28rpx; */
		/* color: #1C2D57; */
		/* line-height: 36rpx; */
		/* text-align: justify; */
		/* font-style: normal; */
	}
</style>