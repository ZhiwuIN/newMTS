import request from './request.js'

// 任务统计
export function taskInfoApi(params){
	return request({
		url: '/app/task/info',
		method: 'get',
	})
}

// 任务列表
export function taskListApi(params){
	return request({
		url: '/app/task/list?pageNum='+params.pageNum+'&pageSize='+ params.pageSize,
		method: 'get',
	})
}

//任务详情
export function taskDetailsApi(id){
	return request({
		url: '/app/task/detail/'+id,
		method: 'get',
	})
}

//答题
export function questionApi(data){
	return request({
		url: '/app/task/question/',
		method: 'post',
		data
	})
}

// 点赞&取消点赞&收藏&取消收藏
export function taskActionApi(data){
	return request({
		url: '/app/task/action',
		method: 'post',
		data
	})
}