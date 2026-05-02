import { computed } from 'vue';

import { useUserStore } from '@vben/stores';

export function usePlatformAdmin() {
  const userStore = useUserStore();

  const isPlatformAdmin = computed(() => {
    const tenantId = userStore.userInfo?.tenantId;
    return tenantId === 0;
  });

  return {
    isPlatformAdmin,
  };
}
