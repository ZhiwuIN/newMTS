const STORAGE_KEY = '__ui_trace__'
const LIMIT = 80
const POPUP_SELECTOR = '.uni-simple-toast__text, .uni-toast__content, .t-toast, .t-message, .uni-popup-message, [role="alert"], [role="status"]'

function attempt(action, fallback) {
  try {
    return action()
  } catch (_) {
    return fallback
  }
}

function text(value, limit = 500) {
  return value == null ? '' : String(value).slice(0, limit)
}

// 仅由 main.js 在开发环境启动；记录保存在本机，不修改提示参数。
export function installUiDiagnostics(options) {
  const { uni: api, getPages, platform, getNativeUI } = options
  if (api.$uiDiagnostics) return api.$uiDiagnostics

  const browser = options.browserWindow ?? (typeof window === 'undefined' ? null : window)
  const doc = browser?.document
  const logger = options.logger || (message => console.log('[UI_TRACE]', message))
  const saved = attempt(() => api.getStorageSync(STORAGE_KEY), [])
  let records = Array.isArray(saved) ? saved.slice(-LIMIT) : []
  let running = true
  let scanTimer
  let observer
  let translationKey
  let nativeHookKey
  const timers = []
  const interceptors = []
  const nativeHooks = []
  let seenElements = new WeakMap()

  function record(source, name, details = {}) {
    if (!running) return
    const pages = attempt(() => getPages(), []) || []
    const item = {
      time: new Date().toISOString(),
      source,
      api: name,
      page: pages[pages.length - 1]?.route || '',
      locale: attempt(() => api.getLocale(), ''),
      ...details
    }
    // H5 桌面外层和 iframe 共用存储，写入前合并另一上下文的新记录。
    const latest = attempt(() => api.getStorageSync(STORAGE_KEY), records)
    records = [...(Array.isArray(latest) ? latest : records).slice(-(LIMIT - 1)), item]
    attempt(() => api.setStorageSync(STORAGE_KEY, records))
    attempt(() => logger(JSON.stringify(item)))
  }

  function environment() {
    const info = attempt(() => api.getSystemInfoSync(), {}) || {}
    const system = {}
    for (const key of ['platform', 'system', 'brand', 'model', 'language', 'osName', 'osVersion', 'appVersion', 'appWgtVersion', 'uniCompileVersion', 'uniRuntimeVersion']) {
      if (info[key] !== undefined) system[key] = info[key]
    }
    return {
      platform,
      system,
      storedLanguage: attempt(() => api.getStorageSync('Language'), ''),
      defaultLanguage: attempt(() => api.getStorageSync('defaultLanguage'), ''),
      browserLanguage: browser?.navigator.language || '',
      userAgent: text(browser?.navigator.userAgent),
      htmlLanguage: doc?.documentElement.lang || '',
      nativeBridgeAvailable: Boolean(attempt(() => getNativeUI?.(), null)),
      inIframe: browser ? attempt(() => browser.self !== browser.top, true) : false,
      standalone: Boolean(browser && (browser.navigator.standalone || attempt(() => browser.matchMedia('(display-mode: standalone)').matches, false)))
    }
  }

  function hookNative() {
    if (!running) return
    const nativeUI = attempt(() => getNativeUI?.(), null)
    if (!nativeUI) return
    for (const name of ['toast', 'showWaiting', 'closeToast', 'closeWaiting']) {
      if (nativeHooks.some(hook => hook.target === nativeUI && hook.name === name)) continue
      const original = nativeUI[name]
      if (typeof original !== 'function') continue
      function wrapped(...args) {
        record('native', `plus.nativeUI.${name}`, {
          title: name === 'toast' || name === 'showWaiting' ? text(args[0]) : '',
          stack: text(new Error().stack, 3000)
        })
        return original.apply(this, args)
      }
      attempt(() => {
        nativeUI[name] = wrapped
        if (nativeUI[name] === wrapped) nativeHooks.push({ target: nativeUI, name, original, wrapped })
      })
    }
    const names = nativeHooks.filter(hook => hook.target === nativeUI).map(hook => hook.name)
    const key = names.join(',')
    if (key !== nativeHookKey) {
      nativeHookKey = key
      record('native', 'hook-status', { hooked: names })
    }
  }

  function inspectElement(element, name = 'popup') {
    if (!element || element.nodeType !== 1) return
    const style = browser.getComputedStyle(element)
    if (!element.getClientRects().length || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return
    const content = text(element.textContent?.trim())
    if (!content) return
    const details = {
      title: content,
      tag: element.tagName,
      className: text(element.getAttribute('class'), 200),
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      htmlLanguage: doc.documentElement.lang,
      inIframe: attempt(() => browser.self !== browser.top, true)
    }
    const key = JSON.stringify(details)
    if (seenElements.get(element) === key) return
    seenElements.set(element, key)
    record('dom', name, details)
  }

  function scanDom() {
    if (!doc?.body || !running) return
    const state = {
      htmlLanguage: doc.documentElement.lang,
      translatedClass: /\btranslated-(ltr|rtl)\b/.test(doc.documentElement.className),
      googleTranslateElement: Boolean(doc.querySelector('.goog-te-banner-frame, .goog-te-menu-frame, .skiptranslate'))
    }
    const key = JSON.stringify(state)
    if (key !== translationKey) {
      translationKey = key
      record('browser', 'translation-markers', state)
    }
    doc.querySelectorAll(POPUP_SELECTOR).forEach(element => attempt(() => inspectElement(element)))
  }

  for (const name of ['showToast', 'showLoading', 'hideToast', 'hideLoading']) {
    const interceptor = {
      invoke(args = {}) {
        if (name === 'showToast' || name === 'showLoading') seenElements = new WeakMap()
        // 也捕捉初始化稍晚的原生桥，保留原方法的 this、返回值和异常。
        attempt(hookNative)
        record('uni', name, {
          title: text(args.title),
          icon: text(args.icon),
          position: text(args.position),
          stack: text(new Error().stack, 3000)
        })
      }
    }
    attempt(() => {
      api.addInterceptor(name, interceptor)
      interceptors.push({ name, interceptor })
    })
  }

  const diagnostics = {
    dump: () => JSON.stringify(records, null, 2),
    clear() {
      records = []
      attempt(() => api.removeStorageSync(STORAGE_KEY))
    },
    snapshot() {
      record('environment', 'snapshot', environment())
      attempt(scanDom)
    },
    stop() {
      running = false
      clearTimeout(scanTimer)
      timers.forEach(clearTimeout)
      observer?.disconnect()
      interceptors.forEach(({ name, interceptor }) => attempt(() => api.removeInterceptor(name, interceptor)))
      nativeHooks.forEach(({ target, name, original, wrapped }) => {
        if (target[name] === wrapped) attempt(() => { target[name] = original })
      })
      if (api.$uiDiagnostics === diagnostics) delete api.$uiDiagnostics
    }
  }
  api.$uiDiagnostics = diagnostics
  diagnostics.snapshot()
  attempt(hookNative)
  if (platform === 'app' || platform === 'app-plus') {
    for (const delay of [250, 1000]) timers.push(setTimeout(() => attempt(hookNative), delay))
  }
  if (doc?.body && browser.MutationObserver) {
    observer = new browser.MutationObserver(mutations => {
      for (const mutation of mutations) {
        const element = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement
        // 未知组件仅记录这个特定词的短文本，避免采集页面正文或输入框内容。
        if (/^\s*Inculpation\s*$/i.test(element?.textContent || '')) {
          attempt(() => inspectElement(element, 'suspect-text'))
        }
        for (const node of mutation.addedNodes) {
          if (/^\s*Inculpation\s*$/i.test(node.textContent || '')) {
            attempt(() => inspectElement(node.nodeType === 1 ? node : node.parentElement, 'suspect-text'))
          }
        }
      }
      clearTimeout(scanTimer)
      scanTimer = setTimeout(() => attempt(scanDom), 50)
    })
    observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'style', 'lang', 'translate'] })
    observer.observe(doc.documentElement, { attributes: true, attributeFilter: ['class', 'lang', 'translate'] })
  }
  return diagnostics
}
