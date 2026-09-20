<template>
	<view class="post-card" :class="{ compact }" @click="toArticleInfo(post)">
		<view class="post-head">
			<image class="avatar_img"
				:src="post.userType == 'member' ? (post.avatar || '/static/default-avatar.png') : '/static/1024.png'">
			</image>
			<view class="author">
				<view class="name-row">
					<text class="name">{{ post.userType == 'member' ? post.author : webTitle }}</text>
					<image class="verified" v-if="post.userType !== 'member'" src="/static/article/FeaturedPostsTag.png"></image>
					<view v-else class="tag">{{ post.vipLevel }}</view>
					<text class="tag" v-if="post.featured">{{ $t('Selection') }}</text>
				</view>
				<text class="time">{{ post.time || '--' }}</text>
			</view>
			<text class="more">...</text>
		</view>
		<view class="post-title">{{ post.title }}</view>
		<scroll-view class="image-list" :class="{ 'single-image': post.images?.length === 1 }" scroll-x>
			<image v-for="(img, index) in post.images" :key="index" class="post-img" :src="img" mode="aspectFill">
			</image>
		</scroll-view>
		<view class="actions">
			<view class="action">
				<image src="/static/article/like.png" mode="aspectFit"></image>
				<text>{{ post.likes || '0' }}</text>
			</view>
			<view class="action">
				<image src="/static/article/comment.png" mode="aspectFit"></image>
				<text>{{ post.comments || '0' }}</text>
			</view>
			<view class="action">
				<image src="/static/article/collect.png" mode="aspectFit"></image>
				<text>{{ post.collects || '0' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ArticlePostCard',
	props: {
		post: {
			type: Object,
			default: () => ({})
		},
		compact: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			webTitle: ''
		}
	},
	methods: {
		toArticleInfo(item) {
			uni.navigateTo({
				url: `/pages/ArticlePage/articleInfo?title=${encodeURIComponent(item.title || '')}&id=${item.id || ''}`,
			})
		}
	},
	mounted() {
		this.webTitle = uni.getStorageSync('settings').webTitle
	}
}
</script>

<style lang="scss" scoped>
* {
	box-sizing: border-box;
	font-family: 'MiSans';
}

.post-card {
	padding-bottom: 30rpx;
	background: transparent;
	border-bottom: 2rpx solid rgba(0, 0, 0, 0.08);
	margin-bottom: 32rpx;
	padding-right: 0;
}

.post-card.compact {
	padding-bottom: 20rpx;
	border-bottom: 0;
}

.post-head {
	display: flex;
	align-items: center;
	position: relative;
	margin: 0 14rpx;
}

.avatar_img {
	width: 72rpx;
	min-width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
}

.avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	min-width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #0873ff;
	color: #fff;
	font-size: 38rpx;
	font-weight: 700;
}

.author {
	margin-left: 16rpx;
	flex: 1;
}

.name-row {
	display: flex;
	align-items: center;
	height: 38rpx;
}

.name {
	font-size: 30rpx;
	font-weight: 700;
	color: #171717;
	line-height: 38rpx;
}

.verified {
	width: 36rpx;
	min-width: 36rpx;
	height: 36rpx;
	margin-left: 8rpx;
}

.tag {
	margin-left: 8rpx;
	padding: 2rpx 14rpx;
	border-radius: 18rpx;
	background: #ffeac8;
	color: #ae6c0f;
	font-size: 20rpx;
}

.time {
	display: block;
	margin-top: 2rpx;
	color: #808998;
	font-size: 24rpx;
	line-height: 30rpx;
}

.more {
	position: absolute;
	right: 2rpx;
	top: 6rpx;
	color: #333;
	font-size: 38rpx;
	line-height: 30rpx;
	letter-spacing: 4rpx;
}

.post-title {
	color: #000;
	font-size: 28rpx;
	line-height: 40rpx;
	margin: 16rpx 14rpx 0;
}

.media {
	position: relative;
	margin-top: 18rpx;
	width: 100%;
	height: 366rpx;
	border-radius: 16rpx;
	overflow: hidden;
}

.cover {
	width: 100%;
	height: 100%;
}

.play {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-38%, -50%);
	width: 0;
	height: 0;
	border-top: 24rpx solid transparent;
	border-bottom: 24rpx solid transparent;
	border-left: 38rpx solid #fff;
	filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.18));
}

.image-list {
	margin-top: 22rpx;
	width: 100%;
	white-space: nowrap;
}

.post-img {
	display: inline-block;
	max-width: 392rpx;
	// height: 364rpx;
	margin-right: 14rpx;
	border-radius: 12rpx;

	&:last-child {
		margin-right: 0;
	}
}

.post-img:nth-child(1) {
	margin-left: 14rpx;
}

.image-list.single-image .post-img {
	width: 100%;
	max-width: 100%;
	margin-left: 0;
}

.image-list.single-image {
	padding: 0 32rpx;
}

.actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 22rpx;
	padding: 0 32rpx;
}

.action {
	display: flex;
	align-items: center;
	color: #0a0a0a;
	font-size: 28rpx;
	line-height: 36rpx;
}

.action image {
	width: 40rpx;
	height: 40rpx;
	margin-right: 16rpx;
}
</style>
