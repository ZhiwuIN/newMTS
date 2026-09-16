<template>
	<customnavbar :title="pageTitle" @mtop="mtop">
		<view class="bill-record">
			<view class="top_box">
				<image src="/static/home/company_bgi.png" mode="widthFix" class="bgi_img"></image>
				<view class="text_box">
					<view class="title">关于我们的平台</view>
					<view class="desc">一个值得信赖的全球营销平台，助力用户共同赚钱。</view>
					<view class="line"></view>
					<view class="desc">全球用户</view>
					<view class="number">1.26M+</view>
				</view>
			</view>
			<view class="title_box">
				<view class="line"></view>
				Official information
			</view>
			<view class="bill-record-content" :style="topStyle">
				<view class="scroll-view-box list">
					<view class="list-item" v-for="(item, index) in list"
						v-if="!(item?.showTestAccount == false && userType == 'test')" :key="index"
						@click="toPage(item)">
						<view class="item_img_box">
							<image :src="item.iconUrl" mode="" class="item_img"></image>
						</view>
						<view>
							<view class="item-productName">{{ item.menuName }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	settingsApi
} from "@/common/api/users.js";
import {
	sonMenuListApi
} from "@/common/api/home.js";
export default {
	components: {
		customnavbar,
	},
	data() {
		return {
			userType: 'text',
			showwhitePaper: null,
			list: [],
			isHouseKeeper: false,
			userInfo: {},
			pageTitle: ''
		}
	},
	methods: {
		// 菜单
		getMenuListApi() {
			sonMenuListApi(
				this.pid
			).then(res => {
				let originalData = res.data;
				// if (this.userInfo.levelCode == '0') {
				// 	originalData = originalData.filter(item => {
				// 		return item.canEnterIntern != false;
				// 	});
				// }
				this.list = originalData; // 赋值给数据属性
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		toPage(value) {
			uni.setStorageSync('pageTitle', value.menuName)
			const {
				canEnterButlerMode, // 管家模式
				canEnterIntern, // 实习生
				allowUnverifiedAccess, // 实名
				targetValue,
				targetType // 链接类型
			} = value

			// 实习生不能进
			if (canEnterIntern == false && this.userInfo.levelCode == '0') {
				this.toPageTeamExpansion(targetValue)
				return
			}
			// console.log(canEnterButlerMode, this.isHouseKeeper)
			// 管家模式不允许进入
			if (canEnterButlerMode == false && this.isHouseKeeper) {
				this.$showMessage('warning', this.$t('您的帐户已被限制'));
				return
			}
			// 未实名不允许进入
			if (allowUnverifiedAccess == false && !this.userInfo.realName) {
				this.$showMessage('warning', this.$t('请先实名'));
				return
			}

			// 外部链接
			if (targetType == 2) {
				// #ifdef APP-PLUS
				plus.runtime.openURL(targetValue);
				// #endif

				// #ifdef H5
				uni.navigateTo({
					url: '/pages/HomePage/RechargeWebView?checkoutUrl=' + targetValue
				})
				// #endifF
				return
			}
			// 幸运转盘
			if (targetValue == '/pages/HomePage/lotteryPage') {
				this.toPage3(targetValue)
				return
			}

			if (value.children) {
				uni.navigateTo({
					url: targetValue + '?pid=' + value.id
				})
			} else {
				uni.navigateTo({
					url: targetValue
				})
			}

			uni.navigateTo({
				url: targetValue
			})
		},
		// 幸运转盘跳转
		toPage3(path) {
			let {
				pointWheel,
				luckyWheel
			} = uni.getStorageSync('settings')
			if (pointWheel == 0 && luckyWheel == 0) {
				this.$showMessage('warning', this.$t('暂未开放'));
				return
			}
			uni.navigateTo({
				url: path
			})
		},
		// 实习生跳转限制
		toPageTeamExpansion(path) {
			if (this.userInfo.levelCode == '0') {
				this.$showMessage('warning', this.$t('实习生没有权限'))
				return
			}
			uni.navigateTo({
				url: path
			})
		},
		mtop(e) {
			// #ifdef H5
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 46rpx)`
			// #endif
			// #ifdef APP-PLUS
			this.topStyle = "padding-top:" + (e - 46) + `rpx;height:calc(100vh - ${e}rpx - 66rpx)`
			// #endif
		},
	},
	onLoad(options) {
		if (uni.getStorageSync('pageTitle')) {
			this.pageTitle = uni.getStorageSync('pageTitle')
		} else {
			this.pageTitle = options.title
		}
		// 接收从上个页面传递的pid
		this.pid = options.pid;
		this.userInfo = uni.getStorageSync('userInfo')
		this.userType = uni.getStorageSync('userInfo').userType
		console.log(this.userInfo.housekeeper)
		if (this.userInfo.housekeeper == 1) {
			this.isHouseKeeper = true
		} else {
			this.isHouseKeeper = false
		}
		this.getMenuListApi()
	},
	onShow() {
		settingsApi().then((res) => {
			uni.setStorageSync('settings', res.data)
			this.showwhitePaper = res.data.whitePaper
		}).catch(err => {
			console.log('request fail', err);
			if (err.data?.code == 403) {
				this.$showMessage('warning', err.data?.msg);
			} else {
				this.$showMessage('warning', err.msg);
			}
		})
	},
}
</script>

<style lang="scss" scoped>
.top_box {
	position: relative;

	.bgi_img {
		width: 100%;
		margin-bottom: 48rpx;
	}

	.text_box {
		position: absolute;
		top: 48rpx;
		left: 32rpx;
		color: #fff;
		max-width: 367rpx;

		.title {
			font-size: 48rpx;
			font-weight: 500;
			margin-bottom: 8rpx;
		}

		.desc {
			font-size: 24rpx;
			font-weight: 300;
			margin-bottom: 16rpx;
			line-height: 48rpx;
		}

		.line {
			width: 307rpx;
			height: 2rpx;
			background-color: #D8D8D8;
			margin-bottom: 16rpx;
		}

		.number {
			font-size: 32rpx;
			font-weight: 600;
			transform: translateY(-24rpx);
		}
	}
}

.title_box {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-left: 32rpx;
	font-family: MiSans;
	font-size: 32rpx;
	font-weight: 500;

	.line {
		width: 8rpx;
		height: 40rpx;
		background: #000000;
	}
}

.scroll-view-box {
	// min-height: 0;
	// flex: 1;
	// height: 1px;
}

.bill-record {
	height: 100%;

	.bill-record-content {
		display: flex;
		flex-direction: column;
		padding: 24rpx 32rpx;
		padding-bottom: 0;

		.list-content {
			// padding-top: 40rpx;
			overflow: scroll;

			-ms-overflow-style: none;
			/* IE and Edge */
			scrollbar-width: none;


			.bill-record::-webkit-scrollbar {
				display: none;
				/* Chrome, Safari and Opera */
			}
		}

		.list {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 14rpx;

			.list-item {
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				// justify-content: space-between;
				align-items: center;

				.item_img_box {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 96rpx;
					height: 96rpx;
					border-radius: 16rpx;
					background: #F4F4F4;

					.item_img {
						width: 76rpx;
						height: 76rpx;
					}
				}



				.item-productName {
					font-family: DINPro, DINPro;
					font-weight: 500;
					font-size: 26rpx;
					color: #000000;
					text-align: center;
					margin-top: 8rpx;
					margin-bottom: 24rpx;
				}
			}
		}
	}
}
</style>