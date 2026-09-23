<template>
    <customnavbar :title="$t('DiscountMall')" @mtop="mtop" backgroundStr="#ff7f3c" :whiteTitle="true"
        :isDiscountMall="true">
        <view class="Big_bgi" :style="topStyle2"></view>
        <!-- 头部模块 -->
        <view class="head" :style="topStyle">
            <view class="box">
                <view>
                    <view class="title">
                        {{ $t('商城余额') }}
                    </view>
                    <view class="number">
                        {{ keepOneDecimal1(userInfo?.pcoinBalance) || '0' }}
                    </view>
                    <!-- 按钮 -->
                    <view class="btn_box">
                        <view class="btn" @click="toPage('/pages/DiscountMallPage/rule')">
                            {{ $t('活动规则') }}
                        </view>
                        <view class="btn_recharge" @click="toPage('/pages/DiscountMallPage/rechargePage')">
                            {{ $t('home.Recharge') }}
                        </view>
                    </view>
                </view>
                <!-- 我的星级图标 -->
                <image :src="userInfo?.vipLevelIcon" mode="" class="level_img"></image>
            </view>
        </view>
        <!-- 搜索框&标签栏 -->
        <view class="query_box">
            <view class="set_input">
                <image src="/static/search2.png" class="search_img"></image>
                <input style="flex: 1;" v-model="page.name" :placeholder="$t('搜索商品')" @input="searchList"
                    placeholder-style="color: rgba(0, 0, 0, 0.4);font-size: 32rpx;" />
            </view>
            <view class="tabs_box">
                <uv-tabs :list="tabList" @change="changeIdx" :current="activeIdx">
                    <template #badge="{ item, index }">
                        <view class="bagbox" :class="{ 'active': index == this.activeIdx }">
                            <image class="bagbox_img" :src="item.image" v-if="item.image" mode="" :lazy-load="true">
                            </image>
                            <view>{{ item.levelName }}</view>
                        </view>
                    </template>
                </uv-tabs>
            </view>
        </view>
        <!-- 商品列表 -->
        <view class="main">
            <view class="list_box">
                <scroll-view scroll-y @scrolltolower="onReachBottom" :style="scrollViewStyle" ref="scrollViewElement">
                    <view class="list_item" v-for="(item, index) in productList" :key="item.productId"
                        @click="toPage('/pages/DiscountMallPage/commodityDetails?id=' + item?.productId)">
                        <view class="item_top">
                            <!-- 商品图片 -->
                            <image class="item_img" mode="aspectFill" :src="item.coverImage" v-if="item.coverImage">
                            </image>
                            <!-- 商品描述 -->
                            <view class="item_desc">
                                <view class="title">{{ item.name }}</view>
                                <view class="info">
                                    <image class="level_img" :src="item.starLevelIcon"></image>
                                    <view>{{ item.starLevelName }} {{ $t('特惠') }}</view>
                                    <view class="number_off_box">{{ item.discountZhe }}% {{ $t('off') }}</view>
                                </view>
                                <!-- 销量&库存 -->
                                <view class="price" style="margin-bottom: 16rpx;">
                                    <view class="price_box">
                                        <view class="text">{{ $t('销量') }}</view>
                                        <view class="number">{{ item.sales || 0 }}</view>
                                    </view>
                                    <view class="price_box">
                                        <view class="text">{{ $t('库存') }}</view>
                                        <view class="number">{{ item.stock || 0 }}</view>
                                    </view>
                                </view>
                                <!-- 价格 -->
                                <view class="price">
                                    <view class="price_box">
                                        <view class="text">{{ $t('折扣价') }}</view>
                                        <view class="number">{{ item.salePricePcoin || 0 }}</view>
                                    </view>
                                    <view class="price_box old">
                                        <view class="text">{{ $t('原价') }}</view>
                                        <view class="number">{{ item.listPricePcoin || 0 }}</view>
                                    </view>
                                </view>
                            </view>
                        </view>
                        <!-- 按钮 -->
                        <view class="btn" :class="{ 'gray': !item.canOrder || item.stock < 1 }">
                            {{ $t('立即下单') }}</view>
                        <!-- 直接购买 -->
                        <!-- <view class="btn2">未获邀请，直接购买</view> -->
                    </view>
                    <listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
                        image="/static/default/NoOrder.png">
                    </listbottom>
                    <view style="width: 100vw;height: 24rpx;"></view>
                </scroll-view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    keepOneDecimal
} from "@/utils/utils.js"
import {
    shopLevelListApi
} from "@/common/api/level.js";
import {
    shopConfigApi,
    shopUserApi,
    shopProductsApi
} from "@/common/api/discountMall.js";
export default {
    components: {
        customnavbar,
    },
    data() {
        return {
            activeIdx: 0,
            tabList: [
                // {
                //     level: null,
                //     levelName: this.$t('product.All'),
                //     image: ''
                // }
            ],
            topStyle: '',
            topStyle2: '',
            page: {
                name: '',
                pageNum: 1,
                pageSize: 5,
                level: 1
            },
            scrollViewStyle: '',
            taskCardHeight: '246',
            userInfo: {},
            shopConfig: {},
            productList: [], // 商品列表
            nodata: false,
            hasMore: true,
            loading: false,
            searchTimer: null, // 搜索防抖
            searchDebounceTime: 500 // 防抖时间
        }
    },
    methods: {
        searchList() {
            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
            }
            this.searchTimer = setTimeout(() => {
                this.productList = [];
                this.page.pageNum = 1;
                this.getShopProducts();
            }, this.searchDebounceTime);
        },
        // 商品列表
        getShopProducts() {
            this.loading = true
            shopProductsApi(this.page).then((res) => {
                if (this.page.pageNum == 1) this.productList = res.rows || []
                else this.productList.push(...res.rows)
                this.nodata = res.total == 0
                this.hasMore = this.productList.length < res.total
            }).finally(() => {
                this.loading = false
            })
        },
        // 用户信息
        getShopUserInfo() {
            shopUserApi().then((res) => {
                this.userInfo = res.data
            })
        },
        // 商城配置
        getShopConfig() {
            shopConfigApi().then((res) => {
                this.shopConfig = res.data
                uni.setStorageSync('shopConfig', res.data)
                // 活动未开放
                if (!this.shopConfig.activityEnabled) {
                    this.$showMessage('info', this.$t('暂未开放'));
                    setTimeout(() => {
                        this.$customizeBack()
                    }, 1500)
                    return
                } else {
                    this.getShopUserInfo()
                }
            })
        },
        getVipInfo() {
            shopLevelListApi().then((res) => {
                this.tabList = res.data || []
            }).catch((err) => {
                console.log('request fail', err);
                // this.$showMessage('warning', err.msg);
            })
        },
        // 切换标签
        changeIdx(e) {
            // console.log(e);
            this.activeIdx = e.index
            this.page.level = e.levelCode
            this.page.pageNum = 1
            this.getShopProducts()
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 24) + "rpx"
            this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
            this.scrollViewStyle = `height: calc(100vh - ${e}rpx - ${this.taskCardHeight}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 24) + "rpx"
            this.topStyle2 = `height:calc(100vh);`
            this.scrollViewStyle = `height: calc(100vh - ${e}rpx - ${this.taskCardHeight}rpx - 28rpx);`
            // #endif
        },
        toPage(url) {
            uni.navigateTo({
                url
            })
        },
        // 保留小数点一位
        keepOneDecimal1(num) {
            return keepOneDecimal(num)
        },
        onReachBottom() {
            if (!this.loading && this.hasMore) {
                this.page.pageNum += 1
                this.getShopProducts()
            }
        },
        handleProductUpdate(updatedProduct) {
            // 在列表中找到对应的商品
            const index = this.productList.findIndex(item => item.productId === updatedProduct.productId);
            if (index !== -1) {
                // 更新销量和库存
                this.productList[index].sales = updatedProduct.sales;
                this.productList[index].stock = updatedProduct.stock;
                this.$set(this.productList, index, {
                    ...this.productList[index],
                    sales: updatedProduct.sales,
                    stock: updatedProduct.stock,
                });
            }
        }
    },
    onLoad() {
        this.getShopProducts()
        this.getVipInfo()
    },
    onUnload() {
        uni.$off('updateProductStock', this.handleProductUpdate)
    },
    onShow() {
        this.getShopConfig()
        uni.$on('updateProductStock', this.handleProductUpdate)
    },
    beforeDestroy() {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box !important;
}

.Big_bgi {
    background: #f7f7f7;
}

.head {
    position: relative;
    // padding: 80rpx 0 60rpx;
    // background: $themeColor;
    background: linear-gradient(180deg, #FF734C 0%, #FF991C 100%);
    color: #FFFFFF;
    padding-left: 32rpx;
    padding-right: 32rpx;
    padding-bottom: 24rpx;

    .box {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;

        .btn_box {
            display: flex;
            align-items: center;
            gap: 16rpx;
            margin-top: 16rpx;

            .btn {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12rpx 24rpx;
                border-radius: 2026rpx;
                font-size: 24rpx;
                font-weight: 600;
                color: #fff;
                border: 2rpx solid #FFFFFF;
            }

            .btn_recharge {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12rpx 24rpx;
                border-radius: 2026rpx;
                font-size: 24rpx;
                color: #000000;
                background: #FFFFFF;
            }
        }

        // 等级图标
        .level_img {
            width: 186rpx;
            height: 186rpx;
        }

    }

    .title {
        font-size: 24rpx;
        margin-bottom: 8rpx;
    }

    .number {
        font-size: 64rpx;
        font-weight: 900;
        line-height: 64rpx;
        background: linear-gradient(180deg, #FFFFFF 25%, #FFEDCA 81%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
    }


    .store_img {
        position: absolute;
        right: 0;
        bottom: 0;
        height: 228rpx;
    }
}

// 搜索栏
.query_box {
    background: #fff;
    padding: 16rpx 0;

    .set_input {
        display: flex;
        align-items: center;
        gap: 20rpx;
        padding: 0 24rpx;
        background: #F3F3F3;
        border-radius: 12rpx;
        margin: 0 32rpx;

        .search_img {
            width: 48rpx;
            height: 48rpx;
        }

        input {
            // flex: 1;
            height: 80rpx;
            font-size: 28rpx;
        }
    }

    .tabs_box {
        margin-top: 24rpx;
        padding-left: 24rpx;

        .bagbox {
            display: flex;
            align-items: center;
            gap: 8rpx;
            padding: 6rpx 14rpx;
            border-radius: 6rpx;
            background-color: #f3f5f7;
            font-size: 32rpx;
            line-height: 32rpx;
            color: #3D3D3D;
            min-height: 60rpx;

            &.active {
                color: #fff;
                background: #FC5C00;
            }


            .bagbox_img {
                width: 48rpx;
                height: 48rpx;
            }
        }
    }
}

.main {
    position: relative;
    margin-top: 32rpx;

    .list_box {

        .list_item {
            padding: 32rpx;
            margin-bottom: 16rpx;
            border-radius: 12rpx;
            background: #FFFFFF;

            .item_top {
                display: flex;
                align-items: center;

                .item_img {
                    width: 268rpx;
                    height: 268rpx;
                    min-width: 268rpx;
                    margin-right: 32rpx;
                    border-radius: 12rpx;
                }

                .item_desc {
                    display: flex;
                    align-items: start;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 268rpx;
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;

                    .title {
                        font-size: 28rpx;
                        font-weight: 500;
                        color: #3D3D3D;
                        line-height: 28rpx;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                        max-width: 100%;
                        min-width: 0;
                    }

                    .info {
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;
                        font-size: 24rpx;
                        font-weight: 400;
                        color: #3D3D3D;
                        padding: 8rpx 16rpx;
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 210rpx;
                        margin: 16rpx 0;

                        .level_img {
                            width: 32rpx;
                            height: 32rpx;
                            margin-right: 8rpx;
                        }

                        .number_off_box {
                            font-weight: 600;
                            margin-left: 6rpx;
                        }
                    }

                    .price {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        width: 100%;

                        .text {
                            font-size: 24rpx;
                            color: #3D3D3D;
                            margin-bottom: 4rpx;
                        }

                        .number {
                            font-size: 28rpx;
                            font-weight: 600;
                            color: #3D3D3D;
                            line-height: 28rpx;
                        }

                        & .old .number {
                            text-decoration: line-through;
                            font-weight: 300;
                        }
                    }
                }
            }

            .btn {
                border-radius: 12rpx;
                padding: 12rpx;
                text-align: center;
                background: #BB0000;
                font-size: 28rpx;
                color: #FFFFFF;
                margin-top: 20rpx;

                &.gray {
                    background: #868686;
                }
            }

            .btn2 {
                font-size: 28rpx;
                color: #000;
                text-align: center;
            }
        }
    }
}
</style>