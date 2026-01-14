import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemMemApi {
  export interface SystemMem {
    [key: string]: any;

    modules: string[];
  }
}

/**
 * 刷新 mem - all
 */
async function loadMemAll(params: Recordable<any>) {
  return requestClient.get<Array<SystemMemApi.SystemMem>>('/system/mem/load', {
    params,
  });
}

export { loadMemAll };
