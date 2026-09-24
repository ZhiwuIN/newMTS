<template>
	<homenavbar homenavbar backgroundStr="''" :showBack="false" @mtop='mtop' :isHome="true">
		<view class="top-bg" :style="topStyle"></view>
		<view class="task-page" :style="topStyle2">
			<view class="task_top_card" :style="taskTopCardStyle">
				<view class="text_box">
					<view>{{ $t('taskPage.finishToday') }}</view>
					<view>{{ $t('taskPage.earnToday') }}</view>
					<view class="small">{{ $t('taskPage.dailyTaskCenter') }}</view>
				</view>
				<!-- 顶部数据卡片 -->
				<view class="data_box">
					<image class="tag_img" src="/static/task/tag_img.png" mode=""></image>
					<view class="data_row">
						<view class="dataItem">
							<view class="tag">{{ $t('今日任务收益') }}</view>
							<view class="income">{{ taskInfo.todayTaskCommission || 0 }} <span>{{ currency }}</span>
							</view>
						</view>
						<view class="dataItem">
							<view class="DAILY">{{ $t('taskPage.daily') }}</view>
						</view>
					</view>

					<view class="data_row">
						<view class="dataItem progress_box">
							<view class="progress_text">
								<view
									style="width: 100%;display: flex;align-items: center;justify-content: space-between;">
									<view class="tag">{{ $t('今日任务进度') }}</view>
									<view class="num">{{ taskInfo.todayDoneCount || 0 }}/{{ taskInfo.taskQuota || 0 }}
									</view>
								</view>
							</view>
							<t-progress :color="'#000'" style="width: 100%;" :label="false"
								:percentage="taskInfo.taskQuota ? (taskInfo.todayDoneCount / taskInfo.taskQuota) * 100 : 0" />
						</view>
					</view>
				</view>
			</view>

			<!-- 瀑布流容器 -->
			<view class="custom-waterfalls" v-if="isShow">
				<keep-alive>
					<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing"
						@scrolltolower="onReachBottom" @refresherrefresh="onRefresh" :refresher-threshold="120"
						:style="scrollViewStyle" ref="scrollViewElement" :scroll-top="scrollTop" @scroll="onPageScroll">

						<custom-waterfalls-flow :taskList="taskList" :currency="currency" @wapperClick="startTask"
							ref="scrollView">
						</custom-waterfalls-flow>

						<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
							image="/static/default/No order.png"></listbottom>
					</scroll-view>
				</keep-alive>
			</view>
		</view>

		<uni-popup ref="promptpopup" type="center">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ $t('请先实名') }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_cancel_btn" @click="prompt_cancel">{{ $t('pay.no') }}</button>
					<button class="prompt_confirm_btn" @click="prompt_confirm">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="promptpopup2" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps">{{ dialog_yes_message }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm_yes">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>
		<!-- 富文本提示 -->
		<uni-popup ref="promptpopup3" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
				<view class="prompt_pop_taps" v-html="failTips"></view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm_yes2">{{ $t('pay.yes') }}</button>
				</view>
			</view>
		</uni-popup>
	</homenavbar>

	<contactWay />
</template>

<script>
import homenavbar from '@/component/home-navbar/home-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import contactWay from '@/components/contactWay/contactWay.vue';
import {
	getTaskLists,
	getTheTaskQuotaOfTheDay
} from '@/common/api/task.js'
import {
	userInfoApi,
	settingsApi
} from "@/common/api/users.js";
import {
	htmlToPlainText
} from "@/utils/utils.js";
export default {
	components: {
		homenavbar,
		listbottom,
		contactWay
	},
	data() {
		return {
			failTips: '',
			dialog_yes_message: '',
			scrollTop: 0,
			needRestoreScroll: false,
			topStyle: '',
			topStyle2: '',
			scrollViewBaseHeight: '',
			currency: '',
			userInfo: {},
			taskInfo: {},
			taskList: [],
			page: {
				pageNum: 1,
				pageSize: 10
			},
			nodata: false,
			hasMore: true,
			loading: false,
			isShow: false,
			isRefreshing: false,
			levelCode: '',
			preLoadScrollTop: 0,
			taskCardHeight: 298, // 顶部卡片基线高度（rpx，手工调校值）
			textBoxExtraHeight: 0, // 长文案换行后卡片额外增加的高度（rpx）
			navHeight: 0, // 导航栏高度（rpx），用于重算列表高度
			taskCardCollapseOffset: 0,
			taskCardCollapseMax: 220,
			windowWidth: 375,
			errorCode: 0
		};
	},
	computed: {
		taskTopCardStyle() {
			const offset = this.taskCardCollapseOffset;
			return `transform: translateY(-${offset}rpx); margin-bottom: -${offset}rpx;`;
		},
		scrollViewStyle() {
			if (!this.scrollViewBaseHeight) return '';
			return `height: calc(${this.scrollViewBaseHeight} + ${this.taskCardCollapseOffset}rpx);`;
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync();
		this.windowWidth = systemInfo.windowWidth || 375;
		this.scrollTop = uni.getStorageSync('taskListScrollTop') || 0;
		this.updateTaskCardCollapse(this.scrollTop);
		this.currency = uni.getStorageSync('settings').currency;
		this.getTaskList().then(() => {
			this.$nextTick(() => {
				this.needRestoreScroll = true;
			});
		});
		this.isShow = true;
	},
	onReady() {
		// 首屏渲染完成后量一次标题区高度（长语言会换行，卡片随之变高）
		this.measureTextBoxHeight();
	},
	async onShow() {
		// 语言可能在设置页切换过，每次显示重新量一次
		this.measureTextBoxHeight();
		this.getUserInfo();
		const completedId = uni.getStorageSync('isTodayCompletedId');
		// await this.theTaskQuotaOfTheDay();
		if (this.taskList.length && completedId) {
			uni.removeStorageSync('isTodayCompletedId');
			this.needRestoreScroll = true;
			this.$nextTick(() => {
				// 修复：检查scrollView引用是否存在且有refresh方法
				if (this.$refs.scrollView && typeof this.$refs.scrollView.refresh === 'function') {
					this.$refs.scrollView.refresh();
				}
			});
		}
		if (this.levelCode === '') {
			return
		} else {
			if (uni.getStorageSync('levelCode') != this.levelCode) {
				this.page.pageNum = 1
				this.getTaskList();
				this.isShow = true;
				this.taskList = [];
			}
		}

	},
	onUnload() {
		uni.setStorageSync('taskListScrollTop', this.scrollTop);
	},
	methods: {
		prompt_confirm() {
			this.$refs.promptpopup.close()
			uni.navigateTo({
				url: '/pages/MinePage/identity'
			})
		},
		prompt_confirm_yes() {
			this.$refs.promptpopup2.close()
			return
		},
		prompt_confirm_yes2() {
			this.$refs.promptpopup3.close()
			return
		},
		prompt_cancel() {
			this.$refs.promptpopup.close()
		},
		onPageScroll(e) {
			const scrollTop = e.detail?.scrollTop ?? e.scrollTop ?? 0;
			this.scrollTop = scrollTop;
			this.updateTaskCardCollapse(scrollTop);
		},
		updateTaskCardCollapse(scrollTop = 0) {
			const scrollRpx = scrollTop * 750 / this.windowWidth;
			this.taskCardCollapseOffset = Math.min(this.taskCardCollapseMax, Math.max(0, scrollRpx));
		},
		onRefresh() {
			// this.isRefreshing = true;
			// this.page.pageNum = 1;
			getTaskLists().then((res) => {
				this.taskList = res.data || [];
				// this.taskList = [...new Map(this.taskList.map(item => [item.taskId, item])).values()];
				// this.taskList = this.taskList.filter(item => item.isTodayCompleted !== 1);
				// if (!this.taskList.length && res.rows.length) {
				// 	this.onReachBottom()
				// }
				// if (this.taskList.length < 10 && res.rows.length) {
				// 	this.onReachBottom()
				// }
				this.levelCode = this.userInfo.levelCode;
				// this.nodata = res.total === 0;
				// this.hasMore = this.taskList.length !== res.total;
				this.scrollTop = 0;
				this.updateTaskCardCollapse(0);
				this.isRefreshing = false;
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			})
		},
		mtop(e) {
			// 导航栏高度（从组件获取），供 updateScrollViewHeight 复用
			this.navHeight = e;

			// #ifdef H5
			// H5端：额外减去底部可能的留白
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 88) + "rpx"
			// #endif

			// #ifdef APP-PLUS
			// APP端：更紧凑的计算
			this.topStyle = "margin-top:-" + e + "rpx;padding-top:" + (e + 99) + "rpx"
			// #endif

			this.updateScrollViewHeight();
		},
		// 列表可用高度 = 屏幕高度 - 导航栏高度 - 顶部卡片实际高度
		// 卡片实际高度 = 基线高度 + 长文案换行带来的额外高度
		updateScrollViewHeight() {
			if (!this.navHeight) return;
			const cardHeight = this.taskCardHeight + this.textBoxExtraHeight;

			// #ifdef H5
			// H5端：额外减去底部可能的留白
			this.scrollViewBaseHeight = `100vh - ${this.navHeight}rpx - ${cardHeight}rpx - 300rpx`;
			// #endif

			// #ifdef APP-PLUS
			this.scrollViewBaseHeight = `100vh - ${this.navHeight}rpx - ${cardHeight}rpx - 128rpx`;
			// #endif
		},
		// 量一次标题区高度：fr/ru/tv 等长文案会换行使卡片变高，
		// 把增量补进列表高度，避免下方瀑布流被挤出屏幕
		measureTextBoxHeight() {
			this.$nextTick(() => {
				uni.createSelectorQuery().in(this).select('.text_box').boundingClientRect((rect) => {
					if (!rect || !rect.height) return;
					const heightRpx = rect.height * 750 / this.windowWidth;
					// 不换行时基线 = 94(标题) + 94(标题) + 32(小字) = 220rpx
					const extra = heightRpx - 220;
					// 只有真正换行（超过半行）才计入，保证 en/zh/es 等不换行的语言布局不变
					this.textBoxExtraHeight = extra >= 47 ? Math.round(extra) : 0;
					this.updateScrollViewHeight();
				}).exec();
			});
		},
		getUserInfo() {
			userInfoApi().then((res) => {
				this.userInfo = res.data;
				uni.setStorageSync('userInfo', res.data);
				this.getTaskInfo();
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			});
		},
		getTaskInfo() {
			this.errorCode = 0
			getTheTaskQuotaOfTheDay().then((res) => {
				this.taskInfo = res.data;
			}).catch((err) => {
				console.log('request fail', err);
				// this.$showMessage('warning', err.msg);
				this.failTips = err.msg
				if (htmlToPlainText(err.msg)) {
					this.$refs.promptpopup3.open()
				}
			});
		},
		getTaskList() {
			this.loading = true;
			uni.showLoading({
				title: this.$t('loading.btn')
			});

			return getTaskLists().then((res) => {
				this.loading = false;
				this.taskList = res.data || [];
				this.levelCode = this.userInfo.levelCode;
				// this.nodata = res.total === 0;
				this.hasMore = this.taskList.length !== res.total;
				// if (this.page.pageNum > 1) {
				// 	this.scrollTop = this.preLoadScrollTop;
				// }
			}).catch((err) => {
				this.loading = false;
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			});
		},
		startTask(e) {
			if (this.userInfo.housekeeper == 1) {
				this.dialog_yes_message = this.$t("withdrawal.restrictedAccess")
				this.$refs.promptpopup2.open()
				return
			}
			if (!this.userInfo.realName) {
				this.$refs.promptpopup.open()
				return
			}
			// if (this.userInfo.levelCode == '0' && this.isOverFourDays(this.userInfo.registerTime)) {
			// 	this.$showMessage('warning', this.$t('实习期结束'));
			// 	return;
			// }
			// if (this.userInfo.levelCode != '0' && this.checkGhanaWeekend()) {
			// 	this.$showMessage('warning', this.$t('不能进行任务'));
			// 	return;
			// }
			if (this.taskInfo.tasksRemainingToday <= 0) {
				this.$showMessage('warning', this.$t('Todayopportunities'));
				return;
			}
			uni.setStorageSync('taskListScrollTop', this.scrollTop);
			uni.navigateTo({
				url: `/pages/TaskPage/taskDetails?id=${e.taskId}`
			});
		},
		checkGhanaWeekend() {
			const now = new Date();
			const utcDay = now.getUTCDay();
			const ghanaDay = utcDay === 0 ? 7 : utcDay;
			return !this.taskInfo?.taskEnabledDaysList?.includes(ghanaDay);
		},
		padZero(num) {
			return num < 10 ? '0' + num : num
		},
		isOverFourDays(registerTime) {
			// 解析注册时间
			const registerDate = new Date(registerTime);

			// 设置注册日期的零点（清除时分秒）
			registerDate.setHours(0, 0, 0, 0);

			// 获取当前日期的零点
			const now = new Date();
			now.setHours(0, 0, 0, 0);

			// 计算两个日期之间的天数差（毫秒转换为天）
			const timeDiff = now - registerDate;
			const dayDiff = timeDiff / (24 * 60 * 60 * 1000);

			return dayDiff > 3;
		},
		onReachBottom() {
			if (!this.loading && this.hasMore) {
				this.preLoadScrollTop = this.scrollTop;
				this.page.pageNum += 1;
				this.getTaskList();
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.top-bg {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1076rpx;
	background:
		radial-gradient(circle at 0% 0%, #69d6ec 0%, rgba(105, 214, 236, 0.55) 34%, transparent 62%),
		radial-gradient(circle at 100% 0%, #3aaff5 0%, rgba(58, 175, 245, 0.55) 36%, transparent 65%),
		radial-gradient(circle at 50% 45%, rgba(245, 248, 255, 0.9) 0%, rgba(245, 248, 255, 0.25) 42%, transparent 72%),
		linear-gradient(180deg, #b9e9f3 0%, rgba(234, 246, 248, 0.8) 55%, rgba(244, 245, 251, 0) 100%);
	z-index: 1;
}

.task-page {
	display: flex;
	flex-direction: column;
	width: 100%;
	background-color: #f2f5ff;

	.task_top_card {
		box-sizing: border-box;
		position: relative;
		z-index: 1;
		width: 100%;
		padding: 14rpx;

		.text_box {
			position: relative;
			z-index: 2;
			// 右侧给装饰图 tag_img 让位：图宽 338rpx、right:-24rpx，左缘落在 422rpx，
			// 这里把文案限制在 736-320=416rpx 以内，长文案（fr/ru/tv）换行避让，
			// 而不是压到图上或被图遮住
			// padding-right: 320rpx;
			font-size: 64rpx;
			font-weight: bold;
			line-height: 72rpx;
			word-break: break-all;
			// max-width: 450rpx;
			z-index: 3;

			.small {
				font-size: 26rpx;
				line-height: 32rpx;
				font-weight: 500;
				color: #3D3D3D;
				margin-top: 24rpx;
			}
		}

		.data_box {
			margin-top: 60rpx;
			box-sizing: border-box;
			position: relative;
			padding: 24rpx;
			background: #fff;
			border-radius: 12rpx;
			z-index: 2;

			.tag_img {
				position: absolute;
				top: -152rpx;
				right: -24rpx;
				width: 218rpx;
				height: 202rpx;
			}

			.data_row {
				display: flex;
				align-items: end;
				justify-content: space-between;
			}

			.DAILY {
				font-family: Noto Sans SC;
				font-size: 26rpx;
				font-weight: bold;
				line-height: 34rpx;
				color: #fff;
				padding: 4rpx 26rpx;
				border-radius: 2026rpx;
				background: #000000;
			}

			.dataItem {
				display: flex;
				flex-direction: column;
				align-items: start;
				gap: 12rpx;

				&.progress_box {
					width: 100%;
					margin-top: 20rpx;

					.progress_text {
						display: flex;
						width: 100%;
						justify-content: space-between;

						.tag {
							font-size: 22rpx;
							color: #3D3D3D;
							line-height: 22rpx;
							text-align: left;
							font-style: normal;
						}

						.num {
							font-size: 26rpx;
							color: #9E9E9E;
							line-height: 22rpx;
							text-align: right;
							font-style: normal;
							margin-bottom: 4rpx;
						}
					}
				}

				.income {
					font-family: Dela Gothic One;
					font-size: 72rpx;
					line-height: 50rpx;
					text-align: justify;
					font-style: normal;

					span {
						font-family: Source Han Sans;
						font-size: 34rpx;
					}
				}



				.num {
					font-family: PingFangSC, PingFang SC;
					font-weight: 500;
					font-size: 28rpx;
					color: #000000;
					line-height: 40rpx;
					text-align: justify;
					font-style: normal;
				}

				.tag {
					font-family: Noto Sans SC;
					font-size: 26rpx;
					color: #9E9E9E;
					line-height: 28rpx;
					font-style: normal;
				}
			}
		}

	}

	.custom-waterfalls {
		position: relative;
		z-index: 2;
		// flex: 1; // 让瀑布流容器占满剩余空间
		width: 100%;
	}
}

.prompt_pop_page {
	width: 570rpx;
	background: #FFFFFF;
	border-radius: 28rpx;
	padding: 40rpx 54rpx 28rpx 54rpx;

	.prompt_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.prompt_pop_taps {
		font-family: "DINPro-Regular", sans-serif;
		font-weight: 400;
		font-size: 28rpx;
		color: #1C2D57;
		line-height: 36rpx;
		text-align: center;
		font-style: normal;
		margin-top: 40rpx;
	}

	.prompt_pop_bottom {
		display: flex;
		margin-top: 54rpx;
	}

	.prompt_cancel_btn {
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

	.prompt_confirm_btn {
		width: 212rpx;
		height: 72rpx;
		background: $themeColor;
		border-radius: 12rpx;
		font-family: "DINPro-Black", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #FFFFFF;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}
}
</style>
