import request from './request.js'

// 团队基本信息
export function teamApi() {
	return request({
		url: '/app/team',
		method: 'get',
	})
}

//会员列表
export function teamMemberApi(type, page, params) {
	return request({
		url: '/app/team/' + type + '?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get',
		data: params
	})
}

//会员详情
export function memberInfoApi(userId) {
	return request({
		url: '/app/team/info/' + userId,
		method: 'get',
	})
}

//会员详情
export function memberRebateRecordApi(userId, page) {
	return request({
		url: '/app/team/rebate-record/' + userId + '?pageNum=' + page.pageNum,
		method: 'get',
	})
}

// 我的明细(上半部分)
export function incomeDetailApi() {
	return request({
		url: '/app/team/income-detail',
		method: 'get',
	})
}

// 我的明细(下半部分)
export function incomeMembersApi(page) {
	return request({
		url: '/app/team/income-members?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get',
	})
}

// 团队成员明细(上半部分)
export function incomeDetailSonApi(subordinateId) {
	return request({
		url: `/app/team/income-detail/${subordinateId}`,
		method: 'get',
	})
}

// 团队成员明细(下半部分)
export function incomeMembersSonApi(subordinateId, page) {
	return request({
		url: `/app/team/income-members/${subordinateId}?pageNum=${page.pageNum}&pageSize=${page.pageSize}`,
		method: 'get',
	})
}

// 团队介绍
export function teamDescriptionApi() {
	return request({
		url: '/app/settings/team-description',
		method: 'get',
	})
}
