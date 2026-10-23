import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import { secureRandomBytes } from './cryptoRandom.js'

export const ENCRYPT_KEY_HEADER = 'encrypt-key'

export class ApiCryptoError extends Error {
	constructor(stage) {
		super(`API crypto failed: ${stage}`)
		this.name = 'ApiCryptoError'
		this.code = 'API_CRYPTO_ERROR'
		this.stage = stage
	}
}

export function getHeader(headers, name) {
	if (!headers) return undefined
	if (typeof headers.get === 'function') {
		const value = headers.get(name)
		return value === null ? undefined : value
	}
	const key = Object.keys(headers).find(key => key.toLowerCase() === name.toLowerCase())
	return key === undefined ? undefined : headers[key]
}

function setHeader(headers, name, value) {
	Object.keys(headers).forEach(key => {
		if (key.toLowerCase() === name.toLowerCase()) delete headers[key]
	})
	headers[name] = value
}

function parseBase64(value, stage) {
	if (typeof value !== 'string') throw new ApiCryptoError(stage)
	const text = value.trim()
	if (!text || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text)) {
		throw new ApiCryptoError(stage)
	}
	const bytes = CryptoJS.enc.Base64.parse(text)
	if (CryptoJS.enc.Base64.stringify(bytes) !== text) throw new ApiCryptoError(stage)
	return bytes
}

function fromBytes(bytes) {
	const words = []
	for (let i = 0; i < bytes.length; i++) words[i >>> 2] = (words[i >>> 2] || 0) | bytes[i] << (24 - (i % 4) * 8)
	return CryptoJS.lib.WordArray.create(words, bytes.length)
}

function byteAt(bytes, index) {
	return (bytes.words[index >>> 2] >>> (24 - (index % 4) * 8)) & 255
}

function parsePlainResponse(data) {
	if (typeof data !== 'string') return data
	try { return JSON.parse(data) } catch (_) { return data }
}

function isJsonBody(data) {
	return data === null || data === undefined || ['string', 'number', 'boolean'].includes(typeof data)
		|| Array.isArray(data) || Object.prototype.toString.call(data) === '[object Object]'
}

export function createApiCrypto({ requestPublicKey = '', responsePrivateKey = '', randomBytes = secureRandomBytes } = {}) {
	let requestRsa
	let responseRsa
	function rsaFor(direction) {
		if (direction === 'request' && requestRsa) return requestRsa
		if (direction === 'response' && responseRsa) return responseRsa
		const configured = direction === 'request' ? requestPublicKey : responsePrivateKey
		if (typeof configured !== 'string' || !configured.trim()) throw new ApiCryptoError(`${direction}-key-missing`)
		const rsa = new JSEncrypt()
		const key = configured.trim().replace(/\\n/g, '\n')
		try {
			if (direction === 'request') rsa.setPublicKey(key)
			else rsa.setPrivateKey(key)
			const parsed = rsa.getKey()
			if (!parsed.n || !parsed.e || (direction === 'response' && !parsed.d)) throw new Error('Invalid key')
		} catch (_) { throw new ApiCryptoError(`${direction}-key-invalid`) }
		if (direction === 'request') requestRsa = rsa
		else responseRsa = rsa
		return rsa
	}

	function random(length) {
		let bytes
		try { bytes = randomBytes(length) } catch (_) { throw new ApiCryptoError('secure-random-unavailable') }
		if (!(bytes instanceof Uint8Array) || bytes.length !== length) throw new ApiCryptoError('secure-random-invalid')
		return bytes
	}

	function wrapAesKey(key) {
		const rsa = rsaFor('request').getKey()
		const text = CryptoJS.enc.Base64.stringify(key)
		// 使用 JSEncrypt 的 paddingFunction 扩展点，为 App 端 PKCS#1 v1.5 填充提供原生随机数。
		// 默认库的非浏览器随机数回退不适合生成接口密钥或填充。
		const hex = rsa.encrypt(text, (message, width) => {
			const paddingLength = width - message.length - 3
			if (paddingLength < 8) throw new ApiCryptoError('request-rsa-key-too-short')
			const padding = []
			let attempts = 0
			while (padding.length < paddingLength) {
				if (++attempts > 32) throw new ApiCryptoError('secure-random-invalid')
				for (const value of random(paddingLength - padding.length)) {
					if (value !== 0) padding.push(value)
				}
			}
			const block = [0, 2, ...padding, 0, ...Array.from(message, ch => ch.charCodeAt(0))]
			return new rsa.n.constructor(fromBytes(block).toString(CryptoJS.enc.Hex), 16)
		})
		if (!hex) throw new ApiCryptoError('request-rsa-encryption')
		return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(hex))
	}

	function encryptData(data) {
		if (!isJsonBody(data)) throw new ApiCryptoError('request-json-required')
		let json
		try {
			// 字符串形式的 JSON 先解析，避免重复 JSON.stringify 改变业务数据。
			json = JSON.stringify(typeof data === 'string' ? JSON.parse(data) : (data === undefined ? {} : data))
			if (json === undefined) throw new Error('Empty JSON')
		} catch (_) { throw new ApiCryptoError('request-json-invalid') }
		const seed = CryptoJS.enc.Base64.stringify(fromBytes(random(24)))
		const key = CryptoJS.enc.Utf8.parse(seed)
		const encrypted = CryptoJS.AES.encrypt(json, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
		return { data: CryptoJS.enc.Base64.stringify(encrypted.ciphertext), encryptKey: wrapAesKey(key) }
	}

	function decryptResponseData(data, headers) {
		const encryptedKey = getHeader(headers, ENCRYPT_KEY_HEADER)
		if (encryptedKey === undefined) return parsePlainResponse(data)
		parseBase64(encryptedKey, 'response-rsa-ciphertext')
		const keyText = rsaFor('response').decrypt(encryptedKey.trim())
		if (!keyText) throw new ApiCryptoError('response-rsa-decryption')
		const key = parseBase64(keyText, 'response-aes-key')
		if (![16, 24, 32].includes(key.sigBytes)) throw new ApiCryptoError('response-aes-key-length')
		const ciphertext = parseBase64(data, 'response-aes-ciphertext')
		if (ciphertext.sigBytes % 16 !== 0) throw new ApiCryptoError('response-aes-block-length')
		try {
			// CryptoJS 的默认 unpad 不检查每个填充字节，这里显式校验 PKCS7。
			const plain = CryptoJS.AES.decrypt({ ciphertext }, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding })
			const padding = byteAt(plain, plain.sigBytes - 1)
			if (padding < 1 || padding > 16 || padding > plain.sigBytes) throw new Error('Invalid padding')
			for (let i = plain.sigBytes - padding; i < plain.sigBytes; i++) {
				if (byteAt(plain, i) !== padding) throw new Error('Invalid padding')
			}
			plain.sigBytes -= padding
			if (plain.sigBytes <= 0) throw new Error('Empty plaintext')
			return JSON.parse(CryptoJS.enc.Utf8.stringify(plain))
		} catch (_) { throw new ApiCryptoError('response-aes-decryption') }
	}

	function prepareJsonRequest({ method = 'GET', data, header = {} }, encryptRequest = true) {
		const headers = { ...header }
		if (!encryptRequest) return { data, header: headers }
		if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
			throw new ApiCryptoError('request-method-unsupported')
		}
		const contentType = getHeader(headers, 'Content-Type')
		if (contentType && !/^application\/(?:[\w.+-]+\+)?json(?:\s*;|$)/i.test(contentType)) {
			throw new ApiCryptoError('request-json-required')
		}
		const encrypted = encryptData(data)
		setHeader(headers, ENCRYPT_KEY_HEADER, encrypted.encryptKey)
		setHeader(headers, 'Content-Type', 'text/plain')
		return { data: encrypted.data, header: headers }
	}

	function decryptUniResponse(response) {
		return { ...response, data: decryptResponseData(response.data, response.header || response.headers) }
	}

	function prepareRequest(options) {
		const method = (options.method || 'GET').toUpperCase()
		if (options.encryptRequest === false) return { ...options, method }
		if (method === 'GET' || method === 'HEAD') {
			// 查询参数暂按原格式发送，响应仍由 decryptUniResponse 自动解密。
			return { ...options, method }
		}
		return { ...options, method, ...prepareJsonRequest(options) }
	}

	async function readFetchResponse(response) {
		const data = decryptResponseData(await response.text(), response.headers)
		if (typeof data === 'string') return JSON.parse(data)
		return data
	}

	return { encryptData, decryptResponseData, prepareJsonRequest, prepareRequest, decryptUniResponse, readFetchResponse }
}

const environment = import.meta.env || {}
export const apiCrypto = createApiCrypto({
	requestPublicKey: environment.VITE_REQUEST_PUBLIC_KEY,
	responsePrivateKey: environment.VITE_RESPONSE_PRIVATE_KEY
})
