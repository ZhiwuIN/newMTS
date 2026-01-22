# 使用示例
```vue
<template>
  <view style="background: #3f51b5;">
    <view style="display: flex;justify-content: center;padding-top: 30rpx;">
      <sh-draw-card
        ref="drawCardRef"
        @onSelect="onSelect"
        :list="list"
        :targetIndex="4"
        :gap="5"
        :row="3"
        :maxOpenCount="1"
        :endTurnAll="true"
        :shuffleAnimate="true"
        :shuffle="true"
        :shuffleTurnAll="false"
        :turnTime="0.3">
      </sh-draw-card>
    </view>
    <view style="margin-top: 60px;">
      <button @click="$refs.drawCardRef.start">开始</button>
      <button @click="$refs.drawCardRef.reset">重置</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [
        { frontImg: 'https://i.111666.best/image/jyiLXmd6mpvgVn0M312RUr.png', backImg: 'https://i.111666.best/image/ykvhaS8Rq9Y9XnkD5H7jY7.png'},
        { frontImg: 'https://i.111666.best/image/hXf4hYPLKLtWTRrpw1NkeA.png', backImg: 'https://i.111666.best/image/PFfH7HAm1tv5w66S3dBcEb.png'},
        { frontImg: 'https://i.111666.best/image/Zwfppo4rey1DDowiSxD70e.png', backImg: 'https://i.111666.best/image/LEhbPFbpUaXd2EQHQvI1U4.png'},
        { frontImg: 'https://i.111666.best/image/UulsBCHyxCoDBIkwZH0tkO.png', backImg: 'https://i.111666.best/image/OgbI4s58eaCncOrrVdHxoG.png'},
        { frontImg: 'https://i.111666.best/image/jzGc0ueAbaEmFOxpJjYQl7.png', backImg: 'https://i.111666.best/image/WSHAohnopfaSNyahiyxncu.png'},
        { frontImg: 'https://i.111666.best/image/5OsWLzXtPN2wZ5I7K25ThI.png', backImg: 'https://i.111666.best/image/kfxD20gtXrzLzfiFW7xmpo.png'},
        { frontImg: 'https://i.111666.best/image/g1MNNjwcCo3JQR5UznRYCB.png', backImg: 'https://i.111666.best/image/S05XyUqzScBMNRef4qnSO1.png'},
        { frontImg: 'https://i.111666.best/image/M5tMH8acLhPhJ4FS7luKzR.png', backImg: 'https://i.111666.best/image/ovzGUTZNbZB3tXdE0RixCg.png'},
        { frontImg: 'https://i.111666.best/image/n4hn7DjlwQ0lxL4aUuN69y.png', backImg: 'https://i.111666.best/image/af2jEuv6vLaaT1KA79uQxD.png'},
      ]
    }
  },
  methods: {
    onSelect(e) {
      console.log('list中对应的数据 -->', e.data)
      console.log('点击的索引 -->', e.index)
    }
  }
}
</script>
```



[插件预览地址](https://www.bilibili.com/video/BV1jJzXYEEjS/?share_source=copy_web&vd_source=f24f5856c3cbc24dd6d33e4985ce8811)

 # 属性 Porps
| 属性      | 类型             | 默认值   | 说明                     |
| --------- | ---------------- | -------- | ------------------------ |
| list    | Array | [] | 奖品列表 建议数量为(col * row), 因为用户点击的时候会返回选中的奖品,可以使用 [ { frontImg, backImg } ] 定义奖品图片|
| width    | Number | 100 | 单个卡片宽度|
| height    | Number | 112 | 单个卡片高度|
| gap    | Number | 10 | 卡片间距|
| targetIndex    | Number | 0 | 中心卡片索引，洗牌的时候周围卡片会向该卡片聚集|
| col    | Number | 3 | 列数|
| row    | Number | 3 | 行数|
| collectTime    | Number | 0.3 | 洗牌聚合/散开时间 单位秒/s|
| turnTime    | Number | 0.4 | 卡片翻转时间|
| maxOpenCount    | Number | 1 | 最大打开数量，也就是用户可以抽几次奖卡|
| shuffle    | Boolean | true | 是否洗牌，会对list参数传入数据进程洗牌操作|
| endTurnAll    | Boolean | true | 结束的时候是否全部打开卡片|
| shuffleTurnAll    | Boolean | false | 洗牌的时候是否全部打开卡片|
| shuffleAnimate    | Boolean | false | 是否开启洗牌动画|
| onOpenAsync    | () => Promise<void> |  异步获取奖项的函数，必须返回一个Promise|


# 插槽 Slot
| 插槽名 | 说明 |
| ---- | --- |
|  front | 卡片正面，参数为 { data, index } 如果插槽不显示内容请在元素上加入 position: absolute|
|  back | 卡片反面，参数为 { data, index } |
``` vue
<!-- 微信小程序不显示的情况请关注此代码 -->
<sh-draw-card>
  <template #back="{data}">
    <view style="position: absolute; width: 100%; height: 100%; background: red"></view>
  </template>
</sh-draw-card>
```

# 事件 Emit
| 事件名 | 说明 | 回调参数 |
| ---- | --- | --- |
| onTab | 点击卡片触发 | { data, index } |
| onSelect | 开始打开卡片触发 | { data, index } |
| onMax | 超过最大抽卡数量 | { data, index } |

# 方法 Methods
| 方法名 | 说明 |
| ---- | --- |
| start | 开始抽奖，抽奖之前必须调用此函数 |
| reset | 重置抽奖 |
