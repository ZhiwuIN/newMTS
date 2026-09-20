<template>
	<customnavbar :title="$t('pages.Message')">
		<view class="msg_list">
			<!-- 系统消息 -->
			<!-- <view class="msg_item" @click="toDetails('/pages/HomePage/messagePage?type=system')">
				<image :src="newSystemMessage?.isRead ? '/static/massage/System2.png' : '/static/massage/System1.png'"
					alt="" class="msg_icon" />
				<view class="main">
					<view class="msg_list_head">
						<view class="msg_title">
							{{ $t('System') }}
						</view>
						<view class="msg_time" v-if="newSystemMessage?.sendTime">
							{{ newSystemMessage?.sendTime || $t('NoTime') }}
						</view>
					</view>
					<view class="msg_title2" v-html="newSystemMessage?.title || $t('NoNewsYet')">
					</view>
				</view>
			</view> -->
			<!-- 我的好友 -->
			<view class="msg_item" @click="toDetails(buildChatUrl(item), item.userId)"
				v-for="(item, index) in friendListView" :key="item.userId || index">
				<image :src="displayAvatar(item)" alt="" class="msg_icon" mode="aspectFill" />
				<view class="main">
					<view class="msg_list_head">
						<view class="msg_title">
							{{ displayName(item) }}
						</view>
						<view class="msg_time">
							{{ item.lastMessage?.sendTime ? timeFormat(item.lastMessage?.sendTime) : '' }}
						</view>
					</view>
					<view class="msg_title2" v-if="item?.lastMessage">
						<view v-if="item?.lastMessage?.type == 1">[{{ $t('图片') }}]</view>
						<view v-else v-html="isLoading ? $t('正在获取最新消息') : (item?.lastMessage?.content ?? '')"></view>
					</view>
					<view class="badge" v-if="item.haveNewMsg"></view>
				</view>
			</view>
		</view>
	</customnavbar>
	<contactWay />
</template>

<script>
import { format } from 'date-fns';
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import contactWay from '@/components/contactWay/contactWay.vue';
import { userInfoApi } from "@/common/api/users.js";
import { imListApi, messageNewApi, messageListApi } from "@/common/api/message.js";
import { messageBadgeManager } from '@/common/api/messageBadge.js';

// 好友默认头像（客服 / 代理 / 普通好友）
const DEFAULT_AVATAR = {
	customer: '/static/massage/Customer service2.png',
	business: '/static/massage/Acting3.png',
	direct: '/static/default-avatar.png'
}

export default {
	components: {
		customnavbar,
		contactWay
	},
	data() {
		return {
			isLoading: false,
			friendList: [],
			newSystemMessage: {
				isRead: true
			},
			// 有未读消息的用户 id 集合（来自 /app/im/messages/unread/exists）
			unreadUserIdSet: new Set(),
			_unsubBadge: null
		}
	},
	created() {
		// 订阅：unreadUserIdSet 变化时（refresh / clearLocal 后）自动重渲染
		this._unsubBadge = messageBadgeManager.onUnreadUsersChange((ids) => {
			this.unreadUserIdSet = ids
		})
	},
	beforeUnmount() {
		if (this._unsubBadge) {
			this._unsubBadge()
			this._unsubBadge = null
		}
	},
	computed: {
		// 会话列表：把未读红点叠加到好友列表上
		friendListView() {
			const set = this.unreadUserIdSet
			return (this.friendList || []).map((f) => ({
				...f,
				haveNewMsg: set.has(String(f.userId))
			}))
		}
	},
	onShow() {
		this.getUserInfo()
		this.friendList = uni.getStorageSync('imList') ?? []
		messageBadgeManager.refresh()
	},
	methods: {
		timeFormat(timestamp) {
			if (!timestamp) return ''
			return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss')
		},
		// 会话标题：客服 / 业务经理 / 好友昵称
		displayName(item) {
			if (item?.userType == 'customer') return this.$t('客服')
			if (item?.userType == 'business') return this.$t('业务经理')
			return item?.userName || '--'
		},
		// 会话头像：优先用后端返回的头像，否则用角色默认图
		displayAvatar(item) {
			if (item?.avatar) return item.avatar
			return DEFAULT_AVATAR[item?.userType] || DEFAULT_AVATAR.direct
		},
		// 进入聊天详情页，带上昵称与头像，避免详情页再查一次用户信息
		buildChatUrl(item) {
			const name = encodeURIComponent(this.displayName(item))
			const avatar = encodeURIComponent(this.displayAvatar(item))
			return `/pages/MessagePage/personMessagePage?id=${item.userId}&name=${name}&avatar=${avatar}`
		},
		getImList() {
			imListApi().then(res => {
				this.isLoading = true
				const userList = res.data?.userList || []
				if (!userList.length) {
					this.friendList = []
					uni.setStorageSync('imList', [])
					this.isLoading = false
					return
				}
				const list = []
				userList.forEach((user, i) => {
					messageListApi({
						friendId: user.userId,
						page: 1,
						size: 20
					}).then(msg => {
						list[i] = { ...user, lastMessage: (msg.data.rows || [])[0] }
						const filled = list.filter(Boolean)
						uni.setStorageSync('imList', filled)
						this.friendList = filled
						this.isLoading = false
					}).catch(() => {
						list[i] = { ...user, lastMessage: null }
						const filled = list.filter(Boolean)
						uni.setStorageSync('imList', filled)
						this.friendList = filled
						this.isLoading = false
					})
				})
			}).catch(() => {
				this.isLoading = false
			})
			messageNewApi().then(res => {
				this.newSystemMessage = res.data || { isRead: true }
			}).catch(() => {
				this.newSystemMessage = { isRead: true }
			})
		},
		async getUserInfo() {
			try {
				const res = await userInfoApi();
				uni.setStorageSync('userInfo', res.data);
				this.userInfo = res.data;
				this.getImList()
			} catch (err) {
				console.error('getUserInfo error:', err);
				this.$showMessage('warning', err.msg);
			}
		},
		toDetails(url) {
			uni.navigateTo({ url })
		}
	}
}
</script>

<style scoped lang="scss">
.parting_line {
	display: flex;
	justify-content: center;
	color: #8A94A4;
	margin-bottom: 30rpx;
}

.msg_list {
	padding: 24rpx 40rpx;
}

.msg_item {
	position: relative;
	background: #FFFFFF;
	// box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 12rpx;
	border: 2rpx solid rgb(228, 228, 228);
	padding: 40rpx;
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
	gap: 30rpx;

	.badge {
		position: absolute;
		top: 46rpx;
		left: 120rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #FFFFFF;
		background-color: #fa5151;
		width: 30rpx;
		height: 30rpx;
		border-radius: 50%;
		font-size: 20rpx;
	}

	.badge2 {
		position: absolute;
		top: 32rpx;
		left: 110rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #FFFFFF;
		background-color: #fa5151;
		padding: 6rpx 14rpx;
		border-radius: 32rpx;
		font-size: 22rpx;
	}

	.badge3 {
		position: absolute;
		top: 50rpx;
		left: 130rpx;
		background-color: #fa5151;
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
	}

	.main {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 112rpx;
		width: 100%;
	}
}

.msg_icon {
	min-width: 112rpx;
	min-height: 112rpx;
	width: 112rpx;
	height: 112rpx;
	background: #EBF5FF;
	border-radius: 50%;
}

.msg_list_head {
	display: flex;
	align-items: center;
	justify-content: space-between;

	.msg_title {
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 30rpx;
		color: #000000;
		line-height: 40rpx;
		text-align: left;
		font-style: normal;
		white-space: nowrap;
	}

}

.msg_title2 {
	font-family: DINPro, DINPro;
	font-weight: 400;
	font-size: 24rpx;
	color: #999999;
	line-height: 30rpx;
	text-align: left;
	font-style: normal;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.msg_time {
	font-family: DINPro, DINPro;
	font-weight: 400;
	font-size: 24rpx;
	color: #8A94A4;
	line-height: 30rpx;
	font-style: normal;
	text-transform: none;
	text-align: right;
}
</style>
