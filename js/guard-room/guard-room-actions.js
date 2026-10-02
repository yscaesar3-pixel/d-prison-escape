// ============================================================
// guard-room-actions.js — STAGE3「看守室」操作ロジック
// STAGE1/2の既存ロジックには一切触れない。
// corridor-actions.js の handleCorridorAction() default節から呼ばれる。
// ============================================================

// ---------- STAGE2→STAGE3 接続：enterGuardRoom()を上書き ----------
// 後から読み込まれるscriptの関数宣言が有効になる（corridor-actions.jsは変更しない）。
function enterGuardRoom() {
  if (state.corridorCleared) return;
  state.corridorCleared = true;
  state.guardRoomStarted = true;
  state.currentScreen = 'GUARD_ROOM_1';
  state.screenStack = [];
  render();
  toast('廊下の奥へ進むと、看守室らしき部屋に出た。');
}

// ---------- action.type ディスパッチ ----------
function handleGuardRoomAction(action, hs) {
  switch (action.type) {
    case 'guardRoomExitDoorAction': guardRoomExitDoorAction(); break;
    case 'useSchedulePlate': useSchedulePlate(); break;
    case 'cycleScheduleDigit': cycleScheduleDigit(action.index); break;
    case 'cycleScheduleZone': cycleScheduleZone(); break;
    case 'submitScheduleCode': submitScheduleCode(); break;
    case 'takeGuardDrawerKey': takeGuardDrawerKey(); break;
    case 'openKeyManagement': openKeyManagement(); break;
    case 'unlockKeyPanel': unlockKeyPanel(); break;
    case 'selectGuardKey': selectGuardKey(action.slot); break;
    case 'insertMonitorFuse': insertMonitorFuse(); break;
    case 'monitorButton': monitorButton(action.letter); break;
    case 'cycleChannel': cycleChannel(); break;
    case 'submitChannel': submitChannel(); break;
    case 'mazeMove': mazeMove(action.dir); break;
    case 'mazeReset': mazeReset(); break;
    case 'pickupPlateC': pickupPlateC(); break;
    default:
      if (typeof handleSolitaryAction === 'function') handleSolitaryAction(action, hs);
      break;
  }
}

// ---------- 看守室出口ドア（GUARD_ROOM_4） ----------
function guardRoomExitDoorAction() {
  if (state.guardRoomDoorOpen) {
    state.guardRoomExited = true;
    goScreen('POST_GUARD_CORRIDOR');
    toast('看守室から出られた。まだ廊下が続いているようだ。');
    return;
  }
  if (!state.guardExitUnlocked) {
    toast('鍵がかかっている。');
    return;
  }
  state.guardRoomDoorOpen = true;
  if (typeof playSE === 'function') playSE('door_open');
  toast('ガコン……扉が開いた。');
  render();
}

// ---------- 謎①：時計＋勤務表＋ロッカー→引き出し(751④) ----------
function useSchedulePlate() {
  if (state.guardSchedulePlateUsed) return;

  if (!requireSelected('perforated_plate')) {
    toast('勤務表が見える。');
    return;
  }

  state.guardSchedulePlateUsed = true;
  consumeItem('perforated_plate');
  if (typeof playSE === 'function') playSE('plate');

  toast('プレートを重ねると、穴から数字が見えた。');
  render();
}

function cycleScheduleDigit(index) {
  if (state.guardDrawerOpen) return;
  state.guardScheduleDigits[index] = (state.guardScheduleDigits[index] + 1) % 10;
  render();
}

function cycleScheduleZone() {
  if (state.guardDrawerOpen) return;
  state.guardScheduleZone = (state.guardScheduleZone % 5) + 1;
  render();
}

function takeGuardDrawerKey() {
  state.pickedUp = state.pickedUp || {};
  state.items = state.items || {};

  // 既に取得済みなら表示だけ同期する。
  if (state.pickedUp.key_board_key) {
    render();
    return;
  }

  // 通常の addItem() が既所有アイテムで早期returnするケースも考慮し、
  // items / pickedUp をここで同時に確定して即時再描画する。
  state.items.key_board_key = true;
  state.pickedUp.key_board_key = true;
  if (typeof playSE === 'function') playSE('item_get');
  toast((ITEMS.key_board_key ? ITEMS.key_board_key.name : '小鍵') + ' を手に入れた。');
  render();
}

function submitScheduleCode() {
  if (state.guardDrawerOpen) return;
  const digitsMatch = JSON.stringify(state.guardScheduleDigits) === JSON.stringify(PUZZLES.guardScheduleDigits);
  const zoneMatch = state.guardScheduleZone === PUZZLES.guardScheduleZone;
  const cluesViewed = !!state.guardClockViewed && !!state.guardScheduleViewed && !!state.guardLockersViewed;
  if (digitsMatch && zoneMatch && !cluesViewed) {
    toast('何も起こらない。まだ確認していない手掛かりがありそうだ。');
    render();
    return;
  }
  if (digitsMatch && zoneMatch) {
    state.guardScheduleSolved = true;
    state.guardDrawerOpen = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('カチッ……引き出しが開いた。');
  } else {
    toast('何も起こらない。');
    // 不正解でも入力は保持する
  }
  render();
}

// ---------- 謎②：鍵管理盤 ----------
function openKeyManagement() {
  // 施錠中は、壁面の鍵管理盤そのものに小鍵を使う。
  // 鍵を持っていない／選択していない状態では、ズーム画面へも進ませない。
  if (!state.guardKeyBoardUnlocked) {
    if (!requireSelected('key_board_key')) {
      toast('鍵管理盤には鍵がかかっている。');
      return;
    }
    state.guardKeyBoardUnlocked = true;
    if (typeof playSE === 'function') playSE('unlock');
    state.guardKeyOrder = GUARD_KEY_INITIAL_ORDER.slice();
    state.guardKeyPoolSelected = null;
    consumeItem('key_board_key');
    toast('カチッ……鍵管理盤が開いた。');
    render();
    return;
  }

  // 解錠後にもう一度タップすると、鍵の並び替え画面へ入る。
  goZoom('Z_GUARD_KEYPANEL');
}

// 旧actionとの互換用。現在は壁面の openKeyManagement() を使用する。
function unlockKeyPanel() {
  openKeyManagement();
}

// 1本目を選択→2本目をタップで位置を交換。交換後に毎回正解判定。
function selectGuardKey(slot) {
  if (!state.guardKeyBoardUnlocked || state.guardKeyOrderSolved) return;
  if (slot < 0 || slot >= state.guardKeyOrder.length) return;

  if (state.guardKeyPoolSelected == null) {
    state.guardKeyPoolSelected = slot;
    render();
    return;
  }

  if (state.guardKeyPoolSelected === slot) {
    state.guardKeyPoolSelected = null;
    render();
    return;
  }

  const first = state.guardKeyPoolSelected;
  const tmp = state.guardKeyOrder[first];
  state.guardKeyOrder[first] = state.guardKeyOrder[slot];
  state.guardKeyOrder[slot] = tmp;
  state.guardKeyPoolSelected = null;
  checkGuardKeyOrder();
}

function checkGuardKeyOrder() {
  const correct = JSON.stringify(state.guardKeyOrder) === JSON.stringify(PUZZLES.guardKeyOrder);
  if (correct && !state.guardKeyNoteViewed) {
    // 配置メモを確認する前の偶然正解は成立させず、並びも初期状態へ戻す。
    state.guardKeyOrder = GUARD_KEY_INITIAL_ORDER.slice();
    state.guardKeyPoolSelected = null;
    toast('何も起こらない。まだ手掛かりが足りないようだ。');
    render();
    return;
  }
  if (correct) {
    state.guardKeyOrderSolved = true;
    state.guardCabinetOpen = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('カチッ……隠し収納が開いた。');
  }
  render();
}

// ---------- 謎③：監視モニター ----------
let guardMonitorPressedLetter = null;
let guardMonitorPressTimer = null;

function insertMonitorFuse() {
  if (state.guardMonitorFuseInserted) return;
  if (!requireSelected('monitor_fuse')) {
    toast('ヒューズが必要だ。');
    return;
  }
  state.guardMonitorFuseInserted = true;
  consumeItem('monitor_fuse');
  if (typeof playSE === 'function') playSE('power_on');
  toast('モニターに映像が映り始めた。');
  render();
}

function monitorButton(letter) {
  if (!state.guardMonitorFuseInserted || state.guardMonitorSequenceSolved) return;

  // 既存ステージと同様に、押したボタンを短時間だけ沈ませて見せる。
  guardMonitorPressedLetter = letter;
  if (guardMonitorPressTimer) clearTimeout(guardMonitorPressTimer);
  guardMonitorPressTimer = setTimeout(() => {
    guardMonitorPressedLetter = null;
    render();
  }, 130);

  state.guardMonitorSequence.push(letter);
  render();
  if (state.guardMonitorSequence.length >= 4) {
    const seq = state.guardMonitorSequence.slice(-4);
    setTimeout(() => {
      if (JSON.stringify(seq) === JSON.stringify(PUZZLES.guardMonitorSequence)) {
        state.guardMonitorSequenceSolved = true;
        state.guardMonitorCabinetOpen = true;
        if (typeof playSE === 'function') playSE('correct');
        toast('カチッ……隠し収納が開いた。');
      } else {
        toast('入力順をリセットした。');
      }
      state.guardMonitorSequence = [];
      render();
    }, 300);
  }
}

// ---------- 謎④：穴あきプレート＋チャンネル(3294) ----------
function cycleChannel() {
  if (!state.guardMonitorFuseInserted) return;
  if (state.guardChannelIndex == null || state.guardChannelIndex < 0) state.guardChannelIndex = 0;
  else state.guardChannelIndex = (state.guardChannelIndex + 1) % PUZZLES.guardChannelCandidates.length;
  render();
}

function submitChannel() {
  if (!state.guardMonitorFuseInserted || state.guardChannelSolved) return;
  const current = (state.guardChannelIndex == null || state.guardChannelIndex < 0) ? '' : PUZZLES.guardChannelCandidates[state.guardChannelIndex];
  if (state.guardSchedulePlateUsed && current === PUZZLES.guardChannelAnswer) {
    state.guardChannelSolved = true;
    state.guardSpecialMonitorActive = true;
    if (typeof playSE === 'function') playSE('correct');
    toast('4つのモニターが一斉に特別な映像へ切り替わった。');
  } else {
    toast('モニターに変化はない。');
  }
  render();
}

// ---------- 謎⑤：迷路（15秒・最初の方向入力で開始） ----------
let mazeTimerHandle = null;
let mazeInputLocked = false;
let mazeSessionInitialized = false;

function ensureMazeSessionFresh() {
  if (mazeSessionInitialized) return;
  mazeSessionInitialized = true;
  if (!state.guardMazeCleared) {
    state.guardMazePosition = Object.assign({}, GUARD_MAZE_START);
    state.guardMazeStarted = false;
    state.guardMazeTimeLeft = GUARD_MAZE_TIME_LIMIT;
  }
}

function stopMazeTimer() {
  if (mazeTimerHandle) { clearInterval(mazeTimerHandle); mazeTimerHandle = null; }
}

function startMazeTimer() {
  stopMazeTimer();
  mazeTimerHandle = setInterval(() => {
    state.guardMazeTimeLeft -= 1;
    if (state.guardMazeTimeLeft <= 0) {
      state.guardMazeTimeLeft = 0;
      stopMazeTimer();
      render();
      mazeTimeUp();
      return;
    }
    render();
  }, 1000);
}

function mazeMove(dir) {
  if (state.guardMazeCleared || mazeInputLocked) return;
  if (!state.guardSpecialMonitorActive) {
    toast('まだこの映像は表示されていない。');
    return;
  }
  if (!state.guardMazeStarted) {
    state.guardMazeStarted = true;
    startMazeTimer();
  }
  const { row, col } = state.guardMazePosition;
  const adj = GUARD_MAZE_ADJACENCY;
  let nr = row, nc = col;
  if (dir === 'up' && row > 0 && adj.verticalOpen[row - 1][col]) nr = row - 1;
  else if (dir === 'down' && row < 5 && adj.verticalOpen[row][col]) nr = row + 1;
  else if (dir === 'left' && col > 0 && adj.horizontalOpen[row][col - 1]) nc = col - 1;
  else if (dir === 'right' && col < 5 && adj.horizontalOpen[row][col]) nc = col + 1;
  else { render(); return; }
  state.guardMazePosition = { row: nr, col: nc };
  if (nr === GUARD_MAZE_GOAL.row && nc === GUARD_MAZE_GOAL.col) {
    stopMazeTimer();
    state.guardMazeCleared = true;
    state.guardExitUnlocked = true;
    if (typeof playSE === 'function') playSE('unlock_heavy');
    toast('ガコン……どこかのロックが外れた。');
  }
  render();
}

function mazeReset() {
  if (state.guardMazeCleared) return;
  stopMazeTimer();
  state.guardMazePosition = Object.assign({}, GUARD_MAZE_START);
  state.guardMazeStarted = false;
  state.guardMazeTimeLeft = GUARD_MAZE_TIME_LIMIT;
  render();
}

function mazeTimeUp() {
  mazeInputLocked = true;
  toast('看守が戻ってくる気配がする！');
  setTimeout(() => {
    showBlackout(1400, () => {
      state.guardMazePosition = Object.assign({}, GUARD_MAZE_START);
      state.guardMazeStarted = false;
      state.guardMazeTimeLeft = GUARD_MAZE_TIME_LIMIT;
      mazeInputLocked = false;
      render();
    });
  }, 600);
}

// ---------- 汎用ブラックアウト演出 ----------
function showBlackout(ms, done) {
  const overlay = document.getElementById('anim-overlay');
  overlay.innerHTML = '';
  overlay.classList.add('show', 'blackout');

  setTimeout(() => {
    // 先に遷移先を描画してから暗幕を外す。
    // これによりSTAGE3→STAGE4で直前の明るい画面が一瞬見えるのを防ぐ。
    if (done) done();

    const release = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.remove('show', 'blackout');
        });
      });
    };

    const stageImg = document.getElementById('stage-image');
    if (stageImg && !stageImg.complete) {
      let released = false;
      const once = () => {
        if (released) return;
        released = true;
        release();
      };
      stageImg.addEventListener('load', once, { once: true });
      stageImg.addEventListener('error', once, { once: true });
      setTimeout(once, 500);
    } else {
      release();
    }
  }, ms);
}

// ---------- プレートC取得→捕捉イベント→SOLITARY_1 ----------
function pickupPlateC() {
  if (state.plateCPicked) return;
  state.plateCPicked = true;
  lockInput(7600);
  addItem('plate_c');
  setTimeout(() => toast('……！'), 2200);
  setTimeout(() => toast('足音が近づいてくる。'), 3300);
  setTimeout(() => toast('見つかった！'), 4700);
  setTimeout(() => {
    showBlackout(1600, () => {
      state.capturedToSolitary = true;
      state.currentScreen = 'SOLITARY_1';
      state.screenStack = [];
      render();
      setTimeout(() => toast('……気がつくと、薄暗い部屋の中だった。'), 250);
      setTimeout(() => toast('看守に捕まり、独居房へ放り込まれたようだ。'), 1850);
    });
  }, 5600);
}

// ---------- ヒント優先度（看守室用） ----------
const GUARD_HINT_LOGIC = {
  HINT_GUARD_SCHEDULE: {
    done: (s) => s.guardDrawerOpen,
    ready: () => true,
  },
  HINT_GUARD_KEYS: {
    done: (s) => s.guardKeyOrderSolved,
    ready: (s) => !!s.pickedUp.key_board_key,
  },
  HINT_GUARD_MONITOR: {
    done: (s) => s.guardMonitorSequenceSolved,
    ready: (s) => !!s.pickedUp.monitor_fuse,
  },
  HINT_GUARD_PLATE: {
    done: (s) => s.guardChannelSolved,
    ready: (s) => !!s.pickedUp.perforated_plate,
  },
  HINT_GUARD_MAZE: {
    done: (s) => s.guardMazeCleared,
    ready: (s) => s.guardSpecialMonitorActive,
  },
};

function getCurrentGuardRoomHintId() {
  if (state.capturedToSolitary) return null;
  let fallback = null;
  for (const id of GUARD_HINT_PRIORITY) {
    const logic = GUARD_HINT_LOGIC[id];
    if (!logic || logic.done(state)) continue;
    if (fallback === null) fallback = id;
    if (logic.ready(state)) return id;
  }
  return fallback;
}

