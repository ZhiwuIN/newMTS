import request from './request.js'

// 世界杯活动信息
export function activityTeamApi(data) {
    return request({
        url: '/app/activity/team',
        method: 'get',
        data,
    })
}

// 领奖
export function activityTeamClaimApi(data) {
    return request({
        url: '/app/activity/team/claim',
        method: 'post',
        data,
    })
}

// 排行榜(默认前五名)
export function activityTeamRankApi(data) {
    return request({
        url: '/app/activity/team/rank',
        method: 'get',
        data,
    })
}