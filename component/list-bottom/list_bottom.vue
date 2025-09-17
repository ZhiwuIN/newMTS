<template>
	<view class="">
		<view v-if="noData">
			<defaultBox :image="image" :title="title" :text="text" />
		</view>
		<view v-else>
			<view v-if="loading" class="loading-text">{{$t('common.loading')}}</view>
			<view v-if="!hasMore" class="no-more-text">{{$t('common.noMore')}}</view>
		</view>
	</view>
</template>

<script>
	import defaultBox from '@/component/default/default.vue'
	export default {
		components: {
			defaultBox
		},
		props: {
			loading: {
				type: Boolean,
				default: true
			},
			hasMore: {
				type: Boolean,
				default: true
			},
			noData: {
				type: Boolean,
				default: false
			},
			image: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: ''
			},
			text: {
				type: String,
				default: ''
			},
		},
	}
</script>

<style scoped>
	.nodata_text,
	.loading-text,
	.no-more-text {
		font-size: 24rpx;
		text-align: center;
		color: #999;
		padding: 10rpx 0;
	}

	.nodata_img {
		width: 100%;
		position: absolute;
		bottom: 0;
	}
</style>