<template>
	<customnavbar :title="$t('pages.level')" backgroundStr="url('/static/level_bg.png') top left/100%  no-repeat"
		@mtop="mtop" :showBack="false" :whiteTitle="true">
		<view class="team-container">
			<view class="level_top_bg" :style="topStyle">
				<view class="left_arrow" @click="handleSwipe(0)" v-if="levelList[0]?.levelName">
					<image src="/static/swipe_arrow_left.png" alt="" class="swipe_arrow_img" />
				</view>
				<view class="level_bg_box">
					<image :src="levelList[currentPIndex]?.image" mode="" class="level_bg"></image>
					<view class="bgctm">
						<view class="level-section">
							<view class="level_title_t">
								{{levelList[currentPIndex]?.levelName}}
							</view>
						</view>
					</view>
				</view>

				<view class="level_top_bg2">
					<view class="level-arc" :class="{
					  'rightRotate': isRight,
					  'leftRotate': isLeft
					}">
						<view class="pie0">
							<view class="pieText">
								{{currentPIndex == 1 ? levelList[levelList.length - 1]?.levelName :  levelList[currentPIndex - 2]?.levelName}}
							</view>
						</view>
						<view class="pie1">
							<view class="pieText" v-if="!isLeft && !isRight">
								{{currentPIndex == 0 ? levelList[levelList.length - 1]?.levelName :  levelList[currentPIndex - 1]?.levelName}}
							</view>
						</view>
						<view class="active">
						</view>
						<view class="aperture"></view>
						<view class="pie2">
							<view class="pieText" v-if="!isLeft && !isRight">
								{{currentPIndex == levelList.length - 1 ? levelList[0]?.levelName : levelList[currentPIndex + 1]?.levelName}}
							</view>
						</view>
						<view class="pie3">
							<view class="pieText">
								{{levelList[currentPIndex + 2]?.levelName}}
							</view>
						</view>
					</view>
				</view>

				<view class="level-arc2"></view>
				<view style="background-color: #1565b4;">
					<!-- #ifdef H5 -->
					<swiper circular :indicator-dots="false" :autoplay="false" :interval="3000" :duration="500"
						@change="swiperChange" @transition="swiperTransition" style="height: 1840rpx"
						:current='currentPIndex' previous-margin="40rpx" next-margin="40rpx"
						active-class="active-swiper">
					<!-- #endif -->
						<!-- #ifdef APP-PLUS -->
						<swiper circular :indicator-dots="false" :autoplay="false" :interval="3000" :duration="500"
							@change="swiperChange" @transition="swiperTransition" style="height: 1660rpx"
							:current='currentPIndex' previous-margin="40rpx" next-margin="40rpx"
							active-class="active-swiper">
						<!-- #endif -->
							<swiper-item class="level-swiper-item" v-for="(item, index) in levelList" :key="index">

								<view class="level_main">
									<view class="level_table_box">
										<view class="tag" v-if="index == userLevelIndex">
											{{$t('当前等级')}}
										</view>
										<view class="tag" v-if="index < userLevelIndex">
											{{$t('已解锁')}}
										</view>
										<view class="tag" v-if="index > userLevelIndex">
											{{$t('待解锁')}}
										</view>

										<view class="amount_box" v-if="currentPIndex > userLevelIndex">
											{{(+item?.amount).toFixed(2)}}
										</view>

										<view class="level_title">
											{{item?.levelName}}
										</view>
										<view class="level_title2">
											{{$t('level.desc')}}
										</view>
										<view class="level_table_item table_item_bg">
											<view class="table_title w30">{{$t('level.Timeunit')}}</view>
											<view class="table_title w30">{{$t('level.Numberoftasks')}}</view>
											<view class="table_title w30">{{$t('level.Totalcommission')}}</view>
										</view>
										<view class="level_table_item">
											<view class="table_value w30">Daily</view>
											<view class="table_value w30">{{item.numberTasks}}</view>
											<view class="table_value w30">{{item.totalCommission}}</view>
										</view>
										<view class="level_title2">
											{{$t('level.desc2')}}
										</view>
										<view class="level_table_item table_item_bg">
											<view class="table_title w40">{{$t('level.InvitationMethod')}}</view>
											<view class="table_title w35">{{$t('level.Invitationcommissionrate')}}
											</view>
											<view class="table_title w15">{{$t('level.Incomeamount')}}</view>
										</view>
										<view class="level_table_item">
											<view class="table_value w40">
												{{$t('level.InvitationMethod1') + item?.levelName}}
											</view>
											<view class="table_value w35 text_center">
												{{item.profitMargin[0]?.invitationCommission || '-'}}
											</view>
											<view class="table_value w15 text_center">
												{{item.profitMargin[0]?.incomeAmount || '-'}}
											</view>
										</view>
										<view class="level_table_item">
											<view class="table_value w40">
												{{$t('level.InvitationMethod2') + item?.levelName}}
											</view>
											<view class="table_value w35 text_center">
												{{item.profitMargin[1]?.invitationCommission || '-'}}
											</view>
											<view class="table_value w15 text_center">
												{{item.profitMargin[1]?.incomeAmount || '-'}}
											</view>
										</view>
										<view class="level_table_item">
											<view class="table_value w40">
												{{$t('level.InvitationMethod3') + item?.levelName}}
											</view>
											<view class="table_value w35 text_center">
												{{item.profitMargin[2]?.invitationCommission || '-'}}
											</view>
											<view class="table_value w15 text_center">
												{{item.profitMargin[2]?.incomeAmount || '-'}}
											</view>
										</view>
										<view class="level_title2">
											{{$t('level.desc3')}}
										</view>
										<view class="level_table_item table_item_bg">
											<view class="table_title w40">{{$t('level.Taskcompletionfrom')}}</view>
											<view class="table_title w35">{{$t('level.Taskcommissionratio')}}</view>
											<view class="table_title w15">{{$t('level.Incomeamount')}}</view>
										</view>
										<view class="level_table_item" v-if="item.levelCode == 0">
											<view class="table_value w40">{{$t('level.Taskcompletionfrom1')}}</view>
											<view class="table_value w35 text_center">
												0
											</view>
											<view class="table_value w15 text_center">
												0
											</view>
										</view>
										<view class="level_table_item" v-else>
											<view class="table_value w40">{{$t('level.Taskcompletionfrom1')}}</view>
											<view class="table_value w35 text_center">
												{{item.incomeRatio[0]?.taskCommissionRatioStr || '-'}}
											</view>
											<view class="table_value w15 text_center">
												{{item.incomeRatio[0]?.incomeAmount || '-'}}
											</view>
										</view>
										<view class="level_table_item" v-if="item.levelCode == 0">
											<view class="table_value w40">{{$t('level.Taskcompletionfrom2')}}</view>
											<view class="table_value w35 text_center">
												0
											</view>
											<view class="table_value w15 text_center">
												0
											</view>
										</view>
										<view class="level_table_item" v-else>
											<view class="table_value w40">{{$t('level.Taskcompletionfrom2')}}</view>
											<view class="table_value w35 text_center">
												{{item.incomeRatio[1]?.taskCommissionRatioStr || '-'}}
											</view>
											<view class="table_value w15 text_center">
												{{item.incomeRatio[1]?.incomeAmount || '-'}}
											</view>
										</view>
										<view class="level_table_item" v-if="item.levelCode == 0">
											<view class="table_value w40">{{$t('level.Taskcompletionfrom3')}}</view>
											<view class="table_value w35 text_center">
												0
											</view>
											<view class="table_value w15 text_center">
												0
											</view>
										</view>
										<view class="level_table_item" v-else>
											<view class="table_value w40">{{$t('level.Taskcompletionfrom3')}}</view>
											<view class="table_value w35 text_center">
												{{item.incomeRatio[2]?.taskCommissionRatioStr || '-'}}
											</view>
											<view class="table_value w15 text_center">
												{{item.incomeRatio[2]?.incomeAmount || '-'}}
											</view>
										</view>
									</view>
									<view v-if="currentPIndex == index">
										<view class="bottom_btn"
											v-if="currentPIndex>userLevelIndex && !isLoading && item.state == 1">
											<view class="join_btn" @click="handleJoin">{{$t('level.join')}}</view>
										</view>
										<view class="bottom_btn" v-if="item.state == 0 && !isLoading">
											<view class="join_btn">{{$t('level.comingSoon')}}</view>
										</view>
										<view class="bottom_btn" v-if="isLoading">
											<t-loading style="margin-top: 42rpx;" v-model="isLoading" theme="spinner"
												size="22px" :text="$t('loading.btn') + '...'" />
										</view>
									</view>
								</view>
							</swiper-item>
						</swiper>

				</view>
				<view class="right_arrow" @click="handleSwipe(1)" v-if="levelList[0]?.levelName">
					<image src="/static/swipe_arrow_right.png" alt="" class="swipe_arrow_img" />
				</view>
			</view>
		</view>


		<uni-popup ref="logout_popup" type="center" border-radius="10px 10px 0 0">
			<view class="logout_pop_page">
				<view class="logout_pop_top">{{$t("home.Prompt")}}</view>
				<view class="logout_pop_content">
					{{$t("确定购买等级1")}}{{ (+amount).toFixed(2) }}{{$t("确定购买等级2")}}{{ levelName }}{{$t("确定购买等级3")}}
				</view>
				<view class="logout_pop_bottom">
					<button class="btn_cancel" @click="cancel">{{$t('home.cancel')}}</button>
					<button class="btn_confirm" @click="confirm">{{$t('home.Sure')}}</button>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="logout_popup2" type="center" border-radius="10px 10px 0 0">
			<view class="logout_pop_page">
				<view class="logout_pop_top">{{$t("home.Prompt")}}</view>
				<view class="logout_pop_content">
					{{$t('product.PurchaseAmountCannotBeLessThanStartingAmount')}}
				</view>
				<view class="logout_pop_content">
					{{$t('是否进行充值余额')}}
				</view>
				<view class="logout_pop_bottom">
					<button class="btn_cancel" @click="cancel1">{{$t('home.cancel')}}</button>
					<button class="btn_confirm" @click="confirm1">{{$t('home.Sure')}}</button>
				</view>
			</view>
		</uni-popup>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		userInfoApi,
		settingsApi
	} from "@/common/api/users.js";
	import {
		vipInfoApi,
		buyApi
	} from "@/common/api/level.js";

	// 防抖函数
	const debounce = (func, delay) => {
		let timer = null;
		return function(...args) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				func.apply(this, args);
			}, delay);
		};
	};

	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				isLeft: false,
				isRight: false,
				amount: '',
				levelName: '',
				userInfo: {},
				levelList: [],
				topStyle: '',
				currentPIndex: 0,
				userLevelIndex: 0,
				isLoading: false,
				levelImages: [
					'/static/level/1.png',
					'/static/level/2.png',
					'/static/level/3.png',
					'/static/level/4.png',
					'/static/level/5.png',
					'/static/level/6.png'
				]
			}
		},
		created() {
			// 绑定防抖的swiper切换方法
			this.debouncedSwiperChange = debounce(this.swiperChange, 100);
		},
		methods: {
			mtop(e) {
				// #ifdef H5
				this.topStyle = `margin-top:-${e}rpx;padding-top:${e + 11}rpx`;
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = `margin-top:-${e}rpx;padding-top:${e + 44}rpx`;
				// #endif
			},
			getLevelImage(index) {
				return index < this.levelImages.length ? this.levelImages[index] : this.levelImages[this.levelImages
					.length - 1];
			},

			handleSwipe(direction) {
				if (this.isLoading) return;

				if (direction === 0) {
					this.currentPIndex = this.currentPIndex === 0 ?
						this.levelList.length - 1 :
						this.currentPIndex - 1;
				} else {
					this.currentPIndex = this.currentPIndex === this.levelList.length - 1 ?
						0 :
						this.currentPIndex + 1;
				}
			},

			swiperChange(e) {
				if (this.currentPIndex > e.detail.current) {
					// 向左
					this.isLeft = true
					setTimeout(() => {
						this.isLeft = false
					}, 200)
				} else if (this.currentPIndex < e.detail.current) {
					// 向右
					this.isRight = true
					setTimeout(() => {
						this.isRight = false
					}, 200)
				}
				this.currentPIndex = e.detail.current;
			},

			swiperTransition() {
				if (this.isLoading) return;

				this.isLoading = true;
				setTimeout(() => {
					this.isLoading = false;
				}, 300);
			},

			async getUserInfo() {
				try {
					const res = await userInfoApi();
					uni.setStorageSync('levelCode', res.data.levelCode)
					uni.setStorageSync('userInfo', res.data);
					this.userInfo = res.data;
					if (this.userInfo.hasMessage) {
						uni.showTabBarRedDot({
							index: 2
						})
					} else {
						uni.hideTabBarRedDot({
							index: 2
						})
					}
					await this.getLevelInfo();
				} catch (err) {
					console.error('getUserInfo error:', err);
					this.$showMessage('warning', err.msg);
				}
			},

			async getLevelInfo() {
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				try {
					const res = await vipInfoApi();
					this.levelList = res.data.list || [];

					// 预加载图片
					this.preloadImages();

					// 查找当前用户等级索引
					const index = this.levelList.findIndex(item =>
						item.levelCode === this.userInfo.levelCode
					);

					if (index !== -1) {
						this.currentPIndex = index;
						this.userLevelIndex = index;
					}
				} catch (err) {
					console.error('getLevelInfo error:', err);
					this.$showMessage('warning', err.msg);
				} finally {
					uni.hideLoading();
				}
			},

			preloadImages() {
				this.levelImages.forEach(src => {
					// 使用 uni-app 的 API 预加载图片
					uni.getImageInfo({
						src: src,
						success: () => {},
						fail: (err) => {
							console.error('预加载图片失败:', src, err);
						}
					});
				});
			},

			async handleJoin() {
				this.amount = this.levelList[this.currentPIndex]?.amount
				this.levelName = this.levelList[this.currentPIndex]?.levelName
				this.$refs.logout_popup.open()
			},
			cancel() {
				this.$refs.logout_popup.close()
			},
			cancel1() {
				this.$refs.logout_popup2.close()
			},
			confirm1() {
				this.$refs.logout_popup2.close()
				uni.navigateTo({
					url: '/pages/HomePage/RechargeChannel'
				})
			},
			async confirm() {
				this.$refs.logout_popup?.close()
				// console.log('点击', this.isLoading)
				if (this.isLoading) return;

				this.isLoading = true;
				if (this.levelList[this.currentPIndex]?.amount > this.userInfo.accountBalance) {
					this.$refs.logout_popup2.open()
					this.isLoading = false;
					return
				}
				try {
					const id = this.levelList[this.currentPIndex]?.id;
					if (!id) throw new Error('Invalid level ID');

					await buyApi(id);
					this.$showMessage('success', this.$t('toast.success'));
					await this.getUserInfo();
				} catch (err) {
					console.error('handleJoin error:', err);
					this.$showMessage('warning', err.msg || 'error');

				} finally {
					this.isLoading = false;
				}
			},

			async initData() {
				await this.getUserInfo();
			}
		},
		onShow() {
			settingsApi().then((res) => {
				uni.setStorageSync('settings', res.data)
			}).catch(err => {
				console.log('request fail', err);
				if (err.data?.code == 403) {
					this.$showMessage('warning', err.data?.msg);
				} else {
					this.$showMessage('warning', err.msg);
				}
			})
			this.initData();
		}
	}
</script>

<style lang="scss" scoped>
	.level_bg_box {
		position: relative;
		margin-top: 10rpx;

		.level_bg {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			width: 264rpx;
			height: 252rpx;
			z-index: 9;
		}

		.bgctm {
			position: absolute;
			left: 50%;
			transform: translate(-50%, 42rpx);
			width: 670rpx;
			height: 328rpx;
			background: linear-gradient(50deg, #2670CC 0%, #7CC0FF 40%, #266FCB 100%);
			box-shadow: inset 0rpx 0rpx 0rpx 2rpx rgba(255, 255, 255, 0.35);
			border-radius: 24rpx;
		}

		.level-section {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-54%, 60%);

			.level_title_t {
				font-family: DIN, DIN;
				font-weight: bold;
				font-size: 60rpx;
				color: #FFFFFF;
				line-height: 72rpx;
				text-align: center;
				font-style: italic;
				white-space: nowrap;
			}
		}
	}

	.level_top_bg2 {
		position: relative;
		width: 750rpx;
		height: 420rpx;
		overflow: hidden;
	}

	.level-arc {
		position: absolute;
		top: -2052rpx;
		left: 50%;
		transform: translate(-50%, 0);
		width: 2400rpx;
		height: 2400rpx;
		border: 15rpx solid #f2f2f7;
		border-radius: 50%;
		z-index: 2;

		&.leftRotate {
			animation: rotate1 0.2s linear infinite;
		}

		&.rightRotate {
			animation: rotate2 0.2s linear infinite;
		}


		/* 定义旋转动画 */
		@keyframes rotate1 {
			from {
				transform: translate(-50%, 0) rotate(0deg);
			}

			to {
				transform: translate(-50%, 0) rotate(-14deg);
			}
		}

		@keyframes rotate2 {
			from {
				transform: translate(-50%, 0) rotate(0deg);
			}

			to {
				transform: translate(-50%, 0) rotate(14deg);
			}
		}

		.pieText {
			font-family: DINPro, DINPro;
			font-weight: 400;
			font-size: 24rpx;
			color: #fff;
			text-align: center;
			font-style: normal;
			transform: translate(-100%, 50rpx);
			white-space: nowrap;
		}

		.active {
			position: absolute;
			bottom: -22rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 30rpx;
			height: 30rpx;
			border-radius: 50%;
			background-color: #fff;
			z-index: 2;

			.activeText {
				position: absolute;
				left: 50%;
				font-family: DINPro, DINPro;
				font-weight: 400;
				font-size: 24rpx;
				color: #fff;
				text-align: center;
				font-style: normal;
				transform: translate(-50%, 60rpx);
			}
		}

		.aperture {
			position: absolute;
			bottom: -30rpx;
			left: 50%;
			transform: translateX(-50%);
			border-radius: 50%;
			width: 46rpx;
			height: 46rpx;
			background: #E9E8FB;
			opacity: 0.69;
			filter: blur(1px);
			z-index: 1;
		}

		.pie0 {
			position: absolute;
			bottom: 120rpx;
			left: 26%;
			width: 25rpx;
			height: 25rpx;
			border-radius: 50%;
			background-color: #fff;

			.pieText {
				font-family: DINPro, DINPro;
				font-weight: 400;
				font-size: 24rpx;
				color: #fff;
				text-align: center;
				font-style: normal;
				transform: translate(0, 50rpx);
				white-space: nowrap;
			}
		}

		.pie1 {
			position: absolute;
			bottom: 18rpx;
			left: 37%;
			width: 25rpx;
			height: 25rpx;
			border-radius: 50%;
			background-color: #fff;

			.pieText {
				position: absolute;
				left: 50%;
				font-family: DINPro, DINPro;
				font-weight: 400;
				font-size: 24rpx;
				color: #fff;
				text-align: center;
				font-style: normal;
				transform: translate(-50%, 50rpx);
				white-space: nowrap;
			}
		}

		.pie2 {
			position: absolute;
			bottom: 18rpx;
			right: 37%;
			width: 25rpx;
			height: 25rpx;
			border-radius: 50%;
			background-color: #fff;

			.pieText {
				position: absolute;
				left: 50%;
				font-family: DINPro, DINPro;
				font-weight: 400;
				font-size: 24rpx;
				color: #fff;
				text-align: center;
				font-style: normal;
				transform: translate(-50%, 50rpx);
				white-space: nowrap;
			}
		}

		.pie3 {
			position: absolute;
			bottom: 120rpx;
			right: 26%;
			width: 25rpx;
			height: 25rpx;
			border-radius: 50%;
			background-color: #fff;

			.pieText {
				font-family: DINPro, DINPro;
				font-weight: 400;
				font-size: 24rpx;
				color: #fff;
				text-align: center;
				font-style: normal;
				transform: translate(0, 50rpx);
				white-space: nowrap;
			}
		}
	}

	.level-arc2 {
		position: absolute;
		// #ifdef H5
		top: 410rpx;
		// #endif
		// #ifdef APP-PLUS
		top: 470rpx;
		// #endif
		width: 100vw;
		height: 120rpx;
		background-color: #1565b4;
		clip-path: polygon(0% 100%, 0% 0%, 16% 30%, 36% 56%, 66% 56%, 87% 28%, 100% 0%, 100% 58%, 100% 76%, 100% 90%, 100% 100%, 35% 100%);

	}

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
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}

	/* 保持原有样式不变 */
	.level_main {
		position: absolute;
		top: -6rpx;
		// background-color: #1565b4;
	}

	.team-container {
		/* height: 100%; */
	}

	.level_top_bg {
		position: relative;
		width: 750rpx;
		height: 380rpx;
		background: url('/static/level_bg.png') top left/100% no-repeat;
		padding-bottom: 44rpx;
	}

	.level-swiper-item {
		display: flex;
		justify-content: center;
		// background-color: #1565b4;
	}

	.level_icon_box {
		display: flex;
		margin-left: 60rpx;
	}

	.level_icon {
		width: 86rpx;
		height: 66rpx;
	}

	.level_right {
		position: absolute;
		top: 66%;
		left: 60%;
		display: flex;
		align-items: end;
		justify-content: center;
		transform: translateY(100%);

		& .level_right_amount.level_title_t2 {
			margin: 0;
			transform: translateX(-14%);
		}
	}



	.level_right_icon {
		width: 294rpx;
		height: 272rpx;
		margin-top: -72rpx;
		margin-right: 40rpx;
	}

	.level_line_box {
		padding: 0 66rpx;
		margin-top: 20rpx;

	}

	.level_line {
		height: 6rpx;
		/* border: 4rpx solid; */
		background: linear-gradient(45deg, rgba(91, 101, 255, 1), rgba(49, 236, 195, 1));
		margin-top: -18rpx;
	}

	.level_checked_icon {
		width: 32rpx;
		height: 32rpx;
	}

	.level_unchecked_icon {
		width: 32rpx;
		height: 32rpx;
	}

	.check_line_box {
		height: 32rpx;
		display: flex;
		justify-content: space-between;
		margin: 0 -16rpx;
	}

	.check_line_title {
		margin-top: 28rpx;
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #000000;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;

		.title_item {
			max-width: 36rpx;

			&.hidden {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}

	.level_table_box {
		background: #FFFFFF;
		// box-shadow: 0rpx 8rpx 20rpx -6rpx #E9F3FF;
		border-radius: 16rpx;
		margin: 30rpx 50rpx 40rpx 50rpx;

		.amount_box {
			position: absolute;
			top: 30rpx;
			left: 50%;
			transform: translateX(-50%);
		}

		.tag {
			display: inline-block;
			padding: 4rpx 12rpx 4rpx 14rpx;
			background: linear-gradient(0deg, #f5d2b7 0%, #f8edd5 100%);
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #333333;
			font-style: normal;
			border-radius: 16rpx 0 16rpx 0;
		}
	}

	.level_title {
		font-family: "DINProDINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: left;
		font-style: normal;
		margin-left: 40rpx;
		margin-top: 29rpx;
	}

	.level_title2 {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: left;
		font-style: normal;
		width: 574rpx;
		margin: 16rpx 36rpx 28rpx 40rpx;
	}

	.level_table_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 40rpx;
	}

	.table_title {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 24rpx;
		color: #1C2D57;
		line-height: 30rpx;
		text-align: left;
		font-style: normal;
	}

	.table_value {
		font-family: "DINPro-Regular", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 400;
		font-size: 24rpx;
		color: #1C2D57;
		line-height: 30rpx;
		text-align: left;
		font-style: normal;
	}

	.table_item_bg {
		background: #F5F8FF;
	}

	.w15 {
		width: 15%;
	}

	.w20 {
		width: 20%;
	}

	.w30 {
		width: 30%;
	}

	.w35 {
		width: 35%;
	}

	.w40 {
		width: 40%;
	}

	.text_center {
		text-align: center;
	}

	.join_btn {
		// height: 96rpx;
		// background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		background: #fff;
		border-radius: 24rpx;
		margin: 38rpx 50rpx 0 50rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		color: #000;
		// line-height: 96rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
		padding: 20rpx 0;
		width: 650rpx;
	}

	.bottom_btn {
		display: flex;
		justify-content: center;
		padding-bottom: 58rpx;
	}

	.swipe_arrow_img {
		width: 36rpx;
		height: 98rpx;
	}

	.left_arrow {
		position: absolute;
		width: 36rpx;
		height: 98rpx;
		left: 58rpx;
		// #ifdef H5
		top: 274rpx;
		// #endif
		// #ifdef APP-PLUS
		top: 326rpx;
		// #endif
		display: flex;
		align-items: center;
		z-index: 999;
	}

	.right_arrow {
		position: absolute;
		width: 36rpx;
		height: 98rpx;
		right: 58rpx;
		// #ifdef H5
		top: 274rpx;
		// #endif
		// #ifdef APP-PLUS
		top: 326rpx;
		// #endif
		display: flex;
		align-items: center;
		z-index: 999;
	}
</style>