import request from './request.js'

// 注册接口
export function registerApi(params) {
	return request({
		url: '/app/user/register',
		method: 'post',
		data: params,
	})
}


// 登录接口
export function loginApi(params) {
	return request({
		url: '/app/user/login',
		method: 'post',
		data: params,
	})
}
// 登出接口
export function logoutApi(params) {
	return request({
		url: '/app/user/logout',
		method: 'get',
		data: params,
	})
}

//用户信息
export function userInfoApi(params) {
	return request({
		url: '/app/user/info',
		method: 'get',
		data: params,
	})
}

//修改密码
export function changePasswordApi(params) {
	return request({
		url: '/app/user/change-password',
		method: 'post',
		data: params,
	})
}

//隐私协议
export function privacyAgreementApi(params) {
	return request({
		url: '/app/user/privacy-agreement',
		method: 'post',
		data: params,
	})
}

//修改用户信息
export function changeUserInfoApi(params) {
	return request({
		url: '/app/user',
		method: 'put',
		data: params,
	})
}

//查询系统信息
export function settingsApi() {
	return request({
		url: '/app/settings',
		method: 'get',
	})
}

// 头像库
export function settingsAvatarsApi() {
	return request({
		url: '/app/avatars',
		method: 'get',
	})
}

// 修改头像
export function changeAvatarApi(data) {
	return request({
		url: '/app/user/avatar',
		method: 'post',
		data
	})
}

// 修改手机号
export function changeUserPhoneApi(params) {
	return request({
		url: '/app/user/updatePhone',
		method: 'post',
		data: params,
	})
}

// 个人中心金额接口
export function userInfoAmountApi() {
	return request({
		url: '/app/user/info/amount',
		method: 'get',
	})
}