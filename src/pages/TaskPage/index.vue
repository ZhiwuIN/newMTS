<template>
	<customnavbar :title="$t('pages.task')" backgroundStr="url('/static/task/taskBgi.png') top left/100% no-repeat"
		:showBack="false" :whiteTitle="true" @mtop="mtop">
		<view class="task-page" :style="topStyle2">
			<view class="task_top_card" :style="topStyle">
				<!-- 顶部数据卡片 -->
				<view class="data_box">
					<view class="data_row">
						<view class="dataItem">
							<view class="tag">{{ $t('今日任务收益') }}</view>
							<view class="income">{{ taskInfo.todayTaskCommission || 0 }} {{ currency }}</view>
						</view>
						<view class="dataItem progress_box">
							<view class="progress_text">
								<view class="tag">{{ $t('今日剩余次数') }}</view>
								<view class="num">{{ taskInfo.totalTaskNum - taskInfo.tasksCompletedToday || 0 }}/{{
									taskInfo.totalTaskNum || 0 }}</view>
							</view>
							<t-progress :color="'#ffaf37'" style="width: 100%;transform: rotate(180deg);" :label="false"
								:percentage="(taskInfo.totalTaskNum - taskInfo.tasksCompletedToday) / taskInfo.totalTaskNum * 100" />
						</view>
					</view>

					<view class="data_row">
						<view class="dataItem">
							<view class="tag">{{ $t('今日总完成次数') }}</view>
							<view class="num">{{ taskInfo.totalTaskNum || 0 }}</view>
						</view>
						<view class="dataItem">
							<view class="tag">{{ $t('今日完成次数') }}</view>
							<view class="num">{{ taskInfo.tasksCompletedToday || 0 }}</view>
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
				<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
				<view class="prompt_pop_taps">{{$t('请先实名')}}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_cancel_btn" @click="prompt_cancel">{{$t('pay.no')}}</button>
					<button class="prompt_confirm_btn" @click="prompt_confirm">{{$t('pay.yes')}}</button>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="promptpopup2" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
				<view class="prompt_pop_taps">{{ dialog_yes_message }}</view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm_yes">{{$t('pay.yes')}}</button>
				</view>
			</view>
		</uni-popup>
		<!-- 富文本提示 -->
		<uni-popup ref="promptpopup3" type="center" :mask-click="false">
			<view class="prompt_pop_page">
				<view class="prompt_pop_top">{{$t('home.Prompt')}}</view>
				<view class="prompt_pop_taps" v-html="failTips"></view>
				<view class="prompt_pop_bottom">
					<button class="prompt_confirm_btn" @click="prompt_confirm_yes2">{{$t('pay.yes')}}</button>
				</view>
			</view>
		</uni-popup>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import listbottom from '../../component/list-bottom/list_bottom.vue'
	import {
		taskListApi,
		taskInfoApi
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
			customnavbar,
			listbottom
		},
		data() {
			return {
				failTips: '',
				dialog_yes_message: '',
				scrollTop: 0,
				needRestoreScroll: false,
				topStyle: 0,
				topStyle2: '',
				scrollViewStyle: '',
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
				taskCardHeight: 298, // 顶部卡片固定高度（rpx）
				errorCode: 0
			};
		},
		onLoad() {
			this.scrollTop = uni.getStorageSync('taskListScrollTop') || 0;
			this.currency = uni.getStorageSync('settings').currency;
			this.getTaskList().then(() => {
				this.$nextTick(() => {
					this.needRestoreScroll = true;
				});
			});
			this.isShow = true;
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
			this.getUserInfo();
			if(this.$refs.promptpopup2){
				this.$refs.promptpopup2.close()
			}
			const completedId = uni.getStorageSync('isTodayCompletedId');
			if (this.taskList.length && completedId) {
				this.preLoadScrollTop = this.scrollTop;
				this.taskList = this.taskList.filter(item => item.taskId != completedId);
				if (this.taskList.length < 10) {
					this.onReachBottom()
				}
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
				this.scrollTop = e.scrollTop;
			},
			onRefresh() {
				this.isRefreshing = true;
				this.page.pageNum = 1;
				taskListApi(this.page).then((res) => {
					this.taskList = res.rows || [];
					this.taskList = [...new Map(this.taskList.map(item => [item.taskId, item])).values()];
					this.taskList = this.taskList.filter(item => item.isTodayCompleted !== 1);
					if (!this.taskList.length && res.rows.length) {
						this.onReachBottom()
					}
					if (this.taskList.length < 10 && res.rows.length) {
						this.onReachBottom()
					}
					this.levelCode = this.taskInfo.levelCode;
					this.nodata = res.total === 0;
					this.hasMore = this.taskList.length !== res.total;
					this.scrollTop = 0;
					this.isRefreshing = false;
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			mtop(e) {
				// 计算可用高度 = 屏幕高度 - 导航栏高度 - 顶部卡片高度
				const navHeight = e; // 导航栏高度（从组件获取）

				// #ifdef H5
				// H5端：额外减去底部可能的留白
				this.topStyle = `margin-top:-${navHeight}rpx;padding-top:${navHeight + 114}rpx`;
				this.topStyle2 = `height:calc(100vh - ${navHeight}rpx - 200rpx);`;
				// 固定scroll-view高度：屏幕高度 - 导航栏高度 - 顶部卡片高度 - 额外留白
				this.scrollViewStyle = `height: calc(100vh - ${navHeight}rpx - ${this.taskCardHeight}rpx - 300rpx);`;
				// #endif

				// #ifdef APP-PLUS
				// APP端：更紧凑的计算
				this.topStyle = `margin-top:-${navHeight}rpx;padding-top:${navHeight + 68}rpx`;
				this.topStyle2 = `height:calc(100vh - ${navHeight}rpx);`;
				// 固定scroll-view高度：屏幕高度 - 导航栏高度 - 顶部卡片高度
				this.scrollViewStyle = `height: calc(100vh - ${navHeight}rpx - ${this.taskCardHeight}rpx - 128rpx);`;
				// #endif
			},
			getUserInfo() {
				userInfoApi().then((res) => {
					this.userInfo = res.data;
					if (this.userInfo.hasMessage) {
						uni.showTabBarRedDot({
							index: 2
						});
					} else {
						uni.hideTabBarRedDot({
							index: 2
						});
					}
					uni.setStorageSync('userInfo', res.data);
					this.getTaskInfo();
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				});
			},
			getTaskInfo() {
				this.errorCode = 0
				taskInfoApi().then((res) => {
					this.taskInfo = res.data;
					uni.setStorageSync('levelCode', res.data.levelCode);
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

				return taskListApi(this.page).then((res) => {
					this.loading = false;
					if (this.page.pageNum == 1) {
						this.taskList = res.rows || [];
					} else {
						this.taskList = [...this.taskList, ...(res.rows || [])];
					}
					this.taskList = [...new Map(this.taskList.map(item => [item.taskId, item])).values()];
					this.taskList = this.taskList.filter(item => item.isTodayCompleted !== 1);
					if (!this.taskList.length && res.rows.length) {
						this.onReachBottom()
					}
					if (this.taskList.length < 10 && res.rows.length) {
						this.onReachBottom()
					}
					this.levelCode = this.taskInfo.levelCode;
					this.nodata = res.total === 0;
					this.hasMore = this.taskList.length !== res.total;
					if (this.page.pageNum > 1) {
						this.scrollTop = this.preLoadScrollTop;
					}
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
	.task-page {
		display: flex;
		flex-direction: column;
		width: 100%;

		.task_top_card {
			position: relative;
			width: 100%;
			background: url('/static/task/taskBgi.png') top left/100% no-repeat;
			height: 356rpx; // 使用数据中的高度值
			// padding-bottom: 24rpx;
			margin-bottom: -110rpx;

			.data_box {
				box-sizing: border-box;
				position: absolute;
				left: 50%;
				transform: translate(-50%, 0%);
				padding: 40rpx 30rpx 38rpx;
				background: #f6f9fe;
				box-shadow: inset 0rpx 2rpx 4rpx 0rpx rgba(255, 255, 255, 0.5);
				border-radius: 20rpx;
				width: 690rpx;
				z-index: 2;

				.data_row {
					display: flex;
					gap: 30rpx;

					&:nth-child(2) .dataItem {
						margin-bottom: 0;
					}
				}

				.dataItem {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: start;
					gap: 10rpx;
					margin-bottom: 30rpx;

					&.progress_box {
						// background: linear-gradient(180deg, #FFD75F 0%, #FFAE31 100%);
						background-color: #2775d7;
						border-radius: 12rpx;
						padding: 18rpx 14rpx;

						.progress_text {
							display: flex;
							width: 100%;
							justify-content: space-between;
							margin-bottom: 22rpx;

							.tag {
								font-family: PingFangSC, PingFang SC;
								font-weight: 400;
								font-size: 16rpx;
								color: #fff;
								line-height: 22rpx;
								text-align: left;
								font-style: normal;
							}

							.num {
								font-family: PingFangSC, PingFang SC;
								font-weight: 400;
								font-size: 16rpx;
								color: #fff;
								line-height: 22rpx;
								text-align: right;
								font-style: normal;
							}
						}
					}

					.income {
						font-family: PingFangSC, PingFang SC;
						font-weight: 500;
						font-size: 36rpx;
						color: #FFAE31;
						line-height: 50rpx;
						text-align: justify;
						font-style: normal;
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
						font-family: PingFangSC, PingFang SC;
						font-weight: 400;
						font-size: 20rpx;
						color: #666666;
						line-height: 28rpx;
						font-style: normal;
					}
				}
			}

		}

		.custom-waterfalls {
			// flex: 1; // 让瀑布流容器占满剩余空间
			width: 100%;
			// #ifdef H5
			transform: translateY(9%);
			// #endif
			// #ifdef APP-PLUS
			transform: translateY(18%);
			// #endif
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
	}
</style>