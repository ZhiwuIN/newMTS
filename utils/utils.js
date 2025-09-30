const baseUrl = "/api"
import {
	Message
} from 'tdesign-mobile-vue';

import {
	imListApi
} from "@/common/api/message.js";
/**
 * 格式化html文本，替换或补全img标签src域名为baseUrl
 * 1. 去掉img标签里的style、width、height、alt属性
 * 2. img标签添加style属性：max-width:100%;height:auto
 * 3. 替换或补全img标签src域名为baseUrl
 * 4. 去掉<br/>标签
 * @param html
 * @returns {string}
 */
export function formatRichText(html) {
	let newContent = html.replace(/<img[^>]*>/gi, function(match) {
		// 去掉style、width、height、alt属性
		let imgTag = match
			.replace(/style="[^"]*"/gi, '')
			.replace(/style='[^']*'/gi, '')
			.replace(/width="[^"]*"/gi, '')
			.replace(/width='[^']*'/gi, '')
			.replace(/height="[^"]*"/gi, '')
			.replace(/height='[^']*'/gi, '')
			.replace(/alt="[^"]*"/gi, '')
			.replace(/alt='[^']*'/gi, '');

		// 处理src，补全或替换为baseUrl
		imgTag = imgTag.replace(/src\s*=\s*(['"]?)([^'"\s>]+)\1/gi, function(srcMatch, quote, srcValue) {
			let newSrc = srcValue;
			try {
				let base = new URL(baseUrl);
				let srcUrl;
				if (/^https?:\/\//i.test(srcValue)) {
					srcUrl = new URL(srcValue);
					if (
						srcUrl.protocol !== base.protocol ||
						srcUrl.host !== base.host ||
						!srcUrl.pathname.startsWith(base.pathname)
					) {
						// 保留原始路径
						newSrc = base.origin + base.pathname.replace(/\/$/, '') + srcUrl.pathname + (
							srcUrl.search || '') + (srcUrl.hash || '');
					}
				} else if (srcValue.startsWith('/')) {
					newSrc = srcValue;
				} else {
					newSrc = srcValue;
				}
			} catch (e) {
				// fallback: 直接拼接
				if (srcValue.startsWith('/')) {
					newSrc = srcValue;
				} else {
					newSrc = srcValue;
				}
			}
			return `src=${quote}${newSrc}${quote}`;
		});

		// 如果没有src属性，补全src
		if (!/src\s*=/.test(imgTag)) {
			imgTag = imgTag.replace(/<img/i, `<img src="${baseUrl}/"`);
		}

		// 添加style属性
		imgTag = imgTag.replace(/<img/i,
			'<img style="max-width:100%;height:auto;display:block;margin-top:0;margin-bottom:0;"');
		return imgTag;
	});

	// 去掉<br/>标签
	// newContent = newContent.replace(/<br\s*\/?>/gi, '');
	return newContent;
}

export function getFirstTextTagWithEllipsis(html) {
	// 匹配第一个文本标签（如<p>、<span>、<div>等）
	const tagMatch = html.match(/<(p|span|div)[^>]*>[\s\S]*?<\/\1>/i);
	if (!tagMatch) return '';
	// 提取标签名
	const tagName = tagMatch[1];
	// 提取标签内容
	const contentMatch = tagMatch[0].match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
	let content = contentMatch ? contentMatch[1] : '';
	// 去掉所有HTML标签，只保留纯文本
	content = content.replace(/<[^>]+>/g, '');
	// 构造带样式的新标签
	return `<${tagName} style="display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${content}</${tagName}>`;
}


function formatImgSrc(url) {
	var str = new RegExp("http");
	if (str.test(url) || url == '') {
		var str1 = "https://obs-xhlj.obs.cn-east-3.myhuaweicloud.com"
		var str2 = "https://img2023.gcsis.cn"
		var str3 = new RegExp(str1)
		if (str.test(url)) {
			return url.replace(str1, str2);
		} else {
			return url;
		}
	} else return baseUrl + url
}

export function showMessage(theme, content, duration = 1500) {
	uni.showToast({
		title: content,
		icon: 'none',
		duration
	})
	// if (Message[theme]) {
	// 	Message[theme]({
	// 		offset: [10, 16],
	// 		content,
	// 		duration,
	// 		icon: true,
	// 		zIndex: 99999,
	// 	});
	// }
}

export function getImToken(userId) {
	imListApi(userId).then(res => {
		uni.setStorageSync('imToken', res.data.token)
	})
}