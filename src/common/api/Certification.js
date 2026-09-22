import request from './request.js'

// 上传图片
export async function s3upload(file) {
    const formData = new FormData()
    const blob = await pathToBlob(file)
    formData.append('file', blob, `image.jpg`)

    const base_url = import.meta.env.VITE_API_URL ?? 'https://app.back-system.link'
    const token = uni.getStorageSync('token') || ''

    const res = await fetch(`${base_url}/s3/upload`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData, // fetch 会自动生成正确的 multipart/form-data + boundary
    })

    return await res.json()
}

// 一次性上传多张图片
export async function s3uploads(files) {
    const formData = new FormData()

    for (let i = 0; i < files.length; i++) {
        const filePath = files[i]
        const blob = await pathToBlob(filePath)
        formData.append('file', blob, `image_${i}.jpg`)
    }

    const base_url = import.meta.env.VITE_API_URL ?? 'https://app.back-system.link'
    const token = uni.getStorageSync('token') || ''

    const res = await fetch(`${base_url}/s3/uploads`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })

    return await res.json()
}

// 把本地路径转成 Blob
function pathToBlob(filePath) {
    return new Promise((resolve, reject) => {
        if (filePath.startsWith('blob:')) {
            fetch(filePath)
                .then(res => res.blob())
                .then(resolve)
                .catch(reject)
        }
        else {
            uni.request({
                url: filePath,
                responseType: 'blob',
                success: res => resolve(res.data),
                fail: reject,
            })
        }
    })
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