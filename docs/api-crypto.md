# 接口加解密接入

本项目使用 uni-app，请求入口为 `src/common/api/request.js`。两份参考文档中的 Axios/TypeScript 路径并不属于本项目，已将协议适配到现有入口。

## 协议与接入范围

- `POST`、`PUT`、`PATCH`、`DELETE` 的 JSON 请求默认加密。请求体为 AES/ECB/PKCS7 密文的 Base64 字符串，`Content-Type: text/plain`。
- 按详细密钥文档生成请求 AES 密钥：24 个随机字节 → Base64 的 32 个 ASCII 字符 → UTF-8 的 32 字节 AES-256 密钥。
- AES 密钥字节再次 Base64 编码，再以请求公钥执行 RSAES-PKCS1-v1_5 加密，写入 `encrypt-key` 请求头。
- 所有响应按大小写不敏感的 `encrypt-key` 响应头判断是否解密。支持 AES-128/192/256，解密、填充校验和 JSON 解析后才进入原有业务状态码处理。
- 无加密头的普通 JSON 响应保持兼容；存在加密头但密钥/密文无效时明确拒绝，不将未解密数据交给业务页面。
- token 刷新和重试同样接入加解密。刷新失败会拒绝所有排队请求，避免 Promise 一直等待。
- 图片上传使用 `src/common/api/upload.js`：文件保留 multipart 格式，响应自动解密。H5 使用 Fetch，App 使用能够读取响应头的 `plus.uploader`，避免原 `uni.uploadFile` 入口丢失解密所需的头。
- 浏览器使用 `crypto.getRandomValues`；无 Web Crypto 的 Android App 使用 `java.security.SecureRandom`；iOS App 使用系统 NSUUID v4 的随机字节并剔除版本/变体固定字节。RSA 填充同样使用这些随机源，不回退到 `Math.random()`。

## GET 请求当前行为

参考文档明确不支持 GET 请求体加密，但需求补充要求 GET 查询参数也加密。现有资料只定义了 `encrypt-key` 密钥头，未定义以下信息：

1. URL 中承载业务密文的参数名称，或其他承载位置。
2. AES 加密前是 JSON 对象还是 URL 编码查询串。
3. 空参数 GET、重复参数/数组参数如何处理。

按当前需求，**GET 的 URL 查询参数与 `data` 参数保持原格式发送，不再拦截带参数 GET**。GET 查询参数暂不加密，响应仍根据 `encrypt-key` 自动解密；无参数 GET 也保持此响应处理逻辑。

GET 查询参数加密待后端补充以上约定后再接入。届时在 `crypto.js` 的 `prepareRequest` 中接入 GET 编码即可；业务接口不需要逐一修改。

## 密钥配置

复制 `.env.crypto.example` 的变量到 `.env.local`：

```dotenv
VITE_REQUEST_PUBLIC_KEY=与后端请求解密私钥对应的公钥
VITE_RESPONSE_PRIVATE_KEY=与后端响应加密公钥对应的私钥
```

这两个配置属于不同方向的密钥对。支持 Base64 DER SPKI/PKCS#8 和 PEM（含字面量 `\n`）。本地已配置参考文档提供的值；`.env.local` 已忽略提交。重启开发服务或重新构建后生效。

Cloudflare Pages/GitHub Actions 等构建环境也需要设置上述变量，不能依赖未提交的本地 `.env.local`。`VITE_` 配置会进入浏览器/App 产物，响应私钥不是仅服务端可见的秘密。

仓库的 GitHub Actions 已接入协议检查，并从同名 repository secrets 读取密钥；未配置时会中止构建，避免发布无法加解密的页面。若使用 Cloudflare 自带 Git 构建，请在 Pages 项目的构建环境变量中配置这两个值。

H5 跨域要求后端允许请求头 `encrypt-key`，并返回：

```http
Access-Control-Expose-Headers: encrypt-key
```

本协议按参考实现使用 ECB、PKCS7、RSA PKCS#1 v1.5，没有添加 IV、MAC 或其他与后端不兼容的字段。

## 调用与验证

原有 `request({ url, method, data })` 调用自动接入。只在后端明确要求明文的特殊接口使用 `encryptRequest: false`，该选项会禁用请求加密，响应解密仍保留。

```js
request({ url: '/app/user/login', method: 'post', data: { /* 业务参数 */ } })
```

运行：

```sh
node scripts/check-api-crypto.cjs
npm run build:h5
npm run build:app
```

测试使用独立的 Node RSA/AES 实现核对协议，覆盖三种 AES 响应长度、原生随机源模拟、并发 401 刷新/失败、文件上传响应和异常密钥/密文；不会调用真实业务接口。Android/iOS 原生桥需真机联调，构建通过不代表已完成真机或后端联调。

2026-10-22 接入验证：H5 和 App 完整构建通过；另外通过 Node 与 Chrome 浏览器，只读调用开发环境的 `/app/settings`，成功读取 `encrypt-key` 并解密得到业务码 `200`。Chrome 同时验证了跨域响应头可见性和浏览器随机源。没有调用真实登录/修改资料等写接口，GET 查询参数加密仍待后端协议补充。
