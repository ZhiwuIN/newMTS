import { getHaveNewMessageApi } from '@/common/api/message.js'

// 未读 badge 管理器：事件驱动，refresh() 由各页面 / App onShow 触发。
// 目标项目没有消息 tab，未读红点由 home-navbar 右上角消息图标订阅展示，
// 因此这里只维护未读用户集合与总数，不再调用 setTabBarBadge。
class MessageBadgeManager {
	constructor() {
		this.currentCount = 0
		this.unreadUserIds = new Set()
		this.countListeners = []
		this.userListeners = []
	}

	// 只计算 IM 私聊未读：data 即有未读消息的会话列表
	// 每次调用都真的发请求（不做合并），让 Network 面板能直观看到
	async refresh() {
		// 未登录时直接跳过，避免登录页触发 401 跳转
		const token = uni.getStorageSync('token')
		if (!token) {
			this.update(0)
			return
		}
		try {
			const res = await getHaveNewMessageApi()
			if (res?.code === 200) {
				const list = Array.isArray(res.data) ? res.data : []
				const ids = new Set(
					list
						.map((u) => String(u.sendId ?? u.userId ?? u))
						.filter(Boolean)
				)
				this.unreadUserIds = ids
				this.userListeners.forEach((fn) => fn(ids))
				this.update(ids.size)
			}
		} catch (e) {
			console.warn('[messageBadge] refresh failed:', e)
		}
	}

	// 乐观清零：进入具体会话时调用，后端 messageReadApi 已标已读，本地立刻清 badge
	clearLocal() {
		const empty = new Set()
		this.unreadUserIds = empty
		this.userListeners.forEach((fn) => fn(empty))
		this.update(0)
	}

	getCount() {
		return this.currentCount
	}

	// 会话列表用：判断某个 userId 是否有未读
	hasUnreadForUser(sendId) {
		return this.unreadUserIds.has(String(sendId))
	}

	// 会话列表订阅：unreadUserIds 变化时回调，组件立即同步
	onUnreadUsersChange(fn) {
		this.userListeners.push(fn)
		// 立即推一次当前值（订阅时可能已有数据）
		fn(this.unreadUserIds)
		return () => {
			this.userListeners = this.userListeners.filter((l) => l !== fn)
		}
	}

	// 未读总数订阅（导航栏红点用）
	subscribe(fn) {
		this.countListeners.push(fn)
		// 立即推一次当前值
		fn(this.currentCount)
		return () => {
			this.countListeners = this.countListeners.filter((l) => l !== fn)
		}
	}

	update(count) {
		this.currentCount = count
		this.countListeners.forEach((fn) => fn(count))
	}
}

export const messageBadgeManager = new MessageBadgeManager()

export default messageBadgeManager
