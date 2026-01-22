<template>
	<customnavbar :title="$t('pages.Message')" :showBack="false">
		<view class="msg_list">
			<!-- <scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
				@refresherrefresh="onRefresh" :refresher-threshold="120" style="height: calc(100vh);"> -->
			<view class="msg_item" @click="toDetails('/pages/HomePage/messagePage', null)">
				<image src="/static/massage/System2.png" alt="" class="msg_icon" />
				<view class="main">
					<view class="msg_list_head">
						<view class="msg_title">
							{{$t('System')}}
						</view>
						<view class="msg_time" v-if="newSystemMessage?.sendTime">
							{{newSystemMessage?.sendTime || $t('NoTime')}}
						</view>
					</view>
					<view class="msg_title2" v-html="newSystemMessage?.title || $t('NoNewsYet')">

					</view>
					<view class="badge3" v-if="!newSystemMessage?.isRead">
					</view>
				</view>
			</view>
			<!-- 我的好友 -->
			<view class="msg_item"
				@click="toDetails('/pages/MessagePage/personMessagePage?id=' + item.userId + '&name=' + (item.userType == 'customer' ? $t('客服') : item.userType == 'business' ? $t('业务经理') : item?.userName), item.userId)"
				v-for="(item, index) in friendList" :key="index">
				<view class="msg_icon">
					<!-- 客服 -->
					<image :src="item?.avatar ?  item?.avatar : '/static/massage/Customer service2.png'" alt=""
						class="msg_icon" v-if="item?.userType == 'customer'" mode="aspectFill" />
					<!-- 代理 -->
					<image :src="item?.avatar ?  item?.avatar : '/static/massage/Acting3.png'" alt="" class="msg_icon"
						v-else-if="item.userType == 'business'" mode="aspectFill" />
					<!-- 客服 -->
					<image :src="item?.avatar" alt="" class="msg_icon" mode="aspectFill" v-else />
				</view>
				<view class="main">
					<view class="msg_list_head">
						<view class="msg_title" v-if="item?.userType == 'customer'">
							{{$t('客服')}}
						</view>
						<view class="msg_title" v-else-if="item?.userType == 'business'">
							{{$t('业务经理')}}
						</view>
						<view class="msg_title" v-else>
							{{item?.userName}}
						</view>
						<view class="msg_time">
							{{item.lastMessage?.time ? formatTimestamp(item.lastMessage?.time) : ''}}
						</view>
					</view>
					<view class="msg_title2" v-if="!item.lastMessage?.isRevoke">
						<view v-if="item.lastMessage?.type == 'image'">[{{$t('图片')}}]</view>
						<view v-html="item.lastMessage?.body.tips || item.lastMessage?.body.text || ''" v-else>
						</view>
					</view>
					<view class="msg_title2" v-else>
						<view>
							{{$t('recalled a message')}}
						</view>
					</view>
					<view :class="item.unread?.toString().length > 1 ? 'badge2' : 'badge'" v-if="item?.unread">
						{{item.unread?.length > 2 ? '99+' : item?.unread}}
					</view>
				</view>
			</view>
			<!-- </scroll-view> -->
		</view>

	</customnavbar>
</template>

<script>
	import {
		format
	} from 'date-fns';
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		userInfoApi
	} from "@/common/api/users.js";
	import {
		imListApi,
		messageNewApi
	} from "@/common/api/message.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				friendList: [],
				msgList: [],
				page: {
					pageNum: 1,
					pageSize: 10
				},
				imToken: '',
				newSystemMessage: {},
				isRefreshing: false
			}
		},
		onLoad() {
			this.$yeIM.getInstance().addEventListener(this.$yeIMDefines.EVENT.CONVERSATION_LIST_CHANGED, (list) => {
				setTimeout(() => {
					this.getNotice()
				}, 0)
			});
		},
		onShow() {
			this.getUserInfo()
			// 撤回消息监听
			this.$yeIM.getInstance().addEventListener(this.$yeIMDefines.EVENT.MESSAGE_REVOKED, (res) => {
				this.$yeIM.getInstance().disConnect();

				setTimeout(() => {
					try {
						// 1. 使用 uni 跨端 API 获取所有存储键名（替代浏览器的 localStorage）
						const storageInfo = uni.getStorageInfoSync();
						const allKeys = storageInfo.keys; // 所有存储键的数组

						// 2. 遍历筛选出以 "yeim:messageList:" 开头的键
						allKeys.forEach(key => {
							if (key.startsWith('yeim:messageList:')) {
								uni.removeStorageSync(key); // 3. 删除目标缓存（跨端方法）
							}
						});

						// 4. 延迟调用 getMsgList()，确保缓存删除完成（避免时机过短）
						setTimeout(() => {
							this.getNotice();
						}, 300);
					} catch (err) {
						// 捕获存储操作异常（如权限问题）
						console.error('删除撤回消息缓存失败:', err);
					}
				}, 100)
			});
		},
		methods: {
			// 下拉刷新
			async onRefresh() {
				this.isRefreshing = true
				this.page.pageNum = 1
				await this.getNotice()
				setTimeout(() => {
					this.isRefreshing = false
				}, 500)
			},
			getImList() {
				imListApi(this.userInfo.userId).then(res => {
					this.friendList = res.data.userList
					this.imToken = res.data.token
					uni.setStorageSync('imToken', res.data.token)
					this.getNotice()
				})
				messageNewApi().then(res => {
					if (res.data) {
						this.newSystemMessage = res.data
					} else {
						this.newSystemMessage.isRead = true
					}
				})
			},
			async getUserInfo() {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				try {
					const res = await userInfoApi();
					uni.setStorageSync('userInfo', res.data);
					this.userInfo = res.data;
					if (this.userInfo.hasMessage) {
						uni.showTabBarRedDot({
							index: 2
						})
					} else {
						uni.hideTabBarRedDot({
							index: 2
						})
					}
					this.getImList()
				} catch (err) {
					console.error('getUserInfo error:', err);
					this.$showMessage('warning', err.msg);
				}
			},
			getNotice() {
				this.$yeIM.getInstance().getConversationList({
					page: 1, //页码
					limit: 999, //每页数量
					success: (res) => {
						console.log(res, '会话列表')
						if (res.code == 200) {
							this.msgList = res.data;
							if (this.msgList.length) {
								this.friendList.map(item => {
									this.msgList.forEach(i => {
										if (item.userId == i.conversationId) {
											item.lastMessage = i.lastMessage
											item.unread = i.unread
										}
									})
								})
								// 提取 friendList 中的 userId 并转为字符串（确保类型匹配）
								const friendUserIds = new Set(this.friendList.map(item => String(item
									.userId)));

								// 过滤 msgList，找出 conversationId 不在 friendUserIds 中的项
								const newConversations = this.msgList.filter(msg => {
									return !friendUserIds.has(msg.conversationId);
								});

								// console.log(newConversations)

								// 合并
								newConversations.forEach(item => {
									this.friendList.push({
										avatar: item.userInfo.avatarUrl,
										userName: item.userInfo.nickname,
										lastMessage: item.lastMessage,
										unread: item.unread,
										userType: 'direct',
										userId: +item.conversationId
									})
								})

								// 排序 friendList
								this.friendList.sort((a, b) => {
									const aTime = a.lastMessage?.time ? new Date(a.lastMessage?.time)
										.getTime() : -Infinity;
									const bTime = b.lastMessage?.time ? new Date(b.lastMessage?.time)
										.getTime() : -Infinity;
									return bTime - aTime;
								});
								uni.hideLoading();
							}
						} else {
							this.$showMessage('warning', this.$t('获取聊天记录失败请重试'));
							uni.hideLoading();
						}
					},
					fail: (err) => {
						console.log(err)
						if (err.code == 10003) {
							let token = this.imToken || uni.getStorageSync('imToken')
							this.$yeIM.getInstance().connect({
								userId: this.userInfo.userId,
								token,
								success: (response) => {
									if (response.code == 200) {
										this.getNotice()
									}
								},
								fail: (err) => {
									console.log(err);
									uni.hideLoading();
								}
							});
						}
					}
				});
			},
			async toDetails(url, id) {
				if (id) {
					// this.$yeIM.getInstance().clearConversationUnread(id)
				}
				uni.navigateTo({
					url
				})
				// uni.navigateTo({
				// 	url: '/pages/MessagePage/personMessagePage'
				// })
			},
			// 时间格式化
			formatTimestamp(timestamp) {
				const date = new Date(timestamp);

				// 转换为 Africa/Accra 时区（UTC+0）
				const utcYear = date.getUTCFullYear();
				const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
				const utcDay = String(date.getUTCDate()).padStart(2, '0');
				const utcHours = String(date.getUTCHours()).padStart(2, '0');
				const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
				const utcSeconds = String(date.getUTCSeconds()).padStart(2, '0');

				// 组合成 yyyy-MM-dd HH:mm:ss 格式
				return `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;
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
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 24rpx;
		border: 2rpx solid #F6F6F6;
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
			width: 40rpx;
			height: 40rpx;
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
		/* margin-right: 30rpx; */
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
			// display: -webkit-box;
			// -webkit-box-orient: vertical;
			// -webkit-line-clamp: 1;
			// overflow: hidden;
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