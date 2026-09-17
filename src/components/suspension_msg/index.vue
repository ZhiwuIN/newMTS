<template>
    <view class="suspension_msg_box" :class="{ hidden: isHidden }" @click="unShow">
        <view>{{ $t('chat') }}</view>
        <view class="redDot" v-if="unreadCount > 0"></view>
    </view>
</template>

<script>
import { messageBadgeManager } from '@/common/api/messageBadge.js'
export default {
    data() {
        return {
            isHidden: false, // 控制元素显示/隐藏
            scrollTimer: null,// 滚动定时器
            list: [],
            levelCode: '0',
            unreadCount: 0
        }
    },
    methods: {
        unShow() {
            uni.navigateTo({
                url: '/pages/MessagePage/index'
            })
        },
        handleScroll() {
            // 页面开始滚动时立即隐藏元素
            this.isHidden = true;

            // 清除之前的定时器
            if (this.scrollTimer) {
                clearTimeout(this.scrollTimer);
            }

            // 设置新的定时器，在停止滚动500ms后显示元素
            this.scrollTimer = setTimeout(() => {
                this.isHidden = false;
            }, 200);
        },
    },
    mounted() {
        messageBadgeManager.subscribe((count) => {
            this.unreadCount = count
        })
    },
    beforeDestroy() {
        // 清理事件监听和定时器
        uni.$off('pageScroll', this.handleScroll);

        // #ifdef H5
        window.removeEventListener('scroll', this.handleScroll);
        // #endif

        if (this.scrollTimer) {
            clearTimeout(this.scrollTimer);
        }
    }
}
</script>

<style lang="scss" scoped>
.function-card2 {
    box-sizing: border-box;
    background-color: #fff;
    width: 100%;
    margin: 0 auto;
    background: #FFFFFF;
    border-radius: 20rpx;


    .function-grid {
        // padding: 0 30rpx;

        .function-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 30rpx 0;
            border-bottom: 1rpx solid #EFEFEF;
            // margin-bottom: 50rpx;

            &:last-child {
                border-bottom: none;
            }

            .item_left {
                display: flex;
                align-items: center;

                image {
                    width: 48rpx;
                    height: 48rpx;
                    min-width: 48rpx;
                }

                text {
                    font-family: DINPro, DINPro;
                    font-weight: 400;
                    font-size: 24rpx;
                    color: #000;
                    // line-height: 30rpx;
                    margin-left: 30rpx;
                    text-align: left;
                    font-style: normal;
                    // white-space: nowrap;
                    // overflow: hidden;
                    // text-overflow: ellipsis;
                }
            }

            .item_right {
                width: 30rpx;
                height: 30rpx;
                min-width: 30rpx;
                margin-left: 24rpx;
            }
        }
    }
}


.suspension_msg_box {
    position: fixed;
    right: 10rpx;
    bottom: 360rpx;
    padding-top: 108rpx;
    display: flex;
    justify-content: center;
    width: 100rpx;
    height: 162rpx;
    background: url('/static/massage/suspension_img.png') top left/100%;
    font-family: MiSans;
    font-size: 24rpx;
    font-weight: 500;
    color: #fff;
    /* 添加过渡效果使显示/隐藏更平滑 */
    transform: translateX(0);
    transition: all 0.3s ease-in-out;
    z-index: 9999;

    .redDot {
        position: absolute;
        top: 24rpx;
        right: 10rpx;
        width: 20rpx;
        height: 20rpx;
        background-color: #FF0000;
        border-radius: 50%;
    }
}

/* 隐藏状态样式 */
.suspension_msg_box.hidden {
    transform: translateX(70%);
    pointer-events: none;
}
</style>