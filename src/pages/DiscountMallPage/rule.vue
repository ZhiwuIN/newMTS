<template>
    <customnavbar :title="$t('活动说明')">
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
import {
    shopDescriptionApi
} from "@/common/api/discountMall.js";
export default {
    components: {
        customnavbar
    },
    data() {
        return {
            content: '',
        }
    },
    methods: {

    },
    onLoad() {
        shopDescriptionApi().then(res => {
            this.content = formatRichText(res.data.description)
        })
    }
}
</script>

<style scoped lang="scss">
.common-page {
    padding: 50rpx;
}

.common-info {
    /* font-family: "DINPro", sans-serif; */
    /* font-weight: 600; */
    /* font-size: 28rpx; */
    /* color: #1C2D57; */
    /* line-height: 36rpx; */
    /* text-align: justify; */
    /* font-style: normal; */
    margin-bottom: 40rpx;
    word-break: break-all;

    img {
        max-width: 100%;
    }
}
</style>