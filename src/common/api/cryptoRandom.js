// App 的逻辑层不一定提供 Web Crypto，使用各平台的原生随机数来源。
export function secureRandomBytes(length, runtime) {
	if (!Number.isInteger(length) || length <= 0 || length > 65536) {
		throw new Error('Invalid random byte length')
	}
	const root = typeof globalThis !== 'undefined' ? globalThis
		: (typeof window !== 'undefined' ? window : {})
	const native = typeof plus !== 'undefined' ? plus : undefined
	const environment = runtime || { crypto: root.crypto || root.msCrypto, plus: native }
	const bytes = new Uint8Array(length)
	if (environment.crypto && typeof environment.crypto.getRandomValues === 'function') {
		environment.crypto.getRandomValues(bytes)
		return bytes
	}

	const bridge = environment.plus
	if (bridge && bridge.os && bridge.os.name === 'Android' && bridge.android) {
		const SecureRandom = bridge.android.importClass('java.security.SecureRandom')
		const random = new SecureRandom()
		for (let i = 0; i < length; i++) bytes[i] = random.nextInt(256)
		return bytes
	}
	if (bridge && bridge.os && bridge.os.name === 'iOS' && bridge.ios) {
		// NSUUID v4 使用系统随机源。丢弃含版本/变体固定位的第 6、8 字节。
		// Apple 实现：https://github.com/apple-oss-distributions/Libc/blob/main/uuid/uuidsrc/gen_uuid.c
		let offset = 0
		while (offset < length) {
			const uuidObject = bridge.ios.invoke('NSUUID', 'UUID')
			let uuid
			try {
				uuid = String(bridge.ios.invoke(uuidObject, 'UUIDString'))
			} finally {
				bridge.ios.deleteObject(uuidObject)
			}
			if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
				throw new Error('Native random UUID is unavailable')
			}
			const hex = uuid.replace(/-/g, '')
			for (let i = 0; i < 16 && offset < length; i++) {
				if (i !== 6 && i !== 8) bytes[offset++] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
			}
		}
		return bytes
	}
	// 禁止退回 Math.random() 生成 AES 密钥或 RSA 填充。
	throw new Error('A native secure random source is required')
}
