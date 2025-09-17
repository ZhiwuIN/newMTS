import request from './request.js'

// 渠道列表
export function depositListApi(data){
	return request({
		url: '/app/deposit/list',
		method: 'get',
		data: data,
	})
}

// 充值接口
export function depositApi(data){
	return request({
		url: '/app/user/deposit',
		method: 'post',
		data: data,
	})
}

//财务记录
export function financialRecordsApi(type, page){
	return request({
		url: '/app/user/financial-records/'+type +'?pageNum='+ page.pageNum +'&pageSize=' + page.pageSize,
		method: 'get',
	})
}

//绑定支付方式
export function bindPaymentApi(data){
	return request({
		url: '/app/deposit/bind-payment',
		method: 'post',
		data:data
	})
}

// 提现详情
export function finanWithdrawalApi(id){
	return request({
		url: '/app/withdrawal/'+id,
		method: 'get',
	})
}