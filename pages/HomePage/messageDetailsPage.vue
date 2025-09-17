<template>
	<customnavbar :title="$t('pages.message')">
		<view class="msg_page">
			<view class="msg_title">
				{{message.title}}
			</view>
			<view class="msg_title2">
				{{message.content}}
			</view>
			<view class="msg_time">
				{{message.sendTime}}
			</view>
		</view>

	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		messageReadApi,
		messageInfoApi
	} from "@/common/api/home.js";

	export default {
		components: {
			customnavbar: customnavbar,
		},
		data() {
			return {
				id: '',
				message: {},
				loading: false

			}
		},
		onLoad(options) {
			console.log('messageDetailsPage onLoad', options);
			this.id = options.id
			this.readNotice()
		},
		methods: {
			// 详情
			readNotice() {
				this.loading = true
				messageInfoApi(this.id).then((res) => {
					this.loading = false
					this.message = res.data
					if (!res.data.isRead) {
						messageReadApi(this.id)
					}
				}).catch((err) => {
					this.loading = false
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.msg_page {
		padding: 30rpx 40rpx;

		.msg_title {
			margin-bottom: 40rpx;
			font-family: DINPro, DINPro;
			font-weight: 500;
			font-size: 32rpx;
			color: #333333;
			line-height: 42rpx;
			text-align: left;
			font-style: normal;
		}

		.msg_title2 {
			margin-bottom: 40rpx;
			font-family: DINPro, DINPro;
			font-weight: 400;
			font-size: 28rpx;
			color: #1C2D57;
			line-height: 36rpx;
			text-align: justify;
			font-style: normal;
		}

		.msg_time {
			text-align: right;
		}
	}
</style>