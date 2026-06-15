import { DISASTER_LABEL, type SiteFeature } from '../types';
import { googleMapsDirectionUrl } from '../sites';

/**
 * 避難場所の詳細を表示する（同時に1つだけ・既存は置換）。
 * 見た目はモジュール9で claude design 成果物に置換する。
 */
export function showSiteDetail(container: HTMLElement, site: SiteFeature): void {
  closeSiteDetail(container);

  const panel = document.createElement('div');
  panel.className = 'detail-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '避難場所の詳細');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'detail-panel__close';
  close.setAttribute('aria-label', '閉じる');
  close.textContent = '×';
  close.addEventListener('click', () => {
    closeSiteDetail(container);
  });
  panel.appendChild(close);

  const p = site.properties;

  const title = document.createElement('h2');
  title.className = 'detail-panel__title';
  title.textContent = p.name;
  panel.appendChild(title);

  panel.appendChild(row('所在地', p.address || '—'));
  panel.appendChild(
    row('対応災害', p.disasterTypes.map((t) => DISASTER_LABEL[t]).join('、') || '—'),
  );
  if (p.capacity != null) {
    panel.appendChild(row('想定収容人数', `${p.capacity.toLocaleString()} 人`));
  }
  if (p.overlapWithShelter) {
    panel.appendChild(row('指定避難所', '兼ねる'));
  }
  if (p.note) {
    panel.appendChild(row('備考', p.note));
  }

  const link = document.createElement('a');
  link.className = 'detail-panel__link';
  link.href = googleMapsDirectionUrl(site);
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Googleマップで経路を開く';
  panel.appendChild(link);

  container.appendChild(panel);
}

/** 表示中の詳細を閉じる。 */
export function closeSiteDetail(container: HTMLElement): void {
  container.querySelector('.detail-panel')?.remove();
}

function row(label: string, value: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'detail-panel__row';
  const dt = document.createElement('span');
  dt.className = 'detail-panel__label';
  dt.textContent = label;
  const dd = document.createElement('span');
  dd.textContent = value;
  div.appendChild(dt);
  div.appendChild(dd);
  return div;
}
