/**
 * エントリポイント（src/main.ts）。
 * 地図・避難場所ピン・災害種別フィルタ・ハザード重ね・起点設定・最寄りリスト・詳細を統合する。
 * UI の意匠はモジュール9（claude design 成果物）で置換する。
 */
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import type { DisasterType, Origin, SiteFeature, SiteFeatureCollection } from './types';
import { initMap, addSiteLayer, SITE_LAYER_ID } from './map';
import { loadSites } from './sites';
import { buildSiteFilter } from './filter';
import { initHazardLayers, setHazardVisibility } from './hazard';
import { geocode } from './geocode';
import { getCurrentLocation } from './geolocate';
import { createFilterPanel } from './ui/filter-panel';
import { createHazardPanel } from './ui/hazard-panel';
import { createLocationControl } from './ui/location-control';
import { createNearestList, type NearestListController } from './ui/nearest-list';
import { showSiteDetail } from './ui/detail-panel';

const container = document.querySelector<HTMLDivElement>('#app');
if (!container) {
  throw new Error('地図コンテナ #app が見つかりません');
}

const map = initMap(container);

// --- アプリ状態 ---
let allSites: SiteFeatureCollection | null = null;
const siteById = new Map<string, SiteFeature>();
let currentOrigin: Origin | null = null;
let currentSelected: ReadonlySet<DisasterType> = new Set();
let originMarker: maplibregl.Marker | null = null;

// 最寄りリスト（地図読込を待たず生成。中身は update で反映）。
const nearestList: NearestListController = createNearestList(document.body, {
  onSelect: (site) => {
    flyToSite(site);
    showSiteDetail(document.body, site);
  },
});

// 起点設定UI（住所検索・現在地）。地図読込を待たず使える。
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
      allSites = sites;
      for (const feature of sites.features) {
        siteById.set(feature.properties.id, feature);
      }

      // ハザード（初期非表示）を先に追加し、その上に避難場所ピンを重ねる。
      initHazardLayers(map);
      addSiteLayer(map, sites);

      createFilterPanel(document.body, {
        onChange: (selected) => {
          currentSelected = selected;
          map.setFilter(SITE_LAYER_ID, buildSiteFilter(selected));
          recomputeNearest();
        },
      });
      createHazardPanel(document.body, {
        onToggle: (id, visible) => {
          setHazardVisibility(map, id, visible);
        },
      });

      // ピンのクリックで詳細表示（properties.id から正規データを引く）。
      map.on('click', SITE_LAYER_ID, (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (typeof id !== 'string') {
          return;
        }
        const site = siteById.get(id);
        if (site) {
          showSiteDetail(document.body, site);
        }
      });
      map.on('mouseenter', SITE_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', SITE_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });

      recomputeNearest();
    })
    .catch((err: unknown) => {
      console.error(err);
      showError('避難場所データを読み込めませんでした。時間をおいて再読み込みしてください。');
    });
});

/** 起点を設定し、マーカー表示＋移動＋最寄り再計算する。 */
function setOrigin(origin: Origin): void {
  currentOrigin = origin;
  if (!originMarker) {
    originMarker = new maplibregl.Marker({ color: '#d32f2f' });
  }
  originMarker.setLngLat([origin.lng, origin.lat]).addTo(map);
  map.flyTo({ center: [origin.lng, origin.lat], zoom: 14 });
  recomputeNearest();
}

/** 指定避難場所へ地図を寄せる。 */
function flyToSite(site: SiteFeature): void {
  map.flyTo({ center: site.geometry.coordinates, zoom: 16 });
}

/** 現在のフィルタ選択を反映した避難場所群で最寄りリストを更新する。 */
function recomputeNearest(): void {
  if (!allSites) {
    return;
  }
  const target =
    currentSelected.size === 0
      ? allSites.features
      : allSites.features.filter((f) =>
          f.properties.disasterTypes.some((t) => currentSelected.has(t)),
        );
  nearestList.update(currentOrigin, target);
}

/** 最小のエラー表示。本格的な UI はモジュール9（claude design 成果物）で置換する。 */
function showError(message: string): void {
  const banner = document.createElement('div');
  banner.textContent = message;
  banner.setAttribute('role', 'alert');
  banner.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:10;padding:8px 12px;background:#b00020;color:#fff;font:14px sans-serif;';
  document.body.appendChild(banner);
}
