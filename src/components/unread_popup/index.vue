<template>
    <!-- 团队说明弹窗 -->
    <view v-if="unreadCount > 0" class="box" :style="topStyle2">
        <view class="main" :class="{ show: popupShown }" @click.stop>
            <image class="x_img" src="/static/x.png" @click="handleClose"></image>
            <view class="image_box">
                <image class="img" src="/static/bell.png"></image>
            </view>
            <view class="title">{{ $t('unreadPopup.title') }}</view>
            <view class="content">
                {{ $t('unreadPopup.content') }}
            </view>
            <view class="btn_box" @click="toPage">
                {{ $t('unreadPopup.view') }}
            </view>
        </view>
    </view>
</template>

<script>
import { messageBadgeManager } from '@/common/api/messageBadge.js'
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            topStyle2: '',
            // 未读消息总数（驱动右上角红点）
            unreadCount: 0,
            popupShown: false,
            _unsubBadge: null,
            _popupTimer: null
        }
    },
    methods: {
        checkUnread() {
            if (this._unsubBadge) {
                this._unsubBadge()
            }
            this._unsubBadge = messageBadgeManager.subscribe((count) => {
                clearTimeout(this._popupTimer)
                this.unreadCount = count
                if (count > 0) {
                    this.popupShown = false
                    this.$nextTick(() => {
                        this._popupTimer = setTimeout(() => {
                            this.popupShown = true
                        }, 20)
                    })
                }
                else {
                    this.popupShown = false
                }
            })
            messageBadgeManager.refresh()
        },
        stopUnreadCheck() {
            clearTimeout(this._popupTimer)
            this.popupShown = false
            if (this._unsubBadge) {
                this._unsubBadge()
                this._unsubBadge = null
            }
        },
        toPage() {
            uni.navigateTo({ 
                url: '/pages/MessagePage/personMessagePage?id=' + uni.getStorageSync('userInfo').agentId
             })
        },
        handleClose() {
            this.popupShown = false
            clearTimeout(this._popupTimer)
            this._popupTimer = setTimeout(() => {
                this.unreadCount = 0
            }, 300)
        },
        mtop() {
            let statusBarHeight
            let navBarHeight
            // #ifdef APP-PLUS
            // App端
            const sys = uni.getSystemInfoSync()
            statusBarHeight = sys.statusBarHeight
            // 安卓/iOS导航栏高度适配
            if (sys.platform === 'android') {
                navBarHeight = 96
            }
            else {
                navBarHeight = 88
            }
            // #endif

            // #ifdef H5
            // H5端
            statusBarHeight = 0
            navBarHeight = 88
            // #endif
            let mtopValue
            // 计算scroll-view高度
            uni.getSystemInfo({
                success: (res) => {
                    mtopValue = statusBarHeight / 2 + navBarHeight
                },
            })
            // #ifdef H5
            this.topStyle2 = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = `height:calc(100vh);`
            // #endif
        }
    },
    mounted() {
        this.mtop()
    },
    beforeUnmount() {
        clearTimeout(this._popupTimer)
        this.stopUnreadCheck()
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

.box {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 99999;
    width: 100%;
    background: rgba(0, 0, 0, 0.42);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 48rpx;

    .main {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100vw;
        border-radius: 32rpx;
        background-color: #fff;
        padding: 32rpx;
        transform: translate(320rpx, 348rpx) scale(0.1);
        transition: transform 0.3s ease;

        &.show {
            transform: translate(0, 0) scale(1);
        }

        .x_img {
            position: absolute;
            top: 32rpx;
            right: 32rpx;
            width: 42rpx;
            height: 42rpx;
        }

        .image_box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 98rpx;
            height: 98rpx;
            background-color: #e6eff0;
            border-radius: 50%;
            margin: 0 auto;

            .img {
                width: 56rpx;
                height: 48rpx;
            }
        }

        .title {
            font-size: 38rpx;
            font-weight: bold;
            text-align: center;
            margin: 32rpx 0 0;
        }


        .content {
            text-align: center;
            color: $themeColor;
            margin: 32rpx 0 0;
        }

        .btn_box {
            display: flex;
            align-items: center;
            justify-content: center;
            background: $themeColor;
            color: #fff;
            border-radius: 16rpx;
            padding: 24rpx 0;
            font-size: 32rpx;
            margin: 32rpx 0 0;
        }
    }
}
</style>
