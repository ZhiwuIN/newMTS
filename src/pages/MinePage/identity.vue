<template>
	<customnavbar :title="$t('pages.identity')">
		<view class="authentication-container">
			<form @submit="handleSubmit">
				<view class="identity_set_t1">{{ $t('identity.name') }}</view>
				<view class="identity_set_input">
					<input v-model="formData.realName" :placeholder="$t('identity.placeholder1')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
				</view>
				<view class="identity_set_t1" style="margin-top: 50rpx;">{{ $t('identity.idCard') }}</view>
				<view class="identity_set_input">
					<input v-model="formData.idCard" :placeholder="$t('identity.placeholderIdCard')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
				</view>
				<view style="display: flex;align-items: center; margin-top: 76rpx;">
					<view class="identity_set_t1">
						{{ $t('identity.Gender') }}
					</view>
					<view class="gender_checkbox" :class="{ 'active': formData.gender == 'male' }"
						@click="changeGender(0)">
					</view>
					<view class="identity_set_t1">
						{{ $t('identity.Male') }}
					</view>
					<view class="gender_checkbox" :class="{ 'active': formData.gender == 'female' }"
						@click="changeGender(1)">
					</view>
					<view class="identity_set_t1">
						{{ $t('identity.Female') }}
					</view>
				</view>
				<!-- 手机号 -->
				<view class="identity_set_t1" style="margin-top: 90rpx;">{{ $t('Account.CellPhoneNumber') }}</view>
				<view class="identity_set_input">
					<input v-model="formData.phone" type="number" :placeholder="$t('register.phonePlaceHolder')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
				</view>

				<view class="identity_set_t1" style="margin-top: 50rpx;">{{ $t('identity.Nationality') }}</view>
				<view class="nationality_box">
					<view type="line" class="nationality_select">
						<uni-data-select v-model="nationalityValue" :localdata="nationalityList"
							:emptyTips="$t('noData')" :placeholder="$t('请选择')" @change="handleNationalityChange"
							:clear="false"></uni-data-select>
					</view>
				</view>
				<!-- 	<view class="identity_set_input">
					<input v-model="formData.nationality" :placeholder="$t('identity.placeholder')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
				</view> -->
				<!-- 	<view class="identity_set_t1" style="margin-top: 50rpx;">{{$t('邮箱')}}</view>
				<view class="identity_set_input">
					<input v-model="formData.email" :placeholder="$t('请输入邮箱')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
				</view> -->
				<view class="identity_set_t1" style="margin-top: 50rpx;">{{ $t('identity.Address') }}</view>
				<view class="identity_set_input">
					<input v-model="formData.address" :placeholder="$t('identity.placeholder')"
						placeholder-style="color: #E4E4E4;font-size: 28rpx;font-weight: 500;" />
				</view>
				<!-- 提交按钮 -->
				<view class='identity_submit_btn' @tap="handleSubmit">{{ $t('password.Submit') }}</view>
			</form>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	changeUserInfoApi
} from "@/common/api/users.js";
export default {
	components: {
		customnavbar: customnavbar
	},
	data() {
		return {
			formData: {
				name: '',
				gender: '',
				phone: '',
				nationality: '',
				email: '',
				address: '',
				idCard: '',
			},
			nationalityValue: 0,
			nationalityValue: 0,
			// 国籍只保留科特迪瓦，尼日利亚等其他选项已移除
			nationalityList: [
				{
					value: 0,
					text: this.$t("nationality.CotedIvoire"),
				},
			]
		}
	},
	handleNationalityChange(e) {
		this.formData.nationality = this.nationalityList.find(item => item.value === e).text
	},
	genderChange(e) {
		this.formData.gender = e.detail.value
	},
	handleSubmit() {
		let userInfo = uni.getStorageSync('userInfo')
		if (!this.formData.realName && userInfo.realName != 'African User') {
			this.$showMessage('warning', this.$t('identity.placeholder1'));
			return
		}
		if (!this.formData.phone) {
			this.$showMessage('warning', this.$t('register.phonePlaceHolder'));
			return
		}
		if (!this.validatePhoneFormat()) {
			this.$showMessage('warning', this.$t('login.invalidGhanaPhone'))
			return
		}
		if (!this.formData.nationality) {
			this.$showMessage('warning', this.$t('请选择') + ' ' + this.$t('identity.Nationality'));
			return
		}
		if (!this.formData.idCard) {
			this.$showMessage('warning', this.$t('identity.placeholderIdCard'));
			return
		}
		// if (!this.formData.email) {
		// 	this.$showMessage('warning', this.$t('请输入邮箱'));
		// 	return
		// }
		// if (!this.formData.address) {
		// 	this.$showMessage('warning', this.$t('identity.placeholder'));
		// 	return
		// }
		this.formData.realName = this.formData.realName?.trim()
		this.formData.email = this.formData.email?.trim()
		let params = {
			"address": this.formData.address,
			"gender": this.formData.gender,
			"phone": this.formData.phone,
			"nationality": this.formData.nationality,
			'email': this.formData.email,
			"realName": this.formData.realName,
			"idCard": this.formData.idCard,
		}

		if (!this.formData.realName && userInfo.realName == 'African User') {
			params.realName = 'African User'
		}

		changeUserInfoApi(params).then((res) => {
			this.$showMessage('success', this.$t('toast.success'));
			setTimeout(() => {
				this.$customizeBack()
			}, 500)

		}).catch((err) => {
			console.log('request fail', err);
			this.$showMessage('warning', err.msg);
			// uni.showToast({
			// 	title: err.msg,
			// 	icon: 'none'
			// })
		})
	},
	validatePhoneFormat() {
		// 清除空格
		this.formData.phone = this.formData.phone.replace(/\s/g, '')
		const cleanedPhone = this.formData.phone

		// 加纳手机号正则表达式
		//	const ghanaPhoneRegex = /^0\d{9}$/;

		//	if (!ghanaPhoneRegex.test(cleanedPhone)) {
		//	return false;
		//}

		return true;
	},
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
	// box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
	border-radius: 16rpx;
	border: 2rpx solid rgb(228, 228, 228);
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
		background: $themeColor;
		border: 10rpx solid #E6E6E6;
	}
}

.nationality_box {
	height: 112rpx;
	background: #FFFFFF;
	// box-shadow: 0rpx 16rpx 32rpx 4rpx rgba(119, 154, 241, 0.2);
	border: 2rpx solid rgb(228, 228, 228);
	border-radius: 16rpx;
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
