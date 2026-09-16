import request from './request.js'

// 查询商城公共配置
export function shopConfigApi(data) {
    return request({
        url: '/app/activity/shop/overview/config',
        method: 'get',
        data,
    })
}

// 查询商城用户信息
export function shopUserApi(data) {
    return request({
        url: '/app/activity/shop/overview/user',
        method: 'get',
        data,
    })
}

// 查询商城商品列表
/**
 * 
 * @param {*} data 
 * @returns 
 * starLevel (可选)
不传：返回全部启用星级的商品
传值：仅返回对应星级的商品
 */
export function shopProductsApi(data) {
    return request({
        url: '/app/activity/shop/overview/products',
        method: 'get',
        data,
    })
}

// 商品详情
export function shopProductInfoApi(productId) {
    return request({
        url: `/app/activity/shop/product/${productId}`,
        method: 'get'
    })
}

// 下单
/**
 *productId // 必填，商品ID
 * 
 */ 
export function shopOrderApi(data) {
    return request({
        url: '/app/activity/shop/order',
        method: 'post',
        data
    })
}

// 查询商城订单列表
export function shopOrderListApi(data) {
    return request({
        url: '/app/activity/shop/order/list',
        method: 'get',
        data,
    })
}

// 查询p币列表
export function shopPcoinListApi(data) {
    return request({
        url: '/app/activity/shop/pcoin/list',
        method: 'get',
        data,
    })
}

// 商城规则
export function shopDescriptionApi() {
    return request({
        url: '/app/activity/shop/description',
        method: 'get'
    })
}