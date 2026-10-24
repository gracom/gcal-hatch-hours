# gcal-shade-hours

Googleカレンダー（Web版）の日・週表示で、使わない時間帯を網掛けにするChrome拡張機能。

Shades the hours you don't use in Google Calendar's day and week views.

## できること

- 網掛けする時間帯を「毎日同じ」か「曜日ごとに変える」かで選べる
- 1日に複数の時間帯を設定できる。終わりが始まりより前なら日付をまたぐ（例: 23:00–07:00 は翌朝7時まで）
- 色と濃さを変えられる
- 設定は `chrome.storage.sync` に保存され、同じGoogleアカウントでログインしたChrome間で同期される

## 入れ方（開発版）

1. `chrome://extensions` を開き、右上の「デベロッパー モード」をオンにする
1. 「パッケージ化されていない拡張機能を読み込む」で `src/` フォルダを選ぶ
1. ツールバーの拡張機能アイコンをクリックすると設定画面が開く

## しくみ

Googleカレンダーのクラス名は難読化されていて更新のたびに変わるため、使っていない。
`role="gridcell"` かつ `data-datekey` を持つ要素（時間グリッドの1日分の列）を探し、
列の高さを24時間として網掛けの位置を割合で決める。
`data-datekey` は `((year - 1970) << 9) | (month << 5) | day` で日付を表している。
