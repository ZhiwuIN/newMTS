import request from './request.js'

// 公司信息
export function companyInfoApi(data) {
	return request({
		url: '/app/company',
		method: 'get',
		data: data,
	})
}

// 悬浮联系方式
export function getProxy() {
	return request({
		url: '/app/proxy',
		method: 'get',
	})
}

//语言配置
// export function languageApi(data){
// 	return request({
// 		url: '/app/language',
// 		method: 'get',
// 		data: data,
// 	})
// }

//查询图文分类
export function noticeCategoryApi(data) {
	return request({
		url: '/app/notice/category',
		method: 'get',
		data: data,
	})
}

//查询图文信息
//查询图文信息
export function noticeListApi(gropid, page) {
	return request({
		url: '/app/notice/list/' + gropid + '?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get'
	})
}

// export function noticeListApi(gropid, page, lang) {
// 	return request({
// 		url: '/app/notice/list/' + gropid + '?pageNum=' + page.pageNum + '&lang=' + lang,
// 		method: 'get'
// 	})
// }

//查询图文详细信息
export function noticeDetailsApi(id) {
	return request({
		url: '/app/notice/detail/' + id,
		method: 'get'
	})
}
//查询抽奖奖品(幸运)
export function luckyPrizeApi() {
	return request({
		url: '/app/lucky/prize',
		method: 'get'
	})
}
//查询抽奖次数
export function luckyCountApi() {
	return request({
		url: '/app/lucky/times',
		method: 'get'
	})
}
//抽奖(幸运)
export function luckyApi() {
	return request({
		url: '/app/lucky/draw',
		method: 'get'
	})
}

//查询抽奖奖品(积分)
export function pointPrizeApi() {
	return request({
		url: '/app/point/prize',
		method: 'get'
	})
}
//查询抽奖次数(积分)
// export function pointCountApi() {
// 	return request({
// 		url: '/app/point/times',
// 		method: 'get'
// 	})
// }
//抽奖(积分)
export function pointApi() {
	return request({
		url: '/app/point/draw',
		method: 'get'
	})
}

//查询获奖记录
export function luckyRecordApi() {
	return request({
		url: '/app/lucky/win-record',
		method: 'get'
	})
}

//查询自定义获奖记录
export function luckyCustomDrawResultApi() {
	return request({
		url: '/app/lucky/custom-draw-result',
		method: 'get'
	})
}

//查询个人获奖记录
export function luckyRecordMyApi(page) {
	return request({
		url: '/app/lucky/person?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get'
	})
}
//查询抽奖记录
export function luckyHistoryApi() {
	return request({
		url: '/app/lucky/raffle-record',
		method: 'get'
	})
}

//首页轮播图
export function slideListApi() {
	return request({
		url: '/app/slide/list',
		method: 'get'
	})
}

//消息列表
export function messageListApi(page) {
	return request({
		url: '/app/message/list?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get'
	})
}
//消息已读
export function messageReadApi(id) {
	return request({
		url: '/app/message/read/' + id,
		method: 'get'
	})
}

//消息详情
export function messageInfoApi(id) {
	return request({
		url: '/app/message/' + id,
		method: 'get'
	})
}

// 积分商品列表
export function pointPrizeListApi(page) {
	return request({
		url: '/app/point-prize/list?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get'
	})
}

// 积分明细
export function pointPrizeDetailsApi(id, page) {
	return request({
		url: '/app/point-prize/details/' + id + '?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get'
	})
}

// 我的兑换列表
export function pointPrizeOrdersApi(id, page) {
	return request({
		url: '/app/point-prize/orders/' + id + '?pageNum=' + page.pageNum + '&pageSize=' + page.pageSize,
		method: 'get'
	})
}

// 兑换商品
export function pointPrizeExchangeApi(uid, productId) {
	return request({
		url: `/app/point-prize/exchange/${uid}/${productId}`,
		method: 'get'
	})
}

// 最新版本
export function versionApi() {
	return request({
		url: '/app/version',
		method: 'get',
	})
}

// 顶部消息通知
export function messageNoticeApi() {
	return request({
		url: '/app/message/notice',
		method: 'get',
	})
}

// 电子合同
export function contractAllApi() {
	return request({
		url: '/contract/getContractAll',
		method: 'get',
	})
}

// 首页菜单
export function menuListApi(params) {
	return request({
		url: '/app/personal/menu/list',
		method: 'get',
		data: params
	})
}


// 上传图片
export async function s3upload(file) {
	const formData = new FormData()
	formData.append('file', file)

	const base_url = import.meta.env.VITE_API_URL ?? 'https://api.cwpc.cc'
	const token = uni.getStorageSync('token') || ''

	const res = await fetch(`${base_url}/s3/upload`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			// 关键：这里绝对不要写 Content-Type！
		},
		body: formData, // fetch 会自动生成正确的 multipart/form-data + boundary
	})

	return await res.json()
}

// 一次性上传多张图片
export async function s3uploads(files) {
	const formData = new FormData()

	for (let i = 0; i < files.length; i++) {
		const filePath = files[i]
		const blob = await pathToBlob(filePath)
		formData.append('file', blob, `image_${i}.jpg`)
	}

	const base_url = import.meta.env.VITE_API_URL ?? 'https://api.cwpc.cc'
	const token = uni.getStorageSync('token') || ''

	const res = await fetch(`${base_url}/s3/uploads`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	})

	return await res.json()
}

// 把本地路径转成 Blob
function pathToBlob(filePath) {
	return new Promise((resolve, reject) => {
		if (filePath.startsWith('blob:')) {
			fetch(filePath)
				.then(res => res.blob())
				.then(resolve)
				.catch(reject)
		}
		else {
			uni.request({
				url: filePath,
				responseType: 'blob',
				success: res => resolve(res.data),
				fail: reject,
			})
		}
	})
}

// 首页弹窗
export function settingsPopupsApi() {
	return request({
		url: '/app/settings/popups',
		method: 'get'
	})
}

// 首页三位活动
export function activeCenterTopApi() {
	return request({
		url: '/app/active-center/top',
		method: 'get'
	})
}

// 子菜单
export function sonMenuListApi(pid) {
	return request({
		url: '/app/personal/child/list?pid=' + pid,
		method: 'get'
	})
}

//查询自定义获奖记录(honor)
export function honorCustomDrawResultApi() {
	return request({
		url: '/app/honor/custom-draw-result',
		method: 'get'
	})
}

// 语言包
export function languageApi() {
	return request({
		url: '/app/language',
		method: 'get'
	})
}

// 用户指南
export function userNoticeApi() {
	return request({
		url: '/app/settings/user-notice',
		method: 'get'
	})
}

// 滚动消息
export function settingsRollApi() {
	return request({
		url: '/app/settings/roll',
		method: 'get'
	})
}