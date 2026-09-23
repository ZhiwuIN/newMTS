<template>
	<view>
		<customnavbar :title="$t('chattingWithA') + userName + $t('chattingWithB')">
			<view class="main">
				<view class="msg_list" ref="msgListRef">
					<scroll-view scroll-y="true" class="scroll-view" :class="{ 'isFunction': isFunction }" id="scroll"
						:scroll-into-view="scrollIntoId" @scroll="handleScroll" @click="isFunction = false"
						@scrolltoupper="scrolltoupper">
						<view class="msg_item" v-for="(item, index) in msgs" :key="item.id || index"
							:class="{ 'right': item.sendId == userId, highlighted: highlightedId === item.id }"
							:id="'msg_' + (item.id || index)" @longpress="onMessageLongPress(item)">
							<!-- 头像 -->
							<image class="avatar" :src="item.sendId == proxyId ? peerAvatar : myAvatar"
								mode="aspectFill"></image>
							<view :class="item.sendId == proxyId ? 'msg_left' : 'msg_right'">
								<!-- 引用块：在气泡内顶部，点击跳转到被引用消息 -->
								<view v-if="item.quoteMessage" class="quote_block"
									@tap.stop="scrollToQuote(item.quoteMessage.id)">
									<text class="quote_author">{{ item.quoteMessage.sendName || '' }}: </text>
									<text class="quote_content">{{ item.quoteMessage.content || '' }}</text>
								</view>
								<!-- 图片消息 -->
								<image v-if="item.type == 1" @click="previewImage(item.content)" style="width: 470rpx;"
									:src="item.content" mode="widthFix"></image>
								<template v-else>
									<view v-html="item.content"></view>
									<view v-if="item.sendId == userId && item.edited" class="msg_edited">
										{{ $t('MessagePage.edited') }}
									</view>
								</template>
							</view>
						</view>
						<!-- 锚点 -->
						<view id="bottomAnchor" style="height: 1px;"></view>
					</scroll-view>
				</view>

				<!-- 长按消息操作菜单 -->
				<view v-if="actionTarget" class="action_sheet_mask" @click="closeActionSheet">
					<view class="action_sheet" @click.stop>
						<view v-if="actionTarget.type != 1" class="action_item" @click="quoteMessage(actionTarget)">{{
							$t('MessagePage.quote') }}</view>
						<view v-if="actionTarget.type != 1" class="action_item" @click="copyContent">{{
							$t('MessagePage.copy') }}</view>
					</view>
				</view>

				<!-- 引用预览条：紧贴输入区域上方 -->
				<view v-if="quotingMsg" class="quote_preview" :class="{ isFunction: isFunction }">
					<view class="quote_preview_main">
						<text class="quote_preview_label">{{ $t('MessagePage.quote') }}</text>
						<text class="quote_preview_text" space="nbsp">{{ quotePreviewText }}</text>
					</view>
					<view class="quote_preview_close" @click="cancelQuote">×</view>
				</view>

				<!-- 输入区域 -->
				<view class="bottomMainBox" :class="{ 'isFunction': isFunction }">
					<view class="bottomBox">
						<view class="inputBox">
							<textarea @click="focusTextarea" class="input-textarea" v-model="message"
								:placeholder="$t('MessagePage.StartWritingMessage')" confirm-type="send"
								placeholder-style="color: #ACACAC;font-size: 28rpx;font-weight: 500;" auto-height
								:fixed="false" :maxlength="1500"
								:style="{ width: hasContent ? 'calc(100% - 120rpx)' : '100%' }" />
							<view class="right-button" :class="{ 'hasContent': hasContent }">
								<image class="inputBox-img" src="/static/massage/more.png" alt="" srcset=""
									@click="searchMember()" :data-hidden="!hasContent" />
								<view class="btnBox" :data-hidden="!hasContent" @click="sendMessage">
									{{ $t('MessagePage.send') }}
								</view>
							</view>
						</view>
					</view>
					<!-- 功能面板 -->
					<view class="functionBox">
						<view class="functionItem" @click="chooseImage('album')">
							<image src="/static/massage/Image.png" class="functionImg"></image>
						</view>
						<view class="functionItem" @click="chooseImage('camera')">
							<image src="/static/massage/Camera.png" class="functionImg"></image>
						</view>
					</view>
				</view>

				<!-- 回到底部 -->
				<view class="ReturnFoot" @click="ReturnFoot" v-if="isNewMsg">
					<image src="/static/massage/ReturnFoot.png" class="ReturnFootImg"></image>
					<view>
						{{ $t('有新消息') }}
					</view>
				</view>
			</view>
		</customnavbar>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	messageListApi,
	messageSendApi,
	messageReadApi,
	getHaveNewMessageApi
} from "@/common/api/message.js";
import { messageBadgeManager } from '@/common/api/messageBadge.js';
import { base_url } from '@/common/api/request.js';

const DEFAULT_AVATAR = '/static/default-avatar.png'
const DEFAULT_AVATAR2 = '/static/1024.png'

// URL query 里带过来的昵称 / 头像可能已被解码，这里做一次安全解码
function safeDecode(value) {
	if (!value) return ''
	try {
		return decodeURIComponent(value)
	} catch (e) {
		return value
	}
}

export default {
	components: {
		customnavbar
	},
	data() {
		return {
			// 会话对象 id（好友 userId）
			proxyId: '',
			userId: '',
			userName: '--',
			peerAvatar: DEFAULT_AVATAR2,
			myAvatar: DEFAULT_AVATAR,
			isFunction: false, // 展示功能面板
			message: '',
			msgList: [],
			pageNum: 1,
			pageSize: 20,
			total: 0,
			scrollIntoId: '', // 用于 scroll-into-view
			autoScroll: true, // 标记是否自动滚动
			more: true, // 是否有更多消息
			functionPanelHeight: 0,
			isNewMsg: false, // 是否在距离底部较远的位置收到新消息
			// 长按操作菜单：当前选中的消息
			actionTarget: null,
			// 进入聊天页后的 5s 未读轮询
			pollTimer: null,
			// 引用模式：当前正在引用的消息
			quotingMsg: null,
			// 跳转定位：被高亮的消息 id
			highlightedId: null,
			_highlightTimer: null
		}
	},
	computed: {
		hasContent() {
			return this.message.length > 0
		},
		// 按 id 升序展示
		msgs() {
			return this.msgList.slice().sort((a, b) => a.id - b.id)
		},
		// 引用预览条文案：图片消息用占位符
		quotePreviewText() {
			const item = this.quotingMsg
			if (!item) return ''
			if (item.type == 1) return '[' + this.$t('图片') + ']'
			return String(item.content ?? '')
		}
	},
	onLoad(options) {
		this.proxyId = options.id
		this.userName = this.$t('业务经理')
		this.peerAvatar = DEFAULT_AVATAR2
		const userInfo = uni.getStorageSync('userInfo') || {}
		this.userId = userInfo.userId
		this.myAvatar = userInfo.avatar || DEFAULT_AVATAR
		this.getMsgList()
		// 进入具体会话：标记已读 + 本地乐观清零 badge
		this.messageRea(this.proxyId)
		messageBadgeManager.clearLocal()
		messageBadgeManager.refresh()
		// 启动 5s 轮询：发现当前会话有新未读就拉取合并
		this.startPoll()
	},
	onUnload() {
		this.stopPoll()
		if (this._highlightTimer) {
			clearTimeout(this._highlightTimer)
			this._highlightTimer = null
		}
	},
	methods: {
		// 设置消息已读
		messageRea(friendId) {
			if (!friendId) return
			messageReadApi(friendId).catch(() => { })
		},
		// 启动 5s 轮询：查当前会话是否有新未读，有则拉取合并
		startPoll() {
			this.stopPoll()
			this.pollTimer = setInterval(() => this.pollUnread(), 5000)
			this.pollUnread() // 立即查一次
		},
		stopPoll() {
			if (this.pollTimer) {
				clearInterval(this.pollTimer)
				this.pollTimer = null
			}
		},
		// 轮询体：调 exists，发现当前会话 sendId 有未读就 fetchNewMsgs + 标已读
		async pollUnread() {
			try {
				const res = await getHaveNewMessageApi()
				if (res?.code !== 200 || !Array.isArray(res.data)) return
				const hasNewForMe = res.data.some((u) => String(u.sendId) === String(this.proxyId))
				if (!hasNewForMe) return
				await this.fetchNewMsgs()
				this.messageRea(this.proxyId)
			} catch (e) {
				// 静默
			}
		},
		// 拉当前会话最新消息，按 id 去重合并到 msgList
		async fetchNewMsgs() {
			const msg = await messageListApi({
				friendId: this.proxyId,
				page: 1,
				size: this.pageSize
			})
			// 该接口可能返回 { total, rows }，也可能带 code 包装，这里只取 rows
			const rows = msg?.data.rows || []
			const existingIds = new Set((this.msgList || []).map((m) => m.id))
			const newMsgs = rows.filter((m) => m.id != null && !existingIds.has(m.id))
			if (newMsgs.length === 0) return
			this.msgList.push(...newMsgs)
			if (this.autoScroll) {
				this.$nextTick(() => this.scrollToBottom())
			} else {
				this.isNewMsg = true
			}
			this.$nextTick(() => this.adjustScrollPosition())
		},
		// 预览图片
		previewImage(url) {
			uni.previewImage({
				urls: [url],
				showmenu: true,
				longPressActions: {
					itemList: ['保存图片'],
					itemColor: '#fff',
					success: function (data) {
						console.log(data);
					},
					fail: function (err) {
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
					try {
						await uni.getImageInfo({
							src: res.tempFilePaths[0]
						})
					} catch (e) {
						console.log(e)
					}
					uni.uploadFile({
						url: base_url + '/s3/uploads',
						filePath: res.tempFilePaths[0],
						name: 'file',
						header: {
							'Authorization': 'Bearer ' + uni.getStorageSync('token')
						},
						success: async ({ data }) => {
							try {
								const obj = JSON.parse(data)
								const msgRes = await messageSendApi({
									recvId: this.proxyId,
									content: obj.data[0],
									type: 1
								})
								if (msgRes.code == 200 && msgRes.data) {
									this.msgList.push(msgRes.data)
									this.$nextTick(() => {
										this.scrollToBottom();
									});
								}
							} catch (err) {
								console.log(err)
							} finally {
								uni.hideLoading()
							}
						},
						fail: (err) => {
							console.log(err)
							uni.hideLoading()
						}
					})
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
		// 长按消息：弹出操作菜单
		onMessageLongPress(item) {
			this.actionTarget = item
		},
		// 关闭操作菜单
		closeActionSheet() {
			this.actionTarget = null
		},
		// 复制消息内容到剪贴板
		copyContent() {
			const item = this.actionTarget
			this.closeActionSheet()
			if (!item || item.type == 1) return
			uni.setClipboardData({
				data: String(item.content ?? ''),
				success: () => {
					uni.showToast({ title: this.$t('MessagePage.copy'), icon: 'none' })
				}
			})
		},
		// 引用：把目标消息存到 quotingMsg，等发送时带 quoteMessageId
		quoteMessage(item) {
			this.closeActionSheet()
			if (!item || item.status === 2) {
				// status=2 是撤回消息，不允许引用
				return
			}
			this.quotingMsg = item
		},
		// 取消引用
		cancelQuote() {
			this.quotingMsg = null
		},
		// 点击引用块：跳转到被引用的消息（找不到则提示向上滚动）
		scrollToQuote(quoteId) {
			if (quoteId == null) return
			const target = (this.msgList || []).find((m) => m.id === quoteId)
			if (!target) {
				uni.showToast({
					title: this.$t('MessagePage.quote.notFound'),
					icon: 'none'
				})
				return
			}
			// 关闭长按菜单（防止点引用块同时触发）
			this.closeActionSheet()
			this.autoScroll = true
			this.scrollIntoId = 'msg_' + target.id
			// 高亮 1.2s
			this.highlightedId = target.id
			if (this._highlightTimer) clearTimeout(this._highlightTimer)
			this._highlightTimer = setTimeout(() => {
				this.highlightedId = null
				this._highlightTimer = null
			}, 1200)
		},
		// 发送消息
		sendMessage() {
			if (!this.message) return
			uni.showLoading({
				title: this.$t('MessagePage.send.progress')
			});
			const quoteId = this.quotingMsg?.id ?? null
			messageSendApi({
				recvId: this.proxyId,
				content: this.message,
				type: 0,
				quoteMessageId: quoteId
			}).then((res) => {
				if (res.code == 200 && res.data) {
					this.msgList.push(res.data)
				}
				this.message = '';
				this.quotingMsg = null;
				this.$nextTick(() => {
					this.scrollToBottom();
				});
			}).catch((err) => {
				console.log(err)
				if (err?.msg) this.$showMessage('warning', err.msg)
			}).finally(() => {
				uni.hideLoading()
			})
		},
		// 加号按钮
		searchMember() {
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
					this.scrollIntoId = 'msg_' + (lastMsg.id || this.msgList.length - 1);
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
			this.more = true; // 重置更多消息标志
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			messageListApi({
				friendId: this.proxyId,
				page: this.pageNum,
				size: this.pageSize
			}).then((res) => {
				this.total = res.total
				// 按 id 升序，保证 scrollToBottom 拿到的最后一条是最新消息
				this.msgList = (res.data.rows || []).slice().sort((a, b) => a.id - b.id)
				this.$nextTick(() => {
					this.scrollToBottom();
				});
			}).catch((err) => {
				console.log(err)
			}).finally(() => {
				uni.hideLoading()
			})
		},
		// 滚动到最上获取上一页
		scrolltoupper() {
			if (!this.more) return
			if (this.msgList.length >= this.total) return
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			messageListApi({
				friendId: this.proxyId,
				page: Math.ceil(this.msgList.length / this.pageSize) + 1,
				size: this.pageSize
			}).then((res) => {
				const list = res.data.rows || []
				// 合并列表（按 id 去重）
				this.msgList.unshift(...list.filter((v) => !this.msgList.some((v2) => v2.id == v.id)))
			}).catch((err) => {
				console.log(err)
			}).finally(() => uni.hideLoading())
		}
	}
}
</script>

<style scoped lang="scss">
// 长按消息操作菜单遮罩
.action_sheet_mask {
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action_sheet {
	width: 70%;
	background: #FFFFFF;
	border-radius: 16rpx;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	padding: 12rpx 0;

	.action_item {
		padding: 28rpx 24rpx;
		font-size: 30rpx;
		color: #1A1A1A;
		text-align: center;
		border-bottom: 1rpx solid #F2F2F2;

		&:last-child {
			border-bottom: none;
		}

		&.action_danger {
			color: #FA5151;
		}
	}
}

// 自己消息的「已编辑」标记
.msg_edited {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.7);
	margin-top: 4rpx;
	align-self: flex-end;
}

// 点击引用块跳转时，目标消息的高亮
.msg_item.highlighted {
	animation: msgHighlight 1.2s ease;

	.msg_left,
	.msg_right {
		animation: msgHighlightBubble 1.2s ease;
	}
}

@keyframes msgHighlight {
	0% {
		background-color: rgba(1, 69, 241, 0.10);
	}

	100% {
		background-color: transparent;
	}
}

@keyframes msgHighlightBubble {
	0% {
		box-shadow: 0 0 0 4rpx rgba(1, 69, 241, 0.45);
	}

	100% {
		box-shadow: 0 0 0 0 transparent;
	}
}

// 消息气泡内引用块
.quote_block {
	background: rgba(0, 0, 0, 0.06);
	border-left: 4rpx solid rgba(0, 0, 0, 0.25);
	padding: 8rpx 12rpx;
	margin-bottom: 8rpx;
	border-radius: 6rpx;
	font-size: 24rpx;
	line-height: 1.4;
	max-width: 100%;
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.msg_left .quote_block {
	color: #555;
}

.msg_right .quote_block {
	background: rgba(255, 255, 255, 0.18);
	border-left-color: rgba(255, 255, 255, 0.6);
	color: rgba(255, 255, 255, 0.85);
}

.quote_author {
	font-weight: 600;
}

.quote_content {
	opacity: 0.85;
}

// 输入框上方的引用预览条
.quote_preview {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 176rpx;
	background: #FFFFFF;
	border-top: 1rpx solid #ECECEC;
	padding: 16rpx 32rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
	z-index: 100;

	// #ifdef APP-PLUS
	bottom: 180rpx;
	// #endif
}

.quote_preview.isFunction {
	// bottomMainBox 滑上来时，引用条跟着滑上来
	bottom: 340rpx;

	// #ifdef APP-PLUS
	bottom: 360rpx;
	// #endif
}

.quote_preview_main {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.quote_preview_label {
	font-size: 24rpx;
	color: $themeColor;
	font-weight: 600;
}

.quote_preview_text {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.4;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.quote_preview_close {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	color: #999999;
	line-height: 1;
}

// 回到底部
.ReturnFoot {
	position: fixed;
	right: 0;
	bottom: 320rpx;
	display: flex;
	align-items: center;
	gap: 12rpx;
	color: $themeColor;
	background-color: #e9f3ff;
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
				background: $themeColor;
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
			display: flex;
			align-items: center;
			justify-content: center;
			width: 120rpx;
			height: 62rpx;
			color: #FFFFFF;
			border-radius: 12rpx;
			background-color: $themeColor;
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
			transition: all 0.3s ease;
		}

		.inputBox-img[data-hidden="false"] {
			opacity: 0;
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
			border-radius: 12rpx;

			.functionImg {
				width: 52rpx;
				height: 44rpx;
			}
		}
	}
}
</style>
