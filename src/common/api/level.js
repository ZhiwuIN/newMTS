import request from './request.js'

// 等级信息
export function vipInfoApi(data){
	return request({
		url: '/app/vip/info',
		method: 'post',
		data: data,
	})
}

// 购买等级
export function buyApi(id){
	return request({
		url: '/app/vip/buy/'+id,
		method: 'get'
	})
}