import type { Map as MaplibreMap } from 'maplibre-gl';
import type { HazardLayerId } from './types';

/**
 * 重ねるハザードのラスタタイル（ハザードマップポータルサイト）。
 * 利用条件：商用非商用問わず利用可。出典「ハザードマップポータルサイト」として当該ページへリンク必須。
 * データ仕様は地理院タイルと同じ（256px・XYZ・z2〜17）。
 * 出典：https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html
 */
const PORTAL_ATTRIBUTION =
  '<a href="https://disaportal.gsi.go.jp/" target="_blank" rel="noopener">ハザードマップポータルサイト</a>';

const TILE_MAXZOOM = 17;

/** 1つのハザード種別を構成するサブレイヤ（土砂は3現象に分かれる）。 */
interface HazardSublayer {
  /** maplibre のソース/レイヤ ID。 */
  key: string;
  /** タイルURLテンプレート。 */
  tiles: string;
}

/** ハザード種別 → サブレイヤ群。土砂災害警戒区域は土石流・急傾斜地・地すべりの3枚。 */
const HAZARD_SUBLAYERS: Record<HazardLayerId, HazardSublayer[]> = {
  flood: [
    {
      key: 'hazard-flood',
      tiles: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
    },
  ],
  tsunami: [
    {
      key: 'hazard-tsunami',
      tiles: 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
    },
  ],
  landslide: [
    {
      key: 'hazard-landslide-debris',
      tiles: 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png',
    },
    {
      key: 'hazard-landslide-steep',
      tiles: 'https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png',
    },
    {
      key: 'hazard-landslide-slide',
      tiles: 'https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png',
    },
  ],
};

/**
 * 全ハザードのラスタソース／レイヤを地図に追加する（初期は全て非表示）。
 * 避難場所ピンより先に呼び、ピンが常に上に来るようにする。
 */
export function initHazardLayers(map: MaplibreMap): void {
  for (const sublayers of Object.values(HAZARD_SUBLAYERS)) {
    for (const sub of sublayers) {
      map.addSource(sub.key, {
        type: 'raster',
        tiles: [sub.tiles],
        tileSize: 256,
        maxzoom: TILE_MAXZOOM,
        attribution: PORTAL_ATTRIBUTION,
      });
      map.addLayer({
        id: sub.key,
        type: 'raster',
        source: sub.key,
        layout: { visibility: 'none' },
        paint: { 'raster-opacity': 0.7 },
      });
    }
  }
}

/** 指定ハザード種別の表示/非表示を切り替える（土砂はサブレイヤ全てを同時に）。 */
export function setHazardVisibility(map: MaplibreMap, id: HazardLayerId, visible: boolean): void {
  for (const sub of HAZARD_SUBLAYERS[id]) {
    map.setLayoutProperty(sub.key, 'visibility', visible ? 'visible' : 'none');
  }
}
