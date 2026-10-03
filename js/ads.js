// ============================================================
// ads.js — iOS AdMob (Capacitor) / UMP / Banner / Rewarded Hint
// ============================================================
// Temporary production-AdMob diagnostic build.
//
// IMPORTANT:
// - Production AdMob IDs are used.
// - isTesting remains false.
// - A temporary diagnostic panel is shown on screen.
// - Remove the diagnostic panel before App Store release.
// ============================================================

const ADMOB_CONFIG = {
  isTesting: false,

  appId: 'ca-app-pub-8174756915786797~9805262814',

  production: {
    banner: 'ca-app-pub-8174756915786797/5291302738',
    rewardedHint: 'ca-app-pub-8174756915786797/7251165945',
  },
};

// ------------------------------------------------------------
// Temporary diagnostics
// ------------------------------------------------------------

const ADMOB_DIAGNOSTIC_ENABLED = true;

const adDiagnosticHistory = [];

function safeStringify(value) {
  try {
    if (value == null) return '';

    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof Error) {
      return JSON.stringify({
        name: value.name,
        message: value.message,
        stack: value.stack,
      });
    }

    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'bigint') {
        return String(val);
      }
      return val;
    });
  } catch (_) {
    try {
      return String(value);
    } catch (_) {
      return '[unserializable]';
    }
  }
}

function formatAdError(error) {
  if (!error) {
    return '詳細なし';
  }

  const parts = [];

  if (error.code != null) {
    parts.push(`code=${error.code}`);
  }

  if (error.message) {
    parts.push(`message=${error.message}`);
  }

  if (error.domain) {
    parts.push(`domain=${error.domain}`);
  }

  if (error.responseInfo) {
    parts.push(`responseInfo=${safeStringify(error.responseInfo)}`);
  }

  if (parts.length === 0) {
    parts.push(safeStringify(error));
  }

  return parts.join(' / ');
}

function ensureAdDiagnosticPanel() {
  if (!ADMOB_DIAGNOSTIC_ENABLED) return null;

  let panel = document.getElementById('admob-diagnostic-panel');

  if (panel) {
    return panel;
  }

  panel = document.createElement('div');
  panel.id = 'admob-diagnostic-panel';

  Object.assign(panel.style, {
    position: 'fixed',
    left: '8px',
    right: '8px',
    bottom: '90px',
    zIndex: '999999',
    maxHeight: '32vh',
    overflowY: 'auto',
    padding: '8px 10px',
    borderRadius: '8px',
    background: 'rgba(0, 0, 0, 0.82)',
    color: '#ffffff',
    fontSize: '11px',
    lineHeight: '1.4',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    pointerEvents: 'none',
  });

  panel.textContent = 'AdMob診断：待機中';

  document.body.appendChild(panel);

  return panel;
}

function setAdDiagnostic(message, detail = null) {
  const timestamp = new Date().toLocaleTimeString();

  let text = `[${timestamp}] ${message}`;

  if (detail != null && detail !== '') {
    text += `\n${safeStringify(detail)}`;
  }

  adDiagnosticHistory.push(text);

  // Keep the panel reasonably small.
  if (adDiagnosticHistory.length > 12) {
    adDiagnosticHistory.shift();
  }

  console.log(`[AdMob] ${message}`, detail ?? '');

  if (!ADMOB_DIAGNOSTIC_ENABLED) {
    return;
  }

  const panel = ensureAdDiagnosticPanel();

  if (panel) {
    panel.textContent = adDiagnosticHistory.join('\n\n');
    panel.scrollTop = panel.scrollHeight;
  }
}

// Useful if Safari/Web Inspector or another console becomes available.
window.__admobDebug = {
  config: ADMOB_CONFIG,
  history: adDiagnosticHistory,
};

// ------------------------------------------------------------
// State
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// Platform / plugin
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// Privacy options
// ------------------------------------------------------------

function updatePrivacyOptionsButton() {
  const btn = document.getElementById('btn-ad-privacy');

  if (!btn) return;

  btn.style.display = adsState.privacyOptionsRequired
    ? ''
    : 'none';
}

// ------------------------------------------------------------
// Banner
// ------------------------------------------------------------

function setBannerReserve(height) {
  const el = document.getElementById('ad-banner');

  if (!el) return;

  const h = Math.max(0, Number(height) || 0);

  el.style.height = `${h}px`;
  el.style.flexBasis = `${h}px`;

  // Native banner only.
  el.textContent = '';
}

function registerBannerListeners(AdMob) {
  if (adsState.bannerListenersRegistered) {
    return;
  }

  adsState.bannerListenersRegistered = true;

  if (!AdMob || typeof AdMob.addListener !== 'function') {
    setAdDiagnostic(
      'Banner listener API unavailable'
    );
    return;
  }

  const addSafe = (eventName, handler) => {
    try {
      const handle = AdMob.addListener(
        eventName,
        handler
      );

      if (
        handle &&
        typeof handle.catch === 'function'
      ) {
        handle.catch((error) => {
          setAdDiagnostic(
            `${eventName} listener registration failed`,
            formatAdError(error)
          );
        });
      }
    } catch (error) {
      setAdDiagnostic(
        `${eventName} listener registration failed`,
        formatAdError(error)
      );
    }
  };

  addSafe('bannerAdSizeChanged', (info) => {
    setAdDiagnostic(
      'Banner size changed',
      info
    );

    if (
      info &&
      Number(info.height) > 0
    ) {
      setBannerReserve(
        Number(info.height)
      );
    }
  });

  addSafe('bannerAdLoaded', (info) => {
    adsState.bannerVisible = true;
    adsState.bannerRequested = true;

    setAdDiagnostic(
      'Banner loaded SUCCESS',
      info
    );
  });

  addSafe(
    'bannerAdFailedToLoad',
    (error) => {
      adsState.bannerVisible = false;
      adsState.bannerRequested = false;

      setBannerReserve(0);

      setAdDiagnostic(
        'Banner FAILED',
        formatAdError(error)
      );
    }
  );
}

async function showBannerAd() {
  const AdMob = getAdMobPlugin();

  setAdDiagnostic(
    `Banner request check / initialized=${adsState.initialized} / canRequestAds=${adsState.canRequestAds}`
  );

  if (
    !AdMob ||
    !adsState.initialized ||
    !adsState.canRequestAds
  ) {
    setAdDiagnostic(
      'Banner request ABORTED'
    );

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

      setAdDiagnostic(
        'Existing banner resumed'
      );

      return true;
    }

    setBannerReserve(60);

    const options = {
      adId: getBannerAdId(),
      adSize: 'ADAPTIVE_BANNER',
      position: 'BOTTOM_CENTER',
      margin: 0,
      isTesting: ADMOB_CONFIG.isTesting,
      npa: false,
    };

    setAdDiagnostic(
      'Banner request START',
      {
        adId: options.adId,
        isTesting: options.isTesting,
        adSize: options.adSize,
      }
    );

    const result =
      await AdMob.showBanner(options);

    adsState.bannerRequested = true;

    setAdDiagnostic(
      'showBanner() completed / waiting for bannerAdLoaded',
      result
    );

    return true;
  } catch (error) {
    adsState.bannerVisible = false;
    adsState.bannerRequested = false;

    setBannerReserve(0);

    setAdDiagnostic(
      'showBanner() FAILED',
      formatAdError(error)
    );

    return false;
  }
}

// ------------------------------------------------------------
// Rewarded
// ------------------------------------------------------------

async function prepareRewardedAd() {
  const AdMob = getAdMobPlugin();

  setAdDiagnostic(
    `Rewarded prepare check / initialized=${adsState.initialized} / canRequestAds=${adsState.canRequestAds} / preparing=${adsState.rewardedPreparing}`
  );

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
    const options = {
      adId: getRewardedHintAdId(),
      isTesting: ADMOB_CONFIG.isTesting,
      npa: false,
    };

    setAdDiagnostic(
      'Rewarded prepare START',
      {
        adId: options.adId,
        isTesting: options.isTesting,
      }
    );

    const result =
      await AdMob.prepareRewardVideoAd(
        options
      );

    adsState.rewardedReady = true;

    setAdDiagnostic(
      'Rewarded prepare SUCCESS',
      result
    );

    return true;
  } catch (error) {
    adsState.rewardedReady = false;

    setAdDiagnostic(
      'Rewarded prepare FAILED',
      formatAdError(error)
    );

    console.warn(
      '[AdMob] リワード広告の事前ロード失敗',
      error
    );

    return false;
  } finally {
    adsState.rewardedPreparing = false;
  }
}

// ------------------------------------------------------------
// Initialization / UMP
// ------------------------------------------------------------

async function initAds() {
  if (ADMOB_DIAGNOSTIC_ENABLED) {
    ensureAdDiagnosticPanel();
  }

  setAdDiagnostic(
    `initAds() / native=${isNativeAdPlatform()} / testing=${ADMOB_CONFIG.isTesting}`
  );

  const AdMob = getAdMobPlugin();

  if (!AdMob) {
    setAdDiagnostic(
      'Web preview / AdMob plugin unavailable'
    );
    return;
  }

  // SDK init
  try {
    setAdDiagnostic(
      'AdMob.initialize START'
    );

    const initResult =
      await AdMob.initialize({
        initializeForTesting:
          ADMOB_CONFIG.isTesting,
      });

    adsState.initialized = true;

    setAdDiagnostic(
      'AdMob.initialize SUCCESS',
      initResult
    );
  } catch (error) {
    adsState.initialized = false;

    setAdDiagnostic(
      'AdMob.initialize FAILED',
      formatAdError(error)
    );

    return;
  }

  // UMP
  let consentInfo = null;

  try {
    setAdDiagnostic(
      'UMP requestConsentInfo START'
    );

    consentInfo =
      await AdMob.requestConsentInfo();

    setAdDiagnostic(
      'UMP requestConsentInfo SUCCESS',
      consentInfo
    );

    if (
      consentInfo &&
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === 'REQUIRED'
    ) {
      setAdDiagnostic(
        'UMP consent form START'
      );

      consentInfo =
        await AdMob.showConsentForm();

      setAdDiagnostic(
        'UMP consent form FINISHED',
        consentInfo
      );
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

    setAdDiagnostic(
      `UMP RESULT / status=${
        consentInfo &&
        consentInfo.status
          ? consentInfo.status
          : 'UNKNOWN'
      } / canRequestAds=${
        adsState.canRequestAds
      } / privacyOptionsRequired=${
        adsState.privacyOptionsRequired
      }`,
      consentInfo
    );
  } catch (error) {
    adsState.canRequestAds = false;

    setAdDiagnostic(
      'UMP FAILED',
      formatAdError(error)
    );

    return;
  }

  if (!adsState.canRequestAds) {
    setAdDiagnostic(
      'Ads NOT requested because canRequestAds=false'
    );

    return;
  }

  setBannerReserve(0);

  // Banner first so the result is easy to see.
  await showBannerAd();

  // Rewarded preload.
  await prepareRewardedAd();
}

// ------------------------------------------------------------
// Privacy options form
// ------------------------------------------------------------

async function showAdPrivacyOptions() {
  const AdMob = getAdMobPlugin();

  if (
    !AdMob ||
    !adsState.initialized
  ) {
    return;
  }

  try {
    setAdDiagnostic(
      'Privacy options form START'
    );

    const result =
      await AdMob.showPrivacyOptionsForm();

    setAdDiagnostic(
      'Privacy options form FINISHED',
      result
    );
  } catch (error) {
    setAdDiagnostic(
      'Privacy options form FAILED',
      formatAdError(error)
    );

    console.warn(
      '[AdMob] プライバシー設定表示失敗',
      error
    );
  }
}

// ------------------------------------------------------------
// Hint button
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// Rewarded hint playback
// ------------------------------------------------------------

async function requestHintViaRewardedAd(
  onReward
) {
  // Browser development fallback.
  if (!isNativeAdPlatform()) {
    setHintAdButtonEnabled(
      false,
      '広告を再生中……'
    );

    setTimeout(() => {
      if (
        typeof onReward === 'function'
      ) {
        onReward();
      }
    }, 900);

    return;
  }

  const AdMob = getAdMobPlugin();

  setAdDiagnostic(
    `Rewarded show requested / initialized=${adsState.initialized} / canRequestAds=${adsState.canRequestAds} / ready=${adsState.rewardedReady}`
  );

  if (
    !AdMob ||
    !adsState.initialized ||
    !adsState.canRequestAds
  ) {
    setAdDiagnostic(
      'Rewarded show ABORTED'
    );

    alert(
      '広告を準備できませんでした。通信環境を確認して、もう一度お試しください。'
    );

    return;
  }

  if (adsState.rewardProcessing) {
    setAdDiagnostic(
      'Rewarded show ignored / already processing'
    );
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

    setAdDiagnostic(
      `Rewarded flow FINISHED / success=${success} / rewardEarned=${rewardEarned}`
    );

    if (success) {
      if (
        typeof onReward === 'function'
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

    prepareRewardedAd();
  };

  try {
    handles.push(
      await AdMob.addListener(
        'onRewardedVideoAdReward',
        (info) => {
          rewardEarned = true;

          setAdDiagnostic(
            'Rewarded REWARD earned',
            info
          );
        }
      )
    );

    handles.push(
      await AdMob.addListener(
        'onRewardedVideoAdDismissed',
        (info) => {
          setAdDiagnostic(
            'Rewarded DISMISSED',
            info
          );

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
        (error) => {
          setAdDiagnostic(
            'Rewarded FAILED TO SHOW',
            formatAdError(error)
          );

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

      setAdDiagnostic(
        'Rewarded not ready / preparing now'
      );

      const prepared =
        await prepareRewardedAd();

      if (!prepared) {
        await finish(
          false,
          '広告を読み込めませんでした。通信環境を確認して、もう一度お試しください。'
        );

        return;
      }
    }

    adsState.rewardedReady = false;

    setHintAdButtonEnabled(
      false,
      '広告を再生中……'
    );

    setAdDiagnostic(
      'Rewarded show START',
      {
        adId: getRewardedHintAdId(),
      }
    );

    const result =
      await AdMob.showRewardVideoAd({
        adId:
          getRewardedHintAdId(),
      });

    setAdDiagnostic(
      'showRewardVideoAd() returned',
      result
    );
  } catch (error) {
    setAdDiagnostic(
      'Rewarded show EXCEPTION',
      formatAdError(error)
    );

    console.warn(
      '[AdMob] リワード広告表示失敗',
      error
    );

    await finish(
      false,
      '広告を表示できませんでした。通信環境を確認して、もう一度お試しください。'
    );
  }
}