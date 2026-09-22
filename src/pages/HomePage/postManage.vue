<template>
	<customnavbar :title="$t('home.Postmanage')"
		backgroundStr="url('/static/task/background.png') top left/100%  no-repeat" @mtop='mtop'>
		<!-- :style="topStyle2" -->
		<view class="task-page">
			<!-- 顶部数据卡片 -->
			<view class="task_top_card" :style="topStyle">
				<view class="data_box">
					<image class="my_postmanage" :src="userInfo?.image" mode=""></image>
					<view class="top_tag">{{ $t('当前职位') }}:
						{{ userInfo?.positionName || '--' }}
					</view>
					<view class="top_box_info">
						<view>{{ $t('A级下属人数') }}: {{ userInfo?.lv1Count || 0 }}</view>
						<view>{{ $t('团队人数') }}: {{ userInfo?.totalCount || 0 }}</view>
					</view>
				</view>
			</view>



			<!-- 列表 -->
			<uni-collapse ref="collapse" v-model="value">
				<view v-for="(item, index) in postList">
					<uni-collapse-item title-border="none" :border="false" :show-arrow="false">
						<template v-slot:title>
							<view class="postmanage_data_box">
								<view class="postmanage_box">
									<view class="postmanage_img_box">
										<image class="postmanage_img" :src="item?.image" mode=""></image>
									</view>
									<view class="postmanage_name_box">
										<view class="postmanage_name">{{ item?.positionName }}</view>
										<view class="tag tag1" v-if="idx >= 0 && index === idx">{{ $t('当前职位') }}
										</view>
										<view class="tag tag1" v-else-if="idx >= 0 && index < idx">{{ $t('当前职位大于此职位') }}
										</view>
										<view class="tag tag1" v-else-if="item?.isItDone">{{ $t('已达成') }}
										</view>
										<view class="tag" v-else>{{ $t('未达成') }}
										</view>
									</view>

									<!-- 申请按钮 -->
									<view class="bottom_btn" v-if="item?.isItDone && index > idx"
										@click="toApply(item)">
										<view class="join_btn">{{ $t('post.apply') }}</view>
									</view>
								</view>
								<view class="main_box">
									<view class="title">
										{{ $t('职位要求') }}
										<view class="details_toggle">
											{{ $t('View Details') }}
											<uni-icons class="uniui-bottom" :class="{ expanded: value.includes(String(index)) }" type="bottom" size="14" color="#004f56" />
										</view>
									</view>
									<view class="condition_box" v-if="item?.applicationType == 'aLevel'">
										<view class="tag_box">
											<image class="icon" src="/static/positions/subordinate.png" mode=""></image>
											<view>{{ $t('A级下属人数') }}: {{ item?.numberAchievements }}</view>
										</view>
										<view class="progress_box">
											<t-progress :color="'#246bfe'" style="width: 506rpx;" :label="false"
												:percentage="item.completed / item.numberAchievements * 100" />
											<view>
												<text class="themeColor">{{ item?.completed }}</text>/{{
													item?.numberAchievements
													|| 0 }}
											</view>
										</view>
									</view>
									<view class="condition_box" v-else="item?.applicationType == 'team'">
										<view class="tag_box">
											<image class="icon" src="/static/positions/team.png" mode=""></image>
											<view>{{ $t('团队人数') }}: {{ item?.numberAchievements }}</view>
										</view>
										<view class="progress_box">
											<t-progress :color="'#246bfe'" style="width: 506rpx;" :label="false"
												:percentage="item?.completed / item?.numberAchievements * 100" />
											<view>
												<text class="themeColor">{{ item?.completed }}</text>/{{
													item?.numberAchievements
													|| 0 }}
											</view>
										</view>
									</view>
								</view>
							</view>
						</template>
						<view class="content">
							<view>
								<view class="info_box">
									<view class="title">
										{{ $t('post.jobBenefits') }}
									</view>
									<view>
										<view class="row">
											<view>
												{{ $t('基本工资') }}：
											</view>
											<view>
												{{ item?.salary || 0 }}
											</view>
										</view>
										<view class="row">
											<view>
												{{ $t('发薪方式') }}：
											</view>
											<view>
												{{ item?.payType }}
											</view>
										</view>
										<view class="row">
											<view>
												{{ $t('考核日') }}：
											</view>
											<view>
												{{ weekList[item?.assessmentDay] }}
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</uni-collapse-item>
				</view>
			</uni-collapse>
		</view>
	</customnavbar>
	<uni-popup ref="promptpopup" type="center" :mask-click="false">
		<view class="prompt_pop_page">
			<view class="prompt_pop_top">{{ $t('home.Prompt') }}</view>
			<view class="prompt_pop_taps">{{ pop_message }}</view>
			<view class="prompt_pop_bottom">
				<button class="prompt_confirm_btn" @click="prompt_confirm">{{ $t('pay.yes') }}</button>
			</view>
		</view>
	</uni-popup>
	<uni-popup ref="popup" type="center" border-radius="10px 10px 0 0">
		<view class="pop_page">
			<view class="pop_top">{{ $t('home.Prompt') }}</view>
			<view class="pop_content">{{ pop_message }}</view>
			<view class="pop_bottom">
				<view class="pop_bottom_btn" @click="confirm2">{{ $t('home.Postmanage') }}</view>
				<view class="pop_bottom_btn" @click="confirm">{{ $t('home.Sure') }}</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
	positionApi,
	positionApplyApi,
	subordinateInformationApi
} from "@/common/api/position.js";
export default {
	components: {
		customnavbar
	},
	data() {
		return {
			pageTitle: '',
			weekList: {
				1: 'Monday',
				2: 'Tuesday',
				3: 'Wednesday',
				4: 'Thursday',
				5: 'Friday',
				6: 'Saturday',
				7: 'Sunday'
			},
			value: ['0'],
			pop_message: "",
			postList: [],
			userInfo: {},
			topStyle: '',
			topStyle2: '',
			idx: -1,
		}
	},
	onLoad(options) {
		if (options.title) {
			this.pageTitle = options.title
		} else {
			this.pageTitle = uni.getStorageSync('pageTitle')
		}
	},
	onShow(options) {
		positionApi().then((res) => {
			this.postList = res.data
			subordinateInformationApi(uni.getStorageSync('userInfo').userId).then((res) => {
				this.userInfo = res.data
				this.idx = this.postList?.findIndex(item => item?.pId == this.userInfo?.position) ?? -1
				// if (res.data.housekeeper == 1) {
				// 	this.pop_message = this.$t("withdrawal.restrictedAccess")
				// 	this.$refs.promptpopup.open()
				// }
			}).catch((err) => {
				console.log('request fail', err);
				this.$showMessage('warning', err.msg);
				this.postList = res.data
			})
		}).catch((err) => {
			console.log('request fail', err);
			this.$showMessage('warning', err.msg);
		})
	},
	methods: {
		mtop(e) {
			// 计算可用高度 = 屏幕高度 - 导航栏高度 - 顶部卡片高度
			const navHeight = e; // 导航栏高度（从组件获取）

			// #ifdef H5
			// H5端：额外减去底部可能的留白
			this.topStyle = `margin-top:-${navHeight}rpx;padding-top:${navHeight + 44}rpx`;
			this.topStyle2 = `height:calc(100vh - ${navHeight}rpx - 200rpx);`;
			// #endif

			// #ifdef APP-PLUS
			// APP端：更紧凑的计算
			this.topStyle = `margin-top:-${navHeight}rpx;padding-top:${navHeight - 2}rpx`;
			this.topStyle2 = `height:calc(100vh - ${navHeight}rpx);`;
			// #endif
		},
		toApply(item) {

			// positionApplyApi(item.pId).then((res) => {
			uni.navigateTo({
				url: '/pages/HomePage/postAgreement?id=' + item.pId
			})
			// }).catch((err) => {
			// 	this.pop_message = err.msg
			// 	this.$refs.popup.open()
			// })
		},
		prompt_confirm() {
			this.$refs.promptpopup.close()
			this.pop_message = ""
			uni.navigateBack()
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
	},

}
</script>

<style scoped lang="scss">
::v-deep .uni-collapse {
	gap: 12rpx;
	background: #F9F9F9;

	.uni-collapse-item {
		background: #fff;
		padding-bottom: 24rpx;

		.uni-collapse-item__title {
			position: relative;
			flex-direction: column;
			align-items: end;
			padding-bottom: 0;
		}

	}
}

::v-deep .t-progress__bar {
	background-color: #fff;
	height: 12rpx;
}

::v-deep .t-progress__inner {
	background: repeating-linear-gradient(135deg, #246bfe 0, #246bfe 8rpx, #77bdff 8rpx, #77bdff 12rpx) !important;
}

.content {
	.info_box {
		box-sizing: border-box;
		// width: 100%;
		// background: rgba(255, 255, 255, 0.8);
		// border-top: 2rpx solid #F4F4F4;
		background-color: #eef5ff;
		margin: 24rpx;
		margin-top: 0;
		padding: 0 16rpx;
		padding-bottom: 24rpx;
		// padding-bottom: 80rpx;

		.title {
			font-family: PingFangSC, PingFang SC;
			font-weight: 600;
			font-size: 28rpx;
			color: #000000;
			text-align: center;
			font-style: normal;
			padding: 20rpx 0 14rpx;
			background-color: #eef5ff;
		}

		.row {
			display: flex;
			justify-content: space-between;
			overflow-wrap: break-word;
			padding: 30rpx;
			background: #eef5ff;

			.tag {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 26rpx;
				color: #666666;
				line-height: 36rpx;
				text-align: left;
				font-style: normal;
			}

			.value {
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 26rpx;
				color: #000000;
				line-height: 36rpx;
				text-align: left;
				font-style: normal;
			}

			&:nth-child(2n) {
				background: #fff;
			}
		}

	}

}

.postmanage_data_box {
	padding: 24rpx;
	padding-bottom: 0;

	.postmanage_box {
		position: relative;
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;

		.bottom_btn {
			position: absolute;
			top: 0;
			right: 0;
			padding: 8rpx 28rpx;
			border-radius: 8rpx;
			background: $themeColor;
			font-family: MiSans;
			font-size: 24rpx;
			font-weight: 500;
			color: #FFFFFF;
			text-align: center;
			font-style: normal;
			text-transform: none;
		}

		.postmanage_img_box {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 104rpx;
			height: 104rpx;
			border-radius: 12rpx;
			background: #EAEAEA;
		}

		.postmanage_img {
			width: 90rpx;
			height: 90rpx;
		}

		.postmanage_name_box {
			display: flex;
			flex-direction: column;
			align-items: start;

			.tag {
				background: #eef5ff;
				border-radius: 20rpx;
				padding: 6rpx 22rpx;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 20rpx;
				color: #999999;
				line-height: 28rpx;
				text-align: left;
				font-style: normal;
			}

			.postmanage_name {
				// margin-top: 16rpx;
				margin-bottom: 20rpx;
			}

			.tag1 {
				color: $themeColor;
			}
		}


	}

	.main_box {
		background: #eef5ff;
		border-radius: 10rpx 10rpx 0 0;
		padding: 20rpx 30rpx;

		.title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 24rpx;
			color: #333333;
			line-height: 34rpx;
			text-align: left;
			font-style: normal;

			.details_toggle {
				display: flex;
				align-items: center;
				gap: 10rpx;
				color: $themeColor;
			}

			.uniui-bottom {
				transition: transform 0.2s;
			}

			.uniui-bottom.expanded {
				transform: rotate(180deg);
			}
		}

		.condition_box {
			margin-top: 22rpx;

			.tag_box {
				display: flex;
				align-items: center;
				gap: 10rpx;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: #666666;
				line-height: 34rpx;
				text-align: left;
				font-style: normal;
				margin-bottom: 20rpx;

				.icon {
					width: 32rpx;
					height: 32rpx;
					border-radius: 4rpx;
				}
			}

			.progress_box {
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: #666666;
				text-align: left;
				font-style: normal;

				.themeColor {
					margin-left: 30rpx;
					color: $themeColor;
				}
			}
		}
	}
}

.task-page {
	display: flex;
	flex-direction: column;
	width: 100%;
	padding-bottom: 32rpx;

	.task_top_card {
		width: 100%;
		background: url('/static/task/background.png') top left/100% no-repeat;

		.data_box {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #fff;

			.my_postmanage {
				width: 180rpx;
				height: 180rpx;
			}

			.top_tag {
				margin: 20rpx 0;
				font-family: PingFangSC, PingFang SC;
				font-weight: 500;
				font-size: 28rpx;
				color: #000;
				line-height: 40rpx;
				text-align: center;
				font-style: normal;
				text-transform: none;
			}

			.top_box_info {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 54rpx;
				margin-bottom: 20rpx;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 24rpx;
				color: #000;
				line-height: 34rpx;
				text-align: center;
				font-style: normal;
				text-transform: none;
			}
		}
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

	.prompt_confirm_btn {
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
}

.pop_page {
	box-sizing: border-box;
	background-color: #fff;
	width: 600rpx;
	border-radius: 28rpx;
	padding: 40rpx 54rpx 28rpx 54rpx;

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
		// box-shadow: 0rpx 4rpx 16rpx 0rpx #B2C8FB;
		border-radius: 12rpx;
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
}
</style>
