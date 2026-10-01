"""
仮画像生成スクリプト（プロトタイプ用）。
本番画像制作前のプレースホルダーとして、位置関係が分かる簡易画像を作る。
後からこのファイルの出力を本番画像に差し替えるだけでよい構成。
"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.join(os.path.dirname(__file__), 'assets', 'images', 'cell')
W, H = 900, 1200  # 縦画面 3:4

COLD_BG = (26, 30, 36)
WALL_BG = (34, 39, 46)
METAL = (120, 128, 138)
METAL_DARK = (70, 77, 86)
RUST = (140, 96, 70)
ACCENT = (170, 190, 205)
GOLD = (215, 190, 110)
FABRIC = (90, 100, 92)
DARK = (14, 16, 20)

def font(size=28):
    for path in [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size, index=0)
            except Exception as e:
                print('font load failed', path, e)
    return ImageFont.load_default()

F_TITLE = None
F_LABEL = None

def init_fonts():
    global F_TITLE, F_LABEL
    F_TITLE = font(30)
    F_LABEL = font(22)

def new_canvas(bg=WALL_BG):
    img = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(img)
    # 冷たい石壁のノイズ風グラデーション帯
    for i in range(0, H, 6):
        shade = 4 if (i // 6) % 2 == 0 else 0
        d.line([(0, i), (W, i)], fill=tuple(min(255, c + shade) for c in bg), width=2)
    # 四隅を少し暗く（無機質な照明感）
    return img, d

def label(d, cx, cy, text, fill=ACCENT):
    w = d.textlength(text, font=F_LABEL)
    d.rectangle([cx - w/2 - 8, cy - 16, cx + w/2 + 8, cy + 16], fill=(10, 11, 14, 200))
    d.text((cx - w/2, cy - 13), text, font=F_LABEL, fill=fill)

def rrect(d, box, fill, outline=None, radius=14, width=3):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def title(img, d, text):
    d.rectangle([0, 0, W, 46], fill=(8, 9, 12))
    d.text((16, 10), text, font=F_TITLE, fill=(150, 165, 178))

def save(img, relpath):
    full = os.path.join(BASE, relpath)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if full.lower().endswith('.webp'):
        img.save(full, 'WEBP', quality=88)
    else:
        img.save(full, 'PNG')
    print('saved', relpath)

# ---------------------------------------------------------------
# WALL_1 鉄格子
# ---------------------------------------------------------------
def wall1(open_=False):
    img, d = new_canvas()
    title(d.im and d or d, d, 'WALL 1 - 鉄格子') if False else title(img, d, 'WALL 1 - 鉄格子')
    # 縦格子
    for x in range(120, 780, 46):
        d.rectangle([x, 120, x + 14, 1080], fill=METAL)
    d.rectangle([100, 100, 800, 140], fill=METAL_DARK)
    d.rectangle([100, 1060, 800, 1100], fill=METAL_DARK)
    # 扉部分
    door_col = (90, 60, 45) if not open_ else COLD_BG
    rrect(d, [300, 320, 600, 900], fill=door_col if open_ else WALL_BG, outline=METAL, width=6)
    if open_:
        d.line([300, 320, 300, 900], fill=METAL, width=10)  # 開いた扉が壁際に寄っている表現
        label(d, 450, 950, '扉は開いている', GOLD)
    else:
        # 大型錠
        d.ellipse([420, 640, 480, 700], fill=METAL_DARK, outline=(20,20,20), width=3)
        label(d, 450, 720, '大型錠')
        label(d, 450, 340, '鉄格子扉')
    # 記号刻印エリア
    rrect(d, [600, 190, 830, 380], fill=(30,34,40), outline=METAL, width=3, radius=8)
    label(d, 715, 200, '記号の刻印', fill=ACCENT) if False else None
    symbols = ['×','○','△','□','＋','★','▽','◎','◇']
    fs = font(40)
    for i, s in enumerate(symbols):
        r, c = divmod(i, 3)
        d.text((640 + c*60, 220 + r*55), s, font=fs, fill=(200, 205, 210))
    label(d, 715, 360, '記号の刻印')
    label(d, 90, 700, '扉フレーム死角', fill=(90,95,100))
    label(d, 90, 740, '(通常は見えない)', fill=(90,95,100))
    return img

save_img = None

def run_wall1():
    save(wall1(False), 'walls/wall_1.webp')
    save(wall1(True), 'walls/wall_1_open.webp')

def w1_door(open_=False):
    img, d = new_canvas()
    title(img, d, '鉄格子扉')
    for x in range(140, 760, 60):
        d.rectangle([x, 100, x + 18, 1100], fill=METAL)
    if open_:
        d.rectangle([140, 100, 300, 1100], fill=WALL_BG)
        label(d, 450, 600, '扉が開いている', GOLD)
    else:
        d.ellipse([390, 560, 510, 680], fill=METAL_DARK, outline=(15,15,15), width=4)
        label(d, 450, 700, '大型錠（タップでズーム）')
    return img

def w1_lock():
    img, d = new_canvas((22,22,26))
    title(img, d, '古い大型錠')
    d.ellipse([250, 380, 650, 780], fill=(60,60,66), outline=(20,20,20), width=8)
    d.ellipse([380, 510, 520, 650], fill=(30,30,34))
    d.rectangle([430, 560, 470, 700], fill=(20,20,24))
    label(d, 450, 850, '鍵穴')
    return img

def w1_symbols():
    img, d = new_canvas((30,32,38))
    title(img, d, '鉄格子の記号刻印（拡大）')
    symbols = ['×','○','△','□','＋','★','▽','◎','◇']
    fs = font(90)
    for i, s in enumerate(symbols):
        r, c = divmod(i, 3)
        cx, cy = 250 + c*220, 380 + r*220
        d.rounded_rectangle([cx-70,cy-70,cx+70,cy+70], radius=12, outline=METAL, width=3)
        w = d.textlength(s, font=fs)
        d.text((cx - w/2, cy - 55), s, font=fs, fill=(210,213,216))
    return img

# ---------------------------------------------------------------
# WALL_2 ベッド
# ---------------------------------------------------------------
def wall2():
    img, d = new_canvas()
    title(img, d, 'WALL 2 - ベッド')
    # 壁上部（凹凸ゾーン）
    rrect(d, [260, 60, 640, 220], fill=(40,44,50), outline=(55,60,66), width=2, radius=6)
    label(d, 450, 130, '壁面（かすかな凹凸）', fill=(90,95,100))
    # 枕
    rrect(d, [520, 300, 800, 480], fill=(210,205,190), outline=(150,145,130), width=4, radius=30)
    label(d, 660, 390, '枕')
    # 毛布
    rrect(d, [160, 460, 780, 700], fill=(70,90,110), outline=(40,55,70), width=4, radius=18)
    label(d, 470, 580, '毛布')
    # ベッドフレーム
    rrect(d, [90, 700, 850, 1000], fill=(50,54,60), outline=METAL, width=4, radius=10)
    label(d, 470, 940, 'ベッドフレーム')
    # ベッド下
    rrect(d, [60, 1000, 360, 1120], fill=(15,16,20), outline=(35,38,44), width=3, radius=8)
    label(d, 210, 1060, 'ベッド下')
    return img

def w2_bed_under(has_part=True):
    img, d = new_canvas((12,13,16))
    title(img, d, 'ベッド下')
    for i in range(4):
        d.line([100+i*40, 200, 60+i*40, 1150], fill=(30,32,36), width=6)
    if has_part:
        d.ellipse([600, 260, 680, 340], fill=(150,150,90), outline=(90,90,50), width=3)
        label(d, 640, 380, '奥の部品')
    return img

def w2_pillow(lifted=False):
    img, d = new_canvas()
    title(img, d, '枕')
    if not lifted:
        rrect(d, [150, 350, 750, 800], fill=(215,210,195), outline=(150,145,130), width=6, radius=60)
        label(d, 450, 900, 'タップして持ち上げる')
    else:
        rrect(d, [150, 700, 750, 1000], fill=(215,210,195), outline=(150,145,130), width=6, radius=40)
        d.line([200,650,700,620], fill=(140,120,90), width=8)
        label(d, 450, 560, '細いひも')
    return img

def w2_blanket(open_=False):
    img, d = new_canvas()
    title(img, d, '毛布')
    if not open_:
        rrect(d, [130, 300, 800, 900], fill=(70,90,110), outline=(40,55,70), width=6, radius=24)
        label(d, 460, 950, 'タップしてめくる')
    else:
        rrect(d, [130, 300, 800, 500], fill=(70,90,110), outline=(40,55,70), width=6, radius=24)
        rrect(d, [150, 520, 780, 880], fill=(225,225,225), outline=(150,150,150), width=4, radius=10)
        drops = ['大','小','小','大','小']
        for i, sizeC in enumerate(drops):
            r = 34 if sizeC == '大' else 18
            cx = 230 + i*120
            d.ellipse([cx-r, 660-r, cx+r, 660+r], fill=(120,150,200))
        label(d, 460, 800, 'マットレスをめくる ▼', fill=GOLD)
    return img

def w2_mattress(stage=0):
    # stage 0: 通常, 1: パターン入力可, 2: パネル数cmスライド, 3: 完全に開いて隠し収納
    img, d = new_canvas((26,26,30))
    title(img, d, 'マットレス下 - 金属パネル')
    rrect(d, [180, 250, 720, 950], fill=(55,58,64), outline=METAL, width=6, radius=10)
    if stage <= 1:
        for r in range(3):
            for c in range(3):
                cx, cy = 300 + c*150, 400 + r*150
                d.ellipse([cx-14,cy-14,cx+14,cy+14], fill=(100,105,112))
        label(d, 450, 900, 'ドラッグで一筆書き')
    elif stage == 2:
        rrect(d, [230, 250, 770, 950], fill=(55,58,64), outline=GOLD, width=6, radius=10)
        label(d, 450, 900, 'パネルが数cmずれた ▼タップ', fill=GOLD)
    else:
        rrect(d, [180, 250, 380, 950], fill=(20,20,24))
        rrect(d, [420, 500, 620, 650], fill=(15,16,20), outline=(60,60,60), width=3)
        d.rectangle([460, 540, 580, 600], fill=(150,150,155))
        label(d, 520, 680, 'L字レンチ')
    return img

def w2_frame(done=False):
    img, d = new_canvas()
    title(img, d, 'ベッドフレーム')
    d.rectangle([100, 500, 800, 600], fill=(60,64,70), outline=METAL, width=4)
    if not done:
        d.ellipse([420, 520, 480, 580], fill=(40,40,44), outline=(80,80,80), width=3)
        label(d, 450, 650, 'ボルト')
    else:
        d.rectangle([380, 500, 520, 600], fill=(15,16,20))
        label(d, 450, 650, '補強棒が外れた', fill=GOLD)
    return img

def w2_wall(rubbed=False):
    img, d = new_canvas((40,42,46))
    title(img, d, 'ベッド上の壁')
    rrect(d, [140, 250, 760, 850], fill=(46,49,54), outline=(60,63,68), width=3, radius=8)
    if not rubbed:
        label(d, 450, 900, '肉眼ではよく読めない')
    else:
        rrect(d, [180, 300, 720, 800], fill=(235,232,225))
        fs = font(46)
        marks = ['月','太陽','波','雷']
        for i, m in enumerate(marks):
            d.text((260 + i*110, 520), m, font=fs, fill=(70,70,75))
        label(d, 450, 850, '月→太陽→波→雷', fill=GOLD)
    return img

# ---------------------------------------------------------------
# WALL_3 トイレ・手洗い
# ---------------------------------------------------------------
def wall3():
    img, d = new_canvas()
    title(img, d, 'WALL 3 - トイレ・手洗い')
    rrect(d, [70, 240, 340, 660], fill=(60,64,70), outline=METAL, width=4, radius=10)
    label(d, 205, 700, '手洗い・鏡')
    rrect(d, [500, 540, 850, 940], fill=(210,212,214), outline=(150,152,155), width=4, radius=20)
    label(d, 675, 970, 'トイレ')
    rrect(d, [380, 660, 520, 850], fill=(230,228,220), outline=(150,150,140), width=3, radius=8)
    label(d, 450, 880, 'ペーパー')
    rrect(d, [60, 900, 280, 1080], fill=(50,54,58), outline=(70,74,80), width=3, radius=8)
    label(d, 170, 1000, '清掃用品')
    return img

def w3_sink():
    img, d = new_canvas()
    title(img, d, '手洗い')
    rrect(d, [230, 100, 680, 560], fill=(180,190,200), outline=(120,128,138), width=6, radius=8)
    label(d, 450, 300, '鏡')
    rrect(d, [330, 620, 660, 900], fill=(210,212,214), outline=(150,150,155), width=4, radius=16)
    label(d, 495, 800, '蛇口')
    return img

def w3_mirror(state='dirty'):
    img, d = new_canvas((18,20,24))
    title(img, d, '鏡')
    rrect(d, [120, 150, 780, 1000], fill=(150,158,165), outline=METAL, width=6, radius=10)
    if state == 'dirty':
        for i in range(40):
            import random
            random.seed(i)
            x, y = random.randint(140, 760), random.randint(170, 980)
            d.ellipse([x, y, x+18, y+10], fill=(90,85,70))
        label(d, 450, 1050, '汚れている')
    else:
        import random
        random.seed(3)
        fixed = {2: 2, 8: 4, 14: 1, 19: 3}
        for i in range(20):
            x = 160 + i * 31
            hgt = fixed.get(i, random.randint(1, 4))
            barh = hgt * 90
            color = (230, 210, 140) if (state == 'core' and i not in fixed) else (200, 205, 210)
            if state == 'core' and i not in fixed:
                continue
            d.rectangle([x, 950 - barh, x + 18, 950], fill=(200,205,210) if state != 'core' else (230,210,140))
        if state == 'piece_removed':
            d.rectangle([680, 170, 780, 280], fill=(18,20,24))
            label(d, 730, 320, '鏡片を回収済み', fill=GOLD)
        elif state == 'core':
            label(d, 450, 1050, '4本だけ見える：高さ 2・4・1・3', fill=GOLD)
        else:
            label(d, 450, 1050, '棒グラフのような模様')
            d.rounded_rectangle([700,170,780,260], radius=6, outline=ACCENT, width=3)
            label(d, 740, 300, '留め具')
    return img

def w3_faucet(handle_taken=False):
    img, d = new_canvas()
    title(img, d, '蛇口')
    rrect(d, [200, 780, 700, 1000], fill=(200,204,208), outline=METAL, width=4, radius=16)
    label(d, 450, 250, '高さ表示板×4')
    for i in range(4):
        cx = 150 + i*200
        rrect(d, [cx, 320, cx+160, 480], fill=(40,42,46), outline=(70,72,76), width=3, radius=6)
        rrect(d, [cx+40, 560, cx+120, 620], fill=(90,95,100), outline=(50,52,56), width=2, radius=6)
    if handle_taken:
        d.ellipse([400, 800, 500, 900], fill=(20,20,24))
        label(d, 450, 940, 'ハンドルは外れている', fill=GOLD)
    else:
        d.ellipse([400, 800, 500, 900], fill=(170,150,90), outline=(110,95,55), width=4)
        label(d, 450, 940, 'ハンドル')
    return img

def w3_toilet(solved=False):
    img, d = new_canvas()
    title(img, d, 'トイレ横')
    rrect(d, [180, 260, 720, 760], fill=(215,217,219), outline=(150,152,155), width=4, radius=30)
    rrect(d, [150, 400, 260, 520], fill=(90,95,100), outline=(50,52,56), width=3, radius=10)
    label(d, 205, 460, '「大」')
    rrect(d, [350, 400, 460, 520], fill=(90,95,100), outline=(50,52,56), width=3, radius=10)
    label(d, 405, 460, '「小」')
    if solved:
        rrect(d, [420, 620, 560, 720], fill=(20,20,24), outline=GOLD, width=3, radius=8)
        label(d, 490, 750, '小さな鍵はここに', fill=GOLD)
    else:
        rrect(d, [420, 620, 560, 720], fill=(140,142,146), outline=(90,92,96), width=3, radius=8)
        label(d, 490, 750, '金属カバー')
    return img

def w3_toilet_paper(used_up=False):
    img, d = new_canvas((22,24,28))
    title(img, d, 'トイレットペーパー')
    if not used_up:
        d.ellipse([300, 300, 600, 700], fill=(235,233,225), outline=(150,148,140), width=5)
        d.ellipse([420, 420, 480, 580], fill=(60,60,60))
        label(d, 450, 750, 'タップして紙を取る')
    else:
        d.ellipse([420, 420, 480, 580], fill=(140,110,80), outline=(90,70,50), width=4)
        label(d, 450, 650, '芯だけが残った', fill=GOLD)
    return img

def w3_cleaning():
    img, d = new_canvas()
    title(img, d, '清掃用品')
    rrect(d, [300, 300, 600, 900], fill=(60,64,70), outline=METAL, width=4, radius=10)
    d.rectangle([360, 500, 540, 620], fill=(210,205,190))
    label(d, 450, 700, '布')
    return img

# ---------------------------------------------------------------
# WALL_4 机・イス
# ---------------------------------------------------------------
def wall4():
    img, d = new_canvas()
    title(img, d, 'WALL 4 - 机・イス')
    rrect(d, [80, 340, 350, 700], fill=(30,32,36), outline=(50,53,58), width=3, radius=8)
    label(d, 90, 320, '通気口')
    rrect(d, [200, 40, 600, 180], fill=(35,38,44), outline=(55,58,64), width=3, radius=8)
    rrect(d, [90, 480, 540, 700], fill=(110,80,55), outline=(70,50,35), width=4, radius=8)
    label(d, 315, 590, '机（引き出し・机上）')
    rrect(d, [550, 540, 800, 1040], fill=(120,90,60), outline=(80,60,40), width=4, radius=10)
    label(d, 675, 800, 'イス')
    return img

def w4_drawer(open_=False):
    img, d = new_canvas()
    title(img, d, '引き出し')
    rrect(d, [150, 300, 750, 700], fill=(110,80,55), outline=(70,50,35), width=5, radius=8)
    if not open_:
        d.ellipse([420, 460, 480, 520], fill=(40,40,40))
        label(d, 450, 620, '鍵がかかっている')
    else:
        rrect(d, [200, 500, 700, 780], fill=(40,30,22))
        d.rectangle([380, 560, 520, 660], fill=(150,150,155))
        label(d, 450, 820, 'プレートA', fill=GOLD)
    return img

def w4_desk_under():
    img, d = new_canvas((26,26,30))
    title(img, d, '机の下 - 引っかき傷')
    seq = ['○','△','★','◇','◎','＋','□','▽']
    fs = font(46)
    for i, s in enumerate(seq):
        r, c = divmod(i, 4)
        d.text((150 + c*170, 400 + r*200), s, font=fs, fill=(150,150,155))
        if i < len(seq)-1:
            d.text((150 + c*170 + 90, 400 + r*200+8), '→' if c < 3 else '', font=font(30), fill=(90,90,95))
    return img

def w4_desktop():
    img, d = new_canvas()
    title(img, d, '机上')
    rrect(d, [100, 400, 800, 900], fill=(110,80,55), outline=(70,50,35), width=4, radius=8)
    d.line([300,600,460,560], fill=(200,180,120), width=10)
    label(d, 380, 640, '鉛筆')
    return img

def w4_chair(state='normal'):
    img, d = new_canvas()
    title(img, d, 'イス')
    if state == 'normal':
        rrect(d, [250, 200, 650, 500], fill=(120,90,60), outline=(80,60,40), width=4, radius=10)
        for x in [280, 600]:
            d.rectangle([x, 500, x+40, 1000], fill=(100,75,50))
        label(d, 450, 1050, 'タップして裏返す')
    else:
        rrect(d, [200, 300, 700, 650], fill=(90,70,48), outline=(60,45,30), width=4, radius=10)
        legs = [('leftFront','月',270,780),('rightFront','波',630,780),('leftBack','雷',270,950),('rightBack','太陽',630,950)]
        for key, sym, x, y in legs:
            d.ellipse([x-50,y-50,x+50,y+50], fill=(60,45,30), outline=(30,22,15), width=3)
            w = d.textlength(sym, font=font(34))
            d.text((x-w/2, y-20), sym, font=font(34), fill=(220,215,200))
        if state == 'solved':
            label(d, 450, 700, '座面裏の仕掛けが外れた', fill=GOLD)
            d.ellipse([420, 460, 480, 520], fill=(150,150,155))
        else:
            label(d, 450, 1080, '左前→右後ろ→右前→左後ろ の順に押す（ヒント参照）', fill=(90,95,100))
    return img

def w4_upper(mirror=False):
    img, d = new_canvas((20,22,26))
    title(img, d, '壁上部 - 通気口')
    rrect(d, [220, 400, 680, 650], fill=(35,38,44), outline=(55,58,64), width=4, radius=8)
    for x in range(250, 660, 40):
        d.rectangle([x, 430, x+18, 620], fill=(20,22,26))
    if mirror:
        label(d, 450, 720, '死角に鍵が見える', fill=GOLD)
    else:
        label(d, 450, 720, '奥は暗く見えない')
    return img

# ---------------------------------------------------------------
# UI用ダミー
# ---------------------------------------------------------------
def ui_missing():
    img, d = new_canvas((30,10,10))
    title(img, d, '画像読み込みエラー')
    label(d, 450, 600, 'image not found')
    save(img, 'ui/missing.webp')

def ui_missing_item():
    img = Image.new('RGBA', (200,200), (0,0,0,0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([10,10,190,190], radius=16, outline=(200,80,80,255), width=6)
    save(img, 'ui/missing_item.png')

# ---------------------------------------------------------------
# アイテムアイコン
# ---------------------------------------------------------------
def item_icon(name, draw_fn):
    img = Image.new('RGBA', (240, 240), (0,0,0,0))
    d = ImageDraw.Draw(img)
    draw_fn(d)
    save(img, f'items/{name}.png')

def run_items():
    item_icon('pencil', lambda d: (d.rectangle([60,40,100,190], fill=(220,190,110)), d.polygon([(60,190),(100,190),(80,225)], fill=(90,60,40))))
    item_icon('cloth', lambda d: d.rounded_rectangle([40,60,200,180], radius=12, fill=(210,205,190), outline=(150,145,130), width=4))
    item_icon('cloth_wet', lambda d: d.rounded_rectangle([40,60,200,180], radius=12, fill=(150,175,200), outline=(100,130,160), width=4))
    item_icon('toilet_paper', lambda d: (d.ellipse([50,50,190,190], fill=(235,233,225), outline=(150,148,140), width=5), d.ellipse([100,100,140,140], fill=(60,60,60))))
    item_icon('toilet_paper_core', lambda d: d.ellipse([90,90,150,150], fill=(140,110,80), outline=(90,70,50), width=5))
    item_icon('toilet_paper_core_open', lambda d: d.rounded_rectangle([40,90,200,150], radius=8, fill=(200,170,130), outline=(130,100,70), width=4))
    item_icon('string', lambda d: d.line([40,200,90,150,60,110,140,90,110,50,200,40], fill=(210,190,150), width=6, joint='curve'))
    item_icon('wrench', lambda d: (d.rectangle([100,60,140,180], fill=(170,175,180)), d.ellipse([80,40,160,90], outline=(170,175,180), width=14)))
    item_icon('rod', lambda d: d.rectangle([110,30,130,210], fill=(150,155,160), outline=(100,104,108), width=3))
    item_icon('hook', lambda d: d.arc([80,60,180,190], start=30, end=320, fill=(150,155,160), width=14))
    item_icon('rod_hook', lambda d: (d.rectangle([110,30,130,180], fill=(150,155,160)), d.arc([80,140,180,220], start=30, end=320, fill=(150,155,160), width=12)))
    item_icon('rod_hook_string', lambda d: (d.rectangle([110,20,130,140], fill=(150,155,160)), d.arc([80,120,180,190], start=30, end=320, fill=(150,155,160), width=10), d.line([130,190,150,220,140,235],fill=(210,190,150), width=5)))
    item_icon('magnet_part', lambda d: (d.rectangle([70,90,170,160], fill=(90,95,100), outline=(50,52,56), width=4), d.rectangle([90,110,150,140], fill=(190,60,60))))
    item_icon('retrieval_rod', lambda d: (d.rectangle([100,20,120,120], fill=(150,155,160)), d.arc([70,100,170,170], start=30, end=320, fill=(150,155,160), width=10), d.line([120,170,140,195], fill=(210,190,150), width=5), d.rectangle([110,195,160,230], fill=(90,95,100))))
    item_icon('small_key', lambda d: (d.ellipse([50,50,110,110], outline=(210,190,110), width=10), d.rectangle([100,72,190,90], fill=(210,190,110)), d.rectangle([160,90,175,110], fill=(210,190,110))))
    item_icon('faucet_handle', lambda d: (d.ellipse([70,70,170,170], outline=(180,155,90), width=14), d.rectangle([110,20,130,70], fill=(180,155,90))))
    item_icon('mirror_piece', lambda d: d.polygon([(60,60),(180,80),(160,190),(70,170)], fill=(190,200,210), outline=(120,128,138)))
    item_icon('cell_key', lambda d: (d.ellipse([40,90,110,160], outline=(200,175,90), width=12), d.rectangle([100,115,200,135], fill=(200,175,90)), d.rectangle([170,135,190,160], fill=(200,175,90)), d.rectangle([170,105,190,120], fill=(200,175,90))))
    item_icon('plate_a', lambda d: d.rounded_rectangle([50,80,190,160], radius=10, fill=(120,130,140), outline=(80,88,96), width=4))

# ---------------------------------------------------------------
def main():
    init_fonts()
    run_wall1()
    save(w1_door(False), 'zoom/w1_door.webp')
    save(w1_door(True), 'zoom/w1_door_open.webp')
    save(w1_lock(), 'zoom/w1_lock.webp')
    save(w1_symbols(), 'zoom/w1_symbols.webp')

    save(wall2(), 'walls/wall_2.webp')
    save(w2_bed_under(True), 'zoom/w2_bed_under.webp')
    save(w2_pillow(False), 'zoom/w2_pillow.webp')
    save(w2_pillow(True), 'zoom/w2_pillow_lifted.webp')
    save(w2_blanket(False), 'zoom/w2_blanket.webp')
    save(w2_blanket(True), 'zoom/w2_blanket_open.webp')
    save(w2_mattress(0), 'zoom/w2_mattress.webp')
    save(w2_mattress(2), 'zoom/w2_mattress_slid.webp')
    save(w2_mattress(3), 'zoom/w2_mattress_open.webp')
    save(w2_frame(False), 'zoom/w2_frame.webp')
    save(w2_frame(True), 'zoom/w2_frame_open.webp')
    save(w2_wall(False), 'zoom/w2_wall.webp')
    save(w2_wall(True), 'zoom/w2_wall_rubbed.webp')

    save(wall3(), 'walls/wall_3.webp')
    save(w3_sink(), 'zoom/w3_sink.webp')
    save(w3_mirror('dirty'), 'zoom/w3_mirror_dirty.webp')
    save(w3_mirror('clean'), 'zoom/w3_mirror_clean.webp')
    save(w3_mirror('core'), 'zoom/w3_mirror_core.webp')
    save(w3_mirror('piece_removed'), 'zoom/w3_mirror_piece_removed.webp')
    save(w3_faucet(False), 'zoom/w3_faucet.webp')
    save(w3_faucet(True), 'zoom/w3_faucet_handle_taken.webp')
    save(w3_toilet(False), 'zoom/w3_toilet_side.webp')
    save(w3_toilet(True), 'zoom/w3_toilet_solved.webp')
    save(w3_toilet_paper(False), 'zoom/w3_toilet_paper.webp')
    save(w3_toilet_paper(True), 'zoom/w3_toilet_paper_core.webp')
    save(w3_cleaning(), 'zoom/w3_cleaning.webp')

    save(wall4(), 'walls/wall_4.webp')
    save(w4_drawer(False), 'zoom/w4_drawer_closed.webp')
    save(w4_drawer(True), 'zoom/w4_drawer_open.webp')
    save(w4_desk_under(), 'zoom/w4_desk_under.webp')
    save(w4_desktop(), 'zoom/w4_desktop.webp')
    save(w4_chair('normal'), 'zoom/w4_chair.webp')
    save(w4_chair('back'), 'zoom/w4_chair_back.webp')
    save(w4_chair('solved'), 'zoom/w4_chair_solved.webp')
    save(w4_upper(False), 'zoom/w4_upper.webp')
    save(w4_upper(True), 'zoom/w4_upper_mirror.webp')

    ui_missing()
    ui_missing_item()
    run_items()

if __name__ == '__main__':
    main()
