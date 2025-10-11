<template>
	<view>
		<customnavbar :title="$t('pages.postAgreement')" @mtop='mtop'>
			<view class="agreement_page" :style="topStyle">
				<view class="agreement_content" :style="contentStyle">
		<!-- 			<rich-text :nodes="agreement" class="agreement_content_text">
					</rich-text> -->
					<scroll-view style="height: 100%; width: 100%;" scroll-y="true" direction="vertical" >
						<view v-html="contract"></view>
					</scroll-view>
				</view>
				<view class="agreement-apply-btn-box flex-center" :style=" isScrollEnd ? '' : `opacity: 60%;` " v-if="contract" >
					<view class="agreement-apply-btn" @click="handleAgree">
						{{$t('post.agree')}}
						<text v-if="this.num">{{this.num}}</text>
					</view>
				</view>
			</view>
		</customnavbar>
		<uni-popup ref="popup" type="center" border-radius="10px 10px 0 0">
			<view class="pop_page">
				<view class="pop_top">{{$t('home.Prompt')}}</view>
				<!-- <view class="pop_content">{{this.applyPrompt}}</view> -->
				<view class="pop_bottom">
					<view class="pop_bottom_btn" @click="confirm2">{{$t('home.Postmanage')}}</view>
					<view class="pop_bottom_btn" @click="confirm">{{$t('home.Sure')}}</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import customnavbar from "@/component/custom-navbar/custom-navbar.vue"
	import {
		positionDetailsApi,
		positionApplyApi
	} from "@/common/api/position.js";
	import {
		formatRichText
	} from "@/utils/utils.js"
	import {
		userInfoApi
	} from "@/common/api/users.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				topStyle: "",
				contentStyle: "",
				details: {},
				agreement: "",
				applyPrompt: "",
				contract: "",
				isScrollEnd: false,
				num: "10"
			}
		},
		onLoad(options) {
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			positionDetailsApi(options.id).then((res) => {
				this.details = res.data
				this.contract = res.data.contract
				// this.agreement = formatRichText(res.data.agreemet)
				this.agreement = res.data.agreement
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})
			if(this.num == 10){
				let inter = setInterval(()=>{
					this.num--
				},1000)
				setTimeout(()=>{
					clearInterval(inter)
					this.isScrollEnd = true
				},10000)
			}
		},
		methods: {
			handleAgree() {
				if (!this.isScrollEnd){
					return
				};
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				positionApplyApi(this.details.pid).then((res) => {
					// this.$refs.popup.open('center')
					this.$showMessage('success', this.$t('post.applicationApproved'));
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/MinePage/applicationRecord'
						})
					}, 500)
					this.getUserInfo()
				}).catch((err) => {
					console.log('request fail', err);
					this.applyPrompt = err.msg
					this.$refs.popup.open('center')
				}).finally(() => {
					uni.hideLoading();
				})
			},
			// handleAgree() {
			// 	uni.navigateTo({
			// 		url: `/pages/HomePage/contractSigning?pid=${this.details.pid}`,
			// 	})
			// },
			getUserInfo() {
				userInfoApi().then((res) => {
					uni.setStorageSync('userInfo', res.data)
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			confirm() {
				this.$refs.popup.close()
			},
			confirm2() {
				this.$refs.popup.close()
				uni.navigateTo({
					url: '/pages/MinePage/applicationRecord'
				})
			},
			mtop(e) {
				this.topStyle = "height:calc(100vh - " + e + "rpx)"
				this.contentStyle = "height:calc(100vh - " + (e + 204) + "rpx)"
			}
		},
	}
</script>

<style scoped lang="scss">
	.agreement_page {
		position: relative;
	}

	.agreement_content {
		overflow: scroll;
		padding: 20rpx 50rpx;
	}

	.agreement_content_text {
		// font-family: "DINPro-Medium", sans-serif;
		// font-weight: 500;
		// font-size: 26rpx;
		// color: #000000;
		// line-height: 34rpx;
		// text-align: left;
		// font-style: normal;
	}

	.flex-center {
		display: flex;
		justify-content: center;
		/* margin: 48rpx 0; */
	}

	.agreement-apply-btn-box {
		position: absolute;
		bottom: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.agreement-apply-btn {
		width: 650rpx;
		height: 96rpx;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		text-align: center;
		line-height: 96rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		text-align: center;
		font-style: normal;
		text-transform: none;

	}

	.pop_page {
		box-sizing: border-box;
		background-color: #fff;
		width: 600rpx;
		border-radius: 28rpx;
		padding: 40rpx 54rpx 28rpx 54rpx;
	}

	.pop_top {
		display: flex;
		justify-content: center;
		align-items: center;
		/* padding: 30rpx 0 20rpx 0; */
		/* border-bottom: 1px solid #D8D8D8; */
		;
		font-weight: 600;
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: left;
		font-style: normal;
	}

	.pop_content {
		font-family: "DINPro-Black", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.pop_bottom {
		display: flex;
		margin-top: 54rpx;
		justify-content: space-between;
	}

	.pop_bottom_btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 212rpx;
		/* height: 72rpx; */
		background: $themeColor;
		box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 16rpx;
		font-family: "DINPro-Black", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 32rpx;
		padding: 12rpx 0;
		text-align: center;
		font-style: normal;
	}
</style>