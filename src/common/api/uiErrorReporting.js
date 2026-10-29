import { version } from '../../../package.json'
import { base_url } from './config.js'
import { createErrorReporter, getHeaderValue, normalizeRequestPath } from './errorReport.js'

function attempt(action, fallback) {
  try { return action() } catch (_) { return fallback }
}

function getIdentity() {
  return {
    subjectUserId: uni.getStorageSync('userInfo')?.userId,
    authorization: 'Bearer ' + (uni.getStorageSync('token') || '')
  }
}

function getPage() {
  return attempt(() => {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    return pages[pages.length - 1]?.route || ''
  }, '')
}

export const errorReporter = createErrorReporter({
  uni,
  baseURL: base_url,
  releaseVersion: () => import.meta.env.VITE_H5_RELEASE_VERSION || attempt(() => uni.getAppBaseInfo?.().appVersion, '') || version,
  getIdentity
})
// 暂停上报（取消下一行注释即可，不影响 Inculpation 弹窗拦截）：
errorReporter.stop()

const pendingRequests = new Set()
const responseContexts = new Set()
let responseTimer

// 这里只留接口元数据，不生成事件，不保留业务请求体或响应正文。
export function beginErrorReportRequest({ url, method, authorization }) {
  return attempt(() => {
    errorReporter.flush().catch(() => {})
    const path = normalizeRequestPath(url)
    if (!path || /^\/app\/error-report(?:\/|$)/.test(path)) return
    const now = Date.now()
    for (const pending of pendingRequests) {
      if (now - pending.startedAt > 30000) pendingRequests.delete(pending)
    }
    const context = {
      url: path, method, authorization,
      subjectUserId: getIdentity().subjectUserId,
      page: getPage(), startedAt: now
    }
    pendingRequests.add(context)
    if (pendingRequests.size > 50) pendingRequests.delete(pendingRequests.values().next().value)
    return context
  })
}

export function finishErrorReportRequest(context, response = {}) {
  if (!context) return
  attempt(() => {
    pendingRequests.delete(context)
    context.httpStatus = response.statusCode
    context.traceId = response.data?.traceId || getHeaderValue(response.header, 'x-trace-id')
    // 保留到本次响应触发的 Promise.then/catch 执行完；不借用历史接口。
    responseContexts.add(context)
    clearTimeout(responseTimer)
    responseTimer = setTimeout(() => responseContexts.clear(), 0)
  })
}

export function reportInculpation(prompt) {
  attempt(() => {
    const occurredAt = Date.now()
    const identity = getIdentity()
    const page = getPage()
    const matches = context => context && context.page === page &&
      String(context.subjectUserId) === String(identity.subjectUserId) && context.authorization === identity.authorization
    const responseContext = responseContexts.size === 1 ? responseContexts.values().next().value : undefined
    const knownResponse = matches(responseContext) ? { ...responseContext } : undefined
    // Loading 可能先于业务请求调用；等同一调用栈中的请求登记完成。
    setTimeout(() => {
      attempt(() => {
        const candidates = [...pendingRequests].filter(context => matches(context) &&
          Date.now() - context.startedAt <= 30000 && context.startedAt >= occurredAt)
        const related = knownResponse || (candidates.length === 1 ? candidates[0] : undefined)
        errorReporter.capturePrompt({ ...prompt, occurredAt }, {
          ...related,
          // 始终归属弹窗拦截时的账号，不能被异步切换的账号覆盖。
          ...identity
        })
      })
    }, 0)
  })
}
