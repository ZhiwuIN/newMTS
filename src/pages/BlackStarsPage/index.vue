<template>
    <customnavbar :title="'Black Stars'" @mtop="mtop" :isBlackStars="true"
        backgroundStr="url('/static/BlackStars/bgi.png') top left/100% no-repeat" :whiteTitle="true">
        <view class="black-stars-page" :style="topStyle2">
            <view class="hero">
                <image src="/static/BlackStars/bgi.png" class="hero-bg" mode="widthFix"></image>
                <view class="hero-copy">
                    <view class="tag">2026 WORLD CUP SPECIAL</view>
                    <view class="hero-title">Black Star Sprint</view>
                    <view class="hero-title">Crowned in Glory</view>
                    <view class="hero-desc">Black Stars rise, CWPC unites. Success begins together.</view>
                </view>

                <view class="countdown">
                    <view class="count-title">Countdown to the Event</view>
                    <view class="count-grid">
                        <view class="count-box" v-for="item in countdownList" :key="item.label">
                            <view class="count-num">{{ item.value }}</view>
                            <view class="count-label">{{ item.label }}</view>
                        </view>
                    </view>
                    <view class="members">
                        <text>New Team Members</text>
                        <text class="members-num">{{ currentTeamCount }}</text>
                        <text>members</text>
                    </view>
                </view>
            </view>

            <view class="main">
                <view class="card progress-card">
                    <view class="card-title center">World Cup Reward Progress</view>
                    <view class="next">The Next Stage: <text>{{ nextMemberCount }}</text> members</view>
                    <view class="track-labels">
                        <text v-for="item in rewards" :key="item.members">{{ item.members }}</text>
                    </view>
                    <view class="track">
                        <view class="track-active" :style="{ width: progressWidth }"></view>
                        <view class="track-node" v-for="(item, index) in rewards" :key="item.members"
                            :class="{ active: currentTeamCount >= item.members }">
                            <image
                                :src="canClaimReward(item) ? '/static/BlackStars/football_a.png' : '/static/BlackStars/football.png'"
                                mode="aspectFit"></image>
                        </view>
                    </view>
                    <view class="reward-icons">
                        <view class="reward-icon" v-for="(item, index) in rewards" :key="item.name">
                            <image :src="item.image" mode="aspectFit"></image>
                            <view class="mini-status" v-if="canClaimReward(item)" @click="handleRewardClick(item)">
                                Unlocked
                            </view>
                        </view>
                    </view>
                </view>

                <view class="card team-card">
                    <image src="/static/BlackStars/box_bgi_1.png" class="team-bg" mode="widthFix"></image>
                    <view class="team-content">
                        <view class="team-title">Add ABC official members</view>
                        <view class="team-count">{{ currentTeamCount }}</view>
                        <view class="team-stats">
                            <view class="team-stat">
                                <view class="stat-num">{{ currentLv1Percent }}%</view>
                                <view class="stat-text">Proportion of Lv1 members</view>
                            </view>
                            <view class="team-stat">
                                <view class="stat-num">{{ reachedTier }}</view>
                                <view class="stat-text">The gear has been reached</view>
                            </view>
                            <view class="team-stat">
                                <view class="stat-num">{{ nextMemberCount }}</view>
                                <view class="stat-text">The next level is still lacking</view>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="block-head">
                    <view class="block-title">Luxury Reward Tiers</view>
                    <view class="block-desc">Final reward is based on the highest tier reached by the campaign end. One
                        reward per participant.</view>
                </view>

                <view class="tier-card" v-for="item in rewards" :key="item.name">
                    <view class="tier-info">
                        <view class="tier-price">{{ item.price }}</view>
                        <view class="tier-name">{{ item.name }}</view>
                        <view class="tier-desc">{{ item.members }} new members added to the team</view>
                        <view class="unlock-btn" :class="{ locked: !canClaimReward(item) }"
                            @click="handleRewardClick(item)">
                            {{ canClaimReward(item) ? 'Unlocked' : 'Not unlocked' }}
                        </view>
                    </view>
                    <image :src="item.image" class="tier-img" mode="aspectFit"></image>
                </view>

                <view class="block-title legend-title">Black Star Legend Award</view>
                <view class="card image-card">
                    <image src="/static/BlackStars/badge.png" class="badge-img" mode="widthFix"></image>
                    <view class="copy">Leaders who guide their teams to the 3,500-member growth target will receive the
                        lifetime "Black Star Legend Award," a custom headquarters commemorative badge, and a place in
                        CWPC global development history.</view>
                </view>

                <view class="block-title apparel-title">CWPC × African Black Stars Commemorative Apparel</view>
                <view class="card image-card apparel-card">
                    <image src="/static/BlackStars/clothing.png" class="clothing-img" mode="widthFix"></image>
                    <view class="copy">The co-branded T-shirt will become the official company uniform for training
                        sessions, charity events, and offline activities.</view>
                </view>

                <!-- <view class="block-title leaderboard-title">Team Leaderboard</view>
                <view class="card leaderboard-card">
                    <view class="leader-top">
                        <view class="leader-podium" v-for="item in topThreeRankList" :key="item.rank"
                            :class="[`rank-${item.rank}`, { empty: item.empty }]">
                            <view class="leader-avatar-box">
                                <image class="leader-avatar" :src="item.avatar" mode="aspectFill"></image>
                                <image class="leader-frame" :src="item.frame" mode="aspectFit"></image>
                            </view>
                            <view class="leader-name">{{ maskRankName(item.name) }}</view>
                            <view class="leader-score">{{ item.empty ? 'Waiting' : item.count }}</view>
                            <view class="leader-members" v-if="item.rank === 1 && !item.empty">Members</view>
                        </view>
                    </view>

                    <view class="leader-list">
                        <view class="leader-row" v-for="item in restRankList" :key="item.rank">
                            <view class="row-rank">{{ formatRank(item.rank) }}</view>
                            <image class="row-avatar" :src="item.avatar" mode="aspectFill"></image>
                            <view class="row-name">{{ maskRankName(item.name) }}</view>
                            <view class="row-score">{{ item.empty ? 'Waiting' : item.count }}</view>
                        </view>
                        <view class="leader-row mine">
                            <view class="row-rank">{{ myRankInfo.rankText }}</view>
                            <image class="row-avatar" :src="myRankInfo.avatar" mode="aspectFill"></image>
                            <view class="row-name">ME</view>
                            <view class="row-score">{{ myRankInfo.empty ? 'Waiting' : myRankInfo.teamCount }}</view>
                        </view>
                    </view>
                </view> -->
            </view>
        </view>
        <view class="reward-modal-mask" v-if="rewardModal.visible" @click="closeRewardModal">
            <view class="reward-modal" @click.stop>
                <view class="reward-modal-title">Notice</view>
                <view class="reward-modal-content">{{ rewardModal.content }}</view>
                <view class="reward-modal-btn" @click="closeRewardModal">OK</view>
            </view>
        </view>
    </customnavbar>
</template>

<script>
import customnavbar from '@/component/custom-navbar/custom-navbar.vue'
import {
    activityTeamApi,
    activityTeamClaimApi,
    activityTeamRankApi
} from '@/common/api/BlackStars.js'
export default {
    components: {
        customnavbar,
        ruleDescription: ''
    },
    data() {
        return {
            info: {
                teamCount: 0,
                lv1TeamPercent: 0
            },
            topStyle2: '',
            memberCount: 0,
            eventTime: 0,
            timer: null,
            countdownList: [
                { label: 'Days', value: '00' },
                { label: 'Hours', value: '00' },
                { label: 'Minutes', value: '00' },
                { label: 'Seconds', value: '00' }
            ],
            rewardModal: {
                visible: false,
                content: ''
            },
            rankList: [],
            myRank: null,
            rewards: [
                { members: 500, price: '23000GHS', name: 'Honda Motorcycle', image: '/static/BlackStars/car1.png' },
                { members: 1000, price: '150000GHS', name: 'Toyota Hilux Pickup', image: '/static/BlackStars/car2.png' },
                { members: 2000, price: '588000GHS', name: 'Mercedes-Benz GLB SUV', image: '/static/BlackStars/car3.png' },
                { members: 3500, price: '1200000GHS', name: 'Mercedes-Benz GLE SUV', image: '/static/BlackStars/car4.png' }
            ]
        }
    },
    computed: {
        nextMemberCount() {
            const next = this.rewards.find(item => this.currentTeamCount < item.members)
            return next ? next.members - this.currentTeamCount : 0
        },
        progressWidth() {
            const max = this.rewards[this.rewards.length - 1].members
            return `${Math.min(this.currentTeamCount / max * 100, 100)}%`
        },
        currentTeamCount() {
            return Number(this.info?.teamCount ?? this.memberCount) || 0
        },
        currentLv1Percent() {
            return Number(this.info?.lv1TeamPercent) || 0
        },
        reachedTier() {
            const reached = this.rewards.filter(item => this.currentTeamCount >= item.members)
            return reached.length ? reached[reached.length - 1].members : 0
        },
        normalizedRankList() {
            return this.rankList.slice(0, 5).map((item, index) => this.normalizeRankItem(item, index + 1))
        },
        rankSlots() {
            return [1, 2, 3, 4, 5].map(rank => {
                return this.normalizedRankList.find(item => Number(item.rank) === rank) || this.createEmptyRank(rank)
            })
        },
        topThreeRankList() {
            return [this.rankSlots[1], this.rankSlots[0], this.rankSlots[2]]
        },
        restRankList() {
            return this.rankSlots.slice(3, 5)
        },
        myRankInfo() {
            return this.myRank ? this.normalizeRankItem(this.myRank, this.myRank.rank || this.myRank.ranking || 'ME') : this.createEmptyRank('ME')
        }
    },
    methods: {
        mtop(e) {
            // #ifdef H5
            this.topStyle2 = `min-height:calc(100vh - ${e - 88.1}rpx);`
            // #endif
            // #ifdef APP-PLUS
            this.topStyle2 = `min-height:calc(100vh);`
            // #endif
        },
        setEventTime(endTime) {
            const eventTime = this.parseGhanaTime(endTime)
            if (!eventTime) return
            this.eventTime = eventTime
            this.updateCountdown()
        },
        parseGhanaTime(time) {
            if (!time) return 0
            const timeText = String(time).trim()
            const match = timeText.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
            if (!match) return 0
            const [, year, month, day, hour = '00', minute = '00', second = '00'] = match
            return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
        },
        updateCountdown() {
            if (!this.eventTime) return
            const distance = Math.max(this.eventTime - Date.now(), 0)
            const days = Math.floor(distance / (24 * 60 * 60 * 1000))
            const hours = Math.floor(distance / (60 * 60 * 1000) % 24)
            const minutes = Math.floor(distance / (60 * 1000) % 60)
            const seconds = Math.floor(distance / 1000 % 60)
            this.countdownList = [
                { label: 'Days', value: this.formatTime(days) },
                { label: 'Hours', value: this.formatTime(hours) },
                { label: 'Minutes', value: this.formatTime(minutes) },
                { label: 'Seconds', value: this.formatTime(seconds) }
            ]
        },
        formatTime(value) {
            return String(value).padStart(2, '0')
        },
        canClaimReward(item) {
            return this.currentTeamCount >= item.members && this.currentLv1Percent <= 60
        },
        handleRewardClick(item) {
            this.rewardModal = {
                visible: true,
                content: this.canClaimReward(item) ? 'Please contact your agent manager.' : 'This prize is not unlocked.'
            }
            if (this.canClaimReward(item)) {
                activityTeamClaimApi({
                    rewardStage: item.members
                })
            }
        },
        closeRewardModal() {
            this.rewardModal.visible = false
        },
        normalizeRankItem(item, defaultRank) {
            const rank = item?.rank ?? item?.ranking ?? item?.sort ?? defaultRank
            const teamCount = item?.teamCount ?? item?.count ?? item?.memberCount ?? item?.score ?? 0
            return {
                rank,
                rankText: item?.myRankText || item?.rankText || this.formatRank(rank),
                name: item?.name || item?.nickname || item?.username || item?.userName || 'NAME',
                avatar: item?.avatar || item?.avatarUrl || item?.headImg || item?.image || '/static/default-avatar.png',
                count: teamCount,
                teamCount,
                frame: this.getRankFrame(rank),
                empty: false
            }
        },
        createEmptyRank(rank) {
            return {
                rank,
                rankText: this.formatRank(rank),
                name: rank === 'ME' ? 'ME' : 'Waiting',
                avatar: '/static/default-avatar.png',
                count: 0,
                teamCount: 0,
                frame: this.getRankFrame(rank),
                empty: true
            }
        },
        getRankFrame(rank) {
            const rankNumber = Number(rank)
            return rankNumber >= 1 && rankNumber <= 3 ? `/static/BlackStars/ranking${rankNumber}.png` : ''
        },
        formatRank(rank) {
            if (rank === 'ME') return 'ME'
            const value = Number(rank)
            return Number.isNaN(value) ? rank : String(value).padStart(2, '0')
        },
        maskRankName(name) {
            const text = String(name || '')
            if (text === 'Waiting') return text
            const digits = text.replace(/\D/g, '')
            if (digits.length >= 7 && /^\+?[\d\s-]{7,}$/.test(text)) {
                return `${digits.slice(0, 3)}****${digits.slice(-4)}`
            }
            if (text.length <= 2) return text
            if (text.length <= 4) return `${text.slice(0, 1)}**${text.slice(-1)}`
            return `${text.slice(0, 2)}****${text.slice(-2)}`
        },
        setRankData(data) {
            if (Array.isArray(data)) {
                this.rankList = data
                this.myRank = null
                return
            }
            this.rankList = data?.list || data?.topList || data?.rankList || data?.records || []
            this.myRank = data?.myRankInfo ? {
                ...data.myRankInfo,
                myRankText: data.myRankText || data.myRank
            } : (data?.my || data?.mine || data?.myRank || null)
        }
    },
    onLoad() {
        this.timer = setInterval(this.updateCountdown, 1000)
    },
    onShow() {
        activityTeamApi().then(res => {
            this.info = res.data
            uni.setStorageSync('BlackStarsRuleDescription', res.data.ruleDescription)
            this.setEventTime(this.info?.endTime)
        })
        activityTeamRankApi().then(res => {
            this.setRankData(res.data)
        })
    },
    onUnload() {
        if (this.timer) {
            clearInterval(this.timer)
        }
    }
}
</script>

<style lang="scss" scoped>
.black-stars-page {
    background: #000000;
    color: #FFFFFF;
    overflow: hidden;
    margin-top: -4rpx;
}

.hero {
    position: relative;
    min-height: 940rpx;
}

.hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.hero-copy {
    position: relative;
    z-index: 1;
    padding: 180rpx 36rpx 0;
    text-align: center;
}

.tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30rpx;
    padding: 0 30rpx;
    border-radius: 999rpx;
    background: #F7D978;
    font-size: 24rpx;
    line-height: 30rpx;
    font-weight: 800;
    color: #0A0A0A;
    margin-bottom: 12rpx;
}

.hero-title {
    font-size: 48rpx;
    line-height: 58rpx;
    font-weight: 900;
    text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, .6);
}

.hero-title:first-of-type {
    margin-top: 10rpx;
}

.hero-desc {
    width: 460rpx;
    margin: 12rpx auto 0;
    font-size: 24rpx;
    line-height: 30rpx;
    color: rgba(255, 255, 255, .82);
}

.countdown {
    position: absolute;
    left: 28rpx;
    right: 28rpx;
    bottom: -62rpx;
    z-index: 2;
    text-align: center;
}

.count-title {
    margin-bottom: 20rpx;
    font-size: 26rpx;
    font-weight: 800;
    color: #F6D66D;
}

.count-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10rpx;
}

.count-box {
    height: 110rpx;
    border: 1rpx solid #F6D66D;
    border-radius: 14rpx;
    background: rgba(0, 0, 0, .72);
}

.count-num {
    padding-top: 16rpx;
    font-size: 36rpx;
    line-height: 38rpx;
    font-weight: 900;
    color: #DFBB61;
    margin-bottom: 8rpx;
}

.count-label {
    font-size: 26rpx;
    line-height: 26rpx;
    color: #DFBB61;
}

.members {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    height: 58rpx;
    font-size: 26rpx;
    color: rgba(255, 255, 255, .86);
    margin-top: 14rpx;
}

.members-num {
    font-size: 34rpx;
    font-weight: 900;
    color: #FF7B29;
}

.main {
    position: relative;
    z-index: 3;
    padding: 0 28rpx 54rpx;
    margin-top: 82rpx;
}

.card,
.tier-card {
    border: 1rpx solid #F4CC48;
    border-radius: 16rpx;
    background: #050505;
    overflow: hidden;
}

.progress-card {
    padding: 22rpx 24rpx 18rpx;
    padding-bottom: 32rpx;
}

.card-title {
    font-size: 36rpx;
    line-height: 40rpx;
    font-weight: 900;
    color: #DFBB61;
}

.center {
    text-align: center;
}

.next {
    margin-top: 12rpx;
    text-align: center;
    font-size: 26rpx;
    color: #DFBB61;
}

.next text {
    font-size: 28rpx;
    font-weight: 900;
    color: #FF7B29;
}

.track-labels {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-top: 20rpx;
    padding: 0 28rpx;
    font-size: 26rpx;
    text-align: center;
    color: #F6D66D;
}

.track {
    position: relative;
    height: 14rpx;
    margin: 28rpx 28rpx 0;
    border-radius: 999rpx;
    background: #555555;
}

.track-active {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(90deg, #FFC400, #F6D66D);
}

.track-node {
    position: absolute;
    top: 50%;
    width: 80rpx;
    height: 80rpx;
    transform: translate(-50%, -50%);
}

.track-node:nth-child(2) {
    left: 12.5%;
}

.track-node:nth-child(3) {
    left: 37.5%;
}

.track-node:nth-child(4) {
    left: 62.5%;
}

.track-node:nth-child(5) {
    left: 87.5%;
}

.track-node image {
    width: 100%;
    height: 100%;
}

.reward-icons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8rpx;
    margin-top: 26rpx;
    padding: 0 22rpx;
}

.reward-icon {
    position: relative;
    height: 88rpx;
}

.reward-icon image {
    width: 100%;
    height: 102rpx;
}

.mini-status {
    position: absolute;
    left: 0;
    bottom: -8rpx;
    padding: 3rpx 12rpx;
    border-radius: 999rpx;
    background: #DFBB61;
    font-size: 24rpx;
    line-height: 24rpx;
    font-weight: 800;
    color: #000000;
}

.mini-status.locked {
    background: #6F6F6F;
    color: #D8D8D8;
}

.team-card {
    position: relative;
    // height: 236rpx;
    margin-top: 24rpx;
}

.team-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

.team-content {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 32rpx 28rpx;
}

.team-title {
    font-size: 24rpx;
    color: #FFFFFF;
}

.team-count {
    margin-top: 12rpx;
    font-family: 'Abril Fatface';
    font-size: 36rpx;
    font-weight: 900;
    color: #FFFFFF;
    line-height: 36rpx;
}

.team-stats {
    // position: absolute;
    // left: 24rpx;
    // right: 24rpx;
    // bottom: 18rpx;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22rpx;
    margin-top: 66rpx;
}

.stat-num {
    font-family: Abril Fatface;
    font-size: 36rpx;
    line-height: 34rpx;
    font-weight: 900;
    color: #FFFFFF;
}

.stat-text {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 32rpx;
    color: #FFFFFF;
}

.block-head {
    margin-top: 32rpx;
}

.block-title {
    font-size: 32rpx;
    line-height: 36rpx;
    font-weight: 900;
    color: #FFFFFF;
}

.block-desc {
    width: 620rpx;
    margin-top: 16rpx;
    margin-bottom: 40rpx;
    font-size: 24rpx;
    line-height: 30rpx;
    color: rgba(255, 255, 255, .86);
}

.tier-card {
    position: relative;
    height: 156rpx;
    margin-top: 20rpx;
    padding: 22rpx 24rpx;
}

.tier-info {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: start;
    height: 100%;
}

.tier-price {
    font-size: 28rpx;
    line-height: 28rpx;
    font-weight: 500;
    color: #FFB84E;
    margin-bottom: 6rpx;
}

.tier-name {
    margin-top: 4rpx;
    font-size: 30rpx;
    line-height: 38rpx;
    font-weight: 900;
    color: #FFFFFF;
}

.tier-desc {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 24rpx;
    color: rgba(255, 255, 255, .9);
}

.unlock-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 112rpx;
    height: 34rpx;
    margin-top: 12rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    background: #FFAA00;
    font-size: 24rpx;
    font-weight: 900;
    color: #000000;
}

.unlock-btn.locked {
    background: #6F6F6F;
    color: #D8D8D8;
}

.tier-img {
    position: absolute;
    right: -24rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 300rpx;
    height: 188rpx;
}

.legend-title,
.apparel-title {
    margin-top: 34rpx;
}

.image-card {
    margin-top: 18rpx;
    padding: 22rpx;
}

.badge-img {
    display: block;
    width: 500rpx;
    margin: 0 auto;
}

.clothing-img {
    display: block;
    width: 100%;
    border-radius: 8rpx;
}

.copy {
    margin-top: 22rpx;
    font-size: 24rpx;
    line-height: 30rpx;
    color: #FFFFFF;
}

.apparel-card {
    padding: 0 0 24rpx;
}

.apparel-card .copy {
    padding: 0 22rpx;
}

.leaderboard-title {
    margin-top: 34rpx;
}

.leaderboard-card {
    margin-top: 18rpx;
    padding: 28rpx 22rpx 26rpx;
    background: linear-gradient(180deg, rgba(0, 0, 0, .2), rgba(0, 0, 0, .28)), url('/static/BlackStars/ballPark.png') center bottom/cover no-repeat;
}

.leader-top {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: end;
    gap: 18rpx;
}

.leader-podium {
    position: relative;
    min-height: 244rpx;
    padding: 16rpx 10rpx 14rpx;
    border: 1rpx solid rgba(244, 204, 72, .78);
    border-radius: 14rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, .08), rgba(0, 0, 0, .88));
    text-align: center;
    overflow: hidden;
}

.leader-podium.rank-1 {
    min-height: 282rpx;
    border-color: #DFBB61;
    box-shadow: 0 0 26rpx rgba(255, 196, 0, .22);

    .leader-name {
        color: #DFBB61;
    }
}

.leader-podium.rank-2 {
    border-color: rgba(255, 255, 255, .78);

    .leader-score {
        color: #FFFFFF;
        font-size: 32rpx;
        font-weight: 500;
    }
}

.leader-podium.rank-3 {
    border-color: #DF7661;

    .leader-name {
        color: #DF7661;
    }

    .leader-score {
        color: #DF7661;
        font-size: 32rpx;
        font-weight: 500;
    }
}

.leader-podium.empty {
    opacity: .78;
}

.leader-medal {
    position: absolute;
    left: 10rpx;
    top: 8rpx;
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    background: #DFBB61;
    font-size: 18rpx;
    line-height: 30rpx;
    font-weight: 900;
    color: #000000;
}

.leader-avatar-box {
    position: relative;
    width: 134rpx;
    height: 134rpx;
    margin: 0 auto;
}

.rank-1 .leader-avatar-box {
    width: 138rpx;
    height: 138rpx;
}

.leader-avatar {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: #1B1B1B;
}

.rank-1 .leader-avatar {
    width: 86rpx;
    height: 86rpx;
}

.leader-frame {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}

.leader-name {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 30rpx;
    color: #FFFFFF;
}

.leader-score {
    margin-top: 6rpx;
    font-size: 34rpx;
    line-height: 40rpx;
    font-weight: 500;
    color: #DFBB61;
}

.rank-1 .leader-score {
    font-size: 44rpx;
    line-height: 50rpx;
}

.leader-members {
    font-size: 22rpx;
    line-height: 26rpx;
    color: #DFBB61;
}

.leader-podium.empty .leader-name,
.leader-podium.empty .leader-score {
    color: rgba(223, 187, 97, .78);
}

.leader-list {
    margin-top: 26rpx;
}

.leader-row {
    display: flex;
    align-items: center;
    height: 110rpx;
    margin-top: 22rpx;
    padding: 0 16rpx;
    border: 1rpx solid rgba(244, 204, 72, .72);
    border-radius: 10rpx;
    background: linear-gradient(90deg, rgba(223, 187, 97, .22), rgba(0, 0, 0, .66));
}

.leader-row.mine {
    background: linear-gradient(90deg, rgba(255, 196, 0, .28), rgba(10, 8, 3, .92));
}

.row-rank {
    width: 62rpx;
    font-size: 28rpx;
    font-weight: 800;
    color: #DFBB61;
}

.row-avatar {
    width: 76rpx;
    height: 76rpx;
    margin-right: 18rpx;
    border-radius: 50%;
    background: #1B1B1B;
}

.row-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 28rpx;
    font-weight: 500;
    color: #FFFFFF;
    color: #DFBB61;
}

.row-score {
    margin-left: 16rpx;
    font-size: 40rpx;
    font-weight: 500;
    color: #DFBB61;
}

.reward-modal-mask {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 54rpx;
    background: rgba(0, 0, 0, .72);
}

.reward-modal {
    width: 100%;
    padding: 34rpx 30rpx 28rpx;
    border: 1rpx solid #DFBB61;
    border-radius: 20rpx;
    background: linear-gradient(180deg, #15110A 0%, #050505 100%);
    box-shadow: 0 18rpx 60rpx rgba(0, 0, 0, .55), inset 0 1rpx 0 rgba(255, 255, 255, .12);
    text-align: center;
}

.reward-modal-title {
    font-size: 34rpx;
    line-height: 42rpx;
    font-weight: 900;
    color: #DFBB61;
}

.reward-modal-content {
    margin-top: 22rpx;
    font-size: 26rpx;
    line-height: 36rpx;
    color: #FFFFFF;
}

.reward-modal-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70rpx;
    margin-top: 34rpx;
    border-radius: 999rpx;
    background: linear-gradient(90deg, #DFBB61 0%, #FFC400 100%);
    font-size: 28rpx;
    font-weight: 900;
    color: #000000;
}
</style>
