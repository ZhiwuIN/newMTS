import request from './request.js'

//好友列表
export function imListApi(id) {
	return request({
		url: '/app/im/list/' + id,
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