<template>
    <customnavbar :title="pageTitle || ''" backgroundStr="#fff" @mtop='mtop'>
        <view class="Big_bgi" :style="topStyle2"></view>
        <view class="common-page">
            <view class="main_box">
                <view class="article_title">{{ articleInfo.title }}</view>
                <view class="author_box">
                    <view class="ava_box">
                        <image class="ava_img" fit="fill" :src="articleInfo.avatar || '/static/default-avatar.png'">
                        </image>
                        <view>{{ articleInfo.category == 1 ? webTitle : (articleInfo.username || '***') }}</view>
                    </view>
                    <view class="date">{{ articleInfo.createTime || '--' }}</view>
                </view>
                <rich-text :nodes="articleInfo.content" class="common-info"></rich-text>
            </view>
            <view style="width: 100%;height: 36rpx;background-color: #f7f7f7;"></view>
            <view class="comment">
                <view class="title">{{$t('Comentarios')}} ({{ articleInfo.commentCount || 0 }})</view>
                <view>
                    <scroll-view scroll-y class="scroll-view-box" @scrolltolower="onReachBottom">
                        <view v-for="item in commentList" class="item_box">
                            <view class="item_top">
                                <view class="left_box">
                                    <image class="ava_img" fit="fill"
                                        :src="item?.avatar || '/static/default-avatar.png'">
                                    </image>
                                    <view class="text_box">
                                        <view class="name">{{ item?.category == 1 ? webTitle : (item?.username || '***')
                                        }}</view>
                                        <view class="date">{{ item?.createTime || '--' }}</view>
                                    </view>
                                </view>
                                <view class="item_Level">
                                    <image class="vipLevelImage" fit="fill" :src="item?.vipLevelImage">
                                    </image>
                                    <view>{{ item?.vipLevel }}</view>
                                </view>
                            </view>
                            <view class="item_main">{{ item?.content }}</view>
                        </view>
                    </scroll-view>
                </view>
            </view>

            <view class="bottom_box">
                <view class="like_box" v-if="!comment.content">
                    <image class="like_img" fit="fill" src="/static/article/like.png" @click="like"
                        v-if="!this.articleInfo.favorited"></image>
                    <image class="like_img" fit="fill" src="/static/article/like_a.png" @click="like" v-else></image>
                    <view>{{ formatNumber(articleInfo.favoriteCount) }}</view>
                </view>
                <view class="comment_box">
                    <textarea :auto-height="true" confirm-type="send" :maxlength="250"
                        :placeholder="$t('请输入评论')" v-model="comment.content" />
                    <view class="btn" @click="postComment">{{ $t('发送') }}</view>
                </view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    postInfoApi,
    commentRootListApi,
    commentAddApi,
    addFavoriteApi,
    removeFavoriteApi
} from "@/common/api/article.js";
import {
    formatRichText
} from "@/utils/utils.js"
export default {
    components: {
        customnavbar
    },
    data() {
        return {
            commentList: [],
            comment: {
                content: ''
            },
            webTitle: '',
            pageTitle: '',
            articleInfo: {},
            id: '',
            page: {
                pageNum: 1,
                pageSize: 10
            },
            loading: false,
            hasMore: true,
            topStyle2: ''
        }
    },
    methods: {
        getCommentRootList() {
            if (this.loading) return
            this.loading = true
            commentRootListApi(this.id, this.page).then((res) => {
                if (this.page.pageNum == 1) this.commentList = res.rows || []
                else this.commentList.push(...res.rows)
                this.hasMore = this.commentList.length < res.total
            }).catch((err) => {
                this.$showMessage('warning', err.msg);
            }).finally(() => {
                this.loading = false
            })
        },
        postComment() {
            if (this.loading) return
            this.comment.content = this.comment.content.trim()
            if (!this.comment.content) {
                this.$showMessage('warning', this.$t(('请输入内容')));
                return
            }
            this.loading = true
            commentAddApi({
                postId: this.id,
                content: this.comment.content
            }).then((res) => {
                this.$showMessage('info', this.$t(('发布成功')));
                this.comment.content = ''
            }).catch((err) => {
                this.$showMessage('warning', err.msg);
            }).finally(() => {
                this.loading = false
            })
        },
        formatNumber(num) {
            if (!num && num !== 0) return '0'
            if (num > 9999) {
                return '9,999+'
            }
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        },
        mtop(e) {
            // #ifdef H5
            this.topStyle2 = `height:calc(100vh - ${e - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = `height:calc(100vh);`
            // #endif
        },
        getNoticeDetails() {
            postInfoApi(this.id).then((res) => {
                this.articleInfo = res.data
                this.articleInfo.content = formatRichText(this.articleInfo.content)
            }).catch((err) => {
                this.$showMessage('warning', err.msg);
            })
        },
        onReachBottom() {
            if (!this.loading && this.hasMore) {
                this.page.pageNum = Math.floor(this.commentList.length / this.page.pageSize) + 1
                this.getCommentRootList()
            }
        },
        like() {
            let api = this.articleInfo.favorited ? removeFavoriteApi(this.id) : addFavoriteApi(this.id)
            api.then(res => {
                this.articleInfo.favoriteCount += this.articleInfo.favorited ? -1 : 1
                this.articleInfo.favorited = !this.articleInfo.favorited

                if (this.articleInfo.favorited) {
                    this.$showMessage('info', this.$t('点赞成功'));
                }

                // 通知列表页更新
                uni.$emit('articleLikeChange', {
                    id: this.id,
                    favorited: this.articleInfo.favorited,
                    favoriteCount: this.articleInfo.favoriteCount
                })

            }).catch((err) => {
                this.$showMessage('warning', err.msg);
            })
        },
        // 浏览量+1
        addViewCount() {
            uni.$emit('articleViewChange', {
                id: this.id
            })
        }
    },
    onLoad(options) {
        this.pageTitle = options.title
        this.id = options.id
        this.webTitle = uni.getStorageSync('settings').webTitle
        this.getNoticeDetails()
        this.getCommentRootList()
        this.addViewCount()
    }
}
</script>

<style scoped lang="scss">
.Big_bgi {
    position: fixed;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    background: #fff;
}

.common-page {
    padding-bottom: 114rpx;

    .main_box {
        padding: 32rpx;
        padding-top: 16rpx;

        .article_title {
            font-size: 48rpx;
            font-weight: 600;
            margin-bottom: 32rpx;
            color: #3D3D3D;
        }

        .author_box {
            display: flex;
            align-items: center;
            justify-content: start;
            gap: 36rpx;
            margin-bottom: 48rpx;

            .ava_box {
                display: flex;
                align-items: center;
                justify-content: start;
                gap: 12rpx;
                font-size: 28rpx;
                color: #313131;

                .ava_img {
                    width: 40rpx;
                    height: 40rpx;
                    background: #D8D8D8;
                    border-radius: 50%;
                }
            }

            .date {
                font-size: 28rpx;
                color: rgba(175, 175, 175, 0.9);
            }
        }
    }

    .comment {
        padding: 32rpx;

        .title {
            font-size: 28rpx;
            font-weight: 500;
            color: #3D3D3D;
            margin-bottom: 32rpx;
        }

        .item_box {
            padding: 24rpx 0;
            border-bottom: 2rpx solid #F6F6F6;

            .item_top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20rpx;

                .left_box {
                    display: flex;
                    align-items: center;

                    .ava_img {
                        width: 64rpx;
                        height: 64rpx;
                        border-radius: 50%;
                        margin-right: 16rpx;
                    }

                    .text_box {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;

                        .name {
                            font-size: 28rpx;
                            color: #494949;
                        }

                        .date {
                            font-size: 20rpx;
                            color: rgba(175, 175, 175, 0.9);
                        }
                    }
                }

                .item_Level {
                    display: flex;
                    align-items: center;
                    gap: 8rpx;
                    font-size: 24rpx;
                    font-weight: 500;
                    border-radius: 2026rpx;
                    padding: 6rpx 16rpx;
                    color: #74848E;
                    background: rgba(117, 117, 117, 0.2);

                    .vipLevelImage {
                        width: 32rpx;
                        height: 32rpx;
                    }


                }
            }
        }
    }

    .bottom_box {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        gap: 32rpx;
        padding: 12rpx 32rpx;
        background-color: #fff;
        border-top: 2rpx solid #EBEBEB;

        .like_box {
            display: flex;
            align-items: center;
            justify-content: start;
            gap: 8rpx;
            font-size: 28rpx;
            color: rgba(51, 51, 51, 0.9);

            .like_img {
                width: 48rpx;
                height: 48rpx;
            }
        }

        .comment_box {
            flex: 1;
            display: flex;
            align-items: end;
            padding-left: 24rpx;
            padding-right: 6rpx;
            min-height: 72rpx;
            border-radius: 36rpx;
            background-color: #f6f6f6;

            .btn {
                box-sizing: border-box;
                padding: 6rpx 26rpx;
                background: $themeColor2;
                border-radius: 2026rpx;
                font-size: 28rpx;
                color: #FFFFFF;
                white-space: nowrap;
                line-height: 48rpx;
                margin-bottom: 6rpx;
            }
        }
    }
}

::v-deep uni-textarea {
    width: 100% !important;
}

::v-deep .uni-textarea-wrapper {
    box-sizing: border-box;
    margin-bottom: 16rpx;
}

::v-deep .uni-textarea-textarea {
    box-sizing: border-box;
    color: #202020;
}
</style>