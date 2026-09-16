<template>
	<customnavbar :title="$t('pages.message')">
		<view class="msg_list">
			<view class="msg_item" v-for="(item, index) in msgList" :key="index" @click="toDetails(item.id)">
				<image v-if="!item.isRead" src="/static/home/msg_unread.svg" alt="" class="msg_icon" />
				<image v-else src="/static/home/msg_readed.svg" alt="" class="msg_icon" />
				<view>
					<view class="msg_title">
						{{ item.title }}
					</view>
					<view class="msg_title2">
						{{ item.content }}
					</view>
					<view class="msg_time">
						{{ item.sendTime }}
					</view>
				</view>
			</view>
		</view>
		<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata' image="/static/default/No news.png">
		</listbottom>

	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	messageListApi
} from "@/common/api/home.js";

export default {
	components: {
		customnavbar: customnavbar,
		listbottom: listbottom
	},
	data() {
		return {
			msgList: [],
			page: {
				pageNum: 1,
				pageSize: 10
			},
			nodata: false,
			hasMore: true,
			loading: false
		}
	},
	onShow() {
		this.getNotice()
	},
	methods: {
		getNotice() {
			this.loading = true
			messageListApi(this.page).then((res) => {
				this.loading = false
				if (this.page.pageNum == 1) this.msgList = res.data.rows || []
				else this.msgList.concat(res.data.rows)
				this.nodata = res.data.total == 0
				this.hasMore = this.msgList.length != res.data.total
			}).catch((err) => {
				this.loading = false
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);

				// uni.showToast({

				// 	title: err.msg,

				// 	icon: 'none'

				// })
			})
		},
		toDetails(id) {
			uni.navigateTo({
				url: '/pages/HomePage/messageDetailsPage?id=' + id
			})
		},
		onReachBottom() {
			if (!this.loading && this.hasMore) {
				this.page.pageNum += 1
				this.getNotice()
			}
		}
	}
}
</script>

<style scoped>
.msg_list {
	padding: 24rpx 40rpx;
}

.msg_item {
	background: #FFFFFF;
	/* box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF; */
	border-radius: 24rpx;
	border: 2rpx solid rgb(228, 228, 228);
	padding: 40rpx;
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
	gap: 30rpx;
}

.msg_icon {
	min-width: 72rpx;
	min-height: 72rpx;
	width: 72rpx;
	height: 72rpx;
	/* margin-right: 30rpx; */
}

.msg_title {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 26rpx;
	color: #333333;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
	overflow: hidden;
}

.msg_title2 {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 24rpx;
	color: #333333;
	line-height: 36rpx;
	text-align: left;
	font-style: normal;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
	overflow: hidden;
}

.msg_time {
	font-family: DINPro, DINPro;
	font-weight: 400;
	font-size: 24rpx;
	color: #8A94A4;
	line-height: 30rpx;
	text-align: left;
	font-style: normal;
	text-transform: none;
	margin-top: 10rpx;
}
</style>