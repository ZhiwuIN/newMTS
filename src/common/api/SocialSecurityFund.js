import request from './request.js'

// 产品列表
export function shebaoFundOverviewApi(data) {
    return request({
        // url: '/app/shebao-fund/list',
        url: '/app/shebao-fund/overview',
        method: 'get',
        data,
    })
}

// 购买产品
export function shebaoFundOrderApi(data) {
    return request({
        url: '/app/shebao-fund/order',
        method: 'post',
        data,
    })
}

// 我的全部社保基金记录
export function shebaoFundMyAllApi(data) {
    return request({
        url: '/app/shebao-fund/my/all',
        method: 'get',
        data,
    })
}

// 已购买统计信息
export function shebaoFundHomeApi(data) {
    return request({
        url: '/app/shebao-fund/home',
        method: 'get',
        data,
    })
}

export function shebaoFundConfigApi(data) {
    return request({
        url: '/app/shebao-fund/config',
        method: 'get',
        data,
    })
}