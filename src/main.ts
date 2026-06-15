/**
 * エントリポイント（src/main.ts）。
 * 地図を初期化し、避難場所 GeoJSON を読み込んでピン表示する（モジュール3）。
 * フィルタ・ハザード・詳細などは後続モジュールで追加する。
 */
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import type { Origin } from './types';
import { initMap, addSiteLayer, SITE_LAYER_ID } from './map';
import { loadSites } from './sites';
import { buildSiteFilter } from './filter';
import { initHazardLayers, setHazardVisibility } from './hazard';
import { geocode } from './geocode';
import { getCurrentLocation } from './geolocate';
import { createFilterPanel } from './ui/filter-panel';
import { createHazardPanel } from './ui/hazard-panel';
import { createLocationControl } from './ui/location-control';

const container = document.querySelector<HTMLDivElement>('#app');
if (!container) {
  throw new Error('地図コンテナ #app が見つかりません');
}

const map = initMap(container);

// 起点（現在地 or 検索地点）のマーカー。1つを使い回す。
let originMarker: maplibregl.Marker | null = null;

/** 起点を設定し、マーカー表示＋その地点へ地図を移動する。 */
function setOrigin(origin: Origin): void {
  if (!originMarker) {
    originMarker = new maplibregl.Marker({ color: '#d32f2f' });
  }
  originMarker.setLngLat([origin.lng, origin.lat]).addTo(map);
  map.flyTo({ center: [origin.lng, origin.lat], zoom: 14 });
}

// 起点設定UI（地図の読込を待たずに使える）。
createLocationControl(document.body, {
  onSearch: (query) => {
    geocode(query)
      .then((origin) => {
        if (origin) {
          setOrigin(origin);
        } else {
          showError('該当する住所・地名が見つかりませんでした。');
        }
      })
      .catch((err: unknown) => {
        console.error(err);
        showError('住所検索でエラーが発生しました。時間をおいて再度お試しください。');
      });
  },
  onLocate: () => {
    getCurrentLocation()
      .then((origin) => {
        setOrigin(origin);
      })
      .catch((err: unknown) => {
        console.error(err);
        showError('現在地を取得できませんでした。位置情報の許可をご確認ください。');
      });
  },
});

map.on('load', () => {
  loadSites()
    .then((sites) => {
      // ハザード（初期非表示）を先に追加し、その上に避難場所ピンを重ねる。
      initHazardLayers(map);
      addSiteLayer(map, sites);
      // レイヤ生成後にフィルタUIを配置（setFilter はレイヤ存在が前提）。
      createFilterPanel(document.body, {
        onChange: (selected) => {
          map.setFilter(SITE_LAYER_ID, buildSiteFilter(selected));
        },
      });
      createHazardPanel(document.body, {
        onToggle: (id, visible) => {
          setHazardVisibility(map, id, visible);
        },
      });
    })
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
