// ============================================================
// ads.js — iOS AdMob (Capacitor) / UMP / Banner / Rewarded Hint
// ============================================================
// TestFlightでの初回確認中は必ず true のまま使用する。
// App Store提出直前に、実機でテスト広告の動作確認後 false へ切り替える。
const ADMOB_CONFIG = {
  isTesting: true,

  appId: 'ca-app-pub-8174756915786797~9805262814',

  production: {
    banner: 'ca-app-pub-8174756915786797/5291302738',
    rewardedHint: 'ca-app-pub-8174756915786797/7251165945',
  },

  // Google公式 iOS テスト広告ユニットID
  test: {
    banner: 'ca-app-pub-3940256099942544/2435281174',
    rewardedHint: 'ca-app-pub-3940256099942544/1712485313',
  },
};

const adsState = {
  initialized: false,
  canRequestAds: false,
  bannerVisible: false,
  bannerListenersRegistered: false,
  rewardedReady: false,
  rewardedPreparing: false,
  rewardProcessing: false,
  privacyOptionsRequired: false,
};

function isNativeAdPlatform() {
  return !!(
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform()
  );
}

function getAdMobPlugin() {
  if (!isNativeAdPlatform()) return null;
  return (window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) || null;
}

function getBannerAdId() {
  return ADMOB_CONFIG.isTesting ? ADMOB_CONFIG.test.banner : ADMOB_CONFIG.production.banner;
}

function getRewardedHintAdId() {
  return ADMOB_CONFIG.isTesting ? ADMOB_CONFIG.test.rewardedHint : ADMOB_CONFIG.production.rewardedHint;
}

function setAdDiagnostic(message) {
  const el = document.getElementById('admob-diagnostic');
  if (el) el.textContent = `AdMob診断：${message}`;
  console.log('[AdMob]', message);
}

function updatePrivacyOptionsButton() {
  const btn = document.getElementById('btn-ad-privacy');
  if (!btn) return;
  btn.style.display = adsState.privacyOptionsRequired ? '' : 'none';
}

function setBannerReserve(height) {
  const el = document.getElementById('ad-banner');
  if (!el) return;
  const h = Math.max(0, Number(height) || 0);
  el.style.height = `${h}px`;
  el.style.flexBasis = `${h}px`;
  if (h > 0 && isNativeAdPlatform()) el.textContent = '';
}

function registerBannerListeners(AdMob) {
  if (adsState.bannerListenersRegistered) return;
  adsState.bannerListenersRegistered = true;

  AdMob.addListener('bannerAdSizeChanged', (info) => {
    if (info && Number(info.height) > 0) setBannerReserve(info.height);
  }).catch(() => {});

  AdMob.addListener('bannerAdLoaded', () => {
    adsState.bannerVisible = true;
    setAdDiagnostic('バナー広告の読み込み成功');
  }).catch(() => {});

  AdMob.addListener('bannerAdFailedToLoad', (error) => {
    adsState.bannerVisible = false;
    setBannerReserve(0);
    setAdDiagnostic(`バナー広告の読み込み失敗${error && error.message ? ' / ' + error.message : ''}`);
  }).catch(() => {});
}

async function showBannerAd() {
  const AdMob = getAdMobPlugin();
  if (!AdMob || !adsState.initialized || !adsState.canRequestAds) return;

  registerBannerListeners(AdMob);

  try {
    if (adsState.bannerVisible) {
      await AdMob.resumeBanner();
      return;
    }

    setAdDiagnostic('Google公式テストバナーをリクエスト中');
    await AdMob.showBanner({
      adId: getBannerAdId(),
      adSize: 'ADAPTIVE_BANNER',
      position: 'BOTTOM_CENTER',
      margin: 0,
      isTesting: ADMOB_CONFIG.isTesting,
      npa: false,
    });
    adsState.bannerVisible = true;
  } catch (e) {
    adsState.bannerVisible = false;
    setBannerReserve(0);
    setAdDiagnostic(`バナー広告の表示失敗${e && e.message ? ' / ' + e.message : ''}`);
  }
}

async function prepareRewardedAd() {
  const AdMob = getAdMobPlugin();
  if (!AdMob || !adsState.initialized || !adsState.canRequestAds || adsState.rewardedPreparing) return false;

  adsState.rewardedReady = false;
  adsState.rewardedPreparing = true;
  try {
    await AdMob.prepareRewardVideoAd({
      adId: getRewardedHintAdId(),
      isTesting: ADMOB_CONFIG.isTesting,
      npa: false,
    });
    adsState.rewardedReady = true;
    return true;
  } catch (e) {
    console.warn('[AdMob] リワード広告の事前ロード失敗', e);
    adsState.rewardedReady = false;
    return false;
  } finally {
    adsState.rewardedPreparing = false;
  }
}

async function initAds() {
  const AdMob = getAdMobPlugin();

  // PCブラウザでは従来どおりゲーム検証を続けられる。
  if (!AdMob) {
    setAdDiagnostic('Webプレビュー（AdMobは実機版で動作）');
    return;
  }

  try {
    setAdDiagnostic('SDK初期化中');
    await AdMob.initialize({ initializeForTesting: ADMOB_CONFIG.isTesting });
    adsState.initialized = true;
    setAdDiagnostic('SDK初期化済み / UMP確認中');
  } catch (e) {
    setAdDiagnostic(`SDK初期化失敗${e && e.message ? ' / ' + e.message : ''}`);
    return;
  }

  let consentInfo = null;
  try {
    consentInfo = await AdMob.requestConsentInfo();
    if (consentInfo && consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
      consentInfo = await AdMob.showConsentForm();
    }

    adsState.canRequestAds = !!(consentInfo && consentInfo.canRequestAds);
    adsState.privacyOptionsRequired = !!(
      consentInfo && consentInfo.privacyOptionsRequirementStatus === 'REQUIRED'
    );
    updatePrivacyOptionsButton();

    setAdDiagnostic(
      `UMP確認成功 / status=${consentInfo && consentInfo.status ? consentInfo.status : 'UNKNOWN'} / canRequestAds=${adsState.canRequestAds}`
    );
  } catch (e) {
    adsState.canRequestAds = false;
    setAdDiagnostic(`UMP確認失敗${e && e.message ? ' / ' + e.message : ''}`);
    return;
  }

  if (!adsState.canRequestAds) return;

  // バナーとリワードの準備はゲーム進行を止めない。
  showBannerAd();
  prepareRewardedAd();
}

async function showAdPrivacyOptions() {
  const AdMob = getAdMobPlugin();
  if (!AdMob || !adsState.initialized) return;
  try {
    await AdMob.showPrivacyOptionsForm();
  } catch (e) {
    console.warn('[AdMob] プライバシー設定表示失敗', e);
  }
}

function setHintAdButtonEnabled(enabled, text) {
  const btn = document.getElementById('hint-watch-ad');
  if (!btn) return;
  btn.disabled = !enabled;
  if (text) btn.textContent = text;
}

async function requestHintViaRewardedAd(onReward) {
  // PCブラウザでは開発効率を落とさないため、従来の模擬視聴を残す。
  if (!isNativeAdPlatform()) {
    setHintAdButtonEnabled(false, '広告を再生中……');
    setTimeout(() => {
      if (typeof onReward === 'function') onReward();
    }, 900);
    return;
  }

  const AdMob = getAdMobPlugin();
  if (!AdMob || !adsState.initialized || !adsState.canRequestAds) {
    alert('広告を準備できませんでした。通信環境を確認して、もう一度お試しください。');
    return;
  }
  if (adsState.rewardProcessing) return;

  adsState.rewardProcessing = true;
  setHintAdButtonEnabled(false, '広告を準備中……');

  let rewardEarned = false;
  let settled = false;
  const handles = [];

  const cleanup = async () => {
    for (const handle of handles) {
      try { await handle.remove(); } catch (_) {}
    }
    adsState.rewardProcessing = false;
  };

  const finish = async (success, message) => {
    if (settled) return;
    settled = true;
    await cleanup();

    if (success) {
      if (typeof onReward === 'function') onReward();
    } else if (message) {
      alert(message);
      if (typeof renderHintPanelContent === 'function') renderHintPanelContent();
    } else if (typeof renderHintPanelContent === 'function') {
      renderHintPanelContent();
    }

    prepareRewardedAd();
  };

  try {
    handles.push(await AdMob.addListener('onRewardedVideoAdReward', () => {
      rewardEarned = true;
    }));
    handles.push(await AdMob.addListener('onRewardedVideoAdDismissed', () => {
      finish(rewardEarned, null);
    }));
    handles.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', () => {
      finish(false, '広告を表示できませんでした。通信環境を確認して、もう一度お試しください。');
    }));

    if (!adsState.rewardedReady) {
      setHintAdButtonEnabled(false, '広告を読み込み中……');
      const prepared = await prepareRewardedAd();
      if (!prepared) {
        await finish(false, '広告を読み込めませんでした。通信環境を確認して、もう一度お試しください。');
        return;
      }
    }

    adsState.rewardedReady = false;
    setHintAdButtonEnabled(false, '広告を再生中……');
    await AdMob.showRewardVideoAd({ adId: getRewardedHintAdId() });
  } catch (e) {
    console.warn('[AdMob] リワード広告表示失敗', e);
    await finish(false, '広告を表示できませんでした。通信環境を確認して、もう一度お試しください。');
  }
}
