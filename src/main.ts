/**
 * エントリポイント（src/main.ts）。
 * モジュール1（scaffold）時点ではビルド土台の動作確認用の最小実装に留める。
 * 地図初期化はモジュール3で src/map.ts に実装し、ここから呼び出す。
 */
const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.textContent = '松山避難マップ（scaffold 確認用）';
}
