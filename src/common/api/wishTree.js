import request from './request.js'

// 查询用户心愿树概览
export function wishTreeOverviewApi(data) {
    return request({
        url: '/app/activity/wishTree/overview',
        method: 'get',
        data
    })
}

// 抽奖
export function wishTreeShakeApi(data) {
    return request({
        url: '/app/activity/wishTree/shake',
        method: 'post',
        data
    })
}


// 领取奖励
export function wishTreeClaimApi(data) {
    return request({
        url: '/app/activity/wishTree/claim',
        method: 'post',
        data
    })
}

// 全部领取
export function wishTreeClaimAllApi(data) {
    return request({
        url: '/app/activity/wishTree/claimAll',
        method: 'post',
        data
    })
}

// 查询用户抽奖记录
export function wishTreeRecordListApi(data) {
    return request({
        url: '/app/activity/wishTree/record/list',
        method: 'get',
        data
    })
}

// 清空奖励列表
export function wishTreePendingClearApi(data) {
    return request({
        url: '/app/activity/wishTree/pending/clear',
        method: 'post',
        data
    })
}

// 活动说明
export function wishTreeDescriptionApi(data) {
    return request({
        url: '/app/activity/wishTree/description',
        method: 'get',
        data
    })
}

// 心愿树滚动公告
export function wishTreeNoticeApi(data) {
    return request({
        url: '/app/activity/wishTree/notice',
        method: 'get',
        data
    })
}