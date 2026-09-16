<template>
    <view class="page">
        <view class="Big_bgi" :style="topStyle"></view>
        <view class="head_box">
            <view class="page_title">
                <image src="/static/back_icon.png" class="back_img" @click="$customizeBack"></image>
                <view>{{ activityTitle }}</view>
            </view>
            <view class="record_btn" @click="toPage('/pages/ActivityUpdatesPage/recordPage')">
                {{ $t('activityUpdates.history') }}
            </view>
        </view>

        <view class="box">
            <view v-if="activityEnabled" class="activity_panel">
                <view class="summary_box">
                    <view class="summary_label">{{ $t('activityUpdates.configurableActivity') }}</view>
                    <view class="summary_title">{{ activityTitle }}</view>
                    <text class="summary_period">{{ periodText }}</text>
                </view>

                <view class="stage_list">
                    <view class="stage_item" v-for="stage in mergedStages" :key="`${stage.stageId}_${stage.periodId}`">
                        <view class="stage_top">
                            <view class="stage_info">
                                <view class="stage_name">{{ getStageName(stage) }}</view>
                                <view class="stage_desc">{{ getConditionText(stage) }}</view>
                            </view>
                            <view class="reward_tag">{{ getRewardText(stage) }}</view>
                        </view>

                        <view class="progress_area">
                            <view class="progress_header">
                                <view>{{ stage.progressDesc || $t('activityUpdates.currentProgress') }}</view>
                                <view class="progress_num">{{ getCurrentProgress(stage) }}/{{ stage.targetNum || 0 }}
                                </view>
                            </view>
                            <view class="progress_track">
                                <view class="progress_fill" :style="{ width: getProgressPercent(stage) + '%' }"></view>
                            </view>
                        </view>

                        <view class="stage_bottom">
                            <text class="stage_time">{{ getPeriodText(stage) }}</text>
                            <view class="claim_btn"
                                :class="{ active: stage.claimable && !stage.claimed, claimed: stage.claimed }"
                                @click="claimStage(stage)">
                                {{ getClaimText(stage) }}
                            </view>
                        </view>
                    </view>
                </view>

                <view class="remark_box" v-if="activityRemark">
                    <view class="remark_title">{{ $t('activityUpdates.remarks') }}</view>
                    <view class="remark_text">{{ activityRemark }}</view>
                </view>
            </view>

            <view v-else class="empty_box">
                <view class="empty_title">{{ $t('activityUpdates.noActivityAvailable') }}</view>
                <view class="empty_text">{{ $t('activityUpdates.activityUnavailable') }}</view>
            </view>
        </view>
    </view>
</template>

<script>
import {
    customCycleOverviewApi,
    customCycleProgressApi,
    customCycleClaimApi
} from '@/common/api/ActivityUpdates.js'

export default {
    data() {
        return {
            topStyle: '',
            activityTitle: this.$t('activityUpdates.referralActivity'),
            activityRemark: '',
            activityEnabled: true,
            overviewStages: [],
            progressStages: [],
            loading: false
        }
    },
    computed: {
        mergedStages() {
            return (this.overviewStages || []).map(stage => {
                const progress = (this.progressStages || []).find(item => {
                    return item.stageId === stage.stageId && (!item.periodId || item.periodId === stage.periodId)
                }) || {}
                return {
                    ...stage,
                    ...progress,
                    targetNum: progress.targetNum || stage.targetNum || 0,
                    periodId: progress.periodId || stage.periodId,
                    periodStartTime: progress.periodStartTime || stage.periodStartTime,
                    periodEndTime: progress.periodEndTime || stage.periodEndTime
                }
            })
        },
        periodText() {
            const firstStage = this.mergedStages[0]
            if (!firstStage) return this.$t('activityUpdates.flexibleCycle')
            return this.getPeriodText(firstStage)
        }
    },
    methods: {
        getActivityData() {
            this.loading = true
            Promise.all([customCycleOverviewApi(), customCycleProgressApi()]).then(([overviewRes, progressRes]) => {
                const overview = overviewRes.data || {}
                const progress = progressRes.data || {}
                this.activityTitle = overview.activityTitle || this.$t('activityUpdates.referralActivity')
                this.activityRemark = overview.activityDesc || ''
                this.activityEnabled = Boolean(overview.activityEnabled && progress.activityEnabled)
                this.overviewStages = overview.stages || []
                this.progressStages = progress.stages || []
            }).catch(err => {
                console.log(err)
                this.$showMessage('warning', err.msg || this.$t('activityUpdates.loadingFailed'))
            }).finally(() => {
                this.loading = false
            })
        },
        claimStage(stage) {
            if (stage.claimed || !stage.claimable) return
            customCycleClaimApi({
                stageId: stage.stageId
            }).then((res) => {
                this.$showMessage('success', res.msg)
                this.getActivityData()
            }).catch(err => {
                this.$showMessage('warning', err.msg || this.$t('activityUpdates.unableToClaimReward'))
            })
        },
        getStageName(stage) {
            if (stage.stageName) return stage.stageName
            return `${this.getConditionText(stage)} ${stage.targetNum || 0}`
        },
        getConditionText(stage) {
            const map = {
                NEW_REGISTER: this.$t('activityUpdates.newRegisteredMembers'),
                NEW_A: this.$t('activityUpdates.newLevelAMembers'),
                NEW_ABC: this.$t('activityUpdates.newLevelABCMembers'),
                VIP_UPGRADE: this.$t('activityUpdates.membersUpgradedToVip')
            }
            const baseText = map[stage.conditionType] || this.$t('activityUpdates.progressTarget')
            if (stage.conditionType === 'VIP_UPGRADE' && stage.vipLevelNames && stage.vipLevelNames.length) {
                return `${baseText}: ${stage.vipLevelNames.join(', ')}`
            }
            return baseText
        },
        getRewardText(stage) {
            const rewardMap = {
                CASH: this.$t('activityUpdates.cashCredited', { amount: this.getCashAmount(stage) }),
                LUCKY_CARD: this.$t('activityUpdates.luckyCardDraws', { count: this.getRewardCount(stage) }),
                LUCKY_BAG: this.$t('activityUpdates.surpriseBagDraws', { count: this.getRewardCount(stage) }),
                PHYSICAL: stage.rewardName || stage.rewardDesc || this.$t('activityUpdates.physicalReward')
            }
            return rewardMap[stage.rewardType] || this.$t('activityUpdates.reward')
        },
        getCashAmount(stage) {
            const currency = uni.getStorageSync('settings')?.currency || ''
            const amount = stage.cashAmount || stage.rewardAmount || 0
            return `${currency} ${amount}`
        },
        getRewardCount(stage) {
            return stage.rewardCount || stage.drawCount || stage.quantity || 1
        },
        getCurrentProgress(stage) {
            return Math.min(Number(stage.currentProgress || 0), Number(stage.targetNum || 0))
        },
        getProgressPercent(stage) {
            const target = Number(stage.targetNum || 0)
            if (!target) return 0
            return Math.min((Number(stage.currentProgress || 0) / target) * 100, 100)
        },
        getClaimText(stage) {
            if (stage.claimed) return this.$t('activityUpdates.claimed')
            if (stage.claimable) return this.$t('activityUpdates.claim')
            return this.$t('activityUpdates.notReached')
        },
        getPeriodText(stage) {
            const periodMap = {
                DAILY: this.$t('activityUpdates.daily'),
                WEEKLY: this.$t('activityUpdates.weekly'),
                RANGE: this.$t('activityUpdates.definedPeriod')
            }
            const periodName = periodMap[stage.periodType] || this.$t('activityUpdates.flexibleCycle')
            if (stage.periodStartTime && stage.periodEndTime) {
                return this.$t('activityUpdates.periodWithRange', {
                    period: periodName,
                    start: stage.periodStartTime,
                    end: stage.periodEndTime
                })
            }
            return periodName
        },
        toPage(url) {
            uni.navigateTo({
                url
            })
        },
        mtop() {
            let statusBarHeight
            let navBarHeight
            // #ifdef APP-PLUS
            const sys = uni.getSystemInfoSync()
            statusBarHeight = sys.statusBarHeight
            navBarHeight = sys.platform === 'android' ? 96 : 88
            // #endif

            // #ifdef H5
            statusBarHeight = 0
            navBarHeight = 88
            // #endif
            let mtopValue
            uni.getSystemInfo({
                success: () => {
                    mtopValue = statusBarHeight / 2 + navBarHeight
                }
            })
            // #ifdef H5
            this.topStyle = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = 'height:calc(100vh);'
            // #endif
        }
    },
    onLoad() {
        this.mtop()
    },
    onShow() {
        this.getActivityData()
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box !important;
    font-family: MiSans;
    margin: 0;
    padding: 0;
}

.page {
    min-height: 100vh;
    background: #d2e3f9;
}

.Big_bgi {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    background: #d2e3f9;
    z-index: -1;
}

.head_box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 38rpx;
    // #ifdef APP-PLUS
    padding-top: 46rpx;
    // #endif
    font-size: 36rpx;
    font-weight: 500;
    color: #000;

    .page_title {
        display: flex;
        align-items: center;
        gap: 16rpx;
        min-width: 0;
        flex: 1;

        .back_img {
            width: 48rpx;
            height: 48rpx;
            flex-shrink: 0;
        }
    }

    .record_btn {
        flex-shrink: 0;
        margin-left: 20rpx;
        font-size: 28rpx;
        font-weight: 400;
        color: $themeColor;
    }
}

.box {
    padding: 24rpx 32rpx;
}

.summary_box {
    padding: 32rpx;
    margin-bottom: 24rpx;
    border-radius: 20rpx;
    background: linear-gradient(135deg, $themeColor 0%, $themeColor 100%);
    color: #fff;

    .summary_label {
        font-size: 24rpx;
        line-height: 32rpx;
        opacity: 0.9;
    }

    .summary_title {
        margin-top: 12rpx;
        font-size: 42rpx;
        line-height: 52rpx;
        font-weight: 700;
    }

    .summary_period {
        margin-top: 18rpx;
        font-size: 24rpx;
        line-height: 34rpx;
        opacity: 0.95;
    }
}

.stage_list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.stage_item {
    padding: 28rpx;
    border-radius: 20rpx;
    background: #fff;
    box-shadow: 0rpx 12rpx 30rpx #f3bc251a;
}

.stage_top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
}

.stage_info {
    min-width: 0;
    flex: 1;
}

.stage_name {
    font-size: 32rpx;
    line-height: 42rpx;
    font-weight: 700;
    color: #1f1f1f;
}

.stage_desc {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: $themeColor;
}

.reward_tag {
    max-width: 240rpx;
    padding: 10rpx 16rpx;
    border-radius: 10rpx;
    background: #d2e3f9;
    font-size: 22rpx;
    line-height: 30rpx;
    font-weight: 600;
    color: $themeColor;
    text-align: right;
}

.progress_area {
    margin-top: 28rpx;
}

.progress_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    margin-bottom: 14rpx;
    font-size: 24rpx;
    line-height: 32rpx;
    color: #3d3d3d;
}

.progress_num {
    flex-shrink: 0;
    font-size: 28rpx;
    font-weight: 700;
    color: $themeColor;
}

.progress_track {
    width: 100%;
    height: 22rpx;
    overflow: hidden;
    border-radius: 22rpx;
    background: #d2e3f9;
}

.progress_fill {
    height: 22rpx;
    border-radius: 22rpx;
    background: linear-gradient(90deg, $themeColor 0%, $themeColor 100%);
}

.stage_bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin-top: 24rpx;
}

.stage_time {
    flex: 1;
    font-size: 22rpx;
    line-height: 30rpx;
    color: #8a8a8a;
}

.claim_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 154rpx;
    height: 64rpx;
    padding: 0 24rpx;
    border-radius: 12rpx;
    background: #b8b8b8;
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;

    &.active {
        background: $themeColor;
    }

    &.claimed {
        background: #d2e3f9;
    }
}

.remark_box {
    margin-top: 28rpx;
    padding: 28rpx;
    border-radius: 20rpx;
    background: #fff;
}

.remark_title {
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #1f1f1f;
}

.remark_text {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 38rpx;
    color: #6f6f6f;
}

.empty_box {
    padding: 80rpx 36rpx;
    border-radius: 20rpx;
    background: #fff;
    text-align: center;
}

.empty_title {
    font-size: 34rpx;
    line-height: 44rpx;
    font-weight: 700;
    color: #1f1f1f;
}

.empty_text {
    margin-top: 14rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #8a8a8a;
}

.invite_btn_box {
    position: fixed;
    left: 0;
    bottom: 32rpx;
    width: 100%;
    padding: 0 32rpx;
    z-index: 2;
}

.invite_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 108rpx;
    border-radius: 12rpx;
    background: $themeColor;
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
}
</style>
