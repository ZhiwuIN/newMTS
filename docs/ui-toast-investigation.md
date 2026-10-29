本次排查针对客户截图中的 `Inculpation`：优先检查运行环境、系统或浏览器浮层，其次检查全局 Toast 和第三方组件。尚未复现原问题，以下区分已确认事实和待验证假设。

最新现象与独立发现

用户最新澄清为“短暂停顿后正常使用，只弹出该词”，不再以“持续卡住、必须刷新或业务提交失败”作为已确认事实。当前更适合把它视为来源未确认的状态提示，加载/处理中提示被二次翻译是待验证候选。此前关于旧发布资源的假设已由用户排除，不再作为当前排查重点。

隔离执行原有 `request.js` 时，已复现另一项缺陷：两个请求均返回 401，且没有 refresh_token 时，刷新失败分支会清空 requestQueue、跳转登录，却没有拒绝原始请求，两个 Promise 保持 pending。异常刷新响应还可能使刷新状态不收尾。该独立问题曾完成七项回归测试的修复，但用户澄清业务不受影响后，已将修复和测试保存到 `docs/request-lifecycle-fix.patch`，从当前源码改动中撤出。不能把它当作此次提示词的根因。

目前法语 `loading.btn` 已配置为 `Chargement`，不是 `Inculpation`。登录、绑卡和提现确认存在 showLoading 调用；当前密码设置页没有 showLoading，因此不能仅凭“短暂停顿”把所有截图统一认定为加载文案。只有原始调用文案和最终显示文字的对应记录才能证实二次改写。最新反馈确认提示会自行消失，绑卡实际成功，短暂停顿后不影响使用。正常完成的操作不宜因未知状态提示而被引导重复提交。

按用户要求直接拦截该词，不显示替代文案

当前版本另外在同一 onBlock 入口接入 Inculpation 专用事件上报，H5/App 均生效；普通接口异常不触发、不读取 reportable 字段，旧的普通接口异常队列不再恢复。具体协议、身份隔离、未知接口字段处理及临时停用方法见 `docs/error-report-integration.md`。下面的 UI_TRACE 诊断记录仍只保存在本机，不作为整批日志上传。

`src/utils/uiMessageGuard.js` 在应用启动时安装，开发和正式构建均生效。只匹配整条提示为 `Inculpation` 的情况（兼容大小写、首尾空白、部分标点和零宽字符），其他提示原样显示。

- `uni.showToast/showLoading`：拦截器返回 false，直接取消该次显示；不传入空标题，也不显示“请重试”等替代文字。
- 被取消的提示仍完成提示 API 的 success/complete 回调，使 await/Promise 正常结束，不改变业务请求结果，不调用 fail。
- 直接调用 `plus.nativeUI.toast/showWaiting` 时同样阻止创建窗口；被拦截的 showWaiting 返回带有 close/setTitle 空操作的对象，兼容调用方收尾。
- H5 中最终 DOM 文字被改成该词时，隐藏整个 uni-app Toast（包括背景、加载图标和透明蒙层），不留下空白框。节点复用为正常提示后恢复显示，并尊重 Vue 的可见性更新。
- 其他提示的文字、选项及调用行为保持原样。已移除此前替换机制专用的两项语言包文案。
- 开发环境的 `[UI_GUARD]` 记录拦截来源；前面的 `[UI_TRACE]` 保留原始标题。

这只能处理经过当前项目提示入口或 H5 Toast DOM 的文字。其他应用拥有的系统浮层、在原生绘制之后发生的系统屏幕翻译，以及未更新的客户安装包不受这套代码控制。本次是定向拦截，不代表根因已找到或原问题已复现。

已确认的运行环境问题与边界

- `index.html` 初始为 `lang="en"`。`App.vue` 获取设置后更新 HTML 的 `lang`；登录页的 `applyLanguage()` 更新应用缓存、uni locale 和 Vue i18n，却没有同步更新 HTML 的 `lang`。因此存在应用语言和 HTML 语言暂时不一致的路径。这是浏览器翻译方向的线索，不能解释或证明 APK 原生提示被改写。
- 桌面 H5 在 `App.vue` 中创建同地址的 iframe，手机布局不走该分支。桌面开发者工具、手机 H5 和 APK 的显示上下文不能直接等同。诊断记录分别标注 `inIframe`、应用语言、HTML 语言和浏览器语言。
- 当前 H5 框架的简单 Toast 没有设置 `font-family`，会继承其所在文档的字体；登录容器中的 Roboto 设置不覆盖独立挂载的 Toast。字体不同本身不足以确认外部浮层。
- 登录和提现页面没有发现 HTML 表单 `required` 或 `setCustomValidity/reportValidity` 校验入口，按钮是 view 点击事件，因此暂未找到浏览器原生表单校验气泡的触发路径。
- 当前 App 运行时中，不传 `position` 的 `uni.showToast` 会进入 `plus.nativeUI.showWaiting`；传入 `top/center/bottom` 时会进入 `plus.nativeUI.toast`。这两条入口也纳入开发诊断。
- 本机 ADB 已找到，但检查时 `adb devices -l` 没有已授权设备。因此本次没有检查到任何手机上的系统语言、WebView 版本、无障碍服务或实际浮层所属应用，也不能认定它们已被排除。

浏览器或系统翻译仍是待验证假设。Chromium 的网页翻译会注入翻译脚本；根节点的 `translated-ltr/translated-rtl` 和部分 Google 翻译元素可以作为辅助信号，但没有这些标记不代表没有其他翻译器。Google Translate 的常规 Tap to Translate 需要复制文字和触发翻译，不能仅凭“点击业务按钮后出现”就归因于它。网页的禁止翻译标记也无法阻止独立的系统屏幕翻译。

另一个应区分的机制是 Android/Chromium 独立的拼写建议窗口。Chromium 的 `SpellCheckPopupWindow` 确实存在于 Chrome/WebView 的输入流程中，和键盘底部的候选条不同；它可属于应用/浏览器自己的窗口，并不一定需要第三方悬浮窗权限。标准实现针对被拼写标记的文本，在点击错词后显示候选和词典相关操作。当前登录手机号是 text 类型，但内容为数字；密码隐藏时是 password，提现 digit 在当前 H5 和 App-vue 运行时中映射为 number。这些现象与常规拼写菜单不完全吻合。定制系统缺陷仍可作为假设，但目前没有证据支持“特定地区低价机词典索引损坏并固定返回该词”的具体归因。

全局 Toast 与第三方组件检查结果

- `utils.js` 的 `$showMessage`、`$showWaitMessage` 实际走 `uni.showToast`。导入的 TDesign Message 没有启用，`Message[theme]` 调用是注释。
- `main.js` 中 IM SDK 的导入、初始化和全局挂载均为注释，未发现登录或提现路径启用它的证据。
- uv-ui-tools 的 toast 包装仍调用 `uni.showToast`，可被 uni 拦截器记录。
- 更新组件可以把安装失败的 `e.message` 显示为 Toast；文件选择组件也会显示 Toast。这些入口存在，但与登录、提现点击没有找到对应调用关系。
- 当前检查的业务源码及 DCloud、TDesign、NutUI 依赖没有找到该词的内置文案。新诊断代码和测试中的该词只是检测条件、测试数据。
- 法语 `loading.btn` 历史上曾为英文 `loading`，在 `78f4129`（2026-09-16）改为 `Chargement`。这提示应核验实际发布的 APK/WGT，不能把最新源码当作所有客户的运行代码。

已加入的开发诊断

`src/main.js` 仅在 `import.meta.env.DEV` 时启动 `src/utils/uiDiagnostics.js`。最近 80 条记录写入本机 `__ui_trace__`，同时打印 `[UI_TRACE]`。

记录来源：

- `environment`：应用语言、缓存语言、系统版本、机型、编译/运行时版本、浏览器语言、HTML 语言、iframe/独立运行状态。选取明确字段，不记录设备 ID。
- `uni`：showToast/showLoading/hideToast/hideLoading 的原始文案及调用栈。
- `native`：plus.nativeUI.toast/showWaiting/closeToast/closeWaiting 的调用及原生钩子是否安装成功。
- `dom`：H5 可见提示的最终文字、计算字体、字号和文档语言；也捕捉 DOM 中单独出现的可疑词。
- `browser`：HTML 语言和部分翻译器 DOM 标记的变化。

在调试器 Console 中查看或重置：

```javascript
console.log(uni.$uiDiagnostics.dump())
uni.$uiDiagnostics.clear()
// 如需停用当前上下文的诊断：
uni.$uiDiagnostics.stop()
```

这些记录不自动联网。App 服务层没有页面 DOM 时，不会生成 H5 的 DOM 字体记录；其他应用拥有的系统浮层也无法由本应用的 JS 直接观察。缺少记录不能单独证明“来自系统”，还要确认版本、钩子状态和观察的上下文。

原生浮层只读检查

连接自己的测试手机并打开 USB 调试后，在项目目录运行：

```powershell
powershell -NoProfile -File .\scripts\capture-android-ui.ps1
```

脚本读取系统语言、WebView 提供程序、SpellChecker 启用状态/提供者/子类型及 textservices 状态、默认输入法、已启用无障碍服务、悬浮窗授权名单、窗口元数据和当前 Toast 队列中的记录，写入系统临时目录。多个设备时使用 `-Serial`，其他 ADB 路径可使用 `-AdbPath`。它不更改手机设置。

实际归因时查看窗口类型和所属包：`2038` 是应用悬浮层，`2032` 是无障碍浮层，`2005` 是 Toast 窗口类型。授权名单只说明某应用有能力显示浮层，不证明它正在显示该提示。瞬时提示消失后，窗口或 Toast 队列可能已没有对应记录。

验证记录

- 诊断模块四项自动检查通过：记录不改写调用参数、重复安装不重复注册/记录有上限、原生方法保持 this/返回值/异常行为、日志失败不影响调用、DOM 最终文字和字体变化可独立于原始 title 被记录。
- 定向拦截的九项检查通过，与诊断模块合计 13 项：整条文案匹配、取消显示且不插入替代文字、回调收尾、原生窗口不创建、H5 整个提示及蒙层隐藏、正常提示复用恢复、原有样式和 Vue 可见性保持、异常及晚初始化兼容、诊断保留被拦截的标题。Promise 检查直接执行本机已安装的 H5/App 运行时 interceptor queue 和 promisify 实现，验证被取消的提示不会令 await 挂起。六种语言包 JSON 均解析通过。
- 本次直接拦截版本的 H5 与 App 正式构建均通过（Node 21.7.0，4 GB 堆上限）。输出分别在系统临时目录 `newcode-inculpation-block-20261029/h5` 与 `newcode-inculpation-block-20261029/app`，没有覆盖原有 dist 或发布 APK。两端输出包含拦截规则，不包含 getReplacement、UI_TRACE、__ui_trace__ 或 UI_GUARD。尚未部署 H5 或生成并安装新版 APK。
- 本地浏览器法语登录页的空账号校验实际使用 `.uni-simple-toast__text`，计算字号 13px、字体 `Noto Sans SC`，属于当前测试环境的无衬线字体。未出现 `Inculpation`，这个结果不代表已复现或排除了客户设备问题。

参考来源：

- [Chromium 翻译实现说明](https://www.chromium.org/developers/design-documents/translate/)
- [Google Translate 的 Tap to Translate 操作条件](https://support.google.com/translate/answer/6350658)
- [Android 窗口类型](https://developer.android.com/reference/android/view/WindowManager.LayoutParams)
- [DCloud 提示 API](https://uniapp.dcloud.net.cn/api/ui/prompt.html)
- [Chromium 的 SpellCheckPopupWindow](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/content/public/android/java/src/org/chromium/content/browser/input/SpellCheckPopupWindow.java)
- [Chrome/WebView 拼写菜单的引入和触发说明](https://chromium.googlesource.com/chromium/src/+/e4a6ec83ec32b4f139794f39bf2cbb0b25617b56)
