<template>
    <customnavbar :title="$t('teamPage.rewardDetails')" white-title :background-str="themeColor">
        <view class="page">
            <view class="summary">
                <view class="summary__subtitle">{{ $t('teamPage.accumulatedRewards') }}</view>
                <view class="summary__amount">{{ formatMoney(teamInfo.totalIncome) }}{{ currency }}</view>
            </view>

            <view class="report-card">
                <view class="report-card__metrics">
                    <view class="metric">
                        <view class="metric__title">{{ $t('teamPage.sevenDayRevenue') }}</view>
                        <view class="metric__value">{{ incomeDetail?.lastSevenDaysIncome }}
                            <!-- <text>+18.6%</text> -->
                        </view>
                    </view>
                    <view class="metric">
                        <view class="metric__title">{{ $t('teamPage.monthlyIncome') }}</view>
                        <view class="metric__value">{{ incomeDetail?.currentMonthIncome }}
                            <!--  <text>+18.6%</text> -->
                        </view>
                    </view>
                </view>
                <UniEcharts class="chart" :option="chartOption" autoresize />
                <!-- <view class="scroll-indicator"></view> -->
            </view>

            <view class="dynamics_box">
                <view class="dynamics-title">{{ $t('teamPage.teamDynamics') }}</view>
                <view class="dynamics-list" v-if="incomeMembers.length">
                    <view class="dynamics-item" v-for="(item, index) in incomeMembers" :key="index">
                        <view>
                            <view class="dynamics-item__name">{{ item.username }} ({{ item.teamLevel }})</view>
                            <view class="dynamics-item__desc">{{ item.type }}</view>
                        </view>
                        <view class="dynamics-item__right">
                            <view class="dynamics-item__income">+{{ item.income }} {{ currency }}</view>
                            <view class="dynamics-item__time">{{ item.joinTime }}</view>
                        </view>
                    </view>
                </view>
                <view class="default_box" v-else>
                    <image src="/static/mine/applicationRecord/nullPositionManage.png" mode="" class="default_image">
                    </image>
                    <view class="text1">{{ $t('暂无成员') }}</view>
                    <view class="text2">{{ $t('团队越大, 奖励越丰富') }}</view>
                </view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import UniEcharts from '@/uni_modules/xiaohe-echarts/components/uni-echarts/uni-echarts.vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { provideEcharts } from '@/uni_modules/xiaohe-echarts/shared-core'
import { teamApi, incomeDetailApi, incomeMembersApi } from '@/common/api/team.js'
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

export default {
    components: { customnavbar, UniEcharts },
    setup() {
        provideEcharts(echarts)
    },
    data() {
        return {
            incomeDetail: {},
            incomeMembers: [],
            page: {
                pageNum: 1,
                pageSize: 10
            },
            loading: false,
            hasMore: true,
            themeColor: '#0145f1',
            currency: '',
            teamInfo: {}
        }
    },
    computed: {
        chartOption() {
            const dailyIncomeList = Array.isArray(this.incomeDetail?.dailyIncomeList)
                ? this.incomeDetail.dailyIncomeList
                : []

            return {
                grid: { left: 58, right: 18, top: 28, bottom: 42 },
                xAxis: {
                    type: 'category',
                    data: dailyIncomeList.map(item => item.statDate),
                    boundaryGap: false,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: '#9b9287', fontSize: 14, margin: 10 },
                    splitLine: { show: true, lineStyle: { color: '#e5e5e5' } }
                },
                yAxis: {
                    type: 'value',
                    scale: true,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: '#9b9287', fontSize: 14 },
                    splitLine: { show: true, lineStyle: { color: '#e5e5e5' } }
                },
                series: [{
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    data: dailyIncomeList.map(item => Number(item.income) || 0),
                    lineStyle: { width: 5, color: '#0145f1', shadowBlur: 12, shadowColor: '#71bbff' },
                    itemStyle: { color: '#0145f1' }
                }]
            }
        }
    },
    onShow() {
        this.getTeamInfo()
        this.getIncomeDetail()
        this.page.pageNum = 1
        this.hasMore = true
        this.getIncomeMembers()
        this.currency = (uni.getStorageSync('settings') || {}).currency || '';
    },
    onReachBottom() {
        if (!this.loading && this.hasMore) {
            this.page.pageNum++
            this.getIncomeMembers()
        }
    },
    methods: {
        getTeamInfo() {
            teamApi().then(r => {
                this.teamInfo = r.data || {}
            })
        },
        getIncomeDetail() {
            incomeDetailApi().then(res => {
                this.incomeDetail = res.data
            })
        },
        getIncomeMembers() {
            this.loading = true
            incomeMembersApi(this.page).then(res => {
                const data = res.data || {}
                const rows = data.rows || []
                this.incomeMembers = this.page.pageNum === 1
                    ? rows
                    : this.incomeMembers.concat(rows)
                this.hasMore = data.total == null
                    ? rows.length === this.page.pageSize
                    : this.incomeMembers.length < Number(data.total)
            }).catch(() => {
                if (this.page.pageNum > 1) this.page.pageNum--
            }).finally(() => {
                this.loading = false
            })
        },
        formatMoney(v) {
            let n = Number(v || 0);
            return Number.isFinite(n) ? n.toFixed(2) : '0.00'
        }
    }
}
</script>

<style scoped lang="scss">
.page {
    background: #f1f4fc;
    min-height: 100vh;

    .summary {
        background: $themeColor;
        color: #fff;
        padding: 28rpx 34rpx 196rpx;
        transform: translateY(-4rpx);

        &__subtitle {
            font-size: 28rpx;
            line-height: 42rpx;
            color: #D8D8D8;
        }

        &__amount {
            font-family: DingTalk JinBuTi;
            font-size: 48rpx;
            line-height: 68rpx;
            margin-top: 18rpx;
        }
    }

    .report-card {
        background: #fff;
        border-radius: 16rpx;
        margin: 0 24rpx;
        padding: 24rpx 24rpx 0;
        position: relative;
        transform: translateY(-166rpx);

        &__metrics {
            display: flex;
            gap: 22rpx;
        }

        .metric {
            flex: 1;
            min-width: 0;

            &__title {
                font-family: MiSans;
                font-size: 24rpx;
                color: #3D3D3D;
            }

            &__value {
                color: $themeColor;
                font-family: DingTalk JinBuTi;
                font-size: 36rpx;
                white-space: nowrap;
                margin-top: 15rpx;

                text {
                    color: #00d864;
                    font-size: 20rpx;
                    font-style: normal;
                    margin-left: 8rpx;
                }
            }
        }

        .chart {
            width: 110%;
            height: 330rpx;
            transform: translate(-7.4%, -2%);
        }

        .scroll-indicator {
            width: 270rpx;
            height: 10rpx;
            background: #d5d5d5;
            border-radius: 10rpx;
            margin: -4rpx auto 0;
        }
    }

    .dynamics_box {
        transform: translateY(-166rpx);
    }

    .dynamics-title {
        color: #000;
        font-family: DingTalk JinBuTi;
        font-size: 36rpx;
        line-height: 48rpx;
        margin: 26rpx 24rpx 16rpx;
    }

    .dynamics-list {
        display: flex;
        flex-direction: column;
        gap: 32rpx;
        background: #fff;
        border-radius: 10rpx;
        margin: 0 24rpx;
        padding: 24rpx;
    }

    .dynamics-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        &__name {
            font-family: DingTalk JinBuTi;
            font-size: 32rpx;
            color: #3D3D3D;
        }

        &__desc,
        &__time {
            color: #BBBBBB;
            font-family: MiSans;
            font-size: 24rpx;
            line-height: 34rpx;
            margin-top: 8rpx;
        }

        &__right {
            text-align: right;
        }

        &__income {
            color: $themeColor;
            font-family: DingTalk JinBuTi;
            font-size: 32rpx;
            line-height: 42rpx;
            white-space: nowrap;
        }
    }

    .default_box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24rpx;

        .default_image {
            width: 466rpx;
            height: 466rpx;
        }

        .text1 {
            font-family: MiSans;
            font-size: 32rpx;
            font-weight: 500;
        }

        .text2 {
            font-family: MiSans;
            font-size: 28rpx;
            color: #A1A1A1;
        }

        .btn {
            font-family: MiSans;
            font-size: 24rpx;
            padding: 16rpx 24rpx;
            min-width: 442rpx;
            border-radius: 8rpx;
            background: #0145F1;
            text-align: center;
            color: #fff;
        }
    }
}
</style>
