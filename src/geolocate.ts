import type { Origin } from './types';

/**
 * 端末の現在地を取得する（Geolocation API）。
 * 非対応・拒否・失敗時は握りつぶさず reject する（conventions）。
 */
export function getCurrentLocation(): Promise<Origin> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('この端末では現在地を取得できません'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'geolocation' });
      },
      (err) => {
        reject(new Error(`現在地の取得に失敗しました: ${err.message}`));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
