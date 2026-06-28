// eslint-disable-next-line n/no-extraneous-import
import Vue from '@vitejs/plugin-vue';
// eslint-disable-next-line n/no-extraneous-import
import VueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [Vue(), VueJsx()],
  resolve: {
    alias: {
      '#': '/mnt/star/git_repos/vue_repos/vue-vben-admin/playground/src',
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/e2e/**', '**/dist/**', '**/node_modules/**'],
  },
});
