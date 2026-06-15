export interface LocationControlOptions {
  /** 検索が実行されたとき（クエリは trim 済み・空でない）。 */
  onSearch: (query: string) => void;
  /** 現在地ボタンが押されたとき。 */
  onLocate: () => void;
}

/**
 * 起点設定UI（住所検索ボックス＋現在地ボタン）の最小実装。
 * 非同期処理・エラー表示・地図移動は呼び出し側（main）が担う。
 * 見た目はモジュール9で claude design 成果物に置換する。
 */
export function createLocationControl(
  container: HTMLElement,
  options: LocationControlOptions,
): void {
  const wrap = document.createElement('div');
  wrap.className = 'location-control';

  const form = document.createElement('form');
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = '住所・地名で検索';
  input.setAttribute('aria-label', '住所・地名検索');

  const searchBtn = document.createElement('button');
  searchBtn.type = 'submit';
  searchBtn.textContent = '検索';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      options.onSearch(query);
    }
  });
  form.appendChild(input);
  form.appendChild(searchBtn);

  const locateBtn = document.createElement('button');
  locateBtn.type = 'button';
  locateBtn.textContent = '現在地';
  locateBtn.addEventListener('click', () => {
    options.onLocate();
  });

  wrap.appendChild(form);
  wrap.appendChild(locateBtn);
  container.appendChild(wrap);
}
