"""
STAGE3「看守室」仮画像生成スクリプト（プロトタイプ用）。
STAGE1/2のgen_images.py・gen_corridor_images.py・既存assetsは一切変更しない。
出力先: assets/images/guard_room/ のみ。
"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.join(os.path.dirname(__file__), 'assets', 'images', 'guard_room')
W, H = 900, 1200

WALL_BG = (32, 34, 38)
METAL = (120, 128, 138)
METAL_DARK = (70, 77, 86)
ACCENT = (170, 190, 205)
GOLD = (215, 190, 110)
RED = (200, 90, 80)
WOOD = (110, 80, 55)

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

def label(d, cx, cy, text, fill=ACCENT, f=None):
    f = f or F_LABEL
    w = d.textlength(text, font=f)
    d.rectangle([cx - w / 2 - 8, cy - 16, cx + w / 2 + 8, cy + 16], fill=(10, 11, 14))
    d.text((cx - w / 2, cy - 13), text, font=f, fill=fill)

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

def item_icon(name, draw_fn):
    img = Image.new('RGBA', (240, 240), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_fn(d)
    save(img, f'items/{name}.png')

# ---------------------------------------------------------------
def run():
    init_fonts()

    # ---- GUARD_ROOM_1: 出入口ドア・時計・勤務表 ----
    img, d = new_canvas()
    title(img, d, 'GUARD ROOM 1')
    rrect(d, [270, 200, 630, 950], fill=(35, 26, 20), outline=METAL_DARK, width=5, radius=8)
    label(d, 450, 240, '出入口ドア', ACCENT)
    rrect(d, [640, 220, 830, 400], fill=(40, 42, 46), outline=METAL, width=4, radius=100)
    d.ellipse([690, 260, 780, 350], outline=(210, 213, 216), width=4)
    d.line([735, 305, 735, 275], fill=(210, 213, 216), width=4)
    d.line([735, 305, 760, 320], fill=(210, 213, 216), width=3)
    label(d, 735, 380, '11:25', GOLD)
    rrect(d, [640, 460, 830, 700], fill=(230, 228, 220), outline=(150, 150, 140), width=3, radius=6)
    label(d, 735, 480, '勤務表', (60, 60, 60))
    save(img, 'walls/guard_room_1.webp')

    img, d = new_canvas()
    title(img, d, 'GUARD ROOM 1（扉開放後）')
    rrect(d, [270, 200, 630, 950], fill=(15, 16, 19))
    label(d, 450, 500, '扉は開いている', GOLD)
    save(img, 'walls/guard_room_1_open.webp')

    # ---- GUARD_ROOM_2: 机・引き出し・電話・書類 ----
    img, d = new_canvas()
    title(img, d, 'GUARD ROOM 2')
    rrect(d, [200, 560, 700, 900], fill=WOOD, outline=(70, 50, 35), width=4, radius=8)
    label(d, 450, 620, 'ロック付き引き出し', ACCENT)
    rrect(d, [130, 320, 280, 480], fill=(40, 42, 46), outline=METAL, width=3, radius=8)
    label(d, 205, 400, '電話')
    rrect(d, [640, 340, 800, 470], fill=(225, 222, 210), outline=(150, 150, 140), width=3, radius=6)
    label(d, 720, 400, '書類', (60, 60, 60))
    save(img, 'walls/guard_room_2.webp')

    # ---- GUARD_ROOM_3: 監視モニター一式 ----
    img, d = new_canvas()
    title(img, d, 'GUARD ROOM 3')
    rrect(d, [180, 200, 720, 850], fill=(20, 21, 25), outline=METAL, width=5, radius=10)
    label(d, 450, 500, '監視モニター一式', ACCENT)
    save(img, 'walls/guard_room_3.webp')

    # ---- GUARD_ROOM_4: ロッカー・鍵管理盤 ----
    img, d = new_canvas()
    title(img, d, 'GUARD ROOM 4')
    rrect(d, [90, 220, 400, 940], fill=(45, 48, 54), outline=METAL, width=4, radius=8)
    for i, ch in enumerate('ABCDE'):
        y = 260 + i * 130
        rrect(d, [110, y, 380, y + 110], outline=METAL_DARK, width=2, radius=4)
        label(d, 245, y + 55, f'ロッカー{ch}')
    rrect(d, [490, 220, 810, 940], fill=(35, 38, 44), outline=METAL, width=4, radius=8)
    label(d, 650, 260, '鍵管理盤', ACCENT)
    save(img, 'walls/guard_room_4.webp')

    # ---- 時計ズーム ----
    img, d = new_canvas((20, 22, 26))
    title(img, d, 'アナログ時計')
    d.ellipse([200, 300, 700, 800], outline=(210, 213, 216), width=8, fill=(30, 32, 36))
    d.line([450, 550, 450, 370], fill=(210, 213, 216), width=8)
    d.line([450, 550, 590, 610], fill=(210, 213, 216), width=6)
    label(d, 450, 900, '11時25分を指している', GOLD)
    save(img, 'zoom/guard_clock.webp')

    # ---- 勤務表ズーム（通常／プレート重ね） ----
    def schedule_table(with_plate):
        img, d = new_canvas((235, 232, 222) if False else (24, 26, 30))
        title(img, d, '勤務表' + ('＋穴あきプレート' if with_plate else ''))
        rrect(d, [80, 100, 820, 1100], fill=(230, 228, 218), outline=(150, 150, 140), width=4, radius=8)
        rows = ['①08:10-09:10', '②09:25-10:25', '③10:40-11:40', '④11:55-12:55', '⑤13:10-14:10']
        guards = 'A B C D E'.split()
        fs = font(22)
        for r, row in enumerate(rows):
            d.text((110, 150 + r * 180), row, font=fs, fill=(40, 40, 40))
        for c, g in enumerate(guards):
            d.text((300 + c * 100, 120), g, font=fs, fill=(40, 40, 40))
        if with_plate:
            rrect(d, [80, 100, 820, 1100], outline=RED, width=6, radius=8)
            fs2 = font(60)
            nums = '3719'
            for i, n in enumerate(nums):
                d.ellipse([200 + i * 130, 500, 280 + i * 130, 580], fill=(20, 20, 20))
                d.text((225 + i * 130, 510), n, font=fs2, fill=(255, 210, 90))
            label(d, 450, 950, '穴から 3 7 1 9 が見える', GOLD)
        else:
            label(d, 450, 950, '看守A〜Eの巡回時刻表', (80, 80, 80))
        return img
    save(schedule_table(False), 'zoom/guard_schedule.webp')
    save(schedule_table(True), 'zoom/guard_schedule_plate.webp')

    # ---- ロッカーズーム ----
    img, d = new_canvas((22, 24, 28))
    title(img, d, '看守A〜Eのロッカー')
    nums = {'A': 418, 'B': 263, 'C': 751, 'D': 684, 'E': 392}
    fs = font(34)
    for i, (k, v) in enumerate(nums.items()):
        x = 150 + (i % 3) * 260
        y = 250 + (i // 3) * 350
        rrect(d, [x, y, x + 200, y + 280], fill=(45, 48, 54), outline=METAL, width=4, radius=8)
        d.text((x + 70, y + 40), k, font=fs, fill=ACCENT)
        d.text((x + 40, y + 150), str(v), font=fs, fill=(210, 213, 216))
    save(img, 'zoom/guard_lockers.webp')

    # ---- 引き出し（謎①入力） ----
    img, d = new_canvas((22, 24, 28))
    title(img, d, 'ロック付き引き出し')
    rrect(d, [150, 150, 750, 700], fill=WOOD, outline=(70, 50, 35), width=5, radius=8)
    for i in range(3):
        x = 200 + i * 160
        rrect(d, [x, 380, x + 120, 520], fill=(20, 21, 25), outline=METAL, width=3, radius=8)
    rrect(d, [640, 380, 760, 520], fill=(20, 21, 25), outline=GOLD, width=3, radius=60)
    label(d, 450, 760, '3桁＋巡回区域を入力', ACCENT)
    save(img, 'zoom/guard_drawer_closed.webp')

    img, d = new_canvas((22, 24, 28))
    title(img, d, '引き出し（開放後）')
    rrect(d, [150, 150, 750, 950], fill=(40, 30, 22), outline=GOLD, width=5, radius=8)
    rrect(d, [220, 800, 420, 1000], fill=(150, 150, 155), outline=(90, 90, 95), width=3, radius=8)
    label(d, 320, 1030, '小鍵', GOLD)
    rrect(d, [500, 800, 700, 1000], fill=(225, 222, 210), outline=(150, 150, 140), width=3, radius=8)
    label(d, 600, 1030, '配置メモ', (60, 60, 60))
    save(img, 'zoom/guard_drawer_open.webp')

    # ---- 鍵管理盤（通常／隠し収納開放後） ----
    def keypanel(cabinet_open):
        img, d = new_canvas((24, 26, 30))
        title(img, d, '鍵管理盤' + ('（隠し収納OPEN）' if cabinet_open else ''))
        if cabinet_open:
            rrect(d, [320, 60, 580, 220], fill=(20, 21, 25), outline=GOLD, width=4, radius=8)
            label(d, 450, 140, '隠し収納', GOLD)
        else:
            rrect(d, [370, 60, 530, 180], fill=(45, 48, 54), outline=METAL, width=3, radius=6)
            label(d, 450, 110, '錠', ACCENT)
        for i in range(5):
            x = 60 + i * 165
            rrect(d, [x, 330, x + 130, 610], fill=(30, 32, 37), outline=METAL_DARK, width=3, radius=8)
        for i in range(5):
            x = 60 + i * 165
            rrect(d, [x, 850, x + 130, 1010], fill=(50, 54, 60), outline=METAL, width=3, radius=8)
        label(d, 450, 1060, '鍵立て（下）→フック（上）へ配置', (140, 145, 150))
        return img
    save(keypanel(False), 'zoom/guard_keypanel.webp')
    save(keypanel(True), 'zoom/guard_keypanel_cabinet_open.webp')

    # ---- 監視モニター一式 ----
    img, d = new_canvas((18, 20, 24))
    title(img, d, '監視モニター一式')
    for i in range(4):
        x = 80 + i * 190
        rrect(d, [x, 80, x + 170, 560], fill=(10, 10, 12), outline=METAL, width=3, radius=6)
        label(d, x + 85, 320, 'ABCD'[i], (90, 92, 96))
    for i in range(4):
        x = 80 + i * 190
        rrect(d, [x, 620, x + 170, 710], fill=(45, 48, 54), outline=METAL, width=3, radius=8)
        label(d, x + 85, 665, 'ABCD'[i], GOLD)
    rrect(d, [300, 780, 620, 900], fill=(30, 32, 36), outline=METAL, width=3, radius=8)
    label(d, 460, 815, 'チャンネル表示', ACCENT)
    rrect(d, [80, 900, 260, 1010], fill=(55, 58, 64), outline=METAL, width=3, radius=8)
    label(d, 170, 955, '切替', ACCENT)
    rrect(d, [640, 900, 820, 1010], fill=(55, 58, 64), outline=GOLD, width=3, radius=8)
    label(d, 730, 955, '決定', GOLD)
    rrect(d, [400, 1030, 500, 1120], fill=(20, 21, 25), outline=RED, width=3, radius=8)
    label(d, 450, 1150, 'ヒューズ差込口', RED)
    save(img, 'zoom/guard_monitors.webp')

    # ---- 迷路（6x6・壁を焼き込み） ----
    img, d = new_canvas((14, 15, 18))
    title(img, d, '特別モニター：迷路')
    ox, oy, size = 130, 90, 640
    cell = size / 6
    horizontalOpen = [
        [True, True, True, False, True],
        [False, True, False, True, False],
        [False, True, False, True, False],
        [False, False, True, False, True],
        [True, False, False, True, True],
        [False, True, True, False, True],
    ]
    verticalOpen = [
        [True, True, False, True, True, True],
        [True, False, True, False, False, True],
        [True, True, False, True, True, True],
        [False, True, True, False, False, False],
        [True, False, True, True, False, True],
    ]
    WALLC = (150, 155, 160)
    WALLW = 6
    # 外周
    d.rectangle([ox, oy, ox + size, oy + size], outline=WALLC, width=WALLW)
    for r in range(6):
        for c in range(5):
            if not horizontalOpen[r][c]:
                x = ox + (c + 1) * cell
                d.line([x, oy + r * cell, x, oy + (r + 1) * cell], fill=WALLC, width=WALLW)
    for r in range(5):
        for c in range(6):
            if not verticalOpen[r][c]:
                y = oy + (r + 1) * cell
                d.line([ox + c * cell, y, ox + (c + 1) * cell, y], fill=WALLC, width=WALLW)
    # S/G
    label(d, ox + 0.5 * cell, oy + 5.5 * cell, 'S', GOLD)
    label(d, ox + 5.5 * cell, oy + 0.5 * cell, 'G', GOLD)
    save(img, 'zoom/guard_maze.webp')

    # ---- 看守室脱出後の廊下 ----
    img, d = new_canvas((20, 22, 26))
    title(img, d, '看守室脱出後の廊下')
    rrect(d, [200, 780, 500, 950], fill=(40, 42, 46), outline=METAL, width=3, radius=8)
    label(d, 350, 860, 'プレートC', GOLD)
    save(img, 'walls/post_guard_corridor.webp')

    # ---- 仮遷移画面 ----
    img, d = new_canvas((10, 11, 13))
    title(img, d, '独居房（STAGE4未実装）')
    label(d, 450, 600, 'ここまで実装済み', GOLD)
    label(d, 450, 650, '（続きは今後のアップデートで実装予定）', (140, 145, 150))
    save(img, 'ui/solitary_placeholder.webp')

    # ---- アイテム ----
    item_icon('key_board_key', lambda d: (d.ellipse([50, 50, 110, 110], outline=(210, 190, 110), width=10), d.rectangle([100, 72, 190, 90], fill=(210, 190, 110)), d.rectangle([160, 90, 175, 110], fill=(210, 190, 110))))
    item_icon('key_management_note', lambda d: d.rounded_rectangle([50, 40, 190, 200], radius=8, fill=(225, 222, 210), outline=(150, 150, 140), width=4))
    item_icon('monitor_fuse', lambda d: (d.rounded_rectangle([90, 60, 150, 180], radius=10, fill=(200, 90, 80), outline=(120, 50, 45), width=4), d.rectangle([110, 40, 130, 65], fill=(150, 155, 160))))
    item_icon('perforated_plate', lambda d: (d.rounded_rectangle([50, 70, 190, 170], radius=8, fill=(120, 130, 140), outline=(80, 88, 96), width=4), d.ellipse([70, 105, 85, 120], fill=(0, 0, 0, 0), outline=(30, 30, 30), width=2), d.ellipse([100, 100, 115, 115], outline=(30, 30, 30), width=2), d.ellipse([130, 110, 145, 125], outline=(30, 30, 30), width=2), d.ellipse([160, 100, 175, 115], outline=(30, 30, 30), width=2)))
    item_icon('plate_c', lambda d: (d.rounded_rectangle([50, 80, 190, 160], radius=10, fill=(130, 130, 90), outline=(90, 90, 55), width=4), d.text((110, 100), 'C', font=font(36), fill=(230, 230, 210))))

if __name__ == '__main__':
    run()
