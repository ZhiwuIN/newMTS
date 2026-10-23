const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const vm = require('node:vm')
const esbuild = require('esbuild')

const root = path.resolve(__dirname, '..')
const requestKeys = crypto.generateKeyPairSync('rsa', { modulusLength: 1024 })
const responseKeys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
const pem = (key, type) => key.export({ type, format: 'pem' }).toString()
const environment = {
	VITE_API_URL: 'https://api.example.test',
	VITE_REQUEST_PUBLIC_KEY: pem(requestKeys.publicKey, 'spki'),
	VITE_RESPONSE_PRIVATE_KEY: pem(responseKeys.privateKey, 'pkcs8'),
	DEV: false
}

function load(entry, env = environment) {
	const output = esbuild.buildSync({
		absWorkingDir: root, entryPoints: [entry], bundle: true, platform: 'node',
		format: 'cjs', write: false, logLevel: 'silent',
		define: { 'import.meta.env': JSON.stringify(env) },
		alias: { '@/utils/utils.js': path.join(__dirname, 'fixtures/crypto-ui-stub.cjs') },
		plugins: [],
		external: ['@dcloudio/uni-i18n']
	}).outputFiles[0].text
	const compiled = new Module(path.join(__dirname, '.crypto-test-runtime.cjs'), module)
	compiled.filename = path.join(__dirname, '.crypto-test-runtime.cjs')
	compiled.paths = Module._nodeModulePaths(root)
	compiled._compile(output, compiled.filename)
	return compiled.exports
}

function response(payload, length = 32, headerName = 'encrypt-key') {
	const key = crypto.randomBytes(length)
	const cipher = crypto.createCipheriv(`aes-${length * 8}-ecb`, key, null)
	const data = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]).toString('base64')
	const wrapped = crypto.publicEncrypt({ key: responseKeys.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(key.toString('base64')))
	return { statusCode: 200, data, header: { [headerName]: wrapped.toString('base64') } }
}

function readRequest(options) {
	const header = options.header['encrypt-key']
	assert.equal(options.header['Content-Type'], 'text/plain')
	assert.equal(typeof options.data, 'string')
	const block = crypto.privateDecrypt({ key: requestKeys.privateKey, padding: crypto.constants.RSA_NO_PADDING }, Buffer.from(header, 'base64'))
	assert.equal(block[0], 0)
	assert.equal(block[1], 2)
	const separator = block.indexOf(0, 2)
	assert.ok(separator >= 10, 'PKCS#1 v1.5 padding must contain at least eight nonzero bytes')
	const key = Buffer.from(block.subarray(separator + 1).toString('utf8'), 'base64')
	assert.equal(key.length, 32)
	assert.match(key.toString('utf8'), /^[A-Za-z0-9+/]{32}$/)
	const decipher = crypto.createDecipheriv('aes-256-ecb', key, null)
	return JSON.parse(Buffer.concat([decipher.update(Buffer.from(options.data, 'base64')), decipher.final()]).toString('utf8'))
}

async function main() {
	const { createApiCrypto, ApiCryptoError } = load('src/common/api/crypto.js')
	const client = createApiCrypto({
		requestPublicKey: environment.VITE_REQUEST_PUBLIC_KEY,
		responsePrivateKey: environment.VITE_RESPONSE_PRIVATE_KEY,
		randomBytes: length => new Uint8Array(crypto.randomBytes(length))
	})
	const payload = { name: 'Élodie 张三', emoji: '🦊', amount: 123.45, nested: [true, null, { value: 0 }] }
	for (const length of [16, 24, 32]) {
		const encrypted = response(payload, length, length === 24 ? 'EnCrYpT-KeY' : 'encrypt-key')
		assert.deepEqual(client.decryptUniResponse(encrypted).data, payload)
		assert.deepEqual(client.decryptResponseData(encrypted.data, new Headers(encrypted.header)), payload)
	}
	const encrypted = client.prepareJsonRequest({ method: 'post', data: payload, header: { 'content-type': 'application/json', Authorization: 'Bearer token' } })
	assert.deepEqual(readRequest(encrypted), payload)
	assert.equal(encrypted.header.Authorization, 'Bearer token')
	assert.equal(encrypted.header['content-type'], undefined)
	assert.notEqual(client.encryptData(payload).encryptKey, client.encryptData(payload).encryptKey)
	assert.notEqual(client.encryptData(payload).data, client.encryptData(payload).data)
	assert.deepEqual(client.decryptResponseData(JSON.stringify(payload), {}), payload)
	assert.deepEqual(createApiCrypto().decryptResponseData(payload, {}), payload)
	assert.throws(() => client.prepareJsonRequest({ method: 'get', data: payload }), ApiCryptoError)
	assert.throws(() => client.prepareJsonRequest({ method: 'post', data: new FormData() }), ApiCryptoError)
	assert.throws(() => client.prepareJsonRequest({ method: 'post', data: payload, header: { 'Content-Type': 'multipart/form-data' } }), ApiCryptoError)
	const query = { page: 1, keyword: '中文 & test', tags: ['a', 'b'] }
	const queryHeaders = { Authorization: 'Bearer token' }
	const preparedGet = client.prepareRequest({ method: 'get', url: '/list?sort=name%20asc', data: query, header: queryHeaders })
	assert.equal(preparedGet.method, 'GET')
	assert.equal(preparedGet.url, '/list?sort=name%20asc')
	assert.equal(preparedGet.data, query)
	assert.equal(preparedGet.header, queryHeaders)
	assert.equal(preparedGet.header['encrypt-key'], undefined)
	assert.equal(client.prepareRequest({ method: 'get', url: '/list?page=1' }).url, '/list?page=1')
	assert.deepEqual(client.prepareRequest({ method: 'get', url: '/settings', data: {} }).data, {})
	assert.deepEqual(client.prepareRequest({ method: 'get', data: payload, encryptRequest: false }).data, payload)
	for (const key of ['', 'bad key']) {
		assert.throws(() => createApiCrypto({ requestPublicKey: key }).encryptData(payload), ApiCryptoError)
	}
	for (const invalid of ['', 'not base64', 'AA==', 'A===']) {
		assert.throws(() => client.decryptResponseData(invalid, response(payload).header), ApiCryptoError)
	}
	assert.throws(() => client.decryptResponseData('AA==', { 'encrypt-key': '' }), ApiCryptoError)
	assert.throws(() => createApiCrypto().decryptUniResponse(response(payload)), { stage: 'response-key-missing' })
	for (const keyLength of [15, 17, 31, 33]) {
		const wrapped = crypto.publicEncrypt({ key: responseKeys.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(crypto.randomBytes(keyLength).toString('base64')))
		assert.throws(() => client.decryptResponseData('AAAA', { 'encrypt-key': wrapped.toString('base64') }), { stage: 'response-aes-key-length' })
	}
	const invalidPadding = response(payload)
	const damaged = Buffer.from(invalidPadding.data, 'base64')
	damaged[damaged.length - 1] ^= 255
	assert.throws(() => client.decryptResponseData(damaged.toString('base64'), invalidPadding.header), ApiCryptoError)
	console.log('PASS: Node AES/RSA compatibility, AES-128/192/256 responses, header casing, request policy and malformed input handling')

	const { secureRandomBytes } = load('src/common/api/cryptoRandom.js')
	assert.equal(secureRandomBytes(24, { crypto: crypto.webcrypto }).length, 24)
	assert.throws(() => secureRandomBytes(24, {}), /secure random source/)
	const android = { os: { name: 'Android' }, android: { importClass(name) {
		assert.equal(name, 'java.security.SecureRandom')
		return class { nextInt(max) { return crypto.randomInt(max) } }
	} } }
	let deleted = 0
	const ios = { os: { name: 'iOS' }, ios: {
		invoke(object, selector) { return selector === 'UUID' ? { value: crypto.randomUUID() } : object.value },
		deleteObject() { deleted++ }
	} }
	assert.equal(secureRandomBytes(24, { plus: android }).length, 24)
	assert.equal(secureRandomBytes(24, { plus: ios }).length, 24)
	assert.equal(deleted, 2)
	const oldRandom = Math.random
	try {
		Math.random = () => { throw new Error('Insecure random fallback used') }
		const native = createApiCrypto({ requestPublicKey: environment.VITE_REQUEST_PUBLIC_KEY, randomBytes: length => secureRandomBytes(length, { plus: android }) })
		assert.deepEqual(readRequest(native.prepareJsonRequest({ method: 'post', data: payload })), payload)
	} finally { Math.random = oldRandom }
	assert.throws(() => createApiCrypto({ requestPublicKey: environment.VITE_REQUEST_PUBLIC_KEY, randomBytes: length => new Uint8Array(length) }).encryptData(payload), { stage: 'secure-random-invalid' })
	console.log('PASS: browser RNG and mocked Android/iOS native RNG; no Math.random fallback')
	const appBundle = esbuild.buildSync({
		absWorkingDir: root, entryPoints: ['src/common/api/crypto.js'], bundle: true,
		platform: 'browser', format: 'iife', globalName: 'ApiCrypto', write: false,
		target: ['chrome53', 'safari11'], logLevel: 'silent', define: { 'import.meta.env': '{}' }
	}).outputFiles[0].text
	for (const bridge of [android, ios]) {
		// 模拟 App 逻辑层：无 window、DOM、Web Crypto 或 Node require。
		const service = { plus: bridge }
		vm.runInNewContext(appBundle, service)
		const appClient = service.ApiCrypto.createApiCrypto({ requestPublicKey: environment.VITE_REQUEST_PUBLIC_KEY, responsePrivateKey: environment.VITE_RESPONSE_PRIVATE_KEY })
		assert.deepEqual(readRequest(appClient.prepareJsonRequest({ method: 'post', data: payload })), payload)
		const encryptedResponse = response(payload)
		assert.equal(JSON.stringify(appClient.decryptUniResponse(encryptedResponse).data), JSON.stringify(payload))
	}
	console.log('PASS: browser-targeted bundle runs in DOM-free Android/iOS service simulations')

	const values = new Map([['token', 'old-token'], ['refresh_token', 'refresh-token']])
	const sent = []
	let handler
	const navigation = []
	global.uni = {
		getStorageSync: key => values.get(key), setStorageSync: (key, value) => values.set(key, value),
		hideLoading() {}, navigateTo: options => navigation.push(options.url), $emit() {},
		request(options) {
			sent.push(options)
			queueMicrotask(() => {
				try { options.success(handler(options)) }
				finally { if (options.complete) options.complete() }
			})
		}
	}
	const request = load('src/common/api/request.js').default
	handler = options => { assert.deepEqual(readRequest(options), payload); return response({ code: 200, data: payload }) }
	assert.deepEqual((await request({ url: '/app/user/login', method: 'post', data: payload })).data, payload)
	handler = () => response({ rows: [payload], total: 1 })
	assert.equal((await request({ url: '/list' })).total, 1)
	handler = () => ({ statusCode: 200, data: JSON.stringify({ code: 200, data: payload }), header: {} })
	assert.deepEqual((await request({ url: '/plain' })).data, payload)
	handler = () => response({ code: 400, msg: 'Business validation failed' })
	await assert.rejects(request({ url: '/business-error' }), { code: 400, msg: 'Business validation failed' })
	handler = () => ({ ...response(payload), data: 'invalid ciphertext' })
	await assert.rejects(request({ url: '/bad-ciphertext' }), { code: 'API_CRYPTO_ERROR', msg: 'Unable to process the request. Please try again.' })
	handler = () => ({ statusCode: 200, data: 'unreadable response', header: {} })
	await assert.rejects(request({ url: '/unreadable' }), { code: 'API_CRYPTO_ERROR', stage: 'response-json-required' })
	handler = () => ({ ...response({ code: 400, msg: 'Invalid parameters' }), statusCode: 400 })
	await assert.rejects(request({ url: '/http-error' }), { statusCode: 400, msg: 'Invalid parameters' })
	const count = sent.length
	handler = options => {
		assert.equal(options.method, 'GET')
		assert.equal(options.url, environment.VITE_API_URL + '/list?sort=name%20asc')
		assert.deepEqual(options.data, query)
		assert.equal(options.header['encrypt-key'], undefined)
		return response({ code: 200, data: payload })
	}
	assert.deepEqual((await request({ url: '/list?sort=name%20asc', data: query })).data, payload)
	handler = options => {
		assert.equal(options.url, environment.VITE_API_URL + '/list?page=1')
		assert.deepEqual(options.data, {})
		assert.equal(options.header['encrypt-key'], undefined)
		return response({ code: 200, data: payload })
	}
	assert.deepEqual((await request({ url: '/list?page=1', method: 'GET' })).data, payload)
	assert.equal(sent.length, count + 2, 'GET URL and data queries must reach the transport and encrypted responses must decode')
	console.log('PASS: GET URL/data query parameters pass through and encrypted GET responses still decode')

	let refreshes = 0
	handler = options => {
		if (options.url.endsWith('/auth/refreshToken')) {
			refreshes++
			assert.deepEqual(readRequest(options), { refreshToken: 'refresh-token' })
			return response({ code: 0, data: { token: 'new-token', refreshToken: 'new-refresh-token' } })
		}
		assert.deepEqual(readRequest(options), payload)
		return options.header.Authorization === 'Bearer old-token'
			? response({ code: 401, msg: 'Expired' }) : response({ code: 200, data: payload })
	}
	const concurrent = await Promise.all([request({ url: '/retry-a', method: 'post', data: payload }), request({ url: '/retry-b', method: 'post', data: payload })])
	assert.equal(concurrent.length, 2)
	assert.equal(refreshes, 1)
	assert.equal(values.get('token'), 'new-token')
	values.set('token', 'old-token')
	handler = options => options.url.endsWith('/auth/refreshToken')
		? response({ code: 400, msg: 'Refresh rejected' }) : response({ code: 401, msg: 'Expired' })
	let timer
	try {
		const failed = await Promise.race([
			Promise.allSettled([request({ url: '/queue-a' }), request({ url: '/queue-b' })]),
			new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Pending refresh queue')), 2000) })
		])
		assert.equal(failed.filter(item => item.status === 'rejected').length, 2)
	} finally { clearTimeout(timer) }
	console.log('PASS: request middleware, encrypted business errors, concurrent 401 refresh/retry and refresh failure settlement')

	const upload = load('src/common/api/upload.js').uploadApiFiles
	const oldFetch = global.fetch
	try {
		global.fetch = async (url, options) => {
			assert.equal(url, environment.VITE_API_URL + '/s3/uploads')
			assert.ok(options.body instanceof FormData)
			assert.equal(options.headers['encrypt-key'], undefined)
			assert.equal(options.headers['Content-Type'], undefined)
			const data = response({ code: 200, data: ['uploaded.png'] })
			return new Response(data.data, { status: 200, headers: data.header })
		}
		assert.deepEqual((await upload('/s3/uploads', [new Blob(['test'])])).data, ['uploaded.png'])
	} finally { global.fetch = oldFetch }
	const uploadedFiles = []
	const nativeResponse = response({ code: 200, data: ['native.png'] })
	global.plus = { uploader: { createUpload(url, options, done) {
		return {
			setRequestHeader() {}, addFile(file, options) { uploadedFiles.push([file, options.key]); return true }, abort() {},
			start() { queueMicrotask(() => done({ responseText: nativeResponse.data, getAllResponseHeaders: () => 'EnCrYpT-KeY: ' + nativeResponse.header['encrypt-key'] }, 200)) }
		}
	} } }
	try {
		assert.deepEqual((await upload('/s3/uploads', ['_doc/test.png'])).data, ['native.png'])
		assert.deepEqual(uploadedFiles, [['_doc/test.png', 'file']])
	} finally { delete global.plus }
	console.log('PASS: H5 multipart and mocked native uploads preserve file bodies and decrypt response headers')

	if (fs.existsSync(path.join(root, '.env.local'))) {
		const configured = (await import('vite')).loadEnv('production', root)
		if (configured.VITE_REQUEST_PUBLIC_KEY && configured.VITE_RESPONSE_PRIVATE_KEY) {
			crypto.createPublicKey({ key: Buffer.from(configured.VITE_REQUEST_PUBLIC_KEY, 'base64'), format: 'der', type: 'spki' })
			const privateKey = crypto.createPrivateKey({ key: Buffer.from(configured.VITE_RESPONSE_PRIVATE_KEY, 'base64'), format: 'der', type: 'pkcs8' })
			const rsaHeader = crypto.publicEncrypt({ key: crypto.createPublicKey(privateKey), padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(Buffer.alloc(32, 65).toString('base64'))).toString('base64')
			const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.alloc(32, 65), null)
			const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload)), cipher.final()]).toString('base64')
			assert.deepEqual(createApiCrypto({ responsePrivateKey: configured.VITE_RESPONSE_PRIVATE_KEY }).decryptResponseData(ciphertext, { 'encrypt-key': rsaHeader }), payload)
			console.log('PASS: configured DER keys parse and configured response key decrypts Node-generated payloads (key values omitted)')
		}
	}
	console.log('All API crypto checks passed. No live business API was called.')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
