import { DISASTER_LABEL, V1_FILTER_DISASTER_TYPES, type DisasterType } from '../types';

export interface FilterPanelOptions {
  /** 選択集合が変わるたびに呼ばれる。 */
  onChange: (selected: ReadonlySet<DisasterType>) => void;
}

/**
 * 災害種別フィルタの最小UI（トグルボタン群）。
 * 表示する種別は V1_FILTER_DISASTER_TYPES（0件の内水氾濫・火山は除外済み）。
 * 見た目はモジュール9で claude design 成果物に置換する。
 */
export function createFilterPanel(container: HTMLElement, options: FilterPanelOptions): void {
  const selected = new Set<DisasterType>();

  const panel = document.createElement('div');
  panel.className = 'filter-panel';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', '災害種別フィルタ');

  for (const type of V1_FILTER_DISASTER_TYPES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = DISASTER_LABEL[type];
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      if (selected.has(type)) {
        selected.delete(type);
      } else {
        selected.add(type);
      }
      const active = selected.has(type);
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('is-active', active);
      options.onChange(selected);
    });
    panel.appendChild(btn);
  }

  container.appendChild(panel);
}
