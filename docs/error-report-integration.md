# Inculpation 弹窗异常上报

只在 `src/main.js` 安装的 `uiMessageGuard.onBlock` 拦截到整条 Inculpation 提示时创建事件。H5 和 App 共用此入口，包括 uni.showToast/showLoading、plus.nativeUI.toast/showWaiting，以及 H5 最终 DOM 被改成该词的情况。提示继续直接屏蔽，不替换为其他文案。

不读取 reportable 字段。普通接口报错、超时、校验失败、成功提示，以及响应中只有这个词但未尝试弹窗的情况，都不创建上报事件。系统或其他应用绘制、未经过项目拦截入口的浮层无法被此代码观察。

## 代码入口与临时停用

- `src/main.js`：onBlock 调用 reportInculpation，生产环境也启用。
- `src/common/api/uiErrorReporting.js`：共享实例、拦截时身份快照及接口元数据关联。
- `src/common/api/errorReport.js`：独立传输和有上限的本地重试队列。
- `src/common/api/config.js`：统一接口基址，沿用 VITE_API_URL。
- `src/common/api/request.js`：只在内存登记接口元数据、恢复已有 Inculpation 事件重试；接口响应不再创建事件。

临时关闭上报时，在 uiErrorReporting.js 中取消 `// errorReporter.stop()` 的注释。恢复时重新注释这一行。关闭上报仍保留弹窗拦截，页面正常提示和业务请求不变。原 request.js 中的临时停用注释已随实例移动到新文件。

## 请求协议

直接使用独立 uni.request POST `/app/error-report/batch`，超时 5 秒。请求头 Content-Type 为 application/json，Authorization 沿用当前登录凭证。请求体为 `{ subjectUserId, events: [event] }`。

事件字段为 eventId、errorType、errorKey、releaseVersion、message、requestPath、requestMethod、httpStatus、traceId、occurredAt：

- eventId 是 UUID v4，同一事件重试时保持不变。
- errorType 固定为 SYSTEM，errorKey 固定为 INCULPATION_POPUP，message 固定为 Inculpation。
- releaseVersion 优先取 VITE_H5_RELEASE_VERSION，否则取运行时 appVersion，再回退到根 package.json 的 version。
- subjectUserId 取拦截时 userInfo.userId，凭证同步固定；不存在登录会员 ID 或有效凭证时不上报，不编造会员身份。
- 只有能关联到同一页面、同一账号的当前响应或同一调用栈中紧接着发出的唯一请求，才附带接口元数据。并发来源不明确、过期响应或纯前端提示不借用其他接口的数据。
- requestPath 只包含 /app/xxx 路径，移除查询串、锚点、域名和 URL 用户信息。
- httpStatus 使用实际响应状态码；traceId 优先取响应体 traceId，否则读取不区分大小写的 x-trace-id 响应头。当前请求尚未返回或无法关联实际接口时，对应未知字段不发送，不伪造 500、接口路径或链路号；接收端需允许这些关联字段缺省。
- 不再发送 businessCode。不上传请求参数、请求体、密码、完整响应或 Authorization。凭证仅位于 HTTP 请求头，本地队列不保存 Token。

## 重试与隔离

独立上报通道不经过业务请求封装，不弹提示、不关闭业务 Loading、不刷新 Token，也不会将自己的失败再上报。只有 HTTP 成功、业务 code 为 200，且 data.acceptedEventIds 包含当前 eventId，才确认并删除事件。

首次加两次重试最多 3 次，间隔 2 秒和 10 秒。只重试上报请求，不重新提交登录、绑卡、提现等业务操作。发出前保存尝试次数；页面刷新后沿用原事件 ID、时间和已消耗次数。

新队列键为 `__inculpation_reports_v1__:<baseURL>`，与上一版 `__app_error_reports_v1__` 隔离，旧的普通接口错误事件不再恢复发送。恢复的新队列也只接受 INCULPATION_POPUP 且 message 为该词的记录。最多保存 50 条、24 小时，过期或达到次数上限后移除。

账号切换后只发送当前会员的事件，其他会员的记录等待原账号恢复或过期。首次使用拦截时的凭证，后续重试使用同一会员的当前凭证。存储/传输失败不影响页面提示或业务操作。

## 验证

运行 `node --test tests/errorReport.test.mjs tests/uiErrorReporting.test.mjs tests/uiDiagnostics.test.mjs tests/uiMessageGuard.test.mjs`。

测试使用模拟接口，不向线上写入事件。覆盖生产 main.js 的真实入口连接、App 原生拦截、H5 DOM 改写去重、普通错误不触发、真实路径/状态码/链路号关联、未知来源不伪造元数据、身份隔离、旧队列停用、确认 ID、有限重试和既有提示行为。

本次 38 项测试全部通过，H5/App 正式构建通过。检查两端产物均包含 Inculpation 专用上报模块。验证产物位于系统临时目录 `newcode-inculpation-report-20261029/h5` 与 `newcode-inculpation-report-20261029/app`，未部署或覆盖原发布包。
