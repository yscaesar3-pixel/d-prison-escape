// ============================================================
// corridor-ui.js — STAGE2「廊下」カスタムUIオーバーレイ
// main.js の renderHotspots() から screen.custom を見て呼ばれる。
// 見た目専用（クリック判定は既存のhotspot要素が担う）。
// ============================================================

function findHotspot(screenId, hotspotId) {
  const screen = SCREENS[screenId];
  return screen && (screen.hotspots || []).find((h) => h.id === hotspotId);
}

function overlayBox(rect, className) {
  const el = document.createElement('div');
  el.className = 'corridor-overlay ' + className;
  el.style.left = (rect.x * 100) + '%';
  el.style.top = (rect.y * 100) + '%';
  el.style.width = (rect.w * 100) + '%';
  el.style.height = (rect.h * 100) + '%';
  return el;
}

const BED_INPUT_SYMBOL = { blank: '', up: '↑', down: '↓' };


const CORRIDOR_SCREEN_NAV = {
  CORRIDOR_1: { left: 'CORRIDOR_1_LEFT', right: 'CORRIDOR_1_RIGHT', up: 'CORRIDOR_2' },
  CORRIDOR_1_LEFT: { right: 'CORRIDOR_1' },
  CORRIDOR_1_RIGHT: { left: 'CORRIDOR_1' },

  CORRIDOR_2: { left: 'CORRIDOR_2_LEFT', right: 'CORRIDOR_2_RIGHT', up: 'CORRIDOR_3', down: 'CORRIDOR_1' },
  CORRIDOR_2_LEFT: { right: 'CORRIDOR_2' },
  CORRIDOR_2_RIGHT: { left: 'CORRIDOR_2' },

  CORRIDOR_3: { left: 'CORRIDOR_3_LEFT', right: 'CORRIDOR_3_RIGHT', up: 'GUARD_WALL', down: 'CORRIDOR_2' },
  CORRIDOR_3_LEFT: { right: 'CORRIDOR_3' },
  CORRIDOR_3_RIGHT: { left: 'CORRIDOR_3' },

  GUARD_WALL: { down: 'CORRIDOR_3' },
};

function appendCorridorScreenNav(layer) {
  const nav = CORRIDOR_SCREEN_NAV[state.currentScreen];
  if (!nav || typeof makeDirectionalNavButton !== 'function') return;

  const labels = {
    left: '左の画面を見る',
    right: '右の画面を見る',
    up: '奥へ進む',
    down: '手前へ戻る',
  };

  ['left', 'right', 'up', 'down'].forEach((dir) => {
    const target = nav[dir];
    if (!target) return;
    layer.appendChild(makeDirectionalNavButton(
      dir,
      labels[dir],
      () => goScreen(target),
      'corridor-screen-nav'
    ));
  });
}

function renderCorridorCustom(screen, layer) {
  if (!screen || !layer) return;

  appendCorridorScreenNav(layer);

  if (screen.custom === 'bedbox') {
    for (let i = 0; i < 6; i++) {
      const hs = findHotspot('Z_BED_BOX', 'cell' + i);
      if (!hs) continue;
      const box = overlayBox(hs, 'corridor-bed-cell');
      box.textContent = BED_INPUT_SYMBOL[state.corridorBedInput[i]] || '';
      layer.appendChild(box);
    }
  }

  if (screen.custom === 'powerbox') {
    for (let i = 0; i < 3; i++) {
      const hs = findHotspot('Z_BED_BOX_OPEN', 'digit' + i);
      if (!hs) continue;
      const box = overlayBox(hs, 'corridor-power-digit');
      box.textContent = String(state.corridorPowerDigits[i]);
      layer.appendChild(box);
    }
  }

/*
if (screen.custom === 'board' && state.guardRoomPowerOn) {
  const hs = findHotspot('Z_GUARD_BOARD', 'display');
  if (hs) {
    const wrap = overlayBox(hs, 'corridor-board-display');
    const digits = String(PUZZLES.guardDoorCode).split('').map(Number);
    digits.forEach((d) => wrap.appendChild(buildSevenSegDigit(d)));
    layer.appendChild(wrap);
  }
}
*/

  if (screen.custom === 'keypad') {
    const box = overlayBox({ x: 0.255, y: 0.182, w: 0.492, h: 0.123 }, 'corridor-keypad-display');
    box.textContent = state.guardDoorInput || '';
    layer.appendChild(box);
  }

  // ---- STAGE3「看守室」追加分：未知のscreen.customは看守室UIへ委譲 ----
  if (typeof renderGuardRoomCustom === 'function') renderGuardRoomCustom(screen, layer);
}

// ---------- 7セグメント表示（仕様15-16：右上セグメントが全4桁で故障・常時OFF） ----------
const SEVEN_SEG_MAP = {
  0: ['a', 'b', 'c', 'd', 'e', 'f'],
  1: ['b', 'c'],
  2: ['a', 'b', 'g', 'e', 'd'],
  3: ['a', 'b', 'g', 'c', 'd'],
  4: ['f', 'g', 'b', 'c'],
  5: ['a', 'f', 'g', 'c', 'd'],
  6: ['a', 'f', 'g', 'e', 'c', 'd'],
  7: ['a', 'b', 'c'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
};
const SEVEN_SEG_BROKEN = 'b'; // 右上セグメント。筐体全体で常時故障。

function buildSevenSegDigit(digit) {
  const active = new Set(SEVEN_SEG_MAP[digit] || []);
  active.delete(SEVEN_SEG_BROKEN);
  const box = document.createElement('div');
  box.className = 'sevenseg-digit';
  ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach((key) => {
    const seg = document.createElement('div');
    seg.className = 'sevenseg-seg seg-' + key + (active.has(key) ? ' on' : '');
    box.appendChild(seg);
  });
  return box;
}

// ---------- 廊下クリア後の仮遷移補助（GUARD_ROOM画面自体はcorridor-data.jsで定義済み） ----------
