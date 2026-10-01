// ============================================================
// solitary-data.js — STAGE4「独居房」静的データ定義
// 新仕様：3画面 / バケツ本体で扉保持 / Cでレバー解錠 / LLRLLR
// ============================================================

const SOLITARY_IMG = 'assets/images/solitary/';

Object.assign(ITEMS, {
  bucket: {
    name: '古びたバケツ',
    icon: SOLITARY_IMG + 'items/bucket.png',
    detailImage: SOLITARY_IMG + 'zoom/bucket_detail.webp',
  },
});

Object.assign(HINT_DATA, {
  HINT_SOLITARY_LIGHT: {
    label: '暗い独居房',
    hint1: '右側の壁に、微かに光る差し込み口がある。',
    hint2: 'これまで集めた金属プレートを差し込めそうだ。',
    answer: 'プレートAを差し込むと、差し込んでいる間だけ部屋が明るくなる。',
  },
  HINT_SOLITARY_GAP: {
    label: '隠し扉の隙間',
    hint1: '別のプレートを差すと、壁の下部にある扉が持ち上がる。',
    hint2: '開いている間に、部屋にある物で扉が閉じないよう支えられないだろうか。',
    answer: 'プレートBで扉を半分ほど開け、バケツ本体を扉の下に置く。その後Bを抜くと、バケツで小さな隙間を保持できる。',
  },
  HINT_SOLITARY_LOCK: {
    label: '通路のレバー',
    hint1: 'バケツで扉を支えると、奥にレバーが見える。',
    hint2: 'プレートCを差している間だけレバーのロックが外れる。窓にも何か手掛かりがありそうだ。',
    answer: 'Cを差した状態で、窓の傷「＼＼／＼＼／」をレバー操作に読み替え、左→左→右→左→左→右の順に倒す。',
  },
  HINT_SOLITARY_EXIT: {
    label: '独居房からの脱出',
    hint1: 'レバーの正しい操作で、扉の主ロックは外れている。',
    hint2: '扉を持ち上げる役割のプレートをもう一度使おう。',
    answer: 'Cを抜いてプレートBを差すと、今度は扉が完全に開く。開いた通路から先へ進める。',
  },
});

const SOLITARY_HINT_PRIORITY = [
  'HINT_SOLITARY_LIGHT',
  'HINT_SOLITARY_GAP',
  'HINT_SOLITARY_LOCK',
  'HINT_SOLITARY_EXIT',
];

function solitaryRightBg(s) {
  if (s.solitaryPassageOpen) {
    return SOLITARY_IMG + 'main/solitary_1_right_dark_open.webp';
  }
  // バケツ設置後は、Bが刺さったままでもバケツあり差分を優先する。
  if (s.solitaryBucketBraced) {
    return SOLITARY_IMG + 'main/' + (s.solitaryLightOn
      ? 'solitary_1_right_light_bucket.webp'
      : 'solitary_1_right_dark_bucket.webp');
  }
  if (s.solitaryInsertedPlate === 'B') {
    return SOLITARY_IMG + 'main/solitary_1_right_dark_open.webp';
  }
  if (s.solitaryLightOn) return SOLITARY_IMG + 'main/solitary_1_right_light.webp';
  return SOLITARY_IMG + 'main/solitary_1_right_dark.webp';
}

function solitaryHiddenDoorTarget(s) {
  if (s.solitaryPassageOpen) return 'SOLITARY_HIDDEN_DOOR_OPEN_ZOOM';
  if (s.solitaryInsertedPlate === 'B' && !s.solitaryBucketBraced) return 'SOLITARY_HIDDEN_DOOR_GAP_ZOOM';
  if (s.solitaryBucketBraced) return 'SOLITARY_HIDDEN_DOOR_BUCKET_ZOOM';
  if (s.solitaryLightOn) return 'SOLITARY_HIDDEN_DOOR_CLOSED_ZOOM';
  return null;
}

function solitaryLeverBg(s) {
  if (s.solitaryLeverPosition === 'left') {
    return SOLITARY_IMG + 'zoom/solitary_hidden_door_lever_left_zoom.webp';
  }
  if (s.solitaryLeverPosition === 'right') {
    return SOLITARY_IMG + 'zoom/solitary_hidden_door_lever_right_zoom.webp';
  }
  return SOLITARY_IMG + 'zoom/solitary_hidden_door_lever_center_zoom.webp';
}

Object.assign(SCREENS, {
  SOLITARY_1: {
    type: 'solitary', custom: 'solitary-room',
    bg: (s) => s.solitaryLightOn ? SOLITARY_IMG + 'main/solitary_1_light.webp' : SOLITARY_IMG + 'main/solitary_1_dark.webp',
    hotspots: [
      {
        id: 'solitary_1_right_wall',
        x: 0.813, y: 0.121, w: 0.187, h: 0.654,
        label: '右側を見る',
        action: { type: 'solitaryGoScreen', target: 'SOLITARY_1_RIGHT' },
      },
    ],
  },

  SOLITARY_1_RIGHT: {
    type: 'solitary', custom: 'solitary-room',
    bg: solitaryRightBg,
    hotspots: [
      { id: 'solitary_card_slot', x: 0.206, y: 0.053, w: 0.794, h: 0.434, label: 'プレート差し込み口', action: { type: 'zoom', target: 'SOLITARY_CARD_SLOT_ZOOM' } },
      { id: 'solitary_hidden_door', x: 0.300, y: 0.500, w: 0.590, h: 0.380, label: '壁の下部', action: { type: 'solitaryOpenHiddenDoorZoom' }, visibleIf: (s) => !!solitaryHiddenDoorTarget(s) && !s.solitaryPassageOpen },
      { id: 'solitary_open_passage', x: 0.285, y: 0.430, w: 0.620, h: 0.470, label: '開いた通路', action: { type: 'zoom', target: 'SOLITARY_HIDDEN_DOOR_OPEN_ZOOM' }, visibleIf: (s) => !!s.solitaryPassageOpen },
    ],
  },

  SOLITARY_2: {
    type: 'solitary', custom: 'solitary-room',
    bg: (s) => s.solitaryLightOn ? SOLITARY_IMG + 'main/solitary_2_light.webp' : SOLITARY_IMG + 'main/solitary_2_dark.webp',
    hotspots: [
      {
        id: 'solitary_bucket_take',
        x: 0.635, y: 0.592, w: 0.250, h: 0.190,
        label: '古びたバケツ',
        action: { type: 'solitaryTakeBucket' },
        visibleIf: (s) => s.solitaryLightOn && !s.solitaryBucketTaken,
      },
      {
        id: 'solitary_window',
        x: 0.320, y: 0.115, w: 0.360, h: 0.300,
        label: '鉄格子の窓',
        action: { type: 'zoom', target: 'SOLITARY_WINDOW_ZOOM' },
      },
    ],
  },

  SOLITARY_WINDOW_ZOOM: {
    type: 'zoom', parent: 'SOLITARY_2',
    bg: (s) => s.solitaryLightOn
      ? SOLITARY_IMG + 'zoom/solitary_window_zoom.webp'
      : SOLITARY_IMG + 'zoom/solitary_window_dark_zoom.webp',
    hotspots: [
      {
        id: 'solitary_window_marks',
        x: 0.067, y: 0.145, w: 0.856, h: 0.609,
        label: '窓枠の傷',
        action: { type: 'solitaryWindowClue' },
        visibleIf: (s) => s.solitaryLightOn,
      },
    ],
  },

  SOLITARY_CARD_SLOT_ZOOM: {
    type: 'zoom', parent: 'SOLITARY_1_RIGHT', custom: 'solitary-card-slot',
    bg: SOLITARY_IMG + 'zoom/solitary_card_slot_zoom.webp',
    hotspots: [
      { id: 'solitary_card_slot_insert', x: 0.206, y: 0.053, w: 0.794, h: 0.434, label: 'プレート差し込み口', action: { type: 'solitaryCardSlot' }, visibleIf: (s) => !s.solitaryInsertedPlate },
      { id: 'solitary_card_slot_remove', x: 0.240, y: 0.200, w: 0.520, h: 0.520, label: '差し込まれたプレート', action: { type: 'solitaryCardSlot' }, visibleIf: (s) => !!s.solitaryInsertedPlate },
    ],
  },

  SOLITARY_HIDDEN_DOOR_CLOSED_ZOOM: {
    type: 'zoom', parent: 'SOLITARY_1_RIGHT',
    bg: SOLITARY_IMG + 'zoom/solitary_hidden_door_closed_zoom.webp',
    hotspots: [
      { id: 'solitary_hidden_door_seam', x: 0.100, y: 0.200, w: 0.800, h: 0.650, label: '不自然な継ぎ目', action: { type: 'solitaryMessage', text: '壁の一部に、不自然な継ぎ目がある。' } },
    ],
  },

  SOLITARY_HIDDEN_DOOR_GAP_ZOOM: {
    type: 'zoom', parent: 'SOLITARY_1_RIGHT', custom: 'solitary-hidden-door',
    bg: SOLITARY_IMG + 'zoom/solitary_hidden_door_gap_zoom.webp',
    hotspots: [
      { id: 'solitary_hidden_door_gap', x: 0.113, y: 0.209, w: 0.472, h: 0.483, label: '半開きの扉', action: { type: 'solitaryGapAction' } },
      // B挿入中でも右側のレバー自体は確認できる。C未挿入なら操作はロックされる。
      { id: 'solitary_hidden_door_gap_lever', x: 0.588, y: 0.410, w: 0.272, h: 0.270, label: 'レバー', action: { type: 'solitaryOpenLeverZoom' } },
    ],
  },

  SOLITARY_HIDDEN_DOOR_BUCKET_ZOOM: {
    type: 'zoom', parent: 'SOLITARY_1_RIGHT', custom: 'solitary-hidden-door',
    bg: SOLITARY_IMG + 'zoom/solitary_hidden_door_bucket_zoom.webp',
    hotspots: [
      { id: 'solitary_hidden_door_bucket', x: 0.126, y: 0.248, w: 0.465, h: 0.395, label: '扉を支えるバケツ', action: { type: 'solitaryMessage', text: 'バケツが扉を支えている。' } },
      { id: 'solitary_hidden_door_lever', x: 0.622, y: 0.419, w: 0.223, h: 0.218, label: '通路のレバー', action: { type: 'solitaryOpenLeverZoom' } },
    ],
  },

  SOLITARY_HIDDEN_DOOR_LEVER_ZOOM: {
    type: 'zoom', parent: 'SOLITARY_HIDDEN_DOOR_BUCKET_ZOOM', custom: 'solitary-lever',
    bg: solitaryLeverBg,
    hotspots: [
      { id: 'solitary_lever_left', x: 0.030, y: 0.180, w: 0.450, h: 0.700, label: 'レバーを左へ倒す', action: { type: 'solitaryLeverMove', direction: 'L' } },
      { id: 'solitary_lever_right', x: 0.520, y: 0.180, w: 0.450, h: 0.700, label: 'レバーを右へ倒す', action: { type: 'solitaryLeverMove', direction: 'R' } },
    ],
  },

  SOLITARY_HIDDEN_DOOR_OPEN_ZOOM: {
    type: 'zoom', parent: 'SOLITARY_1_RIGHT',
    bg: SOLITARY_IMG + 'zoom/solitary_hidden_door_open_zoom.webp',
    hotspots: [
      { id: 'solitary_enter_passage', x: 0.130, y: 0.180, w: 0.740, h: 0.720, label: '奥の通路へ進む', action: { type: 'solitaryEnterPassage' } },
    ],
  },

});;
