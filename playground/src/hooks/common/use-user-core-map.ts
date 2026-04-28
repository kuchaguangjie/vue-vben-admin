import type { Ref } from 'vue';
import { ref } from 'vue';

import type { SystemUserApi } from '#/api/system/user';

const userCoreMapGlobal: Ref<Record<number, SystemUserApi.UserCore>> = ref({});

export interface UseUserCoreMapReturn {
  userCoreMap: Ref<Record<number, SystemUserApi.UserCore>>;
  setUserCoreMap: (map: Record<number, SystemUserApi.UserCore>) => void;
  getUserCore: (id: number) => SystemUserApi.UserCore | undefined;
  clearUserCoreMap: () => void;
}

export function useUserCoreMap(): UseUserCoreMapReturn {
  function setUserCoreMap(map: Record<number, SystemUserApi.UserCore>) {
    userCoreMapGlobal.value = map;
  }

  function getUserCore(id: number): SystemUserApi.UserCore | undefined {
    return userCoreMapGlobal.value[id];
  }

  function clearUserCoreMap() {
    userCoreMapGlobal.value = {};
  }

  return {
    userCoreMap: userCoreMapGlobal,
    setUserCoreMap,
    getUserCore,
    clearUserCoreMap,
  };
}
