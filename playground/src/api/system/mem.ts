import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemMemApi {
  export interface SystemMem {
    [key: string]: any;

    code: string;
    data: string;
    id: number;
  }
}

/**
 * 获取cache列表数据
 */
async function getMemList(params: Recordable<any>) {
  return requestClient.get<Array<SystemMemApi.SystemMem>>('/system/mem/page', {
    params,
  });
}

export { getMemList };
