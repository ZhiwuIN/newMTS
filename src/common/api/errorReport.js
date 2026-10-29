import { isUnexpectedPrompt } from '../../utils/uiMessageGuard.js'

const REPORT_PATH = '/app/error-report/batch'
const MAX_ATTEMPTS = 3
const MAX_EVENTS = 50
const MAX_AGE = 24 * 60 * 60 * 1000
const RETRY_DELAYS = [2000, 10000]
const LAST_RETRY_DELAY = RETRY_DELAYS[RETRY_DELAYS.length - 1]
const EVENT_FIELDS = ['eventId', 'errorType', 'errorKey', 'releaseVersion', 'message', 'requestPath', 'requestMethod', 'httpStatus', 'traceId', 'occurredAt']

function attempt(action, fallback) {
  try { return action() } catch (_) { return fallback }
}

function userId(value) {
  return (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) && String(value).trim() !== ''
    ? String(value) : ''
}

function text(value, limit = 2048) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).slice(0, limit) : ''
}

export function getHeaderValue(headers, name) {
  const key = Object.keys(headers || {}).find(key => key.toLowerCase() === name.toLowerCase())
  return key ? headers[key] : undefined
}

export function normalizeRequestPath(value) {
  if (typeof value !== 'string') return ''
  return attempt(() => {
    if (typeof URL === 'function') {
      const url = new URL(value, 'https://error-report.invalid/')
      return /^https?:$/.test(url.protocol) && url.pathname.startsWith('/app/') ? url.pathname : ''
    }
    // App 服务层不一定提供浏览器 URL 构造器。
    let path = value.trim()
    if (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^https?:\/\//i.test(path)) return ''
    if (/^(?:https?:)?\/\//i.test(path)) {
      const match = /^(?:https?:)?\/\/[^/?#]+(\/[^?#]*)?(?:[?#].*)?$/i.exec(path)
      if (!match) return ''
      path = match[1] || '/'
    }
    path = path.split(/[?#]/)[0]
    if (path.includes('\\')) return ''
    const segments = []
    for (const segment of path.split('/')) {
      if (segment === '..') segments.pop()
      else if (segment && segment !== '.') segments.push(segment)
    }
    path = '/' + segments.join('/')
    return path.startsWith('/app/') ? path : ''
  }, '')
}

function isReportPath(path) {
  return /^\/app\/error-report(?:\/|$)/.test(path)
}

function createEventId() {
  const crypto = typeof globalThis === 'undefined' ? null : globalThis.crypto
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  if (typeof crypto?.getRandomValues === 'function') crypto.getRandomValues(bytes)
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// 独立 uni.request 通道，不调用业务 request.js，因而不触发提示、刷新 Token 或再次上报。
export function createErrorReporter(options) {
  const { uni: api, baseURL, releaseVersion, getIdentity } = options
  const now = options.now || Date.now
  const makeId = options.createEventId || createEventId
  const setTimer = options.setTimeout || setTimeout
  const clearTimer = options.clearTimeout || clearTimeout
  const browser = options.browserWindow ?? (typeof window === 'undefined' ? null : window)
  // 与上一版普通接口异常队列隔离，旧事件不再发送。
  const storageKey = `__inculpation_reports_v1__:${baseURL}`
  const credentials = new Map() // 凭证只保留在内存，不写入本地事件队列。
  let queue = []
  let timer
  let sending = false
  let stopped = false

  function identity() {
    const value = attempt(getIdentity, {}) || {}
    const authorization = typeof value.authorization === 'string' ? value.authorization : ''
    return { subjectUserId: userId(value.subjectUserId), authorization }
  }

  function hasAuthorization(value) {
    return typeof value === 'string' && Boolean(value.replace(/^Bearer\s*/i, '').trim())
  }

  function persist() {
    // 明确白名单：不保存请求参数、请求体、响应原文或 Authorization。
    attempt(() => api.setStorageSync(storageKey, queue.map(item => ({
      subjectUserId: item.subjectUserId,
      event: Object.fromEntries(EVENT_FIELDS.map(key => [key, item.event[key]])),
      attempts: item.attempts,
      nextAttemptAt: item.nextAttemptAt
    }))))
  }

  function prune() {
    const timestamp = now()
    const count = queue.length
    queue = queue.filter(item => {
      const keep = item.attempts < MAX_ATTEMPTS && timestamp - item.event.occurredAt < MAX_AGE
      if (!keep) credentials.delete(item.event.eventId)
      return keep
    })
    if (queue.length !== count) persist()
  }

  const saved = attempt(() => api.getStorageSync(storageKey), [])
  if (Array.isArray(saved)) {
    const seen = new Set()
    for (const item of saved.slice(-MAX_EVENTS)) {
      const event = item?.event
      if (!userId(item?.subjectUserId) || !event || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.eventId) || seen.has(event.eventId)) continue
      if (event.errorType !== 'SYSTEM' || event.errorKey !== 'INCULPATION_POPUP' || !isUnexpectedPrompt(event.message)) continue
      if (!Number.isFinite(event.occurredAt) || event.occurredAt > now()) continue
      if (event.requestPath !== undefined && (!event.requestPath || normalizeRequestPath(event.requestPath) !== event.requestPath || isReportPath(event.requestPath))) continue
      if (event.httpStatus !== undefined && (!Number.isFinite(event.httpStatus) || event.httpStatus < 100 || event.httpStatus > 599)) continue
      if (EVENT_FIELDS.some(key => !['httpStatus', 'occurredAt'].includes(key) && event[key] !== undefined && typeof event[key] !== 'string')) continue
      if (!Number.isInteger(item.attempts) || item.attempts < 0 || item.attempts >= MAX_ATTEMPTS || !Number.isFinite(item.nextAttemptAt)) continue
      seen.add(event.eventId)
      queue.push({
        subjectUserId: item.subjectUserId,
        event: Object.fromEntries(EVENT_FIELDS.map(key => [key, event[key]])),
        attempts: item.attempts,
        nextAttemptAt: Math.min(item.nextAttemptAt, now() + LAST_RETRY_DELAY)
      })
    }
    prune()
    persist()
  }

  function reportError(subjectUserId, event, authorization) {
    return new Promise((resolve, reject) => {
      api.request({
        url: `${baseURL.replace(/\/$/, '')}${REPORT_PATH}`,
        method: 'POST',
        timeout: 5000,
        header: { 'Content-Type': 'application/json', Authorization: authorization },
        data: { subjectUserId, events: [Object.fromEntries(EVENT_FIELDS.map(key => [key, event[key]]))] },
        success(response) {
          const accepted = response.data?.data?.acceptedEventIds
          if (response.statusCode >= 200 && response.statusCode < 300 && response.data?.code === 200 && Array.isArray(accepted) && accepted.includes(event.eventId)) {
            resolve(accepted)
          } else reject(new Error('异常上报未确认'))
        },
        fail: reject
      })
    })
  }

  function schedule() {
    clearTimer(timer)
    timer = undefined
    if (stopped || sending || browser?.navigator?.onLine === false) return
    const current = identity()
    if (!current.subjectUserId || !hasAuthorization(current.authorization)) return
    const pending = queue.filter(item => userId(item.subjectUserId) === current.subjectUserId)
    if (!pending.length) return
    timer = setTimer(flush, Math.max(0, Math.min(...pending.map(item => item.nextAttemptAt)) - now()))
  }

  async function flush() {
    clearTimer(timer)
    timer = undefined
    if (stopped || sending || browser?.navigator?.onLine === false) return
    prune()
    const current = identity()
    if (!current.subjectUserId || !hasAuthorization(current.authorization)) return
    const item = queue.find(item => userId(item.subjectUserId) === current.subjectUserId && item.nextAttemptAt <= now())
    if (!item) { schedule(); return }
    sending = true
    item.attempts++
    persist() // 发出前计数，刷新页面也不能无限重试。
    const authorization = credentials.get(item.event.eventId) || current.authorization
    credentials.delete(item.event.eventId)
    try {
      await reportError(item.subjectUserId, item.event, authorization)
      queue = queue.filter(pending => pending.event.eventId !== item.event.eventId)
    } catch (_) {
      // 静默保留同一事件；不改变业务响应或再次触发异常上报。
      item.nextAttemptAt = now() + (RETRY_DELAYS[item.attempts - 1] || LAST_RETRY_DELAY)
    } finally {
      sending = false
      prune()
      persist()
      schedule()
    }
  }

  function capturePrompt(prompt, context) {
    return attempt(() => {
      const path = normalizeRequestPath(context?.url)
      if (stopped || !isUnexpectedPrompt(prompt?.originalTitle) || isReportPath(path) || !userId(context?.subjectUserId) || !hasAuthorization(context?.authorization)) return null
      const event = {
        eventId: makeId(),
        errorType: 'SYSTEM',
        errorKey: 'INCULPATION_POPUP',
        releaseVersion: text(typeof releaseVersion === 'function' ? releaseVersion() : releaseVersion, 128),
        message: 'Inculpation',
        requestPath: path || undefined,
        requestMethod: path && context.method ? text(context.method, 16).toUpperCase() : undefined,
        httpStatus: Number.isFinite(context.httpStatus) && context.httpStatus >= 100 && context.httpStatus <= 599 ? context.httpStatus : undefined,
        traceId: context.traceId ? text(context.traceId, 256) : undefined,
        occurredAt: Number.isFinite(prompt.occurredAt) ? prompt.occurredAt : now()
      }
      // 只采集这个固定词，不读取业务错误文字、请求参数或密码。
      const token = context.authorization.replace(/^Bearer\s+/i, '')
      for (const secret of [context.authorization, token]) {
        if (secret && event.traceId) event.traceId = event.traceId.split(secret).join('[REDACTED]')
      }
      prune()
      queue.push({ subjectUserId: context.subjectUserId, event, attempts: 0, nextAttemptAt: now() })
      credentials.set(event.eventId, context.authorization)
      while (queue.length > MAX_EVENTS) credentials.delete(queue.shift().event.eventId)
      persist()
      schedule() // 与业务回调解耦，不等待上报完成。
      return event.eventId
    }, null)
  }

  browser?.addEventListener('online', flush)
  return {
    capturePrompt,
    flush,
    reportError,
    stop() {
      stopped = true
      clearTimer(timer)
      credentials.clear()
      browser?.removeEventListener('online', flush)
    }
  }
}
