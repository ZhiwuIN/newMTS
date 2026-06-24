<template>
    <customnavbar :title="'All Products'" @mtop="mtop"
        backgroundStr="url('/static/SocialSecurityFund/myFundListBgi.png') top left/100% no-repeat" :whiteTitle="true"
        :isSocialSecurityFund="true">
        <view class="my-fund-list-page" :style="topStyle2">
            <view class="hero">
                <image src="/static/SocialSecurityFund/myFundListBgi.png" class="hero-bg" mode="widthFix"></image>
                <view class="hero-income">
                    <text class="hero-income-num">{{ totalRevenueAmount }}</text>
                    <text class="hero-income-unit">{{ currency }}</text>
                </view>
                <view class="hero-desc">Total revenue for the current period</view>
            </view>

            <view class="content">
                <view class="fund-item" v-for="item in displayFundList" :key="item.id">
                    <view class="fund-title">{{ item.title }}</view>
                    <view class="fund-time">Purchase Time {{ item.purchaseTime }}</view>

                    <view class="fund-income">
                        <text class="fund-income-num">{{ item.estimatedRevenue }}</text>
                        <text class="fund-income-unit">{{ currency }}</text>
                    </view>
                    <view class="fund-income-label">Estimated Revenue</view>

                    <view class="detail-list">
                        <view class="detail-row" v-for="detail in item.details" :key="detail.label">
                            <view class="detail-label">{{ detail.label }}</view>
                            <view class="detail-value">{{ detail.value }}</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    shebaoFundMyAllApi
} from "@/common/api/SocialSecurityFund.js";
export default {
    components: {
        customnavbar,
    },
    data() {
        return {
            currency: '',
            topStyle2: '',
            myFundList: []
        }
    },
    computed: {
        totalRevenueAmount() {
            const total = this.myFundList.reduce((sum, item) => {
                return sum + (Number(item.currentPeriodEstimatedRevenue) || 0)
            }, 0)
            return this.formatNumber(total)
        },
        displayFundList() {
            return this.myFundList.map(item => {
                const totalIssue = Math.floor(Number(item.validDays || 0) / Number(item.rebateCycleDays || 30)) || 0
                return {
                    ...item,
                    purchaseTime: this.formatDate(item.startTime),
                    estimatedRevenue: this.formatNumber(item.currentPeriodEstimatedRevenue),
                    details: [
                        { label: 'Level Amount', value: `${this.formatNumber(item.marginAmount)} ${this.currency}` },
                        { label: 'Purchase Cost', value: `${this.formatNumber(item.buyAmount)} ${this.currency}` },
                        { label: 'Periodic Rebate', value: `${this.formatRate(item.rate)}%` },
                        { label: 'Current issue number', value: `${this.padIssue(item.rebateCount)}/${this.padIssue(totalIssue)}` },
                        { label: 'Next collection time', value: this.formatDate(item.nextRebateDate) }
                    ]
                }
            })
        }
    },
    methods: {
        getList() {
            shebaoFundMyAllApi().then(res => {
                this.myFundList = Array.isArray(res.data) ? res.data : []
            })
        },
        formatTitle(item) {
            const level = String(item.vipLevel || '').startsWith('V') ? item.vipLevel : `V${item.vipLevel || ''}`
            return `${level} | Social Security Fund`
        },
        formatNumber(value) {
            const num = Number(value)
            if (Number.isNaN(num)) return '0'
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            })
        },
        formatRate(value) {
            const num = Number(value)
            if (Number.isNaN(num)) return '0'
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            })
        },
        formatDate(value) {
            if (!value) return '--'
            return String(value).slice(0, 10).replace(/-/g, '.')
        },
        padIssue(value) {
            return String(value || 0).padStart(2, '0')
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle2 = `min-height:calc(100vh - ${e - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = `min-height:calc(100vh);`
            // #endif
        }
    },
    onShow() {
        this.getList()
        this.currency = uni.getStorageSync('settings').currency
    }
}
</script>

<style lang="scss" scoped>
* {
    font-family: MiSans;
}

.my-fund-list-page {
    position: relative;
    margin-top: -90rpx;
    background: #F5F5F5;
    overflow: hidden;
    min-height: 100vh;
}

.hero {
    position: relative;
}

.hero-bg {
    width: 100%;
    display: block;
}

.hero-income {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 160rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    color: #FFD078;
}

.hero-desc {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 80rpx;
    font-size: 28rpx;
    color: #FFFFFF;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.hero-income-num {
    font-size: 76rpx;
    line-height: 76rpx;
    font-weight: 700;
    font-family: DingTalk JinBuTi;
    background: linear-gradient(180deg, #ffb33d 0%, #ffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
}

.hero-income-unit {
    margin-left: 10rpx;
    margin-bottom: 8rpx;
    font-size: 28rpx;
    line-height: 34rpx;
    font-weight: 600;
    font-family: DingTalk JinBuTi;
    background: linear-gradient(180deg, #ffb33d 0%, #ffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
}

.content {
    padding: 32rpx;
}

.fund-item {
    margin-bottom: 26rpx;
    padding: 36rpx 32rpx 34rpx;
    border-radius: 26rpx;
    background: #FFFFFF;
}

.fund-title {
    font-size: 32rpx;
    line-height: 46rpx;
    font-weight: 600;
    color: #000000;
}

.fund-time {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #C8C8C8;
}

.fund-income {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-top: 34rpx;
    color: #000000;
}

.fund-income-num {
    font-size: 48rpx;
    line-height: 68rpx;
    font-weight: 600;
}

.fund-income-unit {
    margin-left: 10rpx;
    margin-bottom: 8rpx;
    font-size: 28rpx;
    line-height: 34rpx;
    font-weight: 600;
}

.fund-income-label {
    margin-top: 10rpx;
    font-size: 28rpx;
    line-height: 36rpx;
    text-align: center;
    color: #CFCFCF;
}

.detail-list {
    margin-top: 34rpx;
}

.detail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48rpx;
    margin-top: 10rpx;
}

.detail-row:first-child {
    margin-top: 0;
}

.detail-label {
    font-size: 24rpx;
    line-height: 34rpx;
    color: #A6A6A6;
}

.detail-value {
    font-size: 24rpx;
    line-height: 34rpx;
    font-weight: 500;
    color: #000000;
}
</style>
