<template>
    <homenavbar :title="pageTitle" backgroundStr="#004f56" @mtop="mtop" :whiteTitle="true">
        <view class="top-bg" :style="topStyle"></view>
        <view class="offline-funds-page">
            <view class="hero" :style="topStyle"></view>
            <view class="page-content">
                <view class="summary-card">
                    <view class="summary-item" v-for="item in summaryItems" :key="item.label">
                        <view class="summary-label">{{ item.label }}</view>
                        <view class="summary-value" :class="item.valueClass">
                            {{ item.value }}<text v-if="item.showCurrency" class="summary-currency">{{ currency
                                }}</text>
                        </view>
                    </view>
                </view>

                <!-- 申请类型 -->
                <view class="section_box">
                    <view class="section-title">{{ $t('offlineFunds.selectApplicationType') }}</view>
                    <view class="application-list">
                        <view class="application-card" v-for="item in applicationTypes" :key="item.id || item.type">
                            <view class="application-left_box">
                                <image :src="item.iconUrl" mode="aspectFill" v-if="item.iconUrl"
                                    class="application_img"></image>
                                <view class="application-copy">
                                    <view class="application-name">{{ item.name }}</view>
                                    <view class="application-description">{{ item.description }}</view>
                                </view>
                            </view>
                            <view class="apply-button" @click="applyFor(item)">{{ $t('offlineFunds.apply') }}</view>
                        </view>
                    </view>
                </view>

                <view class="record-card" @click="openRecords">
                    <view class="record-title">{{ $t('offlineFunds.applicationRecords') }}</view>
                    <view class="record-arrow"></view>
                </view>
                <!-- 申请记录 -->
                <view v-if="recentRecords.length" class="record-list-box">
                    <view class="record-item-card" v-for="item in recentRecords" :key="item.id">
                        <view class="application-left_box">
                            <image :src="item.iconUrl" mode="aspectFill" v-if="item.iconUrl" class="application_img">
                            </image>
                            <view class="application-copy">
                                <view class="record-item-top">
                                    <view class="application-name">{{ item.typeName || '--' }}</view>
                                    <view class="record-status" :class="getStatusMeta(item.status).className">
                                        {{ $t(getStatusMeta(item.status).labelKey) }}
                                    </view>
                                </view>
                                <view class="application-description">
                                    <view class="text">{{ $t('offlineFunds.applicationAmount') }}:</view>
                                    {{ formatAmount(item.amount) }} {{ currency }}
                                </view>
                                <view class="application-description">
                                    <view class="text">{{ $t('offlineFunds.time') }}:</view>
                                    {{ item.updateTime || '--' }}
                                </view>
                            </view>
                        </view>
                        <!-- 失败原因 -->
                        <view class="rejectReason_text" v-if="item.rejectReason && item.status === 20">
                            {{ $t('失败原因') }}: {{ item.rejectReason }}
                        </view>
                    </view>
                </view>
                <view v-else class="default_box">
                    <image src="/static/mine/applicationRecord/nullPositionManage.png" mode="" class="default_image">
                    </image>
                </view>
            </view>
        </view>
    </homenavbar>
</template>

<script>
import homenavbar from '@/component/home-navbar/home-navbar.vue';
import {
    offlinePayoutHomeApi,
    offlinePayoutRecordsApi
} from '@/common/api/OfflineFunds.js'
export default {
    components: { homenavbar },
    data() {
        return {
            pageTitle: '',
            topStyle: '',
            currency: '',
            i18nId: '',
            statistics: {
                pendingCount: 0,
                approvedAmount: '0',
                paidAmount: '0'
            },
            applicationTypes: [],
            recentRecords: [],
            recordsPage: {
                pageNum: 1,
                pageSize: 10
            },
            recordsLoading: false,
            recordsHasMore: true
        }
    },
    computed: {
        summaryItems() {
            return [
                { label: this.$t('offlineFunds.pending'), value: this.statistics.pendingCount, valueClass: 'is-pending' },
                { label: this.$t('offlineFunds.totalApproved'), value: this.formatAmount(this.statistics.approvedAmount) },
                { label: this.$t('offlineFunds.paid'), value: this.formatAmount(this.statistics.paidAmount), valueClass: 'is-paid', showCurrency: true }
            ]
        }
    },
    onLoad(options) {
        this.pageTitle = uni.getStorageSync('pageTitle') || options.title || this.$t('offlineFunds.title')
    },
    onShow() {
        this.currency = (uni.getStorageSync('settings') || {}).currency || ''
        this.getOfflinePayoutHome()
        this.resetOfflinePayoutRecords()
    },
    onReachBottom() {
        this.getOfflinePayoutRecords()
    },
    methods: {
        // 首页统计
        getOfflinePayoutHome() {
            offlinePayoutHomeApi().then(res => {
                if (!res || res.code !== 200 || !res.data) return

                const { i18nId = '', stat = {}, types = [] } = res.data
                this.i18nId = i18nId
                this.statistics = {
                    pendingCount: Number(stat.pendingCount) || 0,
                    approvedAmount: stat.approvedAmount || '0',
                    paidAmount: stat.paidAmount || '0'
                }
                this.applicationTypes = Array.isArray(types) ? types : []
            }).catch(() => {
                this.applicationTypes = []
            })
        },
        resetOfflinePayoutRecords() {
            this.recordsPage.pageNum = 1
            this.recordsHasMore = true
            this.recentRecords = []
            this.getOfflinePayoutRecords()
        },
        // 获取申请记录
        getOfflinePayoutRecords() {
            if (this.recordsLoading || !this.recordsHasMore) return

            this.recordsLoading = true
            offlinePayoutRecordsApi(this.recordsPage).then(res => {
                if (!res || res.code !== 200) return

                const data = res.data || {}
                const records = data.rows || []
                const rows = Array.isArray(records) ? records : []

                this.recentRecords = this.recordsPage.pageNum === 1
                    ? rows
                    : this.recentRecords.concat(rows)

                const total = Number(data.total)
                this.recordsHasMore = Number.isFinite(total)
                    ? this.recentRecords.length < total
                    : rows.length === this.recordsPage.pageSize

                if (this.recordsHasMore) this.recordsPage.pageNum += 1
            }).catch(() => {
                if (this.recordsPage.pageNum === 1) this.recentRecords = []
            }).finally(() => {
                this.recordsLoading = false
            })
        },
        mtop(height) {
            this.topStyle = `margin-top:-${height}rpx;padding-top:${height}rpx`
        },
        formatAmount(value) {
            return Number(value || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        },
        getStatusMeta(status) {
            const statusMap = {
                10: { className: 'is-pending-review', labelKey: 'offlineFunds.statusPendingReview' },
                20: { className: 'is-review-rejected', labelKey: 'offlineFunds.statusReviewRejected' },
                30: { className: 'is-pending-payout', labelKey: 'offlineFunds.statusPendingPayout' },
                40: { className: 'is-paying', labelKey: 'offlineFunds.statusPaying' },
                50: { className: 'is-paid', labelKey: 'offlineFunds.statusPaid' },
                60: { className: 'is-pay-failed', labelKey: 'offlineFunds.statusPayFailed' }
            }

            return statusMap[status] || statusMap[10]
        },
        applyFor(item) {
            const typeCode = encodeURIComponent(item.typeCode || '')
            const typeName = encodeURIComponent(item.name || '')
            uni.navigateTo({
                url: `/pages/OfflineFundsPage/applyForForm?typeCode=${typeCode}&typeName=${typeName}`
            })
        },
        openRecords() {
            this.$emit('open-records')
        }
    }
}
</script>

<style scoped lang="scss">
.default_box {
    display: flex;
    justify-content: center;

    .default_image {
        width: 466rpx;
        height: 466rpx;
    }
}

* {
    box-sizing: border-box;
    font-family: MiSans, PingFangSC, sans-serif;
}

.top-bg {
    position: absolute;
    top: 0;
    width: 100%;
    height: 676rpx;
    background: $themeColor;
    z-index: 1;
}

.offline-funds-page {
    position: relative;
    min-height: 100vh;
    padding-bottom: 48rpx;
    background: linear-gradient(180deg, #eaf5ff 0, #f4f7fc 520rpx, #f4f7fc 100%);
}

.hero {
    height: 300rpx;
    background: linear-gradient(145deg, #25b4f3 0%, #087bf2 100%);
}

.page-content {
    position: relative;
    z-index: 1;
    margin-top: -174rpx;
    padding: 0 26rpx;
}

.summary-card {
    background: #fff;
    box-shadow: 0 10rpx 28rpx rgba(53, 91, 135, 0.12);
}

.summary-card {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: center;
    min-height: 180rpx;
    border-radius: 12rpx;
}

.summary-item {
    min-width: 0;
    text-align: center;
}

.summary-label {
    font-size: 26rpx;
    line-height: 36rpx;
    color: #6d727a;
}

.summary-value {
    margin-top: 14rpx;
    font-size: 42rpx;
    font-weight: 700;
    line-height: 54rpx;
    color: #202733;
    word-break: break-all;
}

.summary-value.is-pending {
    color: #087bf2;
}

.summary-value.is-paid {
    color: #09ad54;
    transform: translateY(6rpx);
}

.summary-currency {
    margin-left: 8rpx;
    font-size: 20rpx;
    font-weight: 400;
    color: #6d727a;
}

.section_box {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-top: 24rpx;
}

.section-title {
    margin-bottom: 24rpx;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 46rpx;
    color: #111820;
}

.application-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.application-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    border-radius: 12rpx;
    background-color: #fcfeff;
    border: 2rpx solid #eaeaeb;
}

.application-left_box {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .application_img {
        width: 86rpx;
        min-width: 86rpx;
        height: 86rpx;
        border-radius: 50%;
    }

}

.rejectReason_text {
    color: #fd4e74;
}

.application-copy {
    min-width: 0;
    padding-right: 24rpx;
}

.application-name {
    font-size: 32rpx;
    font-weight: 700;
    line-height: 42rpx;
    color: #101820;
    word-break: break-all;
}

.application-description {
    margin-top: 8rpx;
    font-size: 25rpx;
    line-height: 34rpx;
    color: #737981;
}

.apply-button {
    flex: 0 0 auto;
    min-width: 136rpx;
    padding: 12rpx 24rpx;
    border-radius: 12rpx;
    background: $themeColor;
    font-size: 24rpx;
    font-weight: 700;
    line-height: 38rpx;
    text-align: center;
    color: #fff;
}

.record-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 28rpx;
}

.record-list-box {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    margin-top: 24rpx;

    .record-item-card {
        // display: flex;
        // align-items: start;
        // justify-content: space-between;
        padding: 24rpx;
        border-radius: 12rpx;
        background-color: #fff;

        .application-copy {
            flex: 1;
            padding-right: 0;
        }

        .record-item-top {
            display: flex;
            align-items: start;
            justify-content: space-between;
            gap: 18rpx;
        }

        .application-description {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .text {
                white-space: nowrap;
            }
        }

        .record-status {
            font-size: 26rpx;
            font-weight: bold;
            border-radius: 2026rpx;
            white-space: nowrap;

            &.is-pending-review,
            &.is-paying {
                color: #439eee;
            }

            &.is-pending-payout {
                color: #fcaa26;
            }

            &.is-paid {
                color: #26b67d;
            }

            &.is-review-rejected,
            &.is-pay-failed {
                color: #fd4e74;
            }
        }
    }
}

.record-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #111820;
}

.record-arrow {
    width: 18rpx;
    height: 18rpx;
    border-top: 3rpx solid #000;
    border-right: 3rpx solid #000;
    transform: rotate(45deg);
}
</style>
