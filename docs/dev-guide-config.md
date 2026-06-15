# dev-guide 設定（docs/dev-guide-config.md）

dev-guide skill の動作設定。初版：2026-06-15。

## 部分監査（dev-audit-1-partial）の動作モード
- **毎回自動で実行**
- 根拠：上流が「葉・可逆系ゆえモジュール自動進行＋完了ごと自動commit」を明示許可（`上流からの指示.md`）。モジュール完了ゲートで自動監査＋自動commit。
- 例外：push と公開デプロイのみ本人手動（外向き）。

## 公開・配布予定
- **あり（Web／GitHub Pages 公開）**
- 種別：静的 SPA（Vite+TS / MapLibre GL）。
- 公開操作（push・デプロイ）は本人手動。

## UI 設計資料（design.md 相当）
- **claude design に委譲**（後で貼る扱い）。
- 受領したら `docs/design.md` に保存し、モジュール9で統合。

## Git / バックアップ
- `git init` 済み（2026-06-15）。
- バックアップ用 **private リポジトリ**を作成（GitHub・公開とは別目的のバックアップ）。
- commit：モジュール完了ゲートで自動。push：セッション終わりに本人が手動。
