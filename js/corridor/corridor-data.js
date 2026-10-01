// ============================================================
// corridor-data.js — STAGE2「廊下」静的データ定義
// STAGE1の js/data.js は一切変更しない。既存の ITEMS / PUZZLES /
// HINT_DATA / SCREENS へ Object.assign で追加するだけに留める。
// ============================================================

const CORRIDOR_IMG = 'assets/images/corridor/';

// ------------------------------------------------------------
// アイテム追加
// ------------------------------------------------------------
Object.assign(ITEMS, {
  plate_b: {
    name: 'プレートB',
    icon: CORRIDOR_IMG + 'items/plate_b.png',
  },
});
// プレートA/Bは廊下では使用・合成しない（COMBOSへの追加なし。後半へ保持）。

// ------------------------------------------------------------
// 謎の正解追加
// ------------------------------------------------------------
Object.assign(PUZZLES, {
  corridorBedInput: [
    'down', 'down',
    'down', 'blank',
    'up', 'down',
  ],
  corridorPowerCode: '665',
  guardDoorCode: '4928',
  serialNumber: 'HTS-117',
  serialLetterMap: {
    A: 4, H: 7, K: 1, M: 5, S: 2, T: 8, Y: 9,
  },
});

// ------------------------------------------------------------
// ヒント追加
// ------------------------------------------------------------
Object.assign(HINT_DATA, {
  HINT_CORRIDOR_BED: {
    label: 'ベッドの向きと金属ボックス',
    hint1: '左右の牢屋をよく見てみよう。部屋ごとに違いがある。',
    hint2: 'ベッドの枕の位置と、金属ボックス横の上向き矢印を対応させて考えよう。',
    answer: '看守室に近い2部屋を上段、中央の2部屋を中段、入口に近い2部屋を下段として入力する。正解は「↓↓／↓空欄／↑↓」。',
  },
  HINT_CORRIDOR_POWER: {
    label: '製造番号と対応表',
    hint1: 'ボックス内のアルファベットと数字の対応表を、どこかで見た文字列に使えそうだ。',
    hint2: '看守室横の電光掲示板の右下に、小さな製造番号が書かれている。',
    answer: 'HTS-117のHTSを対応表で変換すると782。782-117=665。',
  },
  HINT_GUARD_BOARD: {
    label: '電光掲示板の故障',
    hint1: '電光掲示板は正常に表示されていないようだ。壊れている場所に注目しよう。',
    hint2: '右上の縦棒だけが点灯しないとすると、本来どの数字だったか考えよう。テンキーの壊れた5と6も手掛かりになる。',
    answer: '本来の表示は4928。看守室テンキーに4928を入力する。',
  },
});

const CORRIDOR_HINT_PRIORITY = ['HINT_CORRIDOR_BED', 'HINT_CORRIDOR_POWER', 'HINT_GUARD_BOARD'];

// ------------------------------------------------------------
// 画面定義追加
// ------------------------------------------------------------
Object.assign(SCREENS, {

  // ---------------- 廊下1 ----------------
  CORRIDOR_1: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_1.webp',
    hotspots: [
    ],
  },
  CORRIDOR_1_LEFT: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_1_left.webp',
    hotspots: [
      { id: 'cell', x: 0.207, y: 0.087, w: 0.591, h: 0.711, label: '牢屋1', action: { type: 'message', text: 'ベッドが置いてある。' } },
    ],
  },
  CORRIDOR_1_RIGHT: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_1_right.webp',
    hotspots: [
      { id: 'cell', x: 0.211, y: 0.093, w: 0.577, h: 0.696, label: '牢屋2', action: { type: 'message', text: 'ベッドが置いてある。' } },
    ],
  },

  // ---------------- 廊下2 ----------------
  CORRIDOR_2: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_2.webp',
    hotspots: [
    ],
  },
  CORRIDOR_2_LEFT: {
    type: 'corridor',
    bg: (s) => s.corridorBedBoxOpen ? CORRIDOR_IMG + 'walls/corridor_2_left_box_open.webp' : CORRIDOR_IMG + 'walls/corridor_2_left.webp',
    hotspots: [
      { id: 'cell', x: 0.077, y: 0.116, w: 0.582, h: 0.669, label: '牢屋3', action: { type: 'message', text: 'ベッドが置いてある。' } },
      { id: 'bedbox', x: 0.716, y: 0.333, w: 0.254, h: 0.235, label: '金属製ボックス', action: { type: 'openBedBox' } },
    ],
  },
  CORRIDOR_2_RIGHT: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_2_right.webp',
    hotspots: [
      { id: 'cell', x: 0.309, y: 0.116, w: 0.620, h: 0.674, label: '牢屋4', action: { type: 'message', text: 'この牢屋にはベッドがない。' } },
    ],
  },

  // ---------------- 廊下3 ----------------
  CORRIDOR_3: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_3.webp',
    hotspots: [
    ],
  },
  CORRIDOR_3_LEFT: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_3_left.webp',
    hotspots: [
      { id: 'cell', x: 0.307, y: 0.109, w: 0.604, h: 0.678, label: '牢屋5', action: { type: 'message', text: 'ベッドが置いてある。' } },
    ],
  },
  CORRIDOR_3_RIGHT: {
    type: 'corridor',
    bg: CORRIDOR_IMG + 'walls/corridor_3_right.webp',
    hotspots: [
      { id: 'cell', x: 0.234, y: 0.111, w: 0.573, h: 0.654, label: '牢屋6', action: { type: 'message', text: 'ベッドが置いてある。' } },
    ],
  },

  // ---------------- 看守室前 ----------------
  GUARD_WALL: {
    type: 'corridor',
    bg: (s) => {
      if (s.guardDoorOpen) return CORRIDOR_IMG + 'walls/guard_wall_open.webp';
      if (s.guardRoomPowerOn) return CORRIDOR_IMG + 'walls/guard_wall_on.webp';
      return CORRIDOR_IMG + 'walls/guard_wall_off.webp';
    },
    hotspots: [
      { id: 'board', x: 0.679, y: 0.178, w: 0.295, h: 0.106, label: '電光掲示板', action: { type: 'zoom', target: 'Z_GUARD_BOARD' } },
      { id: 'keypad', x: 0.675, y: 0.304, w: 0.123, h: 0.135, label: 'テンキー', action: { type: 'zoom', target: 'Z_GUARD_KEYPAD' } },
      { id: 'door', x: 0.143, y: 0.106, w: 0.495, h: 0.680, label: '看守室の扉', action: { type: 'guardDoorAction' } },
    ],
  },
  GUARD_ROOM: {
    // STAGE3未実装のため仮の遷移画面（仕様19：GUARD_ROOM未実装の場合は仮遷移画面でも可）
    type: 'corridor',
    bg: CORRIDOR_IMG + 'ui/guard_room_placeholder.webp',
    hotspots: [],
  },

  // 牢屋1〜6は通常画面でベッド配置を確認できるため、正面ズーム画面は廃止。

  // ---------------- ベッド入力ボックス ----------------
  Z_BED_BOX: {
    type: 'zoom', parent: 'CORRIDOR_2_LEFT', custom: 'bedbox',
    bg: CORRIDOR_IMG + 'zoom/bed_box_closed.webp',
    hotspots: [
      { id: 'cell0', x: 0.200, y: 0.265, w: 0.165, h: 0.130, label: '入力欄(廊下3左)', action: { type: 'cycleBedInput', index: 0 } },
      { id: 'cell1', x: 0.405, y: 0.265, w: 0.165, h: 0.130, label: '入力欄(廊下3右)', action: { type: 'cycleBedInput', index: 1 } },
      { id: 'cell2', x: 0.200, y: 0.416, w: 0.165, h: 0.130, label: '入力欄(廊下2左)', action: { type: 'cycleBedInput', index: 2 } },
      { id: 'cell3', x: 0.405, y: 0.416, w: 0.165, h: 0.130, label: '入力欄(廊下2右)', action: { type: 'cycleBedInput', index: 3 } },
      { id: 'cell4', x: 0.200, y: 0.560, w: 0.165, h: 0.130, label: '入力欄(廊下1左)', action: { type: 'cycleBedInput', index: 4 } },
      { id: 'cell5', x: 0.405, y: 0.560, w: 0.165, h: 0.130, label: '入力欄(廊下1右)', action: { type: 'cycleBedInput', index: 5 } },
      { id: 'submit', x: 0.659, y: 0.564, w: 0.152, h: 0.125, label: '決定', action: { type: 'submitBedInput' } },
    ],
  },
  Z_BED_BOX_OPEN: {
    type: 'zoom', parent: 'CORRIDOR_2_LEFT', custom: 'powerbox',
    bg: CORRIDOR_IMG + 'zoom/bed_box_open.webp',
    hotspots: [
      { id: 'plate_spot', x: 0.191, y: 0.58, w: 0.666, h: 0.318, label: 'プレートB', action: { type: 'takeItem', item: 'plate_b' }, itemImage: 'plate_b', visibleIf: (s) => !s.pickedUp.plate_b },
      { id: 'digit0', x: 0.507, y: 0.511, w: 0.095, h: 0.088, label: '1桁目', action: { type: 'cyclePowerDigit', index: 0 } },
      { id: 'digit1', x: 0.610, y: 0.509, w: 0.091, h: 0.092, label: '2桁目', action: { type: 'cyclePowerDigit', index: 1 } },
      { id: 'digit2', x: 0.718, y: 0.509, w: 0.086, h: 0.093, label: '3桁目', action: { type: 'cyclePowerDigit', index: 2 } },
      { id: 'power_submit', x: 0.583, y: 0.609, w: 0.144, h: 0.099, label: '決定', action: { type: 'submitPowerCode' } },
    ],
  },

  // ---------------- 看守室前ズーム ----------------
  Z_GUARD_BOARD: {
    type: 'zoom', parent: 'GUARD_WALL', custom: 'board',
    bg: (s) => s.guardRoomPowerOn ? CORRIDOR_IMG + 'zoom/guard_board_on.webp' : CORRIDOR_IMG + 'zoom/guard_board_off.webp',
    hotspots: [
      { id: 'display', x: 0.105, y: 0.281, w: 0.791, h: 0.211, label: '表示部', action: { type: 'guardBoardInspect' } },
      { id: 'serial_zoom', x: 0.682, y: 0.513, w: 0.259, h: 0.108, label: '製造番号', action: { type: 'zoom', target: 'Z_GUARD_SERIAL' }, visibleIf: (s) => !s.guardRoomPowerOn },
    ],
  },
  Z_GUARD_SERIAL: {
    type: 'zoom', parent: 'GUARD_WALL',
    bg: CORRIDOR_IMG + 'zoom/guard_serial_zoom.webp',
    hotspots: [],
  },
  Z_GUARD_KEYPAD: {
    type: 'zoom', parent: 'GUARD_WALL', custom: 'keypad',
    bg: CORRIDOR_IMG + 'zoom/guard_keypad.webp',
    hotspots: [
      { id: 'k1', x: 0.268, y: 0.341, w: 0.145, h: 0.105, label: '1', action: { type: 'guardKeypadDigit', digit: 1 } },
      { id: 'k2', x: 0.430, y: 0.347, w: 0.148, h: 0.103, label: '2', action: { type: 'guardKeypadDigit', digit: 2 } },
      { id: 'k3', x: 0.598, y: 0.344, w: 0.136, h: 0.103, label: '3', action: { type: 'guardKeypadDigit', digit: 3 } },
      { id: 'k4', x: 0.261, y: 0.457, w: 0.145, h: 0.119, label: '4', action: { type: 'guardKeypadDigit', digit: 4 } },
      { id: 'k5', x: 0.430, y: 0.458, w: 0.139, h: 0.113, label: '5（故障）', action: { type: 'guardKeypadBroken' } },
      { id: 'k6', x: 0.591, y: 0.460, w: 0.148, h: 0.113, label: '6（故障）', action: { type: 'guardKeypadBroken' } },
      { id: 'k7', x: 0.273, y: 0.580, w: 0.134, h: 0.100, label: '7', action: { type: 'guardKeypadDigit', digit: 7 } },
      { id: 'k8', x: 0.436, y: 0.585, w: 0.134, h: 0.100, label: '8', action: { type: 'guardKeypadDigit', digit: 8 } },
      { id: 'k9', x: 0.605, y: 0.582, w: 0.123, h: 0.101, label: '9', action: { type: 'guardKeypadDigit', digit: 9 } },
      { id: 'kC', x: 0.275, y: 0.696, w: 0.132, h: 0.096, label: 'C', action: { type: 'guardKeypadClear' } },
      { id: 'k0', x: 0.434, y: 0.696, w: 0.136, h: 0.101, label: '0', action: { type: 'guardKeypadDigit', digit: 0 } },
      { id: 'kE', x: 0.598, y: 0.695, w: 0.141, h: 0.100, label: 'E', action: { type: 'guardKeypadEnter' } },
    ],
  },
});
