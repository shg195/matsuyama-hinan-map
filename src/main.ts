/**
 * エントリポイント（src/main.ts）。
 * 地図を初期化し、避難場所 GeoJSON を読み込んでピン表示する（モジュール3）。
 * フィルタ・ハザード・詳細などは後続モジュールで追加する。
 */
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import { initMap, addSiteLayer } from './map';
import { loadSites } from './sites';

const container = document.querySelector<HTMLDivElement>('#app');
if (!container) {
  throw new Error('地図コンテナ #app が見つかりません');
}

const map = initMap(container);

map.on('load', () => {
  loadSites()
    .then((sites) => addSiteLayer(map, sites))
    .catch((err: unknown) => {
      console.error(err);
      showError('避難場所データを読み込めませんでした。時間をおいて再読み込みしてください。');
    });
});

/** 最小のエラー表示。本格的な UI はモジュール9（claude design 成果物）で置換する。 */
function showError(message: string): void {
  const banner = document.createElement('div');
  banner.textContent = message;
  banner.setAttribute('role', 'alert');
  banner.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:10;padding:8px 12px;background:#b00020;color:#fff;font:14px sans-serif;';
  document.body.appendChild(banner);
}
