<template>
	<customnavbar :title="$t('pages.taskDetails')" backgroundStr="#f2f5ff">
		<uv-skeletons :loading="isLoading" :skeleton="skeleton">
			<view class="task-detail">
				<!-- 图片轮播 -->
				<view class="swiperImgBox">
					<swiper :autoplay="true" :style="{ height: '702rpx' }" @change="handleChange"
						:current="currentSwiperi">
						<swiper-item v-for="(item, index) in taskDetails.images" :key="item"
							style="display: flex;justify-content: center;">
							<view class="swiper_img_box">
								<image :src="item" class="swiper_img" mode="aspectFit"></image>
							</view>
						</swiper-item>
					</swiper>
					<view class="dots_box">
						<view v-for="(item, index) in taskDetails.images" :key="item + index"
							:class="currentSwiperi == index ? 'dots_a' : 'dots'" @click="currentSwiperi = index">
							<image :src="item" class="dots_img" mode="heightFix"></image>
						</view>
					</view>
				</view>

				<!-- 标题区域 -->
				<view class="title_box">
					<view class="two">
						{{ taskDetails.taskClass }}
					</view>
					<view class="one">
						<view class="Sold">{{ taskDetails.quantity }}+ {{ $t('views') }}</view>
						<view class="Sold">{{ $t('Sold') }} {{ taskDetails.quantity }}+</view>
					</view>
				</view>

				<!-- 抢购记录 -->
				<view class="purchaseRecord">
					<view class="tag">{{ $t('SoldOutCraze') }}</view>
					<swiper v-if="purchaseRecordList.length" circular :indicator-dots="false" :autoplay="true"
						:interval='1500' :duration="1500" easing-function="linear" :acceleration="true"
						:disable-touch="true" :vertical="true" class="listBox"
						:display-multiple-items="purchaseRecordList.length >= 2 ? 2 : purchaseRecordList.length"
						:style="{ maxHeight: purchaseRecordList.length === 1 ? '90rpx' : '182rpx' }">
						<swiper-item v-for="(item, index) in purchaseRecordList" :key="index.toFixed()" class="itemBox">
							<view class="left-box">
								<image :src="item?.image ? item?.image : '/static/default-avatar.png'" mode=""
									class="avatar"></image>
								<view class="username">{{ item?.username || '05849' }}+ "0000000000"</view>
								<view class="content">{{ $t('第几次') + item.purchaseCount + $t('购买') }}</view>
							</view>
							<view>{{ item.purchaseTime }}</view>
						</swiper-item>
					</swiper>
					<view class="purchaseRecord_ques">{{ $t('暂无记录') }}</view>
				</view>

				<!-- 任务详情 -->
				<view style="padding: 0 20rpx;">
					<rich-text :nodes="taskDetails.content" />
				</view>

				<!-- 开始答题按钮 -->
				<view class="start-btn-box" v-if="!showMask && taskDetails.isTodayCompleted != 1">
					<view class="revenue">
						<view class="title">{{ $t('任务收益') }}</view>
						<view class="number">{{ taskDetails.revenue }} <span>{{ currency }}</span></view>
					</view>
					<view class="start-btn" @click="ShopNow">
						{{ $t('ShopNow') }}
					</view>
				</view>

				<!-- 购买弹框 -->
				<uni-popup ref="paypopup" type="center" border-radius="10px 10px 0 0">
					<view class="pay_pop_page">
						<view class="pay_pop_top">{{ $t('收益') }}</view>
						<view class="pay_pop_no">{{ $t("请输入你的安全密码并完成订单") }}
						</view>
						<view class="pay_pop_content">{{ $t('pay.password') }}</view>
						<view class="password-box" @click="isFocus = true">
							<view class="input-box" v-for="(item, index) in 6" :key="index">
								<text v-if="password.length > index">●</text>
							</view>
						</view>
						<!-- 隐藏的输入框，用于调起键盘 -->
						<input type="number" :maxlength="6" v-model="password" class="hidden-input" :focus="isFocus"
							@blur="isFocus = false" />
						<button class="pay_confirm_btn" @click="payConfirm">{{ $t('home.Confirm') }}</button>
					</view>
				</uni-popup>




				<uni-popup ref="paypopup2" type="center">
					<view class="prompt_pop_page">
						<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
						<view class="prompt_pop_taps">{{ $t('先设置安全密码') }}</view>
						<view class="prompt_pop_bottom">
							<button class="prompt_cancel_btn" @click="prompt_cancel">{{ $t('pay.no') }}</button>
							<button class="prompt_confirm_btn" @click="prompt_confirm">{{ $t('pay.yes') }}</button>
						</view>
					</view>
				</uni-popup>

				<!-- 抢购成功 -->
				<uni-popup ref="paypopup3" type="center">
					<view class="prompt_pop_page">
						<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
						<view class="prompt_pop_taps">{{ prompt_pop_taps }}</view>
						<view class="prompt_pop_bottom">
							<button class="prompt_confirm_btn" @click="prompt_confirm2">{{ $t('pay.yes') }}</button>
						</view>
					</view>
				</uni-popup>

				<!-- 抢购进度条 -->
				<view class="mask" v-if="showMask"></view>
				<view class="poster-container" v-if="showMask">
					<view>{{ $t('ProcessingYourOrder') }}</view>
					<gradient-progress :progress="progress" :duration="duration + 's'" color1="#7ee1ff"
						color2="#397ed1"></gradient-progress>
				</view>

			</view>
		</uv-skeletons>

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
	</customnavbar>
</template>

<script>
import gradientProgress from '@/components/gradient-progress/gradient-progress.vue'
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	taskDetailsApi,
	getTheTaskQuotaOfTheDay,
	shopNowApi,
	paymentApi,
	purchaseRecordApi
} from '@/common/api/task'
import {
	userInfoApi
} from "@/common/api/users";
import {
	htmlToPlainText
} from "@/utils/utils.js";
export default {
	components: {
		customnavbar,
		gradientProgress
	},
	data() {
		return {
			failTips: '',
			// 骨架显示状态
			isLoading: true,
			skeleton: [{
				type: 'line',
				num: 8,
				gap: '20rpx',
				style: [
					'width: 500rpx;height: 500rpx;margin: 10rpx auto;',
					'height: 40rpx;width: 500rpx;margin: 20rpx 20rpx 10rpx;',
					'height: 30rpx;width: 250rpx;margin: 0 20rpx;',
					'height: 400rpx;width: 650rpx;margin: 20rpx 20rpx;',
					'height: 30rpx;width: 680rpx;margin: 10rpx 20rpx;',
					'height: 30rpx;width: 680rpx;margin: 10rpx 20rpx;',
					'height: 30rpx;width: 400rpx;margin: 10rpx 20rpx;',
					'height: 100rpx;width: 710rpx;margin: 40rpx 20rpx 0;'
				]
			}],
			prompt_pop_taps: '', // 成功提示
			showMask: false,
			currentSwiperi: 0, // 轮播指示
			taskId: 0,
			taskDetails: {},
			currency: '',
			answerCurrent: -1,
			answeritems: [],
			imageHeights: [],
			currentSwiperHeight: '420rpx', // 当前轮播图高度
			isloading: false,
			taskInfo: {},
			progress: 100,
			duration: 0,
			password: [],
			isFocus: false,
			loading: false,
			purchaseRecordList: []
		}
	},
	onLoad(options) {
		this.getTaskInfo()
		// if (uni.getStorageSync('userInfo').levelCode == '0' && this.isOverFourDays(uni.getStorageSync('userInfo')
		// 		.registerTime)) {
		// 	this.$showMessage('warning', this.$t('实习期结束'));
		// 	uni.switchTab({
		// 		url: '/pages/TaskPage/index'
		// 	})
		// 	return
		// }
		// 这里可以获取页面参数，初始化数据
		this.currency = uni.getStorageSync('settings').currency
		this.taskId = options.id
		this.getTaskDetails()
		this.getPurchaseRecordApi()
	},
	methods: {
		// 购买记录
		getPurchaseRecordApi() {
			purchaseRecordApi(this.taskId, {
				pageNum: 1,
				pageSize: 30
			}).then(res => {
				this.purchaseRecordList = res.data.rows
			})
		},
		// 点击购买按钮
		ShopNow() {
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			userInfoApi().then((res) => {
				uni.setStorageSync('userInfo', res.data)
				if (!uni.getStorageSync('userInfo').hasWithdrawalPassword) {
					this.$refs.paypopup2.open()
					return
				}
				if (this.taskInfo.todayRemainingMoney < this.taskDetails.price) {
					this.$showMessage('warning', this.$t('您的任务额度不足'));
					return
				}
				if (this.taskDetails.isTodayCompleted == 1) {
					this.$showMessage('warning', this.$t('已答题'));
					return
				}
				shopNowApi({
					taskId: this.taskId
				}).then(res => {
					if (res.code == 200) {
						this.$refs.paypopup?.open()
						this.password = []
					}
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
			}).finally(() => {
				uni.hideLoading();
			})
		},
		prompt_cancel() {
			this.$refs.paypopup2.close()
		},
		prompt_confirm() {
			this.$refs.paypopup2.close()
			uni.navigateTo({
				url: '/pages/MinePage/password?type=withdraw'
			})
		},
		prompt_confirm2() {
			this.$customizeBack()
		},
		// 确认购买
		payConfirm() {
			if (this.isloading) return
			this.isloading = true
			if (this.password == '' || this.password.length < 6) {
				this.$showMessage('warning', this.$t('password.placeholder3'));
				this.isloading = false
				return
			}
			this.$refs.paypopup.close()
			this.answer_confirm()
		},
		// 进度条开始
		getRandomDuration() {
			const min = 5;
			const max = 10;
			const randomSeconds = Math.random() * (max - min) + min;
			this.duration = randomSeconds.toFixed(1)
			this.showMask = true
			setTimeout(() => {
				// this.answer_confirm()
				this.$refs.paypopup3.open()
				this.isloading = false
				this.showMask = false
			}, this.duration * 1000)
		},
		checkNigeriaWeekend() {
			// console.log('123123')
			const now = new Date();

			// 尼日利亚时间比UTC快1小时，计算尼日利亚的当前小时
			// const nigeriaHour = now.getUTCHours() + 1;

			// 塞内加尔时间比UTC快0小时，计算塞内加尔的当前小时
			const nigeriaHour = now.getUTCHours();

			// 计算**的当前日期（考虑小时可能跨天）
			let nigeriaDay = now.getUTCDay();
			if (nigeriaHour >= 24) {
				nigeriaDay = (nigeriaDay + 1) % 7;
			}

			// 将周日从0转换为7（如果需要保持与原代码相同的数字表示）
			const nigeriaDayFormatted = nigeriaDay === 0 ? 7 : nigeriaDay;

			// 检查是否为周末
			// 这里保持与原代码相同的逻辑：检查是否不在启用的日期列表中
			// console.log(this.taskInfo.taskEnabledDaysList, '111111111111')
			return !this.taskInfo?.taskEnabledDaysList?.includes(nigeriaDayFormatted);
		},
		prompt_confirm_yes2() {
			this.$refs.promptpopup3.close()
			return
		},
		getTaskInfo() {
			getTheTaskQuotaOfTheDay().then((res) => {
				this.taskInfo = res.data;
				// console.log(this.taskInfo)
				// if (uni.getStorageSync('userInfo').levelCode != '0' && this.checkNigeriaWeekend()) {
				// 	this.$showMessage('warning', this.$t('不能进行任务'));
				// 	uni.switchTab({
				// 		url: '/pages/TaskPage/index'
				// 	})
				// 	return;
				// }
			}).catch((err) => {
				console.log('request fail', err);
				if (err.code == 800) {
					this.failTips = err.msg
					if (htmlToPlainText(err.msg)) {
						this.$refs.promptpopup3.open()
					}
				} else {
					this.$showMessage('warning', err.msg);
				}
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
		getTaskDetails() {
			// uni.showLoading({
			// 	title: this.$t('loading.btn')
			// });
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
				// uni.hideLoading();
				this.isLoading = false
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
		// 提交答案
		answer_confirm() {
			uni.showLoading({
				title: this.$t('loading.btn')
			});
			taskDetailsApi(this.taskId).then(async (res) => {
				this.taskDetails = res.data;
				await this.getTaskInfo()
				// 不是属于该等级的任务
				if (this.taskDetails.taskLevel != uni.getStorageSync('userInfo').levelCode) {
					this.showMask = false
					uni.switchTab({
						url: '/pages/TaskPage/index'
					})
					return;
				}
				if (this.taskInfo.todayRemainingMoney < this.taskDetails.price) {
					this.$showMessage('warning', this.$t('您的任务额度不足'));
					return
				}
				// 已答题
				if (this.taskDetails.isTodayCompleted == 1) {
					this.showMask = false
					this.$showMessage('warning', this.$t('已答题风险'));
					uni.hideLoading();
					return
				}
				let params = {
					"taskId": this.taskId
				}
				paymentApi(params).then((res) => {
					this.taskDetails.isTodayCompleted = 1
					this.prompt_pop_taps = res.msg
					uni.setStorageSync('isTodayCompletedId', this.taskId)
					this.getRandomDuration()
				}).catch((err) => {
					this.loading = false
					this.isloading = false
					this.$showMessage('warning', err.msg);
				}).finally(() => {
					// this.showMask = false
					uni.hideLoading();
					setTimeout(() => {
						// this.isloading = false
					}, 1000)
				})
			}).catch((err) => {
				this.loading = false;
				this.showMask = false
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				uni.hideLoading();
			})
		},
		// 轮播图切换
		handleChange(e) {
			this.currentSwiperi = e.detail.current
		},
	}
}
</script>

<style lang="scss" scoped>
.swiper_img_box {
	width: 702rpx !important;
	height: 702rpx !important;
	border-radius: 12rpx;
	background-color: #e6e9f0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
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
		// // box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 12rpx;
		font-family: "DINPro-Black", sans-serif;
		font-family: DINPro, DINPro;
		font-weight: 500;
		font-size: 32rpx;
		color: #fff;
		line-height: 72rpx;
		text-align: center;
		font-style: normal;
	}
}

.pay_pop_page {
	background: #FFFFFF;
	border-radius: 26rpx;
	width: 574rpx;
	padding: 40rpx;

	.pay_pop_top {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
	}

	.pay_pop_no {
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 32rpx;
		color: #000000;
		line-height: 42rpx;
		text-align: center;
		font-style: normal;
		margin: 48rpx 0;
	}

	.pay_pop_content {
		font-family: "DINPro-Medium", sans-serif;
		font-weight: 500;
		font-size: 24rpx;
		color: #000000;
		line-height: 30rpx;
		text-align: justify;
		font-style: normal;
		margin-top: 6rpx;
	}

	.password-box {
		display: flex;
		justify-content: space-between;
		margin-top: 22rpx;

		.input-box {
			width: 72rpx;
			height: 72rpx;
			border-radius: 8rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 40rpx;
			background-color: #ECECEC;
		}
	}

	.hidden-input {
		position: absolute;
		top: -999px;
		left: -999px;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.pay_confirm_btn {
		height: 96rpx;
		background: $themeColor;
		border-radius: 12rpx;
		margin-top: 34rpx;
		font-family: "DINPro-Bold", sans-serif;
		font-weight: bold;
		font-size: 36rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		text-align: center;
		font-style: normal;
		text-transform: none;
		margin-bottom: 14rpx;
	}

}

.mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100%;
	background: #000000;
	opacity: 0.7;
	z-index: 9999;
}

.poster-container {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10000;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 18rpx;
	font-family: PingFangSC, PingFang SC;
	font-weight: 500;
	font-size: 36rpx;
	color: #387cd2;
	text-align: center;
	font-style: normal;
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
	border-radius: 12rpx;
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
	// box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
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

.task-detail {
	min-height: 100vh;
	padding-bottom: 120rpx;
	background-color: #f2f5ff;
	padding-top: 4rpx;
	margin-top: -2rpx;

	.start-btn-box {
		box-sizing: border-box;
		position: fixed;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #FFFFFF;
		width: 100%;
		padding: 16rpx 24rpx 24rpx;

		.revenue {
			.title {
				font-size: 24rpx;
				color: #3D3D3D;
			}

			.number {
				font-family: Dela Gothic One;
				font-size: 32rpx;

				span {
					font-family: Source Han Sans;
					margin-left: 6rpx;
					font-size: 24rpx;
				}
			}
		}
	}

	.start-btn {
		padding: 14rpx 66rpx;
		font-size: 28rpx;
		font-weight: bold;
		background-color: $themeColor;
		color: #fff;
		border-radius: 10rpx;
	}

	.swiperImgBox {
		position: relative;

		.swiper_img {
			width: 100%;
			height: 702rpx;
		}

		.dots_box {
			box-sizing: border-box;
			width: 100%;
			// height: 164rpx;
			// background-color: rgba(255, 255, 255, 0.32);
			position: absolute;
			bottom: 0;
			display: flex;
			// justify-content: center;
			align-items: center;
			gap: 20rpx;
			padding-left: 48rpx;
			padding-bottom: 24rpx;

			.dots {
				// display: flex;
				// align-items: center;
				// justify-content: center;
				// box-sizing: border-box;
				// width: 132rpx;
				// height: 132rpx;
				// border-radius: 12rpx;
				// overflow: hidden;
				// border: 6rpx solid transparent;
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				width: 132rpx;
				height: 132rpx;
				border-radius: 12rpx;
				overflow: hidden;
				border: 6rpx solid #fff;
				background-color: #fff;
				// background-color: #fff;
			}

			.dots_img {
				// width: 100%;
				height: 100%;
			}

			.dots_a {
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				width: 132rpx;
				height: 132rpx;
				border-radius: 12rpx;
				overflow: hidden;
				border: 6rpx solid #fff;
				background-color: #fff;
			}
		}
	}

	.title_box {
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 24rpx;

		.one {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.Sold {
				font-family: MiSans;
				font-size: 24rpx;
				color: #8A8A8A;
			}
		}

		.two {
			font-family: MiSans;
			font-size: 40rpx;
			font-weight: 600;
			color: #3D3D3D;
			line-height: 44rpx;
			text-align: left;
			font-style: normal;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			line-clamp: 2;
			-webkit-line-clamp: 2;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	.purchaseRecord {
		margin: 0 24rpx;
		padding-bottom: 9rpx;
		border-bottom: 2rpx solid #D8D8D8;
		margin-bottom: 24rpx;

		.purchaseRecord_ques {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 24rpx;
			color: #8A8A8A;
		}

		.tag {
			font-family: MiSans;
			font-size: 24rpx;
			font-weight: bold;
			color: #000000;
		}

		.listBox {
			// display: flex;
			// flex-direction: column;
			// gap: 30rpx;
			margin-top: 9rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 26rpx;
			color: #333333;
			font-style: normal;

			.itemBox {
				display: flex;
				align-items: center;
				justify-content: space-between;
				max-height: 64rpx;
				padding: 15rpx 0;

				.left-box {
					display: flex;
					align-items: center;

					.username {
						width: 90rpx;
						margin-right: 32rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						line-clamp: 1;
						-webkit-line-clamp: 1;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.content {
						width: 280rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						line-clamp: 1;
						-webkit-line-clamp: 1;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.avatar {
						width: 64rpx;
						height: 64rpx;
						box-shadow: 0rpx 40rpx 80rpx 0rpx rgba(0, 0, 0, 0.04);
						border-radius: 48rpx;
						margin-right: 20rpx;
					}
				}

			}
		}
	}

}
</style>

<style>
img {
	width: 100%;
	max-width: 100%;
}
</style>