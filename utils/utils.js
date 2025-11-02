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
	// 匹配所有 <p>、<span>、<div> 标签（全局匹配，保留标签名和内容）
	const tagReg = /<(p|span|div)[^>]*>[\s\S]*?<\/\1>/gi;
	let match;
	let validTag = null;

	// 遍历所有匹配的标签，寻找第一个非空内容的标签
	while ((match = tagReg.exec(html)) !== null) {
		const fullTag = match[0]; // 完整标签（如 <p><br></p>）
		const tagName = match[1]; // 标签名（p/span/div）

		// 提取标签内的内容
		const contentMatch = fullTag.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
		let content = contentMatch ? contentMatch[1] : '';

		// 去除内容中的 HTML 标签（包括 <br> 等）
		content = content.replace(/<[^>]+>/g, '').trim(); // 同时去除首尾空格

		// 如果内容非空，说明找到有效标签，退出循环
		if (content) {
			validTag = {
				fullTag,
				tagName,
				content
			};
			break;
		}
	}

	// 若没有找到有效标签，返回空
	if (!validTag) return '';

	// 构造带省略号样式的新标签
	return `<${validTag.tagName} style="display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${validTag.content}</${validTag.tagName}>`;
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

/**
 * 富文本转纯字符串（移除所有HTML标签）
 * @param {string} html - 输入的富文本字符串
 * @returns {string} 处理后的纯文本
 */
export function htmlToPlainText(html) {
	// 1. 空值处理：避免传入null/undefined导致报错
	if (!html || typeof html !== 'string') return '';

	// 2. 处理特殊HTML实体（如&nbsp;→空格，&lt;→<等）
	const entityMap = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&apos;': "'",
		'&nbsp;': ' ',
		'&copy;': '©',
		'&reg;': '®'
	};
	let plainText = html.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
		return entityMap[match] || match; // 未匹配到的实体保留原字符
	});

	// 3. 移除所有HTML标签（包括自闭合标签，如<br/>、<img/>）
	plainText = plainText.replace(/<\/?[a-zA-Z0-9]+(\s+[a-zA-Z0-9-]+="[^"]*")*\/?>/g, '');

	// 4. 清理多余空格和换行（保留合理的文本结构）
	plainText = plainText
		.replace(/\s+/g, ' ') // 多个空格/换行/制表符→单个空格
		.replace(/^\s+|\s+$/g, ''); // 移除首尾空格

	return plainText;
}