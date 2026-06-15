import type { Origin, SiteFeature } from '../types';
import { haversineMeters } from '../distance';

export interface NearestListController {
  /** 起点と対象避難場所群を渡すと、近い順に再描画する。origin が null なら誘導文を出す。 */
  update(origin: Origin | null, sites: SiteFeature[]): void;
}

export interface NearestListOptions {
  /** リスト項目が選ばれたとき。 */
  onSelect: (site: SiteFeature) => void;
  /** 表示件数（既定10）。 */
  count?: number;
}

/**
 * 最寄り避難場所リスト（直線距離の近い順）。
 * 見た目はモジュール9で claude design 成果物に置換する。
 */
export function createNearestList(
  container: HTMLElement,
  options: NearestListOptions,
): NearestListController {
  const count = options.count ?? 10;

  const panel = document.createElement('div');
  panel.className = 'nearest-list';
  panel.setAttribute('aria-label', '最寄りの避難場所');

  const heading = document.createElement('div');
  heading.className = 'nearest-list__heading';
  heading.textContent = '最寄りの避難場所';
  panel.appendChild(heading);

  const ul = document.createElement('ul');
  panel.appendChild(ul);
  container.appendChild(panel);

  return {
    update(origin, sites) {
      ul.replaceChildren();

      if (!origin) {
        ul.appendChild(hint('現在地か住所を設定すると、近い順に表示します。'));
        return;
      }

      const items = sites
        .map((site) => ({
          site,
          dist: haversineMeters(origin, {
            lat: site.geometry.coordinates[1],
            lng: site.geometry.coordinates[0],
          }),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, count);

      if (items.length === 0) {
        ul.appendChild(hint('該当する避難場所がありません。'));
        return;
      }

      for (const { site, dist } of items) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nearest-list__item';
        btn.textContent = `${site.properties.name}（${formatDistance(dist)}）`;
        btn.addEventListener('click', () => {
          options.onSelect(site);
        });
        li.appendChild(btn);
        ul.appendChild(li);
      }
    },
  };
}

function hint(text: string): HTMLElement {
  const li = document.createElement('li');
  li.className = 'nearest-list__hint';
  li.textContent = text;
  return li;
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}
