// ============================================================
// guard-room-data.js — STAGE3「看守室」静的データ定義
// STAGE1/2の既存ファイルは一切変更しない。既存の ITEMS / PUZZLES /
// HINT_DATA / SCREENS へ Object.assign で追加するだけに留める。
// ============================================================

const GUARD_IMG = 'assets/images/guard_room/';

// ------------------------------------------------------------
// アイテム追加
// ------------------------------------------------------------
Object.assign(ITEMS, {
  key_board_key: { name: '鍵管理盤の小鍵', icon: GUARD_IMG + 'items/small_key.png' },
  monitor_fuse: { name: 'モニターのヒューズ', icon: GUARD_IMG + 'items/fuse.png' },
  perforated_plate: { name: '穴あきプレート', icon: GUARD_IMG + 'items/schedule_plate.png' },
  plate_c: { name: 'プレートC', icon: GUARD_IMG + 'items/plate_c.png' },
});
// プレートA/B/Cは看守室では使用・合成しない（COMBOSへの追加なし。後半へ保持）。

// ------------------------------------------------------------
// 鍵管理盤の5本の鍵（謎②）
// ------------------------------------------------------------
const GUARD_KEY_DEFS = [
  { id: 'archive', label: '資料室', image: GUARD_IMG + 'overlay/key_archive.png' },
  { id: 'infirmary', label: '医務室', image: GUARD_IMG + 'overlay/key_infirmary.png' },
  { id: 'storage', label: '倉庫', image: GUARD_IMG + 'overlay/key_storage.png' },
  { id: 'backdoor', label: '裏口', image: GUARD_IMG + 'overlay/key_back_door.png' },
  { id: 'visitation', label: '面会室', image: GUARD_IMG + 'overlay/key_visiting_room.png' },
];
// 鍵立てに並ぶ初期順（正解と一致しないよう意図的に混ぜてある）
const GUARD_KEY_INITIAL_ORDER = ['infirmary', 'backdoor', 'archive', 'visitation', 'storage'];

// ------------------------------------------------------------
// 迷路（謎⑤）：6×6、行0=上段/列0=左端。 S=(5,0) → G=(0,5)。
// horizontalOpen[row][c] = 列c と 列c+1 の間が通行可能か（各行5要素）
// verticalOpen[r][col]   = 行r と 行r+1 の間が通行可能か（各境界6要素）
// ------------------------------------------------------------
const GUARD_MAZE_ADJACENCY = {
  horizontalOpen: [
    [true, true, true, false, true],
    [false, true, false, true, false],
    [false, true, false, true, false],
    [false, false, true, false, true],
    [true, false, false, true, true],
    [false, true, true, false, true],
  ],
  verticalOpen: [
    [true, true, false, true, true, true],
    [true, false, true, false, false, true],
    [true, true, false, true, true, true],
    [false, true, true, false, false, false],
    [true, false, true, true, false, true],
  ],
};
const GUARD_MAZE_START = { row: 5, col: 0 };
const GUARD_MAZE_GOAL = { row: 0, col: 5 };
const GUARD_MAZE_TIME_LIMIT = 15;

// ------------------------------------------------------------
// 謎の正解追加
// ------------------------------------------------------------
Object.assign(PUZZLES, {
  guardScheduleDigits: [7, 5, 1],
  guardScheduleZone: 4,
  guardKeyOrder: ['archive', 'infirmary', 'storage', 'backdoor', 'visitation'],
  guardMonitorSequence: ['C', 'A', 'B', 'D'],
  guardChannelAnswer: '3294',
  guardChannelCandidates: ['1589', '2269', '3294', '4418', '4981', '6525', '8996', '4785', '2457', '6852'],
});

// ------------------------------------------------------------
// ヒント追加
// ------------------------------------------------------------
Object.assign(HINT_DATA, {
  HINT_GUARD_SCHEDULE: {
    label: '時計と勤務表',
    hint1: '壁のアナログ時計が指している時刻を確認しよう。',
    hint2: '勤務表でその時刻に巡回している看守を探し、ロッカーの番号と組み合わせよう。',
    answer: '時計は11:25。勤務表では看守C・巡回区域④に当たる。ロッカーCの番号751と合わせて「751④」と入力する。',
  },
  HINT_GUARD_KEYS: {
    label: '鍵の並び順',
    hint1: '鍵の配置メモに、鍵同士の位置関係についてのヒントが書かれている。',
    hint2: '「資料室は医務室より先」「資料室と倉庫の間はひとつ空ける」「裏口の直後が面会室」を組み合わせて並べよう。',
    answer: '資料室→医務室→倉庫→裏口→面会室の順にフックへかける。',
  },
  HINT_GUARD_MONITOR: {
    label: '監視モニターの順番',
    hint1: '監視モニターは真っ暗だ。右側にはヒューズの差込口がある。鍵管理盤の隠し収納で電源を入れる物を探そう。',
    hint2: 'ヒューズを差し込むと4台のモニターに映像が出る。同じ看守が現れる順番をよく見よう。',
    answer: 'ヒューズを差し込み、同じ看守が現れる順番を追う。C→A→B→Dの順にボタンを押す。',
  },
  HINT_GUARD_PLATE: {
    label: '穴あきプレートとチャンネル',
    hint1: '穴あきプレートを勤務表に重ねてみよう。',
    hint2: '穴から見える数字を左から読み、チャンネルをその数字に合わせて決定しよう。',
    answer: '穴から見える数字は3294。チャンネルを3294に合わせて決定する。',
  },
  HINT_GUARD_MAZE: {
    label: '特別モニターの迷路',
    hint1: 'チャンネル3294に合わせると、モニターが特別な映像に切り替わる。触れてみよう。',
    hint2: '制限時間は15秒。最初の方向入力でタイマーが動き出す。壁にぶつかっても進めない。',
    answer: '左下からスタートし、↑→↑↑→↑←↑→→↓→↑→の順（14手）でゴール（右上）へ到達する。',
  },
});

const GUARD_HINT_PRIORITY = ['HINT_GUARD_SCHEDULE', 'HINT_GUARD_KEYS', 'HINT_GUARD_MONITOR', 'HINT_GUARD_PLATE', 'HINT_GUARD_MAZE'];

// ------------------------------------------------------------
// 画面定義追加
// ------------------------------------------------------------
Object.assign(SCREENS, {

  // ---------------- 看守室 4壁（左右回転式。WALL_ORDER/moveWall()は使わない） ----------------
  GUARD_ROOM_1: {
    type: 'guardroom',
    // 入室直後に正面へ見える壁。入口/出口ドアは置かない。
    bg: GUARD_IMG + 'walls/guard_room_1.webp',
    hotspots: [
      { id: 'clock', x: 0.138, y: 0.119, w: 0.279, h: 0.220, label: 'アナログ時計', action: { type: 'zoom', target: 'Z_GUARD_CLOCK' } },
      { id: 'schedule', x: 0.473, y: 0.256, w: 0.480, h: 0.301, label: '勤務表', action: { type: 'zoom', target: 'Z_GUARD_SCHEDULE' } },
    ],
  },
  GUARD_ROOM_2: {
    type: 'guardroom',
    bg: (s) => s.guardDrawerOpen ? GUARD_IMG + 'walls/guard_room_2_drawer_open.webp' : GUARD_IMG + 'walls/guard_room_2.webp',
    hotspots: [
      { id: 'drawer', x: 0.715, y: 0.570, w: 0.285, h: 0.289, label: 'ロック付き引き出し', action: { type: 'zoom', target: 'Z_GUARD_DRAWER' } },
      { id: 'phone', x: 0.187, y: 0.452, w: 0.174, h: 0.135, label: '電話', action: { type: 'message', text: '電話だ。誰も出ないだろう。' } },
      { id: 'papers', x: 0.368, y: 0.473, w: 0.345, h: 0.099, label: '書類', action: { type: 'message', text: '書類だ。特に重要な情報はなさそうだ。' } },
    ],
  },
  GUARD_ROOM_3: {
    type: 'guardroom',
    bg: (s) => s.guardSpecialMonitorActive ? GUARD_IMG + 'walls/guard_room_3_special.webp' : (s.guardMonitorFuseInserted ? GUARD_IMG + 'walls/guard_room_3_fuse_on.webp' : GUARD_IMG + 'walls/guard_room_3.webp'),
    hotspots: [
      // STAGE2廊下から入ってきた入口ドア。脱出用には使わない。
      { id: 'entrance_door', x: 0.001, y: 0.180, w: 0.450, h: 0.670, label: '入ってきたドア', action: { type: 'message', text: '廊下から入ってきたドアだ。今は戻れない。' } },
      { id: 'monitors', x: 0.539, y: 0.190, w: 0.461, h: 0.419, label: '監視モニター一式', action: { type: 'zoom', target: 'Z_GUARD_MONITORS' } },
    ],
  },
  GUARD_ROOM_4: {
    type: 'guardroom', custom: 'guardwall4',
    // 迷路クリア後に進む出口ドアはこちらの壁に配置する。
    bg: (s) => s.guardRoomDoorOpen ? GUARD_IMG + 'walls/guard_room_4_exit_open.webp' : (s.guardKeyBoardUnlocked ? GUARD_IMG + 'walls/guard_room_4_board_open.webp' : GUARD_IMG + 'walls/guard_room_4.webp'),
    hotspots: [
      { id: 'exit_door', x: 0.035, y: 0.164, w: 0.421, h: 0.651, label: '看守室の出口', action: { type: 'guardRoomExitDoorAction' } },
      { id: 'lockers', x: 0.458, y: 0.355, w: 0.542, h: 0.457, label: '看守A〜Eのロッカー', action: { type: 'zoom', target: 'Z_GUARD_LOCKERS' } },
      { id: 'keypanel', x: 0.507, y: 0.170, w: 0.423, h: 0.180, label: '鍵管理盤', action: { type: 'openKeyManagement' } },
      // EXIT解錠後の緑ランプ表示位置。デバッグhotspotでドラッグ調整できる。
      { id: 'exit_green_lamp_area', x: 0.432, y: 0.450, w: 0.030, h: 0.023, label: 'EXIT緑ランプ位置', action: { type: 'none' }, visibleIf: (s) => s.guardExitUnlocked && !s.guardRoomDoorOpen },
    ],
  },

  // ---------------- ズーム：時計・勤務表・ロッカー（情報系） ----------------
  Z_GUARD_CLOCK: {
    type: 'zoom', parent: 'GUARD_ROOM_1',
    bg: GUARD_IMG + 'zoom/clock_zoom.webp',
    hotspots: [],
  },
  Z_GUARD_SCHEDULE: {
    type: 'zoom', parent: 'GUARD_ROOM_1',
    bg: (s) => s.guardSchedulePlateUsed ? GUARD_IMG + 'zoom/schedule_plate_overlay.webp' : GUARD_IMG + 'zoom/schedule_zoom.webp',
    hotspots: [
      { id: 'surface', x: 0.006, y: 0.123, w: 0.994, h: 0.772, label: '勤務表', action: { type: 'useSchedulePlate' } },
    ],
  },
  Z_GUARD_LOCKERS: {
    type: 'zoom', parent: 'GUARD_ROOM_4',
    bg: GUARD_IMG + 'zoom/locker_zoom.webp',
    hotspots: [],
  },

  // ---------------- ズーム：ロック付き引き出し（謎①入力） ----------------
  Z_GUARD_DRAWER: {
    type: 'zoom', parent: 'GUARD_ROOM_2', custom: 'schedulelock',
    bg: (s) => s.guardDrawerOpen ? GUARD_IMG + 'zoom/drawer_open_zoom.webp' : GUARD_IMG + 'zoom/drawer_lock_zoom.webp',
    hotspots: [
      { id: 'digit0', x: 0.111, y: 0.374, w: 0.144, h: 0.132, label: '1桁目', action: { type: 'cycleScheduleDigit', index: 0 }, visibleIf: (s) => !s.guardDrawerOpen },
      { id: 'digit1', x: 0.277, y: 0.374, w: 0.144, h: 0.132, label: '2桁目', action: { type: 'cycleScheduleDigit', index: 1 }, visibleIf: (s) => !s.guardDrawerOpen },
      { id: 'digit2', x: 0.444, y: 0.374, w: 0.144, h: 0.132, label: '3桁目', action: { type: 'cycleScheduleDigit', index: 2 }, visibleIf: (s) => !s.guardDrawerOpen },
      { id: 'zone', x: 0.598, y: 0.374, w: 0.144, h: 0.132, label: '巡回区域', action: { type: 'cycleScheduleZone' }, visibleIf: (s) => !s.guardDrawerOpen },
      { id: 'submit', x: 0.759, y: 0.383, w: 0.169, h: 0.113, label: '決定', action: { type: 'submitScheduleCode' }, visibleIf: (s) => !s.guardDrawerOpen },
      { id: 'key_spot', x: 0.228, y: 0.265, w: 0.208, h: 0.201, label: '小鍵', action: { type: 'takeGuardDrawerKey' }, itemImage: 'key_board_key', visibleIf: (s) => s.guardDrawerOpen && !s.pickedUp.key_board_key },
      { id: 'note_spot', x: 0.468, y: 0.272, w: 0.362, h: 0.196, label: '配置メモ', action: { type: 'zoom', target: 'Z_GUARD_KEY_NOTE' }, visibleIf: (s) => s.guardDrawerOpen },
    ],
  },

  // ---------------- ズーム：鍵配置メモ（読むだけ。インベントリには入れない） ----------------
  Z_GUARD_KEY_NOTE: {
    type: 'zoom', parent: 'Z_GUARD_DRAWER',
    bg: GUARD_IMG + 'zoom/key_note_zoom.webp',
    hotspots: [],
  },

  // ---------------- ズーム：鍵管理盤（謎②） ----------------
  Z_GUARD_KEYPANEL: {
    type: 'zoom', parent: 'GUARD_ROOM_4', custom: 'keypanel',
    bg: (s) => s.guardCabinetOpen ? GUARD_IMG + 'zoom/key_board_open_zoom.webp' : GUARD_IMG + 'zoom/key_board_zoom.webp',
    hotspots: [
      { id: 'key0', x: 0.115, y: 0.32, w: 0.16, h: 0.28, label: '鍵1', action: { type: 'selectGuardKey', slot: 0 }, visibleIf: (s) => s.guardKeyBoardUnlocked && !s.guardKeyOrderSolved },
      { id: 'key1', x: 0.27, y: 0.32, w: 0.16, h: 0.28, label: '鍵2', action: { type: 'selectGuardKey', slot: 1 }, visibleIf: (s) => s.guardKeyBoardUnlocked && !s.guardKeyOrderSolved },
      { id: 'key2', x: 0.425, y: 0.32, w: 0.16, h: 0.28, label: '鍵3', action: { type: 'selectGuardKey', slot: 2 }, visibleIf: (s) => s.guardKeyBoardUnlocked && !s.guardKeyOrderSolved },
      { id: 'key3', x: 0.57, y: 0.32, w: 0.16, h: 0.28, label: '鍵4', action: { type: 'selectGuardKey', slot: 3 }, visibleIf: (s) => s.guardKeyBoardUnlocked && !s.guardKeyOrderSolved },
      { id: 'key4', x: 0.72, y: 0.32, w: 0.16, h: 0.28, label: '鍵5', action: { type: 'selectGuardKey', slot: 4 }, visibleIf: (s) => s.guardKeyBoardUnlocked && !s.guardKeyOrderSolved },
      { id: 'cabinet', x: 0.286, y: 0.650, w: 0.414, h: 0.153, label: '隠し収納', action: { type: 'takeItem', item: 'monitor_fuse' }, itemImage: 'monitor_fuse', visibleIf: (s) => s.guardCabinetOpen && !s.pickedUp.monitor_fuse },
    ],
  },

  // ---------------- ズーム：監視モニター一式（謎③・チャンネル・迷路入口） ----------------
  Z_GUARD_MONITORS: {
    type: 'zoom', parent: 'GUARD_ROOM_3', custom: 'monitors',
    bg: (s) => s.guardSpecialMonitorActive ? GUARD_IMG + 'zoom/monitor_special_zoom.webp' : (s.guardMonitorFuseInserted ? GUARD_IMG + 'zoom/monitor_panel_fuse_on_zoom.webp' : GUARD_IMG + 'zoom/monitor_panel_zoom.webp'),
    hotspots: [
      { id: 'fuse_slot', x: 0.847, y: 0.376, w: 0.137, h: 0.223, label: 'ヒューズ差込口', action: { type: 'insertMonitorFuse' }, visibleIf: (s) => !s.guardMonitorFuseInserted },
      { id: 'monitor_dark_area', x: 0.073, y: 0.105, w: 0.745, h: 0.455, label: '消えている監視モニター', action: { type: 'message', text: 'モニターは真っ暗だ。電源が来ていないようだ。' }, visibleIf: (s) => !s.guardMonitorFuseInserted },
      { id: 'abcd_panel', x: 0.045, y: 0.615, w: 0.455, h: 0.180, label: 'A B C D 操作盤', action: { type: 'zoom', target: 'Z_GUARD_MONITOR_BUTTONS' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardMonitorSequenceSolved && !s.guardSpecialMonitorActive },
      // 4台の監視映像オーバーレイ表示領域。デバッグhotspotで位置・大きさを調整可能。
      { id: 'monitor_display_a', x: 0.104, y: 0.140, w: 0.330, h: 0.174, label: 'モニターA映像位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'monitor_display_b', x: 0.468, y: 0.140, w: 0.330, h: 0.174, label: 'モニターB映像位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'monitor_display_c', x: 0.104, y: 0.358, w: 0.330, h: 0.174, label: 'モニターC映像位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'monitor_display_d', x: 0.468, y: 0.358, w: 0.330, h: 0.174, label: 'モニターD映像位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      // モニター上に重ねる A/B/C/D ラベルの表示位置。こちらもdebug hotspotで位置調整可能。
      { id: 'monitor_label_a', x: 0.104, y: 0.140, w: 0.052, h: 0.032, label: 'モニターAラベル位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'monitor_label_b', x: 0.468, y: 0.140, w: 0.052, h: 0.032, label: 'モニターBラベル位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'monitor_label_c', x: 0.104, y: 0.365, w: 0.052, h: 0.032, label: 'モニターCラベル位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'monitor_label_d', x: 0.468, y: 0.365, w: 0.052, h: 0.032, label: 'モニターDラベル位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'open_maze', x: 0.055, y: 0.055, w: 0.89, h: 0.56, label: '迷路を開く', action: { type: 'zoom', target: 'Z_GUARD_MAZE' }, visibleIf: (s) => s.guardSpecialMonitorActive },
      { id: 'cabinet', x: 0.556, y: 0.815, w: 0.335, h: 0.185, label: '隠し収納', action: { type: 'takeItem', item: 'perforated_plate' }, itemImage: 'perforated_plate', visibleIf: (s) => s.guardMonitorCabinetOpen && !s.pickedUp.perforated_plate && !s.guardSpecialMonitorActive },
      // チャンネル数字表示位置。デバッグhotspotをドラッグして調整できる。
      { id: 'channel_display_area', x: 0.595, y: 0.64, w: 0.245, h: 0.072, label: 'チャンネル表示位置', action: { type: 'none' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'channel_switch', x: 0.567, y: 0.708, w: 0.165, h: 0.100, label: 'チャンネル切替', action: { type: 'cycleChannel' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
      { id: 'channel_decide', x: 0.730, y: 0.705, w: 0.154, h: 0.107, label: '決定', action: { type: 'submitChannel' }, visibleIf: (s) => s.guardMonitorFuseInserted && !s.guardSpecialMonitorActive },
    ],
  },

  // ---------------- ズーム：A/B/C/D入力操作盤（画像は後から差し替え） ----------------
  Z_GUARD_MONITOR_BUTTONS: {
    type: 'zoom', parent: 'Z_GUARD_MONITORS', custom: 'monitorbuttons',
    bg: GUARD_IMG + 'zoom/monitor_abcd_zoom.webp',
    hotspots: [
      { id: 'btnA', x: 0.100, y: 0.400, w: 0.180, h: 0.150, label: 'A', action: { type: 'monitorButton', letter: 'A' }, visibleIf: (s) => !s.guardMonitorSequenceSolved },
      { id: 'btnB', x: 0.300, y: 0.400, w: 0.180, h: 0.150, label: 'B', action: { type: 'monitorButton', letter: 'B' }, visibleIf: (s) => !s.guardMonitorSequenceSolved },
      { id: 'btnC', x: 0.500, y: 0.400, w: 0.180, h: 0.150, label: 'C', action: { type: 'monitorButton', letter: 'C' }, visibleIf: (s) => !s.guardMonitorSequenceSolved },
      { id: 'btnD', x: 0.700, y: 0.400, w: 0.180, h: 0.150, label: 'D', action: { type: 'monitorButton', letter: 'D' }, visibleIf: (s) => !s.guardMonitorSequenceSolved },
    ],
  },

  // ---------------- ズーム：特別モニター迷路（謎⑤） ----------------
  Z_GUARD_MAZE: {
    type: 'zoom', parent: 'Z_GUARD_MONITORS', custom: 'maze',
    bg: GUARD_IMG + 'zoom/maze_zoom.webp',
    hotspots: [
      { id: 'maze_up', x: 0.095, y: 0.677, w: 0.182, h: 0.128, label: '↑', action: { type: 'mazeMove', dir: 'up' } },
      { id: 'maze_left', x: 0.521, y: 0.693, w: 0.170, h: 0.114, label: '←', action: { type: 'mazeMove', dir: 'left' } },
      { id: 'maze_down', x: 0.312, y: 0.690, w: 0.165, h: 0.119, label: '↓', action: { type: 'mazeMove', dir: 'down' } },
      { id: 'maze_right', x: 0.723, y: 0.680, w: 0.186, h: 0.125, label: '→', action: { type: 'mazeMove', dir: 'right' } },
      { id: 'maze_reset', x: 0.121, y: 0.828, w: 0.289, h: 0.102, label: 'RESET', action: { type: 'mazeReset' } },
    ],
  },

  // ---------------- 看守室脱出後 ----------------
  POST_GUARD_CORRIDOR: {
    type: 'guardroom',
    bg: GUARD_IMG + 'walls/post_guard_corridor.webp',
    hotspots: [
      { id: 'plate_c_spot', x: 0.36, y: 0.68, w: 0.28, h: 0.18, label: 'プレートC', action: { type: 'pickupPlateC' }, itemImage: 'plate_c', visibleIf: (s) => !s.plateCPicked },
    ],
  },
  SOLITARY_1: {
    // STAGE4未実装のため仮の遷移画面（仕様20：SOLITARY_1は仮画面でよい）
    type: 'guardroom',
    bg: GUARD_IMG + 'ui/solitary_placeholder.webp',
    hotspots: [],
  },
});
