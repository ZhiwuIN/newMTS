<template>
	<customnavbar :title="$t('Account.CellPhoneNumber')">
		<view class="authentication-container">
			<form @submit="handleSubmit">
				<view class="identity_set_t1">{{$t('Account.CellPhoneNumber')}}</view>
				<view class="identity_set_input">
					<input v-model="phone" type="number" :placeholder="$t('register.phonePlaceHolder')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" maxlength="10" />
				</view>
				<!-- 提交按钮 -->
				<view class='identity_submit_btn' @tap="handleSubmit">{{$t('password.Submit')}}</view>
			</form>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		changeUserPhoneApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				phone: '',
				userInfo: {},
			}
		},
		onShow() {
			this.userInfo = uni.getStorageSync('userInfo')
			this.phone = this.userInfo.phone
		},
		methods: {
			validatePhoneFormat() {
				// 清除空格
				this.phone = this.phone.replace(/\s/g, '')
				const cleanedPhone = this.phone

				// 加纳手机号正则表达式
				const ghanaPhoneRegex = /^0\d{9}$/;

				if (!ghanaPhoneRegex.test(cleanedPhone)) {
					return false;
				}

				return true;
			},
			handleSubmit() {
				if (!this.phone) {
					this.$showMessage('warning', this.$t('register.phonePlaceHolder'));
					return
				}
				if (!this.validatePhoneFormat()) {
					this.$showMessage('warning', this.$t('login.invalidGhanaPhone'))
					return
				}
				let params = {
					"id": this.userInfo.userId,
					"phone": this.phone,
				}
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				changeUserPhoneApi(params).then((res) => {
					this.$showMessage('success', this.$t('toast.success'));
					setTimeout(() => {
						this.$customizeBack()
					}, 200)
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.authentication-container {
		padding: 40rpx;
	}

	.identity_submit_btn {
		margin-top: 90rpx;
		height: 96rpx;
		background: $themeColor;
		border-radius: 12rpx;
		font-family: "DINPro-Blod", sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
	}

	.identity_set_t1 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 24rpx;
		color: #000000;
		line-height: 30rpx;
		text-align: left;
		font-style: normal;
	}

	.identity_set_input {
		padding: 0 34rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 42rpx;
		border: 2rpx solid #F6F6F6;
		margin-top: 24rpx;
	}

	input {
		height: 112rpx;
		font-size: 28rpx;
	}

	.gender_checkbox {
		width: 22rpx;
		height: 22rpx;
		background: #E6E6E6;
		border-radius: 50%;
		border: 10rpx solid #E6E6E6;
		margin-left: 72rpx;
		margin-right: 26rpx;

		&.active {
			background: $gradualColor2;
			border: 10rpx solid #E6E6E6;
		}
	}

	.nationality_box {
		height: 112rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 16rpx 32rpx 4rpx rgba(119, 154, 241, 0.2);
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		padding: 0 34rpx;
		margin-top: 38rpx;
	}

	.nationality_select {
		flex: 1;
	}

	::v-deep .uni-select {
		border: 0rpx solid;

		text::before {
			font-weight: 500;
			font-size: 30rpx;
			color: $themeColor;
		}
	}

	::v-deep .uni-select__input-text {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 30rpx;
		color: #000000;
		font-style: normal;
	}
</style>