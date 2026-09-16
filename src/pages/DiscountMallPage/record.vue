<template>
    <customnavbar :title="$t('记录')" @mtop="mtop">
        <uv-skeletons :loading="isLoading" :skeleton="skeleton" class="common-page"></uv-skeletons>
        <view class="bill-record" v-if="!isLoading">
            <view class="bill-record-content" :style="topStyle">
                <!-- 标签卡切换 -->
                <view class="tabs">
                    <view v-for="(item, index) in tabs" :key="index"
                        :class="['tab-item', currentTab === index ? 'active' : '']" @click="switchTab(index)">
                        {{ item }}
                    </view>
                </view>

                <!-- <view class="list"> -->
                <scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
                    @scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
                    class="scroll-view-box list">
                    <view class="list-item" v-for="(item, index) in billsList" :key="index">
                        <!-- 商品图片 -->
                        <view class="left_box">
                            <image :src="item?.coverImage" v-if="item?.coverImage" mode="" class="img"></image>
                            <view class="text_box">
                                <view class="title">{{ item.productName || item.flowType }}</view>
                                <view class="time">{{ item.createTime }}</view>
                            </view>
                        </view>
                        <view class="number" :class="{ 'active': item.direction === 1 }">{{ item.direction === 1 ? '+' :
                            ''}}{{ item.amountPcoin || item.salePricePcoin || 0 }}</view>
                    </view>
                    <listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
                        image="/static/default/NoBankCard.png"></listbottom>
                </scroll-view>
            </view>
        </view>

    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
    shopPcoinListApi,
    shopOrderListApi
} from "@/common/api/discountMall.js";
export default {
    components: {
        customnavbar,
        listbottom
    },
    data() {
        return {
            pageTitle: '',
            // 骨架显示状态
            isLoading: true,
            skeleton: [
                // 标签页骨架屏
                {
                    type: 'flex',
                    num: 5,
                    style: [{
                        width: '100%',
                        height: '120rpx',
                        backgroundColor: '#f0f0f0'
                    },
                    {
                        width: '100%',
                        height: '120rpx',
                        backgroundColor: '#f0f0f0'
                    },
                    {
                        width: '100%',
                        height: '120rpx',
                        backgroundColor: '#f0f0f0'
                    },
                    {
                        width: '100%',
                        height: '120rpx',
                        backgroundColor: '#f0f0f0'
                    },
                    {
                        width: '100%',
                        height: '120rpx',
                        backgroundColor: '#f0f0f0'
                    }
                    ],
                    gap: '20rpx',
                },
            ],
            currentTab: 0,
            tabs: [],
            billsList: [],
            page: {
                pageNum: 1,
                pageSize: 10
            },
            nodata: false,
            hasMore: true,
            loading: false,
            topStyle: 0,
            isRefreshing: false,
        }
    },
    methods: {
        pushInfo(currentTab, id) {
            if (currentTab == 3) {
                uni.navigateTo({
                    url: '/pages/MinePage/withdrawalInfo?id=' + id
                })
            }
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
            // #endif
        },
        switchTab(index) {
            this.page.pageNum = 1
            this.nodata = false
            this.hasMore = true
            this.loading = false
            this.currentTab = index
            this.getList()
        },
        showFilter() {
            // 显示筛选弹窗
        },
        getList() {
            // 根据currentTab获取对应列表数据
            let type = ''
            switch (this.currentTab) {
                case 0:
                    // 获取商品订单
                    type = shopOrderListApi
                    break
                case 1:
                    // 获取商城币列表
                    type = shopPcoinListApi
                    break
            }
            this.loading = true
            type(this.page).then((res) => {
                this.loading = false
                if (this.page.pageNum == 1) this.billsList = res.rows || []
                else this.billsList.push(...res.rows)
                this.nodata = res.total == 0
                if (this.billsList.length == res.total) this.hasMore = false

            }).catch((err) => {
                console.log('request fail', err);
                this.loading = false
                this.$showMessage('warning', err.msg);
            }).finally(() => {
                this.isLoading = false
            })

        },
        onRefresh() {
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
        }
    },
    onLoad() {
        this.tabs = ['Order Record', 'Coin Record']
        this.getList()
    }
}
</script>

<style lang="scss" scoped>
.scroll-view-box {
    // min-height: 0;
    flex: 1;
    height: 1px;
}

.bill-record {
    height: 100%;

    .bill-record-content {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
        padding: 24rpx 40rpx 40rpx 40rpx;
        padding-bottom: 0;

        .tabs {
            display: flex;
            background: #f6f4ef;
            justify-content: center;
            padding: 16rpx;
            border-radius: 24rpx;

            .tab-item {
                position: relative;
                font-family: "DINPro-Regular", sans-serif;
                font-weight: 400;
                font-size: 32rpx;
                color: #000000;
                line-height: 92rpx;
                text-align: center;
                font-style: normal;
                height: 92rpx;
                width: 315rpx;
                border-radius: 24rpx;

                &.active {
                    color: #FFFFFF;
                    font-weight: bold;
                    background: $themeColor;
                    // box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
                    border-radius: 24rpx;
                }
            }
        }

        .filter-btn {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 20rpx 0;

            .iconfont {
                margin-left: 10rpx;
            }
        }

        .list-content {
            padding-top: 40rpx;
            overflow: scroll;

            -ms-overflow-style: none;
            /* IE and Edge */
            scrollbar-width: none;


            .bill-record::-webkit-scrollbar {
                display: none;
                /* Chrome, Safari and Opera */
            }
        }

        .list {
            flex: 1;
            height: 1px;
            padding-top: 16rpx;

            .list-item {
                display: flex;
                justify-content: space-between;
                align-items: safe;
                border-bottom: 2rpx solid #FAEDE1;
                padding: 24rpx 0;
                gap: 42rpx;

                .left_box {
                    display: flex;
                    align-items: center;
                    gap: 16rpx;

                    .img {
                        width: 96rpx;
                        height: 96rpx;
                    }

                    .text_box {
                        display: flex;
                        flex-direction: column;
                        align-items: start;
                        gap: 8rpx;
                        color: #000000;

                        .title {
                            font-size: 32rpx;
                            font-weight: 500;
                            display: -webkit-box;
                            -webkit-box-orient: vertical;
                            -webkit-line-clamp: 2;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            word-break: break-all;
                        }

                        .time {
                            font-size: 28rpx;
                        }
                    }
                }

                .number {
                    font-size: 32rpx;
                    font-weight: bold;

                    &.active {
                        color: $themeColor;
                    }
                }


            }
        }
    }
}
</style>