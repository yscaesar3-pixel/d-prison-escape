// ============================================================
// loading-actions.js — STAGE5「搬入口」操作ロジック
// ============================================================

function ensureLoadingState() {
  if (typeof state.loadingStarted !== 'boolean') state.loadingStarted = false;
  if (typeof state.shutterSheetViewed !== 'boolean') state.shutterSheetViewed = false;
  if (!Array.isArray(state.symbolInput)) state.symbolInput = [];
  if (typeof state.symbolSolved !== 'boolean') state.symbolSolved = false;
  if (!Array.isArray(state.destinationInput)) state.destinationInput = [];
  if (typeof state.destinationSolved !== 'boolean') state.destinationSolved = false;
  if (typeof state.specialBoxRemoved !== 'boolean') state.specialBoxRemoved = false;
  if (typeof state.specialBoxOpened !== 'boolean') state.specialBoxOpened = false;
  if (typeof state.lightboxPlateAInserted !== 'boolean') state.lightboxPlateAInserted = false;
  if (typeof state.maintPlateCInserted !== 'boolean') state.maintPlateCInserted = false;
  if (typeof state.maintBoxOpened !== 'boolean') state.maintBoxOpened = false;
  if (!Array.isArray(state.maintDirectionInput)) state.maintDirectionInput = [];
  if (typeof state.maintDirectionSolved !== 'boolean') state.maintDirectionSolved = false;
  if (typeof state.dCabinetUnlocked !== 'boolean') state.dCabinetUnlocked = false;
  if (typeof state.dCabinetOpened !== 'boolean') state.dCabinetOpened = false;
  if (!Array.isArray(state.dSliderValues) || state.dSliderValues.length !== 4) state.dSliderValues = [1, 1, 1, 1];
  if (typeof state.dSliderSolved !== 'boolean') state.dSliderSolved = false;
  if (!Array.isArray(state.plateDeviceSlots) || state.plateDeviceSlots.length !== 3) state.plateDeviceSlots = [null, null, null];
  if (typeof state.plateDeviceSolved !== 'boolean') state.plateDeviceSolved = false;
  if (typeof state.exitPlateAInserted !== 'boolean') state.exitPlateAInserted = false;
  if (typeof state.exitPlateCInserted !== 'boolean') state.exitPlateCInserted = false;
  const legacyA = state.exitPlateAInserted === true;
  const legacyC = state.exitPlateCInserted === true;
  const slotsMissing = !Array.isArray(state.exitPlateSlots) || state.exitPlateSlots.length !== 2;
  const slotsEmptyWithLegacyFlags = !slotsMissing &&
    state.exitPlateSlots[0] == null && state.exitPlateSlots[1] == null &&
    (legacyA || legacyC);
  if (slotsMissing || slotsEmptyWithLegacyFlags) {
    // 旧セーブデータから移行。Cは新仕様の初期位置である右スロットへ、
    // Aも入っていた場合は左スロットへ配置する。
    state.exitPlateSlots = [legacyA ? 'A' : null, legacyC ? 'C' : null];
  }
  syncExitPlateFlags();
  if (typeof state.exitBoxOpened !== 'boolean') state.exitBoxOpened = false;
  // Cが挿入されている間だけカバーは開いた状態。
  state.exitBoxOpened = isExitPlateInserted('C');
  if (typeof state.exitKeypadInput !== 'string') state.exitKeypadInput = '';
  if (typeof state.exitUnlocked !== 'boolean') state.exitUnlocked = false;
  if (typeof state.employeeDoorOpen !== 'boolean') state.employeeDoorOpen = false;
  if (typeof state.gameCleared !== 'boolean') state.gameCleared = false;
}

function handleLoadingAction(action, hs) {
  ensureLoadingState();
  switch (action.type) {
    case 'loadingMessage': toast(action.text); break;
    case 'loadingGoScreen': loadingGoScreen(action.target); break;
    case 'loadingUseTransparentSheet': loadingUseTransparentSheet(); break;
    case 'loadingTakeSpecialBox': loadingTakeSpecialBox(); break;
    case 'loadingSymbol': loadingSymbol(action.symbol); break;
    case 'loadingTakeSolvedItem': loadingTakeSolvedItem(action.item); break;
    case 'loadingDestination': loadingDestination(action.value); break;
    case 'loadingTakeStep': loadingTakeStep(); break;
    case 'loadingMaintPlateC': loadingMaintPlateC(); break;
    case 'loadingMaintDirection': loadingMaintDirection(action.direction); break;
    case 'loadingTakeManagementKey': loadingTakeManagementKey(); break;
    case 'loadingUnlockDCabinet': loadingUnlockDCabinet(); break;
    case 'loadingSliderCycle': loadingSliderCycle(action.index); break;
    case 'loadingTakePlateD': loadingTakePlateD(); break;
    case 'loadingLightboxPlateA': loadingLightboxPlateA(); break;
    case 'loadingPlateSlot': loadingPlateSlot(action.index); break;
    case 'loadingExitPanel': loadingExitPanel(); break;
    case 'loadingExitPlateC': loadingExitPlateC(); break;
    case 'loadingExitPlateSlot': loadingExitPlateSlot(action.index); break;
    case 'loadingExitDigit': loadingExitDigit(action.digit); break;
    case 'loadingExitClear': loadingExitClear(); break;
    case 'loadingExitEnter': loadingExitEnter(); break;
    case 'loadingExitDoor': loadingExitDoor(); break;
    default: break;
  }
}

function loadingGoScreen(target) {
  state.currentScreen = target;
  state.screenStack = [];
  render();
}

function loadingUseTransparentSheet() {
  if (state.shutterSheetViewed) {
    toast('何かの模様だろうか。');
    return;
  }
  if (!requireSelected('transparent_sheet')) {
    toast('傷ついたシャッターだ。');
    return;
  }
  state.shutterSheetViewed = true;
  consumeItem('transparent_sheet');
  toast('透明シートが重なった。');
  render();
}

function loadingSymbol(symbol) {
  if (state.symbolSolved) return;
  state.symbolInput.push(symbol);
  if (state.symbolInput.length < 4) { render(); return; }
  if (JSON.stringify(state.symbolInput) === JSON.stringify(LOADING_SYMBOL_ANSWER)) {
    state.symbolSolved = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('カチッ……収納が開いた。');
  } else {
    toast('何も起こらない。入力がリセットされた。');
    state.symbolInput = [];
  }
  render();
}

function loadingTakeSolvedItem(item) {
  if (!state.symbolSolved || state.pickedUp[item]) return;
  addItem(item);
}

function loadingDestination(value) {
  if (state.destinationSolved) return;
  state.destinationInput.push(value);
  if (typeof showLoadingPressFeedback === 'function') showLoadingPressFeedback('destination', value);
  if (state.destinationInput.length < 3) { render(); return; }
  const correct = JSON.stringify(state.destinationInput) === JSON.stringify(LOADING_DESTINATION_ANSWER);
  if (correct && !state.shutterSheetViewed) {
    state.destinationInput = [];
    toast('何も起こらない。まだ手掛かりが足りないようだ。');
  } else if (correct) {
    state.destinationSolved = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('カチッ……収納が開いた。');
  } else {
    state.destinationInput = [];
    toast('エラー。入力がリセットされた。');
  }
  render();
}

function loadingTakeStep() {
  if (!state.destinationSolved || state.pickedUp.folding_step_folded || state.pickedUp.folding_step_open) return;
  addItem('folding_step_folded');
}

function handleLoadingInventoryRetap(id) {
  ensureLoadingState();

  if (
    id !== 'folding_step_folded' ||
    !state.items.folding_step_folded
  ) return false;

  // ここでは変形させず、詳細表示だけ開く
  openItemDetail('folding_step_folded');

  return true;
}

function handleLoadingComboCompleted(combo) {
  if (combo && combo.result === 'inspection_record') {
    state.specialBoxOpened = true;
  }
}

function loadingTakeSpecialBox() {
  if (state.specialBoxRemoved) return;

  if (!requireSelected('folding_step_open')) {
    toast('高くて手が届かない。');
    return;
  }

  // 開いた足場を使用して消費
  delete state.items.folding_step_open;

  state.specialBoxRemoved = true;
  addItem('special_cardboard_box');

  // 選択状態も解除
  state.selectedItem = null;

  render();
}

function loadingMaintPlateC() {
  if (state.maintBoxOpened) return;
  if (!requireSelected('plate_c')) {
    toast('');
    return;
  }
  // 開錠用途のみ。後続の3プレート装置でも使うためPlate Cは消費しない。
  state.maintPlateCInserted = false;
  state.maintBoxOpened = true;
  state.selectedItem = null;
  if (typeof playSE === 'function') {
    playSE('plate');
    setTimeout(() => playSE('unlock'), 100);
  }
  toast('Plate Cを使うと、ロックが外れた。');
  render();
}

function loadingMaintDirection(direction) {
  if (!state.maintBoxOpened || state.maintDirectionSolved) return;
  if (!state.pickedUp.inspection_record) {
    state.maintDirectionInput = [];
    toast('まだ手掛かりが足りないようだ。');
    render();
    return;
  }

  state.maintDirectionInput.push(direction);

  if (state.maintDirectionInput.length < 7) {
    render();
    return;
  }

  if (
    JSON.stringify(state.maintDirectionInput) ===
    JSON.stringify(LOADING_MAINT_ANSWER)
  ) {
    state.maintDirectionSolved = true;
    if (typeof playSE === 'function') playSE('correct');

    // 検品記録をインベントリから削除
    delete state.items.inspection_record;

    if (state.selectedItem === 'inspection_record') {
      state.selectedItem = null;
    }

    toast('カチッ……内部のロックが外れた。');
  } else {
    state.maintDirectionInput = [];
    toast('何も起こらない。入力がリセットされた。');
  }

  render();
}

function loadingTakeManagementKey() {
  if (!state.maintDirectionSolved || state.pickedUp.management_key) return;
  addItem('management_key');
}

function loadingUnlockDCabinet() {
  if (state.dCabinetOpened) return;
  if (!requireSelected('management_key')) {
    toast('鍵がかかっている。');
    return;
  }
  state.dCabinetUnlocked = true;
  state.dCabinetOpened = true;
  consumeItem('management_key');
  if (typeof playSE === 'function') playSE('unlock');
  toast('管理用の鍵でキャビネットを開けた。');
  render();
}

function loadingSliderCycle(index) {
  if (!state.dCabinetOpened || state.dSliderSolved) return;

  state.dSliderValues[index] =
    (state.dSliderValues[index] % 5) + 1;

  if (
    JSON.stringify(state.dSliderValues) ===
    JSON.stringify(LOADING_SLIDER_ANSWER)
  ) {
    state.dSliderSolved = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('カチッ……引き出しが開いた。');
  }

  render();
}

function loadingTakePlateD() {
  if (!state.dSliderSolved || state.pickedUp.plate_d) return;
  addItem('plate_d');
}

function toggleInsertedItem(flagName, itemId, insertedToast, removedToast) {
  if (state[flagName]) {
    state[flagName] = false;
    state.items[itemId] = true;
    state.pickedUp[itemId] = true;
    state.selectedItem = itemId;
    toast(removedToast);
    render();
    return true;
  }
  if (!requireSelected(itemId)) return false;
  state[flagName] = true;
  consumeItem(itemId);
  toast(insertedToast);
  render();
  return true;
}

function loadingLightboxPlateA() {
  const wasInserted = !!state.lightboxPlateAInserted;
  if (!toggleInsertedItem('lightboxPlateAInserted', 'plate_a', 'Plate Aを差すと、ライトが点灯した。', 'Plate Aを抜いた。')) {
    toast('');
    return;
  }
  if (typeof playSE === 'function') {
    playSE('plate');
    setTimeout(() => playSE(wasInserted ? 'power_off' : 'power_on'), 100);
  }
}

function isPlateDeviceArrangementCorrect() {
  return Array.isArray(state.plateDeviceSlots) &&
    JSON.stringify(state.plateDeviceSlots) === JSON.stringify(['D', 'A', 'C']);
}

function loadingPlateSlot(index) {
  const current = state.plateDeviceSlots[index];

  // 解答を一度確認した後でも、プレートは自由に抜き差しできる。
  // 表示は現在のD/A/C配置に連動し、進行履歴だけplateDeviceSolvedに保持する。
  if (current) {
    const itemId = 'plate_' + current.toLowerCase();
    state.items[itemId] = true;
    state.pickedUp[itemId] = true;
    state.plateDeviceSlots[index] = null;
    state.selectedItem = itemId;
    if (typeof playSE === 'function') playSE('plate');
    toast('Plate ' + current + 'を抜いた。');
    render();
    return;
  }

  const map = { plate_a: 'A', plate_c: 'C', plate_d: 'D' };
  const letter = map[state.selectedItem];
  if (!letter || !state.items[state.selectedItem]) {
    // 3枚プレート装置は用途をプレイヤー自身に気付いてもらうため、未選択時はコメントを出さない。
    return;
  }

  // 同じプレートを複数スロットへ入れることはできない。
  if (state.plateDeviceSlots.includes(letter)) {
    toast('そのプレートはすでに差し込まれている。');
    return;
  }

  const itemId = state.selectedItem;
  state.plateDeviceSlots[index] = letter;
  consumeItem(itemId);
  if (typeof playSE === 'function') playSE('plate');

  if (isPlateDeviceArrangementCorrect()) {
    const firstSolve = !state.plateDeviceSolved;
    state.plateDeviceSolved = true;
    if (typeof playSE === 'function') playSE('correct');
    toast(firstSolve
      ? '装置が作動した。△ × ★ □ ○ と表示された。'
      : '△ × ★ □ ○ が再び表示された。');
  }
  render();
}

function syncExitPlateFlags() {
  const slots = Array.isArray(state.exitPlateSlots) ? state.exitPlateSlots : [null, null];
  state.exitPlateAInserted = slots.includes('A');
  state.exitPlateCInserted = slots.includes('C');
}

function isExitPlateInserted(letter) {
  return Array.isArray(state.exitPlateSlots) && state.exitPlateSlots.includes(letter);
}

function isExitKeypadReady() {
  // Cはカバーのロック、Aは装置の電源。
  // カバーが開いている状態でAが入っていれば、表示とテンキーは動作する。
  return !!state.exitBoxOpened && isExitPlateInserted('A');
}

function openEmployeeExitBoxZoom() {
  state.currentScreen = 'EMPLOYEE_EXIT_BOX_ZOOM';
  state.screenStack = ['LOADING_1'];
  render();
}

function loadingExitPanel() {
  ensureLoadingState();

  // Cが挿入されている間だけ、通常画面からボックス内部へ戻れる。
  if (state.exitBoxOpened && isExitPlateInserted('C')) {
    openEmployeeExitBoxZoom();
    return;
  }
  state.exitBoxOpened = false;

  state.currentScreen = 'EMPLOYEE_EXIT_PANEL_ZOOM';
  state.screenStack = ['LOADING_1'];
  render();
}

function loadingExitPlateC() {
  ensureLoadingState();

  // すでにカバーが開いている場合は、Cを抜き差しせず内部へ戻るだけ。
  if (state.exitBoxOpened) {
    openEmployeeExitBoxZoom();
    return;
  }

  if (!requireSelected('plate_c')) {
    toast('扉にロックがかかっている。');
    return;
  }

  // Cは初回は右スロットを優先。Aがすでに右に残っている場合だけ左を使う。
  const preferredIndex = state.exitPlateSlots[1] == null ? 1 : 0;
  if (state.exitPlateSlots[preferredIndex] != null) {
    toast('プレートを差し込む空きがない。');
    return;
  }

  state.exitPlateSlots[preferredIndex] = 'C';
  state.exitBoxOpened = true;
  consumeItem('plate_c');
  if (typeof playSE === 'function') {
    playSE('plate');
    setTimeout(() => playSE('unlock'), 120);
  }
  syncExitPlateFlags();
  openEmployeeExitBoxZoom();
  toast(preferredIndex === 1
    ? 'Plate Cでカバーが開き、右スロットに差し込まれた。'
    : 'Plate Cでカバーが開き、左スロットに差し込まれた。');
}

function loadingExitPlateSlot(index) {
  ensureLoadingState();
  if (!state.exitBoxOpened || state.exitUnlocked) return;
  if (index !== 0 && index !== 1) return;

  const current = state.exitPlateSlots[index];

  // 差し込まれているプレートをタップした場合は抜く。
  if (current) {
    const itemId = current === 'A' ? 'plate_a' : 'plate_c';
    state.exitPlateSlots[index] = null;
    state.items[itemId] = true;
    state.pickedUp[itemId] = true;
    state.selectedItem = itemId;

    if (typeof playSE === 'function') playSE('plate');
    if (current === 'A') {
      // Aを抜くと電源OFFになるので途中入力も消す。
      state.exitKeypadInput = '';
      if (typeof playSE === 'function') setTimeout(() => playSE('power_off'), 100);
    }

    syncExitPlateFlags();

    if (current === 'C') {
      // Cはカバーのロックそのもの。抜いた瞬間にカバーが閉じて再ロックする。
      state.exitBoxOpened = false;
      state.currentScreen = 'EMPLOYEE_EXIT_PANEL_ZOOM';
      state.screenStack = ['LOADING_1'];
      toast('Plate Cを抜くと、カバーが閉じて再びロックされた。');
      render();
      return;
    }

    toast('Plate ' + current + 'を抜いた。');
    render();
    return;
  }

  const map = { plate_a: 'A', plate_c: 'C' };
  const letter = map[state.selectedItem];

  if (!letter || !state.items[state.selectedItem]) {
    toast('Plate A / Cを差し込めそうだ。');
    return;
  }

  if (isExitPlateInserted(letter)) {
    toast('そのプレートはすでに差し込まれている。');
    return;
  }

  const itemId = state.selectedItem;
  state.exitPlateSlots[index] = letter;
  consumeItem(itemId);
  syncExitPlateFlags();
  if (typeof playSE === 'function') playSE('plate');

  if (letter === 'A') {
    if (typeof playSE === 'function') setTimeout(() => playSE('power_on'), 100);
    toast(isExitKeypadReady()
      ? 'Plate Aを差すと、装置に電源が入りテンキーが使えるようになった。'
      : 'Plate Aを差すと、装置に電源が入った。');
  } else {
    toast(isExitKeypadReady()
      ? 'Plate Cを差した。テンキーが使えるようになった。'
      : 'Plate Cを差した。');
  }

  render();
}

function loadingExitDigit(digit) {
  if (!isExitKeypadReady() || state.exitUnlocked) return;

  // 背景画像の2桁目には「3」が固定表示されているため、
  // プレイヤーが入力するのは残り4桁だけ。
  if (state.exitKeypadInput.length >= 4) return;

  state.exitKeypadInput += String(digit);
  render();
}

function loadingExitClear() {
  if (!isExitKeypadReady() || state.exitUnlocked) return;
  state.exitKeypadInput = '';
  render();
}

function loadingExitEnter() {
  if (!isExitKeypadReady() || state.exitUnlocked) return;
  if (!state.plateDeviceSolved) {
    state.exitKeypadInput = '';
    toast('何も起こらない。まだ手掛かりが足りないようだ。');
    render();
    return;
  }

  // 入力4桁の1文字目の直後へ背景固定の「3」を差し込み、
  // 従来の正解コード「53142」と照合する。
  const raw = state.exitKeypadInput || '';
  const fullCode = raw.length === 4
    ? raw.slice(0, 1) + '3' + raw.slice(1)
    : '';

  if (fullCode === LOADING_EXIT_CODE) {
    state.exitUnlocked = true;
    state.employeeDoorOpen = true;
    if (typeof playSE === 'function') {
      playSE('unlock_heavy');
      setTimeout(() => playSE('door_open'), 180);
    }
    state.currentScreen = 'LOADING_1';
    state.screenStack = [];
    toast('ガコン……EMPLOYEE EXITが開いた。');
  } else {
    state.exitKeypadInput = '';
    if (typeof playSE === 'function') playSE('error');
    toast('エラー');
  }

  render();
}

function loadingExitDoor() {
  if (!state.employeeDoorOpen || state.gameCleared || inputLocked) return;

  playEndingSequence(() => {
    state.gameCleared = true;
    state.cleared = true;
    state.clearTimeMs = Math.max(0, Date.now() - (Number(state.runStartedAt) || Date.now()));
    state.clearOverlayDismissed = false;
    state.currentScreen = 'GAME_CLEAR';
    state.screenStack = [];
    render();
  });
}



const LOADING_HINT_LOGIC = {
  HINT_LOADING_SYMBOL: { done: (s) => s.symbolSolved, ready: () => true },
  HINT_LOADING_DESTINATION: { done: (s) => s.destinationSolved, ready: (s) => s.symbolSolved },
  HINT_LOADING_SPECIAL_BOX: { done: (s) => !!s.pickedUp.inspection_record, ready: (s) => s.destinationSolved },
  HINT_LOADING_MAINT: { done: (s) => s.maintDirectionSolved, ready: (s) => !!s.pickedUp.inspection_record },
  HINT_LOADING_PLATE_D: { done: (s) => !!s.pickedUp.plate_d, ready: (s) => s.maintDirectionSolved },
  HINT_LOADING_PLATES: { done: (s) => s.plateDeviceSolved, ready: (s) => !!s.pickedUp.plate_d },
  HINT_LOADING_EXIT: { done: (s) => s.gameCleared, ready: (s) => s.plateDeviceSolved },
};

function getCurrentLoadingHintId() {
  ensureLoadingState();
  if (!state.loadingStarted || state.gameCleared) return null;
  let fallback = null;
  for (const id of LOADING_HINT_PRIORITY) {
    const logic = LOADING_HINT_LOGIC[id];
    if (!logic || logic.done(state)) continue;
    if (fallback === null) fallback = id;
    if (logic.ready(state)) return id;
  }
  return fallback;
}
