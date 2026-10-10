<template>
	<view>
		<customnavbar :title="$t('pointsMall')"
			backgroundStr="url('/static/pointsMall/bg_top.png') top left/100% no-repeat" @mtop="mtop"
			:whiteTitle="true">
			<view class="mall_top_bg" :style="topStyle">
				<!-- 数据展示区域 -->
				<view class="myBonusPointsBox">
					<image src="/static/lottery/intégration.png" mode="" style="width: 114rpx;height: 114rpx;"></image>
					<view class="text_box">
						<view class="number">{{ points }}</view>
						<view class="title">{{ $t('myBonusPoints') }}</view>
					</view>
				</view>
				<view class="tabList">
					<view class="tabItem" @click="toPage('/pages/HomePage/pointsDetailsPage')">
						<image class="tabImg" src="/static/pointsMall/IntegrationDetails.png" mode=""></image>
						<view class="tabText">{{ $t('积分明细') }}</view>
						<view class="tabArrow">›</view>
					</view>
					<view class="tabItem" @click="toPage('/pages/HomePage/exchangeRecordPage')">
						<image class="tabImg" src="/static/pointsMall/ExchangeRecord.png" mode=""></image>
						<view class="tabText">{{ $t('兑换记录') }}</view>
						<view class="tabArrow">›</view>
					</view>
				</view>
				<view class="tabs_box_main">
					<view class="tabs_box">
						<uv-tabs :list="levelTabList" @change="changeLevel" :current="activeLevelIdx">
							<template #badge="{ item, index }">
								<view class="levelTab" :class="{ active: index == activeLevelIdx }">
									<image class="levelTabImg" :src="item.image" v-if="item.image" mode=""
										:lazy-load="true"></image>
									<view>{{ item.levelName }}</view>
								</view>
							</template>
						</uv-tabs>
					</view>
				</view>
				<view class="commodity-box" v-if="produitList.length">
					<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
						@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
						class="scroll-view-box">
						<view class="commodity-list">
							<view class="commodityItem" v-for="item in produitList" :key="item.id">
								<view class="commodityTop">
									<image class="commodityImage" :src="item.imageUrl" mode="aspectFill"></image>
									<view class="commodityInfo">
										<view>
											<view class="commodityName">{{ item.productName || '--' }}</view>
											<view class="description">{{ item.description || '--' }}</view>
										</view>
										<view>
											<view class="commodityPrice">
												<image src="/static/lottery/intégration.png" mode=""
													style="width: 52rpx;height: 52rpx;">
												</image>
												<view class="pointsPrice">{{ item.pointsPrice }}</view>
											</view>
											<view class="Redeemed">{{ $t('库存') }}: {{ item.stock }}</view>
										</view>
									</view>
								</view>
								<view class="conversion" @click="conversion(item)">{{ $t('兑换') }}</view>
							</view>
						</view>
						<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
							image="/static/default/Nocontent.png" key="listbottom"></listbottom>
					</scroll-view>
				</view>
				<view v-else class="default_box">
					<image src="/static/mine/applicationRecord/nullPositionManage.png" mode="" class="default_image">
					</image>
					<view>{{ loading ? $t('common.loading') : $t('default.NoTasks') }}</view>
				</view>
			</view>

			<uni-popup ref="logout_popup" type="center" border-radius="10px 10px 0 0">
				<view class="logout_pop_page">
					<view class="logout_pop_top">{{ $t("home.Prompt") }}</view>
					<view class="logout_pop_content">
						{{ $t("确认兑换1") }}{{ popup.pointsPrice }}{{ $t("确认兑换2") }}{{ popup.productName }} ?
					</view>
					<view class="logout_pop_bottom">
						<button class="btn_cancel" @click="cancel">{{ $t('home.cancel') }}</button>
						<button class="btn_confirm" @click="confirm">{{ $t('home.Sure') }}</button>
					</view>
				</view>
			</uni-popup>

			<uni-popup ref="logout_popup2" type="center" border-radius="10px 10px 0 0">
				<view class="logout_pop_page">
					<view class="logout_pop_top">{{ $t("home.Prompt") }}</view>
					<view class="logout_pop_content">
						{{ $t("兑换成功") }}
					</view>
					<view class="logout_pop_bottom">
						<button class="btn_confirm" @click="$refs.logout_popup2.close()">{{ $t('home.Sure') }}</button>
					</view>
				</view>
			</uni-popup>
			<!-- 抽奖记录按钮 -->
			<view class="enregistrer" v-if="pointRuleId"
				@click="toPage(`/pages/commonDetailsPage?title=Integral Rules&id=${pointRuleId}`)">
				{{ $t('积分规则') }}
			</view>
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
import {
	noticeListApi
} from "@/common/api/home.js";
import {
	shopLevelListApi
} from "@/common/api/level.js";
export default {
	components: {
		customnavbar,
		listbottom
	},
	data() {
		return {
			activeLevelIdx: 0,
			levelTabList: [],
			topStyle: null,
			points: 0, // 剩余积分
			page: {
				pageNum: 1,
				pageSize: 10,
				productLevel: 1
			},
			nodata: false,
			hasMore: true,
			loading: false,
			produitList: [],
			popup: {},
			isRefreshing: false,
			pointRuleId: null
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
		// 等级筛选
		this.getVipInfo()
		// 积分规则
		this.getPointRule()
	},
	methods: {
		getVipInfo() {
			shopLevelListApi().then((res) => {
				this.levelTabList = res.data || []
			}).catch((err) => {
				console.log('request fail', err);
			})
		},
		changeLevel(e) {
			this.activeLevelIdx = e.index
			this.page.productLevel = e.levelCode
			this.page.pageNum = 1
			this.produitList = []
			this.nodata = false
			this.hasMore = true
			this.getPointPrizeListApi()
		},
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
				this.getPointPrizeListApi()
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
		// 获取积分规则
		async getPointRule() {
			const res = await noticeListApi(9, { pageNum: 1, pageSize: 10 })
			if (res.code == 200) {
				this.pointRuleId = res.rows[0]?.noticeId
			}
		},
		// 商品列表
		getPointPrizeListApi() {
			this.loading = true
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			pointPrizeListApi(this.page).then((res) => {
				this.loading = false
				if (this.page.pageNum == 1) this.produitList = res.data.rows || []
				else this.produitList.push(...res.data.rows)
				this.nodata = res.data.total == 0
				if (this.produitList.length == res.data.total) this.hasMore = false
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
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 28) + "rpx"
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 28) + "rpx"
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
.enregistrer {
	position: fixed;
	right: -6rpx;
	top: 20%;
	padding: 18rpx 12rpx;
	// background: #2D81F5;
	background-color: $themeColor;
	// box-shadow: 10rpx 0rpx 21rpx 0rpx #50B4D9;
	border-radius: 16rpx 0rpx 0rpx 16rpx;
	border: 1rpx solid #FFFFFF;
	font-family: DINPro, DINPro;
	font-weight: 400;
	font-size: 24rpx;
	color: #FFFFFF;
	// transform: rotate(90deg);
	writing-mode: vertical-rl;
}

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
	background: #2167d5;
	// box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
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
	background: url('/static/pointsMall/bg_top.png') top left/100% no-repeat;
	// background: $themeColor;

	.myBonusPointsBox {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 0 0 24rpx 28rpx;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 72rpx;
		color: #FFFFFF;

		.text_box {
			display: flex;
			flex-direction: column;
			gap: 8rpx;

			.number {
				font-size: 62rpx;
				line-height: 62rpx;
			}

			.title {
				font-size: 24rpx;
				font-weight: normal;
			}
		}
	}

	.tabList {
		display: flex;
		gap: 24rpx;
		padding: 0 32rpx;
		// margin-bottom: 58rpx;
		transform: translateY(-10rpx);

		.tabItem {
			position: relative;
			display: flex;
			align-items: center;
			flex: 1;
			min-width: 0;
			height: 112rpx;
			padding: 0 18rpx;
			box-sizing: border-box;
			border: 2rpx solid rgba(255, 255, 255, .38);
			border-radius: 24rpx;
			background: linear-gradient(135deg, #174fbd 0%, #477be1 72%, #6699f2 100%);
			box-shadow: inset 0 2rpx 5rpx rgba(255, 255, 255, .28), 0 8rpx 16rpx rgba(18, 70, 160, .28);
			overflow: hidden;

			&:last-child {
				background: linear-gradient(135deg, #087b9d 0%, #098aa0 55%, #45b79e 100%);
				box-shadow: inset 0 2rpx 5rpx rgba(255, 255, 255, .3), 0 8rpx 16rpx rgba(2, 101, 120, .25);
			}

			.tabImg {
				flex-shrink: 0;
				width: 76rpx;
				height: 76rpx;
				border-radius: 50%;
			}

			.tabText {
				flex: 1;
				min-width: 0;
				padding: 0 10rpx 0 14rpx;
				font-family: DINPro, sans-serif;
				font-weight: 500;
				font-size: 24rpx;
				line-height: 30rpx;
				color: #FFFFFF;
				text-align: left;
			}

			.tabArrow {
				flex-shrink: 0;
				font-family: Arial, sans-serif;
				font-size: 50rpx;
				font-weight: 300;
				line-height: 1;
				color: #FFFFFF;
			}
		}
	}

	.tabs_box_main {
		padding: 24rpx 0 18rpx;
		color: #FFFFFF;

		.tabs_box {
			flex-shrink: 0;

			.levelTab {
				display: flex;
				align-items: center;
				gap: 8rpx;
				min-height: 60rpx;
				padding: 6rpx 14rpx;
				box-sizing: border-box;
				border-radius: 6rpx;
				background-color: #f3f5f7;
				font-size: 32rpx;
				line-height: 32rpx;
				color: #3D3D3D;

				&.active {
					color: #FFFFFF;
					background: #2167D5;
				}

				.levelTabImg {
					width: 48rpx;
					height: 48rpx;
				}
			}
		}
	}

	.commodity-box {
		display: flex;
		flex-direction: column;
		// height: 100vh; // 确保父容器高度占满
		// min-height: calc(100vh - 410rpx);
		height: calc(100vh - 354rpx);
		background: #f7f7f7;
		padding: 24rpx 0;
		padding-bottom: 0;


		.commodity-list {
			display: flex;
			flex-direction: column;
			gap: 16rpx;
			margin-bottom: 48rpx;
			padding: 0 24rpx;

			.commodityItem {
				width: 100%;
				padding: 24rpx;
				box-sizing: border-box;
				background: #FFFFFF;
				border-radius: 12rpx;

				.commodityTop {
					display: flex;
					align-items: center;
					margin-bottom: 24rpx;
				}

				.commodityImage {
					flex-shrink: 0;
					width: 228rpx;
					min-width: 228rpx;
					height: 228rpx;
					background: #FFFFFF;
					border-radius: 12rpx;
					margin-right: 24rpx;
				}

				.commodityInfo {
					display: flex;
					flex: 1;
					min-width: 0;
					align-self: stretch;
					flex-direction: column;
					justify-content: space-between;
				}

				.commodityName {
					max-width: 100%;
					font-family: DINPro, DINPro;
					font-weight: 500;
					font-size: 32rpx;
					line-height: 32rpx;
					color: #000000;
					font-style: normal;
					margin-bottom: 12rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				.description {
					font-family: DINPro, DINPro;
					// font-weight: 500;
					font-size: 26rpx;
					line-height: 26rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				.Redeemed {
					font-size: 26rpx;
					line-height: 26rpx;
					color: #666666;
				}

				.commodityPrice {
					display: flex;
					align-items: center;
					gap: 10rpx;
					font-family: DINPro, DINPro;
					font-weight: 500;
					font-size: 34rpx;
					line-height: 34rpx;
					color: #2167D5;

					.pointsPrice {
						transform: translateY(-2rpx);
					}
				}

				.conversion {
					height: 64rpx;
					line-height: 64rpx;
					text-align: center;
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 28rpx;
					color: #FFFFFF;
					background: #2167D5;
					border-radius: 8rpx;
				}
			}
		}
	}

	.default_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.default_image {
			width: 466rpx;
			height: 466rpx;
		}
	}
}

::v-deep .uv-tabs__wrapper__nav__item-0 {
	margin-left: 24rpx;
}
</style>
