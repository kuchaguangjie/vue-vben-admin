import { ref } from 'vue';

import { defineStore } from 'pinia';

import { i18nInfoQueryOptions } from '#/api';
import { queryClient } from '#/api/query-client';

const DEFAULT_APP_NAME = 'Fiber Admin';

export const useAppStore = defineStore('app', () => {
  const saasEnabled = ref<boolean>(true);
  const appName = ref<string>(DEFAULT_APP_NAME);

  async function fetchAppConfig() {
    try {
      // 走 queryClient.fetchQuery：与路由守卫共享同一缓存，
      // 同会话内重复调用自动去重，staleTime (5min) 内不重拉保证实时性。
      const resp = await queryClient.fetchQuery(i18nInfoQueryOptions());
      saasEnabled.value = resp.saasEnabled ?? true;
      appName.value = resp.appName ?? DEFAULT_APP_NAME;
    } catch (error) {
      console.error('Failed to fetch app config:', error);
      saasEnabled.value = false;
    }
  }

  function $reset() {
    saasEnabled.value = true;
    appName.value = DEFAULT_APP_NAME;
  }

  return {
    $reset,
    appName,
    fetchAppConfig,
    saasEnabled,
  };
});
