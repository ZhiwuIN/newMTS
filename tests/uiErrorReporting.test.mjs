import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import { JSDOM } from 'jsdom'

const dataModule = value => `data:text/javascript;base64,${Buffer.from(value).toString('base64')}`
const guardSource = await readFile(new URL('../src/utils/uiMessageGuard.js', import.meta.url), 'utf8')
const { installUiMessageGuard } = await import(dataModule(guardSource))
const reporterSource = (await readFile(new URL('../src/common/api/errorReport.js', import.meta.url), 'utf8')).replace('../../utils/uiMessageGuard.js', dataModule(guardSource))
const { createErrorReporter, getHeaderValue, normalizeRequestPath } = await import(dataModule(reporterSource))
const stripImports = source => source.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\r?\n/gm, '').replace(/^import\s+['"][^'"]+['"];?\r?\n/gm, '')
const bridgeSource = stripImports(await readFile(new URL('../src/common/api/uiErrorReporting.js', import.meta.url), 'utf8')).replaceAll('import.meta.env', 'env').replaceAll('export const ', 'const ').replaceAll('export function ', 'function ')
const mainSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8')
const mainPrefix = stripImports(mainSource.slice(0, mainSource.indexOf('// #ifndef VUE3'))).replaceAll('import.meta.env', 'env')
const requestSource = stripImports(await readFile(new URL('../src/common/api/request.js', import.meta.url), 'utf8')).replace('export { base_url };', '').replace('export default (params) =>', 'const request = (params) =>')
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve() }

function setup({ platform = 'h5', dom } = {}) {
  let timestamp = 1800000000000
  let sequence = 0
  const timers = new Map()
  const requests = []
  const uiCalls = []
  const hooks = new Map()
  const nativeCalls = []
  const storage = new Map([['userInfo', { userId: 101 }], ['token', 'token-account-alpha']])
  const setTimer = (fn, delay = 0) => { const key = {}; timers.set(key, { fn, due: timestamp + delay }); return key }
  const clearTimer = key => timers.delete(key)
  const native = { toast: title => nativeCalls.push(title), showWaiting: title => { nativeCalls.push(title); return { close() {} } } }
  const uni = {
    getStorageSync: key => storage.get(key), setStorageSync: (key, value) => storage.set(key, structuredClone(value)),
    getLocale: () => 'fr', getAppBaseInfo: () => ({ appVersion: platform === 'app-plus' ? '1.0.4' : '' }),
    addInterceptor: (name, hook) => hooks.set(name, hook), removeInterceptor: name => hooks.delete(name),
    hideLoading() {}, $emit() {},
    request(args) {
      requests.push(args)
      if (args.url.endsWith('/app/error-report/batch')) {
        Promise.resolve().then(() => args.success({ statusCode: 200, data: { code: 200, data: { acceptedEventIds: [args.data.events[0].eventId] } } }))
      }
    }
  }
  for (const name of ['showToast', 'showLoading']) {
    uni[name] = (args = {}) => {
      if (hooks.get(name)?.invoke(args) !== false) uiCalls.push(args.title)
      return Promise.resolve({ errMsg: `${name}:ok` })
    }
  }
  const globals = {
    uni, base_url: 'https://api.example.test', version: '1.6.7', env: { DEV: false },
    createErrorReporter: options => createErrorReporter({ ...options, browserWindow: null, now: () => timestamp, setTimeout: setTimer, clearTimeout: clearTimer }),
    getHeaderValue, normalizeRequestPath, getCurrentPages: () => [{ route: 'pages/MinePage/withdrawal' }],
    Date: { now: () => timestamp }, setTimeout: setTimer, clearTimeout: clearTimer
  }
  const bridge = runInNewContext(`${bridgeSource}; ({ errorReporter, beginErrorReportRequest, finishErrorReportRequest, reportInculpation })`, globals)
  let guard
  // Execute main.js's actual production bootstrap, not a hand-written onBlock callback.
  runInNewContext(mainPrefix, {
    ...globals, ...bridge, process: { env: { UNI_PLATFORM: platform } }, plus: { nativeUI: native },
    en: {}, ru: {}, es: {}, fr: {}, zh: {}, tv: {}, console: { warn() {} },
    installUiMessageGuard: options => { guard = installUiMessageGuard({ ...options, browserWindow: dom?.window }); return guard }
  })
  const request = runInNewContext(`${requestSource}; request`, {
    ...globals, ...bridge, en: {}, ru: {}, es: {}, fr: {}, zh: {}, tv: {},
    initVueI18n: () => ({ t: value => value }), showMessage: (_, title) => uni.showToast({ title }), console: { log() {} }
  })
  return {
    ...bridge, request, uni, native, nativeCalls, storage, requests, uiCalls,
    reports: () => requests.filter(item => item.url.endsWith('/app/error-report/batch')),
    tick: ms => { timestamp += ms },
    async drain() {
      await settle()
      for (let i = 0; i < 100; i++) {
        const due = [...timers].find(([, value]) => value.due <= timestamp)
        if (!due) return
        timers.delete(due[0])
        due[1].fn()
        await settle()
      }
      assert.fail('timer loop')
    },
    stop() { guard.stop(); bridge.errorReporter.stop(); dom?.window.close() }
  }
}

test('production main wiring reports only blocked uni prompts and keeps ordinary prompts visible', async () => {
  const s = setup()
  await s.uni.showToast({ title: 'Succès' })
  await s.uni.showLoading({ title: 'Chargement' })
  await s.drain()
  assert.equal(s.reports().length, 0)
  await s.uni.showToast({ title: 'Inculpation' })
  await s.drain()
  assert.equal(s.reports().length, 1)
  assert.deepEqual(s.uiCalls, ['Succès', 'Chargement'])
  assert.equal(s.reports()[0].data.events[0].message, 'Inculpation')
  s.stop()
})

test('App native interception uses the same reporting hook and the installed app version', async () => {
  const s = setup({ platform: 'app-plus' })
  s.native.toast('Succès')
  s.native.toast('Inculpation')
  s.native.showWaiting('Inculpation').close()
  await s.drain()
  assert.deepEqual(s.nativeCalls, ['Succès'])
  assert.equal(s.reports().length, 2)
  assert.equal(s.reports()[0].data.events[0].releaseVersion, '1.0.4')
  s.stop()
})

test('H5 DOM rewrite produces one report while repeated hiding does not duplicate the incident', async () => {
  const dom = new JSDOM('<body><uni-toast><p class="uni-simple-toast__text">Succès</p></uni-toast></body>')
  const s = setup({ dom })
  const popup = dom.window.document.querySelector('p')
  popup.textContent = 'Inculpation'
  await new Promise(resolve => setTimeout(resolve, 20))
  await s.drain()
  assert.equal(s.reports().length, 1)
  const toast = dom.window.document.querySelector('uni-toast')
  assert.equal(toast.style.display, 'none')
  toast.style.display = 'block'
  await new Promise(resolve => setTimeout(resolve, 20))
  await s.drain()
  assert.equal(s.reports().length, 1)
  assert.equal(toast.style.display, 'none')
  s.stop()
})

test('normal business errors retain their handling and never report even if reportable=true', async () => {
  const s = setup()
  const pending = s.request({ url: '/app/example', method: 'post', data: { password: 'secret' } })
  const error = { code: 404, reportable: true, msg: 'Original error', traceId: 'ordinary-trace' }
  s.requests[0].success({ statusCode: 200, data: error })
  await assert.rejects(pending, value => value === error)
  await s.drain()
  assert.equal(s.reports().length, 0)
  assert.deepEqual(s.uiCalls, ['request.addressError'])
  s.stop()
})

test('a response containing Inculpation does not report until the UI actually attempts that popup', async () => {
  const s = setup()
  const pending = s.request({ url: '/app/order/create', method: 'post' })
  const error = { code: 500, msg: 'Inculpation' }
  s.requests[0].success({ statusCode: 200, data: error })
  await assert.rejects(pending, value => value === error)
  await s.drain()
  assert.equal(s.reports().length, 0)
  s.stop()
})

test('a blocked prompt from the original response carries the real HTTP status and trace ID', async () => {
  const s = setup()
  const pending = s.request({ url: '/app/order/create?password=secret', method: 'post' }).catch(error => s.uni.showToast({ title: error.data.msg }))
  s.requests[0].success({ statusCode: 500, data: { code: 500, msg: 'Inculpation' }, header: { 'X-Trace-Id': 'original-order-trace' } })
  await pending
  await s.drain()
  const event = s.reports()[0].data.events[0]
  assert.equal(event.requestPath, '/app/order/create')
  assert.equal(event.requestMethod, 'POST')
  assert.equal(event.httpStatus, 500)
  assert.equal(event.traceId, 'original-order-trace')
  assert.equal(s.requests.filter(item => item.url.includes('/app/order/create')).length, 1)
  assert.equal(JSON.stringify(s.reports()[0].data).includes('password'), false)
  s.stop()
})

test('a loading prompt intercepted before dispatch can associate the following same-stack request', async () => {
  const s = setup()
  s.uni.showLoading({ title: 'Inculpation' })
  s.beginErrorReportRequest({ url: '/app/order/create?x=secret', method: 'post', authorization: 'Bearer token-account-alpha' })
  await s.drain()
  const event = s.reports()[0].data.events[0]
  assert.equal(event.requestPath, '/app/order/create')
  assert.equal(event.httpStatus, undefined)
  assert.equal(event.traceId, undefined)
  s.stop()
})

test('expired or ambiguous responses are not assigned to an unrelated UI incident', async () => {
  const s = setup()
  for (const url of ['/app/first', '/app/second']) {
    const metadata = s.beginErrorReportRequest({ url, method: 'get', authorization: 'Bearer token-account-alpha' })
    s.finishErrorReportRequest(metadata, { statusCode: 500, data: { traceId: url } })
  }
  s.uni.showToast({ title: 'Inculpation' })
  await s.drain()
  assert.equal(s.reports()[0].data.events[0].requestPath, undefined)
  s.tick(10)
  s.uni.showToast({ title: 'Inculpation' })
  await s.drain()
  assert.equal(s.reports()[1].data.events[0].traceId, undefined)
  s.stop()
})

test('an account switch before deferred capture never sends the old member event as the new member', async () => {
  const s = setup()
  s.uni.showToast({ title: 'Inculpation' })
  s.storage.set('userInfo', { userId: 202 })
  s.storage.set('token', 'token-account-beta')
  await s.drain()
  assert.equal(s.reports().length, 0)
  s.storage.set('userInfo', { userId: 101 })
  s.storage.set('token', 'token-account-alpha')
  await s.errorReporter.flush()
  await s.drain()
  assert.equal(s.reports()[0].data.subjectUserId, 101)
  assert.equal(s.reports()[0].header.Authorization, 'Bearer token-account-alpha')
  s.stop()
})
