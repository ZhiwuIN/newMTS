<template>
    <customnavbar title="Reward history" @mtop="mtop" backgroundStr="#fff5e0">
        <view class="record-page">
            <view class="record-content" :style="topStyle">
                <scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
                    @scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
                    class="scroll-view-box list">
                    <view class="record-item" v-for="item in billsList" :key="item.id">
                        <view class="item-header">
                            <view class="stage-info">
                                <view class="stage-name">{{ item.stageName || 'Target achieved' }}</view>
                                <view class="condition-text">{{ getConditionText(item) }}</view>
                            </view>
                            <view class="status" :class="item.claimStatus">{{ getStatusText(item.claimStatus) }}</view>
                        </view>

                        <view class="reward-box">
                            <view class="reward-label">Reward</view>
                            <view class="reward-value">{{ getRewardText(item) }}</view>
                        </view>

                        <view class="detail-row">
                            <view class="detail-item">
                                <view class="detail-label">Progress</view>
                                <view class="detail-value">{{ item.currentProgress || 0 }}/{{ item.targetNum || 0 }}</view>
                            </view>
                            <view class="detail-item">
                                <view class="detail-label">Cycle</view>
                                <view class="detail-value cycle-value">{{ item.periodId || '--' }}</view>
                            </view>
                        </view>

                        <view class="claimed-time">
                            <view>Claimed on</view>
                            <view>{{ item.claimedAt || '--' }}</view>
                        </view>
                    </view>
                    <listbottom :hasMore="hasMore" :loading="loading" :noData="nodata"
                        image="/static/default/NoContent.png" title="No records"></listbottom>
                </scroll-view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
    customCycleClaimListApi
} from '@/common/api/ActivityUpdates.js'

export default {
    components: {
        customnavbar,
        listbottom
    },
    data() {
        return {
            currency: '',
            billsList: [],
            page: {
                pageNum: 1,
                pageSize: 10
            },
            nodata: false,
            hasMore: true,
            loading: false,
            topStyle: 0,
            isRefreshing: false
        }
    },
    methods: {
        mtop(e) {
            // #ifdef H5
            this.topStyle = 'padding-top:' + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = 'padding-top:' + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
            // #endif
        },
        switchTab() {
            this.page.pageNum = 1
            this.nodata = false
            this.hasMore = true
            this.loading = false
            this.getList()
        },
        getList() {
            this.loading = true
            uni.showLoading({
                title: this.$t('loading.btn')
            })
            customCycleClaimListApi(this.page).then(res => {
                const rows = res.rows || []
                const total = Number(res.total || 0)
                if (this.page.pageNum === 1) this.billsList = rows
                else this.billsList.push(...rows)
                this.nodata = total === 0
                this.hasMore = this.billsList.length < total
            }).catch(err => {
                console.log('request fail', err)
                this.$showMessage('warning', err.msg || 'Loading failed')
            }).finally(() => {
                this.loading = false
                uni.hideLoading()
            })
        },
        onRefresh() {
            this.isRefreshing = true
            this.page.pageNum = 1
            this.nodata = false
            this.hasMore = true
            this.loading = false
            this.getList()
            setTimeout(() => {
                this.isRefreshing = false
            }, 500)
        },
        onReachBottom() {
            if (!this.loading && this.hasMore) {
                this.page.pageNum += 1
                this.getList()
            }
        },
        getConditionText(item) {
            const map = {
                NEW_REGISTER: 'New registered members',
                NEW_A: 'New level A members',
                NEW_ABC: 'New level ABC members',
                VIP_UPGRADE: 'Members upgraded to VIP'
            }
            return map[item.conditionType] || 'Progress target'
        },
        getRewardText(item) {
            const rewardMap = {
                CASH: `${this.currency} ${item.cashAmount || 0} credited to balance`,
                LUCKY_CARD: `${item.cardNum || 0} Lucky Card draw(s)`,
                LUCKY_BAG: `${item.bagTimes || 0} Surprise Bag draw(s)${item.bagStarLevel ? ' ' + item.bagStarLevel + ' star(s)' : ''}`,
                PHYSICAL: item.physicalName || 'Physical reward'
            }
            return rewardMap[item.rewardType] || 'Reward'
        },
        getStatusText(status) {
            const map = {
                SUCCESS: 'Claimed',
                PROCESSING: 'Processing',
                FAIL: 'Failed'
            }
            return map[status] || status || '--'
        }
    },
    onLoad() {
        this.currency = uni.getStorageSync('settings')?.currency || ''
        this.getList()
    }
}
</script>

<style lang="scss" scoped>
.scroll-view-box {
    flex: 1;
    height: 1rpx;
}

.record-page {
    height: 100%;
    background: #fff5e0;
}

.record-content {
    display: flex;
    flex-direction: column;
    padding: 24rpx 32rpx 0;
}

.list {
    .record-item {
        padding: 28rpx;
        margin-bottom: 24rpx;
        border-radius: 18rpx;
        border: 2rpx solid #fff5e0;
        background: #fff;
    }
}

.item-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
}

.stage-info {
    min-width: 0;
    flex: 1;
}

.stage-name {
    font-size: 32rpx;
    line-height: 42rpx;
    font-weight: 700;
    color: #1f1f1f;
}

.condition-text {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #FF9231;
}

.status {
    flex-shrink: 0;
    padding: 8rpx 16rpx;
    border-radius: 10rpx;
    background: #fff5e0;
    font-size: 22rpx;
    line-height: 30rpx;
    font-weight: 600;
    color: #ffb036;

    &.PROCESSING {
        background: #e8fbef;
        color: #0BB26D;
    }

    &.FAIL {
        background: #fff0f0;
        color: #ff4d4f;
    }
}

.reward-box {
    margin-top: 24rpx;
    padding: 22rpx;
    border-radius: 14rpx;
    background: #fff5e0;
}

.reward-label {
    font-size: 22rpx;
    line-height: 30rpx;
    color: #FF9231;
}

.reward-value {
    margin-top: 8rpx;
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #ffb036;
}

.detail-row {
    display: flex;
    gap: 20rpx;
    margin-top: 24rpx;
}

.detail-item {
    flex: 1;
    min-width: 0;
}

.detail-label {
    font-size: 22rpx;
    line-height: 30rpx;
    color: #999;
}

.detail-value {
    margin-top: 6rpx;
    font-size: 26rpx;
    line-height: 34rpx;
    font-weight: 600;
    color: #222;
}

.cycle-value {
    word-break: break-all;
    overflow-wrap: break-word;
}

.claimed-time {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin-top: 24rpx;
    padding-top: 20rpx;
    border-top: 2rpx solid #f0f0f0;
    font-size: 22rpx;
    line-height: 30rpx;
    color: #8a8a8a;
}
</style>
