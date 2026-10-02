// ============================================================
// main.js — 画面描画・操作処理（仕様30〜70対応）
// ============================================================

const WALL_ORDER = ['WALL_1', 'WALL_2', 'WALL_3', 'WALL_4'];
let inputLocked = false; // 仕様49：タップ連打対策
let pressedToiletKnob = null;
let toiletButtonAnimating = false;
let hasContinueSave = false;
let titleScreenActive = true;
let openingLineIndex = 0;
let openingTimer = null;
let openingFinishing = false;
const pressAreaRects = {
  chair: {
    leftFront:  { x: 0.050, y: 0.105, w: 0.130, h: 0.100 },
    rightFront: { x: 0.814, y: 0.105, w: 0.130, h: 0.100 },
    leftBack:   { x: 0.071, y: 0.73, w: 0.130, h: 0.100 },
    rightBack:  { x: 0.800, y: 0.73, w: 0.130, h: 0.100 },
  },
  toilet: {
    big:   { x: 0.259, y: 0.243, w: 0.300, h: 0.23 },
    small: { x: 0.314, y: 0.578, w: 0.200, h: 0.13 },
  },
};
const mattressDotPositions = [
  { x: 0.225, y: 0.310 },
  { x: 0.498, y: 0.310 },
  { x: 0.768, y: 0.308 },
  { x: 0.225, y: 0.492 },
  { x: 0.502, y: 0.492 },
  { x: 0.772, y: 0.492 },
  { x: 0.221, y: 0.683 },
  { x: 0.502, y: 0.685 },
  { x: 0.772, y: 0.682 }
];
const faucetBarRects = [
  { x: 0.255, y: 0.455, w: 0.10, h: 0.10 },
  { x: 0.385, y: 0.455, w: 0.10, h: 0.10 },
  { x: 0.515, y: 0.455, w: 0.10, h: 0.10 },
  { x: 0.645, y: 0.457, w: 0.10, h: 0.10 },
];

// ---------- 起動 ----------
window.addEventListener('DOMContentLoaded', () => {
  const restored = loadState();
  hasContinueSave = restored;
  bindGlobalUI();
  initFloatingMemo();
  initAudioSystem();
  // 起動直後は必ずタイトル画面。BGMはゲーム開始まで待機する。
  if (typeof setBgmHold === 'function') setBgmHold(true);
  render();
  showTitleScreen();
  if (typeof initAds === 'function') initAds();
});

function bindGlobalUI() {
  document.getElementById('btn-left').addEventListener('click', () => moveWall(-1));
  document.getElementById('btn-right').addEventListener('click', () => moveWall(1));
  document.getElementById('btn-back').addEventListener('click', backZoom);
  document.getElementById('btn-hint').addEventListener('click', openHintPanel);
  document.getElementById('btn-menu').addEventListener('click', toggleMenu);
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  document.getElementById('btn-menu-return').addEventListener('click', closeMenu);
  document.getElementById('btn-menu-title').addEventListener('click', returnToTitleFromMenu);

  const adPrivacyBtn = document.getElementById('btn-ad-privacy');
  if (adPrivacyBtn && typeof showAdPrivacyOptions === 'function') {
    adPrivacyBtn.addEventListener('click', showAdPrivacyOptions);
  }

  document.getElementById('btn-title-new').addEventListener('click', startNewGameFromTitle);
  document.getElementById('btn-title-continue').addEventListener('click', continueGameFromTitle);
  document.getElementById('btn-title-settings').addEventListener('click', openTitleSettings);
  document.getElementById('title-settings-close').addEventListener('click', closeTitleSettings);
  document.getElementById('opening-overlay').addEventListener('pointerdown', advanceOpeningOnTap);

  document.getElementById('item-detail-close').addEventListener('click', closeItemDetail);
  document.getElementById('hint-close').addEventListener('click', closeHintPanel);
  document.getElementById('btn-clear-return').addEventListener('click', returnToTitle);
  document.getElementById('btn-memo').addEventListener('click', openFloatingMemo);
  document.getElementById('memo-close').addEventListener('click', closeFloatingMemo);
  document.getElementById('memo-opacity').addEventListener('click', toggleMemoOpacity);
  document.getElementById('memo-clear').addEventListener('click', clearFloatingMemo);

  // 壁移動は画面上のナビゲーションボタンのみで行う。
  // iOSの横スワイプによる壁切替は使用しない。
}

// ---------- タイトル / オープニング ----------
function updateTitleContinueButton() {
  const btn = document.getElementById('btn-title-continue');
  if (!btn) return;
  btn.disabled = !hasContinueSave;
  btn.setAttribute('aria-disabled', hasContinueSave ? 'false' : 'true');
}

function showTitleScreen() {
  titleScreenActive = true;
  const title = document.getElementById('title-screen');
  if (title) {
    title.classList.add('show');
    title.setAttribute('aria-hidden', 'false');
  }
  const opening = document.getElementById('opening-overlay');
  if (opening) {
    opening.classList.remove('show', 'reveal-stage');
    opening.setAttribute('aria-hidden', 'true');
  }
  closeTitleSettings();
  const memo = ensureMemoState();
  memo.open = false;
  const memoWin = document.getElementById('memo-window');
  if (memoWin) {
    memoWin.classList.remove('show');
    memoWin.setAttribute('aria-hidden', 'true');
  }
  updateTitleContinueButton();
  if (typeof setBgmHold === 'function') setBgmHold(true);
}

function hideTitleScreen() {
  titleScreenActive = false;
  const title = document.getElementById('title-screen');
  if (title) {
    title.classList.remove('show');
    title.setAttribute('aria-hidden', 'true');
  }
  closeTitleSettings();
}

function startNewGameFromTitle() {
  if (hasContinueSave && !confirm('現在の進行状況を削除して最初から始めますか？')) return;
  resetState();
  state.runStartedAt = Date.now();
  hasContinueSave = true;
  render();
  saveState();
  hideTitleScreen();
  playOpeningIntro();
}

function continueGameFromTitle() {
  if (!hasContinueSave) return;
  hideTitleScreen();
  if (typeof setBgmHold === 'function') setBgmHold(false);
  render();
  setTimeout(() => toast('前回の進行状況を復元しました。'), 120);
}

function openTitleSettings() {
  const panel = document.getElementById('title-settings-panel');
  if (panel) panel.classList.add('show');
  if (typeof updateAudioSettingLabels === 'function') updateAudioSettingLabels();
}

function closeTitleSettings() {
  const panel = document.getElementById('title-settings-panel');
  if (panel) panel.classList.remove('show');
}

function playOpeningIntro() {
  clearTimeout(openingTimer);
  openingLineIndex = 0;
  openingFinishing = false;
  if (typeof setBgmHold === 'function') setBgmHold(true);

  const overlay = document.getElementById('opening-overlay');
  const lines = Array.from(document.querySelectorAll('#opening-lines p'));
  lines.forEach((line) => line.classList.remove('visible'));
  if (!overlay) return;
  overlay.classList.remove('reveal-stage');
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');

  openingTimer = setTimeout(showNextOpeningLine, 450);
}

function showNextOpeningLine() {
  clearTimeout(openingTimer);
  const lines = Array.from(document.querySelectorAll('#opening-lines p'));
  if (openingLineIndex < lines.length) {
    lines[openingLineIndex].classList.add('visible');
    openingLineIndex += 1;
    openingTimer = setTimeout(showNextOpeningLine, 1450);
    return;
  }
  openingTimer = setTimeout(finishOpeningIntro, 1200);
}

function advanceOpeningOnTap() {
  if (openingFinishing) return;
  const overlay = document.getElementById('opening-overlay');
  if (!overlay || !overlay.classList.contains('show')) return;
  clearTimeout(openingTimer);
  const lines = Array.from(document.querySelectorAll('#opening-lines p'));
  if (openingLineIndex < lines.length) {
    lines[openingLineIndex].classList.add('visible');
    openingLineIndex += 1;
    openingTimer = setTimeout(showNextOpeningLine, 900);
  } else {
    finishOpeningIntro();
  }
}

function finishOpeningIntro() {
  if (openingFinishing) return;
  openingFinishing = true;
  clearTimeout(openingTimer);
  const overlay = document.getElementById('opening-overlay');
  if (!overlay) return;
  overlay.classList.add('reveal-stage');

  // 牢屋が見え始めるタイミングでBGMを再開する。
  setTimeout(() => {
    if (typeof setBgmHold === 'function') setBgmHold(false);
  }, 420);

  setTimeout(() => {
    overlay.classList.remove('show', 'reveal-stage');
    overlay.setAttribute('aria-hidden', 'true');
    openingFinishing = false;
    state.runStartedAt = Date.now();
    saveState();
  }, 1450);
}

function isZoomed() {
  return SCREENS[state.currentScreen].type === 'zoom';
}

function moveWall(dir) {
  if (isZoomed() || inputLocked) return;
  const screen = SCREENS[state.currentScreen];
  if (screen.type !== 'wall') return; // STAGE2「廊下」等ではmoveWall()を使わない
  const cur = screen.wallIndex;
  const next = (cur + dir + WALL_ORDER.length) % WALL_ORDER.length;
  state.currentScreen = WALL_ORDER[next];
  state.screenStack = [];
  render();
}

function markClueViewed(target) {
  // STAGE1：一筆書きは、鉄格子の記号配置と机下の順番を両方確認してから成立。
  if (target === 'Z_W1_SYMBOLS') state.patternSymbolsViewed = true;
  if (target === 'Z_W4_DESK_UNDER') state.patternOrderViewed = true;

  // STAGE2：製造番号・点灯後の電光掲示板を実際に確認した記録。
  if (target === 'Z_GUARD_SERIAL') state.guardSerialViewed = true;

  // STAGE3：時計・勤務表・ロッカー・鍵配置メモを確認した記録。
  if (target === 'Z_GUARD_CLOCK') state.guardClockViewed = true;
  if (target === 'Z_GUARD_SCHEDULE') state.guardScheduleViewed = true;
  if (target === 'Z_GUARD_LOCKERS') state.guardLockersViewed = true;
  if (target === 'Z_GUARD_KEY_NOTE') state.guardKeyNoteViewed = true;
}

function goZoom(target) {
  markClueViewed(target);
  state.screenStack.push(state.currentScreen);
  state.currentScreen = target;
  render();
}

function backZoom() {
  if (state.screenStack.length === 0) return;
  state.currentScreen = state.screenStack.pop();
  render();
}

// ---------- 描画 ----------
function render() {
  const screen = SCREENS[state.currentScreen];
  const bg = typeof screen.bg === 'function' ? screen.bg(state) : screen.bg;
  const img = document.getElementById('stage-image');
  img.src = bg;
  img.onerror = () => {
    img.src = 'assets/images/cell/ui/missing.webp';
  };

  document.getElementById('btn-back').style.display = screen.type === 'zoom' ? 'flex' : 'none';
  // STAGE1の壁切替も画面内の共通矢印UIへ統一するため、旧左右ボタンは非表示。
  document.getElementById('btn-left').style.display = 'none';
  document.getElementById('btn-right').style.display = 'none';

  renderHotspots(screen);
  renderInventory();
  updateHintButtonBadge();
  // タイトルを表示しているだけの初回起動では、未開始の初期stateをセーブしない。
  if (!titleScreenActive) saveState();
  if (typeof syncBgmForCurrentScreen === 'function') syncBgmForCurrentScreen();

  if (state.cleared && !state.clearOverlayDismissed) showClearScreen();
}

function buildDirectionalArrowSvg(dir) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 48 48');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('direction-nav-icon');

  const path = document.createElementNS(ns, 'path');
  const paths = {
    left:  'M30 12 L18 24 L30 36',
    right: 'M18 12 L30 24 L18 36',
    up:    'M12 30 L24 18 L36 30',
    down:  'M12 18 L24 30 L36 18',
  };
  path.setAttribute('d', paths[dir]);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '4.4');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  return svg;
}

function makeDirectionalNavButton(dir, label, onClick, extraClass = '') {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = ('guard-wall-nav guard-wall-nav-' + dir + ' direction-nav-button ' + extraClass).trim();
  btn.setAttribute('aria-label', label);
  btn.title = label;
  btn.appendChild(buildDirectionalArrowSvg(dir));
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return btn;
}

function appendStage1WallNav(screen, layer) {
  if (!screen || screen.type !== 'wall') return;
  layer.appendChild(makeDirectionalNavButton('left', '左の壁を見る', () => moveWall(-1), 'stage1-wall-nav'));
  layer.appendChild(makeDirectionalNavButton('right', '右の壁を見る', () => moveWall(1), 'stage1-wall-nav'));
}

function renderHotspots(screen) {
  const layer = document.getElementById('hotspot-layer');
  layer.innerHTML = '';

  // マットレスの一筆書き入力レイヤー
  if (screen.custom === 'mattress' && !state.solved.pattern) {
    layer.appendChild(buildMattressInputLayer());
  }

  // 蛇口の4段階表示。内部値だけでなく見た目にも現在の高さを反映する。
  if (screen.custom === 'faucet') {
    layer.appendChild(buildFaucetHeightLayer());
  }

  // 押し込み演出はHotspot自体を変形させず、実際の丸いボタン部分だけに重ねる。
  // Hotspotはクリック判定用の四角形のまま維持する。
  appendPressVisuals(layer);

  // STAGE1もSTAGE3/4と同じ画面切替矢印UIを使用する。
  appendStage1WallNav(screen, layer);

  // ---- STAGE2「廊下」追加分：カスタムUI（ベッド入力/電源桁/7セグ/テンキー表示） ----
  if (typeof renderCorridorCustom === 'function') renderCorridorCustom(screen, layer);
  if (typeof renderSolitaryCustom === 'function') renderSolitaryCustom(screen, layer);
  if (typeof renderLoadingCustom === 'function') renderLoadingCustom(screen, layer);

  (screen.hotspots || []).forEach((hs) => {
  if (hs.visibleIf && !hs.visibleIf(state)) return;

  const el = document.createElement('div');
  el.className = 'hotspot';

  // 追加
  el.dataset.hotspotId = hs.id;

  el.style.left = (hs.x * 100) + '%';
  el.style.top = (hs.y * 100) + '%';
  el.style.width = (hs.w * 100) + '%';
  el.style.height = (hs.h * 100) + '%';

  if (hs.itemImage && ITEMS[hs.itemImage]) {
    el.classList.add('item-overlay-hotspot');

    const overlayImg = document.createElement('img');
    overlayImg.className = 'scene-item-overlay';

    if (hs.overlayScale) {
      overlayImg.style.width = `${hs.overlayScale * 100}%`;
      overlayImg.style.height = `${hs.overlayScale * 100}%`;
    }

    overlayImg.src = ITEMS[hs.itemImage].icon;
    overlayImg.alt = ITEMS[hs.itemImage].name;

    overlayImg.onerror = () => {
      overlayImg.src = 'assets/images/cell/ui/missing_item.png';
    };

    el.appendChild(overlayImg);
  }

  if (hs.layoutOnly) {
    el.style.pointerEvents = 'none';
  } else {
    el.addEventListener('click', () => {
      handleHotspotTap(hs);
    });
  }

  layer.appendChild(el);
});
}

function appendPressVisuals(layer) {
  if (!layer) return;

  // イス脚：記号入りの丸い脚先だけを押し込んで見せる。
  if (state.currentScreen === 'Z_W4_CHAIR' && state.chairFlipped && !state.solved.chair) {
    state.chairInputSeq.forEach((leg) => {
      const r = pressAreaRects.chair[leg];
      if (r) layer.appendChild(makePressVisual(r, 'chair-cap-press'));
    });
  }

  // トイレ：画像上の実際の丸い「大」「小」ボタンだけを短時間沈ませる。
  if (state.currentScreen === 'Z_W3_TOILET_BUTTONS' && pressedToiletKnob) {
    const r = pressedToiletKnob === '大' ? pressAreaRects.toilet.big : pressAreaRects.toilet.small;
    if (r) layer.appendChild(makePressVisual(r, 'toilet-button-press'));
  }
}

function makePressVisual(rect, className) {
  const el = document.createElement('div');
  el.className = `press-visual ${className}`;
  el.style.left = `${rect.x * 100}%`;
  el.style.top = `${rect.y * 100}%`;
  el.style.width = `${rect.w * 100}%`;
  el.style.height = `${rect.h * 100}%`;
  return el;
}

// ---------- ホットスポット操作の振り分け ----------
function handleHotspotTap(hs) {
  if (inputLocked) return;
  const action = hs && hs.action;
  if (!action || !action.type) return;
  if (typeof playHotspotTapSE === 'function') playHotspotTapSE(action);
  switch (action.type) {
    case 'zoom': goZoom(action.target); break;
    case 'doorAction': doorAction(); break;
    case 'clearCell': clearCell(); break;
    case 'takeItem': takeItem(action.item); break;
    case 'useItemOnDeadspot': retrieveKeyFromDeadspot(); break;
    case 'useKeyOnLock': useKeyOnLock(); break;
    case 'bedUnderPart': bedUnderPart(); break;
    case 'liftPillow': liftPillow(); break;
    case 'openBlanket': openBlanket(); break;
    case 'openMattressPanel': openMattressPanel(); break;
    case 'useWrenchOnFrame': useWrenchOnFrame(); break;
    case 'rubWall': rubWall(); break;
    case 'mirrorSurface': mirrorSurface(); break;
    case 'removeMirrorScrew': removeMirrorScrew(); break;
    case 'faucetBody': faucetBody(); break;
    case 'faucetButton': faucetButton(action.index); break;
    case 'toiletKnob': toiletKnob(action.which); break;
    case 'openToiletCover': openToiletCover(); break;
    case 'tapToiletPaper': tapToiletPaper(); break;
    case 'openDrawer': openDrawer(); break;
    case 'flipChair': flipChair(); break;
    case 'chairLeg': chairLeg(action.leg); break;
    case 'useVent': useVent(); break;
    default:
      // ---- STAGE5「搬入口」：搬入口画面では専用ディスパッチャへ直接委譲 ----
      if (state.loadingStarted && typeof handleLoadingAction === 'function' &&
          (String(state.currentScreen || '').startsWith('LOADING') || String(action.type || '').startsWith('loading') ||
           ['DESTINATION_PANEL_ZOOM','MAINT_BOX_ZOOM','D_CABINET_ZOOM','LIGHTBOX_ZOOM','PLATE_SLOTS_ZOOM','SYMBOL_DISPLAY_ZOOM','EMPLOYEE_EXIT_PANEL_ZOOM','EMPLOYEE_EXIT_BOX_ZOOM'].includes(state.currentScreen))) {
        handleLoadingAction(action, hs);
      } else if (typeof handleCorridorAction === 'function') {
        // ---- STAGE2〜4：既存ディスパッチチェーンを維持 ----
        handleCorridorAction(action, hs);
      }
      break;
  }
}

function lockInput(ms) {
  inputLocked = true;
  setTimeout(() => { inputLocked = false; }, ms || 250);
}

// ---------- 汎用 ----------
function addItem(itemId) {
  if (state.items[itemId]) return;
  state.items[itemId] = true;
  state.pickedUp = state.pickedUp || {};
  state.pickedUp[itemId] = true;
  if (typeof playSE === 'function') playSE('item_get');
  const itemName = ITEMS[itemId] ? ITEMS[itemId].name : itemId;
  if (['plate_a', 'plate_b', 'plate_c'].includes(itemId)) {
    toast(`${itemName}を手に入れた。ここでは使い道がなさそうだ。持っておこう。`);
  } else {
    toast(itemName + ' を手に入れた。');
  }
  render();
}

function takeItem(itemId) {
  addItem(itemId);
}

function requireSelected(itemId) {
  return state.selectedItem === itemId;
}

function consumeItem(itemId) {
  if (!state.items[itemId]) return;
  delete state.items[itemId];
  if (state.selectedItem === itemId) state.selectedItem = null;
  if (state.detailItem === itemId) {
    state.detailItem = null;
    state.detailViewMode = 'front';
    const panel = document.getElementById('item-detail');
    if (panel) panel.classList.remove('show');
  }
}

// ---------- WALL_1: 鍵・扉 ----------
function retrieveKeyFromDeadspot() {
  if (!requireSelected('retrieval_rod')) {
    toast('ここでは使えそうにない。');
    return;
  }
  if (state.items.cell_key) return;
  playRetrievalAnimation(() => {
    addItem('cell_key');
    state.selectedItem = null;
    render();
  });
}

function playRetrievalAnimation(done) {
  const frames = [
    IMG + 'zoom/vent_key_retrieve_1.webp',
    IMG + 'zoom/vent_key_retrieve_2.webp',
    IMG + 'zoom/vent_key_retrieve_3.webp',
    IMG + 'zoom/vent_key_retrieve_4.webp',
    IMG + 'zoom/vent_key_retrieve_5.webp',
  ];

  const FRAME_MS = 550;
  const END_HOLD_MS = 550;
  const totalMs = (frames.length - 1) * FRAME_MS + END_HOLD_MS + 200;

  lockInput(totalMs);

  const overlay = document.getElementById('anim-overlay');
  if (!overlay) {
    done();
    return;
  }

  // 先読みして、コマ切り替え時の白抜け・ちらつきを防ぐ。
  frames.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  overlay.classList.remove('attach', 'blackout');
  overlay.innerHTML = '';

  const frameImg = document.createElement('img');
  frameImg.alt = '';
  frameImg.draggable = false;
  frameImg.style.width = '100%';
  frameImg.style.height = '100%';
  frameImg.style.objectFit = 'contain';
  frameImg.style.display = 'block';
  frameImg.style.pointerEvents = 'none';

  overlay.appendChild(frameImg);
  overlay.classList.add('show');

  let index = 0;

  function showFrame() {
    frameImg.src = frames[index];

    if (index >= frames.length - 1) {
      setTimeout(() => {
        overlay.classList.remove('show', 'attach');
        overlay.innerHTML = '';
        done();
      }, END_HOLD_MS);
      return;
    }

    setTimeout(() => {
      index += 1;
      showFrame();
    }, FRAME_MS);
  }

  showFrame();
}

// ---------- 最終脱出演出 ----------
function playEndingSequence(done) {
  if (typeof playEndingBgm === 'function') playEndingBgm();
  const frames = [
    {
      src: 'assets/images/loading/main/loading_1_open.webp',
      text: '監獄から脱出できた。',
      duration: 1500,
    },
    {
      src: 'assets/images/loading/ending/ending_1.webp',
      text: '…………',
      duration: 1800,
    },
    {
      src: 'assets/images/loading/ending/ending_2.webp',
      text: 'だが、ここはどこだろう。',
      duration: 2400,
    },
  ];

  const overlay = document.getElementById('anim-overlay');
  if (!overlay) {
    done();
    return;
  }

  const totalMs = frames.reduce((sum, frame) => sum + frame.duration, 0) + 300;
  lockInput(totalMs);

  // 先読みして、画像切り替え時のちらつきを抑える。
  frames.forEach((frame) => {
    const preload = new Image();
    preload.src = frame.src;
  });

  overlay.classList.remove('attach', 'blackout');
  overlay.innerHTML = '';

  const frameImg = document.createElement('img');
  frameImg.className = 'ending-sequence-image';
  frameImg.alt = '';
  frameImg.draggable = false;

  const caption = document.createElement('div');
  caption.className = 'ending-sequence-caption';

  overlay.appendChild(frameImg);
  overlay.appendChild(caption);
  overlay.classList.add('show', 'ending-sequence');

  let index = 0;

  function showFrame() {
    const frame = frames[index];
    frameImg.src = frame.src;
    caption.textContent = frame.text;

    setTimeout(() => {
      if (index >= frames.length - 1) {
        overlay.classList.remove('show', 'ending-sequence');
        overlay.innerHTML = '';
        done();
        return;
      }

      index += 1;
      showFrame();
    }, frame.duration);
  }

  showFrame();
}

function doorAction() {
  if (state.doorOpen) {
    clearCell();
    return;
  }
  goZoom('Z_W1_DOOR');
}

function useKeyOnLock() {
  if (!requireSelected('cell_key')) {
    toast('鍵穴がある。牢屋の鍵が必要だ。');
    return;
  }
  if (state.doorOpen) return;
  lockInput(1000);
  if (typeof playSE === 'function') playSE('unlock');
  toast('鍵を差し込んで回した……ロックが外れた。');
  setTimeout(() => {
    state.doorOpen = true;
    consumeItem('cell_key');
    state.currentScreen = 'WALL_1';
    state.screenStack = [];
    render();
  }, 700);
}

function clearCell() {
  // ---- STAGE2「廊下」接続（仕様3）：仮クリア画面は表示せず、直接CORRIDOR_1へ ----
  if (!state.doorOpen || state.corridorStarted) return;

  // プレートAは後半ステージで必須。取り忘れたままSTAGE2へ進めないようにする。
  if (!state.pickedUp || !state.pickedUp.plate_a) {
    toast('まだ、この牢屋で手に入れていないものがありそうだ。');
    return;
  }

  // STAGE1クリア時に所持品を整理し、後半へ持ち越すのはプレートAだけにする。
  // pickedUp（取得履歴）は残し、items（現在所持）だけを整理する。
  state.items = { plate_a: true };
  state.selectedItem = null;
  state.detailItem = null;
  state.detailViewMode = 'front';
  const detailPanel = document.getElementById('item-detail');
  if (detailPanel) detailPanel.classList.remove('show');

  state.cellStageCleared = true;
  state.corridorStarted = true;
  if (typeof playSE === 'function') playSE('door_open');
  state.currentScreen = 'CORRIDOR_1';
  state.screenStack = [];
  render();
  toast('牢屋から出られた。ここは廊下のようだ。');
}

// ---------- WALL_2: ベッド ----------
function bedUnderPart() {
  if (state.items.magnet_part) return;
  if (requireSelected('rod_hook') || requireSelected('rod_hook_string')) {
    state.solved.bedUnder = true;
    addItem('magnet_part');
  } else if (requireSelected('rod')) {
    toast('届きそうだが、うまく引っ掛けられない。');
  } else {
    toast('奥に何か落ちている。手では届かない。');
  }
}

function liftPillow() {
  state.pillowLifted = true;
  render();
}

function openBlanket() {
  state.blanketOpen = true;
  toast('毛布をめくった。裏に水滴の模様がある。');
  render();
}

function openMattressPanel() {
  if (!state.solved.pattern) return;
  state.mattressPanelOpen = true;
  toast('パネルが完全に横へスライドした。');
  render();
}

function useWrenchOnFrame() {
  if (state.solved.frame) return;
  if (!requireSelected('wrench')) {
    toast('ボルトで固定されている。素手では外せそうにない。');
    return;
  }
  state.solved.frame = true;
  consumeItem('wrench');
  toast('カチッ。ボルトが外れ、補強棒が外れた。');
  render();
}

function rubWall() {
  if (state.wallRubbingDone) return;
  if (!state.wallPaperPlaced) {
    if (requireSelected('toilet_paper')) {
      delete state.items.toilet_paper;
      state.selectedItem = null;
      state.wallPaperPlaced = true;
      toast('トイレットペーパーを壁に貼った。鉛筆でこすってみよう。');
      render();
    } else {
      toast('何か刻まれているようだが、うまく読めない。');
    }
    return;
  }
  if (requireSelected('pencil')) {
    state.wallRubbingDone = true;
    consumeItem('pencil');
    toast('月→太陽→波→雷……模様が浮かび上がった。');
    render();
  } else {
    toast('壁に貼った紙の上を、何かでこすってみよう。');
  }
}

// ---------- WALL_3: トイレ・手洗い ----------
function mirrorSurface() {
  if (!state.mirrorClean) {
    if (requireSelected('cloth_wet')) {
      state.mirrorClean = true;
      consumeItem('cloth_wet');
      toast('鏡がきれいになった。高さの違う棒がたくさん並んでいる。');
      render();
    } else {
      toast('鏡が汚れていてよく見えない。');
    }
    return;
  }
  if (!state.coreOnMirror) {
    if (requireSelected('toilet_paper_core_open')) {
      state.coreOnMirror = true;
      consumeItem('toilet_paper_core_open');
      toast('4本だけが切り込みから見える。');
      render();
    } else {
      toast('たくさんの棒があり、どれが答えか分からない。');
    }
    return;
  }
  toast('特に変化はない。');
}

function removeMirrorScrew() {
  if (state.mirrorRemoved) return;
  if (!state.solved.faucet) {
    toast('まだねじを外す段階ではなさそうだ。');
    return;
  }
  if (!requireSelected('faucet_handle')) {
    toast('特殊な形のねじだ。合う工具が必要だ。');
    return;
  }
  state.mirrorRemoved = true;
  state.coreOnMirror = false;
  consumeItem('faucet_handle');
  state.items.mirror = true;
  state.pickedUp.mirror = true;
  toast('ねじが外れた。鏡全体を取り外した。');
  state.currentScreen = 'Z_W3_MIRROR';
  state.screenStack = ['WALL_3', 'Z_W3_SINK'];
  render();
}

function faucetBody() {
  if (requireSelected('cloth')) {
    delete state.items.cloth;
    state.items.cloth_wet = true;
    state.selectedItem = 'cloth_wet';
    toast('布を濡らした。');
    render();
  } else {
    toast('水が流れた。');
  }
}

function faucetButton(index) {
  const h = state.faucetHeights;
  h[index] = (h[index] % 4) + 1;
  // 鏡に展開したトイレットペーパーの芯を重ねて答えを確認した後でのみ解除する。
  // 芯を重ねる前でも高さの変更自体は可能だが、2・4・1・3になっても未クリアのまま。
  if (state.coreOnMirror && !state.solved.faucet && JSON.stringify(h) === JSON.stringify(PUZZLES.faucetAnswer)) {
    state.solved.faucet = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('カチッ。ハンドルの固定が外れた。');
  }
  render();
}

function toiletKnob(which) {
  if (state.solved.toilet) {
    toast('水が流れた。');
    return;
  }
  if (toiletButtonAnimating) return;

  // 押した瞬間はボタンを少し沈ませ、短時間後に戻してから入力を確定する。
  // 同じボタンを連続で使う謎なので、毎回必ず元の位置へ戻る。
  toiletButtonAnimating = true;
  pressedToiletKnob = which;
  render();

  setTimeout(() => {
    state.toiletInputSeq.push(which);
    pressedToiletKnob = null;
    toiletButtonAnimating = false;

    if (state.toiletInputSeq.length >= 5) {
      const seq = state.toiletInputSeq.slice(-5);
      if (JSON.stringify(seq) === JSON.stringify(PUZZLES.toiletSequence) && state.blanketOpen) {
        state.solved.toilet = true;
        if (typeof playSE === 'function') playSE('correct');
        state.currentScreen = 'Z_W3_TOILET_SIDE';
        state.screenStack = ['WALL_3'];
        toast('カチッ。小さな金属カバーが浮いた。');
      } else if (JSON.stringify(seq) === JSON.stringify(PUZZLES.toiletSequence)) {
        // 毛布裏の手掛かりを見る前に偶然正解しても進行させない。
        toast('水が流れた。まだ何か手掛かりがありそうだ。');
      } else {
        toast('水が流れた。');
      }
      state.toiletInputSeq = [];
    }
    render();
  }, 170);
}

function openToiletCover() {
  if (!state.solved.toilet || state.items.small_key) return;
  addItem('small_key');
}

function tapToiletPaper() {
  if (state.toiletPaperUses >= 4) return;
  state.toiletPaperUses++;
  if (state.toiletPaperUses === 1) {
    addItem('toilet_paper');
  } else if (state.toiletPaperUses >= 4) {
    toast('紙を使い切った。芯だけが残った。');
    addItem('toilet_paper_core');
  } else {
    toast('少量の紙が出た。');
  }
  render();
}

// ---------- WALL_4: 机・イス ----------
function openDrawer() {
  if (state.drawerOpen) return;
  if (!requireSelected('small_key')) {
    toast('鍵がかかっている。');
    return;
  }
  state.drawerOpen = true;
  consumeItem('small_key');
  if (typeof playSE === 'function') playSE('unlock');
  toast('引き出しが開いた。');
  render();
}

function flipChair() {
  if (state.solved.chair) return;
  state.chairFlipped = !state.chairFlipped;
  render();
}

function chairLeg(leg) {
  if (state.solved.chair || inputLocked) return;

  // 一度押した脚は4つすべて押すまで沈んだままにする。
  // すでに押し込まれている脚は再入力できない。
  if (state.chairInputSeq.includes(leg)) return;

  state.chairInputSeq.push(leg);
  render();

  if (state.chairInputSeq.length < 4) return;

  // 4つ目の押し込みも見えるよう少し待ってから判定する。
  inputLocked = true;
  const seq = state.chairInputSeq.slice(0, 4);
  const correct = JSON.stringify(seq) === JSON.stringify(PUZZLES.chairSequence);

  setTimeout(() => {
    // 壁のこすり出しを確認していない場合は、たとえ偶然正解順でも解除しない。
    if (!state.wallRubbingDone) {
      state.chairInputSeq = [];
      toast('何か手掛かりがないと、押す順番は分からなさそうだ。');
    } else if (correct) {
      state.solved.chair = true;
      state.chairInputSeq = [];
      if (typeof playSE === 'function') playSE('correct');
      toast('カチッ。座面裏の仕掛けが外れた。');
    } else {
      state.chairInputSeq = [];
      toast('4つの脚先が元へ戻った。');
    }
    inputLocked = false;
    render();
  }, 420);
}

function useVent() {
  if (state.items.cell_key) {
    toast('もう何も落ちていない。');
    return;
  }

  if (!state.keyLocationFound) {
    if (!requireSelected('mirror_piece')) {
      toast('奥は暗く、角度が悪くてよく見えない。');
      return;
    }
    state.keyLocationFound = true;
    consumeItem('mirror_piece');
    toast('鏡を使うと、奥に何か落ちているのが見えた。');
    render();
    return;
  }

  if (!requireSelected('retrieval_rod')) {
    toast('奥に何か落ちている。');
    return;
  }

  playRetrievalAnimation(() => {
    consumeItem('retrieval_rod');
    addItem('cell_key');
    render();
  });
}

// ---------- マットレス一筆書き入力（仕様6） ----------
function buildMattressInputLayer() {
  const wrap = document.createElement('div');
  wrap.className = 'mattress-input';
  const dots = [];
  for (let i = 0; i < 9; i++) {
    const d = document.createElement('div');
    d.className = 'mattress-puzzle-dot';
    const p = mattressDotPositions[i];
    d.style.left = `${p.x * 100}%`;
    d.style.top = `${p.y * 100}%`;
    wrap.appendChild(d);
    dots.push(d);
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'dot-line');
  svg.setAttribute('viewBox', '0 0 1000 1000');
  svg.setAttribute('preserveAspectRatio', 'none');
  wrap.appendChild(svg);
  let path = [];
  let dragging = false;
  function pointToIndex(clientX, clientY) {
    const rect = wrap.getBoundingClientRect();
    let best = -1, bestDist = Infinity;
    mattressDotPositions.forEach((p, i) => {
      const px = rect.left + p.x * rect.width, py = rect.top + p.y * rect.height;
      const dist = Math.hypot(clientX - px, clientY - py);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return bestDist <= Math.max(26, rect.width * 0.08) ? best : -1;
  }
  function resetPath() { path=[]; dots.forEach(d=>d.classList.remove('active')); svg.innerHTML=''; }
  function addPoint(idx) { if (idx<0 || path[path.length-1]===idx || path.includes(idx)) return; path.push(idx); dots[idx].classList.add('active'); drawLine(); }
  function drawLine() {
    svg.innerHTML=''; if (path.length<2) return;
    const poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    poly.setAttribute('points', path.map(i => `${mattressDotPositions[i].x*1000},${mattressDotPositions[i].y*1000}`).join(' '));
    poly.setAttribute('class','line'); svg.appendChild(poly);
  }
  function onDown(x,y){ dragging=true; resetPath(); addPoint(pointToIndex(x,y)); }
  function onMove(x,y){ if(!dragging)return; addPoint(pointToIndex(x,y)); }
  function onUp(){ if(!dragging)return; dragging=false; checkPattern(); }
  function checkPattern(){
    if(JSON.stringify(path)===JSON.stringify(PUZZLES.patternSequence)){
      // 答えを知っていても、必要な2つの手掛かりを確認する前は解除しない。
      if (!state.patternSymbolsViewed || !state.patternOrderViewed) {
        resetPath();
        toast('何も起こらない。まだ手掛かりが足りないようだ。');
        return;
      }
      setTimeout(()=>{ state.solved.pattern=true; state.currentScreen='Z_W2_MATTRESS'; state.screenStack=['WALL_2','Z_W2_BLANKET']; toast('カチッ……金属パネルが数センチ横へスライドした。'); render(); },300);
    } else resetPath();
  }
  wrap.addEventListener('pointerdown', e=>{ e.preventDefault(); try{wrap.setPointerCapture(e.pointerId);}catch(_){} onDown(e.clientX,e.clientY); });
  wrap.addEventListener('pointermove', e=>onMove(e.clientX,e.clientY));
  wrap.addEventListener('pointerup', onUp);
  wrap.addEventListener('pointercancel', onUp);
  return wrap;
}

// ---------- 蛇口4段階表示 ----------
function buildFaucetHeightLayer() {
  const layer = document.createElement('div');
  layer.className = 'faucet-height-layer';

  state.faucetHeights.forEach((height, index) => {
    const rect = faucetBarRects[index];
    const track = document.createElement('div');
    track.className = 'faucet-height-track';
    track.dataset.index = index;
    track.style.left = `${rect.x * 100}%`;
    track.style.top = `${rect.y * 100}%`;
    track.style.width = `${rect.w * 100}%`;
    track.style.height = `${rect.h * 100}%`;

    const bar = document.createElement('div');
    bar.className = 'faucet-height-bar';
    bar.style.height = `${22 + (height - 1) * 20}%`;
    track.appendChild(bar);
    layer.appendChild(track);
  });
  return layer;
}

// ---------- インベントリ ----------
function renderInventory(targetId) {
  const bar = document.getElementById(targetId || 'inventory-bar');
  bar.innerHTML = '';
  Object.keys(state.items).forEach((id) => {
    const def = ITEMS[id];
    if (!def) return;
    const el = document.createElement('div');
    el.className = 'item-slot' + (state.selectedItem === id ? ' selected' : '');
    el.innerHTML = `<img src="${def.icon}" alt="${def.name}" onerror="this.src='assets/images/cell/ui/missing_item.png'"><span>${def.name}</span>`;
    el.addEventListener('click', () => onInventoryTap(id, !!targetId));
    bar.appendChild(el);
  });
  if (!targetId) {
    // 詳細画面が開いている間は下部一覧も更新する
    if (document.getElementById('item-detail').classList.contains('show')) {
      renderInventory('item-detail-inventory');
    }
  }
}

function onInventoryTap(id, fromDetail) {
  if (fromDetail) {
    const current = state.detailItem;
    if (current && current !== id) {
      tryCombine(current, id);
    }
    return;
  }
  if (state.selectedItem === id) {
    if (typeof handleLoadingInventoryRetap === 'function' && handleLoadingInventoryRetap(id)) return;
    openItemDetail(id);
  } else {
    state.selectedItem = id;
    render();
  }
}

function tryCombine(a, b) {
  const combo = COMBOS.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a));
  if (!combo) {
    toast('組み合わせられそうにない。');
    return;
  }
  delete state.items[combo.a];
  delete state.items[combo.b];
  state.items[combo.result] = true;
  state.pickedUp = state.pickedUp || {};
  state.pickedUp[combo.result] = true;
  state.selectedItem = combo.result;
  state.detailItem = combo.result;
  if (typeof handleLoadingComboCompleted === 'function') handleLoadingComboCompleted(combo);
  toast(ITEMS[combo.result].name + ' が出来た。');
  renderInventory();
  openItemDetail(combo.result);
}

function openItemDetail(id, viewMode) {
  state.detailItem = id;
  state.detailViewMode = viewMode || 'front';
  const panel = document.getElementById('item-detail');
  panel.classList.add('show');
  const def = ITEMS[id];
  const img = document.getElementById('item-detail-image');
  img.src = (state.detailViewMode === 'back' && def.inspectAlt) ? def.inspectAlt : (def.detailImage || def.icon);
  document.getElementById('item-detail-name').textContent = def.name;
  const hint = document.getElementById('item-detail-hint');
  hint.textContent = detailHintText(id, state.detailViewMode);
  img.onclick = () => detailTap(id);
  renderInventory('item-detail-inventory');
}

function detailHintText(id, viewMode) {
  return '';
}

function detailTap(id) {

  // STAGE5：折り畳み足場を詳細画面上で開く
  if (id === 'folding_step_folded') {
    if (!state.items.folding_step_folded) return;

    delete state.items.folding_step_folded;

    state.items.folding_step_open = true;

    state.pickedUp = state.pickedUp || {};
    state.pickedUp.folding_step_folded = true;
    state.pickedUp.folding_step_open = true;

    state.selectedItem = 'folding_step_open';

    toast('折り畳み足場を開いた。');

    // 詳細画面も開いた足場へ切り替える
    openItemDetail('folding_step_open');

    render();
    return;
  }

  if (id === 'toilet_paper_core') {
    toast('芯を展開した。');
    consumeItem('toilet_paper_core');
    state.items.toilet_paper_core_open = true;
    state.pickedUp.toilet_paper_core_open = true;
    openItemDetail('toilet_paper_core_open');
    render();
    return;
  }

  // 以下既存処理...

  if (id === 'toilet_paper_core') {
    toast('芯を展開した。');
    consumeItem('toilet_paper_core');
    state.items.toilet_paper_core_open = true;
    state.pickedUp.toilet_paper_core_open = true;
    openItemDetail('toilet_paper_core_open');
    render();
    return;
  }
  if (id === 'faucet_handle') {
    const next = state.detailViewMode === 'back' ? 'front' : 'back';
    openItemDetail('faucet_handle', next);
    return;
  }
  if (id === 'mirror') {
    consumeItem('mirror');
    state.items.mirror_piece = true;
    state.pickedUp.mirror_piece = true;
    state.selectedItem = 'mirror_piece';
    toast('鏡を割り、小さな鏡片を手に入れた。');
    openItemDetail('mirror_piece');
    render();
    return;
  }
  if (typeof handleSolitaryItemDetail === 'function' && handleSolitaryItemDetail(id)) return;
}

function closeItemDetail() {
  document.getElementById('item-detail').classList.remove('show');
  state.detailItem = null;
  state.detailViewMode = 'front';
  render();
}

// ---------- メッセージ・クリア ----------
function toast(text) {
  const el = document.getElementById('message-toast');
  el.textContent = text;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function formatElapsedTime(ms) {
  const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function getHintUsageStats() {
  let hints = 0;
  let answers = 0;
  Object.values(state.hintProgress || {}).forEach((raw) => {
    const progress = Math.max(0, Math.min(3, Number(raw) || 0));
    hints += Math.min(progress, 2); // ヒント1・ヒント2をそれぞれ1件として数える
    if (progress >= 3) answers += 1;
  });
  return { hints, answers };
}

function showClearScreen() {
  document.getElementById('clear-overlay').classList.add('show');
  document.getElementById('clear-text').textContent = CLEAR_SCREEN_TEXT;
  const sub = document.querySelector('#clear-overlay .clear-sub');
  if (sub && typeof CLEAR_SCREEN_SUBTEXT !== 'undefined') {
    sub.textContent = CLEAR_SCREEN_SUBTEXT;
  }

  if (!Number.isFinite(state.clearTimeMs)) {
    state.clearTimeMs = Math.max(0, Date.now() - (Number(state.runStartedAt) || Date.now()));
  }
  const usage = getHintUsageStats();
  const timeEl = document.getElementById('clear-time');
  const hintEl = document.getElementById('clear-hint-count');
  const answerEl = document.getElementById('clear-answer-count');
  if (timeEl) timeEl.textContent = formatElapsedTime(state.clearTimeMs);
  if (hintEl) hintEl.textContent = String(usage.hints);
  if (answerEl) answerEl.textContent = String(usage.answers);
  saveState();
}

function returnToTitle() {
  document.getElementById('clear-overlay').classList.remove('show');
  resetState();
  hasContinueSave = false;
  showTitleScreen();
}

// ---------- 全ステージ共通 フローティングメモ ----------
function ensureMemoState() {
  const defaults = { text: '', x: null, y: null, width: 300, height: 230, dim: false, open: false };
  state.memo = Object.assign(defaults, state.memo || {});
  return state.memo;
}

function clampMemoRect(x, y, width, height) {
  const vw = Math.max(240, window.innerWidth || 240);
  const vh = Math.max(320, window.innerHeight || 320);
  const minW = Math.min(220, vw * 0.85);
  const minH = 150;
  const maxW = Math.max(minW, vw * 0.92);
  const maxH = Math.max(minH, vh * 0.72);
  const w = Math.max(minW, Math.min(maxW, width));
  const h = Math.max(minH, Math.min(maxH, height));
  // タイトルバーの一部が必ず画面内に残るようにする。
  const minVisible = 56;
  const nx = Math.min(vw - minVisible, Math.max(-(w - minVisible), x));
  const ny = Math.min(vh - 44, Math.max(0, y));
  return { x: nx, y: ny, width: w, height: h };
}

function applyMemoLayout() {
  const memo = ensureMemoState();
  const win = document.getElementById('memo-window');
  if (!win) return;

  let width = Number(memo.width) || 300;
  let height = Number(memo.height) || 230;
  let x = Number.isFinite(memo.x) ? memo.x : Math.max(8, (window.innerWidth - width) / 2);
  let y = Number.isFinite(memo.y) ? memo.y : Math.max(56, window.innerHeight * 0.16);
  const rect = clampMemoRect(x, y, width, height);
  Object.assign(memo, rect);
  Object.assign(win.style, {
    left: rect.x + 'px',
    top: rect.y + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
  });
  win.classList.toggle('dim', !!memo.dim);
  const opacityBtn = document.getElementById('memo-opacity');
  if (opacityBtn) opacityBtn.textContent = memo.dim ? '通常表示' : '薄く表示';
}

function initFloatingMemo() {
  const memo = ensureMemoState();
  const win = document.getElementById('memo-window');
  const textarea = document.getElementById('memo-textarea');
  const drag = document.getElementById('memo-drag-handle');
  const resize = document.getElementById('memo-resize-handle');
  if (!win || !textarea || !drag || !resize) return;

  textarea.value = memo.text || '';
  textarea.addEventListener('input', () => {
    ensureMemoState().text = textarea.value;
    saveState();
  });

  // iOS WKWebViewでtextareaのフォーカス有無に左右されないよう、
  // メモ操作はdocumentのcaptureフェーズで座標から直接判定する。
  // これによりゲーム側のhotspot / touch処理より先に移動・リサイズを確保する。
  let gesture = null;

  const pointInside = (x, y, rect) => (
    x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  );

  const isMemoButtonAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return !!(el && el.closest && el.closest('.memo-actions button'));
  };

  const beginGesture = (kind, id, clientX, clientY) => {
    const m = ensureMemoState();
    // 念のため開始直前にも実座標をstateへ同期する。
    const r = win.getBoundingClientRect();
    const current = clampMemoRect(r.left, r.top, r.width, r.height);
    Object.assign(m, current);
    gesture = {
      kind,
      id,
      clientX,
      clientY,
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
    };
    win.classList.add('memo-manipulating');
  };

  const updateGesture = (clientX, clientY) => {
    if (!gesture) return;
    const m = ensureMemoState();
    if (gesture.kind === 'drag') {
      const rect = clampMemoRect(
        gesture.x + (clientX - gesture.clientX),
        gesture.y + (clientY - gesture.clientY),
        gesture.width,
        gesture.height
      );
      Object.assign(m, rect);
    } else {
      const rect = clampMemoRect(
        gesture.x,
        gesture.y,
        gesture.width + (clientX - gesture.clientX),
        gesture.height + (clientY - gesture.clientY)
      );
      Object.assign(m, rect);
    }
    applyMemoLayout();
  };

  const finishGesture = () => {
    if (!gesture) return;
    gesture = null;
    win.classList.remove('memo-manipulating');
    saveState();
  };

  const hitTestMemoGesture = (clientX, clientY) => {
    if (!win.classList.contains('show')) return null;
    const resizeRect = resize.getBoundingClientRect();
    // 指で掴みやすいよう、リサイズ判定は見た目より少し広げる。
    const resizeHit = {
      left: resizeRect.left - 12,
      top: resizeRect.top - 12,
      right: resizeRect.right + 8,
      bottom: resizeRect.bottom + 8,
    };
    if (pointInside(clientX, clientY, resizeHit)) return 'resize';

    const dragRect = drag.getBoundingClientRect();
    if (pointInside(clientX, clientY, dragRect) && !isMemoButtonAt(clientX, clientY)) return 'drag';
    return null;
  };

  // Pointer Events対応iOSではこちらを主経路にする。
  document.addEventListener('pointerdown', (e) => {
    if (gesture || !e.isPrimary) return;
    const kind = hitTestMemoGesture(e.clientX, e.clientY);
    if (!kind) return;
    beginGesture(kind, e.pointerId, e.clientX, e.clientY);
    try { win.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
    e.stopPropagation();
  }, { capture: true, passive: false });

  document.addEventListener('pointermove', (e) => {
    if (!gesture || gesture.id !== e.pointerId) return;
    updateGesture(e.clientX, e.clientY);
    e.preventDefault();
    e.stopPropagation();
  }, { capture: true, passive: false });

  document.addEventListener('pointerup', (e) => {
    if (!gesture || gesture.id !== e.pointerId) return;
    try { win.releasePointerCapture(e.pointerId); } catch (_) {}
    finishGesture();
    e.preventDefault();
    e.stopPropagation();
  }, { capture: true, passive: false });

  document.addEventListener('pointercancel', (e) => {
    if (!gesture || gesture.id !== e.pointerId) return;
    finishGesture();
  }, { capture: true });

  // Pointer Eventsがない古いWebView向けのtouch fallback。
  if (!window.PointerEvent) {
    document.addEventListener('touchstart', (e) => {
      if (gesture || !e.touches.length) return;
      const t = e.touches[0];
      const kind = hitTestMemoGesture(t.clientX, t.clientY);
      if (!kind) return;
      beginGesture(kind, t.identifier, t.clientX, t.clientY);
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true, passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!gesture) return;
      const t = Array.from(e.touches).find((touch) => touch.identifier === gesture.id);
      if (!t) return;
      updateGesture(t.clientX, t.clientY);
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true, passive: false });

    document.addEventListener('touchend', (e) => {
      if (!gesture) return;
      if (!Array.from(e.changedTouches).some((touch) => touch.identifier === gesture.id)) return;
      finishGesture();
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true, passive: false });

    document.addEventListener('touchcancel', finishGesture, { capture: true });
  }

  window.addEventListener('resize', () => {
    applyMemoLayout();
    saveState();
  });

  // iOSのソフトウェアキーボード開閉でvisual viewportが変化しても、
  // キーボードを閉じた後にメモが画面外へ残らないようにする。
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (!textarea.matches(':focus')) applyMemoLayout();
    });
  }

  applyMemoLayout();
  if (memo.open) {
    win.classList.add('show');
    win.setAttribute('aria-hidden', 'false');
  }
}

function openFloatingMemo() {
  const memo = ensureMemoState();
  memo.open = true;
  const win = document.getElementById('memo-window');
  if (!win) return;
  applyMemoLayout();
  win.classList.add('show');
  win.setAttribute('aria-hidden', 'false');
  saveState();
}

function closeFloatingMemo() {
  const memo = ensureMemoState();
  memo.open = false;
  const win = document.getElementById('memo-window');
  if (win) {
    win.classList.remove('show');
    win.setAttribute('aria-hidden', 'true');
  }
  saveState();
}

function toggleMemoOpacity() {
  const memo = ensureMemoState();
  memo.dim = !memo.dim;
  applyMemoLayout();
  saveState();
}

function clearFloatingMemo() {
  if (!confirm('メモの内容をすべて消去しますか？')) return;
  const memo = ensureMemoState();
  memo.text = '';
  const textarea = document.getElementById('memo-textarea');
  if (textarea) textarea.value = '';
  saveState();
}

// ---------- メニュー ----------
function toggleMenu() {
  document.getElementById('menu-panel').classList.toggle('show');
}
function closeMenu() {
  document.getElementById('menu-panel').classList.remove('show');
}

function returnToTitleFromMenu() {
  if (!confirm('タイトル画面に戻りますか？\n現在の進行状況は保存されます。')) return;
  saveState();
  hasContinueSave = true;
  closeMenu();
  showTitleScreen();
}
