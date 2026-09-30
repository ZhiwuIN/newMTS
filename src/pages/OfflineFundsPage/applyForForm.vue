<template>
    <homenavbar :title="pageTitle" backgroundStr="''" @mtop="mtop">
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

            <!-- 收款信息 -->
            <view class="form-item">
                <view class="form-label">{{ $t('offlineFunds.paymentInformation') }}</view>
                <view class="account-box">
                    <view class="account-select">
                        <uni-data-select v-model="form.memberBankId" :localdata="bankOptions" :emptyTips="$t('noData')"
                            :placeholder="$t('task.asktips')" :clear="false" />
                    </view>
                </view>
            </view>

            <view class="form-item">
                <view class="form-label">{{ $t('offlineFunds.purposeDescription') }}</view>
                <textarea v-model="form.description" class="purpose-field"
                    :placeholder="$t('offlineFunds.purposePlaceholder')" placeholder-class="purpose-placeholder"
                    maxlength="500" />
            </view>

            <button class="submit-button" @click="submitForm">{{ $t('offlineFunds.submitApplication') }}</button>
        </view>

        <uni-popup ref="bankPromptPopup" type="center" :mask-click="false">
            <view class="prompt-pop-page">
                <view class="prompt-pop-title">{{ $t('home.Prompt') }}</view>
                <view class="prompt-pop-content">{{ $t('withdrawal.failTips2') }}</view>
                <view class="prompt-pop-actions">
                    <button class="prompt-cancel-button" @click="closeBankPrompt">{{ $t('pay.no') }}</button>
                    <button class="prompt-confirm-button" @click="goToBankManagement">{{ $t('pay.yes') }}</button>
                </view>
            </view>
        </uni-popup>
    </homenavbar>
</template>

<script>
import homenavbar from '@/component/home-navbar/home-navbar.vue';
import {
    offlinePayoutApplyApi
} from '@/common/api/OfflineFunds.js'
import { bankListApi } from '@/common/api/withdrawal.js'
export default {
    components: { homenavbar },
    data() {
        return {
            pageTitle: '',
            topStyle: '',
            currency: '',
            applicationTypeName: '',
            form: {
                amount: '',
                memberBankId: '',
                description: ''
            },
            bankOptions: [],
            typeCode: '',
            isLoding: false
        }
    },
    onLoad(options) {
        this.pageTitle = options.title || this.$t('offlineFunds.title')
        this.applicationTypeName = options.typeName ? decodeURIComponent(options.typeName) : '--'
        this.typeCode = options.typeCode
    },
    onShow() {
        this.currency = (uni.getStorageSync('settings') || {}).currency || ''
        this.getBankList()
        this.isLoding = false
    },
    methods: {
        // 银行卡列表
        getBankList() {
            bankListApi().then(res => {
                const banks = res.data || []
                this.bankOptions = banks.map(item => ({
                    value: item.bid,
                    text: `${item.bankName || ''} ${item.cardNo || ''}`.trim()
                }))

                if (!this.bankOptions.some(item => item.value === this.form.memberBankId)) {
                    this.form.memberBankId = ''
                }

                if (this.bankOptions.length === 0) {
                    this.$nextTick(() => this.$refs.bankPromptPopup.open())
                }
            }).catch(err => {
                this.bankOptions = []
                this.form.memberBankId = ''
                this.$showMessage('warning', err.msg)
            })
        },
        closeBankPrompt() {
            this.$refs.bankPromptPopup.close()
        },
        goToBankManagement() {
            this.$refs.bankPromptPopup.close()
            uni.navigateTo({
                url: '/pages/MinePage/mobilePayment'
            })
        },
        mtop(height) {
            this.topStyle = `margin-top:-${height}rpx;padding-top:${height}rpx`
        },
        submitForm() {
            if (this.form.memberBankId === '' || this.form.memberBankId == null) {
                this.$showMessage('warning', `${this.$t('task.asktips')} ${this.$t('offlineFunds.paymentInformation')}`)
                return
            }

            let form = {
                typeCode: this.typeCode,
                requestNo: `${uni.getStorageSync('userInfo')?.userId || ''}_${Date.now()}`,
                ...this.form
            }
            if (this.isLoding) return
            this.isLoding = true
            offlinePayoutApplyApi(form).then(res => {
                this.$showMessage('warning', this.$t('申请成功等待审核'))
                setTimeout(() => {
                    uni.navigateBack()
                }, 1500)
            }).catch(err => {
                this.$showMessage('warning', err.msg);
                this.isLoding = false
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
        padding: 18rpx;
        font-size: 26rpx;
        line-height: 38rpx;
        color: #252b32;
    }

    .purpose-field {
        height: 206rpx;
    }

    .account-box {
        display: flex;
        align-items: center;
        width: 100%;
        height: 84rpx;
        padding: 0 18rpx;
        border: 2rpx solid #dfe3e8;
        border-radius: 10rpx;
        background: #fff;
    }

    .account-card {
        width: 72rpx;
        height: 72rpx;
        margin-right: 24rpx;
    }

    .account-select {
        flex: 1;
        min-width: 0;
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

.prompt-pop-page {
    width: 570rpx;
    padding: 40rpx 54rpx 28rpx;
    border-radius: 28rpx;
    background: #fff;
}

.prompt-pop-title {
    font-size: 32rpx;
    font-weight: 500;
    line-height: 42rpx;
    text-align: center;
    color: #000;
}

.prompt-pop-content {
    margin-top: 40rpx;
    font-size: 28rpx;
    line-height: 36rpx;
    text-align: center;
    color: #1c2d57;
}

.prompt-pop-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 54rpx;
}

.prompt-cancel-button,
.prompt-confirm-button {
    width: 212rpx;
    height: 72rpx;
    padding: 0;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 72rpx;

    &::after {
        border: 0;
    }
}

.prompt-cancel-button {
    background: #ebebeb;
    color: #000;
}

.prompt-confirm-button {
    background: $themeColor;
    box-shadow: 0 4rpx 16rpx #b2c8fb;
    color: #fff;
}

::v-deep .amount-placeholder {
    color: #171b20;
}

::v-deep .purpose-placeholder {
    color: #a4a8ae;
}

::v-deep .account-select .uni-select {
    border: 0;
    padding: 0;
}

::v-deep .account-select .uni-select__input-text {
    font-size: 26rpx;
    color: #252b32;
}

::v-deep .account-select .uni-select__input-placeholder {
    font-size: 26rpx;
    color: #a4a8ae;
}
</style>
