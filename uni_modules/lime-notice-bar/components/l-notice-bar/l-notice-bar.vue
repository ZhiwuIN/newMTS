<template>
	<view class="l-notice-bar" :class="['l-notice-bar--' + type]" :style="[styles, lStyle]" @click="clickSuffixIcon">
		<view class="l-notice-bar__left" v-if="$slots['leftIcon'] || prefixIcon">
			<slot name="leftIcon">
				<image :src="leftIcon" mode="" class="level_img"></image>
			</slot>
		</view>
		<view ref="listRef" class="l-notice-bar__wrap " v-if="!vertical">
			<view class="l-notice-bar__content-scroll" v-if="marquee">
				<slot>
					<!-- 用普通text渲染非富文本，rich-text渲染富文本 -->
					<text v-if="!isRichText" ref="itemRef" class="l-notice-bar__content" :style="[contentStyle]"
						@transitionend="handleTransitionend" :class="contentClass">{{ textContent }}</text>
					<rich-text v-else ref="itemRef" class="l-notice-bar__content" :style="[contentStyle]"
						@transitionend="handleTransitionend" :class="contentClass" :nodes="richTextContent"></rich-text>
				</slot>
			</view>
			<slot v-else>
				<text v-if="!isRichText" ref="itemRef" class="l-notice-bar__content"
					@transitionend="handleTransitionend" :class="contentClass">{{ textContent }}</text>
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

		// 添加定时器引用
		const timers = {
			dimensionTimer: null as number | null,
			scrollTimer: null as number | null,
			transitionTimer: null as number | null
		};

		const prefixIcon = computed((): string | boolean => {
			if (props.leftIcon == '' || props.leftIcon == 'true') return false
			return props.leftIcon || THEME_ICON.get(props.type)
		})

		// 非响应式存储文本内容，彻底避免循环
		const rawTexts = ref<string[]>([]);
		watch(() => props.text, (newVal) => {
			let _texts: string[] = [];
			if (typeof newVal === 'string') {
				_texts.push(newVal);
			} else if (Array.isArray(newVal)) {
				newVal.forEach(text => typeof text === 'string' && _texts.push(text));
			}
			// 避免设置相同值触发更新
			if (JSON.stringify(rawTexts.value) !== JSON.stringify(_texts)) {
				rawTexts.value = _texts;
			}
		}, { immediate: true });

		// 精准判断是否为富文本
		const isRichText = ref(false);
		const checkIfRichText = (texts: string[]) => {
			const richTextReg = /<\/?[a-zA-Z0-9]+(\s+[a-zA-Z0-9-]+="[^"]*")*\/?>/;
			return texts.some(text => richTextReg.test(text));
		};

		// 监听rawTexts变化，更新isRichText
		watch(rawTexts, (newVal) => {
			const newIsRichText = checkIfRichText(newVal);
			if (isRichText.value !== newIsRichText) {
				isRichText.value = newIsRichText;
			}
		}, { immediate: true });

		// 为Text和RichText组件创建独立的计算属性，避免循环依赖
		const textContent = computed(() => {
			return rawTexts.value.join('');
		});

		const richTextContent = computed(() => {
			return rawTexts.value.join('');
		});

		const styles = computed(() => {
			const style: Record<string, string> = {};
			if (props.bgColor) style['background'] = props.bgColor!;
			if (props.color) style['color'] = props.color!;
			if (props.fontSize) style['font-size'] = props.fontSize!;
			return style;
		})

		const contentClass = computed(() => {
			const cls: string[] = [];
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

		const loop = ref(props.loop);
		const offset = ref(0);
		const duration = ref(0);
		const dimensions = ref({ listWidth: 0, itemWidth: 0 });

		const contentStyle = computed(() => ({
			'transition-timing-function': 'linear',
			'transition-duration': `${duration.value}s`,
			transform: `translateX(${offset.value}px)`
		}));

		// 仅在初始化和文本变化时计算尺寸，且用setTimeout避免同步触发
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

		const handleScrolling = () => {
			if (!props.marquee || loop.value < 0) return;

			// 清除之前的定时器
			if (timers.scrollTimer) {
				clearTimeout(timers.scrollTimer);
				timers.scrollTimer = null;
			}

			timers.scrollTimer = setTimeout(() => {
				const { listWidth, itemWidth } = dimensions.value;
				if (itemWidth >= listWidth) {
					offset.value = -itemWidth;
					duration.value = itemWidth / props.speed;
				}
			}, props.delay);
		};

		const handleTransitionend = async () => {
			if (loop.value < 0) return;

			// 清除之前的定时器
			if (timers.transitionTimer) {
				clearTimeout(timers.transitionTimer);
				timers.transitionTimer = null;
			}

			if (loop.value > 0) {
				loop.value--;
			}
			const { listWidth, itemWidth } = dimensions.value;
			offset.value = listWidth;
			duration.value = 0;

			timers.transitionTimer = setTimeout(() => {
				offset.value = -itemWidth;
				duration.value = (itemWidth + listWidth) / props.speed;
			}, props.interval);
		};

		const clickSuffixIcon = () => {
			emit('click');
		};

		onMounted(() => {
			nextTick(() => {
				calculateDimensions().then(() => {
					handleScrolling();
				});
			});
		});

		// 页面激活时重新检查富文本状态并重新计算尺寸
		onActivated(() => {
			// 重新检查是否为富文本
			const newIsRichText = checkIfRichText(rawTexts.value);
			if (isRichText.value !== newIsRichText) {
				isRichText.value = newIsRichText;
			}

			// 如果启用了滚动，则重新计算尺寸并启动滚动
			if (props.marquee) {
				nextTick(() => {
					calculateDimensions().then(() => {
						// 重置动画状态
						offset.value = 0;
						duration.value = 0;
						loop.value = props.loop;
						handleScrolling();
					});
				});
			}
		});

		// 文本变化时延迟计算尺寸，避免同步更新
		watch(rawTexts, (newVal, oldVal) => {
			// 添加值比较，避免不必要的更新
			if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
				if (timers.dimensionTimer) {
					clearTimeout(timers.dimensionTimer);
					timers.dimensionTimer = null;
				}

				timers.dimensionTimer = setTimeout(() => {
					calculateDimensions();
				}, 0);
			}
		}, { deep: true });

		// 组件销毁时清除所有定时器
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
			clickSuffixIcon
		};
	}
});
</script>
<style lang="scss">
@import './index';

.level_img {
	width: 48rpx;
	height: 48rpx;
}

// .l-notice-bar__content {
// 	display: inline-block;
// 	white-space: nowrap;
// 	font-size: inherit;
// 	color: inherit;
// 	line-height: 1.5;
// }</style>