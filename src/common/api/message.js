import request from './request.js'

//好友列表
export function imListApi() {
	return request({
		url: '/app/im/list',
		method: 'get'
	})
}

// 最新系统信息
export function messageNewApi() {
	return request({
		url: '/app/message/new',
		method: 'get'
	})
}

// 发送消息
export function messageSendApi(params) {
	return request({
		url: '/app/im/message',
		method: 'post',
		data: params
	})
}

// 获取历史消息列表
export function messageListApi(params) {
	return request({
		url: '/app/im/messages/conversation/' + params.friendId,
		method: 'get',
		data: {
			pageNum: params.page,
			pageSize: params.size
		}
	})
}

// 最新公司消息
export function noticeMessageApi() {
	return request({
		url: '/app/message/notice',
		method: 'get'
	})
}

// 公司消息列表
export function companyMessageListApi(params) {
	return request({
		url: '/app/message/company-message/list',
		method: 'get',
		data: params
	})
}

// 设置已读
export function messageReadApi(friendId) {
	return request({
		url: `/app/im/messages/conversation/${friendId}/read`,
		method: 'post'
	})
}

// 修改消息内容（仅发送者可修改）
export function messageUpdateApi(id, content) {
	return request({
		url: `/app/im/message/${id}`,
		method: 'put',
		data: { content }
	})
}

// 撤回/删除消息（仅发送者可操作）
export function messageDeleteApi(id) {
	return request({
		url: `/app/im/message/${id}`,
		method: 'delete'
	})
}

// 获取单条消息详情
export function messageGetApi(id) {
	return request({
		url: `/app/im/message/${id}`,
		method: 'get'
	})
}

// 当前用户所有历史消息
export function messageMyListApi() {
	return request({
		url: '/app/im/messages/me',
		method: 'get'
	})
}

// 获取是否有未读消息
export function getHaveNewMessageApi() {
	return request({
		url: '/app/im/messages/unread/exists',
		method: 'get'
	})
}
