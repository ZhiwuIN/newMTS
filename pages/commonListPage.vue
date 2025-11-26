<template>
	<customnavbar :title="pageTitle">
		<scroll-view scroll-y @scrolltolower="onReachBottom" :refresher-threshold="120" class="scroll-view-box list">
			<view class="common-list-page">
				<view class="list-box" v-for="(item, index) in list" :key="index" @click="toDeatils(item.noticeId)">
					<image class="image-container" :style="{ width: '652rpx', height: '372rpx' }" fit="fill"
						:src="item.coverImg"></image>
					<view class="common-list-info">{{ item.title }}</view>
				</view>
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
	} from "@/common/api/home.js";
	export default {
		components: {
			customnavbar: customnavbar,
			listbottom: listbottom
		},
		data() {
			return {
				pageTitle: '',
				groupId: 0,
				list: [],
				page: {
					pageNum: 1,
					pageSize: 5
				},
				isRefreshing: false,
				nodata: false,
				hasMore: true,
				loading: false
			}
		},
		methods: {
			toDeatils(id) {
				uni.navigateTo({
					url: '/pages/commonDetailsPage?title=' + this.pageTitle + '&id=' + id
				})
			},
			getNotice() {
				this.loading = true
				noticeListApi(this.groupId, this.page).then((res) => {
					// console.log(res)
					this.loading = false
					if (this.page.pageNum == 1) this.list = res.rows
					else this.list.push(...res.rows)
					this.nodata = res.total == 0
					if (this.list.length == res.count) this.hasMore = false
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
		},
		onLoad(options) {
			this.pageTitle = options.title
			this.groupId = options.groupId
		},
		onShow() {
			this.getNotice()
		},
		onReachBottom() {
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getNotice()
			}
		}
	}
</script>

<style scoped>
	.common-list-page {
		padding: 50rpx;
	}

	/* .list-box {} */

	.common-list-title {
		color: rgba(51, 51, 51, 1);
		font-size: 32rpx;
		text-align: left;
		font-family: "DINPro-Black", sans-serif;
		margin: 40rpx 0;
		height: 48rpx;
		line-height: 46rpx;
	}

	.common-list-info {
		font-family: PingFangSC, PingFang SC;
		font-weight: 500;
		font-size: 30rpx;
		color: #333333;
		line-height: 42rpx;
		text-align: left;
		font-style: normal;
		margin-top: 20rpx;
		margin-bottom: 40rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		/* -webkit-line-clamp: 2; */
		overflow: hidden;
	}

	.image-container {
		background: #D8D8D8;
		border-radius: 32rpx;
		/* border: 2rpx solid #979797; */
	}
</style>