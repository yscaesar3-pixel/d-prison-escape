// ============================================================
// solitary-actions.js — STAGE4「独居房」操作ロジック
// 新仕様：バケツ本体で扉保持 / Cでレバー解錠 / LLRLLR
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  // レバーズームから「戻る」で離れた場合は、入力途中の回数を破棄する。
  // main.js の backZoom() より先に実行したいので capture フェーズで受ける。
  const backBtn = document.getElementById('btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (state.currentScreen === 'SOLITARY_HIDDEN_DOOR_LEVER_ZOOM') {
        state.solitaryLeverSequence = [];
        state.solitaryLeverPosition = 'center';
      }
    }, true);
  }
});

function ensureSolitaryState() {
  if (typeof state.solitaryLightOn !== 'boolean') state.solitaryLightOn = false;
  if (!('solitaryInsertedPlate' in state)) state.solitaryInsertedPlate = null;
  if (typeof state.solitaryBucketTaken !== 'boolean') state.solitaryBucketTaken = false;
  if (typeof state.solitaryBucketBraced !== 'boolean') state.solitaryBucketBraced = false;
  if (typeof state.solitaryDoorUnlocked !== 'boolean') state.solitaryDoorUnlocked = false;
  if (typeof state.solitaryPassageOpen !== 'boolean') state.solitaryPassageOpen = false;
  if (typeof state.solitaryCleared !== 'boolean') state.solitaryCleared = false;
  if (!Array.isArray(state.solitaryLeverSequence)) state.solitaryLeverSequence = [];
  if (!['center', 'left', 'right'].includes(state.solitaryLeverPosition)) state.solitaryLeverPosition = 'center';
  if (state.currentScreen === 'SOLITARY_2_WALL') state.currentScreen = 'SOLITARY_2';
}

function handleSolitaryAction(action, hs) {
  ensureSolitaryState();
  switch (action.type) {
    case 'solitaryGoScreen': solitaryGoScreen(action.target); break;
    case 'solitaryMessage': toast(action.text); break;
    case 'solitaryWindowClue': solitaryWindowClue(); break;
    case 'solitaryOpenHiddenDoorZoom': solitaryOpenHiddenDoorZoom(); break;
    case 'solitaryTakeBucket': solitaryTakeBucket(); break;
    case 'solitaryCardSlot': solitaryCardSlot(); break;
    case 'solitaryGapAction': solitaryGapAction(); break;
    case 'solitaryOpenLeverZoom': solitaryOpenLeverZoom(); break;
    case 'solitaryLeverMove': solitaryLeverMove(action.direction); break;
    case 'solitaryEnterPassage': solitaryEnterPassage(); break;
    default: break;
  }
}

function solitaryGoScreen(targetId) {
  ensureSolitaryState();
  state.currentScreen = targetId;
  state.screenStack = [];
  render();
}

function solitaryOpenHiddenDoorZoom() {
  ensureSolitaryState();
  const target = solitaryHiddenDoorTarget(state);
  if (!target) return;
  goZoom(target);
}

function solitaryTakeBucket() {
  ensureSolitaryState();
  if (state.solitaryBucketTaken || !state.solitaryLightOn) return;
  state.solitaryBucketTaken = true;
  state.items.bucket = true;
  state.pickedUp.bucket = true;
  state.selectedItem = 'bucket';
  toast('古びたバケツを手に入れた。');
  render();
}

function solitaryCardSlot() {
  ensureSolitaryState();

  if (state.solitaryInsertedPlate) {
    const letter = state.solitaryInsertedPlate;
    const itemId = 'plate_' + letter.toLowerCase();

    state.items[itemId] = true;
    state.pickedUp[itemId] = true;
    state.solitaryInsertedPlate = null;
    state.selectedItem = itemId;
    if (typeof playSE === 'function') playSE('plate');

    if (letter === 'A') {
      state.solitaryLightOn = false;
      if (typeof playSE === 'function') setTimeout(() => playSE('power_off'), 100);
    }

    if (letter === 'B' && !state.solitaryPassageOpen) {
      if (state.solitaryBucketBraced) {
        toast('プレートBを抜いた。扉が下がったが、バケツにつっかえて止まった。');
        render();
        return;
      }
      toast('プレートBを抜くと、扉が閉じた。');
      render();
      return;
    }

    if (letter === 'C' && !state.solitaryDoorUnlocked) {
      toast('プレートCを抜いた。先ほど外れたロックが戻ったようだ。');
      render();
      return;
    }

    toast('プレート' + letter + 'を抜いた。');
    render();
    return;
  }

  const selected = state.selectedItem;
  if (!['plate_a', 'plate_b', 'plate_c'].includes(selected)) {
    toast('金属プレートを差し込めそうだ。');
    return;
  }

  const letter = selected.slice(-1).toUpperCase();
  delete state.items[selected];
  state.selectedItem = null;
  state.solitaryInsertedPlate = letter;
  state.solitaryLightOn = (letter === 'A');
  if (typeof playSE === 'function') playSE('plate');

  if (letter === 'A') {
    if (typeof playSE === 'function') setTimeout(() => playSE('power_on'), 100);
    toast('カチッ……部屋に明かりがついた。');
  } else if (letter === 'B') {
    if (typeof playSE === 'function') setTimeout(() => playSE('unlock_heavy'), 100);
    if (state.solitaryDoorUnlocked) {
      state.solitaryPassageOpen = true;
      state.solitaryBucketBraced = false;
      if (typeof playSE === 'function') playSE('door_open');
      toast('ガコン……主ロックが外れていた扉が、今度は最後まで開いた。');
    } else {
      toast('ガコン……隠し扉が開いた。だが、このままではプレートBを抜けば閉じてしまいそうだ。');
    }
  } else if (letter === 'C') {
    // Cは挿している間だけ、奥のレバー側ロックを解除する。
    // 画面自体は変化させない。
    if (typeof playSE === 'function') setTimeout(() => playSE('unlock'), 100);
    toast('カチッ……どこかでロックが外れたようだ。');
  }

  render();
}

function solitaryGapAction() {
  ensureSolitaryState();

  if (state.solitaryInsertedPlate !== 'B') {
    toast('扉は閉じている。');
    return;
  }

  if (state.solitaryBucketBraced) {
    toast('バケツが扉を支えている。');
    return;
  }

  if (requireSelected('bucket')) {
    state.solitaryBucketBraced = true;
    consumeItem('bucket');
    state.selectedItem = null;

    // 今いるGAPズームをその場でバケツ設置後ズームへ切り替える。
    // screenStackは保持するので「戻る」でSOLITARY_1_RIGHTへ戻れる。
    state.currentScreen = 'SOLITARY_HIDDEN_DOOR_BUCKET_ZOOM';
    toast('バケツを扉の下へ置いた。これなら扉が下がっても支えられそうだ。');
    render();
    return;
  }

  toast('扉は半分ほど開いているが、このままではプレートBを抜けば閉じてしまいそうだ。');
}

function solitaryOpenLeverZoom() {
  ensureSolitaryState();

  // レバーは、Bで扉が半開きの時点から目視・ズーム可能。
  // バケツ設置後も引き続き確認できる。
  const leverVisible = state.solitaryInsertedPlate === 'B' || state.solitaryBucketBraced;
  if (!leverVisible) return;

  // レバー画面へ入り直した時は、必ず1回目からやり直す。
  state.solitaryLeverSequence = [];
  state.solitaryLeverPosition = 'center';

  goZoom('SOLITARY_HIDDEN_DOOR_LEVER_ZOOM');

  // Cを差していない間は見られるだけで、左右操作はできない。
  if (state.solitaryInsertedPlate !== 'C' && !state.solitaryDoorUnlocked) {
    toast('レバーはロックされていて動かない。');
  }
}


function solitaryWindowClue() {
  ensureSolitaryState();
  if (!state.solitaryLightOn) {
    toast('暗くてよく見えない。');
    return;
  }
  state.solitaryWindowClueViewed = true;
  toast('窓の外に、わずかに景色が見える。');
  render();
}

function solitaryRecenterLeverSoon() {
  setTimeout(() => {
    if (state.currentScreen === 'SOLITARY_HIDDEN_DOOR_LEVER_ZOOM' && state.solitaryLeverPosition !== 'center') {
      state.solitaryLeverPosition = 'center';
      render();
    }
  }, 180);
}

function solitaryLeverMove(direction) {
  ensureSolitaryState();
  if (!['L', 'R'].includes(direction)) return;

  if (state.solitaryDoorUnlocked) {
    toast('主ロックはすでに外れている。');
    return;
  }

  if (!state.solitaryBucketBraced) {
    toast('操作できない。');
    return;
  }

  if (state.solitaryInsertedPlate !== 'C') {
    toast('レバーはロックされていて動かない。');
    return;
  }

  state.solitaryLeverPosition = direction === 'L' ? 'left' : 'right';

  const answer = ['L', 'L', 'R', 'L', 'L', 'R'];
  state.solitaryLeverSequence.push(direction);

  // 正誤判定は6回すべて入力し終わるまで行わない。
  // 途中で間違いを知らせると総当たりで正解できてしまうため。
  if (state.solitaryLeverSequence.length < answer.length) {
    toast('カチッ。');
    render();
    solitaryRecenterLeverSoon();
    return;
  }

  const correct = state.solitaryLeverSequence.every((value, i) => value === answer[i]);
  state.solitaryLeverSequence = [];

  if (correct && !state.solitaryWindowClueViewed) {
    toast('カチ……何も起こらない。まだ手掛かりが足りないようだ。');
  } else if (correct) {
    state.solitaryDoorUnlocked = true;
    if (typeof playSE === 'function') playSE('unlock_heavy');
    toast('ガコン！ 扉の主ロックが外れた。');
  } else {
    toast('カチ……何も起こらない。入力がリセットされた。');
  }

  render();
  solitaryRecenterLeverSoon();
}

function solitaryEnterPassage() {
  ensureSolitaryState();
  if (!state.solitaryPassageOpen) return;
  state.solitaryCleared = true;
  state.loadingStarted = true;
  state.currentScreen = 'LOADING_1';
  state.screenStack = [];
  toast('扉の奥へ進んだ。この先へ続いている。');
  render();
}

function handleSolitaryItemDetail(id) {
  return false;
}

const SOLITARY_HINT_LOGIC = {
  HINT_SOLITARY_LIGHT: {
    done: (s) => s.solitaryLightOn || s.solitaryBucketTaken || s.solitaryBucketBraced || s.solitaryDoorUnlocked || s.solitaryPassageOpen,
    ready: () => true,
  },
  HINT_SOLITARY_GAP: {
    done: (s) => s.solitaryBucketBraced,
    ready: (s) => s.solitaryBucketTaken || s.solitaryInsertedPlate === 'B',
  },
  HINT_SOLITARY_LOCK: {
    done: (s) => s.solitaryDoorUnlocked,
    ready: (s) => s.solitaryBucketBraced,
  },
  HINT_SOLITARY_EXIT: {
    done: (s) => s.solitaryPassageOpen,
    ready: (s) => s.solitaryDoorUnlocked,
  },
};

function getCurrentSolitaryHintId() {
  ensureSolitaryState();
  if (!state.capturedToSolitary || state.solitaryCleared) return null;
  let fallback = null;
  for (const id of SOLITARY_HINT_PRIORITY) {
    const logic = SOLITARY_HINT_LOGIC[id];
    if (!logic || logic.done(state)) continue;
    if (fallback === null) fallback = id;
    if (logic.ready(state)) return id;
  }
  return fallback;
}

