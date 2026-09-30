import request from './request.js'

//  GET /app/offline-payout/home 首页统计、可申请类型、最近 5 条记录
//  GET /app/offline-payout/types 启用的申请类型
//  POST /app/offline-payout/apply 提交申请
//  GET /app/offline-payout/records 当前用户申请记录分页
//  GET /app/offline-payout/records/{id} 当前用户申请详情、状态轨迹

// 首页统计、可申请类型、最近 5 条记录
export function offlinePayoutHomeApi(data) {
    return request({
        url: '/app/offline-payout/home',
        method: 'get',
        data,
    })
}

// 启用的申请类型
export function offlinePayoutTypesApi(data) {
    return request({
        url: '/app/offline-payout/types',
        method: 'get',
        data,
    })
}

// 提交申请
export function offlinePayoutApplyApi(data) {
    return request({
        url: '/app/offline-payout/apply',
        method: 'post',
        data,
    })
}

// 当前用户申请记录分页
export function offlinePayoutRecordsApi(data) {
    return request({
        url: '/app/offline-payout/records',
        method: 'get',
        data,
    })
}