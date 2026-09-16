import request from './request.js'

//查询抽奖奖品
export function honorPrizeApi() {
	return request({
		url: '/app/honor/prize',
		method: 'get'
	})
}

//查询抽奖次数
export function honorCountApi(params) {
	return request({
		url: '/app/honor/times',
		method: 'get',
		data: params
	})
}

//抽奖
export function honorApi() {
	return request({
		url: '/app/honor/draw',
		method: 'get'
	})
}

//查询个人获奖记录
export function honorRecordMyApi(page) {
	return request({
		url: '/app/honor/person?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get'
	})
}