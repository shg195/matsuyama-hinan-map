import type { Origin } from './types';

/**
 * 住所/地名 → 座標のジオコーディング（国土地理院 住所検索API）。
 * 無料・CORS可だが「地理院地図」向けの半公式で可用性/仕様の保証はない（spec §8）。
 * 将来 Nominatim 等へ差し替え可能にするため、この関数で実装を隔離する。
 * 利用は国土地理院コンテンツ利用規約に従い、出典「国土地理院」を明示すること。
 */
const ENDPOINT = 'https://msearch.gsi.go.jp/address-search/AddressSearch';

/** 地理院 住所検索APIの応答要素（必要分のみ）。 */
interface GsiAddressResult {
  geometry: { coordinates: [number, number] };
  properties: { title: string };
}

/** 検索文字列から最有力の1件を返す。該当なしは null。失敗時は throw（握りつぶさない）。 */
export async function geocode(query: string): Promise<Origin | null> {
  const res = await fetch(`${ENDPOINT}?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`住所検索に失敗しました (HTTP ${res.status})`);
  }
  const results = (await res.json()) as GsiAddressResult[];
  if (results.length === 0) {
    return null;
  }
  const [lng, lat] = results[0].geometry.coordinates;
  return { lat, lng, source: 'search', label: results[0].properties.title };
}
