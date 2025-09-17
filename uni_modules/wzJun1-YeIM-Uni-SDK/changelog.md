## 1.2.82（2025-03-12）
- 【YeIM-Uni-SDK】 
    - 修复调用获取历史消息记录时的离线消息异常
	- 修复Web、Uni环境下上传下载异常
## 1.2.5（2023-05-09）
- 【YeIM-Uni-SDK】 
    - 修复 `updateUserInfo` 无法正常更新的问题 
    - 修复 用户资料 `好友添加方式` 异常
    - 修复 好友申请已读状态异常

- 【YeIM-Uni-Server】 
    - 优化 用户申请已读发送更新事件
## 1.2.4（2023-05-02）
- 【YeIM-Uni-SDK】 
    - 修复因 `1.2.0` 引出的本地上传异常 
    - 修复在 `nvue` 页面下无法使用实例的异常
## 1.2.3（2023-04-10）
- 【YeIM-Uni-SDK】 
    - 优化 `createCustomMessage`
    - 优化 获取好友及申请列表方式
    
- 【YeIM-Uni-Server】 
    - 修复因配置文件异常导致的无法启动
## 1.2.2（2023-04-05）
- 【YeIM-Uni-SDK】 
    - 新增 好友关系及相关方法
    - 新增 用户资料字段 `性别` `电话` `扩展字段` 等
    - 优化 方法 `getUserInfo` `updateUserInfo`

- 【YeIM-Uni-Server】 
    - 新增 好友关系相关接口
    - 修改 接口 `register` `updateUser`
    
- 【数据库】 
    - 新增 `user`表字段 `性别` `电话` `扩展字段` 等
    - 新增 好友表 `friend`
    - 新增 好友申请表 `friend_apply`
## 1.2.1（2023-03-26）
- 【YeIM-Uni-SDK】
    - 优化代码
## 1.2.0（2023-03-24）
- 【YeIM-Uni-SDK】
    - 适配 支持非uni编译器打包，可单独用在任何H5环境，支持ts types
    - 新增 创建@消息接口 `createTextAtMessage` 创建合并消息接口 `createMergerMessage` 创建转发消息接口 `createForwardMessage`
    - 新增 媒体消息通过URL直发接口 `createImageMessageFromUrl` `createVideoMessageFromUrl` `createAudioMessageFromUrl`
    - 修改 使用`mitt`代替uni事件总线
    - 修复 群组获取历史消息记录异常

- 【YeIM-Uni-Server】
    - 修复 群成员移除后再加入会话报错
    - 修复 设置群管理员重复
    - 优化 移出群成员给指定接收者发送系统通知
    - 优化 群成员获取历史消息记录方式
## 1.1.9（2023-03-21）
- 【YeIM-Uni-SDK】
    - 修复 因`1.1.8`版本引出的用户多端登录被踢反复重连的问题
    - 优化 客户端代码

- 【YeIM-Uni-Server】
    - 优化 Socket消息通道
## 1.1.8（2023-03-17）
- 【YeIM-Uni-SDK】
    - 新增 离线通知相关自定义配置
    - 修复 `getGroupApplyList`接口获取入群申请异常的问题
    - 修复 撤回消息事件异常响应
    - 优化 客户端接口返回值 
    - 优化 客户端接口通信

- 【YeIM-Uni-Server】
    - 优化 服务端接口返回值 
## 1.1.7（2023-03-10）
- 【YeIM-Uni-SDK】
    - 新增 `getHistoryMessageList` 获取历史消息记录方法
    - 弃用 `getMessageList` 

- 【YeIM-Uni-Server】
    - 新增 通过 `nextMessageId` 获取历史记录
    - 弃用 分页获取历史记录
## 1.1.6（2023-02-19）
- 【YeIM-Uni-SDK】
    - 新增 `加入黑名单` `移除黑名单` `获取黑名单列表` 方法
    - 修复 低版本安卓创建推送渠道的异常 
    - 修复 本地消息缓存逻辑

- 【YeIM-Uni-Server】
    - 新增 `加入黑名单` `移除黑名单` `获取黑名单列表` 接口

- 【数据库】 
    - 新增私聊黑名单表
## 1.1.5（2023-01-31）
- 【YeIM-Uni-SDK】
    - 修复 使用 `Vue3` 编译时的上传异常
    - 文档新增 `Vue3 + TypeScript` 使用示例
## 1.1.4（2023-01-27）
- 【YeIM-Uni-SDK】
    - 新增 删除消息 `deleteMessage` 接口  
    - 新增 Message消息字段 `conversationType` 会话类型 
    - 修复 因推送服务引发的非APP端登录异常
    - 优化 小视频消息封面字段 `thumbnailUrl` 创建时为空
    - 优化 媒体消息接口本地上传目录名称

- 【YeIM-Uni-Server】
    - 移除 `receivedCallMessage` 方法 (v1.1.2遗留)

- 【数据库】 
    - 新增群消息删除记录表
## 1.1.3（2023-01-16）
- 【YeIM-Uni-SDK】
    - 新增 `个推离线消息通知` 

- 【YeIM-Uni-Server】
    - 新增 `个推离线消息通知` 服务

- 【数据库】 
    - 新增 `user` 表字段 `mobile_device_id` (移动APP端推送标识符)
## 1.1.2（2022-12-16）
- 【YeIM-Uni-SDK】
    - 弃用 `notifySocketMessageReceived`
    - 弃用 Message 对象 `receive` 字段

- 【YeIM-Uni-Server】
    - 修复 私聊/群聊会话发送者会话未读数异常
    - 修复 上传图片缩略图路径异常
    - 弃用 `received_call` 
    - 弃用 Message 对象 `receive` 字段

- 【数据库】 
    - 弃用 数据表 message、group_message 中 `receive` 字段

## 1.1.1（2022-12-15）
- 【YeIM-Uni-SDK】
    - 更新 WebSocket使用方式为SocketTask，便于支持项目多路WebSocket 
    - 预弃用 `notifySocketMessageReceived`，下版本删除。基于YeIMUniSDK的收发消息逻辑考虑，接收方不需要返回接收状态（ACK）
    - 优化 重连机制
    - 优化 代码注释
    
- 【YeIM-Uni-Server】
    - 预弃用 `received_call`，下版本删除。基于YeIMUniSDK的收发消息逻辑考虑，接收方不需要返回接收状态（ACK）

## 1.1.0（2022-12-14）
- 新增 【重要】群组聊天方式
- 新增 `getConversation` 获取会话详情
- 修复 部分接口返回异常
## 1.0.9（2022-12-07）
- 【YeIM-Uni-SDK】
    - 修复 `getConversationList` 获取会话列表异常
    - 更新 开发文档
## 1.0.8（2022-12-06）
- 【YeIM-Uni-SDK】
    - 更新 媒体文件保存路径  
 
- 【YeIM-Uni-Server】
    - 更新 本地仓库文件保存路径 
    - 修复 多媒体处理第三方库 `javacv` 依赖过大问题

- 【数据库】
    - 无更新 
## 1.0.7（2022-12-05）
- 新增 存储仓库 `本地存储`
- 修复 重复上线互踢连接异常
## 1.0.6（2022-12-04）
- 新增 存储仓库 `阿里云对象存储`
- 更新 `YeIM-Uni-Server`中 `SpringBoot` 版本 2.7.6 `Spring-WebSocket` 版本 5.3.24
- 修复已知BUG
## 1.0.5（2022-12-03）
- 新增 `disConnect` 断开连接接口
- 新增 `deleteConversation` 删除指定会话及会话内聊天记录
- 新增 `revokeMessage` 撤回消息
- 新增 `clearConversationUnread` 清除指定会话未读数接口，此接口将触发 `PRIVATE_READ_RECEIPT` 事件
- 新增 监听事件 `PRIVATE_READ_RECEIPT` 私聊会话已读回执
- 新增 创建消息接口 `extra` 字段，用于各个消息扩展自定义数据
- 修改 消息ID由前端生成改为服务端生成
- 修改 撤回字段 `is_recall` 为 `is_revoke`
- 更新 后端私聊消息数据模型
## 1.0.4（2022-11-29）
- 新增查询用户信息接口
- 修复语音消息接口异常
- 修复YeIM-Uni-Server消息通知异常
## 1.0.3（2022-11-27）
- 1. 新增发送位置消息
- 2. 新增查询登陆连接状态接口
- 3. 新增外部上传接口
- 4. 修复已知BUG
## 1.0.2（2022-11-26）
1.新增发送图片消息、语音消息、小视频消息
2.修复已知BUG
## 1.0.1（2022-11-21）
1. 更新readme.md
2. 修复监听异常
## 1.0.0（2022-11-20）
首次发布
