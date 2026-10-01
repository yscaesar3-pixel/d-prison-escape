// ============================================================
// guard-room-ui.js — STAGE3「看守室」カスタムUIオーバーレイ
// corridor-ui.js の renderCorridorCustom() から screen.custom を見て呼ばれる。
// 見た目専用（クリック判定は既存のhotspot要素が担う）。
// ============================================================

const ZONE_CIRCLED = { 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤' };


// チャンネル表示位置は Z_GUARD_MONITORS の channel_display_area hotspot に連動。
// デバッグ赤枠をドラッグして位置・大きさを調整できます。


// ------------------------------------------------------------
// 監視モニター映像アニメーション
// C → A → B → D の順に、各場所で 1(no guard) → 2(entering) → 3(clear)
// を1秒ずつ表示する。ほかのモニターは常に *_1 を表示。
// モニター画面を開くたび、必ず C から再スタートする。
// ------------------------------------------------------------
const GUARD_MONITOR_PATROL_ORDER = ['C', 'A', 'B', 'D'];
const GUARD_MONITOR_FRAME_MS = 1000;
let guardMonitorPatrolTick = 0;
let guardMonitorPatrolTimer = null;
let guardMonitorPatrolScreenActive = false;

function isGuardMonitorPatrolVisible() {
  return (
    state.currentScreen === 'Z_GUARD_MONITORS' &&
    state.guardMonitorFuseInserted &&
    !state.guardSpecialMonitorActive
  );
}

function stopGuardMonitorPatrolAnimation(resetTick = true) {
  if (guardMonitorPatrolTimer) {
    clearInterval(guardMonitorPatrolTimer);
    guardMonitorPatrolTimer = null;
  }
  if (resetTick) guardMonitorPatrolTick = 0;
}

function getGuardMonitorFrame(letter) {
  const activeIndex = Math.floor(guardMonitorPatrolTick / 3);
  const phase = guardMonitorPatrolTick % 3;
  return GUARD_MONITOR_PATROL_ORDER[activeIndex] === letter ? (phase + 1) : 1;
}

function updateGuardMonitorFeedImages() {
  ['A', 'B', 'C', 'D'].forEach((letter) => {
    const img = document.querySelector('.guard-monitor-feed-img[data-monitor-letter="' + letter + '"]');
    if (!img) return;
    const frame = getGuardMonitorFrame(letter);
    img.src = GUARD_IMG + 'monitors/monitor_' + letter.toLowerCase() + '_' + frame + '.webp';
  });
}

function startGuardMonitorPatrolAnimation() {
  stopGuardMonitorPatrolAnimation(false);
  guardMonitorPatrolTimer = setInterval(() => {
    if (!isGuardMonitorPatrolVisible()) {
      stopGuardMonitorPatrolAnimation(true);
      guardMonitorPatrolScreenActive = false;
      return;
    }
    guardMonitorPatrolTick = (guardMonitorPatrolTick + 1) % (GUARD_MONITOR_PATROL_ORDER.length * 3);
    updateGuardMonitorFeedImages();
  }, GUARD_MONITOR_FRAME_MS);
}

function syncGuardMonitorPatrolLifecycle() {
  const visible = isGuardMonitorPatrolVisible();

  if (visible && !guardMonitorPatrolScreenActive) {
    // 画面に入った瞬間だけ0へ戻す。これで毎回必ずCから始まる。
    guardMonitorPatrolTick = 0;
    guardMonitorPatrolScreenActive = true;
    startGuardMonitorPatrolAnimation();
  } else if (!visible && guardMonitorPatrolScreenActive) {
    stopGuardMonitorPatrolAnimation(true);
    guardMonitorPatrolScreenActive = false;
  }
}

function appendGuardMonitorFeeds(layer) {
  if (!isGuardMonitorPatrolVisible()) return;

  ['A', 'B', 'C', 'D'].forEach((letter) => {
    const hs = findHotspot('Z_GUARD_MONITORS', 'monitor_display_' + letter.toLowerCase());
    if (!hs) return;

    const box = overlayBox(hs, 'guard-monitor-feed guard-monitor-feed-' + letter.toLowerCase());
    const img = document.createElement('img');
    img.className = 'guard-monitor-feed-img';
    img.dataset.monitorLetter = letter;
    const frame = getGuardMonitorFrame(letter);
    img.src = GUARD_IMG + 'monitors/monitor_' + letter.toLowerCase() + '_' + frame + '.webp';
    img.alt = '監視モニター' + letter;
    box.appendChild(img);
    layer.appendChild(box);
  });
}

function appendGuardMonitorLabels(layer) {
  if (!isGuardMonitorPatrolVisible()) return;

  ['A', 'B', 'C', 'D'].forEach((letter) => {
    const hs = findHotspot('Z_GUARD_MONITORS', 'monitor_label_' + letter.toLowerCase());
    if (!hs) return;

    const box = overlayBox(hs, 'guard-monitor-label');
    box.textContent = letter;
    layer.appendChild(box);
  });
}

const GUARD_WALL_NAV = {
  GUARD_ROOM_1: { left: 'GUARD_ROOM_4', right: 'GUARD_ROOM_2' },
  GUARD_ROOM_2: { left: 'GUARD_ROOM_1', right: 'GUARD_ROOM_3' },
  GUARD_ROOM_3: { left: 'GUARD_ROOM_2', right: 'GUARD_ROOM_4' },
  GUARD_ROOM_4: { left: 'GUARD_ROOM_3', right: 'GUARD_ROOM_1' },
};

function appendGuardWallNav(layer) {
  const nav = GUARD_WALL_NAV[state.currentScreen];
  if (!nav || typeof makeDirectionalNavButton !== 'function') return;

  if (nav.left) {
    layer.appendChild(makeDirectionalNavButton('left', '左の壁を見る', () => goScreen(nav.left), 'guard-room-screen-nav'));
  }
  if (nav.right) {
    layer.appendChild(makeDirectionalNavButton('right', '右の壁を見る', () => goScreen(nav.right), 'guard-room-screen-nav'));
  }
}

function renderGuardRoomCustom(screen, layer) {
  if (!screen || !layer) return;

  // 監視モニター画面への入退場をここで一元管理する。
  syncGuardMonitorPatrolLifecycle();

  appendGuardWallNav(layer);

  if (screen.custom === 'schedulelock' && !state.guardDrawerOpen) {
    for (let i = 0; i < 3; i++) {
      const hs = findHotspot('Z_GUARD_DRAWER', 'digit' + i);
      if (!hs) continue;
      const box = overlayBox(hs, 'corridor-power-digit');
      box.textContent = String(state.guardScheduleDigits[i]);
      layer.appendChild(box);
    }
    const zoneHs = findHotspot('Z_GUARD_DRAWER', 'zone');
if (zoneHs) {
  const box = overlayBox(
    zoneHs,
    'corridor-power-digit guard-zone-digit'
  );
  box.textContent = String(state.guardScheduleZone);
  layer.appendChild(box);
}
  }


  if (screen.custom === 'schedulelock' && state.guardDrawerOpen) {
    const noteHs = findHotspot('Z_GUARD_DRAWER', 'note_spot');
    if (noteHs) {
      const note = overlayBox(noteHs, 'guard-drawer-note-visual');
      note.innerHTML = '<span class="guard-note-mark"></span><span class="guard-note-line"></span><span class="guard-note-line"></span><span class="guard-note-line short"></span>'; 
      layer.appendChild(note);
    }
  }

  if (screen.custom === 'keypanel' && state.guardKeyBoardUnlocked && !state.guardKeyOrderSolved) {
    for (let i = 0; i < 5; i++) {
      const hs = findHotspot('Z_GUARD_KEYPANEL', 'key' + i);
      if (!hs) continue;
      const keyId = state.guardKeyOrder[i];
      const selected = state.guardKeyPoolSelected === i;
      const box = overlayBox(hs, 'guard-key-slot' + (selected ? ' selected' : ''));
      const def = GUARD_KEY_DEFS.find((k) => k.id === keyId);
      if (def && def.image) {
        const img = document.createElement('img');
        img.src = def.image;
        img.alt = def.label;
        img.className = 'guard-key-image';
        box.appendChild(img);
      }
      layer.appendChild(box);
    }
  }

  if (screen.custom === 'guardwall4' && state.guardExitUnlocked && !state.guardRoomDoorOpen) {
    const lampHs = findHotspot('GUARD_ROOM_4', 'exit_green_lamp_area');
    if (lampHs) {
      const lamp = overlayBox(lampHs, 'guard-exit-green-lamp');
      layer.appendChild(lamp);
    }
  }

  // 監視モニター映像と A/B/C/D ラベルを描画する。
  // 前回の修正版でこの呼び出しが抜けていたため、ヒューズ挿入後も映像が表示されなかった。
  if (screen.custom === 'monitors') {
    appendGuardMonitorFeeds(layer);
    appendGuardMonitorLabels(layer);
  }

  if (
  screen.custom === 'monitors' &&
  state.currentScreen === 'Z_GUARD_MONITORS' &&
  !state.guardSpecialMonitorActive
) {
  const channelHs = findHotspot(
    'Z_GUARD_MONITORS',
    'channel_display_area'
  );

  if (channelHs) {
    const box = overlayBox(
      channelHs,
      'corridor-keypad-display guard-channel-display'
    );

    box.textContent =
      state.guardMonitorFuseInserted &&
      state.guardChannelIndex != null &&
      state.guardChannelIndex >= 0
        ? PUZZLES.guardChannelCandidates[state.guardChannelIndex]
        : '';

    layer.appendChild(box);
  }
}

  if (screen.custom === 'monitorbuttons' && guardMonitorPressedLetter) {
    const hs = findHotspot('Z_GUARD_MONITOR_BUTTONS', 'btn' + guardMonitorPressedLetter);
    if (hs) {
      const press = overlayBox(hs, 'guard-monitor-button-press');
      layer.appendChild(press);
    }
  }

  if (screen.custom === 'maze') {
    ensureMazeSessionFresh();
    const grid = overlayBox({ x: 0.15735, y: 0.11402, w: 0.68436, h: 0.47418 }, 'guard-maze-grid');
    const marker = document.createElement('div');
    marker.className = 'guard-maze-marker';
    const cell = 1 / 6;
    marker.style.left = ((state.guardMazePosition.col + 0.5) * cell * 100) + '%';
    marker.style.top = ((state.guardMazePosition.row + 0.5) * cell * 100) + '%';
    grid.appendChild(marker);
    layer.appendChild(grid);

    const timerBox = overlayBox({ x: 0.535, y: 0.846, w: 0.323, h: 0.081 }, 'corridor-keypad-display guard-maze-timer');
    timerBox.textContent = state.guardMazeCleared ? 'CLEAR' : ('' + state.guardMazeTimeLeft);
    layer.appendChild(timerBox);
  }
}
