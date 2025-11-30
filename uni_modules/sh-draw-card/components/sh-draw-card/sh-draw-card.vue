<template>
	<view class="draw-card">
		<template v-for="(i, index) in cardLength" :key="i.key">
			<view class="card-item" @click="_cardHandle(index)"
				:style="{...cardStyle[index], ...cardList[index]?.style, zIndex: cardZIndex[index]}"
				:class="{opened: currentIndex.includes(index) || allOpen, shuffling: shuffling}">
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
				default: true
			},
			collectTime: {
				type: Number,
				default: 0.4
			},
			turnTime: {
				type: Number,
				default: 0.4
			},
			// 洗牌动画配置
			shuffleTotalTime: {
				type: Number,
				default: 3.5 // 洗牌总时长（秒）
			},
			maxRotateAngle: {
				type: Number,
				default: 360 // 最大旋转角度
			},
			maxDisplacement: {
				type: Number,
				default: 150 // 最大位移距离(px)
			},
			minScale: {
				type: Number,
				default: 0.6 // 最小缩放比例
			},
			maxScale: {
				type: Number,
				default: 1.2 // 最大缩放比例
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
				cardZIndex: [], // 卡片层级
				allOpen: false,
				shuffling: false,
				isStart: false,
				userSelectedIndex: '',
				centerPoint: {
					x: 0,
					y: 0
				},
				shuffleSteps: 6 // 洗牌步骤数
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
				return `all ${this.collectTime}s cubic-bezier(0.4, 0, 0.2, 1)`
			},
			turnTransition() {
				return `all ${this.turnTime}s ease`
			},
			shuffleTransition() {
				return `all ${this.shuffleTotalTime / (this.shuffleSteps * 1.5)}s cubic-bezier(0.68, -0.55, 0.27, 1.55)`
			}
		},
		mounted() {
			this.allOpen = true;
			if (this.list.length > 0) {
				this.$nextTick(() => {
					this._setData().then(() => {
						// 初始化卡片层级
						this.cardZIndex = Array(this.cardLength).fill(1)
					});
				});
			}
		},
		watch: {
			list: {
				immediate: true,
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
			 * 设置指定中奖项
			 * @param {Number} index 中奖卡片索引
			 * @param {Object} options 配置项
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
					// 执行超级复杂的洗牌动画
					await this._superComplexShuffleAnimation()
				}

				if (this.shuffle) {
					this._shuffleArray()
				}

				setTimeout(() => {
					this.shuffling = false
				}, 800)
			},

			/**
			 * 超级复杂的洗牌动画主流程
			 * 多层级随机位移+旋转+缩放+层级变化+交错延迟
			 */
			async _superComplexShuffleAnimation() {
				// 初始化洗牌状态
				this.cardZIndex = Array(this.cardLength).fill(1)

				// 步骤1: 初始快速聚拢到中心
				await this._delay(() => {
					this.cardStyle = this.cardList.map((item, index) => ({
						...item.colseStyle,
						transition: this.collectTransition,
						transitionDelay: `${Math.random() * 0.2}s`, // 随机延迟
						transform: `translate(${item.x}px, ${item.y}px) scale(0.9) rotate(${Math.random() * 30}deg)`
					}))
				}, 100)
				await this._delay(null, this.collectTime * 1000 + 100)

				// 步骤2: 多轮随机洗牌（核心复杂动画）
				for (let step = 0; step < this.shuffleSteps; step++) {
					await this._delay(() => {
						// 每一轮都重新计算随机参数
						this.cardStyle = this.cardList.map((item, index) => {
							// 随机位移（X/Y轴）
							const randomX = (Math.random() - 0.5) * this.maxDisplacement * (1 - step /
								this.shuffleSteps)
							const randomY = (Math.random() - 0.5) * this.maxDisplacement * (1 - step /
								this.shuffleSteps)

							// 随机旋转（包含3D旋转）
							const rotateX = Math.random() * this.maxRotateAngle * (Math.random() >
								0.5 ? 1 : -1)
							const rotateY = Math.random() * this.maxRotateAngle * (Math.random() >
								0.5 ? 1 : -1)
							const rotateZ = Math.random() * this.maxRotateAngle * (Math.random() >
								0.5 ? 1 : -1)

							// 随机缩放
							const scale = this.minScale + Math.random() * (this.maxScale - this
								.minScale)

							// 随机透明度
							const opacity = 0.8 + Math.random() * 0.2

							return {
								transform: `translate(${randomX}px, ${randomY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
								opacity,
								transition: this.shuffleTransition,
								transitionDelay: `${Math.random() * 0.4}s` // 完全随机的延迟
							}
						})

						// 随机改变卡片层级（制造堆叠效果）
						this.cardZIndex = this.cardZIndex.map(() => Math.floor(Math.random() * 10) + 1)
					}, 50)

					// 等待当前步骤动画完成
					await this._delay(null, (this.shuffleTotalTime / this.shuffleSteps) * 1000)
				}

				// 步骤3: 二次聚拢（带抖动效果）
				await this._delay(() => {
					this.cardStyle = this.cardList.map((item, index) => {
						// 轻微抖动的聚拢效果
						const jitterX = (Math.random() - 0.5) * 20
						const jitterY = (Math.random() - 0.5) * 20

						return {
							transform: `translate(${item.x + jitterX}px, ${item.y + jitterY}px) rotate(0deg) scale(1)`,
							opacity: 1,
							transition: this.collectTransition,
							transitionDelay: `${index * 0.03}s`
						}
					})

					// 重置层级
					this.cardZIndex = Array(this.cardLength).fill(1)
				}, 200)
				await this._delay(null, this.collectTime * 1000 + 300)

				// 步骤4: 散开前的微抖动
				await this._delay(() => {
					this.cardStyle = this.cardList.map((item, index) => {
						const microJitterX = (Math.random() - 0.5) * 8
						const microJitterY = (Math.random() - 0.5) * 8

						return {
							transform: `translate(${microJitterX}px, ${microJitterY}px) rotate(${Math.random() * 5}deg) scale(1.02)`,
							transition: `all 0.2s ease`,
							transitionDelay: `${Math.random() * 0.15}s`
						}
					})
				}, 100)
				await this._delay(null, 200)

				// 步骤5: 最终回归原位（带弹性效果）
				await this._delay(() => {
					this.cardStyle = this.cardList.map((item, index) => ({
						transform: `translate(0, 0) rotate(0deg) scale(1)`,
						opacity: 1,
						transition: `all ${this.collectTime * 1.2}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`, // 弹性曲线
						transitionDelay: `${index * 0.04}s`
					}))
				}, 100)
				await this._delay(null, this.collectTime * 1200 + 500)
			},

			reset() {
				if (this.shuffling) return
				this.isStart = false
				this.currentIndex = []
				this.cardZIndex = Array(this.cardLength).fill(1)
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

						this.centerPoint = {
							x: pLeft + centerEl.width / 2,
							y: pTop + centerEl.height / 2
						}

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
								key: `${new Date().getTime()}-${index}-${Math.random()}`, // 增加随机key确保重渲染
								style: {
									'margin-right': (index + 1) % this.col === 0 ? 0 : this
										.gridGap,
								},
								colseStyle: {
									transform: `translate(${x}px, ${y}px)`,
									'transition-delay': `${Math.random() * 0.15}s`
								},
								openStyle: {
									transform: `translate(0, 0)`,
									'transition-delay': `${Math.random() * 0.15}s`
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

				this.userSelectedIndex = index

				if (this.onOpenAsync) {
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
					realPrizeData = this.list[realPrizeIndex]
				} else {
					realPrizeData = {
						prizeName: "Réessayez la prochaine fois"
					}
				}

				this.cardList[clickedIndex].data = realPrizeData

				const otherIndexes = Array.from({
						length: this.cardLength
					}, (_, i) => i)
					.filter(i => i !== clickedIndex)

				const otherPrizes = this.list.filter((_, index) => index != realPrizeIndex)

				// 更彻底的随机打乱
				for (let i = otherPrizes.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[otherPrizes[i], otherPrizes[j]] = [otherPrizes[j], otherPrizes[i]];
				}

				otherIndexes.forEach((cardIndex, prizeIndex) => {
					this.$set(this.cardList[cardIndex], 'data', otherPrizes[prizeIndex])
				})

				this.currentIndex.push(clickedIndex)
				this.$emit('onSelect', {
					data: realPrizeData,
					index: clickedIndex
				})

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
					if (cb) cb()
					resolve()
				}, time))
			},

			_shuffleArray() {
				const cardList = [...this.cardList]
				const list = [...this.list]
				// Fisher-Yates 洗牌算法 + 双重打乱
				for (let i = list.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[list[i], list[j]] = [list[j], list[i]];
				}
				// 二次打乱确保随机性
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
		perspective: 2000px; // 增强透视效果
		perspective-origin: center center;

		.card-item {
			width: v-bind(itemWidth);
			height: v-bind(itemHeight);
			margin-bottom: v-bind(gridGap);
			position: relative;
			transition: v-bind(collectTransition);
			transform-style: preserve-3d;
			backface-visibility: hidden;
			z-index: 1;

			&:nth-child(n + 4) {
				margin-top: -46rpx;
			}

			&.shuffling {
				transition: none; // 洗牌时临时禁用默认过渡
			}

			.front,
			.back {
				position: absolute;
				left: 0;
				right: 0;
				width: 100%;
				height: 88%;
				backface-visibility: hidden;
				transition: v-bind(turnTransition);
				border-radius: 12rpx;
				overflow: hidden;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
				transform-style: preserve-3d;

				image {
					width: 100%;
					height: 100%;
					backface-visibility: hidden;
				}
			}

			.back {
				transform: rotateY(180deg);
				background-color: #ffffff;
				// 添加纹理效果增强混淆
				background-image: radial-gradient(circle at 10% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 90%);
			}

			.front {
				background-color: #f8f9fa;
				// 添加细微纹理
				background-image: radial-gradient(circle at 10% 20%, rgba(0, 0, 0, 0.02) 0%, transparent 90%);
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

		// 洗牌时的全局效果
		.shuffling-container & {
			filter: blur(0.5rpx);
		}
	}
</style>