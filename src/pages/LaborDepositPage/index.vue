<template>
    <customnavbar @mtop="mtop" :whiteTitle="true"
        backgroundStr="url('/static/LaborDeposit/title_bgi.png') top left/100%  no-repeat">
        <view class="Big_bgi" :style="topStyle2"></view>
        <view class="title_box" :style="topStyle">
            <image src="/static/LaborDeposit/title_bgi.png" class="title_bgi" mode="widthFix"></image>
            <view class="title_text_box">
                <view class="title">Zero Deposit Work Plan</view>
                <view class="desc">Claim after Account upgrade</view>
            </view>
        </view>

        <view class="page_body">
            <!-- <view class="section_title">Choose a deposit</view> -->
            <view class="title_card">
                <view class="desc">Application Instructions</view>
                <view>After the Account upgrade is completed, you can click to claim the corresponding level's work
                    deposit.
                    After clicking to claim, the work deposit will be automatically refunded to your CWPC work account
                    balance.</view>
            </view>

            <view class="deposit_list">
                <view class="deposit_card" v-for="item in depositList" :key="item.level">
                    <image class="deposit_badge" :src="item.vipLevelImage" mode="aspectFit"></image>
                    <view class="deposit_info">
                        <view class="deposit_main">
                            <view class="deposit_left">
                                <view class="deposit_name">{{ item.vipLevelName }}</view>

                                <!-- <view class="progress_box">
                                    <view class="progress_bar">
                                        <view class="progress_fill" :style="{ width: getProgressWidth(item) }"></view>
                                    </view>
                                </view> -->
                            </view>

                            <view class="claim_btn" v-if="item.claimStatus == 'canClaim'" @click="unApplyApi">Claim
                            </view>
                            <view class="claim_btn gray" v-else-if="item.claimStatus == 'claimed'">Already Received
                            </view>
                            <view class="claim_btn gray" v-else-if="item.claimStatus == 'pending'">under review</view>
                            <view class="claim_btn gray" v-else="item.claimStatus == 'unavailable'">Not Claimable</view>
                        </view>

                        <view class="deposit_bottom">
                            <!-- {{ (item.totalQuota - item.remainingQuota) || 0 }}/ -->
                            <view class="progress_text">Gross: {{
                                item.totalQuota }}</view>
                            <view class="spots_text">{{ item.remainingQuota }} Spots Left</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="section_title rules_title">Activity Rules</view>

            <view class="rule_flow">
                <view class="flow_item">
                    <image class="flow_icon" :src="ruleFlow[0].icon" mode="aspectFit"></image>
                    <view class="flow_text">{{ ruleFlow[0].title }}</view>
                </view>
                <image class="flow_divider" src="/static/LaborDeposit/circle.png" mode="aspectFit"></image>
                <view class="flow_item">
                    <image class="flow_icon" :src="ruleFlow[1].icon" mode="aspectFit"></image>
                    <view class="flow_text">{{ ruleFlow[1].title }}</view>
                </view>
                <image class="flow_divider" src="/static/LaborDeposit/circle.png" mode="aspectFit"></image>
                <view class="flow_item">
                    <image class="flow_icon" :src="ruleFlow[2].icon" mode="aspectFit"></image>
                    <view class="flow_text">{{ ruleFlow[2].title }}</view>
                </view>
            </view>

            <view class="rules_content">
                <view class="rule_block" v-for="item in ruleSections" :key="item.no">
                    <view class="rule_heading">
                        <view class="rule_no">{{ item.no }}</view>
                        <view class="rule_name">{{ item.title }}</view>
                    </view>
                    <view class="rule_desc">{{ item.desc }}</view>
                </view>

                <view class="rule_tail" v-html="workDepositInfo.ruleContent"></view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    workDepositApi,
    applyStatusApi,
    applyApi
} from '@/common/api/LaborDepositPage.js'
export default {
    components: {
        customnavbar,
    },
    data() {
        return {
            topStyle: '',
            topStyle2: '',
            workDepositInfo: {},
            depositList: [],
            ruleFlow: [
                {
                    icon: '/static/LaborDeposit/rule_img1.png',
                    title: 'Zero Work\nDeposit'
                },
                {
                    icon: '/static/LaborDeposit/rule_img2.png',
                    title: 'Upgrade VIP'
                },
                {
                    icon: '/static/LaborDeposit/rule_img3.png',
                    title: 'Collect work\ndeposit'
                }
            ],
            ruleSections: [
                {
                    no: '1',
                    title: 'Background and Purpose',
                    desc: `CWPC responded positively to the demands of its employees and the market, and officially launched the "Zero Employment Deposit Plan". This plan aims to lower the employment threshold, provide strong support for Ghana's economic development, and create more fair and convenient job opportunities for job seekers across the country. The company has always adhered to the people-oriented development philosophy and is committed to bringing real security and hope to society and its employees.`
                },
                {
                    no: '2',
                    title: 'Goals and benefits',
                    desc: `This plan aims to increase employment opportunities, enhance employees' income levels, and stimulate overall economic vitality. Through the "zero work deposit" program, eligible job seekers who join CWPC can have their work deposit refunded immediately once they remain within the quota, and enjoy stable income after employment, thereby achieving an improvement in their living standards.`
                },
                {
                    no: '3',
                    title: 'Quota allocation and application methods',
                    desc: "Due to the quotas of each level, the basis for 'zero work deposit' will be allocated based on the quotas of each level. Qualified job seekers can submit their own applications and view quota vacancies in real time through official announcements"
                }
            ]
        }
    },
    methods: {
        getWorkDeposit() {
            workDepositApi().then(res => {
                console.log(res)
                this.workDepositInfo = res.data
                this.depositList = res.data.levelList
                // this.getApplyStatusApi()
            })
        },
        getApplyStatusApi() {
            applyStatusApi().then(res => {
                console.log(res)
            })
        },
        // 领取
        unApplyApi() {
            uni.showLoading({
                title: this.$t('loading.btn')
            });
            applyApi().then(res => {
                this.$showMessage('warning', 'The work deposit will be automatically refunded to your CWPC work account balance');
                this.getWorkDeposit()
            }).catch((err) => {
                console.log('request fail', err);
                this.$showMessage('warning', err.msg);
            }).finally(() => {
                uni.hideLoading();
            });
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle = "margin-top:-" + e + "rpx;"
            this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = "margin-top:-" + e + "rpx;"
            this.topStyle2 = `height:calc(100vh);`
            // #endif
        },
        getProgressWidth(item) {
            const remainingQuota = Number(String(item.remainingQuota).replace(/,/g, ''))
            const totalQuota = Number(String(item.totalQuota).replace(/,/g, ''))

            if (!totalQuota || Number.isNaN(remainingQuota) || Number.isNaN(totalQuota)) {
                return '0%'
            }

            const percent = Math.min(Math.max((remainingQuota / totalQuota) * 100, 0), 100)
            return `${percent.toFixed(2)}%`
        }
    },
    onShow() {
        this.getWorkDeposit()
    }
}
</script>

<style lang="scss" scoped>
* {
    font-family: MiSans;
    box-sizing: border-box;
}

.Big_bgi {
    background-color: #14194b;
}

.title_box {
    position: relative;

    .title_bgi {
        width: 100vw;
    }

    .title_text_box {
        transform: translateY(-72rpx);
        color: #fff;
        text-align: center;

        .title {
            font-family: 'Alimama PuHeiTi';
            font-size: 64rpx;
            font-weight: 1000;
            text-shadow: 0rpx 2rpx 76rpx rgba(0, 0, 0, 0.8);
        }

        .desc {
            font-size: 30rpx;
            font-weight: 500;
            color: #EDD09E;
        }
    }
}

.page_body {
    margin-top: -28rpx;
    padding: 0 32rpx 60rpx;
}

.section_title {
    font-family: 'DINPro-Bold', sans-serif;
    font-size: 28rpx;
    line-height: 36rpx;
    color: #FFFFFF;
}

.deposit_list {
    margin-top: 22rpx;
}

.deposit_card {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 146rpx;
    margin-bottom: 18rpx;
    padding: 20rpx 14rpx 20rpx 18rpx;
    border-radius: 22rpx;
    background: rgba(12, 13, 18, 0.4);
    border: 2rpx solid #2F2F2F;
}

.title_card {
    position: relative;
    margin-bottom: 18rpx;
    padding: 20rpx 30rpx 28rpx 22rpx;
    border-radius: 22rpx;
    background: rgba(12, 13, 18, 0.4);
    border: 2rpx solid #2F2F2F;
    color: #fff;
    font-size: 24rpx;

    .desc {
        font-size: 30rpx;
        font-weight: 500;
        color: #EDD09E;
        margin-bottom: 6rpx;
    }
}

.deposit_badge {
    width: 114rpx;
    height: 114rpx;
    margin-right: 12rpx;
    flex-shrink: 0;
}

.deposit_info {
    flex: 1;
    min-width: 0;
}

.deposit_main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.deposit_left {
    flex: 1;
    min-width: 0;
    max-width: 294rpx;
}

.deposit_name {
    font-family: 'DINPro-Bold', sans-serif;
    font-size: 28rpx;
    line-height: 34rpx;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.claim_btn {
    min-width: 128rpx;
    padding: 0 12rpx;
    height: 52rpx;
    border-radius: 31rpx;
    background: #F1D392;
    color: #1A1F58;
    text-align: center;
    line-height: 52rpx;
    font-family: 'DINPro-Bold', sans-serif;
    font-size: 24rpx;
    margin-left: 20rpx;
    flex-shrink: 0;

    &.gray {
        background-color: #959595;
        color: #fff;
    }
}

.progress_box {
    margin-top: 14rpx;
}

.progress_bar {
    width: 100%;
    height: 18rpx;
    border-radius: 10rpx;
    background: #3D435D;
    overflow: hidden;
}

.progress_fill {
    display: block;
    height: 100%;
    border-radius: 10rpx;
    background: #F0D493;
}

.deposit_bottom {
    width: 100%;
    margin-top: 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.progress_text {
    font-family: 'DINPro-Regular', sans-serif;
    font-size: 24rpx;
    line-height: 24rpx;
    color: #C1C1C1;
}

.spots_text {
    font-family: 'DINPro-Regular', sans-serif;
    font-size: 24rpx;
    line-height: 24rpx;
    color: #FFFFFF;
}

.rules_title {
    margin-top: 42rpx;
}

.rule_flow {
    margin-top: 26rpx;
    display: grid;
    grid-template-columns: 1fr 60rpx 1fr 60rpx 1fr;
    align-items: start;
    column-gap: 18rpx;
}

.flow_item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.flow_icon {
    width: 96rpx;
    height: 96rpx;
    flex-shrink: 0;
}

.flow_text {
    margin-top: 16rpx;
    font-family: 'DINPro-Bold', sans-serif;
    font-size: 24rpx;
    line-height: 28rpx;
    color: #F1D392;
    white-space: pre-line;
}

.flow_divider {
    width: 60rpx;
    height: 20rpx;
    align-self: start;
    justify-self: center;
    margin-top: 36rpx;
}

.rules_content {
    margin-top: 30rpx;
    padding-bottom: 30rpx;
}

.rule_block {
    margin-bottom: 26rpx;
}

.rule_heading {
    display: flex;
    align-items: center;
}

.rule_no {
    width: 40rpx;
    height: 40rpx;
    margin-right: 14rpx;
    border-radius: 50%;
    background: linear-gradient(180deg, #274895 0%, #17306E 100%);
    color: #F1D392;
    text-align: center;
    line-height: 40rpx;
    font-family: DingTalk JinBuTi;
    font-size: 28rpx;
    box-shadow: 0 6rpx 12rpx rgba(4, 14, 48, 0.28);
}

.rule_name {
    flex: 1;
    font-family: 'DINPro-Bold', sans-serif;
    font-size: 32rpx;
    line-height: 40rpx;
    color: #F1D392;
}

.rule_desc {
    margin-top: 14rpx;
    padding-left: 52rpx;
    font-family: 'DINPro-Regular', sans-serif;
    font-size: 24rpx;
    line-height: 30rpx;
    color: rgba(255, 255, 255, 0.92);
}

.rule_tail {
    margin-top: 10rpx;
    font-family: 'DINPro-Regular', sans-serif;
    font-size: 28rpx;
    line-height: 30rpx;
    color: rgba(255, 255, 255, 0.96);
}
</style>