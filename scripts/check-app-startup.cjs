const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { transformSync } = require('esbuild')
const { initPreContext, preJs, parseManifestJson } = require('@dcloudio/uni-cli-shared')

const root = path.resolve(__dirname, '..')
const login = '/pages/LoginPage/login'
const source = fs.readFileSync(path.join(root, 'src/App.vue'), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
initPreContext('app-plus')
const compiled = transformSync(preJs(source), { format: 'cjs', loader: 'js' }).code
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve() }

function runtime(options = {}) {
	let time = 0
	let timerId = 0
	let closed = 0
	const timers = new Map()
	const storage = new Map()
	const navigation = []
	const logs = []
	const modules = {
		'@/common/api/users.js': { settingsApi: async () => ({ data: {} }) },
		'@/common/api/home.js': {
			latestNoticeApi: options.notice || (async () => ({ data: null })),
			versionApi: options.version || (async () => ({ data: { editionNumber: 104 } }))
		},
		'@/common/api/messageBadge.js': { messageBadgeManager: { refresh() {} } }
	}
	const sandbox = {
		module: { exports: {} },
		require: name => { assert.ok(modules[name], `Unexpected import: ${name}`); return modules[name] },
		console: Object.fromEntries(['log', 'warn', 'error'].map(level => [level, (...args) => logs.push(args)])),
		setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, at: time + delay }); return id },
		clearTimeout: id => timers.delete(id),
		getCurrentPages: options.getPages || (() => options.pages || [{ route: 'pages/LoginPage/login' }]),
		plus: {
			runtime: {
				appid: 'HBuilder',
				getProperty: options.getProperty || ((id, callback) => callback({ versionCode: 104 }))
			},
			navigator: { closeSplashscreen() { closed++ } }
		},
		uni: {
			getStorageSync: key => storage.get(key),
			setStorageSync: (key, value) => storage.set(key, value),
			removeStorageSync: key => storage.delete(key),
			reLaunch(args) {
				navigation.push(args.url)
				if (options.navigate) return options.navigate(args)
				args.success?.()
				args.complete?.()
			}
		}
	}
	vm.runInNewContext(compiled, sandbox, { filename: 'App.vue' })
	const definition = sandbox.module.exports.default
	const app = { ...definition.methods }
	return {
		app, navigation, storage, logs,
		get closed() { return closed },
		async launch() { definition.onLaunch.call(app, {}); await flush() },
		error(error) { definition.onError.call(app, error) },
		rejection(reason) { definition.onUnhandledRejection.call(app, { reason }) },
		async advance(milliseconds) {
			const until = time + milliseconds
			while (true) {
				const next = [...timers.entries()].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0]
				if (!next) break
				time = next[1].at
				timers.delete(next[0])
				next[1].callback()
				await flush()
			}
			time = until
			await flush()
		}
	}
}

async function main() {
	const manifest = parseManifestJson(path.join(root, 'src'))
	assert.equal(manifest['app-plus'].splashscreen.autoclose, true)
	assert.equal(manifest['app-plus'].splashscreen.alwaysShowBeforeRender, false)

	const normal = runtime()
	await normal.launch()
	assert.equal(normal.closed, 1, 'The rendered login page must be revealed')
	assert.equal(normal.navigation.length, 0, 'Do not reload the initial login page')

	for (const error of [{ code: 401 }, { code: 'API_CRYPTO_ERROR' }, new Error('offline')]) {
		const failed = runtime({ notice: () => Promise.reject(error), version: () => { throw error } })
		await failed.launch()
		assert.ok(failed.closed > 0, 'Failed and synchronously throwing requests must release the splash')
	}

	const pending = runtime({ notice: () => new Promise(() => {}), version: () => new Promise(() => {}) })
	await pending.launch()
	await pending.advance(10000)
	assert.ok(pending.closed > 0, 'Network requests must have a bounded wait')

	let lateProperty
	const noCallback = runtime({ getProperty: (id, callback) => { lateProperty = callback } })
	await noCallback.launch()
	await noCallback.advance(2999)
	assert.equal(noCallback.closed, 0)
	await noCallback.advance(1)
	assert.ok(noCallback.closed > 0, 'The independent splash timer must not wait for startup completion')
	await noCallback.advance(9000)
	assert.ok(noCallback.closed > 0, 'A missing native callback must not retain the splash')
	lateProperty({ versionCode: 104 })
	await flush()
	assert.equal(noCallback.navigation.length, 0, 'Late callbacks must not change the current page')

	const nativeError = runtime({ getProperty() { throw new Error('native bridge error') } })
	await nativeError.launch()
	assert.ok(nativeError.closed > 0)

	for (const hook of ['error', 'rejection']) {
		const failed = runtime({ getProperty() {} })
		await failed.launch()
		assert.equal(failed.closed, 0)
		const error = new Error('startup page error')
		failed[hook](error)
		assert.ok(failed.closed > 0, 'Runtime errors and unhandled rejections must close the splash immediately')
		assert.ok(failed.logs.some(args => args.includes(error)), 'The original error must remain in the console')
		failed[hook](error)
		assert.equal(failed.navigation.length, 0, 'Error hooks must not cause repeated navigation')
	}

	const hungRoute = runtime({ pages: [], navigate() {} })
	await hungRoute.launch()
	assert.deepEqual(hungRoute.navigation, [login])
	assert.ok(hungRoute.closed > 0, 'A navigation callback that never fires must not retain the splash')
	const brokenPages = runtime({ getPages() { throw new Error('page stack error') } })
	await brokenPages.launch()
	assert.ok(brokenPages.closed > 0, 'Reading a broken page stack must not retain the splash')

	const notice = { timestamp: 123, title: 'Notice', content: 'Content' }
	let resolveNotice
	const slowNotice = runtime({ notice: () => new Promise(resolve => { resolveNotice = resolve }) })
	await slowNotice.launch()
	await slowNotice.advance(3000)
	assert.ok(slowNotice.closed > 0)
	resolveNotice({ data: notice })
	await flush()
	assert.deepEqual(slowNotice.navigation, ['/pages/updateNoticePage/index'], 'Closing the splash must not cancel update checks')
	const update = runtime({ notice: async () => ({ data: notice }), version: async () => ({ data: { editionNumber: 105, editionForce: 1 } }) })
	await update.launch()
	assert.deepEqual(update.navigation, ['/pages/updateNoticePage/index'])
	assert.equal(update.storage.get('latest_update_version_data').edition_force, 1)
	assert.ok(update.closed > 0, 'The update notice must be visible')
	await update.advance(20000)
	assert.equal(update.navigation.length, 1, 'The timeout must not interrupt an active update')

	const versionOnly = runtime({ version: async () => ({ data: { editionNumber: 105 } }) })
	await versionOnly.launch()
	assert.match(versionOnly.navigation[0], /^\/uni_modules\/rt-uni-update\//)
	assert.ok(versionOnly.closed > 0)

	for (const synchronous of [false, true]) {
		const failedRoute = runtime({
			notice: async () => ({ data: notice }),
			navigate(args) {
				if (synchronous) throw new Error('navigation error')
				args.fail({ errMsg: 'reLaunch:fail' })
				args.complete()
			}
		})
		await failedRoute.launch()
		assert.deepEqual(failedRoute.navigation, ['/pages/updateNoticePage/index', login])
		assert.ok(failedRoute.closed > 0, 'Navigation errors must release the splash even if fallback also fails')
	}
	console.log('PASS: independent 3-second splash timeout, runtime errors/unhandled rejections, missing navigation callbacks, 401/crypto/network failures, native callback timeout, late callbacks and notice/version routing')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
