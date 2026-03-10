import request from './request.js'

// 最大星级福袋
export function luckybagMaxApi(){
    return request({
        url: '/app/luckybag/max',
        method: 'get'
    })
}

// 打开福袋
export function luckybagOpenApi(starLevel){
    return request({
        url: `/app/luckybag/open/${starLevel}`,
        method: 'post'
    })
}

// 福袋列表
export function luckybagListApi(){
    return request({
        url: `/app/luckybag/info`,
        method: 'get'
    })
}

// 记录列表
export function luckyBagRecordListApi(pages){
    return request({
        url: `/app/luckybag/list`,
        method: 'get',
        data: pages
    })
}

// 获奖记录展示
export function luckybagNoticeListApi(){
    return request({
        url: `/app/luckybag/notice-list`,
        method: 'get'
    })
}