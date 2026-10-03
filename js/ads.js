// ============================================================
// ads.js — iOS AdMob (Capacitor) / UMP / Banner / Rewarded Hint
// App Store Release
// ============================================================

const ADMOB_CONFIG = {
  isTesting: false,

  appId: 'ca-app-pub-8174756915786797~9805262814',

  production: {
    banner: 'ca-app-pub-8174756915786797/5291302738',
    rewardedHint: 'ca-app-pub-8174756915786797/7251165945',
  },
};

const adsState = {
  initialized: false,
  canRequestAds: false,

  bannerVisible: false,
  bannerRequested: false,
  bannerListenersRegistered: false,

  rewardedReady: false,
  rewardedPreparing: false,
  rewardProcessing: false,

  privacyOptionsRequired: false,
};

// ============================================================
// Platform / Plugin
// ============================================================

function isNativeAdPlatform() {
  return !!(
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform()
  );
}

function getAdMobPlugin() {
  if (!isNativeAdPlatform()) return null;

  return (
    window.Capacitor.Plugins &&
    window.Capacitor.Plugins.AdMob
  ) || null;
}

function getBannerAdId() {
  return ADMOB_CONFIG.production.banner;
}

function getRewardedHintAdId() {
  return ADMOB_CONFIG.production.rewardedHint;
}

// ============================================================
// Privacy
// ============================================================

function updatePrivacyOptionsButton() {
  const btn = document.getElementById('btn-ad-privacy');

  if (!btn) return;

  btn.style.display =
    adsState.privacyOptionsRequired
      ? ''
      : 'none';
}

// ============================================================
// Banner
// ============================================================

function setBannerReserve(height) {
  const el =
    document.getElementById('ad-banner');

  if (!el) return;

  const h =
    Math.max(
      0,
      Number(height) || 0
    );

  el.style.height = `${h}px`;
  el.style.flexBasis = `${h}px`;

  // HTML側の「AD」等のプレースホルダーは表示しない。
  el.textContent = '';
}

function registerBannerListeners(AdMob) {
  if (
    adsState.bannerListenersRegistered
  ) {
    return;
  }

  adsState.bannerListenersRegistered =
    true;

  if (
    !AdMob ||
    typeof AdMob.addListener !==
      'function'
  ) {
    return;
  }

  const addSafe = (
    eventName,
    handler
  ) => {
    try {
      const handle =
        AdMob.addListener(
          eventName,
          handler
        );

      if (
        handle &&
        typeof handle.catch ===
          'function'
      ) {
        handle.catch(() => {});
      }
    } catch (_) {}
  };

  addSafe(
    'bannerAdSizeChanged',
    (info) => {
      if (
        info &&
        Number(info.height) > 0
      ) {
        setBannerReserve(
          Number(info.height)
        );
      }
    }
  );

  addSafe(
    'bannerAdLoaded',
    () => {
      adsState.bannerVisible = true;
      adsState.bannerRequested = true;
    }
  );

  addSafe(
    'bannerAdFailedToLoad',
    () => {
      adsState.bannerVisible = false;
      adsState.bannerRequested = false;

      // No Fill等の場合は
      // 空白領域も残さない。
      setBannerReserve(0);
    }
  );
}

async function showBannerAd() {
  const AdMob =
    getAdMobPlugin();

  if (
    !AdMob ||
    !adsState.initialized ||
    !adsState.canRequestAds
  ) {
    return false;
  }

  registerBannerListeners(AdMob);

  try {
    if (adsState.bannerRequested) {
      if (
        typeof AdMob.resumeBanner ===
          'function'
      ) {
        await AdMob.resumeBanner();
      }

      return true;
    }

    // Adaptive Bannerのサイズが確定するまで
    // 一時的に領域を確保する。
    setBannerReserve(60);

    await AdMob.showBanner({
      adId: getBannerAdId(),
      adSize: 'ADAPTIVE_BANNER',
      position: 'BOTTOM_CENTER',
      margin: 0,
      isTesting:
        ADMOB_CONFIG.isTesting,
      npa: false,
    });

    adsState.bannerRequested = true;

    return true;
  } catch (_) {
    adsState.bannerVisible = false;
    adsState.bannerRequested = false;

    setBannerReserve(0);

    return false;
  }
}

// ============================================================
// Rewarded
// ============================================================

async function prepareRewardedAd() {
  const AdMob =
    getAdMobPlugin();

  if (
    !AdMob ||
    !adsState.initialized ||
    !adsState.canRequestAds ||
    adsState.rewardedPreparing
  ) {
    return false;
  }

  adsState.rewardedReady = false;
  adsState.rewardedPreparing = true;

  try {
    await AdMob.prepareRewardVideoAd({
      adId:
        getRewardedHintAdId(),
      isTesting:
        ADMOB_CONFIG.isTesting,
      npa: false,
    });

    adsState.rewardedReady = true;

    return true;
  } catch (_) {
    // No Fill等の場合もゲームは継続する。
    adsState.rewardedReady = false;

    return false;
  } finally {
    adsState.rewardedPreparing = false;
  }
}

// ============================================================
// Initialization / UMP
// ============================================================

async function initAds() {
  const AdMob =
    getAdMobPlugin();

  // PCブラウザではAdMobを使用しない。
  if (!AdMob) {
    return;
  }

  try {
    await AdMob.initialize({
      initializeForTesting:
        ADMOB_CONFIG.isTesting,
    });

    adsState.initialized = true;
  } catch (_) {
    return;
  }

  let consentInfo = null;

  try {
    consentInfo =
      await AdMob.requestConsentInfo();

    if (
      consentInfo &&
      consentInfo
        .isConsentFormAvailable &&
      consentInfo.status ===
        'REQUIRED'
    ) {
      consentInfo =
        await AdMob.showConsentForm();
    }

    adsState.canRequestAds =
      !!(
        consentInfo &&
        consentInfo.canRequestAds
      );

    adsState.privacyOptionsRequired =
      !!(
        consentInfo &&
        consentInfo
          .privacyOptionsRequirementStatus ===
          'REQUIRED'
      );

    updatePrivacyOptionsButton();
  } catch (_) {
    adsState.canRequestAds = false;

    return;
  }

  if (!adsState.canRequestAds) {
    return;
  }

  // 広告が取得できない場合に
  // 空白を残さない。
  setBannerReserve(0);

  await showBannerAd();

  // リワードはバックグラウンドで準備。
  prepareRewardedAd();
}

// ============================================================
// Privacy options
// ============================================================

async function showAdPrivacyOptions() {
  const AdMob =
    getAdMobPlugin();

  if (
    !AdMob ||
    !adsState.initialized
  ) {
    return;
  }

  try {
    await AdMob.showPrivacyOptionsForm();
  } catch (_) {}
}

// ============================================================
// Hint button
// ============================================================

function setHintAdButtonEnabled(
  enabled,
  text
) {
  const btn =
    document.getElementById(
      'hint-watch-ad'
    );

  if (!btn) return;

  btn.disabled = !enabled;

  if (text) {
    btn.textContent = text;
  }
}

// ============================================================
// Rewarded Hint
// ============================================================

async function requestHintViaRewardedAd(
  onReward
) {
  // PCブラウザ用の開発フォールバック。
  // iOS実機では使用されない。
  if (!isNativeAdPlatform()) {
    setHintAdButtonEnabled(
      false,
      '広告を再生中……'
    );

    setTimeout(() => {
      if (
        typeof onReward ===
          'function'
      ) {
        onReward();
      }
    }, 900);

    return;
  }

  const AdMob =
    getAdMobPlugin();

  if (
    !AdMob ||
    !adsState.initialized ||
    !adsState.canRequestAds
  ) {
    alert(
      '広告を準備できませんでした。通信環境を確認して、もう一度お試しください。'
    );

    return;
  }

  if (adsState.rewardProcessing) {
    return;
  }

  adsState.rewardProcessing = true;

  setHintAdButtonEnabled(
    false,
    '広告を準備中……'
  );

  let rewardEarned = false;
  let settled = false;

  const handles = [];

  const cleanup = async () => {
    for (const handle of handles) {
      try {
        if (
          handle &&
          typeof handle.remove ===
            'function'
        ) {
          await handle.remove();
        }
      } catch (_) {}
    }

    adsState.rewardProcessing = false;
  };

  const finish = async (
    success,
    message
  ) => {
    if (settled) return;

    settled = true;

    await cleanup();

    if (success) {
      if (
        typeof onReward ===
          'function'
      ) {
        onReward();
      }
    } else if (message) {
      alert(message);

      if (
        typeof renderHintPanelContent ===
          'function'
      ) {
        renderHintPanelContent();
      }
    } else if (
      typeof renderHintPanelContent ===
        'function'
    ) {
      renderHintPanelContent();
    }

    // 次回用を準備する。
    prepareRewardedAd();
  };

  try {
    handles.push(
      await AdMob.addListener(
        'onRewardedVideoAdReward',
        () => {
          rewardEarned = true;
        }
      )
    );

    handles.push(
      await AdMob.addListener(
        'onRewardedVideoAdDismissed',
        () => {
          finish(
            rewardEarned,
            null
          );
        }
      )
    );

    handles.push(
      await AdMob.addListener(
        'onRewardedVideoAdFailedToShow',
        () => {
          finish(
            false,
            '広告を表示できませんでした。通信環境を確認して、もう一度お試しください。'
          );
        }
      )
    );

    if (!adsState.rewardedReady) {
      setHintAdButtonEnabled(
        false,
        '広告を読み込み中……'
      );

      const prepared =
        await prepareRewardedAd();

      if (!prepared) {
        await finish(
          false,
          '広告を読み込めませんでした。しばらく時間をおいて、もう一度お試しください。'
        );

        return;
      }
    }

    adsState.rewardedReady = false;

    setHintAdButtonEnabled(
      false,
      '広告を再生中……'
    );

    await AdMob.showRewardVideoAd({
      adId:
        getRewardedHintAdId(),
    });
  } catch (_) {
    await finish(
      false,
      '広告を表示できませんでした。しばらく時間をおいて、もう一度お試しください。'
    );
  }
}