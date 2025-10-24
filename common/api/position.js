import request from './request.js'

// 职位列表
export function positionApi(params){
	return request({
		url: '/app/position',
		method: 'get',
		data: params,
	})
}

// 职位详情
export function positionDetailsApi(id){
	return request({
		url: '/app/position/'+id,
		method: 'get',
	})
}


//职位申请
export function positionApplyApi(id){
	return request({
		url: '/app/position/apply/'+id,
		method: 'post',
	})
}


// 我的职位信息
export function positionMyPositionApi(){
	return request({
		url: '/app/position/myPosition/info',
		method: 'get',
	})
}

// 我的有效职位列表
export function positionEffectivePositionApi(){
	return request({
		url: '/app/position/effective-position',
		method: 'get',
	})
}

// 我的职位申请列表
export function positionMyPositionListApi(){
	return request({
		url: '/app/position/myPosition/list',
		method: 'get',
	})
}

// 我的职位申请信息
export function positionMyPositionInfoApi(id){
	return request({
		url: '/app/position/myPosition/' + id,
		method: 'get',
	})
}

// 职位列表页_我的职位
export function positionSubordinateInformationApi(userId){
	return request({
		url: `/app/position/subordinateInformation/${userId}`,
		method: 'get',
	})
}