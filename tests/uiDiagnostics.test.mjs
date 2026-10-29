import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const source = await readFile(new URL('../src/utils/uiDiagnostics.js', import.meta.url), 'utf8')
const { installUiDiagnostics } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

function setup(extra = {}) {
  const storage = new Map()
  const hooks = new Map()
  const uni = {
    getStorageSync: key => storage.get(key),
    setStorageSync: (key, value) => storage.set(key, value),
    removeStorageSync: key => storage.delete(key),
    getLocale: () => 'fr',
    getSystemInfoSync: () => ({ platform: 'android', language: 'fr-FR', deviceId: 'excluded' }),
    addInterceptor: (name, hook) => hooks.set(name, hook),
    removeInterceptor: (name, hook) => { if (hooks.get(name) === hook) hooks.delete(name) }
  }
  const options = { uni, getPages: () => [{ route: 'pages/LoginPage/login' }], platform: 'h5', logger() {}, ...extra }
  const diagnostics = installUiDiagnostics(options)
  return { uni, hooks, storage, options, diagnostics, read: () => JSON.parse(diagnostics.dump()) }
}

test('records raw arguments without modifying them; registration is idempotent and storage is bounded', () => {
  const context = setup()
  assert.equal(installUiDiagnostics(context.options), context.diagnostics)
  assert.equal(context.hooks.size, 4)
  const args = Object.freeze({ title: 'Chargement', icon: 'none', success() {} })
  for (let i = 0; i < 100; i++) context.hooks.get('showToast').invoke(args)
  const records = context.read()
  assert.equal(records.length, 80)
  assert.equal(records.at(-1).title, 'Chargement')
  assert.equal(records.at(-1).locale, 'fr')
  assert.equal(records.at(-1).page, 'pages/LoginPage/login')
  assert.equal(args.title, 'Chargement')
  context.diagnostics.stop()
  assert.equal(context.hooks.size, 0)
})

test('native wrappers preserve receiver, arguments, return values and thrown errors', () => {
  const result = { close() {} }
  const expectedError = new Error('native failure')
  const native = {
    showWaiting(...args) { assert.equal(this, native); assert.equal(args[0], 'Chargement'); return result },
    toast() { throw expectedError }
  }
  const original = native.showWaiting
  const context = setup({ getNativeUI: () => native })
  assert.equal(native.showWaiting('Chargement', { modal: true }), result)
  assert.throws(() => native.toast('test'), error => error === expectedError)
  assert.ok(context.read().some(item => item.api === 'plus.nativeUI.showWaiting'))
  context.diagnostics.stop()
  assert.equal(native.showWaiting, original)
})

test('logging failures and a read-only native bridge do not prevent prompt calls', () => {
  const native = Object.freeze({ toast: () => 7 })
  const context = setup({ getNativeUI: () => native, logger() { throw new Error('console unavailable') } })
  context.uni.setStorageSync = () => { throw new Error('storage unavailable') }
  assert.doesNotThrow(() => context.hooks.get('showToast').invoke({ title: 'test' }))
  assert.equal(native.toast('test'), 7)
  context.diagnostics.stop()
})

test('captures rendered text and font changes separately from the original API title', async () => {
  const dom = new JSDOM('<html lang="fr"><body><div class="uni-simple-toast__text" role="status" style="font-family:serif;opacity:1">Chargement</div></body></html>', { url: 'http://localhost/' })
  const popup = dom.window.document.querySelector('[role="status"]')
  popup.getClientRects = () => [{ width: 100, height: 40 }]
  const context = setup({ browserWindow: dom.window })
  const args = { title: 'Chargement' }
  context.hooks.get('showToast').invoke(args)
  popup.firstChild.nodeValue = 'Inculpation'
  dom.window.document.documentElement.className = 'translated-ltr'
  await new Promise(resolve => setTimeout(resolve, 120))
  const records = context.read()
  assert.ok(records.some(item => item.source === 'uni' && item.title === 'Chargement'))
  assert.ok(records.some(item => item.source === 'dom' && item.title === 'Inculpation' && item.fontFamily === 'serif'))
  assert.ok(records.some(item => item.api === 'translation-markers' && item.translatedClass === true))
  assert.equal(args.title, 'Chargement')
  assert.equal(records.find(item => item.api === 'snapshot').system.deviceId, undefined)
  context.diagnostics.stop()
  dom.window.close()
})
