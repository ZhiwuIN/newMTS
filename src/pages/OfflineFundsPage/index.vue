<template>
    <customnavbar :title="pageTitle" backgroundStr="#004f56" @mtop="mtop" :whiteTitle="true">
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
                        <view class="application-card" v-for="item in applicationTypes" :key="item.type">
                            <view class="application-left_box">
                                <image src="/static/appDownload/111.png" mode="" class="application_img"></image>
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
                <view class="record-list-box">
                    <view class="record-item-card" v-for="item in applicationTypes" :key="item.type">
                        <view class="application-left_box">
                            <image src="/static/appDownload/111.png" mode="" class="application_img"></image>
                            <view class="application-copy">
                                <view class="record-item-top">
                                    <view class="application-name">{{ item.name }}</view>
                                    <view class="record-status" :class="getStatusMeta(item.status).className">
                                        {{ $t(getStatusMeta(item.status).labelKey) }}
                                    </view>
                                </view>
                                <view class="application-description">
                                    <view class="text">{{ $t('offlineFunds.applicationAmount') }}:</view>
                                    {{ item.description }}
                                </view>
                                <view class="application-description">
                                    <view class="text">{{ $t('offlineFunds.time') }}:</view>
                                    {{ item.description }}
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'

export default {
    components: { customnavbar },
    data() {
        return {
            pageTitle: '',
            topStyle: '',
            currency: '',
            statistics: { pending: 2, approved: 1500, paid: 800 }
        }
    },
    computed: {
        summaryItems() {
            return [
                { label: this.$t('offlineFunds.pending'), value: this.statistics.pending, valueClass: 'is-pending' },
                { label: this.$t('offlineFunds.totalApproved'), value: this.formatAmount(this.statistics.approved) },
                { label: this.$t('offlineFunds.paid'), value: this.formatAmount(this.statistics.paid), valueClass: 'is-paid', showCurrency: true }
            ]
        },
        applicationTypes() {
            return [
                { type: 'charity', name: this.$t('offlineFunds.charity'), description: this.$t('offlineFunds.charityDescription') },
                { type: 'meeting', name: this.$t('offlineFunds.teamMeeting'), description: this.$t('offlineFunds.teamMeetingDescription') },
                { type: 'other', name: this.$t('offlineFunds.other'), description: this.$t('offlineFunds.otherDescription') }
            ]
        }
    },
    onLoad(options) {
        this.pageTitle = uni.getStorageSync('pageTitle') || options.title || this.$t('offlineFunds.title')
    },
    onShow() {
        this.currency = (uni.getStorageSync('settings') || {}).currency || ''
    },
    methods: {
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
                0: { className: 'is-applying', labelKey: 'offlineFunds.statusApplying' },
                1: { className: 'is-approved', labelKey: 'offlineFunds.statusApproved' },
                2: { className: 'is-completed', labelKey: 'offlineFunds.statusCompleted' },
                3: { className: 'is-rejected', labelKey: 'offlineFunds.statusRejected' },
                applying: { className: 'is-applying', labelKey: 'offlineFunds.statusApplying' },
                pending: { className: 'is-applying', labelKey: 'offlineFunds.statusApplying' },
                approved: { className: 'is-approved', labelKey: 'offlineFunds.statusApproved' },
                completed: { className: 'is-completed', labelKey: 'offlineFunds.statusCompleted' },
                rejected: { className: 'is-rejected', labelKey: 'offlineFunds.statusRejected' },
                '申请中': { className: 'is-applying', labelKey: 'offlineFunds.statusApplying' },
                '已批准': { className: 'is-approved', labelKey: 'offlineFunds.statusApproved' },
                '已完成': { className: 'is-completed', labelKey: 'offlineFunds.statusCompleted' },
                '已拒绝': { className: 'is-rejected', labelKey: 'offlineFunds.statusRejected' }
            }

            return statusMap[status] || statusMap.pending
        },
        applyFor(item) {
            uni.navigateTo({
                url: '/pages/OfflineFundsPage/applyForForm'
            })
        },
        openRecords() {
            this.$emit('open-records')
        }
    }
}
</script>

<style scoped lang="scss">
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

.application-copy {
    min-width: 0;
    padding-right: 24rpx;
}

.application-name {
    font-size: 32rpx;
    font-weight: 700;
    line-height: 42rpx;
    color: #101820;
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

            &.is-applying {
                color: #439eee;
            }

            &.is-approved {
                color: #fcaa26;
            }

            &.is-completed {
                color: #26b67d;
            }

            &.is-rejected {
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
