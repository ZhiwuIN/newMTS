import request from './request.js'

// 查询当前登录用户本周活动概览
export function weeklyOverviewApi(data) {
    return request({
        url: '/app/activity/weekly/overview',
        method: 'get',
        data
    })
}

// 领取记录列表
export function weeklyClaimListApi(data) {
    return request({
        url: '/app/activity/weekly/claim/list',
        method: 'get',
        data
    })
}

// 领取每周活动奖励
export function weeklyClaimApi(data) {
    return request({
        url: '/app/activity/weekly/claim',
        method: 'post',
        data
    })
}

