<template>
    <view v-if="visible" class="box" :style="topStyle2" @click="handleClose">
        <view class="main" @click.stop>
            <view class="scroll">
                <view class="header">
                    <view class="back" @click="handleClose"></view>
                    <view class="header-title">Product Details</view>
                </view>

                <view class="divider"></view>

                <view class="product-row">
                    <view class="brand-wrap">
                        <view class="brand-logo">
                            <text class="brand-logo-text">Nikon</text>
                        </view>
                        <view class="brand-info">
                            <view class="brand-name">Nikon</view>
                            <view class="balance">Available balance: PEN 4.00</view>
                        </view>
                    </view>
                    <view class="rate-badge">Daily:+8.8%</view>
                </view>

                <view class="input-card">
                    <view class="currency">FOX</view>
                    <input class="placeholder" type="digit" v-model="purchaseQuantity"
                        placeholder="Fill in the purchase quantity" />
                    <view class="available-box">
                        <view class="available-label">Available</view>
                        <view class="available-value">8252.00</view>
                    </view>
                </view>

                <view class="stats-card">
                    <view class="stat-item">
                        <view class="stat-label">Daily earnings</view>
                        <view class="stat-value primary">8.00%</view>
                    </view>
                    <view class="stat-item">
                        <view class="stat-label">Daily income</view>
                        <view v-if="hasPurchaseQuantity" class="stat-value primary">{{ dailyIncome }} FOX</view>
                        <view v-else class="stat-value muted">Real-time</view>
                    </view>
                    <view class="stat-item">
                        <view class="stat-label">Total Revenue</view>
                        <view v-if="hasPurchaseQuantity" class="stat-value primary">{{ totalRevenue }} FOX</view>
                        <view v-else class="stat-value muted">Real-time</view>
                    </view>
                </view>

                <view class="notice-card">
                    This purchase will only be deducted from the internal fund task balance.
                </view>

                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">Limit per operation</text>
                        <text class="info-value">50,00FOX - 5000,00FOX</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">Purchase Limit</text>
                        <text class="info-value">1</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">Daily performance</text>
                        <text class="info-value">5%</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">Investment Term</text>
                        <text class="info-value">3 days</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">Purchase Level</text>
                        <text class="info-value">No limit</text>
                    </view>
                </view>

                <view class="team-card">
                    <view class="team-title">Team Incentives</view>
                    <view class="team-grid">
                        <view class="team-item">
                            <view class="team-grade">Grade A</view>
                            <view class="team-rate">8.00%</view>
                        </view>
                        <view class="team-item">
                            <view class="team-grade">Grade B</view>
                            <view class="team-rate">8.00%</view>
                        </view>
                        <view class="team-item">
                            <view class="team-grade">Grade C</view>
                            <view class="team-rate">8.00%</view>
                        </view>
                    </view>
                </view>

                <view class="btn_box">
                    <view class="btn">Confirm Purchase</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
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
            purchaseQuantity: '',
            dailyEarningsRate: 0.08,
            investmentDays: 3
        }
    },
    computed: {
        hasPurchaseQuantity() {
            return Number(this.purchaseQuantity) > 0
        },
        dailyIncome() {
            const quantity = Number(this.purchaseQuantity) || 0
            return (quantity * this.dailyEarningsRate).toFixed(2)
        },
        totalRevenue() {
            return (Number(this.dailyIncome) * this.investmentDays).toFixed(2)
        }
    },
    methods: {
        handleClose() {
            this.$emit('close')
        },
        mtop() {
            let statusBarHeight = 0
            let navBarHeight = 88
            // #ifdef APP-PLUS
            const sys = uni.getSystemInfoSync()
            statusBarHeight = sys.statusBarHeight
            navBarHeight = sys.platform === 'android' ? 96 : 88
            // #endif

            // #ifdef H5
            statusBarHeight = 0
            navBarHeight = 88
            // #endif

            let mtopValue = 0
            uni.getSystemInfo({
                success: () => {
                    mtopValue = statusBarHeight / 2 + navBarHeight
                },
            })
            // #ifdef H5
            this.topStyle2 = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = 'height:calc(100vh);'
            // #endif
        }
    },
    mounted() {
        this.mtop()
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
    align-items: flex-end;
}

.main {
    width: 100vw;
    max-height: 79vh;
    border-radius: 28rpx 28rpx 0 0;
    background: #fff;
    overflow: hidden;
}

.scroll {
    max-height: 79vh;
    overflow-y: auto;
}

.header {
    display: flex;
    align-items: center;
    padding: 36rpx 24rpx;
}

.back {
    width: 46rpx;
    height: 46rpx;
    margin-right: 10rpx;
    position: relative;
}

.back::before {
    content: '';
    position: absolute;
    left: 12rpx;
    top: 9rpx;
    width: 22rpx;
    height: 22rpx;
    border-left: 6rpx solid #111;
    border-bottom: 6rpx solid #111;
    transform: rotate(45deg);
}

/* #ifdef H5 */
.back::after {
    content: '';
    position: absolute;
    left: 15rpx;
    top: 21rpx;
    width: 24rpx;
    height: 6rpx;
    background: #111;
    border-radius: 6rpx;
}

/* #endif */

/* #ifndef H5 */
.back-icon {
    font-size: 60rpx;
    line-height: 1;
    color: #111;
    margin-top: -6rpx;
}

/* #endif */

.header-title {
    font-size: 42rpx;
    line-height: 1.2;
    font-weight: 600;
    color: #111;
}

.divider {
    height: 2rpx;
    margin: 0 0 28rpx;
    background: #eceff4;
}

.product-row,
.input-card,
.stats-card,
.notice-card,
.info-list,
.team-card {
    margin: 0 28rpx 20rpx;
}

.product-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.brand-wrap {
    display: flex;
    align-items: center;
    min-width: 0;
}

.brand-logo {
    width: 136rpx;
    height: 136rpx;
    flex: 0 0 auto;
    border-radius: 8rpx;
    background: linear-gradient(135deg, #ffd400 0%, #ffe65b 42%, #ffcf00 100%);
    overflow: hidden;
    position: relative;
}

.brand-logo::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(150deg, rgba(255, 255, 255, 0.95) 0 6rpx, rgba(255, 255, 255, 0) 6rpx 18rpx);
    opacity: 0.95;
}

.brand-logo-text {
    position: absolute;
    left: 10rpx;
    bottom: 10rpx;
    z-index: 1;
    font-size: 28rpx;
    font-weight: 700;
    font-style: italic;
    color: #111;
}

.brand-info {
    min-width: 0;
    margin-left: 22rpx;
}

.brand-name {
    font-size: 50rpx;
    line-height: 1.1;
    font-weight: 700;
    color: #111;
}

.balance {
    margin-top: 16rpx;
    font-size: 31rpx;
    line-height: 1.2;
    color: #555;
}

.rate-badge {
    margin-top: 16rpx;
    padding: 10rpx 24rpx;
    border-radius: 999rpx;
    background: #e7f6eb;
    color: #1aa43b;
    font-size: 30rpx;
    line-height: 1;
    white-space: nowrap;
}

.input-card {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 102rpx;
    padding: 12rpx 18rpx;
    border: 2rpx solid #d5e0ff;
    border-radius: 16rpx;
    background: #f7faff;
}

.currency {
    flex: 0 0 auto;
    font-size: 36rpx;
    font-weight: bold;
    line-height: 1;
    color: #000;
}

::v-deep .input-placeholder {
    font-size: 24rpx;
    color: #a9a9ad;
}

::v-deep .uni-input-input {
    color: #000;
}

.placeholder {
    flex: 1;
    min-width: 0;
    padding-left: 18rpx;
    height: 72rpx;
    font-size: 31rpx;
    line-height: 1.2;
    color: #d8d8d8;
}

.available-box {
    flex: 0 0 auto;
    margin-left: 16rpx;
    padding: 8rpx 24rpx;
    border-radius: 12rpx;
    background: rgba(255, 255, 255, 0.92);
    text-align: center;
}

.available-label {
    font-family: MiSans;
    font-size: 20rpx;
    line-height: 1.2;
    color: #7f8187;
}

.available-value {
    margin-top: 4rpx;
    font-family: MiSans;
    font-size: 24rpx;
    line-height: 1.1;
    font-weight: 700;
    color: $themeColor;
}

.stats-card {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8rpx;
    padding: 14rpx;
    border: 2rpx solid #d5e0ff;
    border-radius: 16rpx;
    background: #f7faff;
}

.stat-item {
    min-width: 0;
    min-height: 120rpx;
    padding: 18rpx 8rpx 14rpx;
    border-radius: 12rpx;
    background: rgba(255, 255, 255, 0.95);
    text-align: center;
}

.stat-label {
    font-size: 26rpx;
    line-height: 1.2;
    color: #7a7a7a;
}

.stat-value {
    margin-top: 14rpx;
    font-size: 34rpx;
    line-height: 1.1;
    font-weight: 700;
}

.stat-value.primary {
    color: $themeColor;
}

.stat-value.muted {
    color: #ced9f7;
}

.notice-card {
    padding: 18rpx 24rpx;
    border: 2rpx solid #d5e0ff;
    border-radius: 16rpx;
    background: #f7faff;
    color: #a9a9ad;
    font-size: 28rpx;
    line-height: 1.45;
}

.info-list {
    border: 2rpx solid #d9d9d9;
    border-radius: 16rpx;
    background: #fff;
    overflow: hidden;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 96rpx;
    padding: 0 26rpx;
    border-bottom: 2rpx solid #eaeaea;
}

.info-row:last-child {
    border-bottom: 0;
}

.info-label {
    font-size: 30rpx;
    line-height: 1.2;
    color: #444;
}

.info-value {
    max-width: 54%;
    font-size: 30rpx;
    line-height: 1.2;
    font-weight: 700;
    color: #333;
    text-align: right;
}

.team-card {
    padding: 18rpx 20rpx 20rpx;
    border-radius: 16rpx;
    background: #eaf3ff;
}

.team-title {
    margin-bottom: 14rpx;
    font-size: 32rpx;
    line-height: 1.2;
    font-weight: 700;
    color: #111;
}

.team-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
}

.team-item {
    min-height: 120rpx;
    padding: 16rpx 10rpx 12rpx;
    border-radius: 12rpx;
    background: #fff;
    text-align: center;
}

.team-grade {
    font-size: 26rpx;
    line-height: 1.2;
    color: #757575;
}

.team-rate {
    margin-top: 14rpx;
    font-size: 34rpx;
    line-height: 1.1;
    font-weight: 700;
    color: $themeColor;
}

.btn_box {
    padding: 10rpx 28rpx 28rpx;
}

.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 84rpx;
    border-radius: 12rpx;
    background: $themeColor;
    color: #fff;
    font-size: 34rpx;
    line-height: 1;
    font-weight: 700;
}
</style>
