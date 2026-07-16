<template>
    <customnavbar :title="'KYC certification'" @mtop="mtop"
        backgroundStr="url('/static/Certification/title_bgi.png') top left/100% no-repeat">
        <view class="certification-page" :style="topStyle2">
            <view class="hero" :style="topStyle">
                <image src="/static/Certification/title_bgi.png" class="hero-bg" mode="widthFix"></image>
                <view class="hero-copy">
                    <view class="hero-title">Finish identity verification for auto-renewal of social insurance contract & full permission unlock</view>
                    <view class="hero-desc">Pay 25% of the security deposit and finish identity verification to unlock all account restrictions</view>
                </view>
            </view>

            <view class="content">
                <view class="summary-card">
                    <image src="/static/Certification/card_img.png" class="summary-img" mode="widthFix"></image>
                    <view class="summary-content">
                        <view class="summary-item" v-for="item in summaryList" :key="item.title">
                            <view class="summary-title">{{ item.title }}</view>
                            <view class="summary-desc">{{ item.desc }}</view>
                        </view>
                    </view>
                </view>

                <view class="panel progress-panel">
                    <view class="success-card" v-if="isFinished">
                        <image src="/static/Certification/Union.png" class="success-icon" mode="aspectFit"></image>
                        <view class="success-title">Become K user</view>
                        <view class="success-desc">Congratulations, you have completed the authentication.</view>
                        <view class="success-desc">Go to your balance to check your rewards</view>
                        <view class="success-link" @click="toPage">Go check→</view>
                    </view>

                    <view class="panel-head">
                        <view class="panel-title">Progress</view>
                        <view class="progress-count">{{ completedCount }}/{{ steps.length }}</view>
                    </view>
                    <view class="panel-desc">Complete all three steps to submit for review.</view>

                    <view class="step-list">
                        <view class="step-item" v-for="item in steps" :key="item.no" @click="handleStepClick(item)">
                            <view class="step-no">{{ item.no }}</view>
                            <view class="step-line"></view>
                            <view class="step-copy">
                                <view class="step-title">{{ item.title }}</view>
                                <view class="step-desc">{{ item.desc }}</view>
                            </view>
                            <view class="step-action" :class="item.statusClass">{{ item.action }}</view>
                        </view>
                    </view>

                    <view class="rejectReason" v-if="kAuthInfo?.rejectReason">{{ $t('失败原因') }}: {{ kAuthInfo?.rejectReason
                        }}</view>
                </view>

                <view class="panel benefits-panel">
                    <view class="panel-title">Benefits</view>
                    <view class="panel-desc">Enjoy the following exclusive benefits</view>

                    <view class="benefit-list">
                        <view class="benefit-item" v-for="item in benefits" :key="item.title">
                            <image :src="item.icon" class="benefit-icon" mode="aspectFit"></image>
                            <view class="benefit-line"></view>
                            <view class="benefit-copy">
                                <view class="benefit-title">{{ item.title }}</view>
                                <view class="benefit-desc">{{ item.desc }}</view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="bottom-space"></view>
        </view>

        <!-- <view class="bottom-bar">
            <view class="submit-btn" :class="{ 'Unlocked': isFinished }">
                {{ submitText }}
            </view>
        </view> -->
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    userInfoApi
} from '@/common/api/users.js'
import {
    kAuthInfoApi
} from '@/common/api/Certification.js'

const MEMBER_STEP_TITLE = 'Become a full member'
const DEPOSIT_STEP_TITLE = 'Add security deposit'

export default {
    components: {
        customnavbar
    },
    data() {
        return {
            currency: '',
            topStyle: '',
            topStyle2: '',
            summaryList: [
                {
                    title: 'Withdrawals',
                    desc: 'Smoother after approval'
                },
                {
                    title: 'Funds',
                    desc: 'No limits after approval'
                },
                {
                    title: 'Account',
                    desc: 'More trusted profile'
                }
            ],
            baseSteps: [
                {
                    no: 1,
                    title: MEMBER_STEP_TITLE,
                    desc: 'Upgrade your account before applying for KYC Verification.',
                    path: '/pages/LevelPage/index',
                    isTab: true,
                    check: 'member'
                },
                {
                    no: 2,
                    title: DEPOSIT_STEP_TITLE,
                    desc: 'Recharge the corresponding amount on this page to meet the verification rules.',
                    path: '/pages/HomePage/RechargeChannel',
                    check: 'deposit'
                },
                {
                    no: 3,
                    title: 'Upload ID verification',
                    desc: 'Submit your real identity details for review.',
                    path: '/pages/CertificationPage/identification',
                    check: 'identity'
                }
            ],
            benefits: [
                {
                    icon: '/static/Certification/Benefits1.png',
                    title: 'Smoother withdrawals',
                    desc: 'Approved users have a more complete profile, reducing withdrawal friction.'
                },
                {
                    icon: '/static/Certification/Benefits2.png',
                    title: 'All permissions unlocked',
                    desc: 'Unverified users may have limited access to certain features; all restrictions will be removed upon approval.'
                },
                {
                    icon: '/static/Certification/Benefits3.png',
                    title: 'Review after submission',
                    desc: 'After all steps are done, submit for review. Once approved, benefits take effect automatically.'
                }
            ],
            kAuthInfo: null
        }
    },
    computed: {
        steps() {
            return this.baseSteps.map(item => {
                const done = this.isStepDone(item.check)
                const status = this.getStepStatus(item.check)
                const isPending = status === 'pending'
                return {
                    ...item,
                    done,
                    action: isPending ? 'Review' : (done ? 'Done' : 'GO→'),
                    statusClass: isPending ? 'pending' : (done ? 'done' : 'start')
                }
            })
        },
        completedCount() {
            return this.steps.filter(item => item.done).length
        },
        isFinished() {
            return this.completedCount === this.steps.length
        },
        submitText() {
            return this.isFinished ? 'Unlocked' : 'Unfinished'
        }
    },
    methods: {
        getKAuthInfo() {
            kAuthInfoApi().then(res => {
                this.kAuthInfo = res.data
                this.currency = uni.getStorageSync('settings').currency
                if (String(this.kAuthInfo.currentVipLevel || '0') !== '0') {
                    this.baseSteps[0].title = `Current Level: ${this.kAuthInfo.currentVipLevelName}`
                    const amount = this.kAuthInfo?.requiredRechargeAmount ?? 0
                    this.baseSteps[1].title = `Recharge: ${this.kAuthInfo.activityRechargeAmount || 0}/${amount}${this.currency || ''}`
                } else {
                    this.baseSteps[0].title = MEMBER_STEP_TITLE
                    this.baseSteps[1].title = DEPOSIT_STEP_TITLE
                }
            })
        },
        isStepDone(type) {
            if (type === 'member') {
                return !!this.kAuthInfo?.steps?.[0]?.completed
            }
            if (type === 'deposit') {
                return !!this.kAuthInfo?.steps?.[1]?.completed
            }
            if (type === 'identity') {
                return !!this.kAuthInfo?.steps?.[2]?.completed
            }
            return false
        },
        getStepStatus(type) {
            if (type === 'member') {
                return this.kAuthInfo?.steps?.[0]?.status
            }
            if (type === 'deposit') {
                return this.kAuthInfo?.steps?.[1]?.status
            }
            if (type === 'identity') {
                return this.kAuthInfo?.steps?.[2]?.status
            }
            return ''
        },
        handleStepClick(item) {
            if (item.done || item.statusClass === 'pending' || !item.path) return
            const previousStep = this.steps.find(step => step.no === item.no - 1)
            if (previousStep && !previousStep.done) {
                this.$showMessage('warning', 'Please complete the previous condition first')
                return
            }
            let url = item.path
            if (
                item.check === 'deposit'
                && String(this.kAuthInfo?.currentVipLevel || '0') !== '0'
                && this.kAuthInfo?.requiredRechargeAmount
            ) {
                url = `${item.path}?source=kAuth&amount=${encodeURIComponent(this.kAuthInfo.requiredRechargeAmount)}`
            }
            if (item.isTab) {
                uni.switchTab({
                    url
                })
                return
            }
            uni.navigateTo({
                url
            })
        },
        toPage() {
            uni.switchTab({
                url: '/pages/MinePage/index'
            })
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle = `margin-top:-${e + 140}rpx;`
            this.topStyle2 = `min-height:calc(100vh - ${e - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = `margin-top:-${e}rpx;`
            this.topStyle2 = 'min-height:100vh;'
            // #endif
        }
    },
    onShow() {
        this.getKAuthInfo()
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
    font-family: MiSans, DINPro-Regular, sans-serif;
}

.certification-page {
    position: relative;
    min-height: 100vh;
    background: #d5def6;
    color: #050505;
    // overflow: hidden;
}

.hero {
    position: relative;
    min-height: 954rpx;
}

.hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.hero-copy {
    position: relative;
    z-index: 1;
    padding: 250rpx 38rpx 0;
    text-align: center;
}

.hero-title {
    font-size: 44rpx;
    line-height: 58rpx;
    font-weight: 1000;
    color: #000000;
}

.hero-desc {
    width: 620rpx;
    margin: 14rpx auto 0;
    font-size: 32rpx;
    line-height: 34rpx;
    font-weight: 400;
    color: rgba(0, 0, 0, .82);
}

.content {
    position: relative;
    z-index: 2;
    margin-top: -24rpx;
    padding: 0 32rpx 0;
}

.success-card {
    padding: 0 0 70rpx;
    text-align: center;
}

.success-icon {
    display: block;
    width: 112rpx;
    height: 112rpx;
    margin: 0 auto;
}

.success-title {
    margin-top: 28rpx;
    font-size: 36rpx;
    line-height: 48rpx;
    font-weight: 400;
    color: #202020;
}

.success-desc {
    margin-top: 10rpx;
    padding: 0;
    font-size: 26rpx;
    line-height: 32rpx;
    color: #707070;
}

.success-desc+.success-desc {
    margin-top: 0;
}

.success-link {
    margin-top: 16rpx;
    font-size: 28rpx;
    line-height: 36rpx;
    font-weight: 700;
    color: #075fe8;
}

.summary-card {
    position: relative;
    overflow: hidden;
    border-radius: 12rpx;
}

.summary-img {
    display: block;
    width: 100%;
}

.summary-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    padding: 32rpx;
}

.summary-item {
    min-width: 0;
    padding: 0 18rpx;
    color: #ffffff;
    border-left: 1rpx solid rgba(255, 255, 255, .72);
}

.summary-item:first-child {
    padding-left: 0;
    border-left: 0;
}

.summary-title {
    font-size: 26rpx;
    line-height: 36rpx;
    font-weight: 900;
}

.summary-desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: normal;
    font-weight: 400;
}

.panel {
    margin-top: 24rpx;
    padding: 32rpx;
    border-radius: 14rpx;
    background: #ffffff;
}

.rejectReason {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #FD0000;
}

.panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.panel-title {
    font-family: DingTalk JinBuTi;
    font-size: 32rpx;
    line-height: 40rpx;
    color: #050505;
}

.progress-count {
    font-family: DingTalk JinBuTi;
    font-size: 32rpx;
    line-height: 40rpx;
    // font-weight: 900;
    // font-style: italic;
    color: #2377ff;
}

.panel-desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 32rpx;
    color: #202020;
}

.step-list {
    margin-top: 26rpx;
}

.step-item {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 106rpx;
    margin-top: 24rpx;
}

.step-item:first-child {
    margin-top: 0;
}

.step-no {
    flex-shrink: 0;
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: #e5f6ff;
    color: #1f78ff;
    text-align: center;
    font-size: 34rpx;
    line-height: 72rpx;
    font-weight: 900;
}

.step-line,
.benefit-line {
    flex-shrink: 0;
    width: 2rpx;
    height: 50rpx;
    margin: 0 14rpx;
    background: #d5eefb;
}

.step-copy {
    flex: 1;
    min-width: 0;
    padding-right: 16rpx;
}

.step-title,
.benefit-title {
    font-size: 28rpx;
    line-height: 36rpx;
    font-weight: 900;
    color: #000000;
}

.step-desc,
.benefit-desc {
    margin-top: 2rpx;
    font-size: 24rpx;
    line-height: 31rpx;
    color: #242424;
}

.step-action {
    flex-shrink: 0;
    min-width: 130rpx;
    height: 50rpx;
    padding: 0 18rpx;
    border-radius: 16rpx;
    font-family: DingTalk JinBuTi;
    text-align: center;
    font-size: 32rpx;
    line-height: 50rpx;
}

.step-action.done {
    background: #dcffe8;
    color: #16c849;
}

.step-action.start {
    background: #dff3ff;
    color: #2377ff;
}

.step-action.pending {
    background: #fff4cc;
    color: #d88900;
}

.benefits-panel {
    padding-bottom: 28rpx;
}

.benefit-list {
    margin-top: 24rpx;
}

.benefit-item {
    display: flex;
    align-items: center;
    min-height: 110rpx;
    margin-top: 24rpx;
}

.benefit-item:first-child {
    margin-top: 0;
}

.benefit-icon {
    flex-shrink: 0;
    width: 48rpx;
    height: 48rpx;
}

.benefit-copy {
    flex: 1;
    min-width: 0;
}

.bottom-space {
    height: 220rpx;
}

.bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    padding: 0 32rpx 16rpx;
    pointer-events: none;
}

.submit-btn {
    height: 110rpx;
    border-radius: 14rpx;
    background: linear-gradient(90deg, #212121 0%, #606060 100%);
    color: #ffffff;
    text-align: center;
    font-size: 28rpx;
    line-height: 110rpx;
    font-weight: 600;
    pointer-events: auto;
}

.submit-btn.Unlocked {
    background: #E7FFED;
    border: 2rpx solid #058E3C;
    color: #058E3C;
}
</style>
