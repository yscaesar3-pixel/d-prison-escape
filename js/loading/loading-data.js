// ============================================================
// loading-data.js — STAGE5「搬入口」データ定義
// ============================================================

const LOADING_IMG = 'assets/images/loading/';

Object.assign(ITEMS, {
  transparent_sheet: { name: '透明シート', icon: LOADING_IMG + 'items/transparent_sheet.png' },
  special_cardboard_box: { name: '特殊段ボール', icon: LOADING_IMG + 'items/special_cardboard_box.png' },
  inspection_record: { name: '検品記録', icon: LOADING_IMG + 'items/inspection_record_zoom.webp', detailImage: LOADING_IMG + 'items/inspection_record_zoom.webp' },
  management_key: { name: '管理用の鍵', icon: LOADING_IMG + 'items/management_key.png' },
  cutter: { name: 'カッター', icon: LOADING_IMG + 'items/cutter.png' },
  plate_d: { name: 'プレートD', icon: LOADING_IMG + 'items/plate_d.png' },
  folding_step_folded: {
  name: '折り畳み足場',
  icon: LOADING_IMG + 'items/folding_step_folded.png',
  detailImage: LOADING_IMG + 'items/folding_step_folded.png'
},

folding_step_open: {
  name: '開いた足場',
  icon: LOADING_IMG + 'items/folding_step_open.png',
  detailImage: LOADING_IMG + 'items/folding_step_open.png'
},
});

COMBOS.push({ a: 'special_cardboard_box', b: 'cutter', result: 'inspection_record', consumeA: true, consumeB: true });

Object.assign(HINT_DATA, {
  HINT_LOADING_SYMBOL: {
    label: '記号入力装置',
    hint1: '積み重なった段ボールには、5種類の記号がそれぞれ別の位置にある。',
    hint2: '記号入力装置に、記号を高い順に入力してみよう。',
    answer: '○→★→△→□の順で入力する。収納が開き、カッターと透明シートを入手できる。',
  },
  HINT_LOADING_DESTINATION: {
    label: 'シャッターと搬送先',
    hint1: '透明シートは、大型シャッターの図柄に重ねられそうだ。',
    hint2: '重ねて完成したあみだくじを上からたどると、3つの搬送先の順番が分かる。',
    answer: '大型シャッターに透明シートを使い、搬送先入力装置で「牢屋→看守室→警備室」と入力する。',
  },
  HINT_LOADING_SPECIAL_BOX: {
    label: '高所の特殊段ボール',
    hint1: '搬送先入力装置を解くと、収納から折り畳み足場が手に入る。',
    hint2: '足場はインベントリで選択後、もう一度同じアイテムをタップすると展開できる。',
    answer: '足場を展開し、高所にある特殊段ボールに使用する。箱をカッターで開け、検品記録を入手する。',
  },
  HINT_LOADING_MAINT: {
    label: '保守ボックス',
    hint1: '検品記録のH→T→K→Mは、ライトボックスで確認できる情報と関係している。',
    hint2: '保守ボックスはプレートCで開けられ、中では方向を7回入力する。',
    answer: '←→↑→→→↓の順で入力する。管理用の鍵を入手できる。',
  },
  HINT_LOADING_PLATE_D: {
    label: 'Dキャビネット',
    hint1: '管理用の鍵でDキャビネットを開ける。4列の値はタップで1〜5を循環する。',
    hint2: 'FOOD / CLOTH / TOOL / SUPPLY の4列を正しい値に合わせる。',
    answer: '左から3 / 5 / 1 / 2に合わせる。Plate Dを入手できる。',
  },
  HINT_LOADING_PLATES: {
    label: '3プレート装置',
    hint1: '床のDECEPTION / ACCESS / CELLの頭文字に注目する。',
    hint2: '3スロットは左から順に、それぞれ対応するプレートを入れる。',
    answer: '左D・中央A・右Cに配置する。△×★□○が表示される。',
  },
  HINT_LOADING_EXIT: {
    label: 'EMPLOYEE EXIT',
    hint1: '△×★□○を、積み重なった段ボールの5列にある記号の位置へ置き換える。',
    hint2: '△=5、×=3、★=1、□=4、○=2。出口装置はCで開け、Aで通電する。',
    answer: 'Plate Cで箱を開け、Plate Aを差して通電する。表示欄の2桁目「3」は固定なので、残りを5→1→4→2と入力してEを押す。開いたEMPLOYEE EXITから外へ出る。',
  },
});

const LOADING_HINT_PRIORITY = [
  'HINT_LOADING_SYMBOL',
  'HINT_LOADING_DESTINATION',
  'HINT_LOADING_SPECIAL_BOX',
  'HINT_LOADING_MAINT',
  'HINT_LOADING_PLATE_D',
  'HINT_LOADING_PLATES',
  'HINT_LOADING_EXIT',
];

const LOADING_DESTINATION_ANSWER = ['cell', 'guard', 'security'];
const LOADING_SYMBOL_ANSWER = ['circle', 'star', 'triangle', 'square'];
const LOADING_MAINT_ANSWER = ['L', 'R', 'U', 'R', 'R', 'R', 'D'];
const LOADING_SLIDER_ANSWER = [3, 5, 1, 2];
const LOADING_EXIT_CODE = '53142';

function loadingMainBg(id) {
  if (id === 'LOADING_1') return (s) => s.employeeDoorOpen ? LOADING_IMG + 'main/loading_1_open.webp' : LOADING_IMG + 'main/loading_1.webp';
  if (id === 'LOADING_2') return (s) => s.specialBoxRemoved ? LOADING_IMG + 'main/box_grid_special_removed_zoom.webp' : LOADING_IMG + 'main/loading_2.webp';
  return LOADING_IMG + 'main/' + id.toLowerCase() + '.webp';
}

Object.assign(SCREENS, {
  LOADING_1: {
    type: 'loading', custom: 'loading-room', bg: loadingMainBg('LOADING_1'),
    hotspots: [
      { id: 'loading_shutter', x: 0.000, y: 0.055, w: 0.605, h: 0.701, label: '大型シャッター', action: { type: 'zoom', target: 'LOADING_SHUTTER_ZOOM' } },
      { id: 'loading_exit_panel', x: 0.613, y: 0.237, w: 0.387, h: 0.478, label: '出口電子装置', action: { type: 'loadingExitPanel' } },
      { id: 'loading_exit_door', x: 0.66, y: 0.05, w: 0.31, h: 0.78, label: 'EMPLOYEE EXIT', action: { type: 'loadingExitDoor' }, visibleIf: (s) => !!s.employeeDoorOpen },
    ],
  },
  LOADING_2: {
    type: 'loading', custom: 'loading-room', bg: loadingMainBg('LOADING_2'),
    hotspots: [
      { id: 'loading_box_grid_1', x: 0.086, y: 0.171, w: 0.668, h: 0.599, label: '段ボール群1', action: { type: 'loadingMessage', text: '段ボールが積み重なっている。' } },
      { id: 'loading_box_grid_2', x: 0.757, y: 0.294, w: 0.171, h: 0.450, label: '段ボール群2', action: { type: 'loadingMessage', text: '段ボールが積み重なっている。' } },
      { id: 'loading_special_box', x: 0.759, y: 0.142, w: 0.213, h: 0.154, label: '高所の特殊段ボール', action: { type: 'loadingTakeSpecialBox' }, visibleIf: (s) => !s.specialBoxRemoved },
    ],
  },
  LOADING_3: {
    type: 'loading', custom: 'loading-room', bg: loadingMainBg('LOADING_3'),
    hotspots: [
      { id: 'loading_destination', x: 0.003, y: 0.100, w: 0.311, h: 0.317, label: '搬送先入力装置', action: { type: 'zoom', target: 'DESTINATION_PANEL_ZOOM' } },
      { id: 'loading_maint', x: 0.378, y: 0.080, w: 0.406, h: 0.305, label: '保守ボックス', action: { type: 'zoom', target: 'MAINT_BOX_ZOOM' } },
      { id: 'loading_d_cabinet', x: 0.361, y: 0.391, w: 0.462, h: 0.417, label: 'Dキャビネット', action: { type: 'zoom', target: 'D_CABINET_ZOOM' } },
      { id: 'loading_passage', x: 0.006, y: 0.547, w: 0.276, h: 0.203, label: '抜け道', action: { type: 'loadingMessage', text: '独居房から通ってきた抜け道だ。' } },
    ],
  },
  LOADING_4: {
    type: 'loading', custom: 'loading-room', bg: loadingMainBg('LOADING_4'),
    hotspots: [
      { id: 'loading_lightbox', x: 0.016, y: 0.227, w: 0.343, h: 0.320, label: 'ライトボックス', action: { type: 'zoom', target: 'LIGHTBOX_ZOOM' } },
      { id: 'loading_plate_slots', x: 0.473, y: 0.154, w: 0.502, h: 0.173, label: '3プレート装置', action: { type: 'zoom', target: 'PLATE_SLOTS_ZOOM' } },
      { id: 'loading_symbol_display', x: 0.524, y: 0.327, w: 0.313, h: 0.177, label: '記号入力装置', action: { type: 'zoom', target: 'SYMBOL_DISPLAY_ZOOM' } },
    ],
  },

  LOADING_SHUTTER_ZOOM: {
  type: 'zoom',
  parent: 'LOADING_1',
  bg: (s) => s.shutterSheetViewed
    ? LOADING_IMG + 'zoom/loading_shutter_sheet_zoom.webp'
    : LOADING_IMG + 'zoom/loading_shutter_zoom.webp',

  hotspots: [
    {
      id: 'shutter_sheet_use',
      x: 0.08,
      y: 0.09,
      w: 0.84,
      h: 0.82,
      label: 'シャッターの図',
      action: { type: 'loadingUseTransparentSheet' }
    },

    // 搬送先オーバーレイ位置調整用
    // 仮座標。デバッグ機能で後から調整してください。
    {
      id: 'shutter_guard_overlay',
      x: 0.035, y: 0.860, w: 0.250, h: 0.130,
      label: '看守室オーバーレイ',
      action: {
        type: 'loadingMessage',
        text: '看守室'
      }
    },
    {
      id: 'shutter_security_overlay',
      x: 0.555, y: 0.860, w: 0.250, h: 0.130,
      label: '警備室オーバーレイ',
      action: {
        type: 'loadingMessage',
        text: '警備室'
      }
    },
    {
      id: 'shutter_cell_overlay',
      x: 0.770, y: 0.860, w: 0.250, h: 0.130,
      label: '牢屋オーバーレイ',
      action: {
        type: 'loadingMessage',
        text: '牢屋'
      }
    }
  ],
},
  EMPLOYEE_EXIT_PANEL_ZOOM: {
    type: 'zoom', parent: 'LOADING_1', bg: LOADING_IMG + 'zoom/employee_exit_panel_zoom.webp',
    hotspots: [{ id: 'exit_panel_cover', x: 0.12, y: 0.13, w: 0.76, h: 0.74, label: '出口装置のカバー', action: { type: 'loadingExitPlateC' } }],
  },
  EMPLOYEE_EXIT_BOX_ZOOM: {
    type: 'zoom', parent: 'LOADING_1', custom: 'loading-exit-box',
    // 背景は固定する。Plate A通電時の表示はHTMLオーバーレイで描画し、
    // 背景画像差し替えによる画面ブレを防ぐ。
    bg: LOADING_IMG + 'zoom/employee_exit_box_open_off_zoom.webp',
    hotspots: [
      // 左右どちらの挿入口にもPlate A / Cを差し込める。
      // このx / y / w / hを変更すればタップ範囲と描画位置を同時に調整できる。
      { id: 'exit_plate_slot_left',  x: 0.201, y: 0.183, w: 0.261, h: 0.241, label: '左プレート挿入口',  action: { type: 'loadingExitPlateSlot', index: 0 } },
      { id: 'exit_plate_slot_right', x: 0.530, y: 0.200, w: 0.249, h: 0.211, label: '右プレート挿入口', action: { type: 'loadingExitPlateSlot', index: 1 } },

      // EMPLOYEE EXIT テンキー
      // Plate Aで通電している時だけ操作可能。Cはカバーの開閉専用。
      { id: 'exit_key_1', x: 0.357, y: 0.577, w: 0.080, h: 0.048, label: '1', action: { type: 'loadingExitDigit', digit: 1 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_2', x: 0.450, y: 0.577, w: 0.080, h: 0.048, label: '2', action: { type: 'loadingExitDigit', digit: 2 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_3', x: 0.548, y: 0.577, w: 0.080, h: 0.048, label: '3', action: { type: 'loadingExitDigit', digit: 3 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },

      { id: 'exit_key_4', x: 0.357, y: 0.634, w: 0.080, h: 0.048, label: '4', action: { type: 'loadingExitDigit', digit: 4 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_5', x: 0.450, y: 0.634, w: 0.080, h: 0.050, label: '5', action: { type: 'loadingExitDigit', digit: 5 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_6', x: 0.548, y: 0.634, w: 0.080, h: 0.048, label: '6', action: { type: 'loadingExitDigit', digit: 6 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },

      { id: 'exit_key_7', x: 0.357, y: 0.690, w: 0.080, h: 0.048, label: '7', action: { type: 'loadingExitDigit', digit: 7 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_8', x: 0.450, y: 0.690, w: 0.080, h: 0.048, label: '8', action: { type: 'loadingExitDigit', digit: 8 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_9', x: 0.548, y: 0.690, w: 0.080, h: 0.048, label: '9', action: { type: 'loadingExitDigit', digit: 9 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },

      { id: 'exit_key_c', x: 0.357, y: 0.745, w: 0.080, h: 0.050, label: 'C', action: { type: 'loadingExitClear' }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_0', x: 0.450, y: 0.745, w: 0.080, h: 0.047, label: '0', action: { type: 'loadingExitDigit', digit: 0 }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },
      { id: 'exit_key_e', x: 0.548, y: 0.745, w: 0.080, h: 0.049, label: 'E', action: { type: 'loadingExitEnter' }, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') && !s.exitUnlocked },

      // 入力表示位置
      // 2桁目の「3」もHTMLで固定表示する。背景画像には数字を依存させない。
      { id: 'exit_digit_1', x: 0.382, y: 0.499, w: 0.040, h: 0.041, label: '入力1桁目', layoutOnly: true, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') },
      { id: 'exit_digit_2', x: 0.428, y: 0.499, w: 0.040, h: 0.041, label: '固定2桁目', layoutOnly: true, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') },
      { id: 'exit_digit_3', x: 0.474, y: 0.499, w: 0.040, h: 0.041, label: '入力3桁目', layoutOnly: true, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') },
      { id: 'exit_digit_4', x: 0.516, y: 0.499, w: 0.040, h: 0.041, label: '入力4桁目', layoutOnly: true, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') },
      { id: 'exit_digit_5', x: 0.558, y: 0.499, w: 0.040, h: 0.041, label: '入力5桁目', layoutOnly: true, visibleIf: (s) => Array.isArray(s.exitPlateSlots) && s.exitPlateSlots.includes('A') },
    ],
  },

  MAINT_BOX_ZOOM: {
  type: 'zoom',
  parent: 'LOADING_3',
  custom: 'loading-maint',

  bg: (s) =>
    s.maintDirectionSolved
      ? LOADING_IMG + 'zoom/maint_input_open_zoom.webp'
      : (
          s.maintBoxOpened
            ? LOADING_IMG + 'zoom/maint_box_open_zoom.webp'
            : LOADING_IMG + 'zoom/maint_box_closed_zoom.webp'
        ),

  hotspots: [
    {
      id: 'maint_cover',
      x: 0.008, y: 0.066, w: 0.992, h: 0.893,
      label: '保守ボックス',
      action: { type: 'loadingMaintPlateC' },
      visibleIf: (s) => !s.maintBoxOpened
    },

    {
      id: 'maint_key_take',
      x: 0.439, y: 0.293, w: 0.289, h: 0.126,
      label: '管理用の鍵',
      action: { type: 'loadingTakeManagementKey' },
      visibleIf: (s) =>
        s.maintDirectionSolved &&
        !s.pickedUp.management_key
    },

    // ========================================
    // 下側：背景に焼き込んだ矢印のタップ領域
    // ========================================

    {
  id: 'maint_btn_up',
  x: 0.480, y: 0.462, w: 0.154, h: 0.116,
  label: '↑',
  action: {
    type: 'loadingMaintDirection',
    direction: 'U'
  },
  visibleIf: (s) =>
    s.maintBoxOpened &&
    !s.maintDirectionSolved
},

{
  id: 'maint_btn_left',
  x: 0.343, y: 0.575, w: 0.149, h: 0.111,
  label: '←',
  action: {
    type: 'loadingMaintDirection',
    direction: 'L'
  },
  visibleIf: (s) =>
    s.maintBoxOpened &&
    !s.maintDirectionSolved
},

{
  id: 'maint_btn_right',
  x: 0.639, y: 0.571, w: 0.144, h: 0.109,
  label: '→',
  action: {
    type: 'loadingMaintDirection',
    direction: 'R'
  },
  visibleIf: (s) =>
    s.maintBoxOpened &&
    !s.maintDirectionSolved
},

{
  id: 'maint_btn_down',
  x: 0.488, y: 0.682, w: 0.164, h: 0.111,
  label: '↓',
  action: {
    type: 'loadingMaintDirection',
    direction: 'D'
  },
  visibleIf: (s) =>
    s.maintBoxOpened &&
    !s.maintDirectionSolved
},

    // ========================================
    // 上側：7桁の矢印表示位置
    // actionなし。位置調整専用。
    // ========================================

    {
  id: 'maint_digit_1',
  x: 0.355, y: 0.330, w: 0.060, h: 0.065,
  fontSize: 18,
  label: '入力1桁目',
  visibleIf: (s) =>
    s.maintBoxOpened &&
    !s.maintDirectionSolved
},

    {
      id: 'maint_digit_2',
      x: 0.415, y: 0.330, w: 0.060, h: 0.065,
      fontSize: 18,
      label: '入力2桁目',
      visibleIf: (s) =>
        s.maintBoxOpened &&
        !s.maintDirectionSolved
    },

    {
      id: 'maint_digit_3',
      x: 0.477, y: 0.330, w: 0.060, h: 0.065,
      fontSize: 18,
      label: '入力3桁目',
      visibleIf: (s) =>
        s.maintBoxOpened &&
        !s.maintDirectionSolved
    },

    {
      id: 'maint_digit_4',
      x: 0.540, y: 0.330, w: 0.060, h: 0.065,
      fontSize: 18,
      label: '入力4桁目',
      visibleIf: (s) =>
        s.maintBoxOpened &&
        !s.maintDirectionSolved
    },

    {
      id: 'maint_digit_5',
      x: 0.600, y: 0.330, w: 0.060, h: 0.065,
      fontSize: 18,
      label: '入力5桁目',
      visibleIf: (s) =>
        s.maintBoxOpened &&
        !s.maintDirectionSolved
    },

    {
      id: 'maint_digit_6',
      x: 0.665, y: 0.330, w: 0.060, h: 0.065,
      fontSize:18,
      label: '入力6桁目',
      visibleIf: (s) =>
        s.maintBoxOpened &&
        !s.maintDirectionSolved
    },

    {
      id: 'maint_digit_7',
      x: 0.725, y: 0.330, w: 0.060, h: 0.065,
      fontSize: 18,
      label: '入力7桁目',
      visibleIf: (s) =>
        s.maintBoxOpened &&
        !s.maintDirectionSolved
    }
  ],
},
  D_CABINET_ZOOM: {
  type: 'zoom',
  parent: 'LOADING_3',
  custom: 'loading-d-slider',

  bg: (s) =>
    s.dSliderSolved
      ? LOADING_IMG + 'zoom/d_slider_solved_zoom.webp'
      : (
          s.dCabinetOpened
            ? LOADING_IMG + 'zoom/d_cabinet_open_zoom.webp'
            : LOADING_IMG + 'zoom/d_cabinet_closed_zoom.webp'
        ),

  hotspots: [
    {
      id: 'd_cabinet_lock',
      x: 0.08,
      y: 0.08,
      w: 0.84,
      h: 0.82,
      label: 'Dキャビネット',
      action: { type: 'loadingUnlockDCabinet' },
      visibleIf: (s) => !s.dCabinetOpened
    },

    {
      id: 'plate_d_take',
      x: 0.33,
      y: 0.55,
      w: 0.34,
      h: 0.25,
      label: 'Plate D',
      action: { type: 'loadingTakePlateD' },
      visibleIf: (s) =>
        s.dSliderSolved &&
        !s.pickedUp.plate_d
    },

    // スライダー1
    {
      id: 'd_slider_1_track',
      x: 0.214, y: 0.603, w: 0.122, h: 0.063,
      label: 'スライダー1 タップ範囲',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_1_pos1',
      x: 0.233, y: 0.343, w: 0.083, h: 0.069,
      label: 'スライダー1 値1',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_1_pos5',
      x: 0.233, y: 0.519, w: 0.083, h: 0.069,
      label: 'スライダー1 値5',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },

    // スライダー2
    {
      id: 'd_slider_2_track',
      x: 0.363, y: 0.604, w: 0.139, h: 0.063,
      label: 'スライダー2 タップ範囲',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_2_pos1',
      x: 0.385, y: 0.343, w: 0.083, h: 0.069,
      label: 'スライダー2 値1',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_2_pos5',
      x: 0.385, y: 0.519, w: 0.083, h: 0.069,
      label: 'スライダー2 値5',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },

    // スライダー3
    {
      id: 'd_slider_3_track',
      x: 0.529, y: 0.606, w: 0.125, h: 0.064,
      label: 'スライダー3 タップ範囲',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_3_pos1',
      x: 0.542, y: 0.343, w: 0.083, h: 0.069,
      label: 'スライダー3 値1',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_3_pos5',
      x: 0.542, y: 0.519, w: 0.083, h: 0.069,
      label: 'スライダー3 値5',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },

    // スライダー4
    {
      id: 'd_slider_4_track',
      x: 0.673, y: 0.605, w: 0.139, h: 0.064,
      label: 'スライダー4 タップ範囲',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_4_pos1',
      x: 0.696, y: 0.343, w: 0.083, h: 0.069,
      label: 'スライダー4 値1',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    },
    {
      id: 'd_slider_4_pos5',
      x: 0.696, y: 0.519, w: 0.083, h: 0.069,
      label: 'スライダー4 値5',
      layoutOnly: true,
      visibleIf: (s) =>
        s.dCabinetOpened &&
        !s.dSliderSolved
    }
  ],
},
  LIGHTBOX_ZOOM: {
    type: 'zoom', parent: 'LOADING_4', custom: 'loading-lightbox',
    bg: (s) => s.lightboxPlateAInserted ? LOADING_IMG + 'zoom/lightbox_zoom_on.webp' : LOADING_IMG + 'zoom/lightbox_zoom_off.webp',
    hotspots: [{ id: 'lightbox_plate_a', x: 0.11, y: 0.15, w: 0.78, h: 0.72, label: 'Plate A差し込み口', action: { type: 'loadingLightboxPlateA' } }],
  },
  PLATE_SLOTS_ZOOM: {
    type: 'zoom', parent: 'LOADING_4', custom: 'loading-plate-slots',
    bg: (s) => (Array.isArray(s.plateDeviceSlots) && JSON.stringify(s.plateDeviceSlots) === JSON.stringify(['D','A','C'])) ? LOADING_IMG + 'zoom/plate_slots_solved_zoom.webp' : LOADING_IMG + 'zoom/plate_slots_zoom.webp',
    hotspots: [
      { id: 'plate_slot_0', x: 0.12, y: 0.22, w: 0.22, h: 0.48, label: '左スロット', action: { type: 'loadingPlateSlot', index: 0 } },
      { id: 'plate_slot_1', x: 0.39, y: 0.22, w: 0.22, h: 0.48, label: '中央スロット', action: { type: 'loadingPlateSlot', index: 1 } },
      { id: 'plate_slot_2', x: 0.66, y: 0.22, w: 0.22, h: 0.48, label: '右スロット', action: { type: 'loadingPlateSlot', index: 2 } },
    ],
  },
  SYMBOL_DISPLAY_ZOOM: {
    type: 'zoom', parent: 'LOADING_4', custom: 'loading-symbols',
    bg: (s) => s.symbolSolved ? LOADING_IMG + 'zoom/symbol_display_solved_zoom.webp' : LOADING_IMG + 'zoom/symbol_display_zoom.webp',
    hotspots: [
      { id: 'symbol_circle', x: 0.177, y: 0.507, w: 0.122, h: 0.090 , label: '○', action: { type: 'loadingSymbol', symbol: 'circle' }, visibleIf: (s) => !s.symbolSolved },
      { id: 'symbol_star', x: 0.351, y: 0.506, w: 0.132, h: 0.097, label: '★', action: { type: 'loadingSymbol', symbol: 'star' }, visibleIf: (s) => !s.symbolSolved },
      { id: 'symbol_square', x: 0.527, y: 0.511, w: 0.115, h: 0.083, label: '□', action: { type: 'loadingSymbol', symbol: 'square' }, visibleIf: (s) => !s.symbolSolved },
      { id: 'symbol_triangle', x: 0.698, y: 0.506, w: 0.122, h: 0.093, label: '△', action: { type: 'loadingSymbol', symbol: 'triangle' }, visibleIf: (s) => !s.symbolSolved },
      { id: 'take_cutter', x: 0.216, y: 0.656, w: 0.264, h: 0.149, label: 'カッター', action: { type: 'loadingTakeSolvedItem', item: 'cutter' }, visibleIf: (s) => s.symbolSolved && !s.pickedUp.cutter },
      { id: 'take_sheet', x: 0.495, y: 0.656, w: 0.301, h: 0.156, label: '透明シート', action: { type: 'loadingTakeSolvedItem', item: 'transparent_sheet' }, visibleIf: (s) => s.symbolSolved && !s.pickedUp.transparent_sheet },
    ],
  },
  DESTINATION_PANEL_ZOOM: {
    type: 'zoom', parent: 'LOADING_3', custom: 'loading-destination',
    bg: (s) => s.destinationSolved ? LOADING_IMG + 'zoom/destination_panel_open_zoom.webp' : LOADING_IMG + 'zoom/destination_panel_zoom.webp',
    hotspots: [
      { id: 'dest_guard', x: 0.430, y: 0.182, w: 0.140, h: 0.105, label: '看守室', action: { type: 'loadingDestination', value: 'guard' }, visibleIf: (s) => !s.destinationSolved },
      { id: 'dest_security', x: 0.430, y: 0.391, w: 0.140, h: 0.105, label: '警備室', action: { type: 'loadingDestination', value: 'security' }, visibleIf: (s) => !s.destinationSolved },
      { id: 'dest_cell', x: 0.430, y: 0.606, w: 0.140, h: 0.105, label: '牢屋', action: { type: 'loadingDestination', value: 'cell' }, visibleIf: (s) => !s.destinationSolved },
      { id: 'take_step', x: 0.307, y: 0.168, w: 0.406, h: 0.613, label: '折り畳み足場', action: { type: 'loadingTakeStep' }, visibleIf: (s) => s.destinationSolved && !s.pickedUp.folding_step_folded && !s.pickedUp.folding_step_open },
    ],
  },
});
