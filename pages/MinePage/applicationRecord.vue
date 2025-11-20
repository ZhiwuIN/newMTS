<template>
	<view>
		<customnavbar :title="$t('mine.ApplicationRecord')">
			<view class="record-container">
				<view class="item-box">
					<view class="record-item" v-for="(item, index) in data" @click="toInfo(item.id)">
						<view class="left-box">
							<!-- <image src="/static/mine/applicationRecord/Under review.png" class="record-img"
								v-if="item.status == 2"></image>
							<image src="/static/mine/applicationRecord/In progress.png" class="record-img"
								v-if="item.status == 4"></image>
							<image src="/static/mine/applicationRecord/Success.png" class="record-img"
								v-if="item.status == 6"></image>
							<image src="/static/mine/applicationRecord/Failure.png" class="record-img"
								v-if="item.status == 3 || item.status == 5"></image> -->
							<view class="record-text-box">
								<view style="display: flex;align-items: center;gap: 20rpx;">
									<view class="record-status" style="background-color: #FF9B00;"
										v-if="item.status == 2">
										<!-- 待审核 -->
										{{ $t('positionManage.underReview') }}
									</view>
									<view class="record-status" style="background-color: #48BBFF;"
										v-if="item.status == 4">
										<!-- 进行中 -->
										{{ $t('positionManage.InProgress') }}
									</view>
									<view class="record-status" style="background-color: #FF0000;"
										v-if="item.status == 5">
										<!-- 未达成 -->
										{{ $t('positionManage.notReach') }}
									</view>
									<view class="record-status" style="background-color: #FF0000;"
										v-if="item.status == 3">
										<!-- 审核未通过 -->
										{{ $t('positionManage.Failed') }}
									</view>
									<view class="record-status" style="background-color: #4AD92F;"
										v-if="item.status == 6">
										<!-- 已达成 -->
										{{ $t('positionManage.Agreed') }}
									</view>
									<view class="record-name">
										{{ item.positionName }}
									</view>
								</view>

								<view class="record-status record-status1"
									style="background-color: #ffed87;color: #FF9B00;" v-if="item.status == 2">
									<!-- 待审核 -->
									{{ $t('您的申请等待审核') }}
								</view>
								<view class="record-status record-status1"
									style="background-color: #c1f4ff;color: #48bbff;" v-if="item.status == 4">
									<!-- 进行中 -->
									{{ $t('您的职位正在进行中') }}
								</view>
								<view class="record-status record-status1"
									style="background-color: #FFE8E8;color: #FF0000;" v-if="item.status == 5">
									<!-- 未达成 -->
									{{ $t('您的职位任务未达成') }}
								</view>
								<view class="record-status record-status1"
									style="background-color: #FFE8E8;color: #FF0000;" v-if="item.status == 3">
									<!-- 审核未通过 -->
									{{ $t('您的申请未通过') }}
								</view>
								<view class="record-status record-status1"
									style="background-color: #EAFCEE;color: #27CF4C;" v-if="item.status == 6">
									<!-- 已达成 -->
									{{ $t('您的职位已达成') }}
								</view>


								<view style="display: flex;align-items: center;justify-content: space-between;">
									<view class="record-time">
										{{ $t("申请时间") }}
									</view>
									<view class="record-time">
										{{ item.applyTime }}
									</view>
								</view>
								<view style="display: flex;align-items: center;justify-content: space-between;">
									<view class="record-time">
										{{ $t("审核时间") }}
									</view>
									<view class="record-time">
										{{ item.applyTime }}
									</view>
								</view>
							</view>
						</view>
						<!-- <image class="rigth-ionc" src="/static/back_icon.png" mode=""></image> -->
					</view>
				</view>
				<listbottom :hasMore="hasMore" :loading="loading" :noData='nodata'
					image="/static/default/No content.png"></listbottom>
			</view>
		</customnavbar>
	</view>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import listbottom from '../../component/list-bottom/list_bottom.vue'
import {
	positionMyPositionListApi
} from '@/common/api/position.js'
export default {
	components: {
		customnavbar,
		listbottom
	},
	data() {
		return {
			page: {
				pageNum: 1,
				pageSize: 10
			},
			data: [],
			nodata: false,
			hasMore: true,
			loading: false
		}
	},
	methods: {
		getPositionMyPositionListApi() {
			this.loading = true
			positionMyPositionListApi().then(res => {
				if (res.code == 200) {
					this.loading = false
					if (this.page.pageNum == 1) this.data = res.rows || []
					else this.data.concat(res.rows)
					this.nodata = res.total == 0
					this.hasMore = this.data.length != res.total
				} else {
					this.$showMessage('error', res.msg || 'error')
					// uni.showToast({
					// 	title: res.msg || 'error',
					// 	icon: 'none'
					// });
				}
			}).catch(err => {
				console.error(err);
			});
		},
		toInfo(id) {
			return
			uni.navigateTo({
				url: '/pages/MinePage/applicationRecordInfo?id=' + id
			})
		}
	},
	onShow() {
		this.getPositionMyPositionListApi();
	}
}
</script>

<style scoped lang="scss">
.item-box {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
	padding: 40rpx;

	.record-item {
		// display: flex;
		// align-items: center;
		// justify-content: space-between;
		background: #FFFFFF;
		box-shadow: 0rpx 22rpx 28rpx -6rpx #E9F3FF;
		border-radius: 24rpx;
		border: 2rpx solid #F6F6F6;
		padding: 26rpx 40rpx 24rpx;

		.left-box {
			display: flex;
			align-items: center;
			gap: 30rpx;

			.record-text-box {
				display: flex;
				flex-direction: column;
				width: 100%;
				// align-items: start;
				gap: 10rpx;

				.record-name {
					font-family: DINPro, DINPro;
					font-weight: 500;
					font-size: 32rpx;
					color: #000000;
					text-align: center;
					font-style: normal;
				}

				.record-time {
					font-family: DINPro, DINPro;
					font-weight: 400;
					font-size: 24rpx;
					color: #000000;
					text-align: center;
					font-style: normal;
				}

				.record-status {
					font-family: PingFangSC, PingFang SC;
					font-weight: 400;
					font-size: 18rpx;
					color: #FFFFFF;
					text-align: center;
					font-style: normal;
					padding: 6rpx 14rpx;
					border-radius: 8rpx;

					&.record-status1 {
						font-size: 24rpx;
						text-align: left;
					}
				}
			}

			.record-img {
				width: 96rpx;
				height: 96rpx;
			}
		}



		.rigth-ionc {
			width: 32rpx;
			height: 32rpx;
			transform: rotate(180deg);
		}
	}
}
</style>