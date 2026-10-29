import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

const dataModule = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const guardSource = await readFile(new URL('../src/utils/uiMessageGuard.js', import.meta.url), 'utf8')
const source = (await readFile(new URL('../src/common/api/errorReport.js', import.meta.url), 'utf8')).replace('../../utils/uiMessageGuard.js', dataModule(guardSource))
const { createErrorReporter, normalizeRequestPath } = await import(dataModule(source))
const settle = async () => { for (let i = 0; i < 6; i++) await Promise.resolve() }
const context = (extra = {}) => ({ subjectUserId: 101, authorization: 'Bearer token-account-alpha', url: '/app/order/create?password=do-not-report#fragment', method: 'post', httpStatus: 500, traceId: 'original-trace', ...extra })
const prompt = (extra = {}) => ({ originalTitle: 'Inculpation', source: 'uni.showToast', ...extra })
const queueKey = '__inculpation_reports_v1__:https://api.example.test'

function setup(extra = {}) {
  let timestamp = 1800000000000
  let sequence = 0
  let current = { subjectUserId: 101, authorization: 'Bearer token-account-alpha' }
  const timers = new Map()
  const storage = extra.storage || new Map()
  const requests = []
  const listeners = new Map()
  const browser = { navigator: { onLine: true }, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) }
  const uni = {
    getStorageSync: key => storage.get(key),
    setStorageSync: (key, value) => storage.set(key, structuredClone(value)),
    request: args => requests.push(args)
  }
  const options = {
    uni, baseURL: 'https://api.example.test', releaseVersion: '1.6.7', getIdentity: () => current,
    browserWindow: browser, now: () => timestamp,
    createEventId: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`,
    setTimeout: (fn, delay) => { const key = {}; timers.set(key, { fn, due: timestamp + delay }); return key },
    clearTimeout: key => timers.delete(key),
    ...extra
  }
  const reporter = createErrorReporter(options)
  return {
    reporter, options, uni, requests, storage, timers, browser, listeners,
    setIdentity: value => { current = value },
    queue: () => storage.get(queueKey) || [],
    async advance(ms = 0) {
      timestamp += ms
      for (let i = 0; i < 100; i++) {
        const due = [...timers].find(([, value]) => value.due <= timestamp)
        if (!due) return
        timers.delete(due[0])
        due[1].fn()
        await settle()
      }
      assert.fail('timer loop did not terminate')
    },
    async accept(index = requests.length - 1) {
      const request = requests[index]
      request.success({ statusCode: 200, data: { code: 200, data: { acceptedEventIds: [request.data.events[0].eventId] } } })
      await settle()
    }
  }
}

test('normalizes /app paths without query strings, fragments or URL credentials', () => {
  for (const url of ['/app/user/info?token=secret#x', 'app/user/info', 'https://name:password@api.test/app/user/info?token=secret', '//api.test/app/user/info?q=1']) assert.equal(normalizeRequestPath(url), '/app/user/info')
  for (const url of [null, {}, '/auth/refreshToken', 'javascript:alert(1)']) assert.equal(normalizeRequestPath(url), '')
})

test('App service contexts without a browser URL constructor still normalize original paths', () => {
  const normalize = runInNewContext(`(${normalizeRequestPath.toString()})`, {
    URL: undefined,
    attempt(action, fallback) { try { return action() } catch (_) { return fallback } }
  })
  for (const url of ['/app/order/create?password=secret', 'app/order/create', 'https://name:password@api.test/app/order/create?q=secret#fragment', '//api.test/app/order/create']) assert.equal(normalize(url), '/app/order/create')
  for (const url of ['javascript:alert(1)', '/app/../auth/refreshToken', 'https://api.test/auth/refreshToken']) assert.equal(normalize(url), '')
})

test('only the intercepted Inculpation prompt creates an event, without a reportable flag', async () => {
  const s = setup()
  assert.equal(s.reporter.captureResponse, undefined)
  for (const title of ['Chargement', 'Succès', 'Service unavailable', 'Error: Inculpation', '', undefined]) assert.equal(s.reporter.capturePrompt(prompt({ originalTitle: title, reportable: true }), context()), null)
  assert.equal(s.reporter.capturePrompt(prompt(), context({ subjectUserId: null })), null)
  assert.equal(s.reporter.capturePrompt(prompt(), context({ authorization: 'Bearer ' })), null)
  assert.equal(s.reporter.capturePrompt(prompt(), context({ url: '/app/error-report/batch' })), null)
  assert.ok(s.reporter.capturePrompt(prompt({ originalTitle: ' INCULPATION ' }), context()))
  await s.advance()
  assert.equal(s.requests.length, 1)
  await s.accept()
  s.reporter.stop()
})

test('sends the new JSON contract using existing credentials and original request metadata', async () => {
  const s = setup()
  const id = s.reporter.capturePrompt(prompt(), context({ data: { password: 'do-not-report' }, header: { Authorization: 'never-serialize-headers' } }))
  assert.equal(s.requests.length, 0)
  await s.advance()
  const request = s.requests[0]
  assert.equal(request.url, 'https://api.example.test/app/error-report/batch')
  assert.equal(request.timeout, 5000)
  assert.equal(request.method, 'POST')
  assert.deepEqual(request.header, { 'Content-Type': 'application/json', Authorization: 'Bearer token-account-alpha' })
  assert.equal(request.complete, undefined)
  assert.equal(request.data.subjectUserId, 101)
  assert.deepEqual(request.data.events[0], {
    eventId: id, errorType: 'SYSTEM', errorKey: 'INCULPATION_POPUP', releaseVersion: '1.6.7', message: 'Inculpation',
    requestPath: '/app/order/create', requestMethod: 'POST', httpStatus: 500, traceId: 'original-trace', occurredAt: 1800000000000
  })
  assert.equal(JSON.stringify(request.data).includes('do-not-report'), false)
  assert.equal(JSON.stringify([...s.storage.values()]).includes('token-account-alpha'), false)
  await s.accept()
  assert.equal(s.queue().length, 0)
  assert.equal(s.timers.size, 0)
  s.reporter.stop()
})

test('UI-only incidents omit unknown HTTP metadata instead of inventing a failing endpoint', async () => {
  const s = setup()
  s.reporter.capturePrompt(prompt({ source: 'h5.toast-dom' }), context({ url: undefined, method: undefined, httpStatus: undefined, traceId: undefined }))
  await s.advance()
  const event = JSON.parse(JSON.stringify(s.requests[0].data.events[0]))
  for (const key of ['requestPath', 'requestMethod', 'httpStatus', 'traceId', 'businessCode']) assert.equal(key in event, false)
  assert.equal(event.message, 'Inculpation')
  await s.accept()
  s.reporter.stop()
})

test('retries only the original report at most three times with the same ID and timestamp', async () => {
  const s = setup()
  s.reporter.capturePrompt(prompt(), context())
  await s.advance()
  s.requests[0].fail(new Error('offline'))
  await settle()
  await s.advance(1999)
  assert.equal(s.requests.length, 1)
  await s.advance(1)
  s.requests[1].success({ statusCode: 200, data: { code: 200, data: { acceptedEventIds: ['another-event'] } } })
  await settle()
  await s.advance(9999)
  assert.equal(s.requests.length, 2)
  await s.advance(1)
  s.requests[2].success({ statusCode: 500, data: { code: 500, msg: 'collector failed' } })
  await settle()
  assert.deepEqual(s.requests.map(item => item.data), Array(3).fill(s.requests[0].data))
  assert.equal(s.queue().length, 0)
  await s.advance(60000)
  assert.equal(s.requests.length, 3)
  s.reporter.stop()
})

test('queued incidents stay with the member captured at interception across account switches', async () => {
  const s = setup()
  s.setIdentity({ subjectUserId: 202, authorization: 'Bearer token-account-beta' })
  const idA = s.reporter.capturePrompt(prompt(), context())
  await s.advance()
  assert.equal(s.requests.length, 0)
  s.reporter.capturePrompt(prompt(), context({ subjectUserId: 202, authorization: 'Bearer token-account-beta' }))
  await s.advance()
  assert.equal(s.requests[0].data.subjectUserId, 202)
  assert.equal(s.requests[0].header.Authorization, 'Bearer token-account-beta')
  await s.accept()
  assert.equal(s.queue()[0].event.eventId, idA)
  s.setIdentity({ subjectUserId: 101, authorization: 'Bearer token-account-alpha' })
  const pending = s.reporter.flush()
  assert.equal(s.requests[1].data.subjectUserId, 101)
  await s.accept()
  await pending
  s.reporter.stop()
})

test('resumes only Inculpation events after reload, using the same member current credentials', async () => {
  const s = setup()
  const id = s.reporter.capturePrompt(prompt(), context())
  await s.advance()
  s.requests[0].fail(new Error('temporary'))
  await settle()
  s.reporter.stop()
  const restored = setup({ storage: s.storage, createEventId: () => assert.fail('retry must not generate an ID') })
  restored.setIdentity({ subjectUserId: 202, authorization: 'Bearer token-account-beta' })
  await restored.reporter.flush()
  assert.equal(restored.requests.length, 0)
  restored.setIdentity({ subjectUserId: 101, authorization: 'Bearer refreshed-account-alpha' })
  await restored.advance(2000)
  const pending = restored.reporter.flush()
  assert.equal(restored.requests[0].data.events[0].eventId, id)
  assert.equal(restored.requests[0].header.Authorization, 'Bearer refreshed-account-alpha')
  await restored.accept()
  await pending
  restored.reporter.stop()
})

test('never restores the old generic response-error queue', async () => {
  const storage = new Map([['__app_error_reports_v1__:https://api.example.test', [{ subjectUserId: 101, event: { message: 'Old business failure' }, attempts: 0, nextAttemptAt: 0 }]]])
  const s = setup({ storage })
  await s.reporter.flush()
  await s.advance()
  assert.equal(s.requests.length, 0)
  s.reporter.stop()
})

test('pauses offline without consuming retries and resumes on online', async () => {
  const s = setup()
  s.browser.navigator.onLine = false
  s.reporter.capturePrompt(prompt(), context())
  await s.advance(20000)
  assert.equal(s.requests.length, 0)
  assert.equal(s.queue()[0].attempts, 0)
  s.browser.navigator.onLine = true
  const pending = s.listeners.get('online')()
  await s.accept()
  await pending
  s.reporter.stop()
  assert.equal(s.listeners.size, 0)
})

test('bounds pending incidents and expires records after 24 hours', async () => {
  const s = setup()
  s.browser.navigator.onLine = false
  for (let i = 0; i < 60; i++) s.reporter.capturePrompt(prompt(), context())
  assert.equal(s.queue().length, 50)
  await s.advance(24 * 60 * 60 * 1000 + 1)
  s.reporter.capturePrompt(prompt(), context())
  assert.equal(s.queue().length, 1)
  s.reporter.stop()
})

test('redacts credentials accidentally supplied as a trace ID', async () => {
  const s = setup()
  s.reporter.capturePrompt(prompt(), context({ traceId: 'Bearer token-account-alpha token-account-alpha' }))
  await s.advance()
  assert.equal(s.requests[0].data.events[0].traceId, '[REDACTED] [REDACTED]')
  await s.accept()
  s.reporter.stop()
})

test('restored queues discard non-Inculpation events, malformed paths and extra fields', async () => {
  const s = setup()
  s.browser.navigator.onLine = false
  s.reporter.capturePrompt(prompt(), context())
  const saved = s.queue()
  saved[0].authorization = 'Bearer must-not-persist'
  saved[0].event.requestData = { password: 'must-not-persist' }
  saved.push({ ...saved[0], event: { ...saved[0].event, eventId: '00000000-0000-4000-8000-999999999999', requestPath: '/app/example?password=secret' } })
  saved.push({ ...saved[0], event: { ...saved[0].event, eventId: '00000000-0000-4000-8000-888888888888', message: 'Generic failure' } })
  s.storage.set(queueKey, saved)
  s.reporter.stop()
  const restored = setup({ storage: s.storage })
  assert.equal(restored.queue().length, 1)
  assert.equal(JSON.stringify(restored.queue()).includes('must-not-persist'), false)
  const pending = restored.reporter.flush()
  await restored.accept()
  await pending
  restored.reporter.stop()
})

test('default event IDs are UUID v4 and distinct for separate incidents', () => {
  const s = setup({ createEventId: undefined })
  s.browser.navigator.onLine = false
  const first = s.reporter.capturePrompt(prompt(), context())
  const second = s.reporter.capturePrompt(prompt(), context())
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  assert.notEqual(first, second)
  s.reporter.stop()
})

test('storage or transport failures never escape into the UI flow', async () => {
  const s = setup()
  s.uni.setStorageSync = () => { throw new Error('quota exceeded') }
  assert.ok(s.reporter.capturePrompt(prompt(), context()))
  s.uni.request = () => { throw new Error('transport unavailable') }
  await s.advance()
  await s.advance(2000)
  await s.advance(10000)
  assert.equal(s.timers.size, 0)
  s.reporter.stop()
})

test('the temporary stop switch suppresses collection and queued retries', async () => {
  const s = setup()
  s.reporter.capturePrompt(prompt(), context())
  s.reporter.stop()
  assert.equal(s.reporter.capturePrompt(prompt(), context()), null)
  await s.reporter.flush()
  await s.advance(20000)
  assert.equal(s.requests.length, 0)
})
