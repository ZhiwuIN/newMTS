import {
	initVueI18n
} from '@dcloudio/uni-i18n'
import en from '../../locale/en.json'
import ru from '../../locale/ru.json'
import es from '../../locale/es.json'
import fr from '../../locale/fr.json'
import {
	showMessage
} from '@/utils/utils.js'
const messages = {
	'en': en,
	'ru': ru,
	'es': es,
	'fr': fr
}
const {
	t
} = initVueI18n(messages)
// 全局请求封装——也可像上述一样根据环境不同的判断
// const base_url = '/api';8080'; //开发环境
// const base_url = 'http://13.244.243.127:1001'; //测试环境
// const base_url = 'http://16.28.69.140:8888';
const base_url = 'http://192.168.0.5:8080'
// const base_url = 'https://api.cwpc.vip' // 域名 
// 请求超时设置
const timeout = 30000;

// 刷新token接口，假设为 /auth/refreshToken，返回新token
function refreshToken() {
	return new Promise((resolve, reject) => {
		const refresh_token = uni.getStorageSync('refresh_token');
		if (!refresh_token) {
			reject('No refresh token');
			return;
		}
		let Token = uni.getStorageSync('token') || ''
		uni.request({
			url: base_url + '/auth/refreshToken',
			method: 'POST',
			header: {
				'Content-Type': 'application/json;charset=UTF-8',
				'Authorization': 'Bearer ' + Token
			},
			data: {
				refreshToken: refresh_token
			},
			success(res) {
				if (res.statusCode == 200 && res.data.code == 0) {
					const newToken = res.data.data.token;
					const newRefreshToken = res.data.data.refreshToken;
					uni.setStorageSync('token', newToken);
					uni.setStorageSync('refresh_token', newRefreshToken);
					resolve(newToken);
				} else {
					reject(res.data.msg || t('request.FailedRefresh'));
				}
			},
			fail(err) {
				console.log(err)
				reject(err);
			}
		});
	});
}

// 防止多次401时重复刷新token
let isRefreshing = false;
let refreshPromise = null;
let requestQueue = [];

function requestWithAuth(params, resolve, reject, retried = false) {
	let url = params.url;
	let method = params.method || "get";
	let data = params.data || {};
	let Token = uni.getStorageSync('token') || ''
	let header = {
		'Content-Type': 'application/json;charset=UTF-8',
		'Authorization': 'Bearer ' + Token,
		// 'X-Client-Type': 'app',
		...params.header
	};
	if (method === "post") {
		header['Content-Type'] = 'application/json';
	}
	uni.request({
		url: base_url + url,
		method: method,
		header: header,
		data: data,
		timeout,
		success(response) {
			const {
				statusCode,
				data,
				msg
			} = response;
			if (statusCode == 200) {
				if (data.code === 200) {
					resolve(data); //需要根据后端实际接口返回数据层级去resolve
				} else {
					switch (data.code) {
						case 401:
							// 业务层401，和http层401一样处理
							handle401();
							break;
						case 404:
							showMessage('error', t('request.addressError'));
							reject(data);
							break;
						default:
							// showMessage('error', data.msg);
							reject(data);
							break;
					}
				}
			} else if (statusCode == 401) {
				handle401();
			} else {
				reject(response);
			}

			function handle401() {
				if (retried) {
					// 已经重试过，仍然401，跳转登录
					uni.navigateTo({
						url: "/pages/LoginPage/login",
					});
					reject({
						code: 401,
						msg: t('request.unAuthorization')
					});
					return;
				}
				// 队列化请求，等待token刷新
				requestQueue.push(() => {
					// 重新请求，retried设为true防止死循环
					requestWithAuth(params, resolve, reject, true);
				});
				if (!isRefreshing) {
					isRefreshing = true;
					refreshPromise = refreshToken()
						.then(newToken => {
							isRefreshing = false;
							refreshPromise = null;
							// 依次执行队列中的请求
							const queue = requestQueue.slice();
							requestQueue = [];
							queue.forEach(cb => cb());
						})
						.catch(err => {
							isRefreshing = false;
							refreshPromise = null;
							requestQueue = [];
							uni.navigateTo({
								url: "/pages/LoginPage/login",
							});
							// reject({
							// 	code: 401,
							// 	msg: t('request.FailedRefresh')
							// });
						});
				}
			}
		},
		fail(err) {
			showMessage('warning', err.msg && err.msg.indexOf('request:fail') !== -1 ? t(
					'request.netError') :
				t('request.netError'));
		},
		complete() {
			uni.hideLoading();
		}
	});
}

export default (params) => {
	return new Promise((resolve, reject) => {
		requestWithAuth(params, resolve, reject, false);
	});
};