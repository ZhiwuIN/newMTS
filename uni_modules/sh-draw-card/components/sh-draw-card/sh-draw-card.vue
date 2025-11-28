<template>
	<view class="draw-card">
		<template v-for="(i, index) in cardLength" :key="i.key">
			<view class="card-item" @click="_cardHandle(index)"
				:style="{...cardStyle[index], ...cardList[index]?.style}"
				:class="{opened: currentIndex.includes(index) || allOpen}">
				<view class="back">
					<image v-if="!$slots.back" :src="cardList[index]?.data?.backImg" mode="scaleToFill" />
					<view v-else style="width: 100%;height: 100%;">
						<slot name="back" :index="index" :data="cardList?.[index]?.data || {}"></slot>
					</view>
				</view>
				<view class="front">
					<image v-if="!$slots.front" :src="cardList[index]?.data?.frontImg" mode="scaleToFill" />
					<slot v-else name="front" :index="index" :data="cardList?.[index]?.data || {}"></slot>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	export default {
		slots: ['front', 'back'],
		props: {
			list: {
				type: Array,
				default: () => []
			},
			width: {
				type: Number,
				default: 100
			},
			height: {
				type: Number,
				default: 112
			},
			gap: {
				type: Number,
				default: 10
			},
			targetIndex: {
				type: Number,
				default: 0
			},
			col: {
				type: Number,
				default: 3
			},
			row: {
				type: Number,
				default: 2
			},
			maxOpenCount: {
				type: Number,
				default: 1
			},
			shuffle: {
				type: Boolean,
				default: true
			},
			endTurnAll: {
				type: Boolean,
				default: true
			},
			shuffleTurnAll: {
				type: Boolean,
				default: false
			},
			shuffleAnimate: {
				type: Boolean,
				default: false
			},
			collectTime: {
				type: Number,
				default: 0.3
			},
			turnTime: {
				type: Number,
				default: 0.4
			},
			onOpenAsync: {
				type: Function,
			}
		},
		data() {
			return {
				currentIndex: [],
				cardList: [],
				cardStyle: [],
				allOpen: false,
				shuffling: false,
				isStart: false,
				userSelectedIndex: ''
			}
		},
		emits: ['onMax', 'onSelect', 'onTab'],
		computed: {
			cardLength() {
				return this.col * this.row
			},
			gridWidth() {
				return this.col * this.width + (this.col - 1) * this.gap + 'px'
			},
			gridHeight() {
				return this.row * this.height + (this.row - 1) * this.gap + 'px'
			},
			gridGap() {
				return this.gap + 'rpx'
			},
			itemWidth() {
				return this.width + 'rpx'
			},
			itemHeight() {
				return this.height + 'rpx'
			},
			collectTransition() {
				return `all ${this.collectTime}s`
			},
			turnTransition() {
				return `all ${this.turnTime}s`
			},
		},
		mounted() {
			// this._setData()
			this.allOpen = true; // 初始化时显示背面
			if (this.list.length > 0) {
				this.$nextTick(() => {
					this._setData().then(() => {
						// 数据加载完成后可以关闭所有卡片（如果需要）
						// this.allOpen = false;
					});
				});
			}
		},
		watch: {
			list: {
				immediate: true, // 立即触发一次
				handler(newList) {
					if (newList.length > 0) {
						this.$nextTick(() => {
							this._setData()
						})
					}
				}
			}
		},
		methods: {
			/**
			 * 新增：设置指定中奖项
			 * @param {Number} index 中奖卡片索引
			 * @param {Object} options 配置项
			 * @param {Boolean} options.autoOpen 是否自动翻转卡片（默认true）
			 * @param {Boolean} options.emitEvent 是否触发onSelect事件（默认true）
			 * @param {Number} options.delay 全部翻转延迟时间（默认300ms）
			 */
			setPrize(index, options = {}) {
				if (index < 0 || index >= this.cardLength) {
					console.error('中奖索引超出范围')
					return
				}

				const {
					autoOpen = true,
						emitEvent = true,
						delay = 300
				} = options

				// 清除当前选中状态
				this.currentIndex = []

				if (autoOpen) {
					setTimeout(() => {
						this.currentIndex.push(index)

						if (this.endTurnAll) {
							setTimeout(() => {
								for (let i = 0; i < this.cardLength; i++) {
									if (!this.currentIndex.includes(i)) {
										this.currentIndex.push(i)
									}
								}
							}, delay)
						}
					}, 100)
				}

				if (emitEvent) {
					const params = {
						data: this.cardList[index]?.data,
						index: index
					}
					this.$emit('onSelect', params)
				}
			},

			async start() {
				if (this.isStart) return
				this.isStart = true
				this.shuffling = true

				let shuffleAnimate = this.shuffleAnimate
				if (this.shuffleTurnAll) {
					this.allOpen = true
					shuffleAnimate = true
					await this._delay(() => this.allOpen = false, this.turnTime * 1000)
				}

				if (shuffleAnimate) {
					const shuffleTime = ((this.cardLength - 1) * 0.2 + this.collectTime) * 1000
					await this._delay(() => this.cardStyle = this.cardList.map(item => item.colseStyle), this
						.turnTime * 1000 + 200)
					await this._delay(() => this.cardStyle = this.cardList.map(item => item.openStyle), shuffleTime)
				}

				if (this.shuffle) {
					this._shuffleArray()
				}

				setTimeout(() => {
					this.shuffling = false
				}, 1000)
			},

			reset() {
				if (this.shuffling) return
				this.isStart = false
				this.currentIndex = []
				this._setData()
			},
			_setData() {
				return new Promise(resolve => {
					uni.createSelectorQuery().in(this).selectAll('.card-item').boundingClientRect((nodes) => {
						const centerEl = nodes[this.targetIndex]
						const {
							left: pLeft,
							top: pTop
						} = centerEl
						const cardList = nodes.map((node, index) => {
							const {
								top,
								left
							} = node
							const y = pTop - top + 80
							const x = pLeft - left
							return {
								x,
								y,
								key: new Date().getTime().toString(),
								style: {
									'margin-right': (index + 1) % this.col === 0 ? 0 : this
										.gridGap,
								},
								colseStyle: {
									transform: `translate(${x}px, ${y}px)`,
									'transition-delay': `${index * 0.2}s`
								},
								openStyle: {
									transform: `translate(0, 0)`,
									'transition-delay': `${index * 0.2}s`
								},
								data: this.list[index]
							}
						})
						this.cardList = cardList
						resolve()
					}).exec()
				})
			},

			async _cardHandle(index) {
				const params = {
					data: this.cardList[index]?.data,
					index: index
				}
				this.$emit('onTab', params)

				if (this.currentIndex.includes(index)) return
				if (this.shuffling || !this.isStart) return
				if (this.maxOpenCount <= this.currentIndex.length) return this.$emit('onMax', params)

				// 新增：保存用户点击的索引
				this.userSelectedIndex = index

				if (this.onOpenAsync) {
					// 修改：等待异步结果并处理
					const realPrizeIndex = await this.onOpenAsync(params)
					this._processRealPrize(realPrizeIndex, index)
				} else {
					this.currentIndex.push(index)
					this.$emit('onSelect', params)

					if (this.endTurnAll) {
						setTimeout(() => {
							for (let i = 0; i < this.cardLength; i++) {
								this.currentIndex.push(i)
							}
						}, 300)
					}
				}
			},
			_processRealPrize(realPrizeIndex, clickedIndex) {
				let realPrizeData
				if (realPrizeIndex != -1) {
					// 1. 保存真实奖品数据（从原始list获取）
					realPrizeData = this.list[realPrizeIndex]
				} else {
					realPrizeData = {
						prizeName: "Réessayez la prochaine fois"
					}
				}


				// 2. 将用户点击的卡片数据替换为真实奖品
				this.cardList[clickedIndex].data = realPrizeData


				// 3. 创建其他卡片的索引数组（排除真实中奖项）
				const otherIndexes = Array.from({
						length: this.cardLength
					}, (_, i) => i)
					.filter(i => i !== clickedIndex)
				// 4. 从原始list获取其他奖品数据
				const otherPrizes = this.list.filter((_, index) => index != realPrizeIndex)

				// 5. 随机打乱其他奖品
				for (let i = otherPrizes.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[otherPrizes[i], otherPrizes[j]] = [otherPrizes[j], otherPrizes[i]];

				}
				// 6. 将随机后的奖品分配到其他卡片
				otherIndexes.forEach((cardIndex, prizeIndex) => {
					this.$set(this.cardList[cardIndex], 'data', otherPrizes[prizeIndex])
				})
				// 7. 翻转用户点击的卡片
				this.currentIndex.push(clickedIndex)
				this.$emit('onSelect', {
					data: realPrizeData,
					index: clickedIndex
				})

				// 8. 如果需要结束全部翻转
				if (this.endTurnAll) {
					setTimeout(() => {
						for (let i = 0; i < this.cardLength; i++) {
							if (!this.currentIndex.includes(i)) {
								this.currentIndex.push(i)
							}
						}
					}, 300)
				}
			},

			_delay(cb, time = 600) {
				return new Promise(resolve => setTimeout(() => {
					cb()
					resolve()
				}, time))
			},

			_shuffleArray() {
				const cardList = [...this.cardList]
				const list = [...this.list]
				for (let i = list.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[list[i], list[j]] = [list[j], list[i]];
				}
				for (let i = 0; i <= list.length - 1; i++) {
					cardList[i].data = list[i]
				}
				this.cardList = cardList
			}
		}
	}
</script>

<style lang="scss" scoped>
	.draw-card {
		padding: 23rpx;
		display: inline-flex;
		flex-wrap: wrap;
		width: v-bind(gridWidth);
		// height: v-bind(gridHeight);

		.card-item {
			width: v-bind(itemWidth);
			height: v-bind(itemHeight);
			margin-bottom: v-bind(gridGap);
			position: relative;
			transition: v-bind(collectTransition);

			&:nth-child(n + 4) {
				margin-top: -46rpx;
			}

			.front,
			.back {
				position: absolute;
				left: 0;
				right: 0;
				width: 100%;
				height: 100%;
				backface-visibility: hidden;
				transition: v-bind(turnTransition);

				image {
					width: 100%;
					height: 100%;
				}
			}

			.back {
				transform: rotateY(180deg);

				.back-content {
					width: 100%;
					height: 100%;
				}
			}
		}

		.opened {
			.front {
				transform: rotateY(-180deg);
			}

			.back {
				transform: rotateY(0deg);
			}
		}
	}
</style>