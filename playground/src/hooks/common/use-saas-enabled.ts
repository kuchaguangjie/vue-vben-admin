import { computed } from 'vue';

import { useAppStore } from '#/store';

export function useSaasEnabled() {
  const appStore = useAppStore();

  const saasEnabled = computed(() => appStore.saasEnabled);

  return {
    saasEnabled,
  };
}
