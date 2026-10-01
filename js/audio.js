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
const activeSeAudios = new Set();

function ensureAudioSettings() {
  const defaults = { bgmEnabled: true, seEnabled: true };
  state.audioSettings = Object.assign({}, defaults, state.audioSettings || {});
  return state.audioSettings;
}

function initAudioSystem() {
  ensureAudioSettings();

  if (!bgmAudio) {
    bgmAudio = new Audio();
    bgmAudio.loop = true;
    bgmAudio.preload = 'auto';
    bgmAudio.volume = AUDIO_VOLUME.bgm;
  }

  // iOS / mobile browserの自動再生制限対策。
  const unlock = () => {
    if (audioUnlocked) return;
    audioUnlocked = true;
    syncBgmForCurrentScreen();
  };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('keydown', unlock, { once: true, capture: true });

  const bgmBtn = document.getElementById('btn-bgm-toggle');
  const seBtn = document.getElementById('btn-se-toggle');
  if (bgmBtn) bgmBtn.addEventListener('click', () => {
    const settings = ensureAudioSettings();
    settings.bgmEnabled = !settings.bgmEnabled;
    updateAudioSettingLabels();
    saveState();
    if (settings.bgmEnabled) {
      audioUnlocked = true;
      syncBgmForCurrentScreen(true);
    } else if (bgmAudio) {
      bgmAudio.pause();
    }
  });
  if (seBtn) seBtn.addEventListener('click', () => {
    const settings = ensureAudioSettings();
    settings.seEnabled = !settings.seEnabled;
    updateAudioSettingLabels();
    saveState();
  });

  initAudioLifecycleHandling();
  updateAudioSettingLabels();
}

function initAudioLifecycleHandling() {
  if (audioLifecycleInitialized) return;
  audioLifecycleInitialized = true;

  const setActive = (isActive) => {
    const nextActive = !!isActive;
    if (appAudioActive === nextActive) return;
    appAudioActive = nextActive;

    if (!appAudioActive) {
      if (bgmAudio && !bgmAudio.paused) bgmAudio.pause();
      activeSeAudios.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) { /* noop */ }
      });
      activeSeAudios.clear();
      return;
    }

    // 復帰時は現在の曲・再生位置を維持したまま再開する。
    if (ensureAudioSettings().bgmEnabled && audioUnlocked) {
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
  const bgmBtn = document.getElementById('btn-bgm-toggle');
  const seBtn = document.getElementById('btn-se-toggle');
  if (bgmBtn) bgmBtn.textContent = `BGM：${settings.bgmEnabled ? 'ON' : 'OFF'}`;
  if (seBtn) seBtn.textContent = `効果音：${settings.seEnabled ? 'ON' : 'OFF'}`;
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

  if (currentBgmKey !== key) {
    currentBgmKey = key;
    bgmAudio.pause();
    bgmAudio.src = src;
    bgmAudio.currentTime = 0;
    bgmAudio.load();
  }

  if (!settings.bgmEnabled || !audioUnlocked || !appAudioActive) {
    bgmAudio.pause();
    return;
  }

  if (bgmAudio.paused || forcePlay) {
    bgmAudio.play().catch(() => {
      // 初回ユーザー操作前など、ブラウザ側で拒否された場合は次の操作時に再試行する。
    });
  }
}

function syncBgmForCurrentScreen(forcePlay = false) {
  setBgmTrack(getBgmKeyForState(), forcePlay);
}

function playEndingBgm() {
  if (!audioUnlocked) audioUnlocked = true;
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
