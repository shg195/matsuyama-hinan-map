# 全体監査レポート（dev-audit-2-full）

- 実施日：2026-06-16
- 対象：松山避難マップ v1（モジュール0〜9 完了・commit `33af003`〜`50cb8ff`）
- 基準：docs/spec.md（§2 スコープ／§5 データ／§6 機能／§8 決定事項／§9 UI）・docs/conventions.md・src/types.ts
- 総合判定：**条件付き承認（軽微な修正が必要）**

---

## 1. 動的確認の結果（実行済み）

| 確認項目 | 方法 | 結果 |
|---|---|---|
| ビルド | `npm run build`（build:data + tsc --noEmit + vite build） | 通過。変換390件。バンドル 1,038.93kB（gzip 277.28kB＝maplibre由来の既知観察） |
| GeoJSON 件数・災害種別分布 | 生成物を集計 | 390件。地震390／津波331／土砂319／高潮282／洪水137／火事6／内水・火山0＝spec §5.1 実分布と完全一致 |
| 「肝」フィルタ式（OR） | MapLibre 実評価器 `featureFilter` で評価 | flood→B／earthquake→A,B／flood+landslide→B,C（OR）／未選択→null（全件）。配列プロパティ `disasterTypes` に対し正しく動作 |
| 下地・ハザードタイル | 松山上空 z12 タイルを実GET | 6URL すべて 200（地理院std／洪水／津波／土石流・急傾斜・地すべり） |
| ジオコーディングAPI | 地理院 AddressSearch を実GET | 200・応答型 `GsiAddressResult[]` 一致・座標順 [lng,lat] が geocode.ts の分解と整合 |

> 未実施：ブラウザでの目視（headless 不可）。ただしフィルタ論理は実評価器で代替検証済み、外部I/Oは実呼び出しで確認済み。

## 2. 仕様適合（IN機能・spec §6）

すべて実装・spec と一致：
- 避難場所ピン全件表示（map.ts `addSiteLayer`）
- 災害種別フィルタ＝OR（filter.ts／main.ts、spec §6.2・§8-2 と一致。実評価器で確認）
- ハザード重ね3種（hazard.ts、ポータルタイル・初期非表示・土砂は3サブレイヤ同時切替）
- 詳細パネル（名称・住所・対応災害・想定収容人数・備考・Googleマップリンク。spec §6.1 必須項目を網羅）
- 最寄りリスト（ハバーサイン直線距離昇順・上位10件。distance.ts）
- 外部地図リンク `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`（spec §6.3 と一致）
- ジオコーディングは `geocode()` で隔離（spec §8-1 差替可能の方針に適合）
- 出典3種を AttributionControl に実装（松山市CC-BY／国土地理院／ハザードマップポータル）

スコープ規律（OUT）も遵守：自前経路探索なし／安全・危険の独自判定なし／A33直読なし。

## 3. 指摘事項

### [軽微・要修正] 出典コントロールのコメント/コード不一致（map.ts）
- 箇所：`src/map.ts` 28-29行（コメント）と 42行（実装）
- 内容：コメントは「常時表示（compact:false）のものを自分で足す」と明記するが、実装は `new maplibregl.AttributionControl()` で `compact` 未指定。MapLibre の既定は「幅640px未満では地図移動時に折りたたみ（ⓘボタン）」。
- 影響：主対象のスマホ幅で出典がⓘボタンに格納され、spec §6.1「**常設**のクレジット領域」およびライセンス最優先方針と整合しない。
- 推奨：`new maplibregl.AttributionControl({ compact: false })` を付与し、コメント・spec と一致させる（1行）。
- 要確認（上流案件＝ライセンス解釈）：CC-BY のクレジット表示として「ⓘ折りたたみ」も業界慣行では許容されうるが、本 spec は「常設」を明記。常設で確定するか、compact 許容に spec を改めるかは本人判断。

## 4. 観察（修正不要・将来課題）

- DISASTER_CSV_COLUMN が types.ts と build-data.mjs で二重定義（現状完全一致・「要手動同期」コメントあり）。.mjs/.ts 境界ゆえの実務的選択。片側変更時のドリフトリスクのみ。
- エラーバナー（main.ts `showError`）は都度 body 追加・自動消去/重複排除なし。複数エラーで積み重なり残存。機能影響は軽微。
- conventions の「タイル読込失敗もユーザー提示」に対し、タイル失敗の明示ハンドラ（`map.on('error')` 等）なし（MapLibre内部処理に委任）。データ/ジオコーディング/現在地の3失敗は提示実装あり。
- 件数0種別（内水氾濫・火山現象）は静的除外（V1_FILTER_DISASTER_TYPES）。spec の「動的非表示が望ましい」は将来課題。v1 既定要件（UIから除外）は充足。types.ts にコメントで明記済み。
- 標高（elevation）は型・変換に保持されるが詳細パネル未表示（現データ全件null）。spec §6.1 詳細の必須項目ではなく問題なし。

## 5. 要確認事項（本人判断）

1. 指摘3：出典を「常設（compact:false）」で確定するか／compact 許容に spec を合わせるか。
