<template>
	<customnavbar :title="pageTitle">
		<scroll-view scroll-y @scrolltolower="onReachBottom" :refresher-threshold="120" class="scroll-view-box list">
			<view class="privacyPolicy-page" v-for="item in privacyPolicyInfo">
				<image mode="widthFix" class="privacyPolicy_image" :src="item?.coverImg"></image>
				<view class="privacyPolicy-info" v-html="item?.content"></view>
			</view>
			<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata' image="/static/default/No content.png">
			</listbottom>
		</scroll-view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import listbottom from '@/component/list-bottom/list_bottom.vue'
	import {
		noticeListApi
	} from '@/common/api/home.js'
	export default {
		components: {
			customnavbar,
			listbottom
		},
		data() {
			return {
				privacyPolicyInfo: [],
				isRefreshing: false,
				nodata: false,
				hasMore: true,
				loading: false,
				page: {
					pageNum: 1,
					pageSize: 5
				},
				pageTitle: ''
			}
		},
		onLoad(options) {
			if (uni.getStorageSync('pageTitle')) {
				this.pageTitle = uni.getStorageSync('pageTitle')
			} else {
				this.pageTitle = options.title
			}
			this.getNoticeList()
		},
		methods: {
			getNoticeList() {
				this.loading = true
				noticeListApi(4, this.page).then((res) => {
					this.loading = false
					if (this.page.pageNum == 1) this.privacyPolicyInfo = res.data.rows || []
					else this.privacyPolicyInfo.push(...res.data.rows)
					this.nodata = res.data.total == 0
					if (this.privacyPolicyInfo.length == res.data.total) this.hasMore = false
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			}
		},
		onReachBottom() {
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getNoticeList()
			}
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