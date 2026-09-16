<template>
    <view>
        <view class="Big_bgi" :style="topStyle"></view>
        <image src="/static/WishTree/topMask.png" mode="widthFix" class="topMask_img">
        </image>
        <view class="head_box">
            <view class="page_title">
                <image src="/static/back_icon2.png" class="back_img" @click="clickBack"></image>
                <view>{{ $t('心愿树') }}</view>
            </view>
            <view style="font-size: 32rpx;font-weight: normal;" @click="toPage">
                {{ $t('记录') }}
            </view>
        </view>

        <view class="box">
            <!-- 地图背景 -->
            <image src="/static/WishTree/bgi.png" mode="widthFix" class="bgi_img"></image>
            <!-- 底遮罩 -->
            <image src="/static/WishTree/bottomMask.png" mode="widthFix" class="bottomMask_img"></image>
            <!-- 用户余额 -->
            <view class="myMoney_box">
                <image :src="userInfo.avatar ? userInfo.avatar : '/static/default-avatar.png'" class="avatar_img">
                </image>
                <view class="text_box">
                    <view class="number">{{ keepOneDecimal1(userInfo?.accountBalance) || '--' }}</view>
                    <view class="title">{{ $t('home.Accountbalance') }}</view>
                </view>
            </view>
            <!-- 树 -->
            <view class="main_box">
                <image v-if="!isSwing" src="/static/WishTree/tree.png" mode="heightFix" class="tree_img"></image>
                <image v-else src="/static/WishTree/tree.gif" mode="heightFix" class="tree_img"></image>
                <image src="/static/WishTree/tree.gif" style="position:fixed;top:-9999rpx;left:-9999rpx;"
                    mode="widthFix"></image>
                <!-- 默认挂载的金币图片 -->
                <!-- <view class="bubble_box1">
                    <view v-for="(value, index) in 6" class="bubble_item" :style="getItemStyle(index)">
                        <image src="/static/WishTree/coin.png" class="coin_img"></image>
                    </view>
                </view> -->
                <!-- 金币气泡 -->
                <view class="bubble_box">
                    <view v-for="(value, index) in bubbleList" class="bubble_item"
                        :class="{ 'fall-in': isShowBubble, 'opacity_0': value.claimed }" :style="getItemStyle(index)"
                        @click="unWishTreeClaim(value, index)">
                        <image src="/static/WishTree/coin.png" class="coin_img"></image>
                        <view style="font-family: Abril Fatface;">{{ value.amount }}</view>
                    </view>
                </view>
                <!--  -->
                <!--  -->
                <view class="btn1_box" v-if="hasUnclaimedCoin && !isSwing" @click="claimAll">
                    {{ $t('全部领取') }}
                </view>
                <view class="btn2_box" @click="unDraw">
                    <view class="text" v-if="!isSwing && !isShowBubble">{{ $t('摇一摇') }} ×{{ treeInfo.userDrawTimes || 0
                    }}</view>
                    <view class="text" v-else>{{ $t('进行中') }}...</view>
                    <view class="hint">{{ $t('treeHint') }}</view>
                </view>
            </view>

            <!-- 获取抽奖机会 -->
            <!-- <view class="task_list_box">
                <view class="title_box">
                    Lucky draw opportunity for completing tasks
                </view>
                <view class="list_box">
                    <view class="item_box" v-for="(value, index) in 3" :key="index">
                        <view class="top_box">
                            <view class="title">Recommend 1 person directly daily</view>
                            <view class="number" :class="{ 'active': index < 1 }">1/2</view>
                        </view>
                        <view class="bottom_box">
                            <view class="text">×3 shakes</view>
                            <view class="btn" :class="{ 'active': index < 1 }">{{ index < 1 ? 'Check-in' : 'Unfinished'
                                    }}</view>
                            </view>
                        </view>
                    </view>
                    <view class="hint">Refresh tasks at 24:00 daily</view>
                </view> -->

            <view style="margin-top: 250rpx;padding: 0 32rpx;">

                <!-- 活动规则 -->
                <view class="task_list_box">
                    <view class="title_box">
                        {{ $t('活动规则') }}
                    </view>
                    <view class="content_box" v-html="description">
                    </view>
                </view>

                <!-- 获奖记录 -->
                <view class="record-list">
                    <swiper circular :indicator-dots="false" :autoplay="true" :interval='1500' :duration="1500"
                        easing-function="linear" :acceleration="true" :disable-touch="true" :vertical="true"
                        class="swiper" :display-multiple-items="5">
                        <swiper-item v-for="(item, index) in noticeList" :key="index.toFixed()" class="swiper_item">
                            <view class="record-list-item">
                                <view class="record-list-item-text">
                                    <view class="record-list-item-text-name">
                                        <text>{{ item.userName }}</text>
                                    </view>
                                    <view class="record-list-item-text-con">
                                        <text>{{ item.type }}</text>
                                    </view>
                                </view>
                                <view class="record-list-item-text-prizes">
                                    <image src="/static/WishTree/coin.png" class="record-list-item-img_img"
                                        mode="aspectFit">
                                    </image>
                                    <text>+{{ item.amount }}</text>
                                </view>
                            </view>
                        </swiper-item>
                    </swiper>
                </view>


            </view>
        </view>

        <!-- 领取成功提示 -->
        <t-overlay :visible="showPrize" v-if="showPrize" @click="showPrize = false" />
        <view class="bigBag" v-if="showPrize" @click="showPrize = false">
            <view class="number">{{ totalClaimAmount }}</view>
            <view class="title2" style="text-align: right;">{{ $t('Congratulations') }}</view>
            <view class="btn" v-if="!isBounce">{{ $t('确认') }}</view>
        </view>
    </view>
</template>

<script>
import {
    wishTreeOverviewApi,
    wishTreeShakeApi,
    wishTreeClaimAllApi,
    wishTreeDescriptionApi,
    wishTreeNoticeApi,
    wishTreeClaimApi
} from '@/common/api/wishTree.js'
import {
    userInfoApi
} from "@/common/api/users.js";
import {
    keepOneDecimal,
    formatRichText
} from "@/utils/utils.js"
export default {
    data() {
        return {
            showPrize: false,
            totalClaimAmount: '', // 中奖金额
            isShowBubble: false,
            isSwing: false,
            userInfo: {},
            topStyle: '',
            treeInfo: {},
            bubbleList: [],
            type: '',
            bizId: '',
            description: '',
            shuffledList: [],
            noticeList: [], // 滚动公告
            isLQ: false, // 领取中
        }
    },
    computed: {
        // 是否有未领取的金币
        hasUnclaimedCoin() {
            return this.bubbleList.some(item => !item.claimed)
        }
    },
    methods: {
        // 获取详情
        getWishTreeOverviewApi() {
            wishTreeOverviewApi().then(res => {
                // console.log(res)
                this.treeInfo = res.data
                // 活动未开放
                if (!this.treeInfo.activityEnabled) {
                    this.$showMessage('info', this.$t('暂未开放'));
                    setTimeout(() => {
                        this.$customizeBack()
                    }, 1500)
                    return
                } else {
                    this.bubbleList = res.data.pendingCoinItems
                    this.isShowBubble = false
                    if (this.bubbleList.length) {
                        this.isShowBubble = true
                        this.totalClaimAmount = res.data.pendingCoinAmounts.reduce((sum, item) => {
                            return sum + item;
                        }, 0)
                        this.$showMessage('info', this.$t('您有奖励尚未领取'));
                    }
                    this.bizId = res.data.pendingBizId
                }
            }).catch(err => {
                console.log(err)
            })
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
        // 气泡位置
        getItemStyle(index) {
            let list = [
                { top: '22rpx', left: '60rpx' },
                { top: '72rpx', left: '180rpx' },
                { top: '58rpx', left: '310rpx' },
                { top: '66rpx', left: '440rpx' },
                { top: '81rpx', left: '560rpx' },
                { top: '68rpx', left: '90rpx' },
                { top: '12rpx', left: '220rpx' },
                { top: '6rpx', left: '350rpx' },
                { top: '16rpx', left: '480rpx' },
                { top: '8rpx', left: '600rpx' }
            ]

            // 每次摇一摇，重新打乱这个列表（随机排序）
            if (!this.shuffledList || this.shuffledList.length !== this.bubbleList.length) {
                // 深拷贝 + 打乱顺序
                let tempList = JSON.parse(JSON.stringify(list))
                this.shuffledList = tempList.sort(() => Math.random() - 0.5).slice(0, this.bubbleList.length)
            }

            let style = this.shuffledList[index]
            // 保留错开掉落动画
            // style.transitionDelay = `${index * 0.08}s`
            style.transitionDelay = `${index * 0.3}s`
            return style
        },
        // 返回
        clickBack() {
            this.$customizeBack()
        },

        // 点击抽奖按钮
        unDraw() {
            if (!this.treeInfo.userDrawTimes) return
            if (this.isSwing || this.isShowBubble) return
            this.isSwing = true
            this.isShowBubble = false
            this.bubbleList = []
            this.$music.play_leaf()
            wishTreeShakeApi({
                userId: this.userInfo.id
            }).then(res => {
                this.treeInfo.userDrawTimes--
                // this.totalClaimAmount = res.data.totalAmount
                this.bizId = res.data.bizId
                this.bubbleList = res.data.coinItems
                setTimeout(() => {
                    this.isShowBubble = true
                    this.$music.play_goldCoinsDrop()
                    setTimeout(() => {
                        this.$music.stop_goldCoinsDrop()
                    }, 1000 + Math.max(this.bubbleList.length - 1, 0) * 300)
                    // 动画展示期间，自动调用全部领取
                }, 1000)
                setTimeout(() => {
                    this.isSwing = false
                    this.$music.stop_leaf()
                }, 3500)
            }).catch(err => {
                console.log(err)
                this.isSwing = false
                this.$music.stop_leaf()
                this.isShowBubble = false
                this.$showMessage('warning', err.msg);
            })
        },

        // 领取单个奖励
        unWishTreeClaim(e, index) {
            if (this.isLQ) return
            this.isLQ = true
            wishTreeClaimApi({
                userId: this.userInfo.id,
                bizId: this.bizId,
                coinIndex: e.coinIndex
            }).then(res => {
                this.userInfo.accountBalance += e.amount
                this.bubbleList[index].claimed = true
                this.$showMessage('success', res.msg);
                if (!res.data.remainingCoins) {
                    this.isShowBubble = false
                    this.bubbleList = []
                }
            }).catch(err => {
                console.log(err)
                this.$showMessage('warning', err.msg);
            }).finally(() => {
                this.isLQ = false
            })
        },
        // 全部领取
        claimAll() {
            if (this.isLQ) return
            this.isLQ = true
            wishTreeClaimAllApi({
                bizId: this.bizId,
            }).then(res => {
                this.totalClaimAmount = res.data.totalClaimAmount
                this.showPrize = true
                this.isShowBubble = false
                this.bubbleList = []
                this.getUserInfo()
            }).catch(err => {
                console.log(err)
                this.$showMessage('warning', err.msg);
            }).finally(() => {
                this.isLQ = false
            })
        },
        // 活动说明
        getWishTreeDescription() {
            wishTreeDescriptionApi().then(res => {
                this.description = formatRichText(res.data.description)
            }).catch(err => {
                console.log(err)
                // this.$showMessage('warning', err.msg);
            })
        },
        // 滚动公告
        getWishTreeNotice() {
            wishTreeNoticeApi().then(res => {
                this.noticeList = res.data.noticeList
            }).catch(err => {
                console.log(err)
            })
        },
        toPage() {
            uni.navigateTo({
                url: '/pages/WishTreePage/recordPage'
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
        }
    },
    onLoad() {
        this.mtop()
        // this.userInfo = uni.getStorageSync('userInfo')
    },
    onShow() {
        this.getWishTreeOverviewApi()
        this.getUserInfo()
        this.getWishTreeDescription()
        this.getWishTreeNotice()
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
    background: #f9f9f9;
    z-index: -3;
}

.topMask_img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
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
    padding-bottom: 32rpx;

    .bgi_img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        z-index: -2;
    }

    .bottomMask_img {
        position: absolute;
        top: 910rpx;
        left: 0;
        width: 100%;
        z-index: -1;
    }

    .myMoney_box {
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 14rpx;
        width: fit-content;
        border-radius: 318rpx;
        background: radial-gradient(50% 50% at 3% 100%, #FFB300 0%, rgba(255, 179, 0, 0) 100%), radial-gradient(56% 56% at 13% 17%, #FFB200 0%, rgba(255, 178, 0, 0) 100%), #FF3143;
        border: 2rpx solid #FFFFFF;
        margin: 16rpx 0 0 32rpx;

        .avatar_img {
            width: 98rpx;
            height: 98rpx;
            border-radius: 50%;
        }

        .text_box {
            display: flex;
            flex-direction: column;
            align-items: start;
            padding-right: 34rpx;

            .number {
                font-size: 32rpx;
                font-weight: bold;
                background: linear-gradient(180deg, #FFFFFF 25%, #FFEDCA 81%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
            }

            .title {
                font-size: 24rpx;
                color: #FFFFFF;
            }
        }
    }

    .main_box {
        position: relative;
        display: flex;
        justify-content: center;
        margin-top: -80rpx;
        height: 790rpx;

        .tree_img {
            position: absolute;
            height: 810rpx;
        }

        .btn1_box,
        .btn2_box {
            position: absolute;
            right: -2rpx;
        }

        .btn1_box {
            bottom: -202rpx;
            left: -72rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-bottom: 4rpx;
            padding-left: 24rpx;
            width: 340rpx;
            height: 138rpx;
            background: url('/static/WishTree/btn1.png') top left/100% no-repeat;
            font-size: 32rpx;
            font-weight: bold;
            color: #FFFFFF;
            z-index: 2;
        }

        .btn2_box {
            right: -82rpx;
            display: flex;
            flex-direction: column;
            align-items: end;
            justify-content: center;
            gap: 6rpx;
            padding-top: 54rpx;
            padding-right: 118rpx;
            bottom: -222rpx;
            width: 595rpx;
            height: 194rpx;
            background: url('/static/WishTree/btn2.png') top left/100% no-repeat;

            .text {
                font-family: 'Roboto-Black';
                font-size: 36rpx;
                font-weight: 900;
                background: linear-gradient(180deg, #FEFFFF 0%, #FFF5CF 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
                // text-shadow: 0px 8rpx 4rpx rgba(128, 0, 0, 0.3);
            }

            .hint {
                font-size: 24rpx;
                background: linear-gradient(180deg, #FEFFFF 0%, #FFF5CF 100%);
                text-align: right;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
                width: 340rpx;
            }
        }

        // 默认挂载
        .bubble_box1 {
            position: absolute;
            top: 150rpx;
            width: 100%;

            .bubble_item {
                position: absolute;
                width: 70rpx;
                height: 70rpx;

                .coin_img {
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .bubble_box {
            position: absolute;
            bottom: 100rpx;
            width: 100%;
            // height: 100%;

            .bubble_item {
                position: absolute;
                display: flex;
                align-items: center;
                font-size: 32rpx;
                font-weight: 600;
                color: #FF0016;

                // 初始：在顶部外面
                opacity: 0;
                transform: translateY(-300rpx);
                transition: none;

                // 掉落动画
                &.fall-in {
                    opacity: 1;
                    transform: translateY(0);
                    // transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
                    transition: all 1s cubic-bezier(0.25, 0.1, 0.25, 1);

                    // 掉落结束后延迟淡出
                    // animation: fadeOut 0.5s ease 2.2s forwards;
                }

                &.opacity_0 {
                    opacity: 0;
                    pointer-events: none;
                }

                .coin_img {
                    width: 52rpx;
                    height: 52rpx;
                    margin-right: 6rpx;
                }
            }

            @keyframes fadeOut {
                to {
                    opacity: 0;
                    visibility: hidden;
                }
            }
        }
    }
}

::v-deep .uni-swiper-slide-frame {
    padding: 12rpx 0;
}

// 获奖记录
.record-list {
    height: 400rpx;
    border-radius: 32rpx;
    background: #FFFFFF;
    box-shadow: 0px 8rpx 20rpx 0px rgba(206, 206, 206, 0.3);
    margin-bottom: 32rpx;

    .swiper {
        height: 400rpx;

        .swiper_item {
            .record-list-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 42rpx 0 32rpx;

                .record-list-item-text {
                    display: flex;
                    flex-direction: column;
                    align-items: start;
                    gap: 8rpx;

                    .record-list-item-text-name {
                        font-size: 28rpx;
                        color: #3D3D3D;
                    }

                    .record-list-item-text-con {
                        font-size: 24rpx;
                        font-weight: 300;
                        color: #a0a0a0;
                    }
                }

                .record-list-item-text-prizes {
                    display: flex;
                    align-items: center;
                    display: flex;
                    font-size: 28rpx;
                    color: #FF0000;

                    .record-list-item-img_img {
                        width: 56rpx;
                        height: 56rpx;
                        margin-right: 24rpx;
                    }
                }
            }
        }
    }

}

.task_list_box {
    padding-bottom: 32rpx;
    border-radius: 32rpx;
    background: #FFFFFF;
    box-shadow: 0rpx 8rpx 20rpx 0rpx rgba(206, 206, 206, 0.3);
    margin-bottom: 32rpx;

    .title_box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 518rpx;
        height: 64rpx;
        margin: 0 auto;
        background: url('/static/WishTree/title.png') top left/100% no-repeat;
        font-size: 24rpx;
        font-weight: 600;
        color: #3D3D3D;
        text-align: center;
        padding: 0 84rpx;
    }

    .content_box {
        padding: 24rpx;
        max-height: 552rpx;
        overflow-y: auto;
    }

    .list_box {
        display: flex;
        flex-direction: column;
        gap: 32rpx;
        padding: 24rpx;

        .item_box {
            display: flex;
            flex-direction: column;
            gap: 6rpx;

            .top_box {
                display: flex;
                align-items: start;
                justify-content: space-between;

                .title {
                    font-size: 24rpx;
                    font-weight: 500;
                    color: #3D3D3D;
                }

                .number {
                    font-size: 24rpx;
                    color: #afafaf;

                    &.active {
                        color: #ff0016;
                    }
                }
            }

            .bottom_box {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .text {
                    font-size: 28rpx;
                    font-weight: 600;
                    color: #FF0016;
                }

                .btn {
                    padding: 8rpx 32rpx;
                    border-radius: 2026rpx;
                    font-size: 24rpx;
                    color: #fff;
                    background: #afafaf;

                    &.active {
                        background: #ff0016;
                    }
                }
            }
        }
    }

    .hint {
        font-size: 24rpx;
        color: #6A6A6A;
        text-align: center;
    }

}

.pop_page {
    box-sizing: border-box;
    background-color: #fff;
    width: 600rpx;
    border-radius: 28rpx;
    padding: 40rpx 54rpx 28rpx 54rpx;

    .pop_top {
        display: flex;
        justify-content: center;
        align-items: center;
        /* padding: 30rpx 0 20rpx 0; */
        /* border-bottom: 1px solid #D8D8D8; */
        ;
        font-weight: 600;
        font-family: "DINPro-Medium", sans-serif;
        font-weight: 500;
        font-size: 32rpx;
        color: #000000;
        line-height: 42rpx;
        text-align: left;
        font-style: normal;
    }

    .pop_content {
        font-weight: 400;
        font-size: 28rpx;
        color: #3d3d3d;
        line-height: 36rpx;
        text-align: center;
        font-style: normal;
        margin-top: 40rpx;
    }

    .pop_bottom {
        display: flex;
        margin-top: 54rpx;
        justify-content: space-between;
    }

    .pop_cancel_btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 212rpx;
        height: 72rpx;
        background: #EBEBEB;
        border-radius: 16rpx;
        font-family: "DINPro-Black", sans-serif;
        font-family: DINPro, DINPro;
        font-weight: 500;
        font-size: 32rpx;
        color: #000;
        line-height: 32rpx;
        padding: 12rpx 0;
        text-align: center;
        font-style: normal;
    }

    .pop_bottom_btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 212rpx;
        height: 72rpx;
        background: $themeColor;
        border-radius: 16rpx;
        font-family: "DINPro-Black", sans-serif;
        font-family: DINPro, DINPro;
        font-weight: 500;
        font-size: 32rpx;
        color: #FFFFFF;
        line-height: 32rpx;
        padding: 12rpx 0;
        text-align: center;
        font-style: normal;
    }
}

.bigBag {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10001;
    width: 484rpx;
    height: 656rpx;
    background: url('/static/WishTree/totalClaimAmount.png') top left/100% no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    // padding-top: 146rpx;
    padding-top: 62rpx;

    .title {
        font-family: Alfa Slab One;
        font-size: 72rpx;
        color: #fff;
        transform: translateX(-60rpx);
    }

    .title2 {
        font-family: Alfa Slab One;
        font-size: 36rpx;
        color: transparent;
        margin-top: 12rpx;
        -webkit-text-stroke: 2rpx #fff;
        text-stroke: 2rpx #fff;
    }

    .number {
        font-family: Alfa Slab One;
        font-size: 96rpx;
        color: #fff;
        line-height: 120rpx;
        // -webkit-text-stroke: 4rpx #fff;
        // text-stroke: 4rpx #fff;
    }

    .btn {
        font-family: "DINPro-Medium", sans-serif;
        padding: 20rpx 214rpx;
        border-radius: 44rpx;
        // background: linear-gradient(90deg, $gradualColor4 0%, $gradualColor5 100%);
        // box-shadow: 0px 8rpx 8rpx 0px rgba(129, 62, 0, 0.16);
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
        margin-top: 312rpx;
    }
}
</style>
