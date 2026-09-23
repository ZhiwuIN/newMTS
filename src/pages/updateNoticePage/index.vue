<template>
    <view class="box">
        <view class="Big_bgi" :style="topStyle2"></view>
        <view class="main" :style="topStyle2">
            <view class="title">{{ notice.title || $t('updateNotice.title') }}</view>
            <scroll-view class="content" scroll-y>
                <rich-text :nodes="notice.content || ''"></rich-text>
            </scroll-view>
            <view class="progressBar_box">
                <view class="text_box">
                    <view class="text">{{ $t(progressTextKey) }}</view>
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
const UPDATE_NOTICE_DATA_KEY = 'latest_update_notice_data'
const UPDATE_VERSION_DATA_KEY = 'latest_update_version_data'

export default {
    data() {
        return {
            topStyle2: '',
            notice: {},
            versionData: null,
            percentage: 0,
            timer: null,
            downloadTask: null,
            progressTextKey: this.$t('updateNotice.updating')
        }
    },
    computed: {
        showPercentage() {
            return Math.round(this.percentage)
        }
    },
    onLoad() {
        this.notice = uni.getStorageSync(UPDATE_NOTICE_DATA_KEY) || {}
        this.versionData = uni.getStorageSync(UPDATE_VERSION_DATA_KEY) || null
        uni.removeStorageSync(UPDATE_NOTICE_DATA_KEY)
        uni.removeStorageSync(UPDATE_VERSION_DATA_KEY)
        this.mtop()

        // #ifdef APP-PLUS
        if (this.versionData) {
            this.startRealUpdate()
            return
        }
        // #endif

        this.startNoticeProgress()
    },
    onUnload() {
        if (this.timer) clearInterval(this.timer)
    },
    onBackPress() {
        if (this.versionData?.edition_force == 1) return true
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
            const mtopValue = statusBarHeight / 2 + navBarHeight
            // #ifdef H5
            this.topStyle2 = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = 'height:calc(100vh);'
            // #endif
        },
        startNoticeProgress() {
            const duration = 3000
            const startedAt = Date.now()
            this.timer = setInterval(() => {
                this.percentage = Math.min(100, ((Date.now() - startedAt) / duration) * 100)
                if (this.percentage >= 100) {
                    clearInterval(this.timer)
                    this.timer = null
                    setTimeout(() => this.goLogin(), 300)
                }
            }, 80)
        },
        startRealUpdate() {
            const data = this.versionData
            if (data.package_type == 0 && !data.edition_url?.toLowerCase().includes('.apk')) {
                this.progressTextKey = this.$t('updateNotice.openingDownload')
                plus.runtime.openURL(data.edition_url)
                this.goLogin()
                return
            }

            this.progressTextKey = this.$t('updateNotice.downloading')
            this.downloadTask = uni.downloadFile({
                url: data.edition_url,
                success: (res) => {
                    if (res.statusCode !== 200) {
                        this.handleUpdateError(null, this.$t('updateNotice.downloadFailed'))
                        return
                    }
                    this.percentage = 100
                    this.progressTextKey = this.$t('updateNotice.installing')
                    plus.runtime.install(res.tempFilePath, { force: true }, () => {
                        if (data.package_type == 1) plus.runtime.restart()
                        else this.goLogin()
                    }, this.handleUpdateError)
                },
                fail: this.handleUpdateError
            })

            this.downloadTask.onProgressUpdate((res) => {
                this.percentage = res.progress
            })
        },
        handleUpdateError(error, messageKey = this.$t('updateNotice.updateFailed')) {
            if (error) console.log('app update failed', error)
            this.progressTextKey = this.$t('updateNotice.updateFailed')
            uni.showToast({
                title: this.$t(messageKey),
                icon: 'none',
                duration: 2500
            })
            if (this.versionData?.edition_force != 1) setTimeout(() => this.goLogin(), 2000)
        },
        goLogin() {
            uni.reLaunch({ url: '/pages/LoginPage/login' })
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

    .title {
        font-size: 48rpx;
        font-weight: 900;
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
        min-height: 0;
    }

    .progressBar_box {
        margin-top: 48rpx;
        flex-shrink: 0;

        .text_box {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16rpx;
        }

        .text,
        .percentage {
            font-family: MiSans;
            font-size: 28rpx;
            color: #fff;
        }

        .percentage {
            font-weight: bold;
            color: #3CD5FC;
        }

        .progressBar {
            width: 100%;
            height: 38rpx;
            border-radius: 2026rpx;
            background-color: #0d1f3c;
            overflow: hidden;
        }

        .progressBar_inner {
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(270deg, #3cd5fc 0%, #195efc 48%);
            transition: width 0.2s;
        }
    }
}
</style>
