// ============================================================
// corridor-actions.js — STAGE2「廊下」操作ロジック
// STAGE1のjs/main.jsの謎ロジックには一切触れない。
// main.js の handleHotspotTap() default節から呼ばれる。
// ============================================================

// ---------- STAGE1→STAGE2 接続で使う値はstate.js側で初期化済み ----------

// 廊下用デバッグボタンはmain.jsのbindGlobalUI()を変更せず、ここで個別に配線する。
window.addEventListener('DOMContentLoaded', () => {
  const b1 = document.getElementById('btn-jump-corridor-start');
  const b2 = document.getElementById('btn-jump-corridor-power');
  const b3 = document.getElementById('btn-jump-guard-keypad');
  if (b1) b1.addEventListener('click', debugJumpCorridorStart);
  if (b2) b2.addEventListener('click', debugJumpCorridorPowerTest);
  if (b3) b3.addEventListener('click', debugJumpGuardKeypadTest);
});

// ---------- action.type ディスパッチ ----------
function handleCorridorAction(action, hs) {
  switch (action.type) {
    case 'goScreen': goScreen(action.target); break;
    case 'message': toast(action.text); break;
    case 'openBedBox': openBedBox(); break;
    case 'cycleBedInput': cycleBedInput(action.index); break;
    case 'submitBedInput': submitBedInput(); break;
    case 'cyclePowerDigit': cyclePowerDigit(action.index); break;
    case 'submitPowerCode': submitPowerCode(); break;
    case 'guardBoardInspect': guardBoardInspect(); break;
    case 'guardKeypadDigit': guardKeypadDigit(action.digit); break;
    case 'guardKeypadBroken': toast('壊れていて押せない。'); break;
    case 'guardKeypadClear': guardKeypadClear(); break;
    case 'guardKeypadEnter': guardKeypadEnter(); break;
    case 'guardDoorAction': guardDoorAction(); break;
    case 'enterGuardRoom': enterGuardRoom(); break;
    default:
      // ---- STAGE3「看守室」追加分：未知のaction.typeは看守室ディスパッチャへ委譲 ----
      if (typeof handleGuardRoomAction === 'function') handleGuardRoomAction(action, hs);
      break;
  }
}

// ---------- 廊下の左右・奥・戻る移動（WALL_ORDER/moveWall()は使わない） ----------
function goScreen(targetId) {
  // ベッド向きの答えを総当たりで出せないよう、6つの牢屋を見た記録を残す。
  const bedClueScreens = [
    'CORRIDOR_1_LEFT', 'CORRIDOR_1_RIGHT',
    'CORRIDOR_2_LEFT', 'CORRIDOR_2_RIGHT',
    'CORRIDOR_3_LEFT', 'CORRIDOR_3_RIGHT',
  ];
  if (bedClueScreens.includes(targetId)) {
    if (!Array.isArray(state.corridorBedCluesSeen)) state.corridorBedCluesSeen = [];
    if (!state.corridorBedCluesSeen.includes(targetId)) state.corridorBedCluesSeen.push(targetId);
  }

  state.currentScreen = targetId;
  state.screenStack = [];
  render();
}

// ---------- ベッド入力ボックス ----------
function openBedBox() {
  goZoom(state.corridorBedBoxOpen ? 'Z_BED_BOX_OPEN' : 'Z_BED_BOX');
}

function cycleBedInput(index) {
  if (state.corridorBedBoxOpen) return;
  const seq = ['blank', 'up', 'down'];
  const cur = state.corridorBedInput[index];
  state.corridorBedInput[index] = seq[(seq.indexOf(cur) + 1) % seq.length];
  render();
}

function submitBedInput() {
  if (state.corridorBedBoxOpen) return;
  const required = [
    'CORRIDOR_1_LEFT', 'CORRIDOR_1_RIGHT',
    'CORRIDOR_2_LEFT', 'CORRIDOR_2_RIGHT',
    'CORRIDOR_3_LEFT', 'CORRIDOR_3_RIGHT',
  ];
  const allBedsViewed = Array.isArray(state.corridorBedCluesSeen) && required.every(id => state.corridorBedCluesSeen.includes(id));
  const correct = JSON.stringify(state.corridorBedInput) === JSON.stringify(PUZZLES.corridorBedInput);

  if (correct && !allBedsViewed) {
    toast('何も起こらない。まだ確認していない牢屋がありそうだ。');
    return;
  }
  if (correct) {
    state.solved.corridorBedBox = true;
    state.corridorBedBoxOpen = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('カチッ……箱が開いた。');
    state.currentScreen = 'Z_BED_BOX_OPEN';
    render();
  } else {
    toast('何も起こらない。');
    // 仕様9：不正解でも入力はリセットしない
  }
}

// ---------- 665（電源コード）入力 ----------
function cyclePowerDigit(index) {
  if (!state.pickedUp.plate_b) {
    toast('中に何か入っている。先に調べてみよう。');
    return;
  }
  if (state.solved.corridorPowerCode) return;
  state.corridorPowerDigits[index] = (state.corridorPowerDigits[index] + 1) % 10;
  render();
}

function submitPowerCode() {
  if (!state.pickedUp.plate_b) {
    toast('中に何か入っている。先に調べてみよう。');
    return;
  }
  if (state.solved.corridorPowerCode) return;
  const code = state.corridorPowerDigits.join('');
  if (code === PUZZLES.corridorPowerCode && !state.guardSerialViewed) {
    toast('何も起こらない。まだ手掛かりが足りないようだ。');
    return;
  }
  if (code === PUZZLES.corridorPowerCode) {
    state.solved.corridorPowerCode = true;
    state.guardRoomPowerOn = true;
    if (typeof playSE === 'function') playSE('power_on');
    render();
    toast('ガコン……');
    setTimeout(() => toast('ブゥン……'), 700);
    setTimeout(() => toast('廊下の奥で何かが点灯した。'), 1500);
  } else {
    toast('何も起こらない。');
    // 仕様14：不正解でも数字は保持する
  }
}

// ---------- 電光掲示板 ----------
function guardBoardInspect() {
  if (!state.guardRoomPowerOn) {
    toast('掲示板は消えている。');
    return;
  }
  state.guardBoardInspected = true;
  toast('右上の表示部分が壊れているようだ。');
}

// ---------- 看守室テンキー ----------
function guardKeypadDigit(digit) {
  if (state.solved.guardKeypad) return;
  if (!state.guardRoomPowerOn) {
    toast('装置に電源が来ていない。');
    return;
  }
  if (state.guardDoorInput.length >= 4) return;
  state.guardDoorInput += String(digit);
  render();
}

function guardKeypadClear() {
  if (state.solved.guardKeypad) return;
  state.guardDoorInput = '';
  render();
}

function guardKeypadEnter() {
  if (state.solved.guardKeypad) return;
  if (!state.guardRoomPowerOn || !state.guardBoardInspected) {
    state.guardDoorInput = '';
    toast('何も起こらない。まだ手掛かりが足りないようだ。');
    render();
    return;
  }
  if (state.guardDoorInput === PUZZLES.guardDoorCode) {
    state.solved.guardKeypad = true;
    state.guardDoorUnlocked = true;
    if (typeof playSE === 'function') playSE('unlock_heavy');
    toast('ガコン……ロックが解除された。');
    render();
  } else {
    if (typeof playSE === 'function') playSE('error');
    toast('エラー');
    state.guardDoorInput = '';
    render();
  }
}

// ---------- 看守室の扉 ----------
function guardDoorAction() {
  if (state.guardDoorOpen) {
    enterGuardRoom();
    return;
  }
  if (!state.guardDoorUnlocked) {
    toast('鍵がかかっている。');
    return;
  }
  state.guardDoorOpen = true;
  if (typeof playSE === 'function') playSE('door_open');
  toast('ガコン……扉が開いた。');
  render();
}

function enterGuardRoom() {
  if (state.corridorCleared) return;
  state.corridorCleared = true;
  state.currentScreen = 'GUARD_ROOM';
  state.screenStack = [];
  render();
}

// ---------- ヒント優先度（廊下用） ----------
const CORRIDOR_HINT_LOGIC = {
  HINT_CORRIDOR_BED: {
    done: (s) => s.corridorBedBoxOpen,
    ready: () => true,
  },
  HINT_CORRIDOR_POWER: {
    done: (s) => s.solved.corridorPowerCode,
    ready: (s) => s.corridorBedBoxOpen && !!s.pickedUp.plate_b,
  },
  HINT_GUARD_BOARD: {
    done: (s) => s.solved.guardKeypad,
    ready: (s) => s.guardRoomPowerOn,
  },
};

function getCurrentCorridorHintId() {
  if (state.corridorCleared) return null;
  let fallback = null;
  for (const id of CORRIDOR_HINT_PRIORITY) {
    const logic = CORRIDOR_HINT_LOGIC[id];
    if (!logic || logic.done(state)) continue;
    if (fallback === null) fallback = id;
    if (logic.ready(state)) return id;
  }
  return fallback;
}

// ---------- テスト用ショートカット（開発用。仕様65：本番では無効化想定） ----------
function debugJumpCorridorStart() {
  state.cellStageCleared = true;
  state.corridorStarted = true;
  goScreen('CORRIDOR_1');
  toast('［デバッグ］廊下開始状態にジャンプしました。');
}

function debugJumpCorridorPowerTest() {
  state.cellStageCleared = true;
  state.corridorStarted = true;
  state.solved.corridorBedBox = true;
  state.corridorBedBoxOpen = true;
  state.corridorBedInput = PUZZLES.corridorBedInput.slice();
  state.corridorBedCluesSeen = ['CORRIDOR_1_LEFT','CORRIDOR_1_RIGHT','CORRIDOR_2_LEFT','CORRIDOR_2_RIGHT','CORRIDOR_3_LEFT','CORRIDOR_3_RIGHT'];
  state.guardSerialViewed = true;
  Object.assign(state.items, { plate_b: true });
  state.pickedUp.plate_b = true;
  jumpToScreen('Z_BED_BOX_OPEN');
  toast('［デバッグ］665入力テスト状態にジャンプしました。');
}

function debugJumpGuardKeypadTest() {
  state.cellStageCleared = true;
  state.corridorStarted = true;
  state.solved.corridorBedBox = true;
  state.corridorBedBoxOpen = true;
  state.solved.corridorPowerCode = true;
  state.guardRoomPowerOn = true;
  state.guardBoardInspected = true;
  jumpToScreen('Z_GUARD_KEYPAD');
  toast('［デバッグ］看守室テンキーテスト状態にジャンプしました。');
}
