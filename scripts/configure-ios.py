from pathlib import Path
import plistlib
import re

APP_ID = "ca-app-pub-8174756915786797~9805262814"
PLIST = Path("ios/App/App/Info.plist")
PBXPROJ = Path("ios/App/App.xcodeproj/project.pbxproj")

SKAD_IDS = [
    "cstr6suwn9.skadnetwork","4fzdc2evr5.skadnetwork","2fnua5tdw4.skadnetwork",
    "ydx93a7ass.skadnetwork","p78axxw29g.skadnetwork","v72qych5uu.skadnetwork",
    "ludvb6z3bs.skadnetwork","cp8zw746q7.skadnetwork","3sh42y64q3.skadnetwork",
    "c6k4g5qg8m.skadnetwork","s39g8k73mm.skadnetwork","wg4vff78zm.skadnetwork",
    "3qy4746246.skadnetwork","f38h382jlk.skadnetwork","hs6bdukanm.skadnetwork",
    "mlmmfzh3r3.skadnetwork","v4nxqhlyqp.skadnetwork","wzmmz9fp6w.skadnetwork",
    "su67r6k2v3.skadnetwork","yclnxrl5pm.skadnetwork","t38b2kh725.skadnetwork",
    "7ug5zh24hu.skadnetwork","gta9lk7p23.skadnetwork","vutu7akeur.skadnetwork",
    "y5ghdn5j9k.skadnetwork","v9wttpbfk9.skadnetwork","n38lu8286q.skadnetwork",
    "47vhws6wlr.skadnetwork","kbd757ywx3.skadnetwork","9t245vhmpl.skadnetwork",
    "a2p9lx4jpn.skadnetwork","22mmun2rn5.skadnetwork","44jx6755aq.skadnetwork",
    "k674qkevps.skadnetwork","4468km3ulz.skadnetwork","2u9pt9hc89.skadnetwork",
    "8s468mfl3y.skadnetwork","klf5c3l5u5.skadnetwork","ppxm28t8ap.skadnetwork",
    "kbmxgpxpgc.skadnetwork","uw77j35x4d.skadnetwork","578prtvx9j.skadnetwork",
    "4dzt52r2t5.skadnetwork","tl55sbb4fm.skadnetwork","c3frkrj4fj.skadnetwork",
    "e5fvkxwrpn.skadnetwork","8c4e2ghe7u.skadnetwork","3rd42ekr43.skadnetwork",
    "97r2b46745.skadnetwork","3qcr597p9d.skadnetwork"
]

if not PLIST.exists():
    raise SystemExit(f"Info.plist not found: {PLIST}")

with PLIST.open("rb") as f:
    data = plistlib.load(f)

data["CFBundleDisplayName"] = "監獄からの脱出"
data["GADApplicationIdentifier"] = APP_ID
data["SKAdNetworkItems"] = [{"SKAdNetworkIdentifier": x} for x in SKAD_IDS]
data["ITSAppUsesNonExemptEncryption"] = False
data["UISupportedInterfaceOrientations"] = ["UIInterfaceOrientationPortrait"]

with PLIST.open("wb") as f:
    plistlib.dump(data, f, sort_keys=False)

if PBXPROJ.exists():
    text = PBXPROJ.read_text(encoding="utf-8")
    text = re.sub(r'TARGETED_DEVICE_FAMILY = "?1,2"?;', 'TARGETED_DEVICE_FAMILY = 1;', text)
    text = re.sub(r'IPHONEOS_DEPLOYMENT_TARGET = [0-9.]+;', 'IPHONEOS_DEPLOYMENT_TARGET = 15.0;', text)
    PBXPROJ.write_text(text, encoding="utf-8")

print("Configured iOS: AdMob App ID, SKAdNetwork IDs, iPhone-only, portrait, iOS 15+, encryption declaration.")
