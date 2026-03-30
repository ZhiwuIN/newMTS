<template>
	<customnavbar :title="$t('pages.avatar')">
		<view class="account-security">
			<!-- 头像部分 -->
			<view class="head">
				<view class="avatar-section">
					<image class="avatar" :src="avatar ?  avatar : '/static/default-avatar.png'" mode="aspectFill">
					</image>
					<view class="title">{{$t('mine.currentAvatar')}}</view>
				</view>
				<!-- <view class="tabs">
					<view v-for="(item, index) in tabs" :key="index"
						:class="['tab-item', currentTab == index ? 'active' : '']" @click="switchTab(index)">
						{{item}}
					</view>
				</view> -->
			</view>
			<view class="tag">{{$t('mine.changeAvatar')}}</view>
			<!-- 头像列表 -->
			<view class="avatarList">
				<view class="avatarItem" v-for="(item, index) in avatarList" :key="item.id"
					@click="changeAvatar(item.avatar, index)" :class="[currentAvatar === index ? 'activeAvatar' : '']">
					<image class="avatarImg" :src="item.avatar" mode="aspectFill"></image>
				</view>
				<view class="btnBox" :class="{'showBtn': showBtn}">
					<view class="btn" @click="unChangeAvatarApi">{{$t('mine.confirmAvatar')}}</view>
				</view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		settingsAvatarsApi,
		changeAvatarApi
	} from '@/common/api/users.js'
	import {
		imListApi
	} from "@/common/api/message";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				url: 'http://13.245.95.135:8888',
				// url: 'http://192.168.2.35:8080',
				userInfo: {},
				// currentTab: 0,
				currentAvatar: '',
				// tabs: [
				// 	'热门',
				// 	'经典',
				// 	'会员'
				// ],
				showBtn: false,
				avatar: '',
				avatarList: [],
				imToken: ''
			}
		},
		onLoad() {
			this.userInfo = uni.getStorageSync("userInfo")
			this.avatar = this.userInfo.avatar
			this.getAvatarList()
		},
		methods: {
			// 修改头像
			unChangeAvatarApi() {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				changeAvatarApi({
					avatar: this.avatar,
					uid: this.userInfo.userId
				}).then((res) => {
					if (res.code == 200) {
						this.$showMessage('success', this.$t('toast.success'));
						// 更新用户信息
						this.userInfo.avatar = this.avatar
						uni.setStorageSync("userInfo", this.userInfo)
						imListApi(this.userInfo.userId).then(res => {
							this.imToken = res.data.token
							uni.setStorageSync('imToken', res.data.token)
							this.setImAvatar()
						})
					} else {
						this.$showMessage('warning', res.msg);
					}
				}).catch((err) => {
					// console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			// 设置聊天的头像
			setImAvatar() {
				console.log(this.avatar)
				// this.$yeIM.getInstance().updateUserInfo({
				// 	avatarUrl: this.avatar,
				// 	success: (response) => {
				// 		uni.hideLoading();
				// 	},
				// 	fail: (err) => {
				// 		if (err.code == 10003) {
				// 			let token = this.imToken || uni.getStorageSync('imToken')
				// 			this.$yeIM.getInstance().connect({
				// 				userId: this.userInfo.userId,
				// 				token,
				// 				success: (response) => {
				// 					if (response.code == 200) {
				// 						this.setImAvatar()
				// 					}
				// 				},
				// 				fail: (err) => {
				// 					this.$showMessage('warning', this.$t('同步聊天头像失败, 请尝试重新点击'));
				// 					uni.hideLoading();
				// 				}
				// 			});
				// 		}
				// 	}
				// });
			},
			// 获取头像库
			getAvatarList() {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				settingsAvatarsApi().then((res) => {
					this.avatarList = res.data
					// console.log(res)
				}).catch((err) => {
					// console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})
			},
			// switchTab(index) {
			// 	this.currentTab = index
			// },
			// 选择头像
			changeAvatar(item, index) {
				this.currentAvatar = index
				this.showBtn = true
				this.avatar = item
			}
		}
	}
</script>

<style lang="scss" scoped>
	.account-security {

		.tag {
			margin: 50rpx 0 40rpx 40rpx;
			font-family: DINPro, DINPro;
			font-weight: 500;
			font-size: 32rpx;
			color: #000000;
			font-style: normal;
		}

		.head {
			padding: 80rpx 0 60rpx;
			background-color: #fff;
			background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		}

		.avatar-section {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 20rpx;
			width: 100%;

			.avatar {
				width: 136rpx;
				height: 136rpx;
				background: #FFFFFF;
				border-radius: 50%;
			}

			.title {
				font-family: DINPro, DINPro;
				font-weight: 400;
				font-size: 26rpx;
				color: #FFFFFF;
				line-height: 34rpx;
				text-align: center;
				font-style: normal;
			}
		}

		.avatarList {
			display: flex;
			flex-wrap: wrap;
			gap: 42rpx;
			// justify-content: space-between;
			padding: 32rpx;
			max-height: calc(100vh - 832rpx);
			overflow-y: auto;
			padding-top: 4rpx;
			padding-bottom: 200rpx;

			.avatarItem {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 132rpx;
				height: 132rpx;
				border-radius: 50%;
				border: 4rpx solid transparent;

				.avatarImg {
					width: 112rpx;
					height: 112rpx;
					border-radius: 50%;
					background: #F0F0F0;
				}

				&.activeAvatar {
					width: 132rpx;
					height: 132rpx;
					border-radius: 50%;
					position: relative;
					background: white;
					border-radius: 50%;
					border: 4rpx dashed #ffffff;
					background-clip: padding-box, border-box;
					background-origin: padding-box, border-box;
					background-image: linear-gradient(135deg,
							#fff 0%,
							#fff 52%,
							#fff 100%),
						linear-gradient(180deg, $gradualColor1, $gradualColor2);
				}

			}
		}
	}

	.tabs {
		display: flex;
		gap: 24rpx;
		background: #fff;
		padding: 32rpx;

		.tab-item {
			position: relative;
			font-family: "DINPro-Regular", sans-serif;
			font-weight: 400;
			font-size: 26rpx;
			color: #000000;
			border: 2rpx solid #e5e5e5;
			border-radius: 36rpx;
			line-height: 60rpx;
			text-align: center;
			font-style: normal;
			height: 60rpx;
			width: 128rpx;

			&.active {
				color: #fff;
				font-weight: 400;
				background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
				border: 2rpx solid transparent;
				border-radius: 36rpx;
			}
		}
	}

	.btnBox {
		position: fixed;
		left: 0;
		bottom: -180rpx;
		width: 100%;
		height: 180rpx;
		box-sizing: border-box;
		background-color: #fff;
		padding: 32rpx;
		padding-top: 42rpx;
		transition: all 0.2s;

		&.showBtn {
			bottom: 0;
		}
	}

	.btn {
		padding: 20rpx 0 26rpx;
		display: flex;
		justify-content: center;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		font-family: PingFangSC, PingFang SC;
		font-weight: 600;
		font-size: 36rpx;
		color: #FFFFFF;
		text-align: left;
		font-style: normal;
		text-transform: none;
	}
</style>