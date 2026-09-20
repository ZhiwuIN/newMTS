<template>
    <customnavbar :title="'Social Security Fund'" @mtop="mtop"
        backgroundStr="url('/static/SocialSecurityFund/bgi.png') top left/100% no-repeat" :whiteTitle="true"
        :isSocialSecurityFund="true">
        <view class="social-security-fund-page" :style="topStyle2">
            <view class="hero">
                <image src="/static/SocialSecurityFund/bgi.png" class="hero-bg" mode="widthFix"></image>
                <!-- 已购卡片 -->
                <view v-if="homeInfo?.holdingQuantity" class="haveBoughtCard"
                    @click="toPage('/pages/SocialSecurityFundPage/myFundList')">
                    <image src="/static/SocialSecurityFund/haveBought.png" class="haveBought-bg" mode="heightFix">
                    </image>
                    <view class="top_box">
                        <view class="text">Estimated Revenue</view>
                        <view class="text">All products →</view>
                    </view>
                    <view class="earnings text">
                        {{ homeInfo?.estimatedRevenue }}
                        <text class="hero-stat-unit text">{{ currency }}</text>
                    </view>
                    <view class="card_two">
                        <view class="card_two_item">
                            <view class="card_two_label">Deposit Amount</view>
                            <view class="card_two_value">
                                {{ homeInfo?.depositAmount }}
                                <text>{{ currency }}</text>
                            </view>
                        </view>
                        <view class="card_two_item">
                            <view class="card_two_label">Purchase cost</view>
                            <view class="card_two_value">
                                {{ homeInfo?.purchaseCost }}
                                <text>{{ currency }}</text>
                            </view>
                        </view>
                        <view class="card_two_item">
                            <view class="card_two_label">Holding Quantity</view>
                            <view class="card_two_value">
                                {{ homeInfo?.holdingQuantity }}
                            </view>
                        </view>
                    </view>
                </view>
                <view class="hero-stats">
                    <view class="hero-stat-card">
                        <view class="hero-stat-main">{{ userInfo.levelName || 'V0' }}</view>
                    </view>
                    <view class="hero-stat-card">
                        <view class="hero-stat-main">
                            {{ formatPlainValue(configInfo.validDays) }}
                            <text class="hero-stat-unit">Days</text>
                        </view>
                    </view>
                    <view class="hero-stat-card">
                        <view class="hero-stat-main">
                            {{ formatPlainValue(configInfo.rebateCycleDays) }}
                            <text class="hero-stat-unit">Days</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="fund-panel">
                <view class="fund-card" v-for="item in displayFundList" :key="item.id">
                    <view class="fund-title">{{ item.title }}</view>
                    <view class="fund-metrics">
                        <view class="fund-metric" v-for="metric in item.metrics" :key="metric.label">
                            <view class="fund-metric-value" :class="{ 'is-rebate': metric.isRebate }">
                                <text class="fund-metric-num">{{ metric.value }}</text>
                                <text class="fund-metric-unit">{{ metric.unit }}</text>
                            </view>
                            <view class="fund-metric-label">{{ metric.label }}</view>
                        </view>
                    </view>
                    <view class="fund-action" :class="item.statusClass" @click="handleFundClick(item)">
                        {{ item.buttonText }}
                    </view>
                </view>
            </view>
        </view>

        <view class="purchase-modal-mask" v-if="purchaseModal.visible" @click="closePurchaseModal">
            <view class="purchase-modal" @click.stop>
                <view class="purchase-modal-title">Confirm Purchase</view>
                <view class="purchase-modal-content">
                    Are you sure you want to spend {{ purchaseModal.amount }} {{ currency }} to buy
                    {{ purchaseModal.title }}?
                </view>
                <view class="purchase-modal-actions">
                    <view class="purchase-modal-btn is-cancel" @click="closePurchaseModal">Cancel</view>
                    <view class="purchase-modal-btn is-confirm" @click="confirmPurchase">
                        {{ purchasing ? 'Loading...' : 'Confirm' }}
                    </view>
                </view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    shebaoFundOverviewApi,
    shebaoFundOrderApi,
    shebaoFundHomeApi,
    shebaoFundConfigApi
} from "@/common/api/SocialSecurityFund.js";
export default {
    components: {
        customnavbar,
    },
    data() {
        return {
            userInfo: {},
            currency: '',
            topStyle2: '',
            overview: {
                currentVipLevel: '',
                buyableRange: '',
                fundStatusList: []
            },
            configInfo: {
                activitySwitch: 0,
                validDays: 365,
                rebateCycleDays: 30,
                ruleContent: '',
                fundList: []
            },
            purchaseModal: {
                visible: false,
                amount: '0',
                title: ''
            },
            selectedFund: null,
            purchasing: false,
            homeInfo: {}
        }
    },
    computed: {
        displayFundList() {
            const statusMap = (this.overview.fundStatusList || []).reduce((map, item) => {
                map[item.fundId] = item
                return map
            }, {})
            return (this.configInfo.fundList || []).map(item => {
                const statusInfo = statusMap[item.id] || {}
                const mergedItem = {
                    ...item,
                    ...statusInfo,
                    metrics: [
                        {
                            label: 'Level Amount',
                            value: this.formatNumber(item.depositAmount),
                            unit: this.currency
                        },
                        {
                            label: 'Purchase cost',
                            value: this.formatNumber(item.buyAmount),
                            unit: this.currency
                        },
                        {
                            label: 'Periodic rebate',
                            value: '30',
                            unit: 'Days',
                            isRebate: true
                        }
                    ]
                }
                return {
                    ...mergedItem,
                    buttonText: this.getButtonText(mergedItem),
                    statusClass: this.getStatusClass(mergedItem)
                }
            })
        }
    },
    methods: {
        getList() {
            shebaoFundConfigApi().then(res => {
                const data = res.data || {}
                if (!data.activitySwitch) {
                    uni.navigateBack()
                    return
                }
                this.configInfo = {
                    activitySwitch: data.activitySwitch,
                    validDays: data.validDays,
                    rebateCycleDays: data.rebateCycleDays,
                    ruleContent: data.ruleContent,
                    fundList: Array.isArray(data.fundList) ? data.fundList : []
                }
                if (data.ruleContent) {
                    uni.setStorageSync('SocialSecurityFundRule', data.ruleContent)
                    uni.setStorageSync('SocialSecurityFundRuleDescription', data.ruleContent)
                }
            })
            shebaoFundOverviewApi().then(res => {
                const data = res.data || {}
                this.overview = {
                    currentVipLevel: data.currentVipLevel,
                    buyableRange: data.buyableRange,
                    fundStatusList: Array.isArray(data.fundStatusList) ? data.fundStatusList : []
                }
            })
        },
        // 已购买统计
        getShebaoFundHome() {
            shebaoFundHomeApi().then(res => {
                this.homeInfo = res.data
            })
        },
        getUserInfo() {
            this.userInfo = uni.getStorageSync('userInfo')
        },
        formatTitle(item) {
            if (item.vipLevel) {
                return `${item.vipLevel} | Social Security Fund`
            }
            if (item.title) {
                const levelMatch = String(item.title).match(/V\d+/)
                return `${levelMatch ? levelMatch[0] : ''} | Social Security Fund`
            }
            return 'Social Security Fund'
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
                maximumFractionDigits: 4
            })
        },
        formatPlainValue(value) {
            return value || '0'
        },
        canPurchase(item) {
            return !!item && (item.canBuy || item.purchaseStatus === 2)
        },
        getButtonText(item) {
            if (item.canBuy) return 'Buy Now'
            if (item.purchaseStatus === 1) return 'Purchased'
            if (item.purchaseStatus === 2) return 'Buy Now'
            if (item.purchaseStatus === 3) return 'Level not reached'
            if (item.purchaseStatus === 4) return 'Unavailable'
            return 'Unavailable'
        },
        getStatusClass(item) {
            if (this.canPurchase(item)) return 'is-active'
            if (item.purchaseStatus === 1) return 'is-purchased'
            return 'is-disabled'
        },
        handleFundClick(item) {
            if (!this.canPurchase(item)) return
            this.selectedFund = item
            this.purchaseModal = {
                visible: true,
                amount: this.formatNumber(item.buyAmount),
                title: item.title || this.formatTitle(item)
            }
        },
        closePurchaseModal() {
            if (this.purchasing) return
            this.purchaseModal.visible = false
            this.selectedFund = null
        },
        confirmPurchase() {
            if (!this.selectedFund || this.purchasing) return
            this.purchasing = true
            shebaoFundOrderApi({
                fundId: this.selectedFund.id
            }).then(() => {
                this.$showMessage('info', 'Purchase successful');
                this.getList()
                this.getShebaoFundHome()
            }).catch((err) => {
                this.$showMessage('warning', err.msg);
            }).finally(() => {
                this.purchasing = false
                this.closePurchaseModal()
            })
        },
        toPage(url) {
            uni.navigateTo({
                url
            })
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle2 = `min-height:calc(100vh - ${e - 88.1}rpx + 168rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = `min-height:calc(100vh + 168rpx);`
            // #endif
        }
    },
    onShow() {
        this.getUserInfo()
        this.getList()
        this.getShebaoFundHome()
        this.currency = uni.getStorageSync('settings').currency
    }
}
</script>

<style lang="scss" scoped>
* {
    font-family: MiSans;
}

.social-security-fund-page {
    position: relative;
    margin-top: -168rpx;
    background-color: #051230;
    overflow: hidden;
}

.hero {
    position: relative;
}

.hero-bg {
    width: 100%;
    display: block;
}

.haveBoughtCard {
    box-sizing: border-box;
    position: absolute;
    left: 0;
    bottom: 216rpx;
    width: 100vw;
    height: 308rpx;
    padding: 32rpx 64rpx;

    .haveBought-bg {
        box-sizing: border-box;
        position: absolute;
        left: 0;
        top: 0;
        height: 308rpx;
        margin: 0 30rpx;
        z-index: 0;
    }

    .top_box {
        position: relative;
        display: flex;
        justify-content: space-between;
        color: #FFFFFF;
        margin-bottom: 8rpx;

        .text {
            font-size: 28rpx;
        }
    }

    .earnings {
        position: relative;
        font-size: 48rpx;
        background: linear-gradient(180deg, #ffb33d 0%, #ffffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;

        .hero-stat-unit {
            font-size: 28rpx;
            margin-left: 0;
        }
    }

    .text {
        font-family: DingTalk JinBuTi;
    }

    .card_two {
        position: relative;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18rpx;
        margin-top: 18rpx;
        padding: 24rpx;
        border-radius: 12rpx;
        background: rgba(30, 45, 103, .92);
    }

    .card_two_item {
        min-width: 0;
    }

    .card_two_label {
        font-size: 24rpx;
        font-weight: 400;
        color: rgba(255, 239, 214, .7);
        white-space: nowrap;
    }

    .card_two_value {
        margin-top: 16rpx;
        font-size: 36rpx;
        line-height: 40rpx;
        font-weight: 600;
        color: #FFFFFF;
        white-space: nowrap;

        text {
            font-size: 24rpx;
            line-height: 30rpx;
            font-weight: 500;
            color: #FFFFFF;
        }
    }
}

.hero-stats {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    bottom: 66rpx;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
    padding: 0 22rpx 0 44rpx;
}

.hero-stat-main {
    font-size: 32rpx;
    line-height: 32rpx;
    font-weight: 500;
    color: #FFFFFF;
}

.hero-stat-unit {
    margin-left: 8rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    font-weight: 400;
}

.fund-panel {
    // margin-top: 26rpx;
    padding: 0 30rpx 36rpx;
    background: transparent;
    transform: translateY(-24rpx);
}

.fund-card {
    margin: 0 0 26rpx;
    padding: 30rpx 24rpx 24rpx;
    // border: 1rpx solid rgba(255, 255, 255, .72);
    // border-radius: 26rpx;
    // background: #0A1A57;
    // box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, .12);
    background: url('/static/SocialSecurityFund/card_bgi.png') no-repeat center / 100% 100%;
}

.fund-card:last-child {
    margin-bottom: 0;
}

.fund-title {
    font-size: 32rpx;
    line-height: 32rpx;
    font-weight: 600;
    color: #FFFFFF;
}

.fund-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18rpx;
    margin-top: 22rpx;
}

.fund-metric {
    min-width: 0;
}

.fund-metric-value {
    display: flex;
    align-items: flex-end;
    color: #FFFFFF;
}

.fund-metric-value.is-rebate {
    color: #FF1212;
}

.fund-metric-num {
    font-size: 36rpx;
    line-height: 44rpx;
    font-weight: 600;
}

.fund-metric-unit {
    margin-left: 8rpx;
    font-size: 24rpx;
    line-height: 30rpx;
    font-weight: 600;
    color: inherit;
}

.fund-metric-label {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: rgba(255, 255, 255, .45);
}

.fund-action {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 68rpx;
    margin-top: 26rpx;
    border-radius: 16rpx;
    font-size: 32rpx;
    line-height: 32rpx;
    font-weight: 400;
}

.fund-action.is-purchased,
.fund-action.is-disabled {
    background: #9F9F9F;
    color: #FFFFFF;
}

.fund-action.is-purchased {
    color: #fff;
    background: #003779;
}

.fund-action.is-active {
    background: linear-gradient(180deg, #1F71F2 0%, #1765DD 100%);
    color: #FFFFFF;
}

.purchase-modal-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 48rpx;
    background: rgba(0, 10, 34, .72);
}

.purchase-modal {
    width: 100%;
    padding: 34rpx 30rpx 30rpx;
    border: 1rpx solid rgba(107, 174, 255, .5);
    border-radius: 12rpx;
    background: linear-gradient(180deg, #102E7A 0%, #07173D 100%);
    box-shadow: 0 18rpx 60rpx rgba(0, 0, 0, .42), inset 0 1rpx 0 rgba(255, 255, 255, .12);
}

.purchase-modal-title {
    font-size: 34rpx;
    line-height: 42rpx;
    font-weight: 600;
    text-align: center;
    color: #FFFFFF;
}

.purchase-modal-content {
    margin-top: 22rpx;
    font-size: 26rpx;
    line-height: 38rpx;
    text-align: center;
    color: rgba(255, 255, 255, .9);
}

.purchase-modal-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
    margin-top: 32rpx;
}

.purchase-modal-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 74rpx;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: 500;
}

.purchase-modal-btn.is-cancel {
    border: 1rpx solid rgba(255, 255, 255, .24);
    background: rgba(255, 255, 255, .08);
    color: #D9E6FF;
}

.purchase-modal-btn.is-confirm {
    background: linear-gradient(180deg, #1F71F2 0%, #1765DD 100%);
    color: #FFFFFF;
}
</style>
