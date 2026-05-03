import { ref } from 'vue';

import { defineStore } from 'pinia';

import { getI18nInfoApi } from '#/api';

const DEFAULT_APP_NAME = 'Fiber Admin';

export const useAppStore = defineStore('app', () => {
  const saasEnabled = ref<boolean>(true);
  const appName = ref<string>(DEFAULT_APP_NAME);

  async function fetchAppConfig() {
    try {
      const resp = await getI18nInfoApi();
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
