<template>
	<customnavbar :title="pageTitle">
		<view class="common-page">
			<view class="common-info">{{noticeDetails.title}}</view>
			<image v-if="noticeDetails.coverImg" class="image-container"
				:style="{ width: '652rpx', height: noticeDetails.gropid == '11' ? '772rpx' : '372rpx' }" fit="fill"
				:src=" noticeDetails.coverImg"></image>
			<rich-text :nodes="noticeDetails.content" class="common-info"></rich-text>
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		noticeDetailsApi
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
				url: 'http://13.245.95.135:8888',
				// url: 'http://192.168.2.35:8080',
				pageTitle: '',
				noticeId: '',
				noticeDetails: {},
			}
		},
		methods: {
			getNoticeDetails() {
				noticeDetailsApi(this.noticeId).then((res) => {
					this.noticeDetails = res.data
					this.noticeDetails.content = this.noticeDetails.content
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			}
		},
		onLoad(options) {
			this.pageTitle = options.title
			this.noticeId = options.id
		},
		onShow() {
			this.getNoticeDetails()
		}
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