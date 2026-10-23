import { apiCrypto, ApiCryptoError } from './crypto.js'
import { base_url } from './request.js'

function parseHeaders(text) {
	const headers = {}
	String(text || '').split(/\r?\n/).forEach(line => {
		const colon = line.indexOf(':')
		if (colon > 0) headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
	})
	return headers
}

function uploadFailure(status, data) {
	return { statusCode: status, data, msg: data && data.msg ? data.msg : `Upload failed (${status})` }
}

// 文件保持 multipart/form-data；仅解密响应。原生上传单独读取响应头，避免 uni.uploadFile 丢失 encrypt-key。
export async function uploadApiFiles(endpoint, files) {
	const url = base_url + endpoint
	const language = uni.getStorageSync('Language') || uni.getStorageSync('defaultLanguage') || 'en'
	const headers = {
		Authorization: 'Bearer ' + (uni.getStorageSync('token') || ''),
		'X-Language': language,
		lang: language
	}
	if (typeof plus !== 'undefined' && plus.uploader) {
		return new Promise((resolve, reject) => {
			const task = plus.uploader.createUpload(url, { method: 'POST', timeout: 30, retry: 0 }, (upload, status) => {
				try {
					const data = apiCrypto.decryptResponseData(upload.responseText, parseHeaders(upload.getAllResponseHeaders()))
					if (status >= 200 && status < 300) resolve(data)
					else reject(uploadFailure(status, data))
				} catch (error) { reject(error) }
			})
			Object.keys(headers).forEach(name => task.setRequestHeader(name, headers[name]))
			try {
				files.forEach((file, index) => {
					const filePath = typeof file === 'string' ? file : file.path || file.tempFilePath
					if (!filePath || !task.addFile(filePath, { key: 'file', name: `image_${index}.jpg` })) {
						throw new Error('Unable to attach upload file')
					}
				})
				task.start()
			} catch (error) { task.abort(); reject(error) }
		})
	}
	const form = new FormData()
	for (let i = 0; i < files.length; i++) {
		const file = files[i]
		let blob = file
		if (!(file instanceof Blob)) {
			if (file && file.file instanceof Blob) blob = file.file
			else {
				const path = typeof file === 'string' ? file : file.path || file.tempFilePath
				blob = await (await fetch(path)).blob()
			}
		}
		form.append('file', blob, blob.name || `image_${i}.jpg`)
	}
	const response = await fetch(url, { method: 'POST', headers, body: form })
	let data
	try { data = await apiCrypto.readFetchResponse(response) }
	catch (error) {
		if (error instanceof ApiCryptoError) throw error
		throw uploadFailure(response.status, null)
	}
	if (!response.ok) throw uploadFailure(response.status, data)
	return data
}
