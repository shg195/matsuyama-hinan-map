import { HAZARD_LABEL, type HazardLayerId } from '../types';

export interface HazardPanelOptions {
  /** ハザードの ON/OFF が切り替わるたびに呼ばれる。 */
  onToggle: (id: HazardLayerId, visible: boolean) => void;
}

/** 重ねるハザードの表示順（spec §5.2）。 */
const HAZARD_ORDER: readonly HazardLayerId[] = ['flood', 'tsunami', 'landslide'];

/**
 * ハザード重ね表示の最小UI（チェックボックス）。
 * 見た目はモジュール9で claude design 成果物に置換する。
 */
export function createHazardPanel(container: HTMLElement, options: HazardPanelOptions): void {
  const panel = document.createElement('div');
  panel.className = 'hazard-panel';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'ハザード重ね表示');

  const title = document.createElement('span');
  title.className = 'hazard-panel__title';
  title.textContent = 'ハザード重ね';
  panel.appendChild(title);

  for (const id of HAZARD_ORDER) {
    const label = document.createElement('label');
    label.className = 'hazard-panel__item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', () => {
      options.onToggle(id, checkbox.checked);
    });

    const text = document.createElement('span');
    text.textContent = HAZARD_LABEL[id];

    label.appendChild(checkbox);
    label.appendChild(text);
    panel.appendChild(label);
  }

  container.appendChild(panel);
}
