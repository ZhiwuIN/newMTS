import request from './request.js'

// 获取任务列表
export function getTaskLists() {
	return request({
		url: '/app/task/lists',
		method: 'get',
	})
}

//任务详情
export function taskDetailsApi(id) {
	return request({
		url: '/app/task/detail/' + id,
		method: 'get',
	})
}

/// 获取当天任务配额
export function getTheTaskQuotaOfTheDay() {
	return request({
		url: '/app/task/getTheTaskQuotaOfTheDay',
		method: 'GET',
	})
}

// 提交
export function paymentApi(data) {
	return request({
		url: '/app/task/payment',
		method: 'POST',
		data
	})
}

// 购买记录
export function purchaseRecordApi(id, params) {
	return request({
		url: '/app/task/purchaseRecord/' + id + '?pageNum=' + params.pageNum + '&pageSize=' + params.pageSize,
		method: 'GET',
	})
}

// 打开密码弹框前校验
export function shopNowApi(data) {
	return request({
		url: '/app/task/shop-now',
		method: 'POST',
		data
	})
}