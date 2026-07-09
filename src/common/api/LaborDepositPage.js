import request from './request.js'

// 活动信息
export function workDepositApi(data) {
    return request({
        url: '/app/work-deposit',
        method: 'get',
        data,
    })
}

// 用户申请资格
export function applyStatusApi(data) {
    return request({
        url: '/app/work-deposit/apply-status',
        method: 'get',
        data,
    })
}

// 申请
export function applyApi(data) {
    return request({
        url: '/app/work-deposit/apply',
        method: 'post',
        data,
    })
}