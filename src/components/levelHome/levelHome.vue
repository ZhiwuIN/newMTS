<template>
  <view class="level-page">
    <view class="hero">
      <view class="hero-copy">
        <text class="big-level">{{ userLevelName }}</text>
        <text class="hero-title">{{ $t('levelPage.myCurrentLevel') }}</text>
        <text class="hero-desc">{{ $t('levelPage.heroDescription') }}</text>
      </view>
      <image class="hero-art1" mode="heightFix" v-if="levelList[activeIndex]?.image"
        :src="levelList[activeIndex]?.image" />
      <image class="hero-art" v-else src="/static/level/suspension_img.png" />
    </view>

    <scroll-view class="level-tabs" :class="{ 'is-dragging': tabsDragging }" scroll-x
      :scroll-into-view="scrollIntoId" scroll-with-animation @mousedown="startTabsDrag">
      <view v-for="(item, index) in tabs" :id="`level-tab-${index}`" :key="item.code" class="level-tab"
        :class="{ active: index === activeIndex }" @click="selectLevel(item.code, index)">
        <text>{{ item.name }}</text><text v-if="index === activeIndex" class="now">{{ $t('levelPage.now') }}</text>
      </view>
    </scroll-view>

    <view class="content">
      <view class="panel">
        <view class="panel-head"><text>{{ $t('levelPage.levelBenefits') }}</text><text class="muted">{{ levelName }} {{
          $t('levelPage.benefits') }}</text></view>
        <view class="benefit-grid" v-if="showBenefitGrid">
          <view v-for="(item, index) in benefits" :key="item.value" class="benefit-item">
            <image class="benefit-icon" :src='`/static/level/benefit_icon${index + 1}.png`' mode="" />
            <text class="benefit-value">{{ item.value }}</text>
            <text class="benefit-label">{{ item.label }}</text>
          </view>
        </view>
        <view class="upgrade-card" v-if="showUpgradeCard">
          <view class="upgrade-meta"><text>{{ $t('levelPage.oneTimeActivation') }}</text><text>{{ $t('levelPage.reward')
              }}</text></view>
          <view class="upgrade-title">
            <view class="title_left">{{ $t('levelPage.upgrade') }} {{ userLevelName }} -> {{ upgradeLevelName }}</view>
            <text>{{ amountText }} {{ currency }}</text>
          </view>
          <view class="reward-grid">
            <view v-for="item in upgradeBenefits" :key="item.label" class="reward-item">
              <text>{{ item.label }}</text>
              <strong class="number">{{ item.value }}</strong>
              <view class="lvse">{{ item.desc }}</view>
            </view>
          </view>
          <button class="upgrade-btn" @click="handleJoin">{{ $t('levelPage.upgradeTo') }} {{ upgradeLevelName
            }}</button>
        </view>
        <view v-if="activeIndex < userLevelIndex" class="upgrade-btn_none">{{ $t('levelPage.higherLevelUnlocked') }}
        </view>
      </view>

      <view v-for="block in commissionBlocks" :key="block.title" class="panel commission-panel">
        <text class="section-title">{{ block.title }}</text>
        <text class="section-desc">{{ block.desc }}</text>
        <view v-for="row in getCommissionRows(block)" :key="row.name" class="commission-row">
          <image class="brand" :src="row.image" mode="aspectFit" />
          <view class="commission-copy"><strong>{{ row.name }}-level member {{ block.order ?
            $t('levelPage.completesDailyOrders') :
            `${$t('levelPage.activates')} ${levelName}` }}</strong><text>{{ $t('levelPage.directTeamReward') }}</text>
          </view>
          <view class="commission-rate"><strong>{{ row.rate }}</strong><text>{{ row.amount }}</text></view>
        </view>
      </view>

      <!-- <view class="panel daily-panel"><text class="section-title">How daily rewards work</text></view> -->
    </view>

    <uni-popup ref="buyPopup" type="center" style="z-index: 999;">
      <view class="popup"><text class="popup-title">{{ $t('levelPage.prompt') }}</text><text class="popup-text">{{
        $t('levelPage.confirmPurchase') }} {{ upgradeLevelName }} {{ $t('levelPage.for') }} {{ amountText
          }} {{ currency }} ?</text>
        <view class="popup-actions"><button @click="cancel">{{ $t('levelPage.cancel') }}</button><button class="confirm"
            @click="confirm">{{ $t('levelPage.sure') }}</button></view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { userInfoApi } from '@/common/api/users.js';
import { vipInfoApi, buyApi } from '@/common/api/level.js';

export default {
  data() {
    return {
      userInfo: {},
      levelList: [],
      selectedLevelCode: '',
      scrollIntoId: '',
      isLoading: false,
      currency: '',
      tabsDragging: false,
      tabsDragMoved: false,
      tabsDragStartX: 0,
      tabsDragStartScrollLeft: 0,
      tabsDragElement: null,
      suppressTabClick: false,
      tabsDragMoveHandler: null,
      tabsDragEndHandler: null,
      tabsDragRoot: null,
      tabsDragMouseDownHandler: null
    }
  },
  computed: {
    activeIndex() {
      const index = this.levelList.findIndex(item => `${item.levelCode}` === `${this.selectedLevelCode}`) || 0;
      return index === -1 ? 2 : index;
    },
    currentLevel() {
      return this.levelList[this.activeIndex] || {};
    },
    userLevelIndex() {
      const userLevelCode = this.userInfo.levelCode ?? this.selectedLevelCode;
      const index = this.levelList.findIndex(item => `${item.levelCode}` === `${userLevelCode}`);
      return index === -1 ? this.activeIndex : index;
    },
    isUserLevelSelected() {
      const userLevelCode = this.userInfo.levelCode;
      return userLevelCode !== undefined && userLevelCode !== null
        && `${this.currentLevel.levelCode}` === `${userLevelCode}`;
    },
    showUpgradeCard() {
      return this.activeIndex >= this.userLevelIndex && this.userLevelIndex < this.levelList.length - 1;
    },
    showBenefitGrid() {
      return this.activeIndex <= this.userLevelIndex || this.userLevelIndex >= this.levelList.length - 1;
    },
    levelName() {
      return this.currentLevel.levelName || `LV.${this.activeIndex + 1}`;
    },
    nextLevel() {
      return this.levelList[this.activeIndex + 1] || {};
    },
    upgradeLevel() {
      return this.isUserLevelSelected ? this.nextLevel : this.currentLevel;
    },
    nextLevelName() {
      return this.nextLevel.levelName || `LV.${this.activeIndex + 2}`;
    },
    upgradeLevelName() {
      return this.upgradeLevel.levelName || this.nextLevelName;
    },
    userLevelName() {
      const userLevelCode = this.userInfo.levelCode ?? this.selectedLevelCode;
      const userLevelIndex = this.levelList.findIndex(item => `${item.levelCode}` === `${userLevelCode}`);
      const userLevel = this.levelList[userLevelIndex];
      return userLevel?.levelName || `LV.${Math.max(1, userLevelIndex + 1)}`;
    },
    amountText() {
      return this.upgradeLevel.amount ? (+this.upgradeLevel.amount).toLocaleString() : '32,000';
    },
    tabs() {
      return this.levelList.map((item, index) => ({
        name: item.levelName || `LV.${index + 1}`,
        code: item.levelCode ?? index
      }));
    },
    benefits() {
      const level = this.currentLevel;
      const inviteRate = level.profitMargin?.[0]?.invitationCommission
        || level.incomeRatio?.[0]?.taskCommissionRatioStr;

      return [
        { value: this.formatValue(level.taskQuota, this.$t('levelPage.tasks')), label: this.$t('levelPage.dailyOrders') },
        { value: this.formatMoney(level.estimatedEarnings), label: this.$t('levelPage.dailyCommission') },
        // { value: this.formatValue(inviteRate, '%'), label: 'Direct invite rate' },
        // { value: this.formatMoney(level.totalCommission), label: 'Est. monthly commission' }
      ];
    },
    upgradeBenefits() {
      return [
        {
          label: this.$t('levelPage.moreDailyTasks'),
          value: this.formatValue(this.upgradeLevel.taskQuota, this.$t('levelPage.tasks')),
          desc: this.$t('levelPage.dailyOrders')
        },
        {
          label: this.$t('levelPage.moreIncome'),
          value: this.formatMoney(this.upgradeLevel.estimatedEarnings),
          desc: this.$t('levelPage.dailyCommission')
        },
        {
          label: this.$t('levelPage.taskCommission'),
          value: this.formatValue(
            this.upgradeLevel.profitMargin?.[0]?.invitationCommission
            || this.upgradeLevel.incomeRatio?.[0]?.taskCommissionRatioStr,
            this.$t('levelPage.percent')
          ),
          desc: this.$t('levelPage.directInviteRate')
        }
      ];
    },
    brandList() {
      return [
        { name: 'A', image: '/static/team/teamA.png' },
        { name: 'B', image: '/static/team/teamB.png' },
        { name: 'C', image: '/static/team/teamC.png' }
      ];
    },
    commissionBlocks() {
      return [
        { title: this.$t('levelPage.invitationCommission'), desc: this.$t('levelPage.invitationCommissionDesc'), field: 'profitMargin' },
        { title: this.$t('levelPage.teamOrderCommission'), desc: this.$t('levelPage.teamOrderCommissionDesc'), field: 'incomeRatio', order: true }
      ];
    }
  },
  created() {
    this.initData();
    this.currency = uni.getStorageSync('settings').currency
  },
  mounted() {
    this.bindTabsDragListener();
  },
  beforeUnmount() {
    this.unbindTabsDragListener();
    this.removeTabsDragListeners();
  },
  methods: {
    selectLevel(code, index) {
      // A mouse drag also emits click on the tab under the cursor. Do not
      // change the selected level after the user has just scrolled the tabs.
      if (this.suppressTabClick) return;
      this.selectedLevelCode = code;
      this.scrollIntoId = `level-tab-${index}`;
    },
    bindTabsDragListener() {
      const root = this.$el?.querySelector?.('.level-tabs');
      if (!root || this.tabsDragRoot) return;

      this.tabsDragRoot = root;
      this.tabsDragMouseDownHandler = (event) => this.startTabsDrag(event);
      // Bind directly to the rendered H5 element. This avoids relying on
      // scroll-view's component event forwarding, which differs by platform.
      root.addEventListener('mousedown', this.tabsDragMouseDownHandler);
    },
    unbindTabsDragListener() {
      if (this.tabsDragRoot && this.tabsDragMouseDownHandler) {
        this.tabsDragRoot.removeEventListener('mousedown', this.tabsDragMouseDownHandler);
      }
      this.tabsDragRoot = null;
      this.tabsDragMouseDownHandler = null;
    },
    startTabsDrag(event) {
      // Only handle the primary mouse button; touch scrolling keeps using the
      // native scroll-view behavior on phones and tablets.
      if (event.button !== undefined && event.button !== 0) return;
      if (this.tabsDragging) return;

      const element = this.getTabsScrollElement(event);
      if (!element) return;

      this.tabsDragging = true;
      this.tabsDragMoved = false;
      this.tabsDragStartX = event.clientX;
      this.tabsDragStartScrollLeft = element.scrollLeft;
      this.tabsDragElement = element;

      if (typeof document !== 'undefined') {
        this.tabsDragMoveHandler = this.moveTabsDrag.bind(this);
        this.tabsDragEndHandler = this.endTabsDrag.bind(this);
        document.addEventListener('mousemove', this.tabsDragMoveHandler);
        document.addEventListener('mouseup', this.tabsDragEndHandler);
      }
    },
    getTabsScrollElement(event) {
      const source = event.currentTarget || event.target;
      const root = source?.matches?.('.level-tabs')
        ? source
        : source?.closest?.('.level-tabs') || event.target?.closest?.('.level-tabs');
      if (!root) return null;

      // uni-app H5 renders scroll-view as a custom element containing a
      // nested .uni-scroll-view div. The nested div is the actual element
      // whose scrollLeft must be changed during a desktop drag.
      const candidates = [root, ...(root.querySelectorAll?.('.uni-scroll-view') || [])];
      const scrollElement = candidates.reverse().find((candidate) => {
        const overflowX = typeof getComputedStyle === 'function'
          ? getComputedStyle(candidate).overflowX
          : '';
        return overflowX === 'auto' || overflowX === 'scroll';
      });

      return scrollElement || root;
    },
    moveTabsDrag(event) {
      if (!this.tabsDragging || !this.tabsDragElement) return;

      const deltaX = event.clientX - this.tabsDragStartX;
      if (Math.abs(deltaX) > 3) this.tabsDragMoved = true;
      this.tabsDragElement.scrollLeft = this.tabsDragStartScrollLeft - deltaX;

      if (this.tabsDragMoved) event.preventDefault();
    },
    endTabsDrag() {
      if (!this.tabsDragging) return;

      const wasMoved = this.tabsDragMoved;
      this.removeTabsDragListeners();
      this.tabsDragging = false;
      this.tabsDragElement = null;

      if (wasMoved) {
        this.suppressTabClick = true;
        // Let the click event generated by mouseup be ignored, then restore
        // normal tab selection for the next click.
        setTimeout(() => {
          this.suppressTabClick = false;
        }, 0);
      }
    },
    removeTabsDragListeners() {
      if (typeof document !== 'undefined') {
        if (this.tabsDragMoveHandler) {
          document.removeEventListener('mousemove', this.tabsDragMoveHandler);
        }
        if (this.tabsDragEndHandler) {
          document.removeEventListener('mouseup', this.tabsDragEndHandler);
        }
      }
      this.tabsDragMoveHandler = null;
      this.tabsDragEndHandler = null;
      this.tabsDragging = false;
    },
    async initData() {
      try {
        const user = await userInfoApi();
        this.userInfo = user.data || {};
        const level = await vipInfoApi();
        const levelData = level.data || [];
        this.levelList = Array.isArray(levelData) ? levelData : (levelData.list || []);
        this.selectedLevelCode = this.userInfo.levelCode ?? this.levelList[0]?.levelCode ?? 2;
        this.$nextTick(() => {
          this.scrollIntoId = `level-tab-${this.activeIndex}`;
        });
      } catch (error) {
        console.error('level init error:', error);
      }
    },
    handleJoin() {
      this.$refs.buyPopup.open();
    },
    formatMoney(value) {
      if (value === undefined || value === null || value === '') return '-';
      const number = Number(value);
      return `${Number.isNaN(number) ? value : number.toLocaleString()} ${this.currency}`;
    },
    formatValue(value, suffix = '') {
      if (value === undefined || value === null || value === '') return '-';
      const text = String(value);
      return suffix && text.endsWith(suffix) ? text : `${text} ${suffix}`;
    },
    getCommissionRows(block) {
      const source = this.currentLevel[block.field] || [];
      return this.brandList.map((brand, index) => {
        const item = source[index] || {};
        const rate = block.field === 'profitMargin'
          ? item.invitationCommission
          : item.taskCommissionRatioStr;

        return {
          ...brand,
          rate: this.formatValue(rate, '%'),
          // The backend's commission base is amount; do not derive it from incomeAmount.
          amount: this.formatMoney(item.incomeAmount)
        };
      });
    },
    cancel() {
      this.$refs.buyPopup.close();
    },
    async confirm() {
      this.cancel();
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        await buyApi(this.upgradeLevel.id);
        await this.initData();
        this.$showMessage('success', this.$t('toast.success'));
      } catch (error) {
        this.$showMessage('warning', error.msg || this.$t('levelPage.error'));
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  font-family: MiSans;
  box-sizing: border-box;
}

.level-page {
  min-height: 100vh;
  background: #f2f5ff;
  color: #111;
  font-family: Arial, sans-serif;
  padding-bottom: 80rpx;

  .hero {
    position: relative;
    z-index: 2;
    margin-top: 68rpx;
    width: 100vw;

    .hero-copy {
      position: relative;
      z-index: 3;
      padding: 0 24rpx;

      .position {
        display: block;
        font-size: 30rpx;
        margin-bottom: 176rpx;
      }

      .grade {
        position: absolute;
        left: 390rpx;
        top: 6rpx;
        width: 240rpx;
        font-size: 30rpx;
        font-weight: bold;
        white-space: nowrap;
      }

      .big-level {
        display: block;
        font-size: 76rpx;
        line-height: 82rpx;
        font-weight: 800;
        color: #2454ef;
        width: 390rpx;
        word-break: break-all;
      }

      .hero-title {
        display: block;
        font-family: Noto Sans SC;
        font-size: 36rpx;
        font-weight: bold;
        margin-top: 18rpx;
      }

      .hero-desc {
        display: block;
        width: 570rpx;
        font-family: MiSans;
        font-size: 24rpx;
        line-height: 34rpx;
        margin-top: 12rpx;
      }
    }

    .hero-art1 {
      position: absolute;
      right: -48rpx;
      top: -120rpx;
      // width: 382rpx;
      height: 408rpx;
    }

    .hero-art {
      position: absolute;
      right: 0;
      top: -200rpx;
      width: 382rpx;
      height: 508rpx;

      .art-ring {
        position: absolute;
        width: 400rpx;
        height: 145rpx;
        border: 8rpx solid #327fea;
        border-radius: 50%;
        top: 15rpx;
      }

      .art-ribbon {
        position: absolute;
        width: 90rpx;
        height: 230rpx;
        background: linear-gradient(90deg, #2369e9, #74cdf5);
        border-radius: 50%;
        left: 125rpx;
        top: 45rpx;
        transform: skew(18deg);
      }
    }
  }

  .level-tabs {
    position: relative;
    z-index: 2;
    white-space: nowrap;
    cursor: grab;
    user-select: none;
    padding: 14rpx 24rpx 18rpx;
    padding-right: 0;
    padding-left: 0;
    box-sizing: border-box;

    #level-tab-0 {
      margin-left: 14rpx;
    }

    .level-tab {
      display: inline-flex;
      min-width: 150rpx;
      height: 78rpx;
      margin-right: 14rpx;
      border: 2rpx solid #fff;
      border-radius: 13rpx;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-family: MiSans;
      font-size: 30rpx;
      font-weight: bold;
      background: #ffffff40;
      padding: 0 12rpx;

      &.active {
        flex-direction: column;
        align-items: center;
        color: #fff;
        background: #1453ed;
        font-family: MiSans;
        font-size: 24rpx;
        font-weight: 600;
      }

      .now {
        font-size: 20rpx;
      }
    }

    &.is-dragging {
      cursor: grabbing;
    }
  }

  .content {
    position: relative;
    z-index: 2;
    padding: 0 24rpx;

    .panel {
      background: #fff;
      border-radius: 26rpx;
      padding: 30rpx 26rpx;
      margin-bottom: 24rpx;

      .panel-head {
        display: flex;
        justify-content: space-between;
        font-size: 28rpx;
        font-weight: bold;
        margin-bottom: 18rpx;

        .muted {
          color: #A8A8A8;
          font-weight: normal;
        }
      }

      .benefit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16rpx 20rpx;
        margin-bottom: 18rpx;

        .benefit-item {
          background: #f5f6fa;
          border-radius: 16rpx;
          padding: 18rpx;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;

          .benefit-icon {
            width: 48rpx;
            min-width: 48rpx;
            height: 48rpx;
            min-height: 48rpx;
          }

          .benefit-value {
            font-size: 32rpx;
            font-weight: bold;
            margin-top: 5rpx;
          }

          .benefit-label {
            font-family: MiSans;
            font-size: 24rpx;
            color: $themeColor;
            margin-top: 5rpx;
          }
        }
      }

      .upgrade-card {
        background: #1150ed;
        color: #fff;
        border-radius: 16rpx;
        padding: 24rpx;

        .upgrade-meta,
        .upgrade-title {
          display: flex;
          justify-content: space-between;
          font-size: 24rpx;
        }

        .upgrade-title {
          font-size: 30rpx;
          color: #ffe500;
          font-weight: bold;
          margin: 10rpx 0 22rpx;

          .title_left {
            max-width: 460rpx;
            word-break: break-all;
          }

          span {
            white-space: nowrap;
          }
        }

        .reward-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14rpx;

          .reward-item {
            display: flex;
            flex-direction: column;
            background: #376bec;
            border-radius: 14rpx;
            padding: 14rpx 10rpx;
            font-size: 20rpx;
            font-family: MiSans;
            font-size: 20rpx;
            font-weight: 500;
            color: #BBBBBB;


            .number {
              font-size: 28rpx;
              font-weight: 600;
              color: #fff;
              margin: 12rpx 0 8rpx;
            }

            .lvse {
              color: #00f0b0;
              font-family: MiSans;
              font-size: 24rpx;
            }
          }
        }

        .upgrade-btn {
          height: 62rpx;
          line-height: 62rpx;
          color: #1150ed;
          background: #fff;
          border: 0;
          border-radius: 8rpx;
          margin-top: 18rpx;
          font-size: 26rpx;
        }
      }

      .upgrade-btn_none {
        padding: 16rpx 0;
        background: #C1C1C1;
        color: $themeColor;
        border-radius: 8rpx;
        text-align: center;
      }

      .section-title {
        display: block;
        font-size: 30rpx;
        font-weight: bold;
      }

      .section-desc {
        display: block;
        color: #666;
        font-size: 24rpx;
        line-height: 34rpx;
        margin: 12rpx 0 18rpx;
      }

      .commission-row {
        display: flex;
        align-items: center;
        background: #e9f3ff;
        border-radius: 10rpx;
        padding: 12rpx;
        margin-top: 12rpx;

        .brand {
          width: 72rpx;
          height: 72rpx;
          min-width: 72rpx;
          border-radius: 8rpx;
        }

        .commission-copy {
          flex: 1;
          padding-left: 14rpx;

          strong,
          text {
            display: block;
            font-size: 24rpx;
            line-height: 30rpx;
          }

          text {
            color: #aaa;
          }
        }

        .commission-rate {
          align-self: stretch;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          text-align: right;

          strong,
          text {
            display: block;
            font-size: 24rpx;
            line-height: 30rpx;
          }

          text {
            color: #aaa;
          }

          strong {
            color: #1453ed;
          }
        }
      }

      &.daily-panel {
        height: 220rpx;
        box-sizing: border-box;
      }
    }
  }

  .popup {
    width: 560rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 36rpx;
    box-sizing: border-box;
    text-align: center;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .popup-text {
      display: block;
      margin: 30rpx 0;
      font-size: 26rpx;
    }

    .popup-actions {
      display: flex;
      gap: 18rpx;

      button {
        flex: 1;
        height: 72rpx;
        line-height: 72rpx;
        border: 0;
        font-size: 26rpx;

        &.confirm {
          color: #fff;
          background: #1453ed;
        }
      }
    }
  }
}

/* Keep every tab anchored to the same top edge when the active tab has two lines. */
.level-tab {
  vertical-align: top;
  box-sizing: border-box;
  line-height: 32rpx;
}

.level-tab .now {
  display: block;
  line-height: 24rpx;
  margin-top: 0;
}
</style>
