<template>
    <customnavbar :title="$t('Rule')">
        <view class="common-page">
            <rich-text :nodes="content" class="common-info"></rich-text>
        </view>

    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    formatRichText
} from "@/utils/utils.js"
export default {
    components: {
        customnavbar
    },
    data() {
        return {
            content: ''
        }
    },
    methods: {

    },
    onLoad() {
        this.content = uni.getStorageSync('SocialSecurityFundRule')
    }
}
</script>

<style scoped lang="scss">
.common-page {
    padding: 32rpx;
}

.common-info {
    margin-bottom: 40rpx;

    img {
        max-width: 100%;
    }
}
</style>