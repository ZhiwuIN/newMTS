import request from './request.js'

//修改提现密码
export function withdrawalPasswordApi(params){
	return request({
		url: '/app/withdrawal/password',
		method: 'post',
		data: params,
	})
}

//银行列表
export function bankListApi(){
	return request({
		url: '/app/withdrawal/list',
		method: 'get'
	})
}

// 提现接口
export function withdrawalApi(data){
	return request({
		url: '/app/withdrawal',
		method: 'post',
		data: data,
	})
}

// 提现接口
export function withdrawalInfoApi(){
	return request({
		url: '/app/withdrawal',
		method: 'get',
	})
}

// 提现手续费
export function withdrawalFeeApi(data){
	return request({
		url: '/app/withdrawal/fee',
		method: 'post',
		data
	})
}
// 提现自定义金额
export function withdrawalCustomizedAmountApi(grade){
	return request({
		url: '/app/withdrawal/customized-amount/' + grade,
		method: 'get'
	})
}

// 系统银行
export function withdrawalbankSysListApi(){
	return request({
		url: '/app/withdrawal/bank',
		method: 'get'
	})
}

// 删除用户绑定银行
export function withdrawalbankDelApi(id){
	return request({
		url: '/app/withdrawal/' + id,
		method: 'delete'
	})
}