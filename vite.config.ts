import { defineConfig } from 'vite';

// GitHub Pages のプロジェクトページ（https://shg195.github.io/matsuyama-hinan-map/）で
// 配信するため base をリポジトリ名に合わせる。ローカル dev では同 base 配下で配信される。
export default defineConfig({
  base: '/matsuyama-hinan-map/',
});
