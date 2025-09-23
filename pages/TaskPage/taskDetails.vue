<template>
	<customnavbar :title="$t('pages.taskDetails')">
		<view class="task-detail">
			<!-- 图片轮播 -->
			<view class="swiperImgBox">
				<!-- :style="{ height: currentSwiperHeight }" -->
				<swiper :autoplay="true" :style="{ height: '480rpx' }" @change="handleChange">
					<swiper-item v-for="(item, index) in taskDetails.images" :key="item"
						style="display: flex;justify-content: center;">
						<image :src="item" class="swiper_img" mode="heightFix"></image>
					</swiper-item>
				</swiper>
				<view class="dots_box">
					<view v-for="i in taskDetails.images?.length" :key="i">
						<view :class="currentSwiperi == (i - 1) ? 'dots_a' : 'dots'"></view>
					</view>
				</view>
			</view>
			<view class="main">
				<!-- 操作按钮区域 -->
				<view class="row_box">
					<view class="databox">
						<view class="dataItem">
							<view class="num">{{ taskDetails.followCount || 0 }}</view>
							<view class="tag">{{ $t('follow') }}</view>
						</view>
						<view class="dataItem">
							<view class="num">{{ taskDetails.likeCount || 0 }}</view>
							<view class="tag">{{ $t('like') }}</view>
						</view>
						<view class="dataItem">
							<view class="num">{{ taskDetails.completeCount || 0 }}</view>
							<view class="tag">{{ $t('complete') }}</view>
						</view>
					</view>
					<view class="btnBox">
						<view class="followBox" @click="onTaskActionApi('follow')" v-if="!taskDetails.isFollow">+
							{{ $t('follow') }}
						</view>
						<view class="followBox" @click="onTaskActionApi('unfollow')" v-else>✔ {{ $t('hasFollow') }}
						</view>
						<view class="likeBox" @click="onTaskActionApi('like')" v-if="!taskDetails.isLike">
							<image class="likeImg" src="/static/task/like.png" mode=""></image>
						</view>
						<view class="likeBox" @click="onTaskActionApi('unlike')" v-else>
							<image class="likeImg" src="/static/task/like_a.png" mode=""></image>
						</view>
					</view>
				</view>
				<!-- 任务佣金 -->
				<view class="Rewardprice">
					<view class="tag">{{ $t('benefits.Rewardprice') }}</view>
					<view class="num">{{ taskDetails.rewardPrice || 0 }}{{ currency }}</view>
				</view>
				<!-- 任务介绍 -->
				<view class="introductionBox">
					<view class="tag">{{ $t('Product.Introduction') }}</view>
					<view class="content">{{ taskDetails.content }}</view>
				</view>
			</view>

			<!-- 开始答题按钮 -->
			<view class="start-btn-box" v-if="taskDetails.isTodayCompleted == 0">
				<view class="start-btn" @click="startQuiz">
					{{ $t('task.StartAnswering') }}
				</view>
			</view>

			<uni-popup ref="answerpopup" type="center">
				<view class="answer_pop_page">
					<view class="answer_pop_top">{{ $t('task.AnswerTheQuestions') }}</view>
					<view class="answer_pop_ask">{{ taskDetails.question }}</view>
					<view v-for="(item, index) in answeritems" :key="item.value">
						<view class="answer_item" :class="(index + 1 == answeritems.length - 1) ? '' : 'item_border'"
							@click="answerCheck(index + 1)" v-if="item.answer">
							<view class="answer_item_title">{{ item.answer }}</view>
							<view :class="index + 1 === answerCurrent ? 'answer_check_box_checked' : ''"
								class="answer_check_box" />
						</view>
					</view>

					<button class="answer_confirm_btn" @click="answer_confirm">{{ $t('task.Submit') }}</button>
				</view>
			</uni-popup>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	taskDetailsApi,
	questionApi,
	taskActionApi,
	taskInfoApi
} from '@/common/api/task.js'
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			currentSwiperi: 0, // 轮播指示
			taskId: 0,
			taskDetails: {},
			currency: '',
			answerCurrent: -1,
			answeritems: [],
			imageHeights: [], // 存储每张图片的高度（rpx）
			currentSwiperHeight: '420rpx', // 当前轮播图高度
			isloading: false,
			taskInfo: {}
		}
	},
	onLoad(options) {
		if (uni.getStorageSync('userInfo').levelCode == '0' && this.isOverFourDays(uni.getStorageSync('userInfo')
			.registerTime)) {
			this.$showMessage('warning', this.$t('实习期结束'));
			uni.switchTab({
				url: '/pages/TaskPage/index'
			})
			return
		}
		this.getTaskInfo()
		// 这里可以获取页面参数，初始化数据
		this.currency = uni.getStorageSync('settings').currency
		this.taskId = options.id
		this.getTaskDetails()
	},
	methods: {
		checkGhanaWeekend() {
			const now = new Date();
			const utcDay = now.getUTCDay();
			const ghanaDay = utcDay === 0 ? 7 : utcDay;
			return !this.taskInfo?.taskEnabledDaysList?.includes(ghanaDay);
		},
		getTaskInfo() {
			taskInfoApi().then((res) => {
				this.taskInfo = res.data
				if (res.data.tasksRemainingToday <= 0) {
					this.$showMessage('warning', this.$t('Todayopportunities'));
					uni.switchTab({
						url: '/pages/TaskPage/index'
					})
					return;
				}
				if (uni.getStorageSync('userInfo').levelCode != '0' && this.checkGhanaWeekend()) {
					this.$showMessage('warning', this.$t('不能进行任务'));
					uni.switchTab({
						url: '/pages/TaskPage/index'
					})
					return;
				}
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			});
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
		onTaskActionApi(action) {
			if (this.taskDetails.isTodayCompleted == 1) return
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			taskActionApi({
				taskId: +this.taskId,
				uid: uni.getStorageSync('userInfo').userId,
				action
			}).then(res => {
				this.$showMessage('success', res.msg);
				if (action == 'like' || action == 'unlike') {
					this.taskDetails.isLike = action == 'like' ? 1 : 0
					this.taskDetails.likeCount = action == 'like' ? this.taskDetails.likeCount + 1 : this
						.taskDetails.likeCount - 1
				} else {
					this.taskDetails.isFollow = action == 'follow' ? 1 : 0
					this.taskDetails.followCount = action == 'follow' ? this.taskDetails.followCount + 1 : this
						.taskDetails.followCount - 1
				}

			}).catch(err => {
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})
		},
		getTaskDetails() {
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			taskDetailsApi(this.taskId).then((res) => {
				this.taskDetails = res.data;
				// 不是属于该等级的任务
				if (this.taskDetails.taskLevel != uni.getStorageSync('userInfo').levelCode) {
					uni.switchTab({
						url: '/pages/TaskPage/index'
					})
					return;
				}
				const answers = ['answer1', 'answer2', 'answer3'];
				const apiPrefixes = ['A', 'B', 'C'];

				this.answeritems = answers.reduce((acc, key, index) => {
					if (res.data[key]) {
						acc.push({
							value: index,
							answer: `${apiPrefixes[index]}: ${res.data[key]}`
						});
					}
					return acc;
				}, []);

				// 计算图片高度
				// this.calcImageHeights();

				if (this.taskDetails.isTodayCompleted == 1) {
					this.$showMessage('warning', this.$t('已答题'));
				}
			}).catch((err) => {
				this.loading = false;
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})
		},
		// 计算图片高度
		calcImageHeights() {
			const {
				images
			} = this.taskDetails;
			if (!images || images.length === 0) return;

			this.imageHeights = []; // 清空之前的高度数据

			images.forEach((imgUrl, index) => {
				// 处理图片路径
				const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${this.url}${imgUrl}`;

				// 尝试使用Image对象加载图片获取信息
				try {
					// 创建图片对象
					const img = new Image();
					img.src = fullImgUrl;

					// 图片加载成功
					img.onload = () => {
						const aspectRatio = img.height / img.width;
						const height = aspectRatio * 750 + 'rpx';
						this.imageHeights[index] = height;

						if (index === 0) {
							this.currentSwiperHeight = height;
						}
					};

					// 图片加载失败
					img.onerror = () => {
						this.imageHeights[index] = '420rpx';
						if (index === 0) {
							this.currentSwiperHeight = '420rpx';
						}
					};
				} catch (e) {
					// 如果创建Image对象失败，回退到默认高度
					console.error('创建图片对象失败:', e);
					this.imageHeights[index] = '420rpx';
					if (index === 0) {
						this.currentSwiperHeight = '420rpx';
					}
				}
			});
		},
		// 点击答题按钮
		startQuiz() {
			if (!this.taskDetails.isLike || !this.taskDetails.isFollow) {
				this.$showMessage('warning', this.$t('video.Entirety'));
				return
			}
			// 跳转到答题页面
			this.$refs.answerpopup.open()
		},
		// 选择答案
		answerCheck(i) {
			this.answerCurrent = i
		},
		// 提交答案
		answer_confirm() {
			if (this.isloading) return
			this.isloading = true

			uni.showLoading({
				title: this.$t('loading.btn')
			});

			taskDetailsApi(this.taskId).then((res) => {
				this.taskDetails = res.data;
				// 不是属于该等级的任务
				if (this.taskDetails.taskLevel != uni.getStorageSync('userInfo').levelCode) {
					uni.switchTab({
						url: '/pages/TaskPage/index'
					})
					return;
				}
				// 已答题
				if (this.taskDetails.isTodayCompleted == 1) {
					this.$showMessage('warning', this.$t('已答题风险'));
					this.$refs.answerpopup.close()
					uni.hideLoading();
					return
				}

				if (this.answerCurrent == -1) {
					this.$showMessage('warning', this.$t('task.chooseAnswer'));
					this.isloading = false
					return
				}

				let params = {
					"rightAnswer": this.answerCurrent,
					"taskId": this.taskId
				}
				questionApi(params).then((res) => {
					this.$showMessage(res.isCorrect ? 'success' : 'warning', res.msg)
					if (res.isCorrect) {
						uni.setStorageSync('isTodayCompletedId', this.taskId)
						this.$customizeBack()
					}
				}).catch((err) => {
					this.loading = false
					this.$showMessage('warning', err.msg)
				}).finally(() => {
					this.$refs.answerpopup.close()
					uni.hideLoading();
					setTimeout(() => {
						this.isloading = false
					}, 1000)
				})
			}).catch((err) => {
				this.loading = false;
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				uni.hideLoading();
			})
		},
		// 轮播图切换
		handleChange(e) {
			const currentIndex = e.detail.current;
			this.currentSwiperi = currentIndex;
			// 更新轮播高度为当前图片的高度
			this.currentSwiperHeight = this.imageHeights[currentIndex] || '420rpx';
		},
	}
}
</script>

<style lang="scss" scoped>
.task-detail {
	height: 100%;

	.start-btn-box {
		position: fixed;
		bottom: 0;
		display: flex;
		align-items: center;
		height: 112rpx;
		background: #FFFFFF;
	}

	.start-btn {
		width: 650rpx;
		margin: 0 50rpx;
		height: 96rpx;
		background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
		border-radius: 24rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: 500;
		font-size: 36rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
	}

	.swiperImgBox {
		position: relative;

		.swiper_img {
			width: 100%;
			height: 480rpx;
		}

		.dots_box {
			position: absolute;
			left: 50%;
			bottom: 24rpx;
			transform: translateX(-50%);
			display: flex;
			justify-content: center;
			align-items: center;

			.dots {
				width: 16rpx;
				height: 16rpx;
				background: #C6D7FF;
				border-radius: 8rpx;
				margin: 0 8rpx;
			}

			.dots_a {
				width: 16rpx;
				height: 16rpx;
				background: $themeColor;
				border-radius: 8rpx;
				margin: 0 8rpx;
			}
		}
	}

	.main {
		padding: 0 40rpx;

		.row_box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 46rpx;
			padding: 40rpx 0;
			width: 100%;
			border-bottom: 2px solid #F4F4F4;

			.databox {
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex: 1;

				.dataItem {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 8rpx;
					font-family: DINPro, DINPro;
					font-weight: 400;
					color: #000000;

					.num {
						font-size: 28rpx;
					}

					.tag {
						font-size: 24rpx;
					}
				}
			}

			.btnBox {
				display: flex;
				align-items: center;
				gap: 34rpx;

				.followBox {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 30rpx;
					height: 70rpx;
					background: $themeColor;
					box-shadow: 0rpx 4rpx 8rpx 0rpx #B2C8FB;
					border-radius: 36rpx;
					color: #FFFFFF;
					font-weight: 400;
					font-size: 24rpx;
					white-space: nowrap;
				}

				.likeBox {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 70rpx;
					height: 70rpx;
					background: linear-gradient(45deg, #FFBD56 0%, #FFAB28 100%);
					box-shadow: 0rpx 4rpx 16rpx 0rpx #FFD89C;
					border-radius: 50%;

					.likeImg {
						width: 32rpx;
						height: 32rpx;
					}
				}
			}
		}

		.Rewardprice {
			display: flex;
			gap: 12rpx;
			padding: 40rpx 0;
			width: 100%;
			border-bottom: 2px solid #F4F4F4;
			font-family: "DINPro-Medium", sans-serif;
			font-weight: 500;
			font-size: 30rpx;

			.tag {
				color: #000000;
			}

			.num {

				color: #FF0000;
			}
		}

		.introductionBox {
			display: flex;
			flex-direction: column;
			gap: 30rpx;
			padding: 40rpx 0;
			padding-bottom: 124rpx;
			width: 100%;

			.tag {
				font-family: "DINPro-Medium", sans-serif;
				font-weight: 500;
				font-size: 30rpx;
				color: #000000;
			}

			.content {
				font-family: DINPro, DINPro;
				font-weight: 400;
				font-size: 26rpx;
				color: #1C2D57;
				line-height: 36rpx;
			}
		}
	}
}


.answer_pop_page {
	width: 574rpx;
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
}

.answer_pop_top {
	padding-bottom: 20rpx;
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #000000;
	line-height: 42rpx;
	text-align: center;
	font-style: normal;
	margin-bottom: 40rpx;
}

.answer_pop_ask {
	background: #F5F8FF;
	border-radius: 12rpx;
	padding: 30rpx;
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 26rpx;
	color: #000000;
	line-height: 34rpx;
	text-align: left;
	font-style: normal;
}

.answer_confirm_btn {
	height: 96rpx;
	background: linear-gradient(180deg, $gradualColor2 0%, $gradualColor1 100%);
	border-radius: 24rpx;
	margin-top: 20rpx;
	margin-bottom: 12rpx;
	font-family: "DINPro-Bold", sans-serif;
	font-weight: bold;
	font-size: 36rpx;
	color: #FFFFFF;
	line-height: 96rpx;
	text-align: center;
	font-style: normal;
	text-transform: none;
}

.answer_item {
	display: flex;
	justify-content: space-between;
	padding: 30rpx 0;
}

.item_border {
	border-bottom: 2rpx solid #F4F4F4;
}

.answer_pop_ask_tips {
	font-family: "DINPro-Medium", sans-serif;
	font-weight: 500;
	font-size: 26rpx;
	color: #000000;
	line-height: 34rpx;
	text-align: justify;
	font-style: normal;
	margin-top: 40rpx;
}

.answer_check_box {
	box-sizing: border-box;
	width: 32rpx;
	height: 32rpx;
	background: #E6E6E6;
	border-radius: 50%;
	border: 5rpx solid #E6E6E6;
}

.answer_check_box_checked {
	box-sizing: border-box;
	width: 32rpx;
	height: 32rpx;
	background: $themeColor;
	border-radius: 50%;
	border: 5rpx solid #E6E6E6;
}

.answer_item_title {
	font-family: "DINPro-Regular", sans-serif;
	font-weight: 400;
	font-size: 26rpx;
	color: #000000;
	line-height: 34rpx;
	text-align: justify;
	font-style: normal;
}
</style>