<template>
	<customnavbar :title="title">
		<view class="privacyPolicy-page">
			<view class="common-info">{{data.title}}</view>
			<image v-if="data.coverImg" class="image-container"
				:style="{ width: '652rpx', height: data.gropid == '11' ? '772rpx' : '372rpx' }" fit="fill"
				:src=" data.coverImg"></image>
			<view class="privacyPolicy-info" v-html="privacyPolicyInfo"></view>
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		noticeListApi
	} from '@/common/api/home.js'
	import {
		formatRichText
	} from "@/utils/utils.js"
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				privacyPolicyInfo: "",
				title: '',
				data: {}
			}
		},
		onLoad(options) {
			this.title = options.title
			noticeListApi(options.gropid, {
				pageNum: 1,
				pageSize: 10
			}).then((res) => {
				if (res.rows.length) {
					this.data = res.rows[0]
					this.privacyPolicyInfo = formatRichText(res.rows[0]?.content)
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