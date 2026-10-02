// ============================================================
// audio.js — 全ステージ共通 BGM / 効果音
// ============================================================

const AUDIO_PATHS = {
  bgm: {
    cell: 'assets/audio/bgm/bgm_cell.mp3',
    corridor_guard: 'assets/audio/bgm/bgm_corridor_guard.mp3',
    solitary_loading: 'assets/audio/bgm/bgm_solitary_loading.mp3',
    ending: 'assets/audio/bgm/bgm_ending.mp3',
  },
  se: {
    button: 'assets/audio/se/se_button.mp3',
    correct: 'assets/audio/se/se_correct.mp3',
    door_open: 'assets/audio/se/se_door_open.mp3',
    error: 'assets/audio/se/se_error.mp3',
    item_get: 'assets/audio/se/se_item_get.mp3',
    keypad: 'assets/audio/se/se_keypad.mp3',
    lever: 'assets/audio/se/se_lever.mp3',
    plate: 'assets/audio/se/se_plate.mp3',
    power_off: 'assets/audio/se/se_power_off.mp3',
    power_on: 'assets/audio/se/se_power_on.mp3',
    unlock: 'assets/audio/se/se_unlock.mp3',
    unlock_heavy: 'assets/audio/se/se_unlock_heavy.mp3',
  }
};

const AUDIO_VOLUME = {
  bgm: 0.26,
  se: 0.58,
};

let audioUnlocked = false;
let currentBgmKey = null;
let bgmAudio = null;
let appAudioActive = true;
let audioLifecycleInitialized = false;
let bgmHold = false;
let bgmPlayPending = false;
let bgmRecoveryTimer = null;
let bgmDetachedForBackground = false;
let backgroundBgmTime = 0;
let backgroundBgmKey = null;
const activeSeAudios = new Set();

function ensureAudioSettings() {
  const defaults = { bgmEnabled: true, seEnabled: true };
  state.audioSettings = Object.assign({}, defaults, state.audioSettings || {});
  return state.audioSettings;
}

function shouldBgmBePlaying() {
  const settings = ensureAudioSettings();
  return !!(
    settings.bgmEnabled &&
    audioUnlocked &&
    appAudioActive &&
    !bgmHold &&
    currentBgmKey &&
    AUDIO_PATHS.bgm[currentBgmKey]
  );
}

function scheduleBgmRecovery(delay = 450) {
  clearTimeout(bgmRecoveryTimer);
  bgmRecoveryTimer = setTimeout(() => {
    if (!shouldBgmBePlaying() || !bgmAudio || bgmDetachedForBackground) return;
    if (bgmAudio.paused || bgmAudio.ended) safePlayBgm();
  }, delay);
}

function attachBgmHealthListeners(audio) {
  if (!audio || audio._prisonHealthListenersAttached) return;
  audio._prisonHealthListenersAttached = true;

  audio.addEventListener('playing', () => {
    bgmPlayPending = false;
  });
  audio.addEventListener('pause', () => {
    if (shouldBgmBePlaying()) scheduleBgmRecovery(350);
  });
  audio.addEventListener('stalled', () => scheduleBgmRecovery(650));
  audio.addEventListener('suspend', () => {
    if (audio.paused) scheduleBgmRecovery(650);
  });
  audio.addEventListener('error', () => scheduleBgmRecovery(900));
  audio.addEventListener('ended', () => {
    if (!shouldBgmBePlaying()) return;
    try { audio.currentTime = 0; } catch (_) {}
    safePlayBgm();
  });
}

function safePlayBgm() {
  if (!bgmAudio || !shouldBgmBePlaying() || bgmDetachedForBackground) return;
  bgmAudio.loop = true;
  bgmAudio.volume = AUDIO_VOLUME.bgm;
  const playPromise = bgmAudio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      // iOS側で一時的に再生が拒否された場合、次のユーザー操作で再試行する。
      bgmPlayPending = true;
    });
  }
}

function initAudioSystem() {
  ensureAudioSettings();

  if (!bgmAudio) {
    bgmAudio = new Audio();
    bgmAudio.loop = true;
    bgmAudio.preload = 'auto';
    bgmAudio.volume = AUDIO_VOLUME.bgm;
    attachBgmHealthListeners(bgmAudio);
  }

  // iOS / mobile browserの自動再生制限対策。
  // onceにせず、再生が失敗した場合にも次の操作で再試行できるようにする。
  const unlockOrRetry = () => {
    if (!audioUnlocked) audioUnlocked = true;
    if (bgmPlayPending || (shouldBgmBePlaying() && bgmAudio && bgmAudio.paused)) {
      bgmPlayPending = false;
      safePlayBgm();
    }
  };
  document.addEventListener('pointerdown', unlockOrRetry, { capture: true });
  document.addEventListener('touchstart', unlockOrRetry, { capture: true, passive: true });
  document.addEventListener('keydown', unlockOrRetry, { capture: true });

  const bindToggle = (id, kind) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const settings = ensureAudioSettings();
      if (kind === 'bgm') {
        settings.bgmEnabled = !settings.bgmEnabled;
        if (settings.bgmEnabled) {
          audioUnlocked = true;
          syncBgmForCurrentScreen(true);
        } else if (bgmAudio) {
          bgmPlayPending = false;
          bgmAudio.pause();
        }
      } else {
        settings.seEnabled = !settings.seEnabled;
      }
      updateAudioSettingLabels();
      saveState();
    });
  };

  bindToggle('btn-bgm-toggle', 'bgm');
  bindToggle('btn-se-toggle', 'se');
  bindToggle('title-bgm-toggle', 'bgm');
  bindToggle('title-se-toggle', 'se');

  initAudioLifecycleHandling();
  updateAudioSettingLabels();
}

function releaseBgmForBackground() {
  if (!bgmAudio) return;

  backgroundBgmKey = currentBgmKey;
  try {
    backgroundBgmTime = Number.isFinite(bgmAudio.currentTime) ? bgmAudio.currentTime : 0;
  } catch (_) {
    backgroundBgmTime = 0;
  }

  try { bgmAudio.pause(); } catch (_) {}
  bgmPlayPending = false;

  // iOSのロック画面 / コントロールセンターにNow Playingカードを残さないため、
  // バックグラウンド中はmedia elementからソース自体を切り離す。
  try {
    bgmAudio.removeAttribute('src');
    bgmAudio.load();
    bgmDetachedForBackground = true;
  } catch (_) {
    bgmDetachedForBackground = false;
  }
}

function restoreBgmAfterBackground() {
  if (!bgmAudio) return;

  const desiredKey = getBgmKeyForState();
  const restoreKey = desiredKey || backgroundBgmKey || currentBgmKey;
  const src = restoreKey && AUDIO_PATHS.bgm[restoreKey];
  if (!src) return;

  currentBgmKey = restoreKey;
  const resumeTime = backgroundBgmKey === restoreKey ? Math.max(0, Number(backgroundBgmTime) || 0) : 0;
  bgmDetachedForBackground = false;

  const restorePosition = () => {
    try {
      const duration = Number(bgmAudio.duration);
      const safeTime = Number.isFinite(duration) && duration > 0
        ? Math.min(resumeTime, Math.max(0, duration - 0.25))
        : resumeTime;
      bgmAudio.currentTime = safeTime;
    } catch (_) {}
    if (shouldBgmBePlaying()) safePlayBgm();
  };

  try {
    bgmAudio.src = src;
    bgmAudio.loop = true;
    bgmAudio.preload = 'auto';
    bgmAudio.volume = AUDIO_VOLUME.bgm;
    bgmAudio.addEventListener('loadedmetadata', restorePosition, { once: true });
    bgmAudio.load();
    // ローカルファイルでloadedmetadataが既に利用可能な場合の保険。
    if (bgmAudio.readyState >= 1) restorePosition();
  } catch (_) {
    scheduleBgmRecovery(500);
  }
}

function initAudioLifecycleHandling() {
  if (audioLifecycleInitialized) return;
  audioLifecycleInitialized = true;

  const setActive = (isActive) => {
    const nextActive = !!isActive;
    if (appAudioActive === nextActive) return;
    appAudioActive = nextActive;

    if (!appAudioActive) {
      releaseBgmForBackground();
      activeSeAudios.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (_) {}
      });
      activeSeAudios.clear();
      return;
    }

    // 復帰時は切り離した曲を元の再生位置へ戻して再開する。
    if (bgmDetachedForBackground) {
      restoreBgmAfterBackground();
    } else if (ensureAudioSettings().bgmEnabled && audioUnlocked) {
      syncBgmForCurrentScreen(true);
    }
  };

  // Capacitor実機ではアプリのactive/inactiveを最優先で監視する。
  try {
    const AppPlugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (AppPlugin && typeof AppPlugin.addListener === 'function') {
      AppPlugin.addListener('appStateChange', ({ isActive }) => setActive(isActive));
    }
  } catch (e) {
    console.warn('[audio] appStateChange listener registration failed:', e);
  }

  // WebKit側の状態変化も併用し、ロック画面・バックグラウンド遷移を確実に拾う。
  document.addEventListener('visibilitychange', () => {
    setActive(document.visibilityState === 'visible');
  });
  window.addEventListener('pagehide', () => setActive(false));
  window.addEventListener('pageshow', () => {
    if (document.visibilityState === 'visible') setActive(true);
  });
}

function updateAudioSettingLabels() {
  const settings = ensureAudioSettings();
  ['btn-bgm-toggle', 'title-bgm-toggle'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.textContent = `BGM：${settings.bgmEnabled ? 'ON' : 'OFF'}`;
  });
  ['btn-se-toggle', 'title-se-toggle'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.textContent = `効果音：${settings.seEnabled ? 'ON' : 'OFF'}`;
  });
}

function setBgmHold(held) {
  bgmHold = !!held;
  if (bgmHold) {
    bgmPlayPending = false;
    if (bgmAudio && !bgmAudio.paused) bgmAudio.pause();
  } else if (audioUnlocked && ensureAudioSettings().bgmEnabled) {
    syncBgmForCurrentScreen(true);
  }
}

function getBgmKeyForState() {
  if (state.gameCleared || state.currentScreen === 'GAME_CLEAR') return 'ending';
  if (state.loadingStarted) return 'solitary_loading';
  if (state.capturedToSolitary && !state.solitaryCleared) return 'solitary_loading';
  if (state.guardRoomStarted && !state.capturedToSolitary) return 'corridor_guard';
  if (state.corridorStarted && !state.guardRoomStarted) return 'corridor_guard';
  return 'cell';
}

function setBgmTrack(key, forcePlay = false) {
  const settings = ensureAudioSettings();
  const src = AUDIO_PATHS.bgm[key];
  if (!src || !bgmAudio) return;

  if (currentBgmKey !== key || bgmDetachedForBackground) {
    currentBgmKey = key;
    if (!appAudioActive) return;
    bgmDetachedForBackground = false;
    bgmAudio.pause();
    bgmAudio.src = src;
    try { bgmAudio.currentTime = 0; } catch (_) {}
    bgmAudio.load();
  }

  if (!settings.bgmEnabled || !audioUnlocked || !appAudioActive || bgmHold) {
    bgmAudio.pause();
    return;
  }

  if (bgmAudio.paused || forcePlay) safePlayBgm();
}

function syncBgmForCurrentScreen(forcePlay = false) {
  setBgmTrack(getBgmKeyForState(), forcePlay);
}

function playEndingBgm() {
  if (!audioUnlocked) audioUnlocked = true;
  setBgmHold(false);
  setBgmTrack('ending', true);
}

function playSE(key, volumeScale = 1) {
  const settings = ensureAudioSettings();
  if (!settings.seEnabled || !audioUnlocked || !appAudioActive) return;
  const src = AUDIO_PATHS.se[key];
  if (!src) return;

  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.volume = Math.max(0, Math.min(1, AUDIO_VOLUME.se * volumeScale));
  activeSeAudios.add(audio);
  const cleanup = () => activeSeAudios.delete(audio);
  audio.addEventListener('ended', cleanup, { once: true });
  audio.addEventListener('error', cleanup, { once: true });
  audio.play().catch(() => cleanup());
}

function playHotspotTapSE(action) {
  if (!action || !action.type) return;
  const type = action.type;

  if ([
    'guardKeypadDigit', 'guardKeypadClear', 'guardKeypadEnter',
    'loadingExitDigit', 'loadingExitClear', 'loadingExitEnter'
  ].includes(type)) {
    playSE('keypad', 0.72);
    return;
  }

  if (type === 'solitaryLeverMove') {
    playSE('lever', 0.86);
    return;
  }

  if ([
    'faucetButton', 'toiletKnob', 'chairLeg',
    'cycleBedInput', 'cyclePowerDigit',
    'cycleScheduleDigit', 'cycleScheduleZone',
    'monitorButton', 'cycleChannel', 'mazeMove',
    'loadingSymbol', 'loadingDestination',
    'loadingMaintDirection', 'loadingSliderCycle'
  ].includes(type)) {
    playSE('button', 0.68);
  }
}
