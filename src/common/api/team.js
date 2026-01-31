import request from './request.js'

// 团队基本信息
export function teamApi(){
	return request({
		url: '/app/team',
		method: 'get',
	})
}

//会员列表
export function teamMemberApi(type,page,params){
	return request({
		url: '/app/teams/'+type+'?pageNum='+page.pageNum+'&pageSize='+ page.pageSize,
		method: 'get',
		data:params
	})
}

//会员详情
export function memberInfoApi(userId){
	return request({
		url: '/app/team/info/'+userId,
		method: 'get',
	})
}

//会员详情
export function memberRebateRecordApi(userId,page){
	return request({
		url: '/app/team/rebate-record/'+userId+'?pageNum='+page.pageNum ,
		method: 'get',
	})
}