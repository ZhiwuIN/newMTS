<template>
	<customnavbar :title="$t('pages.privacyPolicy')">
		<view class="privacyPolicy-page" v-for="item in privacyPolicyInfo">
			<image mode="widthFix" class="privacyPolicy_image" :src="item?.coverImg"></image>
			<view class="privacyPolicy-info" v-html="item?.content"></view>
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
				privacyPolicyInfo: [],
			}
		},
		onLoad() {
			noticeListApi(4, {
				pageNum: 1,
				pageSize: 10
			}).then((res) => {
				if (res.rows.length) {
					this.privacyPolicyInfo = res.rows
				}
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		}
	}
</script>

<style scoped lang="scss">
	.privacyPolicy-page {
		padding: 50rpx;
		.privacyPolicy_image {
			width: 100%;
		}
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