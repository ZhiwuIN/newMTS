import request from './request.js'
import { uploadApiFiles } from './upload.js'

// Multipart requests remain unencrypted; the shared upload entry decrypts responses.
export function s3upload(file) {
	return uploadApiFiles('/s3/upload', [file])
}

export function s3uploads(files) {
	return uploadApiFiles('/s3/uploads', files)
}

// 提交认证资料
export function kAuthSubmitApi(data) {
    return request({
        url: '/app/k-auth/submit',
        method: 'post',
        data
    })
}

// 认证详情
export function kAuthInfoApi(data) {
    return request({
        url: '/app/k-auth',
        method: 'get',
        data
    })
}

// k认证状态
export function kAuthStatusApi(data) {
    return request({
        url: '/app/k-auth/status',
        method: 'get',
        data
    })
}
