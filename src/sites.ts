import type { SiteFeature, SiteFeatureCollection } from './types';

/** ビルド時に生成した避難場所 GeoJSON（public/data 配下）の URL。Vite の base 配下を解決する。 */
const SITES_URL = `${import.meta.env.BASE_URL}data/evacuation_sites.geojson`;

/** 避難場所 GeoJSON を取得する。失敗時は握りつぶさず投げる（conventions）。 */
export async function loadSites(): Promise<SiteFeatureCollection> {
  const res = await fetch(SITES_URL);
  if (!res.ok) {
    throw new Error(`避難場所データの取得に失敗しました (HTTP ${res.status})`);
  }
  return (await res.json()) as SiteFeatureCollection;
}

/** 避難場所への経路を外部地図（Googleマップ）で開く URL。起点は端末側に委ねる（spec §6.3）。 */
export function googleMapsDirectionUrl(site: SiteFeature): string {
  const [lng, lat] = site.geometry.coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
