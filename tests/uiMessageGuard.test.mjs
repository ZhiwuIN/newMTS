import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import { JSDOM } from 'jsdom'

const source = await readFile(new URL('../src/utils/uiMessageGuard.js', import.meta.url), 'utf8')
const { installUiMessageGuard, isUnexpectedPrompt } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

function setup(extra = {}) {
  const hooks = new Map()
  const blocked = []
  const uni = {
    addInterceptor(name, hook) { hooks.set(name, hook) },
    removeInterceptor(name, hook) { if (hooks.get(name) === hook) hooks.delete(name) }
  }
  const options = { uni, onBlock: event => blocked.push(event), ...extra }
  const guard = installUiMessageGuard(options)
  return { uni, hooks, blocked, guard, options }
}

const flushDom = () => new Promise(resolve => setTimeout(resolve, 20))

test('matches only the entire unexpected word, including casing, whitespace and invisible characters', () => {
  for (const value of ['Inculpation', ' INCULPATION ', '\u200bInculpation\ufeff', 'inculpation...']) assert.equal(isUnexpectedPrompt(value), true)
  for (const value of ['Chargement', 'Succès', 'Error: Inculpation', 'Inculpations', '', null, {}, 0]) assert.equal(isUnexpectedPrompt(value), false)
})

test('uni cancels the unwanted popup without substituting text and completes only the UI callbacks', () => {
  const context = setup()
  assert.equal(installUiMessageGuard(context.options), context.guard)
  for (const name of ['showToast', 'showLoading']) {
    const callbacks = []
    const args = Object.freeze({
      title: 'Inculpation', icon: 'none', duration: 2000, mask: true,
      success: result => callbacks.push(['success', result.errMsg]),
      complete: result => callbacks.push(['complete', result.errMsg]),
      fail: () => assert.fail('suppressing a UI prompt must not signal business failure')
    })
    assert.equal(context.hooks.get(name).invoke(args), false)
    assert.equal(args.title, 'Inculpation')
    assert.deepEqual(callbacks, [['success', `${name}:ok`], ['complete', `${name}:ok`]])
    const normal = Object.freeze({ ...args, title: 'Mot de passe incorrect' })
    assert.equal(context.hooks.get(name).invoke(normal), undefined)
    assert.equal(callbacks.length, 2)
    assert.equal(context.hooks.get(name).invoke({}), undefined)
  }
  assert.equal(context.blocked.length, 2)
  assert.ok(context.blocked.every(event => !('replacement' in event)))
  context.guard.stop()
  assert.equal(context.hooks.size, 0)
})

test('cancellation settles awaited calls through the installed H5 and App promisify implementations', async () => {
  for (const runtime of ['uni-h5/dist/uni-h5.es.js', 'uni-app-plus/dist/uni.runtime.esm.js']) {
    const runtimeSource = await readFile(new URL(`../node_modules/@dcloudio/${runtime}`, import.meta.url), 'utf8')
    // Returning false alone leaves the actual framework Promise pending.
    const start = runtimeSource.indexOf('const HOOK_SUCCESS =')
    const end = runtimeSource.indexOf('function formatApiArgs', start)
    assert.ok(start >= 0 && end > start)
    const framework = runInNewContext(`${runtimeSource.slice(start, end)}; ({ promisify, scopedInterceptors })`, {
      isArray: Array.isArray,
      isFunction: value => typeof value === 'function',
      isPlainObject: value => Object.prototype.toString.call(value) === '[object Object]',
      isPromise: value => value && typeof value.then === 'function',
      extend: Object.assign,
      API_SUCCESS: 'success', API_FAIL: 'fail', API_COMPLETE: 'complete'
    })
    const displayed = []
    const uni = {
      addInterceptor(name, hook) { framework.scopedInterceptors[name] = { invoke: [hook.invoke] } },
      removeInterceptor(name) { delete framework.scopedInterceptors[name] }
    }
    for (const name of ['showToast', 'showLoading']) {
      uni[name] = framework.promisify(name, args => {
        displayed.push(args.title)
        const result = { errMsg: `${name}:ok` }
        args.success?.(result)
        args.complete?.(result)
      })
    }
    const guard = installUiMessageGuard({ uni })
    for (const name of ['showToast', 'showLoading']) {
      let timer
      try {
        const result = await Promise.race([
          uni[name]({ title: 'Inculpation' }),
          new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('UI Promise stayed pending')), 200) })
        ])
        assert.equal(result.errMsg, `${name}:ok`)
      } finally {
        clearTimeout(timer)
      }
      const callbacks = []
      uni[name]({ title: 'Inculpation', success: () => callbacks.push('success'), complete: () => callbacks.push('complete') })
      assert.deepEqual(callbacks, ['success', 'complete'])
      await uni[name]({ title: 'Succès' })
    }
    assert.deepEqual(displayed, ['Succès', 'Succès'])
    guard.stop()
  }
})

test('native calls skip window creation for the unwanted title and preserve other calls and errors', () => {
  const calls = []
  const result = { close() {} }
  const failure = new Error('native error')
  const native = {
    showWaiting(...args) { assert.equal(this, native); calls.push(args); return result },
    toast() { throw failure }
  }
  const original = native.showWaiting
  const context = setup({ getNativeUI: () => native })
  const style = { loading: { display: 'none' }, modal: false }
  const silentWaiting = native.showWaiting('Inculpation', style)
  assert.equal(calls.length, 0)
  assert.doesNotThrow(() => { silentWaiting.setTitle('Inculpation'); silentWaiting.close() })
  assert.equal(native.toast('Inculpation'), undefined)
  assert.equal(native.showWaiting('Chargement', style), result)
  assert.deepEqual(calls.at(-1), ['Chargement', style])
  native.showWaiting()
  assert.equal(calls.at(-1).length, 0)
  assert.throws(() => native.toast('normal'), error => error === failure)
  context.guard.stop()
  assert.equal(native.showWaiting, original)
})

test('H5 hides the whole rewritten popup and permits a later normal message on the reused node', async () => {
  const dom = new JSDOM('<body><input value="Inculpation"><p id="body-text">Inculpation</p><uni-toast><div class="uni-mask"></div><p class="uni-simple-toast__text">Chargement</p></uni-toast></body>')
  const context = setup({ browserWindow: dom.window })
  const popup = dom.window.document.querySelector('.uni-simple-toast__text')
  const toast = dom.window.document.querySelector('uni-toast')
  popup.firstChild.nodeValue = 'Inculpation'
  await flushDom()
  assert.equal(toast.style.getPropertyValue('display'), 'none')
  assert.equal(toast.style.getPropertyPriority('display'), 'important')
  assert.equal(popup.textContent, 'Inculpation') // No replacement text is inserted.
  assert.equal(dom.window.document.querySelector('input').value, 'Inculpation')
  assert.equal(dom.window.document.querySelector('#body-text').textContent, 'Inculpation')
  toast.style.display = 'block'
  await flushDom()
  assert.equal(toast.style.getPropertyValue('display'), 'none')
  assert.equal(toast.style.getPropertyPriority('display'), 'important')
  popup.textContent = 'Succès'
  await flushDom()
  assert.equal(toast.style.getPropertyValue('display'), '')
  assert.equal(popup.textContent, 'Succès')
  popup.className = 'uni-toast__content'
  const spinner = dom.window.document.createElement('i')
  spinner.className = 'uni-loading'
  toast.append(spinner)
  popup.textContent = 'Inculpation'
  await flushDom()
  assert.equal(toast.style.display, 'none')
  context.guard.stop()
  assert.equal(toast.style.getPropertyValue('display'), '')
  dom.window.close()
})

test('H5 preserves existing styles and subsequent renderer visibility', async () => {
  const dom = new JSDOM('<body><uni-toast style="display:block !important;color:red"><p class="uni-toast__content">Inculpation</p></uni-toast></body>')
  const context = setup({ browserWindow: dom.window })
  const toast = dom.window.document.querySelector('uni-toast')
  const popup = toast.querySelector('p')
  assert.equal(toast.style.display, 'none')
  popup.textContent = 'Chargement'
  await flushDom()
  assert.equal(toast.style.display, 'block')
  assert.equal(toast.style.getPropertyPriority('display'), 'important')
  assert.equal(toast.style.color, 'red')
  popup.textContent = 'Inculpation'
  await flushDom()
  popup.textContent = 'Succès'
  toast.style.removeProperty('display')
  await flushDom()
  assert.equal(toast.style.display, '')
  context.guard.stop()
  dom.window.close()
})

test('logging and callback failures cannot prevent cancellation or the complete callback', () => {
  const native = Object.freeze({ toast: () => 12 })
  const context = setup({ getNativeUI: () => native, onBlock() { throw new Error('logger unavailable') } })
  let completed = false
  const args = { title: 'Inculpation', success() { throw new Error('callback failed') }, complete() { completed = true } }
  assert.equal(context.hooks.get('showToast').invoke(args), false)
  assert.equal(completed, true)
  assert.equal(args.title, 'Inculpation')
  assert.equal(native.toast(), 12)
  context.guard.stop()
})

test('hooks a native bridge that becomes available after startup', () => {
  let native
  const context = setup({ getNativeUI: () => native })
  native = { toast: title => title }
  context.hooks.get('showToast').invoke({ title: 'normal' })
  assert.equal(native.toast('Inculpation'), undefined)
  assert.equal(native.toast('Succès'), 'Succès')
  context.guard.stop()
})

test('diagnostics registered before the guard retain the title of a cancelled prompt', async () => {
  const diagnosticSource = await readFile(new URL('../src/utils/uiDiagnostics.js', import.meta.url), 'utf8')
  const { installUiDiagnostics } = await import(`data:text/javascript;base64,${Buffer.from(diagnosticSource).toString('base64')}`)
  const storage = new Map()
  const hooks = new Map()
  const uni = {
    getStorageSync: key => storage.get(key),
    setStorageSync: (key, value) => storage.set(key, value),
    getLocale: () => 'fr',
    addInterceptor(name, hook) { hooks.set(name, [...(hooks.get(name) || []), hook]) },
    removeInterceptor(name, hook) { hooks.set(name, hooks.get(name).filter(item => item !== hook)) }
  }
  const diagnostics = installUiDiagnostics({ uni, getPages: () => [], logger() {} })
  const guard = installUiMessageGuard({ uni })
  const args = { title: 'Inculpation' }
  for (const hook of hooks.get('showToast')) {
    if (hook.invoke(args) === false) break
  }
  assert.equal(args.title, 'Inculpation')
  assert.equal(JSON.parse(diagnostics.dump()).find(item => item.api === 'showToast').title, 'Inculpation')
  guard.stop()
  diagnostics.stop()
})
