import request from './request.js'

// 帖子介绍
export function getRewardSettingApi() {
    return request({
        url: '/app/post/reward/setting',
        method: 'get'
    })
}

// 帖子列表
export function getArticleList(data) {
    return request({
        url: '/app/post/list',
        method: 'get',
        data: data,
    })
}

// 帖子详情
export function postInfoApi(id) {
    return request({
        url: `/app/post/${id}`,
        method: 'get'
    })
}

// 发布
export function postAddApi(data) {
    return request({
        url: `/app/post`,
        method: 'post',
        data
    })
}

// 获取帖子的根评论列表
export function commentRootListApi(postId, params) {
    return request({
        url: `/community/comment/root/${postId}`,
        method: 'get',
        data: params
    })
}

// 发布评论
export function commentAddApi(data) {
    return request({
        url: `/community/comment`,
        method: 'post',
        data
    })
}

// 收藏
export function addFavoriteApi(postId) {
    return request({
        url: `/favorite/add/${postId}`,
        method: 'post'
    })
}

// 取消收藏
export function removeFavoriteApi(postId) {
    return request({
        url: `/favorite/remove/${postId}`,
        method: 'post'
    })
}

// 与我有关的文章列表
export function getArticleCategoryList(params) {
    return request({
        url: `/community/my/query`,
        method: 'post',
        data: params
    })
}

// 获取分类列表
export function getCategoryListApi(params) {
    return request({
        url: `/app/post/category/list`,
        method: 'get',
        data: params
    })
}

// 说明
export function getActivityRewardApi(params) {
    return request({
        url: `/app/post/activity/reward`,
        method: 'get',
        data: params
    })
}