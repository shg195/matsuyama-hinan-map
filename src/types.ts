/**
 * 共通型定義（src/types.ts）
 * 仕様の正：docs/spec.md。データ列の出典：松山市オープンデータ 382019_evacuation_space.csv（CC-BY）。
 * 以降のモジュールはこの型を参照する（docs/conventions.md）。
 */

/**
 * 災害種別。CSV の災害種別フラグ列（spec §5.1）に1対1で対応する。
 * 値はアプリ内部キー（camelCase）。CSV 列名・日本語ラベルとの対応は下の定数で持つ。
 */
export type DisasterType =
  | 'flood' // 洪水
  | 'landslide' // 崖崩れ、土石流及び地滑り（＝土砂）
  | 'stormSurge' // 高潮
  | 'earthquake' // 地震
  | 'tsunami' // 津波
  | 'largeFire' // 大規模な火事
  | 'inlandFlood' // 内水氾濫
  | 'volcano'; // 火山現象

/** 災害種別 → CSV 列名（変換時のキー対応・spec §5.1）。 */
export const DISASTER_CSV_COLUMN: Record<DisasterType, string> = {
  flood: '災害種別_洪水',
  landslide: '災害種別_崖崩れ、土石流及び地滑り',
  stormSurge: '災害種別_高潮',
  earthquake: '災害種別_地震',
  tsunami: '災害種別_津波',
  largeFire: '災害種別_大規模な火事',
  inlandFlood: '災害種別_内水氾濫',
  volcano: '災害種別_火山現象',
};

/** 災害種別 → 表示ラベル（日本語）。 */
export const DISASTER_LABEL: Record<DisasterType, string> = {
  flood: '洪水',
  landslide: '土砂災害',
  stormSurge: '高潮',
  earthquake: '地震',
  tsunami: '津波',
  largeFire: '大規模な火事',
  inlandFlood: '内水氾濫',
  volcano: '火山現象',
};

/**
 * v1 のフィルタ UI に出す災害種別（spec §5.1）。
 * 内水氾濫・火山現象は現データで該当0件のため除外。
 * 注：実装側では「件数0の種別を動的に非表示」にするのが望ましい（spec）。本定数は既定の表示順も兼ねる。
 */
export const V1_FILTER_DISASTER_TYPES: readonly DisasterType[] = [
  'earthquake',
  'tsunami',
  'landslide',
  'stormSurge',
  'flood',
  'largeFire',
];

/** 指定緊急避難場所の1件（CSV 1行を正規化したアプリ内部表現）。 */
export interface EvacuationSite {
  /** CSV: ID（一意キー） */
  id: string;
  /** CSV: 名称 */
  name: string;
  /** CSV: 所在地_連結表記（例：愛媛県松山市堀之内） */
  address: string;
  /** CSV: 緯度（WGS84） */
  lat: number;
  /** CSV: 経度（WGS84） */
  lng: number;
  /** CSV: 標高（欠損あり） */
  elevation?: number | null;
  /** 対応する災害種別（CSV フラグ列が "1" のもの） */
  disasterTypes: DisasterType[];
  /** CSV: 想定収容人数（"50,700 " 等の表記揺れを正規化した数値・欠損あり） */
  capacity?: number | null;
  /** CSV: 指定避難所との重複 */
  overlapWithShelter?: boolean;
  /** CSV: 備考 */
  note?: string;
}

/** 避難場所の GeoJSON Feature（地図描画用）。座標順は [経度, 緯度]。 */
export interface SiteFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    /** [lng, lat] */
    coordinates: [number, number];
  };
  /** 座標以外の属性（lat/lng は geometry に持つので除く） */
  properties: Omit<EvacuationSite, 'lat' | 'lng'>;
}

/** 避難場所の FeatureCollection（build-data.mjs の出力形式）。 */
export interface SiteFeatureCollection {
  type: 'FeatureCollection';
  features: SiteFeature[];
}

/** 重ね表示するハザードレイヤ（spec §5.2・ハザードマップポータルのタイル）。 */
export type HazardLayerId =
  | 'flood' // 洪水浸水想定
  | 'tsunami' // 津波浸水想定
  | 'landslide'; // 土砂災害警戒区域

/** ハザードレイヤ → 表示ラベル（日本語）。 */
export const HAZARD_LABEL: Record<HazardLayerId, string> = {
  flood: '洪水浸水想定',
  tsunami: '津波浸水想定',
  landslide: '土砂災害警戒区域',
};

/** 起点（現在地 or 検索地点）。最寄りリストの距離計算に使う。 */
export interface Origin {
  lat: number;
  lng: number;
  /** 起点の種類（現在地 or 住所検索結果） */
  source: 'geolocation' | 'search';
  /** 検索の場合の表示名（任意） */
  label?: string;
}
