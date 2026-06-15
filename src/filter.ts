import type { FilterSpecification } from 'maplibre-gl';
import type { DisasterType } from './types';

/**
 * 選択された災害種別に対応する避難場所だけを表示する MapLibre フィルタ式を作る。
 * 論理は OR（spec §6.2）：feature の disasterTypes に選択種別のいずれかが含まれれば表示。
 * 未選択（空集合）の場合は null を返す＝フィルタ解除（全件表示）。
 */
export function buildSiteFilter(selected: ReadonlySet<DisasterType>): FilterSpecification | null {
  if (selected.size === 0) {
    return null;
  }
  const clauses = [...selected].map((type) => ['in', type, ['get', 'disasterTypes']]);
  // ['any', clause, ...] ＝ いずれかの clause が真なら表示（OR）。
  return ['any', ...clauses] as FilterSpecification;
}
