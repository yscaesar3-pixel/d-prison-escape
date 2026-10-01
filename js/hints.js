// ============================================================
// hints.js — 進行状況連動ヒントシステム（仕様71〜89対応）
// ============================================================

// 各hintIdの「達成済みか」「今すぐ着手可能か」を判定する
const HINT_LOGIC = {
  HINT_PATTERN: {
    done: (s) => s.solved.pattern,
    ready: () => true,
  },
  HINT_BED_FRAME: {
    done: (s) => s.solved.frame,
    ready: (s) => !!s.items.wrench,
  },
  HINT_WALL_RUBBING: {
    done: (s) => s.wallRubbingDone,
    ready: (s) => !!s.items.pencil && (s.wallPaperPlaced || !!s.items.toilet_paper),
  },
  HINT_CHAIR: {
    done: (s) => s.solved.chair,
    ready: (s) => s.wallRubbingDone,
  },
  HINT_TOILET: {
    done: (s) => s.solved.toilet,
    ready: () => true,
  },
  HINT_BED_UNDER: {
    done: (s) => s.solved.bedUnder || !!s.pickedUp.magnet_part,
    ready: (s) => !!s.items.rod_hook || !!s.items.rod_hook_string,
  },
  HINT_MIRROR: {
    done: (s) => s.mirrorClean,
    ready: (s) => !!s.items.cloth || !!s.items.cloth_wet,
  },
  HINT_FAUCET: {
    done: (s) => s.solved.faucet,
    ready: (s) => s.mirrorClean,
  },
  HINT_MIRROR_PIECE: {
    done: (s) => !!s.pickedUp.mirror_piece,
    ready: (s) => s.solved.faucet && (!!s.items.faucet_handle || !!s.items.mirror),
  },
  HINT_RETRIEVAL_TOOL: {
    done: (s) => !!s.pickedUp.retrieval_rod,
    ready: (s) => (!!s.items.rod_hook && !!s.items.string_item && !!s.items.magnet_part) || (!!s.items.rod_hook_string && !!s.items.magnet_part),
  },
  HINT_VENT: {
    done: (s) => s.keyLocationFound,
    ready: (s) => !!s.items.mirror_piece,
  },
  HINT_PLATE_A: {
    done: (s) => !!s.pickedUp.plate_a,
    ready: (s) => s.solved.toilet || !!s.items.small_key || s.drawerOpen,
  },
  HINT_FINAL_KEY: {
    done: (s) => s.cleared,
    ready: (s) => s.keyLocationFound || !!s.items.cell_key,
  },
};

// 仕様73〜77：現在プレイヤーが実際に行動可能な未解決要素を優先して選ぶ
function getCurrentHintId() {
  // ---- STAGE5「搬入口」 ----
  if (state.loadingStarted && !state.gameCleared) {
    return (typeof getCurrentLoadingHintId === 'function') ? getCurrentLoadingHintId() : null;
  }
  // ---- STAGE4「独居房」 ----
  if (state.capturedToSolitary && !state.solitaryCleared) {
    return (typeof getCurrentSolitaryHintId === 'function') ? getCurrentSolitaryHintId() : null;
  }
  // ---- STAGE3「看守室」追加分：看守室開始後はさらに優先して分岐する ----
  if (state.guardRoomStarted) {
    return (typeof getCurrentGuardRoomHintId === 'function') ? getCurrentGuardRoomHintId() : null;
  }
  // ---- STAGE2「廊下」追加分：廊下開始後はSTAGE1のヒント判定に触れず分岐する ----
  if (state.corridorStarted) {
    return (typeof getCurrentCorridorHintId === 'function') ? getCurrentCorridorHintId() : null;
  }
  if (state.cleared) return null;
  let fallback = null;
  for (const id of HINT_PRIORITY) {
    const logic = HINT_LOGIC[id];
    if (!logic || logic.done(state)) continue;
    if (fallback === null) fallback = id;
    if (logic.ready(state)) return id;
  }
  return fallback;
}

function updateHintButtonBadge() {
  const btn = document.getElementById('btn-hint');
  if (!btn) return;
  // ---- STAGE3「看守室」追加分：看守室開始後はcapturedToSolitaryで完了判定する ----
  // ---- STAGE2「廊下」追加分：廊下開始後はcorridorClearedで完了判定する ----
  const done = state.loadingStarted ? state.gameCleared
    : (state.capturedToSolitary ? state.solitaryCleared
      : (state.guardRoomStarted ? state.capturedToSolitary
        : (state.corridorStarted ? state.corridorCleared : state.cleared)));
  btn.classList.toggle('hidden-hint', done);
}

function openHintPanel() {
  renderHintPanelContent();
  document.getElementById('hint-panel').classList.add('show');
}

function closeHintPanel() {
  document.getElementById('hint-panel').classList.remove('show');
}

function renderHintPanelContent() {
  const body = document.getElementById('hint-body');
  const hintId = getCurrentHintId();
  if (!hintId) {
    body.innerHTML = '<p>今は特に案内することがないようだ。</p>';
    return;
  }
  const data = HINT_DATA[hintId];
  const progress = state.hintProgress[hintId] || 0;

  let revealed = '';
  if (progress >= 1) revealed += `<div class="hint-line"><b>ヒント1：</b>${data.hint1}</div>`;
  if (progress >= 2) revealed += `<div class="hint-line"><b>ヒント2：</b>${data.hint2}</div>`;
  if (progress >= 3) revealed += `<div class="hint-line answer"><b>解答：</b>${data.answer}</div>`;

  let promptText;
  if (progress === 0) promptText = '広告を見るとヒントを確認できます。';
  else if (progress === 1) promptText = '広告を見ると、さらに詳しいヒントを確認できます。';
  else if (progress === 2) promptText = '広告を見ると解答を確認できます。';
  else promptText = 'この謎については、これ以上のヒントはありません。';

  body.innerHTML = `
    <div class="hint-topic">${data.label}</div>
    ${revealed || '<p class="hint-empty">まだヒントを見ていない。</p>'}
    <p class="hint-prompt">${promptText}</p>
    ${progress < 3
      ? '<button id="hint-watch-ad" class="btn-primary">▶ リワード広告を見る</button>'
      : ''}
  `;
  if (progress < 3) {
    document.getElementById('hint-watch-ad').addEventListener('click', () => watchAdForHint(hintId));
  }
}

// リワードを獲得した場合のみ次のヒント/解答を開放する。
// PCブラウザでは ads.js 側で開発用の模擬視聴へ自動フォールバックする。
function watchAdForHint(hintId) {
  if (typeof requestHintViaRewardedAd !== 'function') {
    alert('広告機能を初期化できませんでした。');
    return;
  }

  requestHintViaRewardedAd(() => {
    const cur = state.hintProgress[hintId] || 0;
    state.hintProgress[hintId] = Math.min(3, cur + 1);
    saveState();
    renderHintPanelContent();
  });
}
