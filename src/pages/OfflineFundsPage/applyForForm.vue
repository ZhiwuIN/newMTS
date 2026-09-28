<template>
    <customnavbar :title="pageTitle" backgroundStr="#004f56" @mtop="mtop" :whiteTitle="true">
        <view class="top-bg" :style="topStyle"></view>
        <!-- 表单 -->
        <view class="form_box">
            <view class="form-item">
                <view class="form-label">{{ $t('offlineFunds.applicationType') }}</view>
                <view class="type-field">{{ applicationTypeName }}</view>
            </view>

            <view class="form-item">
                <view class="form-label">{{ $t('offlineFunds.applicationAmount') }}</view>
                <view class="amount-field">
                    <input v-model="form.amount" class="amount-input" type="digit" placeholder="0.00"
                        placeholder-class="amount-placeholder" />
                    <text class="currency">{{ currency }}</text>
                </view>
            </view>

            <view class="form-item">
                <view class="form-label">{{ $t('offlineFunds.purposeDescription') }}</view>
                <textarea v-model="form.purpose" class="purpose-field"
                    :placeholder="$t('offlineFunds.purposePlaceholder')" placeholder-class="purpose-placeholder"
                    maxlength="500" />
            </view>

            <button class="submit-button" @click="submitForm">{{ $t('offlineFunds.submitApplication') }}</button>
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
            applicationTypeName: '',
            form: {
                amount: '',
                purpose: ''
            }
        }
    },
    onLoad(options) {
        this.pageTitle = options.title || this.$t('offlineFunds.title')
        this.applicationTypeName = options.typeName ? decodeURIComponent(options.typeName) : '--'
    },
    onShow() {
        this.currency = (uni.getStorageSync('settings') || {}).currency || ''
    },
    methods: {
        mtop(height) {
            this.topStyle = `margin-top:-${height}rpx;padding-top:${height}rpx`
        },
        submitForm() {
            this.$emit('submit', {
                typeName: this.applicationTypeName,
                ...this.form
            })
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

.form_box {
    position: relative;
    z-index: 2;
    margin: 24rpx;
    padding: 30rpx 24rpx 34rpx;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 8rpx 24rpx rgba(53, 91, 135, 0.08);

    .form-item+.form-item {
        margin-top: 28rpx;
    }

    .form-label {
        margin-bottom: 12rpx;
        font-size: 28rpx;
        font-weight: 600;
        line-height: 38rpx;
        color: #252b32;
    }

    .type-field,
    .amount-field,
    .purpose-field {
        width: 100%;
        border: 2rpx solid #dfe3e8;
        border-radius: 10rpx;
        background: #fff;
    }

    .type-field {
        height: 70rpx;
        padding: 0 20rpx;
        background: linear-gradient(100deg, #f3f8ff 0%, #f5f5f8 100%);
        font-size: 27rpx;
        font-weight: 600;
        line-height: 68rpx;
        color: $themeColor;
    }

    .amount-field {
        display: flex;
        align-items: center;
        height: 82rpx;
        padding: 0 18rpx;
    }

    .amount-input {
        flex: 1;
        min-width: 0;
        height: 78rpx;
        font-size: 38rpx;
        font-weight: 700;
        color: #171b20;
    }

    .currency {
        margin-left: 16rpx;
        font-size: 26rpx;
        color: #7b8189;
    }

    .purpose-field {
        display: block;
        height: 206rpx;
        padding: 18rpx;
        font-size: 26rpx;
        line-height: 38rpx;
        color: #252b32;
    }

    .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 76rpx;
        margin-top: 38rpx;
        padding: 0;
        border: 0;
        border-radius: 999rpx;
        background: $themeColor;
        // box-shadow: 0 8rpx 18rpx rgba(22, 140, 244, 0.2);
        font-size: 29rpx;
        font-weight: 700;
        line-height: 76rpx;
        color: #fff;

        &::after {
            border: 0;
        }
    }
}

::v-deep .amount-placeholder {
    color: #171b20;
}

::v-deep .purpose-placeholder {
    color: #a4a8ae;
}
</style>
