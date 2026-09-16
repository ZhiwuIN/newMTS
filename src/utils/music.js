const audioMap = {};

function stopAudio(key) {
	const audio = audioMap[key];

	if (!audio) {
		return;
	}

	audio.stop();
	audio.destroy();
	delete audioMap[key];
}

function playAudio(key, src) {
	stopAudio(key);

	const innerAudioContext = uni.createInnerAudioContext();
	audioMap[key] = innerAudioContext;

	innerAudioContext.autoplay = true;
	innerAudioContext.src = src;

	innerAudioContext.onPlay(() => {
		console.log('开始播放');
	});

	innerAudioContext.onEnded(() => {
		if (audioMap[key] === innerAudioContext) {
			innerAudioContext.destroy();
			delete audioMap[key];
		}
	});

	innerAudioContext.onError((res) => {
		console.log(res.errMsg);
		console.log(res.errCode);

		if (audioMap[key] === innerAudioContext) {
			innerAudioContext.destroy();
			delete audioMap[key];
		}
	});

	return innerAudioContext;
}

var music = {
	// 洗牌音效
	play_shuffle: function () {
		return playAudio('shuffle', '/static/lottery/shuffle.mp3');
	},
	stop_shuffle: function () {
		stopAudio('shuffle');
	},

	// 中奖音效
	play_winner: function () {
		return playAudio('winner', '/static/lottery/winner.mp3');
	},
	stop_winner: function () {
		stopAudio('winner');
	},

	// 翻卡音效
	play_overturn: function () {
		return playAudio('overturn', '/static/lottery/overturn.mp3');
	},
	stop_overturn: function () {
		stopAudio('overturn');
	},

	// 树叶摆动音效
	play_leaf: function () {
		return playAudio('leaf', '/static/WishTree/leaf.mp3');
	},
	stop_leaf: function () {
		stopAudio('leaf');
	},

	// 金币掉落音效
	play_goldCoinsDrop: function () {
		return playAudio('goldCoinsDrop', '/static/WishTree/goldCoinsDrop.mp3');
	},
	stop_goldCoinsDrop: function () {
		stopAudio('goldCoinsDrop');
	},

	// 开福袋音效
	play_luckyBag: function () {
		return playAudio('luckyBag', '/static/bigBag/luckyBag.mp3');
	},
	stop_luckyBag: function () {
		stopAudio('luckyBag');
	},

	stop_all: function () {
		Object.keys(audioMap).forEach((key) => {
			stopAudio(key);
		});
	}
}

export default music;
