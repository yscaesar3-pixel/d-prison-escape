"""
STAGE2「廊下」仮画像生成スクリプト（プロトタイプ用）。
STAGE1のgen_images.py・assets/images/cell/ は一切変更しない。
出力先: assets/images/corridor/ のみ。
"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.join(os.path.dirname(__file__), 'assets', 'images', 'corridor')
W, H = 900, 1200

WALL_BG = (30, 33, 39)
METAL = (120, 128, 138)
METAL_DARK = (70, 77, 86)
ACCENT = (170, 190, 205)
GOLD = (215, 190, 110)
RED = (200, 90, 80)
DARK = (14, 16, 20)

def font(size=28):
    for path in [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size, index=0)
            except Exception:
                pass
    return ImageFont.load_default()

F_TITLE = None
F_LABEL = None

def init_fonts():
    global F_TITLE, F_LABEL
    F_TITLE = font(28)
    F_LABEL = font(22)

def new_canvas(bg=WALL_BG):
    img = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(img)
    for i in range(0, H, 6):
        shade = 4 if (i // 6) % 2 == 0 else 0
        d.line([(0, i), (W, i)], fill=tuple(min(255, c + shade) for c in bg), width=2)
    return img, d

def title(img, d, text):
    d.rectangle([0, 0, W, 44], fill=(8, 9, 12))
    d.text((14, 8), text, font=F_TITLE, fill=(150, 165, 178))

def label(d, cx, cy, text, fill=ACCENT):
    w = d.textlength(text, font=F_LABEL)
    d.rectangle([cx - w / 2 - 8, cy - 16, cx + w / 2 + 8, cy + 16], fill=(10, 11, 14))
    d.text((cx - w / 2, cy - 13), text, font=F_LABEL, fill=fill)

def rrect(d, box, fill=None, outline=None, radius=10, width=3):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def save(img, relpath):
    full = os.path.join(BASE, relpath)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if full.lower().endswith('.webp'):
        img.save(full, 'WEBP', quality=88)
    else:
        img.save(full, 'PNG')
    print('saved', relpath)

# ---------------------------------------------------------------
# 廊下：奥行きのある通路パース（左右の壁が奥へすぼまる簡易パース）
# ---------------------------------------------------------------
def corridor_perspective(title_text, forward_label='奥へ進む', has_back=False, floor_no=''):
    img, d = new_canvas((26, 28, 33))
    title(img, d, title_text)
    # 床
    d.polygon([(0, H), (W, H), (620, 720), (280, 720)], fill=(20, 21, 25))
    # 天井
    d.polygon([(0, 60), (W, 60), (620, 300), (280, 300)], fill=(18, 19, 23))
    # 左壁
    d.polygon([(0, 60), (280, 300), (280, 720), (0, H)], fill=(38, 41, 47))
    # 右壁
    d.polygon([(W, 60), (620, 300), (620, 720), (W, H)], fill=(34, 37, 43))
    # 奥壁
    rrect(d, [280, 300, 620, 720], fill=(24, 26, 31), outline=METAL_DARK, width=4, radius=6)
    label(d, 450, 500, forward_label, GOLD)
    # 通路番号
    if floor_no:
        label(d, 450, 90, floor_no, ACCENT)
    label(d, 90, 620, '左へ')
    label(d, 810, 620, '右へ')
    if has_back:
        label(d, 450, 1080, '手前へ戻る', fill=(140, 145, 150))
    # 天井照明
    for cx in (450,):
        d.ellipse([cx - 40, 140, cx + 40, 170], fill=(60, 62, 55))
    return img

def side_room(title_text, cell_no, pillow_side):
    img, d = new_canvas((28, 30, 35))
    title(img, d, title_text)
    rrect(d, [140, 200, 760, 950], fill=(22, 24, 28), outline=METAL, width=5, radius=10)
    label(d, 450, 240, f'牢屋 {cell_no}', GOLD)
    if pillow_side:
        bed_x = 250 if pillow_side == 'left' else 480
        rrect(d, [bed_x, 500, bed_x + 170, 820], fill=(45, 48, 54), outline=METAL_DARK, width=3, radius=8)
        pillow_x = bed_x if pillow_side == 'left' else bed_x + 170 - 70
        d.ellipse([pillow_x, 520, pillow_x + 70, 580], fill=(200, 195, 180))
        label(d, 450, 870, f'枕は{"左" if pillow_side == "left" else "右"}側', ACCENT)
    else:
        label(d, 450, 620, 'ベッドはない', RED)
    label(d, 450, 1000, '廊下へ戻る')
    return img

def cell_front(cell_no, pillow_side):
    img, d = new_canvas((20, 22, 26))
    title(img, d, f'牢屋{cell_no} 正面')
    rrect(d, [100, 120, 800, 1080], fill=(26, 28, 33), outline=METAL, width=5, radius=10)
    if pillow_side:
        bed_x = 180 if pillow_side == 'left' else 460
        rrect(d, [bed_x, 400, bed_x + 260, 850], fill=(50, 54, 60), outline=METAL_DARK, width=4, radius=10)
        pillow_x = bed_x + (0 if pillow_side == 'left' else 260 - 100)
        d.ellipse([pillow_x, 430, pillow_x + 100, 500], fill=(205, 200, 185), outline=(150, 145, 130), width=3)
        label(d, 450, 950, f'枕は{"左" if pillow_side == "left" else "右"}側にある', GOLD)
    else:
        label(d, 450, 600, 'この牢屋にはベッドがない', RED)
    return img

# ---------------------------------------------------------------
def run():
    init_fonts()

    save(corridor_perspective('CORRIDOR 1', floor_no='廊下 1'), 'walls/corridor_1.webp')
    save(side_room('廊下1・左', 1, 'right'), 'walls/corridor_1_left.webp')
    save(side_room('廊下1・右', 2, 'right'), 'walls/corridor_1_right.webp')

    save(corridor_perspective('CORRIDOR 2', has_back=True, floor_no='廊下 2'), 'walls/corridor_2.webp')
    img, d = new_canvas((28, 30, 35))
    title(img, d, '廊下2・左')
    rrect(d, [420, 200, 800, 950], fill=(22, 24, 28), outline=METAL, width=5, radius=10)
    label(d, 610, 240, '牢屋 3', GOLD)
    rrect(d, [500, 500, 660, 820], fill=(45, 48, 54), outline=METAL_DARK, width=3, radius=8)
    d.ellipse([500, 520, 570, 580], fill=(200, 195, 180))
    rrect(d, [60, 560, 300, 900], fill=(55, 58, 64), outline=METAL, width=5, radius=8)
    label(d, 180, 620, '金属製ボックス', ACCENT)
    label(d, 610, 1000, '廊下へ戻る')
    save(img, 'walls/corridor_2_left.webp')

    img, d = new_canvas((28, 30, 35))
    title(img, d, '廊下2・左（ボックス開放後）')
    rrect(d, [420, 200, 800, 950], fill=(22, 24, 28), outline=METAL, width=5, radius=10)
    label(d, 610, 240, '牢屋 3', GOLD)
    rrect(d, [500, 500, 660, 820], fill=(45, 48, 54), outline=METAL_DARK, width=3, radius=8)
    rrect(d, [60, 560, 300, 900], fill=(55, 58, 64), outline=GOLD, width=5, radius=8)
    label(d, 180, 620, 'ボックス（開放済み）', GOLD)
    label(d, 610, 1000, '廊下へ戻る')
    save(img, 'walls/corridor_2_left_box_open.webp')

    save(side_room('廊下2・右', 4, None), 'walls/corridor_2_right.webp')

    save(corridor_perspective('CORRIDOR 3', has_back=True, forward_label='正面へ進む', floor_no='廊下 3'), 'walls/corridor_3.webp')
    save(side_room('廊下3・左', 5, 'left'), 'walls/corridor_3_left.webp')
    save(side_room('廊下3・右', 6, 'right'), 'walls/corridor_3_right.webp')

    for cno, side in [(1, 'right'), (2, 'right'), (3, 'left'), (4, None), (5, 'left'), (6, 'right')]:
        save(cell_front(cno, side), f'zoom/cell_{cno}_front.webp')

    # ---- ベッド入力ボックス ----
    img, d = new_canvas((22, 24, 28))
    title(img, d, '金属製ボックス')
    rrect(d, [150, 150, 750, 950], fill=(45, 48, 54), outline=METAL, width=6, radius=12)
    label(d, 450, 200, '廊下3 ▲', ACCENT)
    for r in range(3):
        for c in range(2):
            x = 270 + c * 210
            y = 220 + r * 220
            rrect(d, [x, y, x + 170, y + 150], fill=(25, 27, 31), outline=METAL_DARK, width=3, radius=8)
    label(d, 450, 470, '廊下2 ▲', ACCENT)
    label(d, 450, 690, '廊下1 ▲', ACCENT)
    rrect(d, [310, 900, 610, 1020], fill=(60, 63, 69), outline=GOLD, width=3, radius=8)
    label(d, 460, 960, '決定', GOLD)
    save(img, 'zoom/bed_box_closed.webp')

    img, d = new_canvas((22, 24, 28))
    title(img, d, 'ボックス内部')
    rrect(d, [120, 120, 780, 1080], fill=(30, 32, 37), outline=GOLD, width=5, radius=10)
    rrect(d, [270, 180, 630, 400], fill=(50, 40, 30), outline=(90, 70, 45), width=3, radius=8)
    label(d, 450, 290, 'プレートB', GOLD)
    label(d, 450, 470, 'A=4 H=7 K=1 M=5', ACCENT)
    label(d, 450, 520, 'S=2 T=8 Y=9', ACCENT)
    for i in range(3):
        x = 300 + i * 130
        rrect(d, [x, 750, x + 100, 900], fill=(20, 21, 25), outline=METAL, width=3, radius=8)
    rrect(d, [330, 940, 570, 1030], fill=(60, 63, 69), outline=METAL, width=3, radius=8)
    label(d, 450, 985, '決定', ACCENT)
    save(img, 'zoom/bed_box_open.webp')

    # ---- 看守室前 ----
    for state_name, board_color, door_color in [
        ('off', (40, 42, 46), (60, 45, 32)),
        ('on', (40, 42, 46), (60, 45, 32)),
        ('open', (40, 42, 46), (25, 24, 22)),
    ]:
        img, d = new_canvas((24, 26, 30))
        title(img, d, f'看守室前（{state_name}）')
        rrect(d, [90, 260, 470, 950], fill=door_color, outline=METAL_DARK, width=5, radius=8)
        if state_name == 'open':
            d.rectangle([90, 260, 260, 950], fill=(15, 16, 19))
            label(d, 280, 1000, '扉は開いている', GOLD)
        else:
            label(d, 280, 1000, '看守室の扉', ACCENT)
        rrect(d, [500, 220, 850, 460], fill=board_color, outline=METAL, width=4, radius=8)
        if state_name != 'off':
            for i in range(4):
                x = 540 + i * 75
                d.rectangle([x, 280, x + 45, 400], fill=(90, 20, 15))
            label(d, 675, 430, '電光掲示板（点灯）', RED)
        else:
            label(d, 675, 430, '電光掲示板（消灯）', (90, 92, 96))
        label(d, 780, 480, 'HTS-117', (110, 112, 116))
        rrect(d, [600, 680, 850, 970], fill=(45, 48, 54), outline=METAL, width=4, radius=8)
        label(d, 725, 720, 'テンキー', ACCENT)
        label(d, 450, 1080, '廊下3へ戻る', (140, 145, 150))
        save(img, f'walls/guard_wall_{state_name}.webp')

    img, d = new_canvas((18, 20, 24))
    title(img, d, '電光掲示板（消灯）')
    rrect(d, [130, 350, 770, 750], fill=(30, 30, 33), outline=METAL, width=6, radius=10)
    label(d, 450, 550, '消えている', (90, 92, 96))
    save(img, 'zoom/guard_board_off.webp')

    img, d = new_canvas((18, 20, 24))
    title(img, d, '電光掲示板（点灯）')
    rrect(d, [130, 350, 770, 750], fill=(35, 20, 18), outline=RED, width=6, radius=10)
    label(d, 450, 700, '（実際の数字表示はゲーム内で描画）', (150, 100, 95))
    save(img, 'zoom/guard_board_on.webp')

    img, d = new_canvas((20, 22, 26))
    title(img, d, '製造番号プレート')
    rrect(d, [150, 400, 750, 700], fill=(40, 42, 46), outline=METAL, width=5, radius=8)
    fs = font(70)
    txt = 'HTS-117'
    w = d.textlength(txt, font=fs)
    d.text((450 - w / 2, 500), txt, font=fs, fill=(200, 205, 210))
    save(img, 'zoom/guard_serial_zoom.webp')

    img, d = new_canvas((22, 24, 28))
    title(img, d, '看守室テンキー')
    rrect(d, [150, 100, 750, 1080], fill=(35, 38, 44), outline=METAL, width=5, radius=10)
    keys = ['1','2','3','4','5','6','7','8','9','C','0','E']
    for i, k in enumerate(keys):
        r, c = divmod(i, 3)
        x = 230 + c * 153
        y = 280 + r * 165
        broken = k in ('5', '6')
        fill = (30, 20, 20) if broken else (55, 58, 64)
        outline = RED if broken else METAL
        rrect(d, [x, y, x + 135, y + 117], fill=fill, outline=outline, width=3, radius=8)
        fs = font(40)
        w = d.textlength(k, font=fs)
        d.text((x + 67 - w / 2, y + 38), k, font=fs, fill=(150, 90, 85) if broken else (210, 213, 216))
    save(img, 'zoom/guard_keypad.webp')

    img, d = new_canvas((15, 16, 19))
    title(img, d, '看守室（STAGE3未実装）')
    label(d, 450, 600, 'ここまで実装済み', GOLD)
    label(d, 450, 650, '（続きは今後のアップデートで実装予定）', (140, 145, 150))
    save(img, 'ui/guard_room_placeholder.webp')

    # ---- アイテム：プレートB ----
    item = Image.new('RGBA', (240, 240), (0, 0, 0, 0))
    d = ImageDraw.Draw(item)
    d.rounded_rectangle([50, 80, 190, 160], radius=10, fill=(130, 110, 90), outline=(90, 70, 55), width=4)
    save(item, 'items/plate_b.png')

if __name__ == '__main__':
    run()
