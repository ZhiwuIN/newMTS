<template>
	<customnavbar :title="$t('scheduledWithdrawal')">
		<view class="common-page">
			<ei-calendar :disabledDate="disabledDate" v-model="date" :custom-date="customDate" format="YYYY-MM-DD"
				@change="onChange">
			</ei-calendar>
			<view>
				<view>
					<view>✔</view>
					<view>可预约</view>
				</view>
				<view>
					<view style="color: #3FCF05;">✔</view>
					<view>已预约</view>
				</view>
				<view>
					<view>❀</view>
					<view>可提现</view>
				</view>
			</view>
		</view>
	</customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import EiCalendar from '@/components/ei-calendar/ei-calendar';
export default {
	components: {
		customnavbar,
		EiCalendar
	},
	data() {
		return {
			show: false,
			date: '',
			customDate: [{
				cellClass: 'custom-cell',
				date: '2025-12-01',
				top: [{
					class: 'custom-cell-top-1',
					text: '✔'
				},
				]
			}]
		}
	},
	methods: {
		disabledDate(date) {
			// 禁用今天之前的日期
			const today = new Date();
			today.setHours(0, 0, 0, 0); // 将时间设置为当天凌晨

			const targetDate = new Date(date.format()); // 获取目标日期
			targetDate.setHours(0, 0, 0, 0);

			return targetDate < today;
		},
		onChange(e) {
			console.log(e);
		}
	},
	onLoad() {

	},
	onShow() {

	}
}
</script>

<style scoped lang="scss">
.common-page {
	// padding: 50rpx;
}
</style>