<template>
    <view class="page">
        <homenavbar backgroundStr="''" :showBack="false" :isHome="true" @mtop="mtop">
            <view class="hero" :style="topStyle"></view>
            <view class="content">
                <view class="quick-links">
                    <view class="quick-link">
                        <image src="/static/finance/tag1.png" mode="aspectFit"></image>
                        <view><text>Certificate</text><small>Go Check→</small></view>
                    </view>
                    <view class="quick-link">
                        <image src="/static/finance/tag2.png" mode="aspectFit"></image>
                        <view><text>My Investment</text><small>Go Check→</small></view>
                    </view>
                </view>
                <view class="account-card">
                    <text class="account-label">购买产品总额(本金)</text>
                    <view class="account-total">12,860.48 <text>{{ currency }} FOX</text></view>
                    <view class="balance-row">
                        <view><text>今日</text><b>+82.00 FOX</b></view>
                        <view><text>本月</text><b>+82.00 FOX</b></view>
                        <view><text>总收益</text><b>5,888.00 FOX</b></view>
                    </view>
                </view>
                <image class="banner" src="/static/finance/banner.png" mode="widthFix"></image>
                <view class="toolbar">
                    <view class="tool" @click="toggleFilter">
                        <image src="/static/finance/Filter.png"></image>Filter
                    </view>
                    <view class="tool" @click="toggleSort">
                        <image src="/static/finance/Sort.png"></image>Sort
                    </view>
                    <view class="tool category" @click="toggleCategory">All Categories</view>
                </view>
                <view v-for="(item, index) in products" :key="index" class="product-card"
                    :class="'category-' + item.category" @click="toDetails">
                    <view class="product-head">
                        <view class="brand">
                            <view class="nikon">Nikon</view><text>Nikon</text>
                        </view><text class="category-name">● Category {{ item.category }}</text>
                    </view>
                    <view class="details">
                        <view><text>Limit per operation</text><b>50,00FOX - 5000,00FOX</b></view>
                        <view><text>Purchase Limit</text><b>1</b></view>
                        <view><text>Daily performance</text><b>5%</b></view>
                        <view><text>Investment Term</text><b>3 days</b></view>
                        <view><text>Purchase Level</text><b>No limit</b></view>
                    </view>
                    <view class="view-details">View Details→</view>
                </view>
            </view>
        </homenavbar>
    </view>
    <BalanceProductPopup :visible="showTeamExplain" @close="showTeamExplain = false" />
</template>

<script>
import BalanceProductPopup from '@/components/BalanceProductPopup/index.vue';
import homenavbar from '@/component/home-navbar/home-navbar.vue'
export default {
    components: {
        homenavbar,
        BalanceProductPopup
    },
    data() {
        return {
            showTeamExplain: false,
            currency: '',
            topStyle: '',
            products: [
                {
                    category: 1
                },
                {
                    category: 2
                },
                {
                    category: 2
                }]
        }
    },
    methods: {
        mtop(height) { this.topStyle = `margin-top:-${height}rpx;padding-top:${height + 88}rpx` },
        toggleFilter() { },
        toggleSort() { },
        toggleCategory() { },
        toDetails() {
            // uni.navigateTo({ url: '/pages/HomePage/financeDetails' })
            this.showTeamExplain = true
        }
    },
    mounted() { this.currency = uni.getStorageSync('settings').currency || '' }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
    font-family: 'MiSans';
}

.page {
    min-height: 100vh;
    background: #f2f4fd;
}

.hero {
    position: absolute;
    top: 0;
    width: 100%;
    height: 1076rpx;
    background: radial-gradient(circle at 0% 0%, #69d6ec 0%, rgba(105, 214, 236, .55) 34%, transparent 62%), radial-gradient(circle at 100% 0%, #3aaff5 0%, rgba(58, 175, 245, .55) 36%, transparent 65%), radial-gradient(circle at 50% 45%, rgba(245, 248, 255, .9) 0%, rgba(245, 248, 255, .25) 42%, transparent 72%), linear-gradient(180deg, #b9e9f3 0%, rgba(234, 246, 248, .8) 55%, rgba(244, 245, 251, 0) 100%);
}

.content {
    position: relative;
    z-index: 1;
    padding: 24rpx 24rpx 140rpx;
}

.quick-links {
    display: flex;
    gap: 14rpx;
    margin-bottom: 24rpx;
}

.quick-link {
    display: flex;
    align-items: center;
    width: 50%;
    height: 102rpx;
    padding: 8rpx 18rpx;
    border-radius: 18rpx;
    background: #fff;
}

.quick-link image {
    width: 82rpx;
    height: 90rpx;
    margin-right: 12rpx;
}

.quick-link text,
.quick-link small {
    display: block;
    white-space: nowrap;
}

.quick-link text {
    font-size: 26rpx;
    font-weight: 700;
}

.quick-link small {
    margin-top: 8rpx;
    color: #aab3c5;
    font-size: 19rpx;
}

.account-card {
    height: 292rpx;
    padding: 28rpx 24rpx;
    border-radius: 12rpx;
    color: #fff;
    background: $themeColor;
    margin-bottom: 16rpx;
}

.account-label {
    color: #c9d7ff;
    font-size: 23rpx;
}

.account-total {
    margin-top: 12rpx;
    font-size: 64rpx;
    line-height: 78rpx;
    font-weight: 700;
    white-space: nowrap;
}

.account-total text {
    font-size: 30rpx;
    font-weight: 400;
}

.balance-row {
    display: flex;
    justify-content: space-between;
    margin-top: 22rpx;
}

.balance-row view {
    width: 33.3%;
}

.balance-row text,
.balance-row b {
    display: block;
    white-space: nowrap;
}

.balance-row text {
    color: #c9d7ff;
    font-size: 22rpx;
}

.balance-row b {
    margin-top: 12rpx;
    font-size: 26rpx;
}

.banner {
    display: block;
    width: 100%;
    margin-bottom: 32rpx;
    border-radius: 12rpx;
    box-shadow: 0px 8rpx 20rpx 0px rgba(64, 195, 255, 0.3);
}

.toolbar {
    display: flex;
    gap: 22rpx;
    margin-bottom: 30rpx;
}

.tool {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 74rpx;
    min-width: 184rpx;
    padding: 0 26rpx;
    border: 2rpx solid #d7d7d7;
    border-radius: 40rpx;
    background: #fff;
    color: #444;
    font-size: 27rpx;
}

.tool image {
    width: 34rpx;
    height: 34rpx;
    margin-right: 14rpx;
}

.tool.category {
    flex: 1;
    min-width: 0;
}

.product-card {
    margin-bottom: 24rpx;
    padding: 28rpx 32rpx 24rpx;
    border-radius: 12rpx;
    background: linear-gradient(180deg, #ddfff5 0%, #fff 46%);
}

.category-2 {
    background: linear-gradient(180deg, #fff4e5 0%, #fff 46%);
}

.product-card:nth-of-type(6) {
    background: linear-gradient(180deg, #e1e6f9 0%, #fff 46%);
}

.product-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    display: flex;
    align-items: center;
    gap: 22rpx;
}

.brand text {
    font-size: 31rpx;
    font-weight: 700;
}

.nikon {
    width: 52rpx;
    height: 52rpx;
    padding-top: 30rpx;
    background: #ffe500;
    color: #111;
    font-size: 12rpx;
    font-weight: 700;
    text-align: center;
    transform: skew(-8deg);
}

.category-name {
    color: #16bd50;
    font-size: 23rpx;
    font-weight: 700;
}

.category-2 .category-name {
    color: #eb9711;
}

.details {
    margin-top: 28rpx;
}

.details>view {
    display: flex;
    align-items: center;
    min-height: 52rpx;
    color: #4b4b4b;
    font-size: 23rpx;
}

.details text {
    flex: 1;
}

.details b {
    font-size: 24rpx;
    white-space: nowrap;
}

.view-details {
    margin-top: 22rpx;
    color: #2874ff;
    font-size: 27rpx;
    text-align: center;
}
</style>
