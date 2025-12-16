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

// 防止请求失败时重复弹窗
let globalRequestFailedAlerted = false;

// 全局请求封装——也可像上述一样根据环境不同的判断
// const base_url = '/api';8080'; //开发环境
// const base_url = 'http://192.168.0.9:8081' //开发环境
// const base_url = 'http://47.122.125.169:19002' //开发环境
// const base_url = 'http://18.163.208.5:8881'//测试环境
const base_url = 'https://api.cwpc.cc' // 域名
// const base_url = 'https://api.itslai.com' // 域名

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
			const isTimeoutError =
				(err.errMsg && err.errMsg.includes('timeout')) ||
				(err.message && err.message.includes('timeout')) ||
				(err.errMsg && err.errMsg.includes('time out')) ||
				(err.message && err.message.includes('time out'));

			// 判定是否为 502 错误（适配不同的 err 格式，覆盖常见场景）
			const is502Error =
				// 场景1：err 里有 statusCode 字段（如 axios/uni.request 等）
				err.statusCode === 502 ||
				// 场景2：err.msg/err.message 包含 502 关键词（如自定义错误信息）
				(err.msg && err.msg.includes('502')) ||
				(err.message && err.message.includes('502')) ||
				(err.errMsg && err.errMsg.includes('502'));

			// 超时错误处理
			if (isTimeoutError) {
				if (!globalRequestFailedAlerted) {
					globalRequestFailedAlerted = true;
					showMessage('warning', t('request.timeout'));

					// 3秒内禁止重复弹窗
					setTimeout(() => {
						globalRequestFailedAlerted = false;
					}, 3000);
				}
			}
			// 502 错误处理
			else if (is502Error) {
				if (!globalRequestFailedAlerted) {
					globalRequestFailedAlerted = true;
					showMessage('warning', t('request.systemMaintenance'));

					// 3秒内禁止重复弹窗
					setTimeout(() => {
						globalRequestFailedAlerted = false;
					}, 3000);
				}
			} else {
				// 其他网络错误：保留原有网络错误提示（可根据需求调整）
				// showMessage('warning', t('request.netError'));
			}
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