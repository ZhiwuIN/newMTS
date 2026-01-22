<template>
	<view>
		<customnavbar :title="$t('pointsMall')"
			backgroundStr="url('/static/login/login_bg.png') top left/100%  no-repeat" @mtop="mtop" :whiteTitle="true">
			<view class="mall_top_bg" :style="topStyle">
				<!-- 数据展示区域 -->
				<view class="myBonusPointsBox">
					<image src="/static/lottery/intégration.png" mode="" style="width: 84rpx;height: 84rpx;"></image>
					<view>{{points}}</view>
				</view>
				<view class="commodity-box">
					<view class="tabList">
						<view class="tabItem" @click="toPage('/pages/HomePage/pointsDetailsPage')">
							<image class="tabImg" src="/static/lottery/IntegrationDetails.png" mode=""></image>
							<view style="margin-top: 10rpx;">{{$t('积分明细')}}</view>
						</view>
						<view class="line"></view>
						<view class="tabItem" @click="toPage('/pages/HomePage/exchangeRecordPage')">
							<image class="tabImg" src="/static/lottery/ExchangeRecord.png" mode=""></image>
							<view style="margin-top: 10rpx;">{{$t('兑换记录')}}</view>
						</view>
					</view>

					<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
						@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
						class="scroll-view-box">
						<view class="commodity-list">
							<view class="commodityItem" v-for="item in produitList">
								<image class="commodityImage" :src=" item.imageUrl" mode=""></image>
								<view class="commodityName">{{item.productName || '--'}}</view>
								<view class="commodityPrice">
									<view style="display: flex;align-items: end;gap: 10rpx;">
										<image src="/static/lottery/intégration.png" mode=""
											style="width: 34rpx;height: 34rpx;"></image>
										<view>{{item.pointsPrice}}</view>
									</view>
									<view class="conversion" @click="conversion(item)">{{$t('兑换')}}</view>
								</view>
							</view>
						</view>
						<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
							image="/static/default/No content.png" key="listbottom"></listbottom>
					</scroll-view>


				</view>
			</view>

			<uni-popup ref="logout_popup" type="center" border-radius="10px 10px 0 0">
				<view class="logout_pop_page">
					<view class="logout_pop_top">{{$t("home.Prompt")}}</view>
					<view class="logout_pop_content">
						{{$t("确认兑换1")}}{{popup.pointsPrice}}{{$t("确认兑换2")}}{{popup.productName}} ?
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
						{{$t("兑换成功")}}
					</view>
					<view class="logout_pop_bottom">
						<button class="btn_confirm" @click="$refs.logout_popup2.close()">{{$t('home.Sure')}}</button>
					</view>
				</view>
			</uni-popup>

		</customnavbar>
	</view>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import listbottom from '../../component/list-bottom/list_bottom.vue'
	import {
		luckyCountApi,
		pointPrizeListApi,
		pointPrizeExchangeApi
	} from "@/common/api/home.js";
	export default {
		components: {
			customnavbar,
			listbottom
		},
		data() {
			return {
				url: 'http://13.245.95.135:8888',
				// url: 'http://192.168.2.35:8080',
				topStyle: null,
				points: 0, // 剩余积分
				page: {
					pageNum: 1,
					pageSize: 10
				},
				nodata: false,
				hasMore: true,
				loading: false,
				produitList: [],
				popup: {},
				isRefreshing: false
			}
		},
		mounted() {
			if (uni.getStorageSync('settings').mallSwitch == 0) {
				this.$showMessage('warning', this.$t('暂未开放'));
				this.$customizeBack()
				return
			}
			// 获取剩余积分
			this.getLuckyCount()
			// 商品列表
			this.getPointPrizeListApi()
		},
		methods: {
			onRefresh() {
				this.isRefreshing = true;
				this.page.pageNum = 1
				this.nodata = false
				this.hasMore = true
				this.loading = false
				this.getLuckyCount()
				this.getPointPrizeListApi()
				setTimeout(() => {
					this.isRefreshing = false
				}, 500)
			},
			// 兑换按钮
			conversion(row) {
				this.popup = row
				this.$refs.logout_popup.open()
			},
			// 确定兑换
			confirm() {
				if (this.popup.pointsPrice > this.points) {
					this.$showMessage('warning', this.$t('积分不足'));
					return
				}
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				pointPrizeExchangeApi(uni.getStorageSync('userInfo').userId, this.popup.id).then((res) => {
					this.$refs.logout_popup2.open()
					this.getLuckyCount()
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
					this.$refs.logout_popup.close()
				})
			},
			cancel() {
				this.$refs.logout_popup.close()
			},
			// 商品列表
			getPointPrizeListApi() {
				this.loading = true
				uni.showLoading({
					title: this.$t('loading.btn')
				});
				pointPrizeListApi(this.page).then((res) => {
					this.loading = false
					if (this.page.pageNum == 1) this.produitList = res.rows || []
					else this.produitList.push(...res.rows)
					this.nodata = res.total == 0
					if (this.produitList.length == res.total) this.hasMore = false
				}).catch((err) => {
					console.log('request fail', err);
					this.loading = false
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					uni.hideLoading();
				})
			},
			// 剩余积分
			getLuckyCount() {
				luckyCountApi().then((res) => {
					if (res.data) {
						this.points = res.data.points
					}
				})
			},
			mtop(e) {
				// #ifdef H5
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
				// #endif
				// #ifdef APP-PLUS
				this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
				// #endif
			},
			toPage(url) {
				uni.navigateTo({
					url
				})
			},
			onReachBottom() {
				// console.log('加载')
				if (!this.loading && this.hasMore) {
					this.page.pageNum += 1
					this.getPointPrizeListApi()
				}
			}
		},
	}
</script>

<style scoped lang="scss">
	.scroll-view-box {
		flex: 1; // 自动填充剩余高度
		overflow-y: auto; // 确保滚动生效
		// // #ifdef H5
		// height: calc(100vh - 656rpx);
		// // #endif
		// // #ifdef APP-PLUS
		// height: calc(100vh - 566rpx);
		// // #endif
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


	.mall_top_bg {
		width: 100%;
		background: url('/static/login/login_bg.png') top left/100% no-repeat;

		.myBonusPointsBox {
			display: flex;
			align-items: end;
			gap: 12rpx;
			padding: 0 0 76rpx 40rpx;
			font-family: DINPro, DINPro;
			font-weight: 500;
			font-size: 72rpx;
			color: #FFFFFF;
		}

		.commodity-box {
			display: flex;
			flex-direction: column;
			// height: 100vh; // 确保父容器高度占满
			// min-height: calc(100vh - 410rpx);
			height: calc(100vh - 354rpx);
			background: #f5faff;
			border-radius: 48rpx 48rpx 0rpx 0rpx;
			// transform: translateY(-48rpx);
			margin-top: -48rpx;
			padding: 54rpx 0;
			padding-bottom: 0;

			.tabList {
				display: flex;
				justify-content: space-evenly;
				margin-bottom: 58rpx;

				.line {
					width: 2rpx;
					height: 58rpx;
					background: #D8D8D8;
					margin-top: 22rpx;
				}

				.tabItem {
					display: flex;
					flex-direction: column;
					align-items: center;
					max-width: 200rpx;
					text-align: center;
					// gap: 20rpx;

					.tabImg {
						width: 96rpx;
						height: 96rpx;
						border-radius: 50%;
						// background: #D8D8D8;
					}
				}
			}

			.commodity-list {
				display: flex;
				flex-wrap: wrap;
				gap: 48rpx 30rpx;
				margin-bottom: 58rpx;
				padding: 0 40rpx;

				.commodityItem {
					.commodityImage {
						width: 320rpx;
						height: 330rpx;
						background: #FFFFFF;
						border-radius: 8rpx;
						margin-bottom: 20rpx;
					}

					.commodityName {
						max-width: 320rpx;
						font-family: DINPro, DINPro;
						font-weight: 500;
						font-size: 32rpx;
						color: #000000;
						font-style: normal;
						margin-bottom: 10rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.commodityPrice {
						display: flex;
						align-items: center;
						justify-content: space-between;
						font-family: DINPro, DINPro;
						font-weight: 500;
						font-size: 28rpx;
						color: #FFBD56;
					}

					.conversion {
						padding: 2rpx 16rpx;
						font-family: PingFangSC, PingFang SC;
						font-weight: 400;
						font-size: 24rpx;
						color: #FFFFFF;
						background: #FFBD56;
						border-radius: 18rpx;
					}
				}
			}
		}
	}
</style>