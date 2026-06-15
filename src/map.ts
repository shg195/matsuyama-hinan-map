import maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import type { SiteFeatureCollection } from './types';

/** 松山市中心付近（松山市役所周辺）。 */
const MATSUYAMA_CENTER: [number, number] = [132.7656, 33.8392];

/** 国土地理院 標準地図タイル。利用はコンテンツ利用規約への同意が前提（spec §5.3）。 */
const GSI_STD_TILES = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png';

/** 避難場所ピンのレイヤ ID（後続モジュールのフィルタ・クリック処理から参照）。 */
export const SITE_LAYER_ID = 'site-points';
/** 避難場所 GeoJSON ソースの ID。 */
export const SITE_SOURCE_ID = 'sites';

/** 地図を初期化して返す。地理院タイルを下地にする。 */
export function initMap(container: HTMLElement): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: {
      version: 8,
      sources: {
        gsi: {
          type: 'raster',
          tiles: [GSI_STD_TILES],
          tileSize: 256,
          attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>',
        },
      },
      layers: [{ id: 'gsi-base', type: 'raster', source: 'gsi' }],
    },
    center: MATSUYAMA_CENTER,
    zoom: 12,
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  return map;
}

/** 避難場所を円ピンとして地図に追加する（この時点では全件表示。フィルタはモジュール4）。 */
export function addSiteLayer(map: maplibregl.Map, data: SiteFeatureCollection): void {
  // SiteFeatureCollection は GeoJSON FeatureCollection の厳密なサブセット。境界で型を渡す。
  map.addSource(SITE_SOURCE_ID, {
    type: 'geojson',
    data: data as unknown as FeatureCollection,
  });
  map.addLayer({
    id: SITE_LAYER_ID,
    type: 'circle',
    source: SITE_SOURCE_ID,
    paint: {
      'circle-radius': 6,
      'circle-color': '#1565c0',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  });
}
