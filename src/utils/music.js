var music = {
	// 洗牌音效
	play_shuffle: function () {
		const innerAudioContext = uni.createInnerAudioContext();
		innerAudioContext.autoplay = true;
		innerAudioContext.src = '/static/lottery/shuffle.mp3';
		innerAudioContext.onPlay(() => {
			console.log('开始播放');
		});
		innerAudioContext.onError((res) => {
			console.log(res.errMsg);
			console.log(res.errCode);
		});
	},
	// 中奖音效
	play_winner: function () {
		const innerAudioContext = uni.createInnerAudioContext();
		innerAudioContext.autoplay = true;
		innerAudioContext.src = '/static/lottery/winner.mp3';
		innerAudioContext.onPlay(() => {
			console.log('开始播放');
		});
		innerAudioContext.onError((res) => {
			console.log(res.errMsg);
			console.log(res.errCode);
		});
	},
	// 翻卡音效
	play_overturn: function () {
		const innerAudioContext = uni.createInnerAudioContext();
		innerAudioContext.autoplay = true;
		innerAudioContext.src = '/static/lottery/overturn.mp3';
		innerAudioContext.onPlay(() => {
			console.log('开始播放');
		});
		innerAudioContext.onError((res) => {
			console.log(res.errMsg);
			console.log(res.errCode);
		});
	},
}

// 改用 ES6 默认导出
export default music;