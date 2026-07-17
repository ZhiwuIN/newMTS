<template>
    <!-- K认证弹窗 -->
    <view class="box">
        <uni-popup ref="promptpopup" type="center" :mask-click="false" style="z-index: 10002;">
            <view class="prompt_pop_page">
                <view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
                <view class="prompt_pop_taps">
                    {{ 'Please complete KYC authentication' }}
                </view>
                <view class="prompt_pop_bottom">
                    <!-- <button class="prompt_cancel_btn" @click="prompt_cancel">{{ $t('Later') }}</button> -->
                    <button class="prompt_confirm_btn" @click="prompt_confirm">{{ $t('pay.yes') }}</button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
const HOME_PAGE = '/pages/HomePage/index'
const TAB_BAR_PAGES = [
    'pages/HomePage/index',
    'pages/TaskPage/index',
    'pages/MessagePage/index',
    'pages/LevelPage/index',
    'pages/MinePage/index',
]

export default {
    props: {

    },
    data() {
        return {
            ownerRoute: ''
        }
    },
    methods: {
        open() {
            this.$refs.promptpopup.open()
        },
        prompt_confirm() {
            this.$refs.promptpopup.close()
            uni.navigateTo({
                url: '/pages/CertificationPage/index'
            })
        },
        prompt_cancel() {
            this.$refs.promptpopup.close()
            if (this.isCurrentTabBarPage()) {
                uni.switchTab({
                    url: HOME_PAGE
                })
                return
            }
            uni.navigateBack()
        },
        handleShowCertificationPopup() {
            if (this.isCurrentPage()) {
                this.open()
            }
        },
        isCurrentPage() {
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            return currentPage?.route === this.ownerRoute
        },
        isCurrentTabBarPage() {
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const currentRoute = currentPage?.route || ''

            return TAB_BAR_PAGES.includes(currentRoute)
        }
    },
    mounted() {
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        this.ownerRoute = currentPage?.route || ''
        uni.$on('showCertificationPopup', this.handleShowCertificationPopup)
    },
    beforeDestroy() {
        uni.$off('showCertificationPopup', this.handleShowCertificationPopup)
    },
    beforeUnmount() {
        uni.$off('showCertificationPopup', this.handleShowCertificationPopup)
    }
}
</script>

<style lang="scss" scoped>
.prompt_pop_page {
    width: 570rpx;
    background: #FFFFFF;
    border-radius: 28rpx;
    padding: 40rpx 54rpx 28rpx 54rpx;

    .prompt_pop_top {
        font-family: "DINPro-Medium", sans-serif;
        font-weight: 500;
        font-size: 32rpx;
        color: #000000;
        line-height: 42rpx;
        text-align: center;
        font-style: normal;
    }

    .prompt_pop_taps {
        font-family: "DINPro-Regular", sans-serif;
        font-weight: 400;
        font-size: 28rpx;
        color: #1C2D57;
        line-height: 36rpx;
        text-align: center;
        font-style: normal;
        margin-top: 40rpx;
    }

    .prompt_pop_bottom {
        display: flex;
        margin-top: 54rpx;
    }

    .prompt_cancel_btn {
        width: 212rpx;
        height: 72rpx;
        background: #EBEBEB;
        border-radius: 16rpx;
        font-family: DINPro, DINPro;
        font-weight: 500;
        font-size: 32rpx;
        color: #000000;
        line-height: 72rpx;
        text-align: center;
        font-style: normal;
    }

    .prompt_confirm_btn {
        width: 212rpx;
        height: 72rpx;
        background: $themeColor;
        box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
        border-radius: 16rpx;
        font-family: DINPro, DINPro;
        font-weight: 500;
        font-size: 32rpx;
        color: #FFFFFF;
        line-height: 72rpx;
        text-align: center;
        font-style: normal;
    }
}
</style>
