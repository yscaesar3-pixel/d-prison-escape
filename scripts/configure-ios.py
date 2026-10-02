from pathlib import Path
import plistlib
import re
import shutil

APP_ID = "ca-app-pub-8174756915786797~9805262814"
APPLE_BUNDLE_ID = "com.yutaXXX.d-prison-escape"
CAPACITOR_INTERNAL_APP_ID = "com.yutaXXX.dprisonescape"
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
    # Capacitor does not accept hyphens in appId, so the generated project uses a
    # validation-safe internal ID. For the actual iOS app, restore the Apple
    # Developer/App Store Connect Bundle ID here before code signing.
    text = re.sub(
        r'PRODUCT_BUNDLE_IDENTIFIER = [^;]+;',
        f'PRODUCT_BUNDLE_IDENTIFIER = {APPLE_BUNDLE_ID};',
        text,
    )

    # Explicitly force the Xcode asset catalog to use the approved AppIcon set
    # for every generated build configuration. Capacitor normally generates this
    # setting, but keeping it explicit avoids falling back to a default/blank icon
    # when the iOS project is recreated in Codemagic.
    if re.search(r'ASSETCATALOG_COMPILER_APPICON_NAME\s*=', text):
        text = re.sub(
            r'ASSETCATALOG_COMPILER_APPICON_NAME\s*=\s*[^;]+;',
            'ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;',
            text,
        )
    else:
        text = re.sub(
            r'(PRODUCT_BUNDLE_IDENTIFIER = [^;]+;)',
            r'\1\n\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;',
            text,
        )

    PBXPROJ.write_text(text, encoding="utf-8")


# Replace the freshly generated Capacitor artwork with the approved prison assets.
ASSET_CATALOG = Path("ios/App/App/Assets.xcassets")
NATIVE_ASSETS = Path("native-assets/ios")
for asset_name in ("AppIcon.appiconset", "Splash.imageset"):
    src_dir = NATIVE_ASSETS / asset_name
    dst_dir = ASSET_CATALOG / asset_name
    if src_dir.exists():
        if dst_dir.exists():
            shutil.rmtree(dst_dir)
        shutil.copytree(src_dir, dst_dir)
        print(f"Installed iOS asset: {asset_name}")
    else:
        print(f"Warning: native asset not found: {src_dir}")

# Keep the embedded Capacitor runtime config consistent with the real iOS Bundle ID.
native_cap_config = Path("ios/App/App/capacitor.config.json")
if native_cap_config.exists():
    try:
        import json
        native_data = json.loads(native_cap_config.read_text(encoding="utf-8"))
        if native_data.get("appId") == CAPACITOR_INTERNAL_APP_ID:
            native_data["appId"] = APPLE_BUNDLE_ID
            native_cap_config.write_text(
                json.dumps(native_data, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
    except Exception as exc:
        print(f"Warning: could not update native capacitor.config.json: {exc}")

print(f"Configured iOS Bundle ID: {APPLE_BUNDLE_ID}")
if PBXPROJ.exists():
    final_pbx = PBXPROJ.read_text(encoding="utf-8")
    icon_settings = re.findall(r"ASSETCATALOG_COMPILER_APPICON_NAME\s*=\s*([^;]+);", final_pbx)
    if icon_settings and all(v.strip() == "AppIcon" for v in icon_settings):
        print(f"AppIcon build setting: AppIcon ({len(icon_settings)} configuration(s))")
    else:
        raise SystemExit(f"AppIcon build setting verification failed: {icon_settings}")
print("Configured iOS: AdMob App ID, SKAdNetwork IDs, iPhone-only, portrait, iOS 15+, encryption declaration, App Icon and Launch Screen assets.")
