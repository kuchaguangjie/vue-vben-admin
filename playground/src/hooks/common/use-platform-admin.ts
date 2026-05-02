import { useUserStore } from '@vben/stores';
import { computed } from 'vue';

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
