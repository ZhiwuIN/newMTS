<template>
    <view>
        <view class="Big_bgi" :style="topStyle"></view>
        <image src="/static/WorldCup/bgi.png" class="bgi_img" mode="widthFix"></image>
        <view class="head_box">
            <view class="page_title">
                <image src="/static/back_icon2.png" class="back_img" @click="$customizeBack"></image>
                <view>{{ $t('团队邀请函') }}</view>
            </view>
            <view style="font-size: 32rpx;font-weight: normal;" @click="toPage('/pages/TeamInvitationPage/recordPage')">
                {{ $t('记录') }}
            </view>
        </view>

        <view class="box">
            <view class="myMoney_box">
                <view class="title">{{ $t('home.Accountbalance') }}</view>
                <view class="number">{{ keepOneDecimal1(userInfo?.accountBalance) || '--' }}</view>
            </view>
            <!-- 气泡领奖区 -->
            <!-- <view class="bubble_main_box">
                <view class="timeRemaining">
                    <view class="title">{{ $t('刷新时间') }}</view>
                    <view class="time_box">
                        <view class="num">{{ hour }}</view>:<view class="num">{{ minute }}</view>:<view class="num">{{
                            second }}
                        </view>
                    </view>
                </view>
                <image src="/static/WorldCup/bubble_bgi.png" class="bubble_bgi_img">
                </image>
                <view class="bubble_box">
                    <view class="title">{{ $t('领取奖励') }}</view>
                    <view class="hint">{{ $t('点击气泡即可获得任务奖励') }}</view>
                    <view class="list">
                        <view class="item_box" v-if="bubbleList.length"
                            :class="{ 'item_1': item.track == 'PERSONAL_A', 'item_2': item.track == 'TEAM_MEMBER' }"
                            v-for="(item, index) in bubbleList" :key="index" @click="unWeeklyClaimApi(item)">
                            <image
                                :src="item.track == 'PERSONAL_A' ? '/static/WorldCup/a.png' : '/static/WorldCup/abc.png'"
                                mode="heightFix" class="bubble_item_img"></image>
                            <view>+{{ item.rewardAmount }}</view>
                        </view>
                        <view v-else class="no_data">{{ $t('暂无奖励') }}</view>
                    </view>
                </view>
            </view> -->

            <!-- 内容列表 -->
            <!-- <view class="main_box main_box_1">
                <view class="title_box">
                    <view>{{ $t('我的直接下级') }}</view>
                    <image src="/static/WorldCup/a.png" mode="heightFix" class="list_img">
                    </image>
                </view>
                <view class="list_box">
                    <view class="progress_bar_box">
                        <view class="text">{{ $t('进展情况') }}（{{ activityInfo?.personalCount || 0 }}）</view>
                        <view class="progress-wrapper">
                            <t-progress :color="'#ff7300'" :label="false" :percentage="percent1" />
                            <view class="dot-container">
                                <view class="dot" :class="{ 'active': personalCurrent >= item }"
                                    v-for="(item, index) in Math.max(personalTotal - 1, 0)" :key="index">
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="item_box" v-for="(value, index) in activityInfo?.personalTiers">
                        <view class="left_box">
                            <view>{{ value?.title }}</view>
                            <view class="number">+{{ value?.rewardAmount || 0 }}</view>
                        </view>
                        <view class="btn" :class="{ 'actvie': value.claimable }" @click="unWeeklyClaimApi(value)">
                            {{ value.claimed ? $t('已领取')
                                : value.claimable ? $t('领取')
                                    : $t('未达标') }} </view>
                    </view>
                </view>
            </view> -->


            <!-- 活动介绍 -->
            <view class="main_box main_box_2" style="margin-top: 60rpx;">
                <view class="title_box">
                    <view>{{ $t('活动规则') }}</view>
                </view>
                <view class="explain">
                    {{ activityInfo?.activityDesc }}
                </view>
            </view>

            <!-- 团队 -->
            <view class="main_box main_box_2">
                <view class="title_box">
                    <view>{{ $t('我的团队下级') }}</view>
                    <image src="/static/WorldCup/abc.png" mode="heightFix" class="list_img">
                    </image>
                </view>
                <view class="list_box">
                    <view class="timeRemaining2">
                        <view class="title">{{ $t('Progress reset countdown') }}</view>
                        <view class="time_box">
                            <view class="num">{{ hour }}</view>:<view class="num">{{ minute }}</view>:<view class="num">
                                {{
                                    second }}
                            </view>
                        </view>
                    </view>
                    <!-- 团队进度条 -->
                    <view class="progress_bar_box">
                        <view class="text">{{ $t('进展情况') }}（{{ activityInfo?.teamCount || 0 }}）</view>
                        <!-- 进度条容器用于打点 -->
                        <view class="progress-wrapper">
                            <t-progress :color="'#068ece'" :label="false" :percentage="percent2" />
                            <!-- 打点容器 -->
                            <view class="dot-container">
                                <view class="dot" :class="{ 'active': teamCurrent >= item }"
                                    v-for="(item, index) in Math.max(teamTotal - 1, 0)" :key="index">
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="item_box" v-for="(value, index) in activityInfo?.teamTiers">
                        <view class="left_box">
                            <view>{{ value?.title }}</view>
                            <view class="number">
                                <image src="/static/lottery/money.png" mode="heightFix" class="money_img">
                                </image>
                                +{{ value?.rewardAmount || 0 }}
                            </view>
                        </view>
                        <view class="btn" :class="{ 'actvie': value.claimable }" @click="unWeeklyClaimApi(value)">
                            {{ value.claimed ? $t('Rewards Claimed')
                                : value.claimable ? $t('Claim Rewards')
                                    : $t('未达标') }} </view>
                    </view>
                </view>
            </view>

            <!-- 邀请按钮 -->
            <view class="invite_btn_box">
                <image src="/static/WorldCup/btn_img.png" mode="widthFix" class="invite_btn"
                    @click="toPage('/pages/HomePage/teamExpansion')">
                </image>
                <!-- <view class="invite_btn" >{{ $t('现在邀请') }}</view> -->
            </view>
        </view>
    </view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    weeklyOverviewApi,
    weeklyClaimApi
} from '@/common/api/teamInvitation.js'
import {
    userInfoApi
} from "@/common/api/users.js";
import {
    keepOneDecimal
} from "@/utils/utils.js"
export default {
    components: {
        customnavbar
    },
    data() {
        return {
            hour: '00', // 倒计时: 时
            minute: '00', // 倒计时: 分
            second: '00', // 倒计时: 秒
            activityInfo: {
                personalCount: 0, // 下级人数
                teamCount: 0, // 团队人数
                personalTiers: [], // 个人档位
                teamTiers: []     // 团队档位
            }, // 活动信息
            topStyle: '',
            userInfo: {},
            timer: null,
            bubbleList: [] // 奖励气泡列表
        }
    },
    computed: {
        // 个人任务: 总任务数
        personalTotal() {
            return this.activityInfo?.personalTiers?.length || 0
        },
        // 个人任务: 已完成数（已领取 + 可领取）
        personalCurrent() {
            const list = this.activityInfo?.personalTiers || []
            return list.filter(item => item.claimed || item.claimable).length
        },
        // 个人进度百分比
        percent1() {
            if (this.personalTotal === 0) return 0
            return (this.personalCurrent / this.personalTotal) * 100
        },
        // 团队任务: 总任务数
        teamTotal() {
            return this.activityInfo?.teamTiers?.length || 0
        },
        // 团队任务: 已完成数
        teamCurrent() {
            const list = this.activityInfo?.teamTiers || []
            return list.filter(item => item.claimed || item.claimable).length
        },
        // 团队进度百分比
        percent2() {
            if (this.teamTotal === 0) return 0
            return (this.teamCurrent / this.teamTotal) * 100
        }
    },
    methods: {
        // 查询当前登录用户本周活动概览
        getWeeklyOverview() {
            weeklyOverviewApi().then(res => {
                this.activityInfo = res.data
                // 活动未开放
                // if (!this.activityInfo.activityEnabled) {
                // this.$showMessage('info', this.$t('暂未开放'));
                // setTimeout(() => {
                //     this.$customizeBack()
                // }, 1500)
                // return
                // } else {
                // 将未领取的奖励放到气泡列表
                this.getWeeklyClaimList(res.data)
                // 开始展示倒计时
                this.updateCountdown(res.data.systemTime, res.data.weekEndDateTime)
                // }
            }).catch(err => {
                console.log(err)
            })
        },
        // 更新倒计时（完整版 无报错）
        updateCountdown(currentTime, endTime) {
            // 清掉之前的定时器
            if (this.timer) clearInterval(this.timer)

            // 计算时间差
            const start = new Date(currentTime).getTime()
            const end = new Date(endTime).getTime()
            let diff = end - start
            console.log(diff, currentTime, endTime)
            if (diff <= 0) {
                this.hour = '00'
                this.minute = '00'
                this.second = '00'
                this.getWeeklyOverview()
                return
            }

            // 立即执行一次
            this.setTimeData(diff)

            // 每秒更新
            this.timer = setInterval(() => {
                diff -= 1000
                if (diff <= 0) {
                    clearInterval(this.timer)
                    this.hour = '00'
                    this.minute = '00'
                    this.second = '00'
                    return
                }
                this.setTimeData(diff)
            }, 1000)
        },
        setTimeData(diff) {
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)

            // 补 0
            this.hour = h < 10 ? '0' + h : h
            this.minute = m < 10 ? '0' + m : m
            this.second = s < 10 ? '0' + s : s
        },
        // 气泡列表
        getWeeklyClaimList(data) {
            // 筛选个人可领取奖励
            const personalClaims = (data.personalTiers || []).filter(
                item => item.claimable && !item.claimed
            )

            // 筛选团队可领取奖励
            const teamClaims = (data.teamTiers || []).filter(
                item => item.claimable && !item.claimed
            )

            this.bubbleList = [...personalClaims, ...teamClaims]
        },
        // 领取奖励
        unWeeklyClaimApi(item) {
            let {
                track,
                tierId,
                claimable,
                claimed
            } = item
            if (claimable && !claimed) {
                weeklyClaimApi({
                    track,
                    tierId
                }).then(res => {
                    console.log(res)
                    this.$showMessage('info', this.$t('Successful'));
                    this.getWeeklyOverview()
                    this.getUserInfo()
                }).catch(err => {
                    console.log(err)
                    this.$showMessage('info', err.msg);
                })
            }
        },
        getUserInfo() {
            userInfoApi().then((res) => {
                uni.setStorageSync('userInfo', res.data)
                this.userInfo = res.data
            }).catch((err) => {
                console.log('request fail', err);
                this.$showMessage('warning', err.msg);
            })
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
            // App端
            const sys = uni.getSystemInfoSync();
            statusBarHeight = sys.statusBarHeight;
            // 安卓/iOS导航栏高度适配
            if (sys.platform === 'android') {
                navBarHeight = 96;
            } else {
                navBarHeight = 88;
            }
            // #endif

            // #ifdef H5
            // H5端
            statusBarHeight = 0;
            navBarHeight = 88;
            // #endif
            let mtopValue
            // 计算scroll-view高度
            uni.getSystemInfo({
                success: (res) => {
                    mtopValue = statusBarHeight / 2 + navBarHeight
                }
            });
            // #ifdef H5
            this.topStyle = `height:calc(100vh - ${mtopValue - 88.1}rpx);`;
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = `height:calc(100vh);`;
            // #endif

        },
        // 保留小数点一位
        keepOneDecimal1(num) {
            return keepOneDecimal(num)
        },
    },
    onLoad() {
        this.mtop()
    },
    onShow() {
        this.getWeeklyOverview()
        this.getUserInfo()
    },
    onUnload() {
        if (this.timer) clearInterval(this.timer)
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

.Big_bgi {
    background: #010a0b;
}

.bgi_img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
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
    color: #fff;

    .page_title {
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 16rpx;

        .back_img {
            width: 48rpx;
            height: 48rpx;
        }
    }
}

.box {
    padding: 156rpx 32rpx 120rpx;
}

.myMoney_box {
    .title {
        font-size: 24rpx;
        line-height: 24rpx;
        margin-bottom: 10rpx;
        color: #fff;
    }

    .number {
        font-size: 64rpx;
        line-height: 64rpx;
        font-weight: 600;
        margin-bottom: 20rpx;
        font-feature-settings: "kern" on;
        background: linear-gradient(180deg, #cef784 0%, #91e821 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
    }
}

// 气泡奖励盒子
.bubble_main_box {
    position: relative;
    border-radius: 30rpx;
    border: 2rpx solid #91E821;
    margin-bottom: 78rpx;
    overflow: hidden;

    // 倒计时
    .timeRemaining {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14rpx 28rpx;
        background-color: #001d0f;
        border-radius: 30rpx 30rpx 0 0;
        // transform: translateY(20rpx);
        z-index: 0;

        .title {
            font-family: Abril Fatface;
            font-size: 24rpx;
            color: #FFFFFF;
        }

        .time_box {
            display: flex;
            gap: 5rpx;
            font-size: 24rpx;
            color: #91e821;

            .num {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 4rpx;
                min-width: 34rpx;
                background-color: #91e821;
                border-radius: 6rpx;
                font-size: 20rpx;
                color: rgba(0, 0, 0, 0.9);
            }
        }
    }

    .bubble_bgi_img {
        position: absolute;
        right: 12rpx;
        top: 74rpx;
        width: 228rpx;
        height: 72rpx;
        z-index: 2;
    }
}

// 倒计时
.timeRemaining2 {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    // padding: 14rpx 28rpx;
    // background-color: #001d0f;
    // border-radius: 30rpx 30rpx 0 0;
    // transform: translateY(20rpx);
    z-index: 0;

    .title {
        // font-family: Abril Fatface;
        font-size: 28rpx;
        color: #FFFFFF;
    }

    .time_box {
        display: flex;
        gap: 5rpx;
        font-size: 24rpx;
        color: #91e821;

        .num {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4rpx;
            min-width: 34rpx;
            background-color: #91e821;
            border-radius: 6rpx;
            font-size: 20rpx;
            color: rgba(0, 0, 0, 0.9);
        }
    }
}

.bubble_box {
    position: relative;
    z-index: 1;
    border-radius: 0 0 30rpx 30rpx;
    background: #00341b;
    padding: 24rpx;
    padding-right: 0;

    .title {
        font-size: 36rpx;
        font-weight: 500;
        color: #91E821;
        line-height: 48rpx;
        margin-bottom: 8rpx;
    }

    .hint {
        font-size: 24rpx;
        color: #91E821;
        line-height: 48rpx;
        margin-bottom: 12rpx;
    }

    .list {
        display: flex;
        align-items: center;
        // gap: 16rpx;
        overflow-x: auto;

        .item_box {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8rpx 12rpx;
            font-size: 24rpx;
            line-height: 48rpx;
            margin-right: 16rpx;
            background: #002916;

            .bubble_item_img {
                height: 44rpx;
            }

            &.item_1 {
                color: #FF7B00;
            }

            &.item_2 {
                color: #35B3FF;
            }
        }

        .no_data {
            width: 100%;
            font-size: 24rpx;
            color: #91E821;
            text-align: center;
            padding-right: 24rpx;
        }

    }
}

// 通用列表盒子
.main_box {
    background: #00341b;
    border-radius: 24rpx 24rpx;
    margin-bottom: 104rpx;
    border: 2rpx solid #91E821;

    .title_box {
        position: relative;
        font-size: 36rpx;
        font-weight: 500;
        color: #91E821;
        padding: 28rpx;
        border-radius: 24rpx 24rpx 0px 0px;

        .list_img {
            position: absolute;
            right: 22rpx;
            bottom: 0;
            height: 156rpx;
            z-index: 2;
        }
    }

    .explain {
        padding: 22rpx 32rpx 32rpx;
        font-size: 28rpx;
        color: #fff;
        white-space: pre-wrap;
    }

    .list_box {
        display: flex;
        flex-direction: column;
        gap: 24rpx;
        padding: 32rpx 24rpx;

        .item_box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24rpx;

            .left_box {
                display: flex;
                flex-direction: column;
                align-items: start;
                gap: 8rpx;
                font-size: 28rpx;
                font-weight: 500;
                color: #fff;

                .money_img {
                    height: 32rpx;
                }

                .number {
                    display: flex;
                    align-items: center;
                    gap: 8rpx;
                    font-size: 24rpx;
                    font-weight: 600;
                }
            }

            .btn {
                padding: 10rpx 32rpx;
                border-radius: 46rpx;
                background: #737373;
                color: #fff;
                font-size: 24rpx;
                font-weight: 500;
                line-height: normal;
                white-space: nowrap;
            }
        }
    }
}

// 进度条
.progress_bar_box {
    .text {
        font-size: 28rpx;
        font-weight: 500;
        color: #fff;
        margin-bottom: 16rpx;
    }

    .progress-wrapper {
        position: relative;
        width: 100%;

        .dot-container {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;

            .dot {
                width: 8rpx;
                height: 8rpx;
                border-radius: 50%;
                background: #000;

                &.active {
                    background: #fff;
                }
            }
        }
    }
}

::v-deep .t-progress__bar {
    height: 24rpx;
}

.main_box_1 {
    .title_box {
        background: #001d0f;
    }

    .left_box {
        .number {
            color: #FF7B00;
        }
    }

    .btn.actvie {
        background: #ff7300 !important;
    }
}

.main_box_2 {
    .title_box {
        background: #001d0f;
    }

    .left_box {
        .number {
            color: #91E821;
        }
    }

    .btn.actvie {
        background: #068ece !important;
    }
}

// 邀请按钮
.invite_btn_box {
    position: fixed;
    left: 0;
    bottom: 32rpx;
    width: 100%;
    // padding: 0 32rpx;
    z-index: 2;
}

.invite_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    // height: 108rpx;
    // border-radius: 12rpx;
    // background: #FF7300;
    font-size: 32rpx;
    font-weight: 600;
    color: #FFFFFF;
}
</style>