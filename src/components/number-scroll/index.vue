<template>
    <view class="number-box">
        <view class="mask" />
        <block :key="index" v-for="(v, index) in numberList">
            <swiper :circular="!lockedList[index]" :current="currentList[index]" disableTouch :style="{
                color: color,
                width: v === 10 ? dotWidth : width,
                height,
                fontSize
            }" vertical>
                <swiper-item :key="item" v-for="item in items">
                    <view class="gradient-text">{{ item }}</view>
                </swiper-item>
            </swiper>
        </block>
    </view>
</template>

<script>
export default {
    props: {
        /* 滚动数值 */
        value: {
            type: [String, Number],
            default: '00.0'
        },
        /* 字体颜色 */
        color: {
            type: String,
            default: '#000'
        },
        /* 小数点的宽度(一般不用调整，除非 fontSize 特别大) */
        dotWidth: {
            type: String,
            default: '12rpx'
        },
        /* 每个数字的宽度(字间距) */
        width: {
            type: String,
            default: '100rpx'
        },
        /* 数字高度 */
        height: {
            type: String,
            default: '40rpx'
        },
        /* 数字大小 */
        fontSize: {
            type: String,
            default: '120rpx'
        },
        /* 滚动间隔时间(毫秒) */
        scrollInterval: {
            type: Number,
            default: 100
        },
        /* 停止间隔时间(毫秒) */
        stopInterval: {
            type: Number,
            default: 800
        }
    },
    data() {
        return {
            numberList: [],
            currentList: [], // 存储每个swiper的当前值
            lockedList: [], // 标记每一位是否已锁定（停止滚动）
            items: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            scrollTimer: null, // 滚动定时器
            stopTimer: null, // 整体停止流程定时器
            singleStopTimers: [] // 存储单个数字的停止定时器，用于清理
        }
    },
    watch: {
        value(val, oldVal) {
            // 清除所有定时器
            this.clearAllTimers();

            const newNumStr = val.toString();
            const oldNumStr = oldVal?.toString() || '';
            const newLen = newNumStr.length;
            const oldLen = oldNumStr.length;

            // 调整数组长度
            if (newLen > oldLen) {
                const addCount = newLen - oldLen;
                this.numberList = [...this.numberList, ...new Array(addCount).fill(0)];
                this.currentList = [...this.currentList, ...new Array(addCount).fill(0)];
                this.lockedList = [...this.lockedList, ...new Array(addCount).fill(false)];
            } else if (newLen < oldLen) {
                this.numberList = this.numberList.slice(0, newLen);
                this.currentList = this.currentList.slice(0, newLen);
                this.lockedList = this.lockedList.slice(0, newLen);
            }

            // 更新目标数值列表
            this.change();
            // 重新开始滚动
            this.startScroll();
        }
    },
    created() {
        const numStr = this.value.toString();
        this.numberList = new Array(numStr.length).fill(0);
        this.currentList = new Array(numStr.length).fill(0);
        this.lockedList = new Array(numStr.length).fill(false); // 初始都未锁定

        this.change();
        this.startScroll();
    },
    beforeDestroy() {
        this.clearAllTimers();
    },
    methods: {
        // 清除所有定时器
        clearAllTimers() {
            // 清除全局滚动定时器
            if (this.scrollTimer) {
                clearInterval(this.scrollTimer);
                this.scrollTimer = null;
            }
            // 清除整体停止定时器
            if (this.stopTimer) {
                clearTimeout(this.stopTimer);
                this.stopTimer = null;
            }
            // 清除单个数字停止定时器
            this.singleStopTimers.forEach(timer => {
                if (timer) clearTimeout(timer);
            });
            this.singleStopTimers = [];
            // 重置锁定状态
            this.lockedList = this.lockedList.map(() => false);
        },

        // 开始滚动
        startScroll() {
            this.clearAllTimers();

            // 启动持续向上滚动定时器
            this.scrollTimer = setInterval(() => {
                this.currentList = this.currentList.map((val, index) => {
                    // 已锁定/小数点位置不滚动
                    if (this.lockedList[index] || this.numberList[index] === 10) {
                        return this.numberList[index] === 10 ? 10 : val;
                    }

                    // 只向上滚动，0->1->2->...->9->0循环
                    let newVal = val + 1;
                    if (newVal >= this.items.length) {
                        newVal = 0;
                    }
                    return newVal;
                });
            }, this.scrollInterval);

            // 延迟1秒后开始停止流程（先滚动一会儿再开始停止）
            this.stopTimer = setTimeout(() => {
                this.startStopProcess(this.numberList.length - 1); // 从最后一位（个位）开始
            }, 1000);
        },

        // 递归停止流程：从指定索引开始，停止后向前一位
        startStopProcess(currentIndex) {
            // 所有位都停止了，清除主滚动定时器
            if (currentIndex < 0) {
                clearInterval(this.scrollTimer);
                this.scrollTimer = null;
                this.$emit('changeIsBounce', false);
                return;
            }

            const numStr = this.value.toString();
            const targetChar = numStr[currentIndex];
            const targetVal = targetChar === '.' ? 10 : Number(targetChar);

            // 停止当前位的滚动，定位到目标值
            this.stopSingleDigit(currentIndex, targetVal, () => {
                // 当前位停止后，延迟stopInterval再处理前一位
                setTimeout(() => {
                    this.startStopProcess(currentIndex - 1);
                }, this.stopInterval);
            });
        },

        // 停止单个数字的滚动，精准定位到目标值（带回调）
        stopSingleDigit(index, targetVal, callback) {
            // 先标记为锁定，防止全局滚动定时器继续修改
            this.$set(this.lockedList, index, true);

            // 小数点直接定位
            if (targetVal === 10) {
                this.$set(this.currentList, index, 10);
                callback && callback();
                return;
            }

            // 获取当前值
            let currentVal = this.currentList[index];

            // 计算需要滚动的步数，确保向上滚动到目标值（避免循环导致的向下视觉）
            const rollToTarget = () => {
                // 到达目标值，执行回调
                if (currentVal === targetVal) {
                    callback && callback();
                    return;
                }

                // 向上滚动一步
                currentVal += 1;
                if (currentVal >= this.items.length) {
                    currentVal = 0;
                }

                // 更新当前值（使用$set确保响应式）
                this.$set(this.currentList, index, currentVal);

                // 存储定时器以便清理
                const timer = setTimeout(rollToTarget, this.scrollInterval);
                this.singleStopTimers.push(timer);
            };

            // 立即执行第一步滚动
            rollToTarget();
        },

        // 更新numberList：记录每一位是数字还是小数点（10代表小数点）
        change() {
            const numStr = this.value.toString();
            const arr = [];
            for (let i = 0; i < numStr.length; i++) {
                arr.push(numStr[i] === '.' ? 10 : Number(numStr[i]));
            }
            this.numberList = arr;
        }
    }
}
</script>

<style lang="scss" scoped>
.gradient-text {
    display: inline-block;
    // background: linear-gradient(90deg, $gradualColor1 0%, $gradualColor2 100%);
    background: $themeColor;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
    color: transparent;
    -webkit-text-stroke: 4rpx #fff;
    text-stroke: 4rpx #fff;
    transform: translateX(10rpx);
}

.number-box {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    position: relative;
    height: 180rpx;

    .mask {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background-color: transparent;
        z-index: 2;
    }

    // 隐藏swiper的滚动指示器和多余样式
    ::v-deep .uni-swiper {
        overflow: hidden;
        transition-timing-function: linear; // 线性过渡，避免加速减速导致的抖动
    }

    ::v-deep .uni-swiper-item {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    ::v-deep uni-swiper {
        height: 132rpx !important;
    }
}
</style>