<template>
	<view class="draw-card" :style="{ transform: shuffling ? `rotateZ(${rotateAngle}deg)` : 'rotateZ(0deg)' }">
		<template v-for="(i, index) in cardLength" :key="i.key">
			<view class="card-item" @click="_cardHandle(index)"
				:style="{ ...cardStyle[index], ...cardList[index]?.style }"
				:class="{ opened: currentIndex.includes(index) || allOpen }">
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
				userSelectedIndex: '',
				rotateAngle: 0,
				rotateTimer: null,
				containerRect: null,
				containerCenterAbs: { // 容器的【绝对中心点】（相对于页面）
					x: 0,
					y: 0
				},
				isProcessingClick: false // 新增：标记是否正在处理点击请求
			}
		},
		emits: ['onMax', 'onSelect', 'onTab'],
		computed: {
			cardLength() {
				return this.list.length
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
			containerTransition() {
				return this.shuffling ? 'none' : `transform 0.5s ease-out`
			}
		},
		mounted() {
			this.allOpen = true;
			if (this.list.length > 0) {
				this.$nextTick(() => {
					this._setData().then(() => {
						// this.allOpen = false;
					});
				});
			}
		},
		beforeUnmount() {
			if (this.rotateTimer) {
				clearInterval(this.rotateTimer)
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
					// 1. 初始聚拢
					await this._delay(() => {
						this.cardStyle = this.cardList.map(item => ({
							...item.colseStyle,
							transition: `all ${this.collectTime}s cubic-bezier(0.34, 1.56, 0.64, 1)`
						}))
					}, this.turnTime * 1000 + 200)

					await this._delay(null, this.collectTime * 1000)

					// 2. 复杂洗牌（核心修复部分）
					await this._complexShuffleAnimate()

					// 3. 开启容器旋转
					this._startContainerRotate()

					await this._delay(null, 1200)

					// 4. 停止旋转
					this._stopContainerRotate()

					// 模拟点击最后一张
					// await this._delay(async () => {
					// 	const lastCardIndex = this.cardLength - 1
					// 	if (this.onOpenAsync) {
					// 		const clickParams = {
					// 			data: this.cardList[lastCardIndex]?.data,
					// 			index: lastCardIndex
					// 		}
					// 		const realPrizeIndex = await this.onOpenAsync(clickParams)
					// 		this._processRealPrize(realPrizeIndex, lastCardIndex)
					// 	} else {
					// 		this.currentIndex.push(lastCardIndex)
					// 		this.$emit('onSelect', {
					// 			data: this.cardList[lastCardIndex]?.data,
					// 			index: lastCardIndex
					// 		})
					// 	}

					// 	this.cardStyle = this.cardStyle.map((style, index) => ({
					// 		...style,
					// 		transform: index === lastCardIndex ?
					// 			`${style.transform} scale(1.1)` : style.transform,
					// 		transition: `all 0.5s ease-in-out`
					// 	}))
					// }, 300)

					await this._delay(null, 800)

					// 回归原位
					await this._delay(() => {
						this.cardStyle = this.cardList.map((item, index) => ({
							...item.openStyle,
							transition: `all ${this.collectTime * 1.2}s cubic-bezier(0.25, 1, 0.5, 1)`
						}))
					}, 200)
				}

				if (this.shuffle) {
					this._shuffleArray()
				}

				setTimeout(() => {
					this.shuffling = false
				}, 1000)
			},

			/**
			 * 核心修复：以【卡片中心】对齐【容器中心】进行圆形分布
			 */
			async _complexShuffleAnimate() {
				const totalCards = this.cardLength
				// 1. 计算准确的容器内边距（rpx转px，适配不同设备）
				const containerPadding = uni.upx2px(23) // 对应样式中的padding:23rpx
				// 2. 容器内容区域宽度（减去左右padding）
				const contentWidth = this.containerRect.width - (containerPadding * 2)
				// 3. 圆形半径：内容区域的40%（确保卡片紧凑围绕中心）
				const circleRadius = contentWidth * 0.25

				const totalAngle = 360
				const angleStep = totalAngle / totalCards // 均分圆周角
				const angleOffset = this.cardLength <= 6 ? -28 : -48 // 起始角度（让第一张卡片在正上方）

				const cardStyles = this.cardList.map((item, index) => {
					// 计算当前卡片的角度
					const angle = index * angleStep + angleOffset
					const radians = angle * Math.PI / 180

					// 4. 计算【卡片中心】相对于【容器中心】的偏移（圆形轨迹）
					const offsetX = circleRadius * Math.cos(radians)
					const offsetY = circleRadius * Math.sin(radians)

					// 5. 目标位置：容器中心 + 圆形偏移（卡片中心要到达的点）
					const targetCardCenterX = this.containerCenterAbs.x + offsetX
					const targetCardCenterY = this.containerCenterAbs.y + offsetY

					// 6. 计算translate值：让卡片中心从“原始位置”移动到“目标位置”
					const translateX = targetCardCenterX - item.originalCenterX
					const translateY = targetCardCenterY - item.originalCenterY

					// 卡片自身旋转角度（与轨迹角度一致，视觉更协调）
					const selfRotateAngle = angle + 88
					setTimeout(() => {
						this.$music.play_shuffle()
					}, 1000)
					return {
						transform: `translate(${translateX}px, ${translateY}px) rotateZ(${selfRotateAngle}deg)`,
						opacity: 0.95,
						zIndex: 10,
						transition: `all 1s cubic-bezier(0.25, 1.5, 0.5, 1)`
					}
				})

				// 应用圆形分布样式
				this.cardStyle = cardStyles
				await this._delay(null, 1000)

				// 轻微随机微调（模拟洗牌随机性）
				const fineTuneStyles = this.cardStyle.map((style, index) => {
					const currentAngle = parseFloat(style.transform.match(/rotateZ\(([^)]*)\)/)[1])
					const fineTuneAngle = currentAngle + (Math.random() - 0.5) * 5

					const currentTranslateX = parseFloat(style.transform.match(/translate\(([^,)]*),/)[1])
					const currentTranslateY = parseFloat(style.transform.match(/, ([^)]*)\)/)[1])
					const fineTuneX = currentTranslateX + (Math.random() - 0.5) * 4
					const fineTuneY = currentTranslateY + (Math.random() - 0.5) * 4

					return {
						...style,
						transform: `translate(${fineTuneX}px, ${fineTuneY}px) rotateZ(${fineTuneAngle}deg)`,
						transition: `all 0.5s ease-in-out`
					}
				})

				this.cardStyle = fineTuneStyles
				await this._delay(null, 500)
			},

			_startContainerRotate() {
				if (this.rotateTimer) {
					clearInterval(this.rotateTimer)
				}
				this.rotateTimer = setInterval(() => {
					this.rotateAngle = (this.rotateAngle + 20) % 360
				}, 16)
			},
			_stopContainerRotate() {
				if (this.rotateTimer) {
					clearInterval(this.rotateTimer)
					this.rotateTimer = null
				}
				this.rotateAngle = 0
			},
			reset() {
				if (this.shuffling) return
				this.isStart = false
				this.currentIndex = []
				this.rotateAngle = 0
				if (this.rotateTimer) {
					clearInterval(this.rotateTimer)
					this.rotateTimer = null
				}
				this.isProcessingClick = false // 重置点击状态
				this._setData()
			},
			_setData() {
				return new Promise(resolve => {
					// 1. 获取容器的完整布局信息
					uni.createSelectorQuery().in(this).select('.draw-card').boundingClientRect(containerRect => {
						this.containerRect = containerRect
						// 计算容器的【绝对中心点】（相对于页面）
						this.containerCenterAbs = {
							x: containerRect.left + containerRect.width / 2,
							y: containerRect.top + containerRect.height / 2
						}

						// 2. 获取所有卡片的布局信息
						uni.createSelectorQuery().in(this).selectAll('.card-item').boundingClientRect((
							nodes) => {
							const centerEl = nodes[this.targetIndex]
							const {
								left: pLeft,
								top: pTop
							} = centerEl
							const cardList = nodes.map((node, index) => {
								const {
									top,
									left,
									width,
									height
								} = node
								const y = pTop - top + 80
								const x = pLeft - left

								// 计算卡片的【绝对中心点】（相对于页面）
								const originalCenterX = left + width / 2
								const originalCenterY = top + height / 2

								return {
									x,
									y,
									key: new Date().getTime().toString(),
									colseStyle: {
										transform: `translate(${x}px, ${y}px)`,
										'transition-delay': `${index * 0.2}s`
									},
									openStyle: {
										transform: `translate(0, 0)`,
										'transition-delay': `${index * 0.2}s`
									},
									data: this.list[index],
									originalCenterX: originalCenterX, // 存储卡片中心X
									originalCenterY: originalCenterY // 存储卡片中心Y
								}
							})
							this.cardList = cardList
							resolve()
						}).exec()
					}).exec()
				})
			},
			async _cardHandle(index) {
				// 新增：如果正在处理点击，直接返回
				if (this.isProcessingClick) return
				
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
					try {
						// 标记为正在处理点击
						this.isProcessingClick = true
						const realPrizeIndex = await this.onOpenAsync(params)
						this.$music.play_overturn()
						setTimeout(() => {
							this._processRealPrize(realPrizeIndex, index)
							// 处理完成后重置状态
							this.isProcessingClick = false
						}, 500)
					} catch (error) {
						console.error('处理卡片点击时出错:', error)
						// 出错时也要重置状态
						this.isProcessingClick = false
					}
				} else {
					this.currentIndex.push(index)
					this.$emit('onSelect', params)

					if (this.endTurnAll) {
						setTimeout(() => {
							for (let i = 0; i < this.cardLength; i++) {
								if (!this.currentIndex.includes(i)) {
									this.currentIndex.push(i)
								}
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
					cb && cb()
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
		padding: 23rpx 14rpx;
		padding-top: 0;
		display: inline-flex;
		flex-wrap: wrap;
		width: v-bind(gridWidth);
		perspective: 3000px;
		perspective-origin: center center;
		position: relative;

		.card-item {
			width: v-bind(itemWidth);
			height: v-bind(itemHeight);
			margin-bottom: 58rpx;
			position: relative;
			transition: v-bind(collectTransition);
			transform-style: preserve-3d;
			backface-visibility: hidden;
			z-index: 1;

			&:nth-child(n + 4) {
				margin-top: -46rpx;
			}

			&.shuffling {
				transition: none;
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
					object-fit: cover; // 新增：确保图片不拉伸
				}
			}

			.back {
				transform: rotateY(180deg);
				// background-color: #ffffff;
				background-image: radial-gradient(circle at 10% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 90%);
			}

			.front {
				background-color: #f8f9fa;
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

		.shuffling-container & {
			filter: blur(0.3rpx);
		}
	}
</style>