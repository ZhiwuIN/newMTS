<template>
	<view class="waterfalls-flow">
		<view class="waterfalls-flow-column" ref="column1">
			<view v-for="(item, index) in data1" :key="item?.taskId" class="waterfalls-item" @click="pushInfo(item)"
				@load="onImageLoaded(item)" :data-task-id="item.taskId">
				<view class="waterfalls-image_box">
					<image :lazy-load="true" :src="item?.image" mode="aspectFit" class="waterfalls-image"
						:data-task-id="item.taskId"></image>
				</view>
				<view class="item">
					<view class="one">
						<view class="tag">{{ item?.content }}</view>
					</view>
					<view class="two">
						<view>{{ $t('Sold') }} {{ item.quantity }}+</view>
					</view>
					<view class="bottom_box">
						<view class="one">
							<!-- <view class="tag2">{{ $t('Commission') }}:</view> -->
							<view class="num">{{ item?.revenue || 0 }} {{ currency }}</view>
						</view>
						<image style="width: 66rpx;min-width: 66rpx;height: 66rpx;" src="/static/task/add.png" mode="">
						</image>
					</view>
				</view>
			</view>
		</view>

		<view class="waterfalls-flow-column" ref="column2">
			<view v-for="(item, index) in data2" :key="item?.taskId" class="waterfalls-item" @click="pushInfo(item)"
				@load="onImageLoaded(item)" :data-task-id="item.taskId">
				<view class="waterfalls-image_box">
					<image :lazy-load="true" :src="item?.image" mode="aspectFit" class="waterfalls-image"
						:data-task-id="item.taskId"></image>
				</view>
				<view class="item">
					<view class="one">
						<view class="tag">{{ item?.content }}</view>
					</view>
					<view class="two">
						<view>{{ $t('Sold') }} {{ item.quantity }}+</view>
					</view>
					<view class="bottom_box">
						<view class="one">
							<!-- <view class="tag2">{{ $t('Commission') }}:</view> -->
							<view class="num">{{ item?.revenue || 0 }} {{ currency }}</view>
						</view>
						<image style="width: 66rpx;min-width: 66rpx;height: 66rpx;" src="/static/task/add.png" mode="">
						</image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		taskList: {
			type: Array,
			default: () => []
		},
		currency: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			data1: [],
			data2: [],
			itemHeights: {},
			columnHeights: [0, 0]
		};
	},
	watch: {
		taskList: {
			immediate: true,
			handler(newVal) {
				this.resetColumns();
				this.distributeItems(newVal);
			}
		}
	},
	methods: {
		pushInfo(item) {
			this.$emit('wapperClick', item)
		},
		refresh() {
			this.$nextTick(() => {
				if (!this.$refs.column1 || !this.$refs.column2) {
					return;
				}
				this.resetColumns();
				this.distributeItems(this.taskList);
			});
		},
		resetColumns() {
			this.data1 = [];
			this.data2 = [];
			this.itemHeights = {};
			this.columnHeights = [0, 0];
		},
		distributeItems(items) {
			if (!items || items.length === 0) return;

			items.forEach(item => {
				const itemHeight = this.estimateItemHeight(item);
				this.itemHeights[item.taskId] = itemHeight;
				if (this.columnHeights[0] <= this.columnHeights[1]) {
					this.data1.push(item);
					this.columnHeights[0] += itemHeight;
				} else {
					this.data2.push(item);
					this.columnHeights[1] += itemHeight;
				}
			});
		},
		estimateItemHeight(item) {
			let baseHeight = 140;
			if (item.image) {
				if (item.imageWidth && item.imageHeight) {
					const displayWidth = 320;
					return baseHeight + (displayWidth * item.imageHeight / item.imageWidth);
				} else {
					baseHeight += 200;
				}
			}

			if (item.content && item.content.length > 20) {
				baseHeight += 40;
			}

			return baseHeight;
		},
		onImageLoaded(item) {
			this.$nextTick(() => {
				const selector = `.waterfalls-item[data-task-id="${item.taskId}"]`;
				const query = uni.createSelectorQuery().in(this);
				query.select(selector).boundingClientRect(data => {
					if (!data) return;

					query.select(`.waterfalls-item[data-task-id="${item.taskId}"]`)
						.boundingClientRect(itemData => {
							if (!itemData) return;

							const actualHeight = itemData.height;
							const oldHeight = this.itemHeights[item.taskId] || 0;
							const heightDiff = actualHeight - oldHeight;
							this.itemHeights[item.taskId] = actualHeight;

							if (this.data1.some(i => i.taskId === item.taskId)) {
								this.columnHeights[0] += heightDiff;
							} else if (this.data2.some(i => i.taskId === item.taskId)) {
								this.columnHeights[1] += heightDiff;
							}
							if (Math.abs(heightDiff) > 50) {
								this.rebalanceColumnsIfNeeded();
							}
						}).exec();
				}).exec();
			});
		},
		rebalanceColumnsIfNeeded() {
			if (!this.$refs.column1 || !this.$refs.column2) return;

			const heightDiff = Math.abs(this.columnHeights[0] - this.columnHeights[1]);
			const totalHeight = this.columnHeights[0] + this.columnHeights[1];

			if (heightDiff / totalHeight > 0.2) {
				const allItems = [...this.data1, ...this.data2];
				this.resetColumns();
				this.distributeItems(allItems);
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.waterfalls-flow {
	display: flex;
	justify-content: space-between;
	padding: 24rpx 14rpx;
	padding-top: 0;
	// margin-top: 40rpx;
	gap: 14rpx;

	.waterfalls-flow-column {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		flex: 1;
		min-width: 0;
		// max-width: 48%;

		.waterfalls-item {
			width: 100%;
			min-width: 0;
			background: #FFFFFF;
			border-radius: 12rpx;
			overflow: hidden;

			.waterfalls-image_box {
				padding: 8rpx;
			}

			.waterfalls-image {
				width: 100%;
				height: 280rpx;
				display: block;
				background-color: #fff;
			}

			.item {
				display: flex;
				flex-direction: column;
				min-width: 0;
				gap: 4rpx;
				padding: 16rpx 16rpx 24rpx;

				.bottom_box {
					display: flex;
					min-width: 0;
					justify-content: space-between;
					align-items: end;
					margin-top: -24rpx;
				}

				.one {
					display: flex;
					min-width: 0;
					align-items: center;
					font-family: DINPro, DINPro;
					font-weight: 400;
					font-size: 28rpx;

					.tag {
						font-family: PingFangSC, PingFang SC;
						font-weight: 500;
						font-size: 28rpx;
						color: #000000;
						line-height: 40rpx;
						text-align: left;
						font-style: normal;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						overflow: hidden;
						text-overflow: ellipsis;
						flex: 1;
					}

					.tag2 {
						font-family: MiSans;
						font-size: 26rpx;
						font-weight: 600;
						color: #3D3D3D;
					}

					.num {
						font-family: MiSans;
						font-size: 26rpx;
						font-weight: 600;
						color: #3D3D3D;
						white-space: nowrap;
					}
				}

				.two {
					display: flex;
					align-items: center;
					justify-content: space-between;
					font-family: MiSans;
					font-size: 24rpx;
					color: #3D3D3D;
					line-height: 28rpx;
					text-align: left;
					font-style: normal;
					margin-top: 16rpx;
				}
			}
		}
	}
}
</style>
