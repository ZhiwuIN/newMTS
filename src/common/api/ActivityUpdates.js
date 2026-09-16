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

// 灵活活动基本配置
export function customCycleOverviewApi(data) {
    return request({
        url: '/app/activity/custom-cycle/overview',
        method: 'get',
        data
    })
}

// 用户完成情况
export function customCycleProgressApi(data) {
    return request({
        url: '/app/activity/custom-cycle/progress',
        method: 'get',
        data
    })
}

// Recevoir la recompense d'une etape
export function customCycleClaimApi(data) {
    return request({
        url: '/app/activity/custom-cycle/claim',
        method: 'post',
        data
    })
}

// Historique des recompenses recues
export function customCycleClaimListApi(data) {
    return request({
        url: '/app/activity/custom-cycle/claim/list',
        method: 'get',
        data
    })
}
