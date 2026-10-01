// ============================================================
// state.js — ゲーム進行状態の管理
// ============================================================

const SAVE_KEY = 'prisonEscape_stage1_save_v2';

function createInitialState() {
  return {
    currentScreen: 'WALL_1',
    screenStack: [],
    selectedItem: null,
    detailItem: null,
    detailViewMode: 'front',

    items: {},
    pickedUp: {},
    itemStateOverride: {},

    doorOpen: false,
    pillowLifted: false,
    blanketOpen: false,
    mattressPanelOpen: false,
    wallRubbingDone: false,
    wallPaperPlaced: false,
    drawerOpen: false,
    chairFlipped: false,
    mirrorClean: false,
    coreOnMirror: false,
    mirrorRemoved: false,
    keyLocationFound: false,
    toiletPaperUses: 0,

    toiletInputSeq: [],
    chairInputSeq: [],
    faucetHeights: [1, 1, 1, 1],
    patternInputActive: false,

    // 謎の手掛かりを実際に確認したか（総当たり・答え先取り防止）
    patternSymbolsViewed: false,
    patternOrderViewed: false,

    solved: {
      pattern: false,
      frame: false,
      toilet: false,
      chair: false,
      faucet: false,
      bedUnder: false,
      // ---- STAGE2「廊下」追加分 ----
      corridorBedBox: false,
      corridorPowerCode: false,
      guardKeypad: false,
    },

    hintProgress: {},
    cleared: false,
    clearOverlayDismissed: false,

    // プレイ結果 / フローティングメモ
    runStartedAt: Date.now(),
    clearTimeMs: null,
    memo: {
      text: '',
      x: null,
      y: null,
      width: 300,
      height: 230,
      dim: false,
      open: false,
    },
    audioSettings: {
      bgmEnabled: true,
      seEnabled: true,
    },

    // ============================================================
    // STAGE2「廊下」追加state（STAGE1既存項目には手を加えない）
    // ============================================================
    cellStageCleared: false,
    corridorStarted: false,

    corridorBedInput: ['blank', 'blank', 'blank', 'blank', 'blank', 'blank'],
    corridorBedBoxOpen: false,
    corridorBedCluesSeen: [],
    guardSerialViewed: false,
    guardBoardInspected: false,

    corridorPowerDigits: [0, 0, 0],
    guardRoomPowerOn: false,

    guardDoorInput: '',
    guardDoorUnlocked: false,
    guardDoorOpen: false,

    corridorCleared: false,

    // ============================================================
    // STAGE3「看守室」追加state（STAGE1/2既存項目には手を加えない）
    // ============================================================
    guardRoomStarted: false,
    guardRoomDoorOpen: false, // GUARD_ROOM_4の出口ドア開放状態
    guardRoomExited: false,
    guardExitUnlocked: false,

    guardScheduleDigits: [0, 0, 0],
    guardScheduleZone: 1,
    guardScheduleSolved: false,
    guardClockViewed: false,
    guardScheduleViewed: false,
    guardLockersViewed: false,
    guardKeyNoteViewed: false,
    guardDrawerOpen: false,

    guardKeyBoardUnlocked: false,
    guardKeyOrder: ['infirmary', 'backdoor', 'archive', 'visitation', 'storage'],
    guardKeyPoolSelected: null,
    guardKeyOrderSolved: false,
    guardCabinetOpen: false,

    guardMonitorFuseInserted: false,
    guardMonitorSequence: [],
    guardMonitorSequenceSolved: false,
    guardMonitorCabinetOpen: false,

    guardSchedulePlateUsed: false,
    guardChannelIndex: -1,
    guardChannelSolved: false,
    guardSpecialMonitorActive: false,

    guardMazePosition: { row: 5, col: 0 },
    guardMazeStarted: false,
    guardMazeTimeLeft: 15,
    guardMazeCleared: false,

    plateCPicked: false,
    capturedToSolitary: false,

    // ============================================================
    // STAGE4「独居房」追加state
    // ============================================================
    solitaryLightOn: false,
    solitaryInsertedPlate: null,
    solitaryBucketTaken: false,
    solitaryBucketHandleTaken: false,
    solitaryRopeTaken: false,
    solitaryHandleInserted: false,
    solitaryRopeSet: false,
    solitaryLockRodRemoved: false,
    solitaryDoorUnlocked: false,
    solitaryPassageOpen: false,
    solitaryCleared: false,
    solitaryWindowClueViewed: false,

    // ============================================================
    // STAGE5「搬入口」追加state
    // ============================================================
    loadingStarted: false,
    shutterSheetViewed: false,
    symbolInput: [],
    symbolSolved: false,
    destinationInput: [],
    destinationSolved: false,
    specialBoxRemoved: false,
    specialBoxOpened: false,
    lightboxPlateAInserted: false,
    maintPlateCInserted: false,
    maintBoxOpened: false,
    maintDirectionInput: [],
    maintDirectionSolved: false,
    dCabinetUnlocked: false,
    dCabinetOpened: false,
    dSliderValues: [1, 1, 1, 1],
    dSliderSolved: false,
    plateDeviceSlots: [null, null, null],
    plateDeviceSolved: false,
    exitPlateAInserted: false,
    exitPlateCInserted: false,
    exitPlateSlots: [null, null],
    exitBoxOpened: false,
    exitKeypadInput: '',
    exitUnlocked: false,
    employeeDoorOpen: false,
    gameCleared: false,
  };
}

let state = createInitialState();

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('save failed', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const initial = createInitialState();
    state = Object.assign(initial, parsed);
    state.items = parsed.items || {};
    state.pickedUp = parsed.pickedUp || {};
    Object.keys(state.items).forEach((id) => { state.pickedUp[id] = true; });
    state.solved = Object.assign(initial.solved, parsed.solved || {});
    state.hintProgress = parsed.hintProgress || {};
    state.memo = Object.assign({}, initial.memo, parsed.memo || {});
    state.audioSettings = Object.assign({}, initial.audioSettings, parsed.audioSettings || {});
    if (!Number.isFinite(state.runStartedAt)) state.runStartedAt = Date.now();
    if (state.clearTimeMs != null && !Number.isFinite(state.clearTimeMs)) state.clearTimeMs = null;
    state.faucetHeights = parsed.faucetHeights || [1, 1, 1, 1];
    state.screenStack = parsed.screenStack || [];
    state.corridorBedCluesSeen = Array.isArray(parsed.corridorBedCluesSeen) ? parsed.corridorBedCluesSeen : [];
    return true;
  } catch (e) {
    console.warn('load failed', e);
    return false;
  }
}

function resetState() {
  const preservedAudioSettings = state && state.audioSettings
    ? Object.assign({}, state.audioSettings)
    : null;
  localStorage.removeItem(SAVE_KEY);
  state = createInitialState();
  if (preservedAudioSettings) {
    state.audioSettings = Object.assign({}, state.audioSettings, preservedAudioSettings);
  }
}
