d-prison-escape / TestFlight setup
===================================

このZIPは C:\dev\d-prison-escape のルートへ上書き展開してください。
既存の index.html / css / js / assets は移動しません。
Codemagicビルド時に scripts/prepare-www.mjs が www/ を自動生成します。

追加される主なファイル:
- package.json
- capacitor.config.json
- codemagic.yaml
- .gitignore
- scripts/prepare-www.mjs
- scripts/configure-ios.py

設定済み:
- Bundle ID: com.yutaXXX.d-prison-escape
- App name: 監獄からの脱出
- Capacitor 8.5.2
- @capacitor-community/admob 8.1.0
- AdMob App ID: ca-app-pub-8174756915786797~9805262814
- iPhone only
- portrait
- iOS 15+
- Codemagic App Store Connect integration: oddiro_asc_key
- TestFlight auto upload: ON

Codemagicではアップロード済みの app_store provisioning profile と Distribution certificate を
bundle identifier で自動選択し、xcode-project use-profiles で適用します。

広告は現在 js/ads.js の ADMOB_CONFIG.isTesting = true のため、初回TestFlightでは
Google公式テスト広告を使用します。公開直前までは true のままにしてください。

ローカルWindowsでは iOS/Xcode ビルドは不要です。
GitHub Desktopで追加ファイルをCommit→Pushし、Codemagicから ios-testflight を実行してください。
