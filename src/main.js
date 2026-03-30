import App from './App'
import en from './locale/en.json'
import ru from './locale/ru.json'
import es from './locale/es.json'
import fr from './locale/fr.json'
import music from './utils/music.js'

// import zh from './locale/zh.json'
import './uni.scss'

import {
	showMessage,
	getImToken
} from './utils/utils.js'
const messages = {
	'en': en,
	'ru': ru,
	'es': es,
	'fr': fr,
	// 'zh': zh
}

let i18nConfig = {
	locale: uni.getLocale(), // 获取已设置的语言
	messages
}
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import VueI18n from 'vue-i18n'

const customizeBack = () => {
	const canNavBack = getCurrentPages()
	if (canNavBack && canNavBack.length > 1) {
		uni.navigateBack({
			delta: 1
		})
	} else {
		// #ifdef APP-PLUS
		uni.navigateBack({
			delta: 1
		})
		// #endif

		// #ifdef H5
		history.back()
		// #endif
	}
}

// import {
// 	YeIMUniSDK, // SDK
// 	YeIMUniSDKDefines // 预定义常量
// } from './uni_modules/wzJun1-YeIM-Uni-SDK/js_sdk/yeim-uni-sdk.min.js'
// YeIMUniSDK.init({
// 	// baseURL: 'http://192.168.2.236:8080', // YeIMServer http url （如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	// socketURL: 'ws://192.168.2.236:/8080/im', // YeIMServer socket url（如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	baseURL: 'https://im.cwpc.cc', // YeIMServer http url （如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	socketURL: 'wss://im.cwpc.cc/im', // YeIMServer socket url（如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	logLevel: 0, // SDK日志等级，0 = 打印全部日志， 1 = 打印重要日志，2 = 不打印日志
// 	reConnectInterval: 3000, // 断线重连时间间隔（遇到网络波动，IM服务端可能会断线，此时需要重新连接到服务端），单位：毫秒
// 	reConnectTotal: 0, // 最大重连次数，0不限制一直重连 
// 	heartInterval: 30000, //心跳时间间隔（默认30秒），单位：毫秒
// 	notification: {
// 		autoPermission: true //IM登录后是否自动检测通知权限
// 	}
// });
Vue.use(VueI18n)
const i18n = new VueI18n(i18nConfig)
Vue.config.productionTip = false
App.mpType = 'app'

Vue.prototype.$showMessage = showMessage
Vue.prototype.$music = music
Vue.prototype.$getImToken = getImToken
// Vue.prototype.$yeIM = YeIMUniSDK;
// Vue.prototype.$yeIMDefines = YeIMUniSDKDefines;
Vue.prototype.$customizeBack = customizeBack;

const app = new Vue({
	i18n,
	...App,
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import TDesign from 'tdesign-mobile-vue';
import 'tdesign-mobile-vue/es/style/index.css';
// import {
// 	YeIMUniSDK, // SDK
// 	YeIMUniSDKDefines // 预定义常量
// } from './uni_modules/wzJun1-YeIM-Uni-SDK/js_sdk/yeim-uni-sdk.min.js'
// YeIMUniSDK.init({
// 	// baseURL: 'http://192.168.2.100:8080', // YeIMServer http url （如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	// socketURL: 'ws://192.168.2.100:8080/im', // YeIMServer socket url（如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	baseURL: 'https://im.cwpc.cc', // YeIMServer http url （如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	socketURL: 'wss://im.cwpc.cc/im', // YeIMServer socket url（如无特殊需求，服务端启动后仅需修改ip或者域名即可）
// 	logLevel: 1, // SDK日志等级，0 = 打印全部日志， 1 = 打印重要日志，2 = 不打印日志
// 	reConnectInterval: 3000, // 断线重连时间间隔（遇到网络波动，IM服务端可能会断线，此时需要重新连接到服务端），单位：毫秒
// 	reConnectTotal: 0, // 最大重连次数，0不限制一直重连 
// 	heartInterval: 30000, //心跳时间间隔（默认30秒），单位：毫秒
// 	notification: {
// 		autoPermission: true //IM登录后是否自动检测通知权限
// 	}
// });
const customizeBack = () => {
	const canNavBack = getCurrentPages()
	if (canNavBack && canNavBack.length > 1) {
		uni.navigateBack({
			delta: 1
		})
	} else {
		// #ifdef APP-PLUS
		uni.navigateBack({
			delta: 1
		})
		// #endif

		// #ifdef H5
		history.back()
		// #endif
	}
}
import {
	createI18n
} from 'vue-i18n'
const i18n = createI18n(i18nConfig)
export function createApp() {
	const app = createSSRApp(App)
	app.config.globalProperties.$showMessage = showMessage
	app.config.globalProperties.$getImToken = getImToken
	// app.config.globalProperties.$yeIM = YeIMUniSDK;
	app.config.globalProperties.$music = music
	// app.config.globalProperties.$yeIMDefines = YeIMUniSDKDefines;
	app.config.globalProperties.$customizeBack = customizeBack;
	app.use(i18n)
	app.use(TDesign);
	return {
		app
	}
}
// #endif