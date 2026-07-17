<template>
    <view class="Big_bgi" :style="topStyle2"></view>
    <view class="articleCreation">
        <view class="header">
            <view class="left_box">
                <image src="/static/back_icon.png" class="back_img" @click="$customizeBack"></image>
                <view>{{ $t('ID photo') }}</view>
            </view>
        </view>
        <!-- 主要区域 -->
        <view class="main_box">
            <!-- 姓名 -->
            <view class="title">
                {{ $t('identity.name') }}
            </view>
            <view class="title_input">
                <input v-model="realName" :placeholder="$t('identity.placeholder1')" :cursor-color="'#2BBE63'"
                    placeholder-style="color: rgba(0,0,0,.4);font-size: 32rpx;font-weight: 400;" />
                <text class="clear" @tap="realName = ''" v-if="realName">×</text>
            </view>
            <!-- 电话 -->
            <view class="title" style="margin-top: 24rpx;">
                {{ $t('register.phone') }}
            </view>
            <view class="title_input">
                <input v-model="phone" :placeholder="$t('register.phonePlaceHolder')" :cursor-color="'#2BBE63'"
                    placeholder-style="color: rgba(0,0,0,.4);font-size: 32rpx;font-weight: 400;" />
                <text class="clear" @tap="phone = ''" v-if="phone">×</text>
            </view>
            <!-- ID号码 -->
            <view class="title" style="margin-top: 24rpx;">
                {{ $t('ID Number') }}
            </view>
            <view class="title_input">
                <input v-model="idNumber" :placeholder="$t('register.IDPlaceHolder')" :cursor-color="'#2BBE63'"
                    placeholder-style="color: rgba(0,0,0,.4);font-size: 32rpx;font-weight: 400;" />
                <text class="clear" @tap="idNumber = ''" v-if="idNumber">×</text>
            </view>
            <!-- 正面 -->
            <view class="content img_box">
                <view class="title">
                    {{ $t('Front ID Photo') }}
                </view>
                <view class="img_main_box">
                    <view v-if="certificatePhotoUrl" class="item_box">
                        <image :src="certificatePhotoUrl" class="item_img"></image>
                        <!-- 删除按钮 -->
                        <view class="del-btn" @click="delImage('front')">×</view>
                    </view>
                    <view v-else>
                        <image src="/static/Certification/Wrapper.png" class="item_img" @click="selectImage('front')">
                        </image>
                    </view>
                </view>
            </view>
            <!-- 背面 -->
            <!-- <view class="content img_box">
                <view class="title">
                    {{ $t('Back ID Photo') }}
                </view>
                <view class="img_main_box">
                    <view v-if="backIdPhoto" class="item_box">
                        <image :src="backIdPhoto" class="item_img"></image>
                        <view class="del-btn" @click="delImage('back')">×</view>
                    </view>
                    <view v-else>
                        <image src="/static/Certification/Wrapper.png" class="item_img" @click="selectImage('back')">
                        </image>
                    </view>
                </view>
            </view> -->

            <view class="hint">
                * Please enter your genuine personal information and upload your own authentic ID photos *
            </view>

            <view class="btn_box">
                <view class="main_box" @click="onPost">{{ $t('home.Confirm') }}</view>
            </view>
        </view>
    </view>
</template>

<script>
import {
    s3upload,
    kAuthSubmitApi
} from '@/common/api/Certification.js'

export default {
    data() {
        return {
            realName: '',
            phone: '',
            idNumber: '',
            certificatePhoto: '',
            certificatePhotoUrl: '',
            // backIdPhoto: '',
            pageScrollTop: 0,
            topStyle2: '',
        }
    },
    onLoad() {
        this.mtop()
    },
    methods: {
        selectImage(type) {
            const that = this; // 固定写法，解决 this 指向问题
            uni.chooseImage({
                count: 1, // 最多选 1 张
                sourceType: ['album', 'camera'],
                success: async function (res) {
                    const imagePath = res.tempFilePaths[0] || '';
                    if (type === 'front') {
                        that.certificatePhotoUrl = imagePath;
                        uni.showLoading({
                            title: that.$t('loading.btn'),
                        })
                        const uploadRes = await s3upload(that.certificatePhotoUrl)
                        that.certificatePhoto = uploadRes.data.url
                        uni.hideLoading()
                    }
                    //  else if (type === 'back') {
                    //     that.backIdPhoto = imagePath;
                    // }
                }
            })
        },
        // 删除图片
        delImage(type) {
            if (type === 'front') {
                this.certificatePhotoUrl = '';
                this.certificatePhoto = '';
            }
            //  else if (type === 'back') {
            //     this.backIdPhoto = '';
            // }
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
            this.topStyle2 = `height:calc(100vh - ${mtopValue - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = `height:calc(100vh);`
            // #endif
        },
        // 提交
        async onPost() {
            if (!this.realName) {
                this.$showMessage('warning', this.$t('identity.placeholder1'))
                return
            }
            if (!this.phone) {
                this.$showMessage('warning', this.$t('register.phonePlaceHolder'))
                return
            }
            if (!this.idNumber) {
                this.$showMessage('warning', this.$t('register.IDPlaceHolder'))
                return
            }
            if (!this.certificatePhoto) {
                this.$showMessage('warning', this.$t('Front ID Photo'))
                return
            }
            // if (!this.backIdPhoto) {
            //     this.$showMessage('warning', this.$t('Back ID Photo'))
            //     return
            // }
            uni.showLoading({
                title: this.$t('loading.btn'),
            })
            try {
                let {
                    realName,
                    phone,
                    idNumber,
                    certificatePhoto
                } = this
                const postRes = await kAuthSubmitApi({
                    realName,
                    phone,
                    idNumber,
                    certificatePhoto
                })
                this.$showMessage('info', this.$t('申请成功等待审核'))
                uni.hideLoading()
                setTimeout(() => {
                    this.$customizeBack()
                }, 1500)
            }
            catch (err) {
                uni.hideLoading()
                this.$showMessage('warning', err?.msg || 'error')
                this.certificatePhoto = ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.img_box {
    border-bottom: 4rpx solid #f3f3f3;
    padding-bottom: 24rpx;

    .img_main_box {
        display: flex;
        flex-wrap: wrap;
        gap: 15.3rpx;

        .item_box {
            position: relative;
            width: 160rpx;
            height: 160rpx;
        }

        .item_img {
            width: 160rpx;
            height: 160rpx;
        }
    }
}

.del-btn {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background: red;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
}

.Big_bgi {
    position: fixed;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    background: #f3f3f3;
}

::v-deep .uni-textarea-placeholder {
    font-size: 32rpx;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.4);
}

::v-deep uni-textarea {
    width: 100%;
    height: 400rpx;
    border-bottom: 4rpx solid $themeColor;
}

::v-deep .uni-textarea-textarea {
    font-size: 32rpx;
    font-weight: 500;
    color: #3D3D3D;
}

::v-deep .ql-editor.ql-blank::before {
    font-family: MiSans;
    font-size: 32rpx;
    font-style: normal;
    color: rgba(0, 0, 0, 0.4);
}

.articleCreation {
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 22rpx 34rpx;
        background-color: #fff;
        /* #ifdef APP-PLUS */
        padding-top: 80rpx;
        /* #endif */

        .left_box {
            display: flex;
            align-items: center;
            gap: 16rpx;
            font-size: 36rpx;
            color: #000000;

            .back_img {
                width: 48rpx;
                height: 48rpx;
            }
        }

        .right_box {
            .main_box {
                display: flex;
                padding: 8rpx 16rpx;
                background-color: $themeColor;
                border-radius: 2026rpx;
                font-size: 32rpx;
                color: #fff;
            }
        }



    }

    .main_box {
        padding: 32rpx;
        background-color: #fff;

        .title_input {
            position: relative;
            background: #FFFFFF;

            input {
                height: 84rpx;
                font-size: 32rpx;
                font-weight: 500;
                color: #3D3D3D;
                line-height: 36rpx;
                text-align: left;
                font-style: normal;
                padding-right: 62rpx;
                border-bottom: 4rpx solid #f3f3f3;
            }

            .clear {
                position: absolute;
                right: 20rpx;
                top: 50%;
                transform: translateY(-54%);
                font-size: 40rpx;
                color: #999;
            }
        }

        .content {
            .title {
                margin-top: 32rpx;
                margin-bottom: 16rpx;
            }
        }
    }



}

.hint {
    margin-top: 24rpx;
    color: #999;
    font-size: 24rpx;
}

.btn_box {
    display: flex;
    justify-content: center;
    margin-top: 32rpx;

    .main_box {
        display: flex;
        justify-content: center;
        width: 220rpx;
        background-color: $themeColor;
        border-radius: 2026rpx;
        font-size: 32rpx;
        color: #fff;
        padding: 12rpx 0;
    }
}
</style>
