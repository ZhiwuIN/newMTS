import request from './request.js'

// 活动中心列表
export function activityListApi(data) {
    return request({
        url: '/app/activity/center',
        method: 'get',
        data,
    })
}

// 活动中心
export function activityCenterApi(data) {
    return request({
        url: '/app/active-center',
        method: 'get',
        data,
    })
}