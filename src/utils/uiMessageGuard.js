const TOAST_TEXT_SELECTOR = '.uni-simple-toast__text, .uni-toast__content'

function attempt(action, fallback) {
  try {
    return action()
  } catch (_) {
    return fallback
  }
}

// 只拦截整条异常提示，其他提示原样显示。
export function isUnexpectedPrompt(value) {
  if (value == null) return false

  try {
    const title = String(value)
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')

    return /^\s*inculpation[.!…]*\s*$/i.test(title)
  } catch {
    // 兼容无法转换成字符串的对象
    return false
  }
}

export function installUiMessageGuard(options) {
  const { uni: api, getNativeUI, platform, onBlock } = options
  if (api.$uiMessageGuard) return api.$uiMessageGuard

  const browser = options.browserWindow ?? (typeof window === 'undefined' ? null : window)
  const doc = browser?.document
  const interceptors = []
  const nativeHooks = []
  const timers = []
  const hiddenPopups = new Map()
  let observer
  let running = true

  function block(value, source) {
    if (!running || !isUnexpectedPrompt(value)) return false
    attempt(() => onBlock?.({ source, originalTitle: value }))
    return true
  }

  function restorePopup(element, display) {
    // Vue 可能已经更新了 v-show；只撤销本模块设置的隐藏样式。
    if (element.style.getPropertyValue('display') === 'none' && element.style.getPropertyPriority('display') === 'important') {
      if (display.value) element.style.setProperty('display', display.value, display.priority)
      else element.style.removeProperty('display')
    }
    hiddenPopups.delete(element)
  }

  function hookNative() {
    if (!running) return
    const nativeUI = attempt(() => getNativeUI?.(), null)
    if (!nativeUI) return
    for (const name of ['toast', 'showWaiting']) {
      if (nativeHooks.some(hook => hook.target === nativeUI && hook.name === name)) continue
      const original = nativeUI[name]
      if (typeof original !== 'function') continue
      function wrapped(...args) {
        if (args.length && block(args[0], `plus.nativeUI.${name}`)) {
          // 不创建原生窗口；保留等待对象常用方法，兼容调用方的关闭逻辑。
          if (name === 'showWaiting') return { close() {}, setTitle() {} }
          return
        }
        return original.apply(this, args)
      }
      attempt(() => {
        nativeUI[name] = wrapped
        if (nativeUI[name] === wrapped) nativeHooks.push({ target: nativeUI, name, original, wrapped })
      })
    }
  }

  for (const name of ['showToast', 'showLoading']) {
    const interceptor = {
      invoke(args = {}) {
        attempt(hookNative)
        if (!block(args.title, `uni.${name}`)) return
        // invoke 返回 false 会取消显示，但 uni 不会自动完成回调或 Promise。
        // 这里只完成提示 API，不改变网络请求或业务提交的结果。
        const result = { errMsg: `${name}:ok` }
        attempt(() => args.success?.(result))
        attempt(() => args.complete?.(result))
        return false
      }
    }
    attempt(() => {
      api.addInterceptor(name, interceptor)
      interceptors.push({ name, interceptor })
    })
  }

  function guardDom() {
    if (!running || !doc?.body) return
    const blockedPopups = new Set()
    doc.querySelectorAll(TOAST_TEXT_SELECTOR).forEach(element => {
      if (!isUnexpectedPrompt(element.textContent)) return
      const popup = element.closest('uni-toast, .uni-sample-toast, .uni-toast') || element
      blockedPopups.add(popup)
      if (!hiddenPopups.has(popup)) {
        hiddenPopups.set(popup, {
          value: popup.style.getPropertyValue('display'),
          priority: popup.style.getPropertyPriority('display')
        })
        block(element.textContent, 'h5.toast-dom')
      }
      // 连同背景、加载图标和透明蒙层一起隐藏，不留下空白提示框。
      if (popup.style.getPropertyValue('display') !== 'none' || popup.style.getPropertyPriority('display') !== 'important') {
        popup.style.setProperty('display', 'none', 'important')
      }
    })
    hiddenPopups.forEach((display, popup) => {
      if (!blockedPopups.has(popup)) restorePopup(popup, display)
    })
  }

  const guard = {
    stop() {
      running = false
      timers.forEach(clearTimeout)
      observer?.disconnect()
      hiddenPopups.forEach((display, popup) => restorePopup(popup, display))
      doc?.removeEventListener('plusready', hookNative)
      interceptors.forEach(({ name, interceptor }) => attempt(() => api.removeInterceptor(name, interceptor)))
      nativeHooks.forEach(({ target, name, original, wrapped }) => {
        if (target[name] === wrapped) attempt(() => { target[name] = original })
      })
      if (api.$uiMessageGuard === guard) delete api.$uiMessageGuard
    }
  }
  api.$uiMessageGuard = guard
  attempt(hookNative)
  if (platform === 'app' || platform === 'app-plus') {
    for (const delay of [250, 1000]) timers.push(setTimeout(() => attempt(hookNative), delay))
    doc?.addEventListener('plusready', hookNative)
  }
  if (doc?.body && browser.MutationObserver) {
    attempt(guardDom)
    observer = new browser.MutationObserver(() => attempt(guardDom))
    observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'class'] })
  }
  return guard
}
