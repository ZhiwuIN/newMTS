<template>
    <customnavbar :title="'K certification'" @mtop="mtop"
        backgroundStr="url('/static/Certification/title_bgi.png') top left/100% no-repeat">
        <view class="certification-page" :style="topStyle2">
            <view class="hero" :style="topStyle">
                <image src="/static/Certification/title_bgi.png" class="hero-bg" mode="widthFix"></image>
                <view class="hero-copy">
                    <view class="hero-title">Verify to unlock smoother withdrawals and fund access</view>
                    <view class="hero-desc">Complete membership, security deposit, and ID verification to remove fund
                        purchase limits.</view>
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

        <view class="bottom-bar">
            <view class="submit-btn" :class="{ finished: isFinished }" @click="handleSubmit">
                {{ submitText }}
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    userInfoApi
} from '@/common/api/users.js'
export default {
    components: {
        customnavbar
    },
    data() {
        return {
            topStyle: '',
            topStyle2: '',
            userInfo: {},
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
                    title: 'Become a full member',
                    desc: 'Upgrade your account before applying for K Verification.',
                    path: '/pages/LevelPage/index',
                    isTab: true,
                    check: 'member'
                },
                {
                    no: 2,
                    title: 'Add security deposit',
                    desc: 'Deposit the required amount to meet the verification rules.',
                    path: '/pages/HomePage/rechargePage',
                    check: 'deposit'
                },
                {
                    no: 3,
                    title: 'Upload ID verification',
                    desc: 'Submit your real identity details for review.',
                    path: '/pages/MinePage/identity',
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
                    title: 'Fund access unlocked',
                    desc: 'Unverified users may be blocked from buying funds. Approval removes this limit.'
                },
                {
                    icon: '/static/Certification/Benefits3.png',
                    title: 'Review after submission',
                    desc: 'After all steps are done, submit for review. Once approved, benefits take effect automatically.'
                }
            ]
        }
    },
    computed: {
        steps() {
            return this.baseSteps.map(item => {
                const done = this.isStepDone(item.check)
                return {
                    ...item,
                    done,
                    action: done ? 'Done' : 'Start',
                    statusClass: done ? 'done' : 'start'
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
            return this.isFinished ? 'Completed' : 'Unfinished'
        }
    },
    methods: {
        getUserInfo() {
            userInfoApi().then(res => {
                this.userInfo = res.data || {}
                uni.setStorageSync('userInfo', this.userInfo)
            }).catch(() => {
                this.userInfo = uni.getStorageSync('userInfo') || {}
            })
        },
        isStepDone(type) {
            const userInfo = this.userInfo || {}
            if (type === 'member') {
                return String(userInfo.levelCode || '0') !== '0'
            }
            if (type === 'deposit') {
                return Number(userInfo.depositAmount || 0) > 0
            }
            if (type === 'identity') {
                return !!userInfo.realName && userInfo.realName !== 'African User' && !!userInfo.idCard
            }
            return false
        },
        handleStepClick(item) {
            if (item.done || !item.path) return
            if (item.isTab) {
                uni.switchTab({
                    url: item.path
                })
                return
            }
            uni.navigateTo({
                url: item.path
            })
        },
        handleSubmit() {
            if (this.isFinished) {
                this.$showMessage('success', 'K certification has been completed');
                return
            }
            const nextStep = this.steps.find(item => !item.done)
            if (nextStep) {
                this.$showMessage('warning', `Please complete: ${nextStep.title}`);
            }
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
        this.getUserInfo()
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
    font-size: 46rpx;
    line-height: 58rpx;
    font-weight: 1000;
    color: #000000;
}

.hero-desc {
    width: 620rpx;
    margin: 14rpx auto 0;
    font-size: 27rpx;
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
    padding: 0 32rpx;
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
    font-size: 30rpx;
    line-height: 36rpx;
    font-weight: 900;
}

.summary-desc {
    margin-top: 16rpx;
    font-size: 25rpx;
    line-height: 34rpx;
    font-weight: 400;
}

.panel {
    margin-top: 24rpx;
    padding: 32rpx 32rpx 36rpx;
    border-radius: 14rpx;
    background: #ffffff;
}

.panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.panel-title {
    font-size: 32rpx;
    line-height: 40rpx;
    font-weight: 900;
    font-style: italic;
    color: #050505;
}

.progress-count {
    font-size: 32rpx;
    line-height: 40rpx;
    font-weight: 900;
    font-style: italic;
    color: #2377ff;
}

.panel-desc {
    margin-top: 12rpx;
    font-size: 25rpx;
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
    margin: 0 16rpx;
    background: #d5eefb;
}

.step-copy {
    flex: 1;
    min-width: 0;
    padding-right: 16rpx;
}

.step-title,
.benefit-title {
    font-size: 29rpx;
    line-height: 36rpx;
    font-weight: 900;
    color: #000000;
}

.step-desc,
.benefit-desc {
    margin-top: 2rpx;
    font-size: 25rpx;
    line-height: 31rpx;
    color: #242424;
}

.step-action {
    flex-shrink: 0;
    min-width: 130rpx;
    height: 50rpx;
    padding: 0 18rpx;
    border-radius: 16rpx;
    text-align: center;
    font-size: 31rpx;
    line-height: 50rpx;
    font-weight: 900;
    font-style: italic;
}

.step-action.done {
    background: #dcffe8;
    color: #16c849;
}

.step-action.start {
    background: #dff3ff;
    color: #2377ff;
}

.benefits-panel {
    padding-bottom: 28rpx;
}

.benefit-list {
    margin-top: 26rpx;
}

.benefit-item {
    display: flex;
    align-items: center;
    min-height: 118rpx;
    margin-top: 26rpx;
}

.benefit-item:first-child {
    margin-top: 0;
}

.benefit-icon {
    flex-shrink: 0;
    width: 56rpx;
    height: 56rpx;
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
    height: 108rpx;
    border-radius: 14rpx;
    background: linear-gradient(90deg, #202020 0%, #676767 100%);
    color: #ffffff;
    text-align: center;
    font-size: 30rpx;
    line-height: 108rpx;
    font-weight: 900;
    pointer-events: auto;
}

.submit-btn.finished {
    background: linear-gradient(90deg, #2377ff 0%, #24c86b 100%);
}
</style>
