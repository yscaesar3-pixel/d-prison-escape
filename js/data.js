// ============================================================
// data.js — 監獄からの脱出 STAGE1「牢屋」静的データ定義
// 画像・座標・アイテム・謎の答え・ヒント文言をここに集約する。
// 数値やテキストのみを後から調整しやすいよう、ロジックは書かない。
// ============================================================

const IMG = 'assets/images/cell/';

// ------------------------------------------------------------
// アイテム定義
// ------------------------------------------------------------
// consumedOnUse: 対象に使って役目を終えたら自動で消費するか（個別に使用時ロジックで制御するため大半false）
const ITEMS = {
  pencil:        { name: '鉛筆', icon: IMG + 'items/pencil.png' },
  cloth:         { name: '布', icon: IMG + 'items/cloth.png' },
  cloth_wet:     { name: '濡れた布', icon: IMG + 'items/cloth_wet.png' },
  toilet_paper:  { name: 'トイレットペーパー', icon: IMG + 'items/toilet_paper.png' },
  toilet_paper_core:      { name: 'トイレットペーパーの芯', icon: IMG + 'items/toilet_paper_core.png' },
  toilet_paper_core_open: { name: '展開したトイレットペーパーの芯', icon: IMG + 'items/toilet_paper_core_open.png' },
  string_item:   { name: '細いひも', icon: IMG + 'items/string.png' },
  wrench:        { name: 'L字レンチ', icon: IMG + 'items/wrench.png' },
  rod:           { name: '細長い金属棒', icon: IMG + 'items/rod.png' },
  hook:          { name: '金属フック', icon: IMG + 'items/hook.png' },
  rod_hook:      { name: 'フック付き金属棒', icon: IMG + 'items/rod_hook.png' },
  rod_hook_string: { name: 'ひも付き回収棒', icon: IMG + 'items/rod_hook_string.png' },
  magnet_part:   { name: '磁石付き金具', icon: IMG + 'items/magnet_part.png' },
  retrieval_rod: { name: '磁石付き回収棒', icon: IMG + 'items/retrieval_rod.png' },
  small_key:     { name: '小さな鍵', icon: IMG + 'items/small_key.png' },
  faucet_handle: { name: '蛇口のハンドル', icon: IMG + 'items/faucet_handle.png', inspectAlt: IMG + 'items/faucet_handle_back.png' },
  mirror:        { name: '取り外した鏡', icon: IMG + 'items/mirror.png' },
  mirror_piece:  { name: '小さな鏡片', icon: IMG + 'items/mirror_piece.png' },
  cell_key:      { name: '牢屋の鍵', icon: IMG + 'items/cell_key.png' },
  plate_a:       { name: 'プレートA', icon: IMG + 'items/plate_a.png' },
};

// アイテム組み合わせルール： "id1+id2" (アルファベット順ではなく登録順で両方向判定) -> 結果
const COMBOS = [
  { a: 'rod', b: 'hook', result: 'rod_hook', consumeA: true, consumeB: true },
  { a: 'rod_hook', b: 'string_item', result: 'rod_hook_string', consumeA: true, consumeB: true },
  { a: 'rod_hook_string', b: 'magnet_part', result: 'retrieval_rod', consumeA: true, consumeB: true },
];

// ------------------------------------------------------------
// パズルの正解
// ------------------------------------------------------------
const PUZZLES = {
  // 3x3グリッド位置番号（0-8, 左上0〜右下8, row*3+col）。左上(0)は未使用。
  // ○ △ ★ ◇ ◎ ＋ □ ▽ の順 = 上中央(1) 右上(2) 右中央(5) 右下(8) 下中央(7) 中央(4) 左中央(3) 左下(6)
  patternSequence: [1, 2, 5, 8, 7, 4, 3, 6],
  toiletSequence: ['大', '小', '小', '大', '小'],
  chairSequence: ['leftFront', 'rightBack', 'rightFront', 'leftBack'],
  faucetAnswer: [2, 4, 1, 3],
};

// ------------------------------------------------------------
// ヒント定義（各hintIdごとに hint1 / hint2 / answer）
// ------------------------------------------------------------
const HINT_DATA = {
  HINT_PATTERN: {
    label: '鉄格子と机下の記号',
    hint1: '鉄格子には、よく見ると複数の記号が刻まれている。',
    hint2: '机の下にある記号の順番と、鉄格子の配置を組み合わせて考えよう。',
    answer: '○→△→★→◇→◎→＋→□→▽の位置を、マットレス下の3×3の点で順番になぞる。',
  },
  HINT_BED_FRAME: {
    label: 'ベッドフレームのボルト',
    hint1: 'ベッドの足元、フレームの補強棒が気になる。',
    hint2: 'ボルトを外せそうな道具を隠し収納の中で見つけていないだろうか。',
    answer: 'L字レンチをベッドフレームのボルトに使う。',
  },
  HINT_WALL_RUBBING: {
    label: 'ベッド上の壁の凹凸',
    hint1: '壁の凹凸は、そのまま見ても読みにくい。',
    hint2: '薄い紙を重ね、その上から鉛筆でこすってみよう。',
    answer: 'トイレットペーパーを壁に貼り、その上から鉛筆を使う。月→太陽→波→雷が浮かぶ。',
  },
  HINT_CHAIR: {
    label: '椅子の脚の記号',
    hint1: '椅子の脚にはそれぞれ違う印がある。',
    hint2: '壁から読み取った4つの記号の順番を使おう。',
    answer: '左前（月）→右後ろ（太陽）→右前（波）→左後ろ（雷）の順で脚先を押す。',
  },
  HINT_BED_UNDER: {
    label: 'ベッド下の部品',
    hint1: 'ベッド下の奥に、何か小さな部品が見える。',
    hint2: 'フックの付いた長い棒があれば引っ掛けられそうだ。',
    answer: 'フック付き金属棒をベッド下に使い、奥の磁石付き金具を引き寄せる。',
  },
  HINT_TOILET: {
    label: 'トイレのつまみ',
    hint1: 'トイレの「大・小」を操作する順番を示すものがどこかにある。',
    hint2: '毛布の裏の水滴の大きさに注目しよう。',
    answer: '大→小→小→大→小の順でつまみを操作する。',
  },
  HINT_MIRROR: {
    label: '鏡の汚れ',
    hint1: '鏡が汚れていて、何かが隠れているように見える。',
    hint2: '蛇口で布を濡らし、鏡を拭いてみよう。',
    answer: '濡れた布で鏡を拭くと、高さの違う棒が並んでいるのが見える。',
  },
  HINT_FAUCET: {
    label: '蛇口の高さ合わせ',
    hint1: '鏡に見える大量の棒すべてを使うわけではない。',
    hint2: '使い切ったトイレットペーパーの芯を詳しく調べよう。',
    answer: '芯を広げて鏡に重ねると4本だけ見える。高さは2・4・1・3。蛇口の4表示を同じ高さに合わせる。',
  },
  HINT_MIRROR_PIECE: {
    label: '鏡の特殊ねじ',
    hint1: '鏡の四隅には特殊な形のねじがある。蛇口の謎を解くまでは外せない。',
    hint2: '蛇口のハンドルを詳しく調べ、裏側のくぼみの形を確認しよう。',
    answer: '2413を解いた後、四隅のどれか1つのねじをズームし、蛇口のハンドルを使う。ねじ1本を外すだけで鏡全体が外れる。取り外した鏡をアイテム詳細でタップすると鏡片になる。',
  },
  HINT_VENT: {
    label: '通気口の奥',
    hint1: '牢屋の鍵は通常の視点から見える場所にはない。',
    hint2: '壁上部の通気口と、小さな鏡片を組み合わせよう。',
    answer: '通気口に小さな鏡片を使用すると、奥に鍵が落ちていることが分かる。',
  },
  HINT_RETRIEVAL_TOOL: {
    label: '鍵を回収する道具',
    hint1: '見つけた鍵は、そのままでは手が届かない。',
    hint2: 'これまで使った長い道具と、磁石付き金具をもう一度利用できる。',
    answer: 'フック付き金属棒＋細いひも＋磁石付き金具を組み合わせ、磁石付き回収棒を作る。',
  },
  HINT_PLATE_A: {
    label: '机の引き出し',
    hint1: '牢屋を出る前に、まだ回収していない物がないか確認しよう。',
    hint2: 'トイレの仕掛けを解いて手に入る小さな鍵は、机の引き出しに使える。',
    answer: '小さな鍵で机の引き出しを開け、中にあるプレートAを回収する。',
  },
  HINT_FINAL_KEY: {
    label: '鍵の回収と扉',
    hint1: '通気口の奥に見つけたものは、そのままでは手が届かない。',
    hint2: '完成した磁石付き回収棒を、もう一度通気口で使ってみよう。',
    answer: '通気口で磁石付き回収棒を使うと、牢屋の鍵を引き寄せられる。その後、鍵を大型錠へ使う。',
  },
};

// ヒント優先順位（先に判定した方が優先）
const HINT_PRIORITY = [
  'HINT_PATTERN', 'HINT_BED_FRAME', 'HINT_WALL_RUBBING', 'HINT_CHAIR',
  'HINT_TOILET', 'HINT_BED_UNDER', 'HINT_MIRROR', 'HINT_FAUCET',
  'HINT_MIRROR_PIECE', 'HINT_RETRIEVAL_TOOL', 'HINT_VENT', 'HINT_PLATE_A', 'HINT_FINAL_KEY',
];

// ------------------------------------------------------------
// 画面（壁 / ズーム）定義
// 各hotspot: { id, x,y,w,h(0-1相対), label, action }
// action は main.js 側の interactions テーブルで解釈する
// ------------------------------------------------------------
const SCREENS = {
  // ---------------- WALL 1：鉄格子 ----------------
  WALL_1: {
    type: 'wall', wallIndex: 0,
    bg: (s) => s.doorOpen ? IMG + 'walls/wall_1_open.webp' : IMG + 'walls/wall_1.webp',
    hotspots: [
      { id: 'door', x: 0.29, y: 0.18, w: 0.43, h: 0.64, label: '鉄格子扉', action: { type: 'doorAction' } },
      { id: 'symbols', x: 0.74, y: 0.30, w: 0.20, h: 0.24, label: '記号の刻印', action: { type: 'zoom', target: 'Z_W1_SYMBOLS' }, visibleIf: (s) => !s.doorOpen },
    ],
  },
  Z_W1_DOOR: {
    type: 'zoom', parent: 'WALL_1',
    bg: IMG + 'zoom/w1_door.webp',
    hotspots: [
      { id: 'lockbody', x: 0.18, y: 0.18, w: 0.64, h: 0.64, label: '古い大型錠', action: { type: 'useKeyOnLock' } },
    ],
  },
  Z_W1_SYMBOLS: {
    type: 'zoom', parent: 'WALL_1',
    bg: IMG + 'zoom/w1_symbols.webp',
    hotspots: [],
  },

  // ---------------- WALL 2：ベッド ----------------
  WALL_2: {
    type: 'wall', wallIndex: 1,
    bg: IMG + 'walls/wall_2.webp',
    hotspots: [
      { id: 'bed_under', x: 0.150, y: 0.752, w: 0.768, h: 0.141, label: 'ベッド下', action: { type: 'zoom', target: 'Z_W2_BED_UNDER' } },
      { id: 'pillow', x: 0.043, y: 0.579, w: 0.214, h: 0.124, label: '枕', action: { type: 'zoom', target: 'Z_W2_PILLOW' } },
      { id: 'blanket', x: 0.268, y: 0.579, w: 0.661, h: 0.169, label: '毛布', action: { type: 'zoom', target: 'Z_W2_BLANKET' } },
      { id: 'frame', x: 0.000, y: 0.701, w: 0.148, h: 0.183, label: 'ベッドフレーム', action: { type: 'zoom', target: 'Z_W2_FRAME' } },
      { id: 'wall_above', x: 0.223, y: 0.045, w: 0.738, h: 0.471, label: '壁面', action: { type: 'zoom', target: 'Z_W2_WALL' } },
    ],
  },
  Z_W2_BED_UNDER: {
    type: 'zoom', parent: 'WALL_2',
    bg: IMG + 'zoom/w2_bed_under.webp',
    hotspots: [
      { id: 'part',  x: 0.340, y: 0.476, w: 0.344, h: 0.169, label: '磁石付き金具', action: { type: 'bedUnderPart' }, itemImage: 'magnet_part', overlayScale: 0.30, visibleIf: (s) => !s.pickedUp.magnet_part && !s.solved.bedUnder },
    ],
  },
  Z_W2_PILLOW: {
    type: 'zoom', parent: 'WALL_2',
    bg: (s) => s.pillowLifted ? IMG + 'zoom/w2_pillow_lifted.webp' : IMG + 'zoom/w2_pillow.webp',
    hotspots: [
      { id: 'pillow_tap',  x: 0.007, y: 0.309, w: 0.993, h: 0.426, label: '枕', action: { type: 'liftPillow' }, visibleIf: (s) => !s.pillowLifted },
      { id: 'string_spot', x: 0.105, y: 0.383, w: 0.818, h: 0.222, label: '細いひも', action: { type: 'takeItem', item: 'string_item' }, itemImage: 'string_item', visibleIf: (s) => s.pillowLifted && !s.pickedUp.string_item },
    ],
  },
  Z_W2_BLANKET: {
    type: 'zoom', parent: 'WALL_2',
    bg: (s) => s.blanketOpen ? IMG + 'zoom/w2_blanket_open.webp' : IMG + 'zoom/w2_blanket.webp',
    hotspots: [
      { id: 'blanket_tap', x: 0.107, y: 0.248, w: 0.793, h: 0.727, label: '毛布', action: { type: 'openBlanket' }, visibleIf: (s) => !s.blanketOpen },
      { id: 'mattress_go', x: 0.107, y: 0.248, w: 0.793, h: 0.727, label: 'マットレス', action: { type: 'zoom', target: 'Z_W2_MATTRESS' }, visibleIf: (s) => s.blanketOpen },
    ],
  },
  Z_W2_MATTRESS: {
    type: 'zoom', parent: 'Z_W2_BLANKET',
    bg: (s) => s.solved.pattern ? (s.mattressPanelOpen ? IMG + 'zoom/w2_mattress_open.webp' : IMG + 'zoom/w2_mattress_slid.webp') : IMG + 'zoom/w2_mattress.webp',
    hotspots: [
      { id: 'input_panel', x: 0.277, y: 0.285, w: 0.432, h: 0.424, label: '3×3の金属パネル', action: { type: 'zoom', target: 'Z_W2_MATTRESS_INPUT' }, visibleIf: (s) => !s.solved.pattern },
      { id: 'panel', x: 0.24, y: 0.33, w: 0.55, h: 0.40, label: 'ずれた金属パネル', action: { type: 'openMattressPanel' }, visibleIf: (s) => s.solved.pattern && !s.mattressPanelOpen },
      { id: 'wrench_spot', x: 0.343, y: 0.357, w: 0.250, h: 0.248, label: 'L字レンチ', action: { type: 'takeItem', item: 'wrench' }, itemImage: 'wrench', visibleIf: (s) => s.mattressPanelOpen && !s.pickedUp.wrench },
    ],
  },
  Z_W2_MATTRESS_INPUT: {
    type: 'zoom', parent: 'Z_W2_MATTRESS', custom: 'mattress',
    bg: IMG + 'zoom/w2_mattress_input.webp',
    hotspots: [],
  },
  Z_W2_FRAME: {
    type: 'zoom', parent: 'WALL_2',
    bg: (s) => s.solved.frame ? IMG + 'zoom/w2_frame_open.webp' : IMG + 'zoom/w2_frame.webp',
    hotspots: [
      { id: 'bolt', x: 0.005, y: 0.656, w: 0.995, h: 0.198, label: '補強棒のボルト', action: { type: 'useWrenchOnFrame' }, visibleIf: (s) => !s.solved.frame },
      { id: 'rod_spot', x: 0.18, y: 0.62, w: 0.64, h: 0.15, label: '細長い金属棒', action: { type: 'takeItem', item: 'rod' }, itemImage: 'rod', visibleIf: (s) => s.solved.frame && !s.pickedUp.rod },
    ],
  },
  Z_W2_WALL: {
    type: 'zoom', parent: 'WALL_2',
    bg: (s) => {
      if (s.wallRubbingDone) return IMG + 'zoom/w2_wall_rubbed.webp';
      if (s.wallPaperPlaced) return IMG + 'zoom/w2_wall_paper.webp';
      return IMG + 'zoom/w2_wall.webp';
    },
    hotspots: [
      { id: 'surface', x: 0.15, y: 0.18, w: 0.70, h: 0.60, label: '壁の凹凸', action: { type: 'rubWall' } },
    ],
  },

  // ---------------- WALL 3：トイレ・手洗い ----------------
  WALL_3: {
    type: 'wall', wallIndex: 2,
    bg: (s) => s.mirrorRemoved ? IMG + 'walls/wall_3_mirror_removed.webp' : IMG + 'walls/wall_3.webp',
    hotspots: [
      { id: 'sink',  x: 0.289, y: 0.240, w: 0.320, h: 0.426, label: '手洗い', action: { type: 'zoom', target: 'Z_W3_SINK' } },
      { id: 'toilet', x: 0.609, y: 0.473, w: 0.227, h: 0.328, label: 'トイレ', action: { type: 'zoom', target: 'Z_W3_TOILET_SIDE' } },
      { id: 'toilet_paper', x: 0.841, y: 0.468, w: 0.159, h: 0.146, label: 'トイレットペーパー', action: { type: 'zoom', target: 'Z_W3_TOILET_PAPER' } },
      { id: 'cleaning', x: 0.048, y: 0.331, w: 0.232, h: 0.468, label: '清掃用品', action: { type: 'zoom', target: 'Z_W3_CLEANING' } },
    ],
  },
  Z_W3_SINK: {
    type: 'zoom', parent: 'WALL_3',
    bg: (s) => s.mirrorRemoved ? IMG + 'zoom/w3_sink_mirror_removed.webp' : IMG + 'zoom/w3_sink.webp',
    hotspots: [
      { id: 'mirror', x: 0.286, y: 0.011, w: 0.423, h: 0.408, label: '鏡', action: { type: 'zoom', target: 'Z_W3_MIRROR' }, visibleIf: (s) => !s.mirrorRemoved },
      { id: 'faucet', x: 0.198, y: 0.436, w: 0.602, h: 0.352, label: '蛇口', action: { type: 'zoom', target: 'Z_W3_FAUCET' } },
    ],
  },
  Z_W3_MIRROR: {
    type: 'zoom', parent: 'Z_W3_SINK',
    bg: (s) => {
      if (s.mirrorRemoved) return IMG + 'zoom/w3_mirror_piece_removed.webp';
      if (s.coreOnMirror) return IMG + 'zoom/w3_mirror_core.webp';
      if (s.mirrorClean) return IMG + 'zoom/w3_mirror_clean.webp';
      return IMG + 'zoom/w3_mirror_dirty.webp';
    },
    hotspots: [
      { id: 'surface', x: 0.096, y: 0.039, w: 0.829, h: 0.759, label: '鏡面', action: { type: 'mirrorSurface' }, visibleIf: (s) => !s.mirrorRemoved },
      { id: 'screw_tl', x: 0.12, y: 0.06, w: 0.16, h: 0.13, label: '左上のねじ', action: { type: 'zoom', target: 'Z_W3_MIRROR_SCREW' }, visibleIf: (s) => s.solved.faucet && !s.mirrorRemoved },
      { id: 'screw_tr', x: 0.72, y: 0.06, w: 0.16, h: 0.13, label: '右上のねじ', action: { type: 'zoom', target: 'Z_W3_MIRROR_SCREW' }, visibleIf: (s) => s.solved.faucet && !s.mirrorRemoved },
      { id: 'screw_bl', x: 0.12, y: 0.69, w: 0.16, h: 0.13, label: '左下のねじ', action: { type: 'zoom', target: 'Z_W3_MIRROR_SCREW' }, visibleIf: (s) => s.solved.faucet && !s.mirrorRemoved },
      { id: 'screw_br', x: 0.72, y: 0.69, w: 0.16, h: 0.13, label: '右下のねじ', action: { type: 'zoom', target: 'Z_W3_MIRROR_SCREW' }, visibleIf: (s) => s.solved.faucet && !s.mirrorRemoved },
    ],
  },
  Z_W3_MIRROR_SCREW: {
    type: 'zoom', parent: 'Z_W3_MIRROR',
    bg: IMG + 'zoom/w3_mirror_screw.webp',
    hotspots: [
      { id: 'special_screw', x: 0.20, y: 0.18, w: 0.60, h: 0.60, label: '特殊なねじ', action: { type: 'removeMirrorScrew' } },
    ],
  },
  Z_W3_FAUCET: {
    type: 'zoom', parent: 'Z_W3_SINK', custom: 'faucet',
    bg: (s) => s.items.faucet_handle ? IMG + 'zoom/w3_faucet_handle_taken.webp' : IMG + 'zoom/w3_faucet.webp',
    hotspots: [
      { id: 'body', x: 0.320, y: 0.066, w: 0.368, h: 0.273, label: '蛇口', action: { type: 'faucetBody' } },
      { id: 'btn0', x: 0.250, y: 0.556, w: 0.102, h: 0.071, label: '表示1のボタン', action: { type: 'faucetButton', index: 0 }, visibleIf: (s) => !s.solved.faucet },
      { id: 'btn1', x: 0.377, y: 0.558, w: 0.118, h: 0.069, label: '表示2のボタン', action: { type: 'faucetButton', index: 1 }, visibleIf: (s) => !s.solved.faucet },
      { id: 'btn2', x: 0.518, y: 0.559, w: 0.107, h: 0.069, label: '表示3のボタン', action: { type: 'faucetButton', index: 2 }, visibleIf: (s) => !s.solved.faucet },
      { id: 'btn3', x: 0.650, y: 0.559, w: 0.107, h: 0.068, label: '表示4のボタン', action: { type: 'faucetButton', index: 3 }, visibleIf: (s) => !s.solved.faucet },
      { id: 'handle', x: 0.402, y: 0.399, w: 0.211, h: 0.191, label: '外れたハンドル', action: { type: 'takeItem', item: 'faucet_handle' }, itemImage: 'faucet_handle', visibleIf: (s) => s.solved.faucet && !s.pickedUp.faucet_handle },
    ],
  },
  Z_W3_TOILET_SIDE: {
    type: 'zoom', parent: 'WALL_3',
    bg: (s) => s.solved.toilet ? IMG + 'zoom/w3_toilet_solved.webp' : IMG + 'zoom/w3_toilet_side.webp',
    hotspots: [
      { id: 'buttons_go', x: 0.125, y: 0.404, w: 0.327, h: 0.349, label: '大・小ボタン', action: { type: 'zoom', target: 'Z_W3_TOILET_BUTTONS' }, visibleIf: (s) => !s.solved.toilet },
      { id: 'small_key_spot', x: 0.199, y: 0.658, w: 0.184, h: 0.160, label: '小さな鍵', action: { type: 'takeItem', item: 'small_key' }, itemImage: 'small_key', visibleIf: (s) => s.solved.toilet && !s.pickedUp.small_key },
    ],
  },
  Z_W3_TOILET_BUTTONS: {
    type: 'zoom', parent: 'Z_W3_TOILET_SIDE',
    bg: IMG + 'zoom/w3_toilet_buttons.webp',
    hotspots: [
      { id: 'knob_big', x: 0.186, y: 0.227, w: 0.498, h: 0.272, label: '「大」', action: { type: 'toiletKnob', which: '大' } },
      { id: 'knob_small', x: 0.190, y: 0.517, w: 0.465, h: 0.234, label: '「小」', action: { type: 'toiletKnob', which: '小' } },
    ],
  },
  Z_W3_TOILET_PAPER: {
    type: 'zoom', parent: 'WALL_3',
    bg: (s) => {
      if (s.toiletPaperUses >= 4) {
        if (s.pickedUp.toilet_paper_core) return IMG + 'zoom/w3_toilet_paper_empty.webp';
        return IMG + 'zoom/w3_toilet_paper_core.webp';
      }
      return IMG + 'zoom/w3_toilet_paper.webp';
    },
    hotspots: [
      { id: 'roll', x: 0.069, y: 0.155, w: 0.821, h: 0.594, label: 'トイレットペーパー', action: { type: 'tapToiletPaper' }, visibleIf: (s) => s.toiletPaperUses < 4 },
    ],
  },
  Z_W3_CLEANING: {
    type: 'zoom', parent: 'WALL_3',
    bg: IMG + 'zoom/w3_cleaning.webp',
    hotspots: [
      { id: 'cloth_spot', x: 0.280, y: 0.785, w: 0.325, h: 0.164, label: '布', action: { type: 'takeItem', item: 'cloth' }, itemImage: 'cloth', visibleIf: (s) => !s.pickedUp.cloth },
    ],
  },

  // ---------------- WALL 4：机・イス ----------------
  WALL_4: {
    type: 'wall', wallIndex: 3,
    bg: IMG + 'walls/wall_4.webp',
    hotspots: [
      { id: 'drawer', x: 0.617, y: 0.554, w: 0.239, h: 0.083, label: '引き出し', action: { type: 'zoom', target: 'Z_W4_DRAWER' } },
      { id: 'desk_under_right', x: 0.145, y: 0.564, w: 0.160, h: 0.338, label: '机の下右', action: { type: 'zoom', target: 'Z_W4_DESK_UNDER' } },
      { id: 'desk_under_left', x: 0.605, y: 0.643, w: 0.231, h: 0.251, label: '机の下左', action: { type: 'zoom', target: 'Z_W4_DESK_UNDER' } },
      { id: 'desktop', x: 0.140, y: 0.415, w: 0.706, h: 0.133, label: '机上', action: { type: 'zoom', target: 'Z_W4_DESKTOP' } },
      { id: 'chair', x: 0.31, y: 0.55, w: 0.30, h: 0.35, label: 'イス', action: { type: 'zoom', target: 'Z_W4_CHAIR' } },
      { id: 'upper', x: 0.31, y: 0.04, w: 0.38, h: 0.17, label: '通気口', action: { type: 'zoom', target: 'Z_W4_UPPER' } },
    ],
  },
  Z_W4_DRAWER: {
    type: 'zoom', parent: 'WALL_4',
    bg: (s) => s.drawerOpen ? IMG + 'zoom/w4_drawer_open.webp' : IMG + 'zoom/w4_drawer_closed.webp',
    hotspots: [
      { id: 'lock', x: 0.059, y: 0.287, w: 0.880, h: 0.405, label: '引き出し', action: { type: 'openDrawer' }, visibleIf: (s) => !s.drawerOpen },
      { id: 'plate', x: 0.34, y: 0.44, w: 0.32, h: 0.18, label: 'プレートA', action: { type: 'takeItem', item: 'plate_a' }, itemImage: 'plate_a', visibleIf: (s) => s.drawerOpen && !s.pickedUp.plate_a },
    ],
  },
  Z_W4_DESK_UNDER: {
    type: 'zoom', parent: 'WALL_4',
    bg: IMG + 'zoom/w4_desk_under.webp',
    hotspots: [],
  },
  Z_W4_DESKTOP: {
    type: 'zoom', parent: 'WALL_4',
    bg: IMG + 'zoom/w4_desktop.webp',
    hotspots: [
      { id: 'pencil_spot', x: 0.48, y: 0.29, w: 0.30, h: 0.13, label: '鉛筆', action: { type: 'takeItem', item: 'pencil' }, itemImage: 'pencil', visibleIf: (s) => !s.pickedUp.pencil },
    ],
  },
  Z_W4_CHAIR: {
    type: 'zoom', parent: 'WALL_4', custom: 'chair',
    bg: (s) => {
      if (s.solved.chair) return IMG + 'zoom/w4_chair_solved.webp';
      return s.chairFlipped ? IMG + 'zoom/w4_chair_back.webp' : IMG + 'zoom/w4_chair.webp';
    },
    hotspots: [
      { id: 'flip', x: 0.171, y: 0.179, w: 0.677, h: 0.766, label: 'イスを裏返す', action: { type: 'flipChair' }, visibleIf: (s) => !s.chairFlipped && !s.solved.chair },
      { id: 'leftFront', x: 0.06, y: 0.07, w: 0.24, h: 0.20, label: '左前（月）', action: { type: 'chairLeg', leg: 'leftFront' }, visibleIf: (s) => s.chairFlipped && !s.solved.chair },
      { id: 'rightFront', x: 0.734, y: 0.051, w: 0.266, h: 0.216, label: '右前（波）', action: { type: 'chairLeg', leg: 'rightFront' }, visibleIf: (s) => s.chairFlipped && !s.solved.chair },
      { id: 'leftBack', x: 0.001, y: 0.690, w: 0.308, h: 0.216, label: '左後ろ（雷）', action: { type: 'chairLeg', leg: 'leftBack' }, visibleIf: (s) => s.chairFlipped && !s.solved.chair },
      { id: 'rightBack', x: 0.700, y: 0.692, w: 0.300, h: 0.201, label: '右後ろ（太陽）', action: { type: 'chairLeg', leg: 'rightBack' }, visibleIf: (s) => s.chairFlipped && !s.solved.chair },
      { id: 'hook_spot', x: 0.36, y: 0.38, w: 0.28, h: 0.18, label: '金属フック', action: { type: 'takeItem', item: 'hook' }, itemImage: 'hook', visibleIf: (s) => s.solved.chair && !s.pickedUp.hook },
    ],
  },
  Z_W4_UPPER: {
    type: 'zoom', parent: 'WALL_4',
    bg: (s) => (s.keyLocationFound && !s.items.cell_key) ? IMG + 'zoom/w4_upper_mirror.webp' : IMG + 'zoom/w4_upper.webp',
    hotspots: [
      { id: 'vent', x: 0.10, y: 0.20, w: 0.80, h: 0.56, label: '通気口', action: { type: 'useVent' } },
    ],
  },
};

// クリア画面
Object.assign(SCREENS, { GAME_CLEAR: { type: 'clear', bg: 'assets/images/loading/ending/ending_2.webp', hotspots: [] } });

const CLEAR_SCREEN_TEXT = '監獄から脱出した。';
const CLEAR_SCREEN_SUBTEXT = 'だが、ここはどこだろう……';
