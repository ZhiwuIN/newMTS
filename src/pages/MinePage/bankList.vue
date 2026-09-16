<template>
	<customnavbar :title="$t('钱包列表')" @mtop="mtop">
		<view :style="topStyle" class="box">
			<hao-indexList :letters="letters" idValue="bankCode" nameValue="bankName" :cityList="cityList"
				:isCurrentCity="false" :isHotCity="false" :isTop="true" :isSearch="true" :e="e" @haoTap="haoTap">
			</hao-indexList>
		</view>
	</customnavbar>
</template>

<script>
	import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
	import {
		withdrawalbankSysListApi
	} from "@/common/api/withdrawal.js";
	export default {
		components: {
			customnavbar
		},
		data() {
			return {
				letters: [],
				cityList: {},
				e: ''
			}
		},
		onShow() {
			this.getBankList()
		},
		methods: {
			getBankList() {
				withdrawalbankSysListApi().then((res) => {
					this.cityList = res.data
					this.letters = Object.keys(this.cityList)
				}).catch((err) => {
					console.log('request fail', err);
					this.$showMessage('warning', err.msg);
				})
			},
			haoTap(e) {
				uni.setStorageSync('bankInfo', JSON.stringify(e))
				uni.navigateBack()
			},
			mtop(e) {
				this.e = e
			},
		}
	}
</script>

<style>

</style>