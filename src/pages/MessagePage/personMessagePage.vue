<template>
	<view>
		<!-- <customnavbar :title="$t('chattingWith', { nickname: conversation.userInfo?.nickname })"> -->
		<customnavbar :title="$t('chattingWithA')+userName+$t('chattingWithB')">
			<view class="main">
				<view class="msg_list" ref="msgListRef">
					<scroll-view scroll-y="true" class="scroll-view" :class="{'isFunction': this.isFunction}"
						id="scroll" :scroll-into-view="scrollIntoId" @scroll="handleScroll"
						@scrolltoupper="scrolltoupper" @click="this.isFunction = false">
						<template v-for="(item, index) in msgList" :key="item.messageId || index">
							<view class="msg_item" :class="{'right': item.direction == 'out'}"
								:id="'msg_' + (item.messageId || index)" v-if="!item.isRevoke">
								<!-- 头像 -->
								<image class="avatar" :src="item.fromUserInfo?.avatarUrl" mode="aspectFill"
									v-if="!item.isRevoke"></image>
								<view :class="item.direction == 'out' ? 'msg_right' : 'msg_left'">
									<!-- 图片消息 -->
									<image @click="previewImage(item.body.originalUrl)"
										:style="'width:' + item.body.thumbnailWidth + 'rpx;height:' + item.body.thumbnailHeight + 'rpx;max-width: 470rpx'"
										:src="item.body.thumbnailUrl" mode="" v-if="item.type == 'image'">
									</image>
									<view v-html="item.body.tips || item.body.text" v-else></view>
								</view>
							</view>
						</template>
						<!-- 锚点 -->
						<view id="bottomAnchor" style="height: 1px;"></view>
					</scroll-view>
				</view>
				<!-- 输入区域 -->
				<view class="bottomMainBox" :class="{'isFunction': isFunction}">
					<view class="bottomBox">
						<view class="inputBox">
							<textarea @click="focusTextarea" class="input-textarea" v-model="message"
								:placeholder="$t('MessagePage.StartWritingMessage')" confirm-type="send"
								placeholder-style="color: #ACACAC;font-size: 28rpx;font-weight: 500;" auto-height
								:fixed="false" :maxlength="1500"
								:style="{width: hasContent ? 'calc(100% - 120rpx)' : '100%'}" />
							<view class="right-button" :class="{'hasContent': hasContent}">
								<image class="inputBox-img" src="/static/massage/more.png" alt="" srcset=""
									@click="searchMember()" :data-hidden="!hasContent" />
								<view class="btnBox" :data-hidden="!hasContent" @click="sendMessage">
									{{$t('MessagePage.send')}}
								</view>
							</view>
						</view>
					</view>
					<!-- 功能面板 -->
					<view class="functionBox">
						<view class="functionItem" @click="chooseImage('album')">
							<image src="/static/massage/Image.png" mode="" class="functionImg"></image>
						</view>
						<view class="functionItem" @click="chooseImage('camera')">
							<image src="/static/massage/Camera.png" mode="" class="functionImg"></image>
						</view>
					</view>
				</view>

				<!-- 回到底部 -->
				<view class="ReturnFoot" @click="ReturnFoot" v-if="isNewMsg">
					<image src="/static/massage/ReturnFoot.png" mode="" class="ReturnFootImg"></image>
					<view>
						{{$t('有新消息')}}
					</view>
				</view>
			</view>
		</customnavbar>
	</view>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				isFunction: false, // 展示功能面板
				imToken: '',
				userId: '',
				conversation: {}, // 会话详情
				conversationId: '',
				message: '',
				msgList: [],
				nextMessageId: '',
				scrollIntoId: '', // 用于scroll-into-view
				autoScroll: true, // 标记是否自动滚动
				more: true, // 是否有更多消息
				userName: '',
				isForTheFirstTime: false,
				functionPanelHeight: 0,
				isNewMsg: false, // 是否在距离底部较远的位置收到新消息,
				avatarUrl: '', // 我的头像
			}
		},
		computed: {
			hasContent() {
				return this.message.length > 0
			}
		},
		methods: {
			// 预览图片
			previewImage(url) {
				uni.previewImage({
					urls: [url],
					showmenu: true,
					longPressActions: {
						itemList: ['保存图片'],
						itemColor: '#fff',
						success: function(data) {
							console.log(data);
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				});
			},
			// 上传图片
			chooseImage(sourceType) {
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: [sourceType],
					success: async (res) => {
						uni.showLoading({
							title: this.$t('MessagePage.send.progress')
						});
						//获取图片信息
						let imageInfo = await uni.getImageInfo({
							src: res.tempFilePaths[0]
						})
						//创建图片消息
						// let message = this.$yeIM.getInstance().createImageMessage({
						// 	toId: this.conversationId, //接收者用户ID字符串
						// 	conversationType: this.$yeIMDefines.CONVERSATION_TYPE.PRIVATE, //会话类型：私聊
						// 	body: {
						// 		file: {
						// 			tempFilePath: res.tempFilePaths[0], //本地图片临时路径
						// 			width: imageInfo.width, //图片宽度
						// 			height: imageInfo.height //图片高度
						// 		}
						// 	},
						// 	extra: "这是拓展的自定义的内容",
						// 	onProgress: (progress) => {
						// 		// console.log('上传进度' + progress.progress);
						// 		// console.log('已经上传的数据长度' + progress.totalBytesSent);
						// 		// console.log('预期需要上传的数据总长度' + progress.totalBytesExpectedToSend);
						// 	}
						// });
						//发送图片消息
						// this.$yeIM.getInstance().sendMessage({
						// 	message: message,
						// 	success: (res) => {
						// 		this.msgList.push({
						// 			direction: 'out',
						// 			body: res.data.body,
						// 			type: 'image',
						// 			fromUserInfo: {
						// 				avatarUrl: this.avatarUrl
						// 			}
						// 		});
						// 		this.$nextTick(() => {
						// 			this.scrollToBottom();
						// 		});
						// 		uni.hideLoading();
						// 	},
						// 	fail: (err) => {
						// 		console.log(err)
						// 		this.$showMessage('warning', this.$t('发送失败'));
						// 		uni.hideLoading();
						// 	}
						// });
					}
				});
			},
			// 回到底部按钮
			ReturnFoot() {
				this.isNewMsg = false
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('.functionBox').boundingClientRect((rect) => {
						this.functionPanelHeight = rect.height;
						this.adjustScrollPosition();
					}).exec();
				});
			},
			// 输入框获得焦点时回到底部
			focusTextarea() {
				this.isFunction = false
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('.functionBox').boundingClientRect((rect) => {
						this.functionPanelHeight = rect.height;
						this.adjustScrollPosition();
					}).exec();
				});
			},
			// 修改消息接收方法
			onMessageReceived(res) {
				this.msgList.push(res);
				if (this.autoScroll) {
					this.$nextTick(() => {
						this.scrollToBottom();
					});
				} else {
					this.isNewMsg = true
				}
				// this.$yeIM.getInstance().clearConversationUnread(this.conversationId);
			},
			// 发送消息
			sendMessage() {
				// let message = this.$yeIM.getInstance().createTextMessage({
				// 	// toId: this.conversation.lastMessage.to,
				// 	toId: this.conversationId,
				// 	conversationType: this.$yeIMDefines.CONVERSATION_TYPE.PRIVATE,
				// 	body: {
				// 		text: this.message
				// 	}
				// });
				uni.showLoading({
					title: this.$t('MessagePage.send.progress')
				});
				// this.$yeIM.getInstance().sendMessage({
				// 	message: message,
				// 	success: () => {
				// 		// 本地先添加消息（模拟即时显示）
				// 		this.msgList.push({
				// 			direction: 'out',
				// 			body: {
				// 				text: this.message
				// 			},
				// 			fromUserInfo: {
				// 				avatarUrl: this.avatarUrl
				// 			}
				// 		});
				// 		console.log(this.msgList)
				// 		this.message = '';
				// 		this.$nextTick(() => {
				// 			this.scrollToBottom();
				// 		});
				// 		// 第一次创建会话
				// 		if (this.isForTheFirstTime) {
				// 			this.getMsgList()
				// 		}
				// 		uni.hideLoading();
				// 	},
				// 	fail: (err) => {
				// 		console.log(err);
				// 		uni.hideLoading();
				// 	}
				// });
			},
			// 加号按钮
			searchMember() {
				// 加号按钮点击事件
				// console.log('点击了加号');
				this.isFunction = !this.isFunction
				if (this.isFunction) {
					// 展开时先获取面板高度
					this.$nextTick(() => {
						const query = uni.createSelectorQuery().in(this);
						query.select('.functionBox').boundingClientRect((rect) => {
							this.functionPanelHeight = rect.height;
							this.adjustScrollPosition();
						}).exec();
					});
				} else {
					// 收起时直接调整
					this.adjustScrollPosition();
				}
			},
			adjustScrollPosition() {
				this.autoScroll = true;
				this.$nextTick(() => {
					this.scrollIntoId = '';
					this.$nextTick(() => {
						this.scrollIntoId = 'bottomAnchor';
					});
				});
			},
			// 滚动到最底部方法
			scrollToBottom() {
				this.$nextTick(() => {
					if (this.msgList.length > 0) {
						const lastMsg = this.msgList[this.msgList.length - 1];
						this.scrollIntoId = 'msg_' + (lastMsg.messageId || this.msgList.length - 1);
					} else {
						this.scrollIntoId = 'bottomAnchor';
					}
				});
			},
			handleScroll(e) {
				const {
					scrollTop,
					scrollHeight
				} = e.detail;
				const query = uni.createSelectorQuery().in(this);
				query.select('.scroll-view').boundingClientRect((rect) => {
					const clientHeight = rect.height; // 可视区域高度
					const remainingScroll = scrollHeight - scrollTop - clientHeight;
					this.autoScroll = remainingScroll < 440;
				}).exec();
			},
			// 第一次聊天记录
			getMsgList() {
				this.isForTheFirstTime = false // 重置第一次加载标志
				this.more = true; // 重置更多消息标志
				// uni.showLoading({
				// 	title: this.$t('loading.btn')
				// });
				// this.$yeIM.getInstance().getHistoryMessageList({
				// 	// nextMessageId: "下一次续拉的消息ID，第一次拉取时不要传入",
				// 	conversationId: this.conversationId,
				// 	success: (res) => {
				// 		// console.log('第一次获取聊天记录', res)
				// 		const outItems = res.data.list.filter(item => item.direction == "out");
				// 		const lastOutItem = outItems.pop(); // 获取最后一个我的消息里面的头像信息
				// 		this.avatarUrl = lastOutItem ? lastOutItem.fromUserInfo.avatarUrl : '';
				// 		if (res.code == 200) {
				// 			this.msgList = res.data.list
				// 			console.log(this.msgList)
				// 			this.nextMessageId = res.data.nextMessageId
				// 			if (this.autoScroll) {
				// 				this.$nextTick(() => {
				// 					this.scrollToBottom();
				// 				});
				// 			}
				// 			this.$yeIM.getInstance().clearConversationUnread(this.conversationId)
				// 		} else {
				// 			this.$showMessage('warning', this.$t('获取聊天记录失败请重试'));
				// 		}
				// 		this.getConversationDetail()
				// 		uni.hideLoading();
				// 	},
				// 	fail: (err) => {
				// 		console.log(err)
				// 		uni.hideLoading();
				// 		if (err.code == 10003) {
				// 			this.$yeIM.getInstance().connect({
				// 				userId: this.userId,
				// 				token: this.imToken,
				// 				success: (response) => {
				// 					if (response.code == 200) {
				// 						this.getMsgList()
				// 					}
				// 				},
				// 				fail: (err) => {
				// 					console.log(err);
				// 				}
				// 			});
				// 		} else if (err.code == 10004) {
				// 			this.isForTheFirstTime = true; // 标记为第一次加载
				// 		}
				// 	}
				// });
			},
			// 滚动上最上获取上一页
			scrolltoupper() {
				if (this.more) {
					// this.$yeIM.getInstance().getHistoryMessageList({
					// 	nextMessageId: this.nextMessageId,
					// 	conversationId: this.conversationId,
					// 	success: (res) => {
					// 		// console.log('上一页聊天记录', res)
					// 		if (res.code == 200) {
					// 			this.msgList.unshift(...res.data.list) // 将新消息添加到列表开头
					// 			this.nextMessageId = res.data.nextMessageId
					// 			if (!res.data.list.length) {
					// 				this.$showMessage('info', this.$t('MessagePage.noMoreMessages'));
					// 				this.more = false;
					// 			}
					// 		} else {
					// 			this.$showMessage('warning', this.$t('获取聊天记录失败请重试'));
					// 		}
					// 	},
					// 	fail: (err) => {
					// 		console.log(err)
					// 	}
					// });
				}

			},
			// 会话详情
			async getConversationDetail() {
				// let result = await this.$yeIM.getInstance().getConversation(this.conversationId)
				// this.conversation = result.message
				// console.log(this.conversation)
			}
		},
		onLoad(options) {
			this.conversationId = options.id
			this.userName = options.name || '--'
			this.userId = uni.getStorageSync('userInfo').userId
			this.imToken = uni.getStorageSync('imToken')
			this.getMsgList()
			// 新消息
			// this.$yeIM.getInstance().addEventListener(this.$yeIMDefines.EVENT.MESSAGE_RECEIVED, (res) => {
			// 	this.onMessageReceived(res)
			// });
			// 撤回消息监听（修复后：跨端支持 App/小程序/浏览器）
			// this.$yeIM.getInstance().addEventListener(this.$yeIMDefines.EVENT.MESSAGE_REVOKED, (res) => {
			// 	try {
			// 		// 1. 使用 uni 跨端 API 获取所有存储键名（替代浏览器的 localStorage）
			// 		const storageInfo = uni.getStorageInfoSync();
			// 		const allKeys = storageInfo.keys; // 所有存储键的数组

			// 		// 2. 遍历筛选出以 "yeim:messageList:" 开头的键
			// 		allKeys.forEach(key => {
			// 			if (key.startsWith('yeim:messageList:')) {
			// 				uni.removeStorageSync(key); // 3. 删除目标缓存（跨端方法）
			// 			}
			// 		});

			// 		// 4. 延迟调用 getMsgList()，确保缓存删除完成（避免时机过短）
			// 		setTimeout(() => {
			// 			this.getMsgList();
			// 		}, 300);
			// 	} catch (err) {
			// 		// 捕获存储操作异常（如权限问题）
			// 		console.error('删除撤回消息缓存失败:', err);
			// 	}
			// });
		},
		onUnload() {
			// console.log('离开页面')
			// this.$yeIM.getInstance().removeEventListener(this.$yeIMDefines.EVENT.MESSAGE_RECEIVED);
			// this.$yeIM.getInstance().removeEventListener(this.$yeIMDefines.EVENT.MESSAGE_REVOKED);
		},
		onShow() {

		},
	}
</script>

<style scoped lang="scss">
	// 回到底部
	.ReturnFoot {
		position: fixed;
		right: 0;
		bottom: 320rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
		color: #4c69ff;
		background-color: #ebf5ff;
		border-radius: 40rpx 0rpx 0rpx 40rpx;
		padding: 12rpx;
		font-size: 26rpx;

		.ReturnFootImg {
			width: 32rpx;
			height: 32rpx;
		}
	}

	.scroll-view {
		height: calc(100vh - 88rpx - 162rpx);

		// #ifdef APP-PLUS
		height: calc(100vh - 88rpx - 180rpx);
		// #endif

		&.isFunction {
			height: calc(100vh - 88rpx - 340rpx);
			// #ifdef APP-PLUS
			height: calc(100vh - 88rpx - 360rpx);
			// #endif
		}
	}

	::v-deep .uni-scroll-view-content {
		display: flex;
		flex-direction: column;
		gap: 40rpx;
	}

	.main {
		padding: 40rpx;

		.msg_list {
			display: flex;
			flex-direction: column;
			// gap: 60rpx;

			.msg_item {
				display: flex;
				gap: 20rpx;


				.avatar {
					width: 64rpx;
					height: 64rpx;
					background: #EBF5FF;
					border-radius: 50%;
				}

				.msg_left {
					padding: 20rpx 30rpx;
					background: #F4F5F6;
					border-radius: 4rpx 40rpx 40rpx 40rpx;
					max-width: 70%;
					word-break: break-word;
				}

				.msg_right {
					padding: 20rpx 30rpx;
					background: #4C69FF;
					color: #FFFFFF;
					border-radius: 40rpx 4rpx 40rpx 40rpx;
					order: -1;
					max-width: 70%;
					word-break: break-word;
				}

				&.left {
					justify-content: start;
				}

				&.right {
					justify-content: end;
				}
			}
		}

		.bottomMainBox {
			box-sizing: border-box;
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			background: #FFFFFF;
			// z-index: 999999;
			transform: translateY(176rpx);
			transition: all 0.3s ease;

			&.isFunction {
				transform: translateY(0);
			}
		}



		.bottomBox {
			box-sizing: border-box;
			width: 100%;
			padding: 16rpx;
			border-top: 2rpx solid #f2f2f2;
			border-bottom: 2rpx solid #f2f2f2;
		}


		.inputBox {
			position: relative;
			display: flex;
			align-items: flex-end;
			gap: 16rpx;

			.input-textarea {
				box-sizing: border-box;
				background: #F2F2F2;
				border-radius: 38rpx;
				padding: 20rpx 30rpx;
				font-size: 28rpx;
				transition: all 0.3s ease;
			}

			.right-button {
				position: relative;
				width: 52rpx;
				height: 52rpx;
				flex-shrink: 0;
				margin-bottom: 10rpx;

				&.hasContent {
					width: 114rpx;
				}
			}

			.btnBox {
				position: absolute;
				// padding: 12rpx 26rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 120rpx;
				height: 62rpx;
				color: #FFFFFF;
				border-radius: 12rpx;
				background-color: #4c69ff;
				opacity: 1;
				white-space: nowrap;
				transform: translate(0, -9%);
				transition: all 0.3s ease;
			}

			.btnBox[data-hidden="true"] {
				opacity: 0;
				transform: translate(100%, -9%);
			}

			.inputBox-img {
				position: absolute;
				width: 52rpx;
				height: 52rpx;
				border-radius: 50%;
				opacity: 1;
				// transform: scale(1);
				transition: all 0.3s ease;
			}

			.inputBox-img[data-hidden="false"] {
				opacity: 0;
				// transform: scale(0.8);

			}

		}

		.functionBox {
			display: flex;
			gap: 32rpx;
			padding: 32rpx;

			.functionItem {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 112rpx;
				height: 112rpx;
				background-color: #f2f2f2;
				border-radius: 24rpx;

				.functionImg {
					width: 52rpx;
					height: 44rpx;
				}
			}
		}
	}
</style>