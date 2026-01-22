import request from './request.js'

// 产品列表
export function productListApi(page) {
	return request({
		url: '/app/product/list?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get',
	})
}

// 产品详情
export function productDetailsApi(productId) {
	return request({
		url: '/app/product/' + productId,
		method: 'get',
	})
}

// 产品购买
export function productBuyApi(productId) {
	return request({
		url: '/app/product/buy/' + productId,
		method: 'get',
	})
}

// 产品支付
export function productPayApi(data) {
	return request({
		url: '/app/product/pay',
		method: 'post',
		data: data
	})
}

// 我进行中的产品
export function productMyRunningApi(page) {
	return request({
		url: '/app/product/my/running?pageNum=' + page.pageNum,
		method: 'get',
	})
}

// 我已完成的产品
export function productMyCompleteApi(page) {
	return request({
		url: '/app/product/my/complete?pageNum=' + page.pageNum,
		method: 'get',
	})
}

// 我的产品详情
export function productMyApi(productId) {
	return request({
		url: '/app/product/my/' + productId,
		method: 'get',
	})
}