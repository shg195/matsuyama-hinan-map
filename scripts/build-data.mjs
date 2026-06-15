/**
 * data/raw の松山市避難場所CSVを、アプリが読む GeoJSON に変換する（ビルド時実行）。
 * 出力形式は src/types.ts の SiteFeatureCollection に一致させる。
 * 出典：松山市オープンデータ 382019_evacuation_space.csv（CC-BY）。
 *
 * 正規化ルールは実データ（2026-06-15）の確認に基づく：
 * - 緯度経度・名称・ID は全件あり／標高は全件空（→null）／想定収容人数は "50,700 " 等のカンマ＋空白
 * - 指定避難所との重複は "1" か空（→ boolean）
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'data/raw/382019_evacuation_space.csv');
const OUT = resolve(ROOT, 'public/data/evacuation_sites.geojson');

// 災害種別キー → CSV列名。src/types.ts の DISASTER_CSV_COLUMN と一致させること（要手動同期）。
const DISASTER_CSV_COLUMN = {
  flood: '災害種別_洪水',
  landslide: '災害種別_崖崩れ、土石流及び地滑り',
  stormSurge: '災害種別_高潮',
  earthquake: '災害種別_地震',
  tsunami: '災害種別_津波',
  largeFire: '災害種別_大規模な火事',
  inlandFlood: '災害種別_内水氾濫',
  volcano: '災害種別_火山現象',
};

/** 最小 CSV パーサ（RFC4180 風：ダブルクォート・埋め込みカンマ/改行・"" エスケープ対応）。 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // CRLF の CR は無視し、LF で行確定する
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** カンマ・空白を除いて数値化。空や数値化不可は null。 */
function toNumberOrNull(s) {
  const t = (s ?? '').replace(/,/g, '').trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function main() {
  const raw = readFileSync(SRC, 'utf8').replace(/^﻿/, ''); // BOM除去
  const rows = parseCsv(raw).filter((r) => r.some((c) => c.trim() !== ''));
  if (rows.length < 2) throw new Error('CSVにデータ行がありません');

  const header = rows[0];
  const idx = (name) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`CSV列が見つかりません: ${name}`);
    return i;
  };
  const col = {
    id: idx('ID'),
    name: idx('名称'),
    address: idx('所在地_連結表記'),
    lat: idx('緯度'),
    lng: idx('経度'),
    elevation: idx('標高'),
    capacity: idx('想定収容人数'),
    overlap: idx('指定避難所との重複'),
    note: idx('備考'),
  };
  const disasterIdx = Object.fromEntries(
    Object.entries(DISASTER_CSV_COLUMN).map(([k, name]) => [k, idx(name)]),
  );

  const features = rows.slice(1).map((r) => {
    const lat = toNumberOrNull(r[col.lat]);
    const lng = toNumberOrNull(r[col.lng]);
    if (lat === null || lng === null) {
      throw new Error(`緯度経度が不正: ID=${r[col.id]}`);
    }
    const disasterTypes = Object.entries(disasterIdx)
      .filter(([, i]) => r[i].trim() === '1')
      .map(([k]) => k);
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: r[col.id].trim(),
        name: r[col.name].trim(),
        address: r[col.address].trim(),
        elevation: toNumberOrNull(r[col.elevation]),
        disasterTypes,
        capacity: toNumberOrNull(r[col.capacity]),
        overlapWithShelter: r[col.overlap].trim() === '1',
        note: r[col.note].trim(),
      },
    };
  });

  const fc = { type: 'FeatureCollection', features };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(fc) + '\n', 'utf8');
  console.log(`変換完了: ${features.length} 件 -> ${OUT}`);
}

main();
