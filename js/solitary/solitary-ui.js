// ============================================================
// solitary-ui.js — STAGE4「独居房」画像オーバーレイ / 画面移動UI
// ============================================================

function appendSolitaryOverlay(layer, src, className, rect) {
  const img = document.createElement('img');
  img.className = 'solitary-scene-overlay ' + (className || '');
  img.src = src;
  img.alt = '';
  const r = rect || { x: 0, y: 0, w: 1, h: 1 };
  img.style.left = (r.x * 100) + '%';
  img.style.top = (r.y * 100) + '%';
  img.style.width = (r.w * 100) + '%';
  img.style.height = (r.h * 100) + '%';
  layer.appendChild(img);
  return img;
}

// dark画像そのものを暗所表現として使う。
function appendSolitaryDarkness(layer) {
  return;
}

const SOLITARY_SCREEN_NAV = {
  SOLITARY_1: { up: 'SOLITARY_2' },
  SOLITARY_1_RIGHT: { left: 'SOLITARY_1' },
  SOLITARY_2: { down: 'SOLITARY_1' },
};

function appendSolitaryScreenNav(layer) {
  const nav = SOLITARY_SCREEN_NAV[state.currentScreen];
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
      () => solitaryGoScreen(target),
      'solitary-screen-nav'
    ));
  });
}

function renderSolitaryCustom(screen, layer) {
  if (!screen || !layer || !state.currentScreen.startsWith('SOLITARY')) return;

  if (typeof ensureSolitaryState === 'function') ensureSolitaryState();

  const O = SOLITARY_IMG + 'overlays/';

  appendSolitaryDarkness(layer);
  appendSolitaryScreenNav(layer);

  // SOLITARY_1でも、Aで明るい間はバケツを見えるようにする。
  // 取得後は両画面から消える。
  if (state.currentScreen === 'SOLITARY_1' && state.solitaryLightOn && !state.solitaryBucketTaken) {
    appendSolitaryOverlay(
      layer,
      O + 'solitary_bucket_room_overlay_s1.png',
      'room-object-adjusted',
      { x: 0.26, y: 0.20, w: 0.50, h: 0.50 }
    );
  }

  // SOLITARY_2側の既存表示も維持する。
  if (state.currentScreen === 'SOLITARY_2' && state.solitaryLightOn && !state.solitaryBucketTaken) {
    appendSolitaryOverlay(
      layer,
      O + 'solitary_bucket_room_overlay_s2.png',
      'room-object-adjusted',
      { x: 0.10, y: 0.10, w: 0.80, h: 0.80 }
    );
  }

  // 差し込み口のプレート。
  if (state.currentScreen === 'SOLITARY_CARD_SLOT_ZOOM' && state.solitaryInsertedPlate) {
    const letter = state.solitaryInsertedPlate.toLowerCase();
    appendSolitaryOverlay(
      layer,
      O + 'solitary_plate_' + letter + '_inserted.png',
      'zoom-object plate-inserted',
      { x: 0.20, y: 0.29, w: 0.60, h: 0.30 }
    );
  }
}
