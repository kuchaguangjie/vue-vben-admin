import type { Ref } from 'vue';

import type { SystemUserApi } from '#/api/system/user';

import { ref } from 'vue';

const userCoreMapGlobal: Ref<Record<number, SystemUserApi.UserCore>> = ref({});

export interface UseUserCoreMapReturn {
  clearUserCoreMap: () => void;
  getUserCore: (id: number) => SystemUserApi.UserCore | undefined;
  setUserCoreMap: (map: Record<number, SystemUserApi.UserCore>) => void;
  userCoreMap: Ref<Record<number, SystemUserApi.UserCore>>;
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
