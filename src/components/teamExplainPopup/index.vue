<template>
    <!-- 团队说明弹窗 -->
    <view v-if="visible" class="box" :style="topStyle2" @click="handleClose">
        <view class="main" @click.stop>
            <view class="line"></view>
            <view class="content">
                <rich-text :nodes="teamDescription" class="common-info"></rich-text>
            </view>
            <view class="btn_box">
                <view class="btn1" @click="toPage('/pages/HomePage/teamExpansion')">Invite Friends</view>
                <view class="btn2" @click="toTabBarPage('/pages/LevelPage/index')">Upgrade Benefits</view>
            </view>
        </view>
    </view>
</template>

<script>
import {
    formatRichText
} from "@/utils/utils.js"
import { teamDescriptionApi } from '@/common/api/team.js'
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
            teamDescription: ''
        }
    },
    methods: {
        toPage(url) {
            uni.navigateTo({ url })
        },
        toTabBarPage(url) {
            uni.switchTab({ url })
        },
        handleClose() {
            this.$emit('close')
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
        teamDescriptionApi().then(res => {
            this.teamDescription = formatRichText(res.data.teamDescription)
        })
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
    z-index: 9999;
    width: 100%;
    background: rgba(0, 0, 0, 0.42);
    display: flex;
    align-items: end;

    .main {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100vw;
        min-height: 50vh;
        max-height: 76vh;
        border-radius: 16rpx 16rpx 0px 0px;
        background-color: #fff;
        padding: 24rpx;

        .line {
            width: 172rpx;
            height: 10rpx;
            border-radius: 2026rpx;
            background: #DDE4EC;
            margin: 0 auto;
            margin-bottom: 38rpx;
        }

        .content {
            overflow-y: auto;
            padding-bottom: 112rpx;
        }

        .btn_box {
            position: absolute;
            left: 0;
            bottom: 0;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14rpx;
            width: 100vw;
            padding: 24rpx;
            background-color: #fff;
            box-shadow: 0px 8rpx 20rpx 0px rgba(0, 0, 0, 0.3);

            view {
                border-radius: 10rpx;
                padding: 14rpx 26rpx;
                font-size: 28rpx;
                font-weight: bold;
                text-align: center;
            }

            .btn1 {
                background: #FED609;
                color: #000;
            }

            .btn2 {
                background: $themeColor;
                color: #fff;
            }
        }
    }
}
</style>
