<template>
	<customnavbar :title="$t('mobilePayment.title')" @mtop='mtop'>
		<view class="payment_page">
			<view class="payment_content" :style="contentStyle">
				<view class="payment_list">
					<uni-swipe-action>
				<!-- 		<uni-swipe-action-item v-for="(item, index) in accountList" :key="item.bid"
							:right-options="swipeOptions" style="margin-top: 40rpx;"
							@click="handleSwipeClick(item.bid, $event)">
						</uni-swipe-action-item> -->
						<view class="pay_item" v-for="(item, index) in accountList" :key="item.bid">
							<view class="item_left">
								<view class="item_img">
									<image src="/static/mine/visa.png" alt="" srcset="" />
								</view>
								<view class="item_center">
									<view class="account_name">{{ item.bankName }}</view>
									<view class="account_number">{{ item.cardNo }}</view>
								</view>
							</view>
							<view class="right_arrow"></view>
						</view>
					</uni-swipe-action>
					<view class="add-section">
						<view class="add-btn" @click="addPayment">{{$t("mobilePayment.add")}}</view>
					</view>
				</view>

				<uni-popup ref="logout_popup" type="center" border-radius="10px 10px 0 0" :mask-click="false">
					<view class="logout_pop_page">
						<view class="logout_pop_top">{{$t("home.Prompt")}}</view>
						<view class="logout_pop_content">{{$t("home.delete")}}</view>
						<view class="logout_pop_bottom">
							<!-- 修复点2：修改弹窗按钮事件处理方式 -->
							<button class="btn_cancel" @click="cancel($event)">{{$t('home.cancel')}}</button>
							<button class="btn_confirm" @click="confirm($event)">{{$t('home.Sure')}}</button>
						</view>
					</view>
				</uni-popup>
			</view>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		bankListApi,
		withdrawalbankDelApi
	} from "@/common/api/withdrawal.js";

	export default {
		components: {
			customnavbar: customnavbar
		},
		data() {
			return {
				contentStyle: "",
				accountList: [],
				// 修复点3：将箭头函数改为普通函数，确保this指向正确
				swipeOptions: [{
					text: 'delete',
					style: {
						backgroundColor: '#FF5A5F',
						color: '#fff'
					},
					// 使用普通函数而非箭头函数
					click: function(item) {
						this.delId = item.bid;
						this.$refs.logout_popup.open();
						return false; // 通过return false阻止默认行为
					}
				}],
				delId: ''
			}
		},
		onShow() {
			this.getPayment()
		},
		methods: {
			// 修复点4：在方法内部处理事件冒泡
			handleSwipeClick(id, e) {
				// 尝试阻止冒泡，但增加兼容性判断
				if (e && typeof e.stopPropagation === 'function') {
					e.stopPropagation();
				}
				this.delId = id
				this.$refs.logout_popup.open()
			},
			cancel(e) {
				if (e && typeof e.stopPropagation === 'function') {
					e.stopPropagation();
				}
				this.$refs.logout_popup.close()
			},
			confirm(e) {
				if (e && typeof e.stopPropagation === 'function') {
					e.stopPropagation();
				}
				this.$refs.logout_popup.close()
				withdrawalbankDelApi(this.delId).then((res) => {
					this.$showMessage('success', this.$t('toast.success'));
					this.getPayment()
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			getPayment() {
				bankListApi().then((res) => {
					this.accountList = res.data
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},

			addPayment() {
				uni.navigateTo({
					url: '/pages/MinePage/addPayment'
				})
			},
			mtop(e) {
				// this.contentStyle = "height:calc(100vh - " + (e + 204) + "rpx)"
			}
		}

	}
</script>

<style lang="scss" scoped>
	/* 样式部分保持不变 */
	.logout_pop_page {
		width: 570rpx;
		background: #FFFFFF;
		border-radius: 28rpx;
		padding: 40rpx 54rpx 28rpx 54rpx;
	}

	.logout_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.logout_pop_content {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.logout_pop_bottom {
		display: flex;
		margin-top: 54rpx;
	}

	.btn_cancel {
		width: 212rpx;
		height: 72rpx;
		background: #EBEBEB;
		border-radius: 16rpx;
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}

	.btn_confirm {
		width: 212rpx;
		height: 72rpx;
		background: $themeColor;
		box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 16rpx;
		font-family: "DINPro-Black", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}

	.payment_page {
		position: relative;
	}

	.payment_content {
		overflow: scroll;
		padding: 40rpx;
	}

	.item_left {
		display: flex;
		align-items: center;
	}

	.item_img {
		width: 96rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		margin-right: 40rpx;

		image {
			width: 100%;
			height: 100%;
		}

	}

	.account_name {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 30rpx;
		color: #000000;
		line-height: 34rpx;
		text-align: left;
		font-style: normal;
	}

	.account_number {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 30rpx;
		color: #000000;
		line-height: 40rpx;
		text-align: left;
		font-style: normal;
		margin-top: 22rpx;
	}

	.add-section {
		// position: absolute;
		// bottom: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 670rpx;
		// margin-top: 40rpx;
	}

	.add-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
	}

	.pay_item {
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 32rpx;
		border: 2rpx solid #F6F6F6;
		padding: 40rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 40rpx;
	}

	.right_arrow {
		width: 18rpx;
		height: 18rpx;
		border: 5rpx solid #4C69FF;
		border-left: none;
		border-bottom: none;
		transform: rotate(45deg);
	}
</style>