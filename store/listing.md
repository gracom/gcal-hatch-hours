# Chrome ウェブストアの掲載内容

デベロッパー ダッシュボードの各欄に、そのまま貼る文面。
拡張機能の名前と短い説明は `src/_locales/*/messages.json`（`extName`・`extDescription`）から自動で入るので、ここには写しだけを置く。

## 基本情報

| 欄 | 値 |
|---|---|
| カテゴリ | 仕事効率化（Productivity）→ ツール（Tools） |
| 言語 | 英語（既定）・日本語 |
| スクリーンショット | `store/screenshot-week-ja.png`（1280×800） |
| アイコン | `src/icons/icon128.png` |

## 日本語

### 名前（`extName`）

斜線アワー for Google カレンダー

### 短い説明（`extDescription`・132文字以内）

Googleカレンダーの日・週表示で、使わない時間帯を網掛けにします。

### 詳しい説明

Googleカレンダーの日表示・週表示で、寝ている時間など「使わない時間帯」に網掛けを入れる拡張機能です。

Webのカレンダーは24時間がすべて同じ見た目で並ぶので、夜中のあたりを見ていると、昼間の予定を見落としがちです。網掛けがあれば、いま見ている時間帯が一目でわかり、予定の入る時間帯に目が行きます。

■ できること
・網掛けする時間帯を「毎日同じ」か「曜日ごとに変える」かで選べます
・1日に時間帯をいくつでも設定できます
・23:00〜07:00のように、日付をまたぐ時間帯も設定できます
・模様は斜線と塗りつぶしから選べ、色と濃さも変えられます
・予定は網掛けの上に表示されるので、クリックや操作は今までどおりです
・設定は、同じGoogleアカウントでログインしたChrome同士で同期されます

■ 使い方
ツールバーのアイコンをクリックすると設定画面が開きます。時間帯を決めると、開いているカレンダーにすぐ反映されます。

■ プライバシー
予定の件名や内容は読み取りません。拡張機能が使うのは、カレンダーの列がどの日付かという情報だけです。データを外部に送信することはなく、広告やトラッキングもありません。

※ この拡張機能はGoogleが提供するものではなく、Googleとは関係ありません。Google カレンダーはGoogle LLCの商標です。

## English

### Name (`extName`)

Hatch Hours for Google Calendar

### Short description (`extDescription`, up to 132 characters)

Shades the hours you don't use in Google Calendar's day and week views.

### Detailed description

Hatch Hours adds a shaded band over the hours you don't use, such as while you sleep, in Google Calendar's day and week views.

The web calendar draws all 24 hours the same way, so when you are looking around midnight it is easy to miss what is coming up during the day. With the off hours shaded, you can tell at a glance which part of the day you are looking at.

FEATURES
• Use the same hours every day, or set different hours for each weekday
• Add as many ranges per day as you need
• Ranges can cross midnight, such as 23:00–07:00
• Choose stripes or a solid fill, and pick the color and opacity
• Events stay on top of the shading and work exactly as before
• Settings sync across Chrome browsers signed in to the same Google account

HOW TO USE
Click the toolbar icon to open the settings. Changes apply to open calendar tabs right away.

PRIVACY
The extension never reads your event titles or details. The only thing it reads is which date each calendar column shows. Nothing is sent anywhere, and there are no ads or tracking.

This extension is not made by or affiliated with Google. Google Calendar is a trademark of Google LLC.

## プライバシーへの取り組み（Privacy practices タブ）

### 単一用途の説明（Single purpose）

Shades user-chosen hours in Google Calendar's day and week views so that the hours the user does not use are visually distinct.

### 権限が必要な理由（Permission justification）

| 権限 | 理由（英語で入力） |
|---|---|
| `storage` | Saves the user's shading settings (hours, pattern, color, opacity) and syncs them across the user's own Chrome browsers via chrome.storage.sync. |
| ホストへのアクセス `https://calendar.google.com/*`（コンテンツスクリプト） | The content script draws the shaded bands on Google Calendar's time grid. It runs only on calendar.google.com and reads only the date attribute of each day column. |

### リモートコードの使用

いいえ（No, I am not using remote code）。すべてのスクリプトはパッケージに含まれる。

### データの使用（Data usage）

- 収集するデータの種類：どれにもチェックを入れない（個人を特定できる情報・健康・財務・認証情報・個人的な通信・位置情報・ウェブ履歴・ユーザーのアクティビティ・ウェブサイトのコンテンツ、いずれも収集しない）
- 次の3つの宣誓にはチェックを入れる：
  - 承認されている用途以外で、ユーザーデータを第三者に販売、転送しない
  - 拡張機能の単一用途と関係のない目的で、ユーザーデータを使用、転送しない
  - 信用力の判断や融資の目的で、ユーザーデータを使用、転送しない

### プライバシー ポリシー

データを収集しない拡張機能でも、URLの欄が求められる場合がある。そのときは `store/privacy.md` を公開して、そのURLを入れる。
