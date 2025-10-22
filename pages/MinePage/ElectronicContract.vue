<template>
	<customnavbar :title="$t('mine.ElectronicContract')">
		<view class="privacyPolicy-page">
			<view class="privacyPolicy-info" v-html="privacyPolicyInfo"></view>
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		contractAllApi
	} from '@/common/api/home.js'
	import {
		formatRichText
	} from "@/utils/utils.js"
	import {
		positionMyPositionInfoApi
	} from '@/common/api/position.js'
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				privacyPolicyInfo: "",
			}
		},
		onLoad(options) {
			if (options?.positionName) {
				this.privacyPolicyInfo = formatRichText(uni.getStorageSync('privacyPolicyInfo'))
			} else {
				contractAllApi().then((res) => {
					// console.log(res)
					if (res.data?.content) {
						this.privacyPolicyInfo = formatRichText(res.data?.content)
					}
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			}

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