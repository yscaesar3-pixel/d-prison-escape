// ============================================================
// loading-ui.js — STAGE5「搬入口」カスタムUI
// ============================================================

let loadingDestinationPress = null;

function appendLoadingOverlay(layer, src, className, rect) {
  const img = document.createElement('img');
  img.className = 'loading-scene-overlay ' + (className || '');
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

function getLoadingHotspotRect(screenId, hotspotId) {
  const screen = SCREENS[screenId];
  if (!screen || !Array.isArray(screen.hotspots)) return null;

  const hotspot = screen.hotspots.find(h => h.id === hotspotId);
  if (!hotspot) return null;

  return {
    x: hotspot.x,
    y: hotspot.y,
    w: hotspot.w,
    h: hotspot.h
  };
}

function renderShutterBoxOverlays(layer) {
  if (state.currentScreen !== 'LOADING_SHUTTER_ZOOM') return;

  const overlays = [
    {
      hotspotId: 'shutter_guard_overlay',
      src: LOADING_IMG + 'overlay/box_guard_overlay.png'
    },
    {
      hotspotId: 'shutter_security_overlay',
      src: LOADING_IMG + 'overlay/box_security_overlay.png'
    },
    {
      hotspotId: 'shutter_cell_overlay',
      src: LOADING_IMG + 'overlay/box_cell_overlay.png'
    }
  ];

  overlays.forEach(({ hotspotId, src }) => {
    const rect = getLoadingHotspotRect(
      'LOADING_SHUTTER_ZOOM',
      hotspotId
    );

    if (!rect) return;

    appendLoadingOverlay(
      layer,
      src,
      'shutter-box-overlay',
      rect
    );
  });
}

const LOADING_NAV = {
  LOADING_1: { left: 'LOADING_4', right: 'LOADING_2' },
  LOADING_2: { left: 'LOADING_1', right: 'LOADING_3' },
  LOADING_3: { left: 'LOADING_2', right: 'LOADING_4' },
  LOADING_4: { left: 'LOADING_3', right: 'LOADING_1' },
};

function appendLoadingNav(layer) {
  const nav = LOADING_NAV[state.currentScreen];
  if (!nav) return;
  ['left', 'right'].forEach((dir) => {
    layer.appendChild(makeDirectionalNavButton(dir, dir === 'left' ? '左を見る' : '右を見る', () => loadingGoScreen(nav[dir]), 'loading-screen-nav'));
  });
}

function makeLoadingButton(text, rect, onClick, cls) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'loading-control ' + (cls || '');
  b.textContent = text;
  b.style.left = rect.x * 100 + '%';
  b.style.top = rect.y * 100 + '%';
  b.style.width = rect.w * 100 + '%';
  b.style.height = rect.h * 100 + '%';
  b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(); });
  return b;
}

function renderDestinationInput(layer) {
  if (
    state.currentScreen !== 'DESTINATION_PANEL_ZOOM' ||
    state.destinationSolved
  ) return;

  const labels = {
    cell: '牢屋',
    guard: '看守室',
    security: '警備室'
  };

  const hotspotIdMap = {
    guard: 'dest_guard',
    security: 'dest_security',
    cell: 'dest_cell'
  };

  if (loadingDestinationPress) {
    const hotspotId = hotspotIdMap[loadingDestinationPress];

    requestAnimationFrame(() => {
      if (state.currentScreen !== 'DESTINATION_PANEL_ZOOM') return;
      if (state.destinationSolved) return;
      if (!layer.isConnected) return;

      const hotspotEl = layer.querySelector(
        `[data-hotspot-id="${hotspotId}"]`
      );

      if (!hotspotEl) return;

      const hotspotWidth = hotspotEl.clientWidth;
      const hotspotHeight = hotspotEl.clientHeight;

      // hotspot内に収まる正円の直径
      const diameterPx = Math.min(
        hotspotWidth,
        hotspotHeight
      );

      // hotspot内部で完全に中央になる左上座標
      const leftPx =
        (hotspotWidth - diameterPx) / 2;

      const topPx =
        (hotspotHeight - diameterPx) / 2;

      const press = document.createElement('div');
      press.className = 'loading-destination-press';

      Object.assign(press.style, {
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        width: `${diameterPx}px`,
        height: `${diameterPx}px`,

        // translateは使わない
        transform: 'none',

        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
        pointerEvents: 'none'
      });

      // hotspot自身の中に配置
      hotspotEl.appendChild(press);
    });
  }

  if (state.destinationInput.length) {
    const display = document.createElement('div');
    display.className = 'loading-sequence-display';

    display.textContent = state.destinationInput
      .map(v => labels[v])
      .join(' → ');

    layer.appendChild(display);
  }
}

function renderMaintControls(layer) {
  if (
    state.currentScreen !== 'MAINT_BOX_ZOOM' ||
    !state.maintBoxOpened ||
    state.maintDirectionSolved
  ) return;

  const screen = SCREENS.MAINT_BOX_ZOOM;

  const arrowMap = {
    U: '↑',
    D: '↓',
    L: '←',
    R: '→'
  };

  // 1〜7桁目をそれぞれ独立した位置に表示
  state.maintDirectionInput.forEach((value, index) => {
    if (index >= 7) return;

    const hotspotId = `maint_digit_${index + 1}`;

    const rect = screen.hotspots.find(
      h => h.id === hotspotId
    );

    if (!rect) return;

    const el = document.createElement('div');

    el.className = 'loading-maint-digit';
    el.textContent = arrowMap[value] || '';

    Object.assign(el.style, {
  position: 'absolute',
  left: `${rect.x * 100}%`,
  top: `${rect.y * 100}%`,
  width: `${rect.w * 100}%`,
  height: `${rect.h * 100}%`,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  fontSize: `${rect.fontSize || 22}px`,
  lineHeight: '1',

  overflow: 'hidden',
  whiteSpace: 'nowrap',

  pointerEvents: 'none'
});

    layer.appendChild(el);
  });
}

function renderDSlider(layer) {
  if (
    state.currentScreen !== 'D_CABINET_ZOOM' ||
    !state.dCabinetOpened ||
    state.dSliderSolved
  ) return;

  const screen = SCREENS.D_CABINET_ZOOM;

  function getRect(id) {
    return screen.hotspots.find(h => h.id === id) || null;
  }

  for (let i = 0; i < 4; i++) {
    const n = i + 1;

    const trackRect = getRect(`d_slider_${n}_track`);
    const pos1 = getRect(`d_slider_${n}_pos1`);
    const pos5 = getRect(`d_slider_${n}_pos5`);

    if (!trackRect || !pos1 || !pos5) continue;

    // =====================================
    // タップ領域
    // HOTSPOTと全く同じ x/y/w/h を使用
    // =====================================
    const track = document.createElement('button');

    track.type = 'button';
    track.className = 'loading-slider-track';

    Object.assign(track.style, {
      position: 'absolute',

      left: `${trackRect.x * 100}%`,
      top: `${trackRect.y * 100}%`,
      width: `${trackRect.w * 100}%`,
      height: `${trackRect.h * 100}%`,

      padding: '0',
      margin: '0',
      border: 'none',
      background: 'transparent',

      transform: 'none',
      boxSizing: 'border-box'
    });

    track.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      loadingSliderCycle(i);
    });

    layer.appendChild(track);

    // =====================================
    // 現在値
    // =====================================
    const val = state.dSliderValues[i];

    // 5段階
    // 1 = 0
    // 2 = 1/4
    // 3 = 2/4
    // 4 = 3/4
    // 5 = 1
    const t = (5 - val) / 4;

    // pos1〜pos5を直線補間
    const knobX =
      pos1.x +
      (pos5.x - pos1.x) * t;

    const knobY =
      pos1.y +
      (pos5.y - pos1.y) * t;

    const knobW =
      pos1.w +
      (pos5.w - pos1.w) * t;

    const knobH =
      pos1.h +
      (pos5.h - pos1.h) * t;

    // =====================================
    // スライダーノブ
    // =====================================
    appendLoadingOverlay(
      layer,
      LOADING_IMG + 'overlay/slider_knob.png',
      'slider-knob',
      {
        x: knobX,
        y: knobY,
        w: knobW,
        h: knobH
      }
    );
  }
}

function renderPlateOverlays(layer) {
  if (
    state.currentScreen === 'LIGHTBOX_ZOOM' &&
    state.lightboxPlateAInserted
  ) {
    appendLoadingOverlay(
      layer,
      LOADING_IMG + 'overlay/lightbox_plate_a_inserted.png',
      'plate-overlay',
      { x: 0.265, y: 0.40, w: 0.45, h: 0.45 }
    );
  }

  if (state.currentScreen === 'PLATE_SLOTS_ZOOM') {
    // プレートの種類とスロット位置を分離して描画する。
    // ITEMS側の透過アイコンを使うので、A/C/Dのどれでも
    // 左・中央・右の任意スロットに同じ基準で配置できる。
    const itemIds = {
      A: 'plate_a',
      C: 'plate_c',
      D: 'plate_d'
    };

    const slotCenters = [
      { x: 0.22, y: 0.39 }, // 左
      { x: 0.50, y: 0.39 }, // 中央
      { x: 0.78, y: 0.39 }  // 右
    ];

    const plateSizes = {
      A: { w: 0.22, h: 0.10 },
      C: { w: 0.20, h: 0.12 },
      D: { w: 0.20, h: 0.12 }
    };

    state.plateDeviceSlots.forEach((letter, slotIndex) => {
      if (!letter) return;

      const itemId = itemIds[letter];
      const def = itemId ? ITEMS[itemId] : null;
      const center = slotCenters[slotIndex];
      const size = plateSizes[letter];

      if (!def || !def.icon || !center || !size) return;

      appendLoadingOverlay(
        layer,
        def.icon,
        'plate-overlay',
        {
          x: center.x - size.w / 2,
          y: center.y - size.h / 2,
          w: size.w,
          h: size.h
        }
      );
    });
  }

  if (state.currentScreen === 'EMPLOYEE_EXIT_BOX_ZOOM') {
    const slots = Array.isArray(state.exitPlateSlots)
      ? state.exitPlateSlots
      : [null, null];

    const slotIds = [
      'exit_plate_slot_left',
      'exit_plate_slot_right'
    ];

    slots.forEach((letter, index) => {
      if (letter !== 'A' && letter !== 'C') return;

      const itemId = letter === 'A' ? 'plate_a' : 'plate_c';
      const def = ITEMS[itemId];
      const rect = getLoadingHotspotRect(
        'EMPLOYEE_EXIT_BOX_ZOOM',
        slotIds[index]
      );

      if (!def || !def.icon || !rect) return;

      appendLoadingOverlay(
        layer,
        def.icon,
        'exit-plate-overlay',
        rect
      );
    });
  }
}

function renderSymbolFeedback(layer) {
  if (
    state.currentScreen !== 'SYMBOL_DISPLAY_ZOOM' ||
    state.symbolSolved
  ) return;

  // 上側記号の黒塗り位置
  // x / y = 左上位置
  // size = 正方形の一辺
  const feedbackRects = {
    circle:   { x: 0.160, y: 0.340, size: 0.170 },
    star:     { x: 0.342, y: 0.340, size: 0.170 },
    square:   { x: 0.515, y: 0.340, size: 0.170 },
    triangle: { x: 0.686, y: 0.340, size: 0.170 }
  };

  state.symbolInput.forEach((symbol) => {
    const r = feedbackRects[symbol];
    if (!r) return;

    const layerWidth = layer.clientWidth;

    // width / heightを同じpx数にするので必ず正方形
    const sizePx = layerWidth * r.size;

    const el = document.createElement('div');
    el.className = 'loading-symbol-pressed';

    Object.assign(el.style, {
      position: 'absolute',
      left: `${r.x * 100}%`,
      top: `${r.y * 100}%`,
      width: `${sizePx}px`,
      height: `${sizePx}px`,
      margin: '0',
      padding: '0',
      transform: 'none',
      pointerEvents: 'none'
    });

    layer.appendChild(el);
  });
}

function renderExitKeypad(layer) {
  if (
    state.currentScreen !== 'EMPLOYEE_EXIT_BOX_ZOOM' ||
    !state.exitBoxOpened ||
    !isExitKeypadReady()
  ) return;

  // Plate Aで通電している間は5桁すべてをHTML側で描画する。
  // 2桁目は常に「3」、残り4桁はプレイヤー入力（未入力時は「_」）。
  const input = state.exitKeypadInput || '';
  const digitDefs = [
    { hotspotId: 'exit_digit_1', value: input[0] },
    { hotspotId: 'exit_digit_2', value: '3' },
    { hotspotId: 'exit_digit_3', value: input[1] },
    { hotspotId: 'exit_digit_4', value: input[2] },
    { hotspotId: 'exit_digit_5', value: input[3] }
  ];

  digitDefs.forEach(({ hotspotId, value }) => {
    const rect = getLoadingHotspotRect('EMPLOYEE_EXIT_BOX_ZOOM', hotspotId);
    if (!rect) return;

    const digit = document.createElement('div');
    digit.className = 'loading-exit-digit';
    digit.textContent = (value == null || value === '') ? '_' : value;

    Object.assign(digit.style, {
      left: (rect.x * 100) + '%',
      top: (rect.y * 100) + '%',
      width: (rect.w * 100) + '%',
      height: (rect.h * 100) + '%'
    });

    layer.appendChild(digit);
  });

  // テンキーはloading-data.js側の透明Hotspotで処理する。
  // 背景に焼き付けられたボタンと二重表示しない。
}

function renderSolvedItems(layer) {
  if (state.currentScreen === 'SYMBOL_DISPLAY_ZOOM' && state.symbolSolved) {
    if (!state.pickedUp.cutter) appendLoadingOverlay(layer, LOADING_IMG + 'items/cutter.png', 'pickup-item', { x: 0.214, y: 0.647, w: 0.264, h: 0.166 });
    if (!state.pickedUp.transparent_sheet) appendLoadingOverlay(layer, LOADING_IMG + 'items/transparent_sheet.png', 'pickup-item', { x: 0.493, y: 0.651, w: 0.306, h: 0.159 });
  }
  if (state.currentScreen === 'DESTINATION_PANEL_ZOOM' && state.destinationSolved && !state.pickedUp.folding_step_folded && !state.pickedUp.folding_step_open) {
    appendLoadingOverlay(layer, LOADING_IMG + 'items/folding_step_folded.png', 'pickup-item', {x:.34,y:.32,w:.32,h:.28});
  }
  if (state.currentScreen === 'MAINT_BOX_ZOOM' && state.maintDirectionSolved && !state.pickedUp.management_key) {
    appendLoadingOverlay(layer, LOADING_IMG + 'items/management_key.png', 'pickup-item', {x: 0.431, y: 0.289, w: 0.284, h: 0.125});
  }
  if (state.currentScreen === 'D_CABINET_ZOOM' && state.dSliderSolved && !state.pickedUp.plate_d) {
    appendLoadingOverlay(layer, LOADING_IMG + 'items/plate_d.png', 'pickup-item', {x:.33,y:.55,w:.34,h:.25});
  }
}

function renderLoadingCustom(screen, layer) {
  if (!screen || !layer) return;
  const id = state.currentScreen || '';
  if (!(id.startsWith('LOADING') || ['DESTINATION_PANEL_ZOOM','MAINT_BOX_ZOOM','D_CABINET_ZOOM','LIGHTBOX_ZOOM','PLATE_SLOTS_ZOOM','SYMBOL_DISPLAY_ZOOM','EMPLOYEE_EXIT_PANEL_ZOOM','EMPLOYEE_EXIT_BOX_ZOOM'].includes(id))) return;
  ensureLoadingState();
  appendLoadingNav(layer);
  renderShutterBoxOverlays(layer);
  renderDestinationInput(layer);
  renderMaintControls(layer);
  renderDSlider(layer);
  renderPlateOverlays(layer);
  renderSymbolFeedback(layer);
  renderExitKeypad(layer);
  renderSolvedItems(layer);
}

function showLoadingPressFeedback(group, value) {
  if (group !== 'destination') return;
  loadingDestinationPress = value;
  setTimeout(() => {
    if (loadingDestinationPress === value) {
      loadingDestinationPress = null;
      if (state.currentScreen === 'DESTINATION_PANEL_ZOOM') render();
    }
  }, 130);
}
