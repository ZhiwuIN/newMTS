<template>
    <customnavbar :title="$t('商品详情')" @mtop='mtop'>
        <view class="Big_bgi" :style="topStyle"></view>

        <view class="task-detail">
            <!-- 图片轮播 -->
            <view class="swiperImgBox">
                <swiper :autoplay="true" :style="{ height: '480rpx' }" @change="handleChange" :current="currentSwiperi">
                    <swiper-item v-for="(item, index) in [commodityInfo.coverImage]" :key="item"
                        style="display: flex;justify-content: center;">
                        <image :src="item" class="swiper_img" mode="heightFix"></image>
                    </swiper-item>
                </swiper>
                <view class="dots_box" v-if="[commodityInfo.coverImage].length > 1">
                    <view v-for="(item, index) in [commodityInfo.coverImage]" :key="item + index"
                        :class="currentSwiperi == index ? 'dots_a' : 'dots'" @click="currentSwiperi = index">
                        <image :src="item" class="dots_img" mode="heightFix"></image>
                    </view>
                </view>
            </view>

            <!-- 标题区域 -->
            <view class="title_box">
                <view class="price_box">
                    <view class="price">{{ commodityInfo.salePricePcoin }} </view>
                    <view class="original_cost">{{ commodityInfo.listPricePcoin }} </view>
                </view>
                <view class="title">
                    {{ commodityInfo.name }}
                </view>
                <view class="off_info">
                    <image class="level_img" :src="commodityInfo.starLevelIcon"></image>
                    <view>{{ commodityInfo.starLevelName }} {{ $t('特惠') }}</view>
                    <view class="number_off_box">{{ commodityInfo.discountZhe }}% {{ $t('off') }}</view>
                </view>
                <!-- 销量&库存 -->
                <view class="sales_stock_box">
                    <view class="item_box">
                        <view class="text">{{ $t('销量') }}</view>
                        <view class="number">{{ commodityInfo.sales || 0 }}</view>
                    </view>
                    <view class="item_box">
                        <view class="text">{{ $t('库存') }}</view>
                        <view class="number">{{ commodityInfo.stock || 0 }}</view>
                    </view>
                </view>
            </view>

            <!-- 各等级优惠 -->
            <!-- <view class="specialOffer">
                    <table cellspacing="0">
                        <tr>
                            <th>{{ $t('Membership Level') }}</th>
                            <th>{{ $t('Discount') }}</th>
                            <th>{{ $t('Final Price') }}</th>
                        </tr>
                        <view class="list_box">
                            <tr v-for="(item, index) in 6" :key="index">
                                <td>
                                    <view class="level_img_box">
                                        <image class="level_img" src="/static/DiscountMall/level_img.png"></image>
                                        <view>{{ $t('V1') }}</view>
                                    </view>
                                </td>
                                <td>
                                    10% off
                                </td>
                                <td>
                                    8800.00
                                </td>
                            </tr>
                        </view>
                    </table>
                </view> -->

            <!-- 商品详情 -->
            <view class="taskDetails_content" v-if="commodityInfo.description">
                <view class="title">{{ $t('商品介绍') }}</view>
                <rich-text :nodes="commodityInfo.description" />
            </view>

            <!-- 购买按钮 -->
            <view class="start-btn-box" v-if="commodityInfo.canOrder && commodityInfo.stock > 0">
                <view class="start-btn" @click="showPopup">
                    {{ $t('立即下单') }}
                </view>
            </view>


            <!-- 确认购买弹框 -->
            <uni-popup ref="inquiryPaypopup" type="center" border-radius="10px 10px 0 0">
                <view class="prompt_pop_page1">
                    <view class="prompt_pop_top">{{ $t('确认购买_title') }}</view>
                    <view class="item_top">
                        <!-- 商品图片 -->
                        <image class="item_img" :src="commodityInfo.coverImage"></image>
                        <!-- 商品描述 -->
                        <view class="item_desc">
                            <view class="title">{{ commodityInfo.name }}</view>
                            <view class="info">
                                <image class="level_img" :src="commodityInfo.starLevelIcon"></image>
                                <view>{{ commodityInfo.starLevelName }} {{ $t('特惠') }}</view>
                                <view class="number_off_box">{{ commodityInfo.discountZhe }}% {{ $t('off') }}</view>
                            </view>
                            <!-- 价格 -->
                            <view class="price">
                                <view class="price_box">
                                    <view class="text">{{ $t('折扣价') }}</view>
                                    <view class="number">{{ commodityInfo.salePricePcoin || 0 }}</view>
                                </view>
                                <view class="price_box old">
                                    <view class="text">{{ $t('原价') }}</view>
                                    <view class="number">{{ commodityInfo.listPricePcoin || 0 }}</view>
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="prompt_pop_bottom">
                        <button class="prompt_cancel_btn" @click="prompt_cancel_inquiry">{{ $t('Cancel') }}</button>
                        <button class="prompt_confirm_btn" @click="prompt_confirm_inquiry">{{ $t('Confirm')
                        }}</button>
                    </view>
                </view>
            </uni-popup>

            <!-- 抢购成功 -->
            <uni-popup ref="paypopup3" type="center">
                <view class="prompt_pop_page3">
                    <image class="img" src="/static/DiscountMall/check_circle.png"></image>
                    <view class="prompt_pop_top">{{ $t('下单成功') }}</view>
                    <view class="prompt_pop_taps">{{ $t('15日内达') }}</view>
                    <view class="prompt_pop_bottom">
                        <button class="prompt_confirm_btn" @click="prompt_confirm2">{{ $t('Confirm') }}</button>
                    </view>
                </view>
            </uni-popup>

        </view>

        <!-- 其他提示 -->
        <uni-popup ref="promptpopup3" type="center" :mask-click="false">
            <view class="prompt_pop_page">
                <view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
                <view class="prompt_pop_taps">{{ failTips }}</view>
                <view class="prompt_pop_bottom">
                    <button class="prompt_confirm_btn" @click="prompt_confirm_yes2">{{ $t('pay.yes') }}</button>
                </view>
            </view>
        </uni-popup>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    formatRichText
} from "@/utils/utils.js";
import {
    shopProductInfoApi,
    shopOrderApi
} from "@/common/api/discountMall.js";
export default {
    components: {
        customnavbar
    },
    data() {
        return {
            topStyle: '',
            failTips: '',
            prompt_pop_taps: '', // 成功提示
            currentSwiperi: 0, // 轮播指示
            taskId: 0,
            currentSwiperHeight: '420rpx', // 当前轮播图高度
            commodityInfo: {},
            loading: false
        }
    },
    onLoad(options) {
        this.taskId = options.id
        this.getShopProductInfo()
    },
    methods: {
        // 打开确认购买弹框
        showPopup() {
            this.$refs.inquiryPaypopup?.open()
        },
        // 确认购买
        prompt_confirm_inquiry() {
            this.$refs.inquiryPaypopup?.close()
            if (this.loading) return
            this.loading = true
            this.ShopNow()
        },
        // 取消确认购买
        prompt_cancel_inquiry() {
            this.$refs.inquiryPaypopup?.close()
        },
        // 执行购买操作
        ShopNow() {
            uni.showLoading({
                title: this.$t('loading.btn')
            });
            shopOrderApi({
                productId: this.taskId
            }).then(res => {
                if (res.code == 200) {
                    this.$refs.paypopup3.open()
                    this.getShopProductInfo()
                    const updatedProduct = {
                        productId: this.commodityInfo.productId,
                        sales: (this.commodityInfo.sales || 0) + 1,
                        stock: (this.commodityInfo.stock || 0) - 1
                    };
                    // 列表页更新销量与库存
                    uni.$emit('updateProductStock', updatedProduct);
                }
            }).catch((err) => {
                console.log('request fail', err);
                // this.$showMessage('warning', err.msg);
                this.failTips = err.msg
                this.$refs.promptpopup3.open()
            }).finally(() => {
                uni.hideLoading();
                this.loading = false
            })

        },
        // 购买成功后确认
        prompt_confirm2() {
            this.$refs.paypopup3.close()
            this.getShopProductInfo()
        },
        // 其他提示确认
        prompt_confirm_yes2() {
            this.$refs.promptpopup3.close()
            return
        },
        getShopProductInfo() {
            shopProductInfoApi(this.taskId).then((res) => {
                this.commodityInfo = res.data;
                if (!this.commodityInfo.description) return
                this.commodityInfo.description = formatRichText(this.commodityInfo.description)
            }).catch((err) => {
                console.log('request fail', err);
                this.$showMessage('warning', err.msg);
            })
        },
        // 轮播图切换
        handleChange(e) {
            this.currentSwiperi = e.detail.current
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle = `height:calc(100vh - ${e - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle = `height:calc(100vh);`
            // #endif
        }
    }
}
</script>

<style lang="scss" scoped>
.Big_bgi {
    background: #f7f7f7;
}

// 确定购买弹窗
.prompt_pop_page1 {
    width: 570rpx;
    background: #FFFFFF;
    border-radius: 12rpx;
    padding: 40rpx 48rpx 48rpx;

    .prompt_pop_top {
        font-family: "DINPro-Medium", sans-serif;
        font-weight: 600;
        font-size: 36rpx;
        color: #3D3D3D;
        text-align: center;
        font-style: normal;
        margin-bottom: 28rpx;
    }

    .prompt_pop_bottom {
        display: flex;
        margin-top: 42rpx;

        .prompt_cancel_btn {
            width: 250rpx;
            height: 72rpx;
            background: #fff2f2;
            border-radius: 12rpx;
            font-family: "DINPro-Medium", sans-serif;
            font-weight: 500;
            font-size: 32rpx;
            color: #bb0000;
            line-height: 72rpx;
            text-align: center;
            font-style: normal;
        }

        .prompt_confirm_btn {
            width: 250rpx;
            height: 72rpx;
            background: #bb0000;
            // box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
            border-radius: 12rpx;
            font-family: "DINPro-Black", sans-serif;
            font-family: DINPro, DINPro;
            font-weight: 500;
            font-size: 32rpx;
            color: #fff;
            line-height: 72rpx;
            text-align: center;
            font-style: normal;
        }
    }

    .item_top {
        display: flex;
        align-items: center;

        .item_img {
            width: 194rpx;
            height: 194rpx;
            min-width: 194rpx;
            margin-right: 32rpx;
        }

        .item_desc {
            display: flex;
            align-items: start;
            flex-direction: column;
            justify-content: space-between;
            height: 194rpx;
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
}

// 购买成功弹窗
.prompt_pop_page3 {
    width: 570rpx;
    background: #FFFFFF;
    border-radius: 12rpx;
    padding: 40rpx 48rpx 48rpx;

    .img {
        display: block;
        width: 160rpx;
        height: 160rpx;
        margin: 0 auto;
    }

    .prompt_pop_top {
        font-family: "DINPro-Medium", sans-serif;
        font-weight: 600;
        font-size: 36rpx;
        color: #3D3D3D;
        text-align: center;
        font-style: normal;
        margin: 16rpx 0 26rpx;
    }

    .prompt_pop_taps {
        font-family: "DINPro-Regular", sans-serif;
        font-weight: 400;
        font-size: 28rpx;
        color: #666666;
        line-height: 36rpx;
        text-align: left;
        font-style: normal;
        word-break: break-all;
    }

    .prompt_pop_bottom {
        display: flex;
        margin-top: 42rpx;

        .prompt_cancel_btn {
            width: 250rpx;
            height: 72rpx;
            background: #fff2f2;
            border-radius: 12rpx;
            font-family: "DINPro-Medium", sans-serif;
            font-weight: 500;
            font-size: 32rpx;
            color: #bb0000;
            line-height: 72rpx;
            text-align: center;
            font-style: normal;
        }

        .prompt_confirm_btn {
            width: 250rpx;
            height: 72rpx;
            background: #bb0000;
            // box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
            border-radius: 12rpx;
            font-family: "DINPro-Black", sans-serif;
            font-family: DINPro, DINPro;
            font-weight: 500;
            font-size: 32rpx;
            color: #fff;
            line-height: 72rpx;
            text-align: center;
            font-style: normal;
        }
    }

}


.prompt_pop_page {
    width: 570rpx;
    background: #FFFFFF;
    border-radius: 12rpx;
    padding: 40rpx 54rpx 28rpx 54rpx;

    .prompt_pop_top {
        font-family: "DINPro-Medium", sans-serif;
        font-weight: 500;
        font-size: 32rpx;
        color: #000000;
        line-height: 42rpx;
        text-align: center;
        font-style: normal;
    }

    .prompt_pop_taps {
        font-family: "DINPro-Regular", sans-serif;
        font-weight: 400;
        font-size: 28rpx;
        color: #1C2D57;
        line-height: 36rpx;
        text-align: center;
        font-style: normal;
        margin-top: 40rpx;
    }

    .prompt_pop_bottom {
        display: flex;
        margin-top: 54rpx;

        .prompt_cancel_btn {
            width: 250rpx;
            height: 72rpx;
            background: #fff2f2;
            border-radius: 12rpx;
            font-family: "DINPro-Medium", sans-serif;
            font-weight: 500;
            font-size: 32rpx;
            color: #bb0000;
            line-height: 72rpx;
            text-align: center;
            font-style: normal;
        }

        .prompt_confirm_btn {
            width: 250rpx;
            height: 72rpx;
            background: #bb0000;
            // box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
            border-radius: 12rpx;
            font-family: "DINPro-Black", sans-serif;
            font-family: DINPro, DINPro;
            font-weight: 500;
            font-size: 32rpx;
            color: #fff;
            line-height: 72rpx;
            text-align: center;
            font-style: normal;
        }
    }
}

.pay_pop_page {
    background: #FFFFFF;
    border-radius: 12rpx;
    width: 574rpx;
    padding: 40rpx;

    .pay_pop_top {
        font-family: "DINPro-Medium", sans-serif;
        font-weight: 500;
        font-size: 32rpx;
        color: #000000;
        line-height: 42rpx;
        text-align: center;
        font-style: normal;
    }

    .pay_pop_no {
        font-family: "DINPro-Bold", sans-serif;
        font-weight: bold;
        font-size: 32rpx;
        color: #000000;
        line-height: 42rpx;
        text-align: center;
        font-style: normal;
        margin: 48rpx 0;
    }

    .pay_pop_content {
        font-family: "DINPro-Medium", sans-serif;
        font-weight: 500;
        font-size: 24rpx;
        color: #000000;
        line-height: 30rpx;
        text-align: justify;
        font-style: normal;
        margin-top: 6rpx;
    }

    .password-box {
        display: flex;
        justify-content: space-between;
        margin-top: 22rpx;

        .input-box {
            width: 72rpx;
            height: 72rpx;
            border-radius: 8rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40rpx;
            background-color: #ECECEC;
        }
    }

    .hidden-input {
        position: absolute;
        top: -999px;
        left: -999px;
        width: 1px;
        height: 1px;
        opacity: 0;
    }

    .pay_confirm_btn {
        height: 96rpx;
        background: #bb0000;
        border-radius: 12rpx;
        margin-top: 34rpx;
        font-family: "DINPro-Bold", sans-serif;
        font-weight: bold;
        font-size: 36rpx;
        color: #FFFFFF;
        line-height: 96rpx;
        text-align: center;
        font-style: normal;
        text-transform: none;
        margin-bottom: 14rpx;
    }

}

.mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    background: #000000;
    opacity: 0.7;
    z-index: 9999;
}

.poster-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18rpx;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 36rpx;
    color: $gradualColor2;
    text-align: center;
    font-style: normal;
}


.task-detail {
    height: 100%;
    padding-bottom: 112rpx;
    background-color: #f5f5f5;

    .start-btn-box {
        position: fixed;
        bottom: 0;
        display: flex;
        align-items: center;
        height: 112rpx;
        // background: #FFFFFF;
    }

    .start-btn {
        width: 650rpx;
        margin: 0 50rpx;
        height: 96rpx;
        background: #BB0000;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #fff;
        line-height: 96rpx;
        text-align: center;
        font-style: normal;
        text-transform: none;
    }

    .swiperImgBox {
        position: relative;
        background-color: #fff;

        .swiper_img {
            width: 100%;
            height: 480rpx;
        }

        .dots_box {
            box-sizing: border-box;
            width: 100%;
            height: 164rpx;
            background-color: rgba(255, 255, 255, 0.32);
            position: absolute;
            bottom: 0;
            display: flex;
            // justify-content: center;
            align-items: center;
            gap: 20rpx;
            padding-left: 40rpx;

            .dots {
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                width: 132rpx;
                height: 132rpx;
                border-radius: 16rpx;
                overflow: hidden;
                border: 6rpx solid transparent;
                // background-color: #fff;
            }

            .dots_img {
                // width: 100%;
                height: 100%;
            }

            .dots_a {
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                width: 132rpx;
                height: 132rpx;
                border-radius: 16rpx;
                overflow: hidden;
                border: 6rpx solid #fff;
                background-color: #fff;
            }
        }
    }

    .title_box {
        padding: 32rpx;
        padding-top: 36rpx;
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 16rpx;
        margin-bottom: 32rpx;
        background-color: #fff;

        .price_box {
            display: flex;
            align-items: end;
            gap: 8rpx;

            .price {
                font-family: DINPro, DINPro;
                font-weight: 500;
                font-size: 48rpx;
                color: #BB0000;
                font-style: normal;
                line-height: 48rpx;
            }

            .original_cost {
                font-family: DINPro, DINPro;
                font-size: 36rpx;
                color: #000000;
                font-style: normal;
                text-decoration: line-through;
                line-height: 36rpx;
            }
        }

        .title {
            font-family: PingFangSC, PingFang SC;
            font-size: 36rpx;
            font-weight: 500;
            line-height: normal;
            color: #3D3D3D;
            text-align: left;
            font-style: normal;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .off_info {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            font-weight: 400;
            color: #3D3D3D;
            padding: 8rpx 16rpx;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 2026rpx;

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

        .sales_stock_box {
            display: flex;
            align-items: center;
            justify-content: start;
            gap: 48rpx;

            .item_box {
                display: flex;
                align-items: center;
                gap: 12rpx;
            }

            .text {
                font-size: 28rpx;
                color: #3D3D3D;
                line-height: 28rpx;
            }

            .number {
                font-size: 32rpx;
                font-weight: 600;
                color: #3D3D3D;
                line-height: 32rpx;
            }
        }
    }

    // 优惠活动
    .specialOffer {
        background-color: #fff;
        padding: 32rpx;
        margin-bottom: 32rpx;

        table {

            .list_box {
                height: 522rpx;
                overflow-y: auto;

                tr:nth-child(2n - 1) {
                    background-color: #f6f6f6;
                }
            }

            tr {
                display: inline-block;
                padding: 24rpx;

                th,
                td {
                    width: 140rpx;
                    font-size: 24rpx;
                    font-weight: normal;
                    color: #3D3D3D;
                    text-align: left;
                }

                th:nth-child(1),
                td:nth-child(1) {
                    width: 320rpx;
                }

                th:nth-child(2),
                td:nth-child(2) {
                    width: 170rpx;
                }

                td:nth-child(2) {
                    font-weight: 600;
                }
            }
        }

        .level_img_box {
            display: flex;
            align-items: center;
            gap: 16rpx;

            .level_img {
                width: 48rpx;
                height: 48rpx;
            }
        }

        .off {}

    }

    // 详情
    .taskDetails_content {
        box-sizing: border-box;
        padding: 32rpx;
        background-color: #fff;

        .title {
            font-size: 32rpx;
            font-weight: bold;
        }
    }

}
</style>

<style>
img {
    width: 100%;
    max-width: 100%;
}
</style>