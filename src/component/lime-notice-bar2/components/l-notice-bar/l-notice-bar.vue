<template>
	<view class="l-notice-bar" :class="['l-notice-bar--' + type]" :style="[styles, lStyle]" @click="clickSuffixIcon">
		<view class="l-notice-bar__left" style="margin-left: 0;padding: 0;" v-if="$slots['leftIcon'] || prefixIcon">
			<slot name="leftIcon">
				<image :src="leftIcon" mode="" class="level_img1"></image>
			</slot>
		</view>
		<view ref="listRef" class="l-notice-bar__wrap " v-if="!vertical">
			<view class="l-notice-bar__content-scroll" v-if="marquee">
				<slot>
					<text v-if="!isRichText" ref="itemRef" class="l-notice-bar__content" :style="[contentStyle]"
						@transitionend="handleTransitionend" :class="contentClass">{{ textContent }}</text>
					<rich-text v-else ref="itemRef" class="l-notice-bar__content" :style="[contentStyle]"
						@transitionend="handleTransitionend" :class="contentClass" :nodes="richTextContent"></rich-text>
				</slot>
			</view>
			<slot v-else>
				<text v-if="!isRichText" ref="itemRef" class="l-notice-bar__content"
					@transitionend="handleTransitionend" :class="contentClass"
					style="color: #0145f1 !important;">{{ textContent }}</text>
				<rich-text v-else ref="itemRef" class="l-notice-bar__content" @transitionend="handleTransitionend"
					:class="contentClass" :nodes="richTextContent"></rich-text>
			</slot>
		</view>
		<swiper data-swiper class="l-notice-bar__wrap" v-if="vertical && marquee" :vertical="true" :autoplay="true"
			:interval="interval" :disable-touch="true">
			<swiper-item v-for="(text, index) in rawTexts" :key="index"
				style="align-items: center; flex-direction: row;">
				<text v-if="!isRichText" class="l-notice-bar__content" :class="contentClass">{{ text }}</text>
				<rich-text v-else class="l-notice-bar__content" :class="contentClass" :nodes="text"></rich-text>
			</swiper-item>
		</swiper>
		<view class="l-notice-bar__right" v-if="$slots['rightIcon'] || rightIcon" @click="clickSuffixIcon">
			<slot name="rightIcon">
				<l-icon class="l-notice-bar__icon" :color="rightIconColor || color" :size="rightIconSize || fontSize"
					:name="rightIcon" />
			</slot>
		</view>
	</view>
</template>

<script lang="ts">
	// @ts-nocheck
	import { defineComponent, ref, computed, onMounted, nextTick, getCurrentInstance, watch, onUnmounted, onActivated } from '@/uni_modules/lime-shared/vue';
	import { getRect } from '@/uni_modules/lime-shared/getRect';
	import noticeBarProps from './props';

	export default defineComponent({
		name: 'l-notice-bar',
		props: noticeBarProps,
		emits: ['click'],
		setup(props, { emit }) {
			const instance = getCurrentInstance().proxy!
			const THEME_ICON = new Map<string, string>([
				['info', 'info-circle-filled'],
				['success', 'check-circle-filled'],
				['warning', 'info-circle-filled'],
				['danger', 'error-circle-filled'],
			])

			// 定时器管理
			const timers = {
				dimensionTimer: null as number | null,
				scrollTimer: null as number | null,
				transitionTimer: null as number | null,
				scrollLoopTimer: null as number | null
			};

			// 左侧图标计算
			const prefixIcon = computed(() : string | boolean => {
				if (props.leftIcon == '' || props.leftIcon == 'true') return false
				return props.leftIcon || THEME_ICON.get(props.type)
			})

			// 文本内容处理
			const rawTexts = ref<string[]>([]);
			watch(() => props.text, (newVal) => {
				let _texts : string[] = [];
				if (typeof newVal === 'string') {
					_texts.push(newVal);
				} else if (Array.isArray(newVal)) {
					newVal.forEach(text => typeof text === 'string' && _texts.push(text));
				}
				if (JSON.stringify(rawTexts.value) !== JSON.stringify(_texts)) {
					rawTexts.value = _texts;
				}
			}, { immediate: true });

			// 富文本判断
			const isRichText = ref(false);
			const checkIfRichText = (texts : string[]) => {
				const richTextReg = /<\/?[a-zA-Z0-9]+(\s+[a-zA-Z0-9-]+="[^"]*")*\/?>/;
				return texts.some(text => richTextReg.test(text));
			};
			watch(rawTexts, (newVal) => {
				isRichText.value = checkIfRichText(newVal);
			}, { immediate: true });

			// 文本内容计算
			const textContent = computed(() => rawTexts.value.join(''));
			const richTextContent = computed(() => rawTexts.value.join(''));

			// 外层样式
			const styles = computed(() => {
				const style : Record<string, string> = {};
				if (props.bgColor) style['background'] = props.bgColor!;
				if (props.color) style['color'] = props.color!;
				if (props.fontSize) style['font-size'] = props.fontSize!;
				return style;
			})

			// 内容类名
			const contentClass = computed(() => {
				const cls : string[] = [];
				const name = 'l-notice-bar__content';
				if (!props.wrapable && !props.marquee || props.marquee && props.vertical) {
					cls.push(`${name}-ellipsis`);
				}
				if (props.wrapable && !props.marquee) {
					cls.push(`${name}-wrapable`);
				}
				if (props.marquee && !props.vertical) {
					cls.push(`${name}-marquee`);
				}
				return cls;
			})

			// ---------------------- 无限滚动核心逻辑 ----------------------
			const offset = ref(0); // 滚动偏移量
			const duration = ref(0); // 动画时长
			const dimensions = ref({ listWidth: 0, itemWidth: 0 }); // 容器和文本尺寸

			// 滚动样式
			const contentStyle = computed(() => ({
				'transition-timing-function': 'linear',
				'transition-duration': `${duration.value}s`,
				transform: `translateX(${offset.value}px)`
			}));

			// 计算容器和文本尺寸
			const calculateDimensions = async () => {
				await nextTick();
				try {
					const [list, item] = await Promise.all([
						getRect('.l-notice-bar__wrap', instance),
						getRect('.l-notice-bar__content', instance)
					]);
					dimensions.value = { listWidth: list.width, itemWidth: item.width };
				} catch (e) {
					console.warn('获取元素尺寸失败:', e);
				}
			};

			// 初始化滚动
			const handleScrolling = () => {
				if (!props.marquee || props.vertical) return;

				// 清除旧定时器
				if (timers.scrollTimer) {
					clearTimeout(timers.scrollTimer);
					timers.scrollTimer = null;
				}

				timers.scrollTimer = setTimeout(() => {
					const { listWidth, itemWidth } = dimensions.value;
					// 文本宽度 >= 容器宽度时才滚动
					if (itemWidth >= listWidth) {
						// 修改初始化位置，从0开始（文字完整显示在容器中）
						offset.value = 0;
						duration.value = 0;

						// 延迟启动滚动，确保位置设置完成
						setTimeout(() => {
							offset.value = -itemWidth; // 终点：容器左侧（不可见）
							duration.value = (itemWidth + listWidth) / props.speed; // 计算滚动时长

							// 启动循环定时器作为transitionend的备选方案
							if (timers.scrollLoopTimer) {
								clearTimeout(timers.scrollLoopTimer);
							}
							timers.scrollLoopTimer = setTimeout(resetAndScroll,
								((itemWidth + listWidth) / props.speed) * 1000 + props.interval);
						}, 100);
					}
				}, props.delay);
			};

			// 重置并重新开始滚动的函数
			const resetAndScroll = () => {
				const { listWidth, itemWidth } = dimensions.value;

				// 重置到起点（容器右侧，文字完整显示）
				offset.value = listWidth;
				duration.value = 0;

				// 延迟启动下一轮滚动
				setTimeout(() => {
					offset.value = -itemWidth;
					duration.value = (itemWidth + listWidth) / props.speed;

					// 设置下下轮滚动的定时器
					if (timers.scrollLoopTimer) {
						clearTimeout(timers.scrollLoopTimer);
					}
					timers.scrollLoopTimer = setTimeout(resetAndScroll,
						((itemWidth + listWidth) / props.speed) * 1000 + props.interval);
				}, 20);
			};

			// 滚动结束后立即重置，实现无限循环（核心）
			const handleTransitionend = () => {
				// 清除循环定时器，优先使用transitionend事件
				if (timers.scrollLoopTimer) {
					clearTimeout(timers.scrollLoopTimer);
					timers.scrollLoopTimer = null;
				}

				const { listWidth, itemWidth } = dimensions.value;
				// 重置到起点（容器右侧，文字完整显示）
				offset.value = listWidth;
				duration.value = 0;

				// 无论任何情况，都触发下一轮滚动（彻底无限循环）
				timers.transitionTimer = setTimeout(() => {
					offset.value = -itemWidth;
					duration.value = (itemWidth + listWidth) / props.speed;

					// 如果transitionend再次失效，启动备用循环定时器
					if (timers.scrollLoopTimer) {
						clearTimeout(timers.scrollLoopTimer);
					}
					timers.scrollLoopTimer = setTimeout(resetAndScroll,
						((itemWidth + listWidth) / props.speed) * 1000 + props.interval);
				}, props.interval);
			};

			// ---------------------- 事件与生命周期 ----------------------
			const clickSuffixIcon = () => {
				emit('click');
			};

			// 组件挂载时初始化
			onMounted(() => {
				nextTick(() => {
					calculateDimensions().then(() => {
						handleScrolling();
					});
				});
			});

			// 页面激活时重新初始化
			onActivated(() => {
				isRichText.value = checkIfRichText(rawTexts.value);
				if (props.marquee) {
					nextTick(() => {
						calculateDimensions().then(() => {
							offset.value = 0;
							duration.value = 0;
							handleScrolling();
						});
					});
				}
			});

			// 文本变化时重新计算尺寸
			watch(rawTexts, (newVal, oldVal) => {
				if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
					if (timers.dimensionTimer) {
						clearTimeout(timers.dimensionTimer);
					}
					timers.dimensionTimer = setTimeout(() => {
						calculateDimensions();
					}, 0);
				}
			}, { deep: true });

			// 组件销毁时清除定时器
			onUnmounted(() => {
				Object.values(timers).forEach(timer => {
					if (timer) clearTimeout(timer);
				});
			});

			return {
				prefixIcon,
				styles,
				contentStyle,
				contentClass,
				rawTexts,
				isRichText,
				textContent,
				richTextContent,
				handleTransitionend,
				clickSuffixIcon,
				calculateDimensions
			};
		}
	});
</script>

<style lang="scss">
	@import './index';
	
	.l-notice-bar {
		padding: 0 !important;
	}
	
	.l-notice-bar__wrap {
		padding: 20rpx 0 !important;
	}

	.level_img1 {
		width: 140rpx;
		height: 61rpx;
		object-fit: contain;
		padding-left: 11rpx;
		padding-top: 11rpx;
		background-color: transparent !important;
		// margin-right: 12rpx;
	}

	.l-notice-bar__wrap {
		overflow: hidden;
		flex: 1;
		height: 100%;
		position: relative;
		transform: translateX(-11rpx);
	}

	.l-notice-bar__content-scroll {
		display: inline-block;
		white-space: nowrap;
	}

	.l-notice-bar__content-ellipsis {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.l-notice-bar__content-wrapable {
		white-space: normal;
		word-break: break-all;
	}

	.l-notice-bar__content-marquee {
		display: inline-block;
		will-change: transform;
		/* 优化动画性能 */
	}
</style>