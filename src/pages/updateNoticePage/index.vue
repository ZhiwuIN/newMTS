<template>
    <view class="box">
        <view class="Big_bgi" :style="topStyle2"></view>
        <view class="main" :style="topStyle2">
            <!-- 标题 -->
            <view class="title">
                Update List 0826
            </view>
            <!-- 内容 -->
            <view class="content">
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
                ✨ Brand new interface refresh, fully upgraded visual experience This version focuses on the UI
                redesign
                of the App.
                We restructured the visual hierarchy of pages and adjusted colors, fonts and widget styles for a
                cleaner
                and more modern look.
            </view>
            <!-- 进度条 -->
            <view class="progressBar_box">
                <view class="text_box">
                    <view class="text">Updating...</view>
                    <view class="percentage">{{ showPercentage }}%</view>
                </view>
                <view class="progressBar">
                    <view class="progressBar_inner" :style="{ width: `${percentage}%` }"></view>
                </view>
            </view>
        </view>
    </view>
</template>
<script>
export default {
    data() {
        return {
            topStyle2: '',
            percentage: 0,
            timer: null,
            totalTime: 0,
            startTime: 0,
            isPause: false,
            pauseEndTime: 0
        }
    },
    computed: {
        showPercentage() {
            return Math.round(this.percentage)
        }
    },
    methods: {
        mtop() {
            let statusBarHeight = 0
            let navBarHeight = 88
            const sys = uni.getSystemInfoSync()
            // #ifdef APP-PLUS
            statusBarHeight = sys.statusBarHeight
            navBarHeight = sys.platform === 'android' ? 96 : 88
            // #endif
            // #ifdef H5
            statusBarHeight = 0
            navBarHeight = 88
            // #endif
            const mtopValue = statusBarHeight / 2 + navBarHeight
            // #ifdef H5
            this.topStyle2 = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = 'height:calc(100vh);'
            // #endif
        },
        startProgress() {
            // 总时长随机：10 ~15秒
            this.totalTime = Math.floor(Math.random() * 5000) + 10000
            this.startTime = Date.now()
            this.percentage = 0
            this.isPause = false
            this.pauseEndTime = 0

            this.timer = setInterval(() => {
                const now = Date.now()
                const elapsed = now - this.startTime
                const remainTime = this.totalTime - elapsed
                const remainPercent = 100 - this.percentage

                // 时间到，结束
                if (remainTime <= 0 || remainPercent <= 0) {
                    this.percentage = 100
                    clearInterval(this.timer)
                    setTimeout(() => {
                        uni.reLaunch({
                            url: '/pages/LoginPage/login'
                        })
                    }, 300)
                    return
                }

                // 如果处于暂停状态，判断是否暂停时间结束
                if (this.isPause) {
                    if (now >= this.pauseEndTime) {
                        this.isPause = false
                    }
                    return
                }

                // ✅ 兜底：剩余小于2.5秒，不再产生卡顿，直接冲刺
                if (remainTime < 2500) {
                    this.percentage += remainPercent / (remainTime / 80)
                    return
                }

                // ✅ 随机触发卡顿：5%概率进入暂停
                if (Math.random() < 0.05) {
                    const pauseMs = Math.floor(Math.random() * 1200) + 300 // 停顿300~1500ms
                    this.isPause = true
                    this.pauseEndTime = now + pauseMs
                    return
                }

                // ✅ 正常增长：小步为主，偶尔大跳
                let step = Math.random() * 2.2
                // 20%概率大幅跳跃
                if (Math.random() < 0.4) {
                    step = Math.random() * 4.5
                }
                this.percentage += step

                if (this.percentage > 100) this.percentage = 100
            }, 80)
        }
    },
    onLoad() {
        this.mtop()
        this.startProgress()
    },
    onUnload() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    }
}
</script>
<style scoped lang="scss">
* {
    box-sizing: border-box;
}

.box {
    width: 100%;
    height: 100vh;
}

.Big_bgi {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    background: url('/static/updateNotice/bgi_img.png') top left/100% 100%;
    z-index: -1;
}

.main {
    padding: 176rpx 32rpx 66rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    /* 关键：超出main高度的内容截断，交给子元素滚动 */
    .title {
        font-size: 48rpx;
        font-weight: 900;
        font-variation-settings: "opsz" auto;
        font-feature-settings: "kern" on;
        background: linear-gradient(180deg, #ffffff 54%, #9db9ff 84%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 32rpx;
        flex-shrink: 0;
    }

    .content {
        padding: 42rpx 32rpx;
        border-radius: 30rpx;
        background: rgba(18, 34, 49, 0.9);
        color: #fff;
        overflow-y: auto;
        flex: 1;
        flex-shrink: 1;
    }

    .progressBar_box {
        margin-top: 48rpx;
        flex-shrink: 0;

        .text_box {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16rpx;

            .text {
                font-family: MiSans;
                font-size: 28rpx;
                color: #FFFFFF;
            }

            .percentage {
                font-family: MiSans;
                font-size: 28rpx;
                font-weight: bold;
                color: #3CD5FC;
            }
        }

        .progressBar {
            width: 100%;
            height: 38rpx;
            border-radius: 2026rpx;
            background-color: #0d1f3c;
            overflow: hidden;

            .progressBar_inner {
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(270deg, #3cd5fc 0%, #195efc 48%);
                transition: width 0.3s;
            }
        }
    }
}
</style>
