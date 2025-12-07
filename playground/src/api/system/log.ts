import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemLogApi {
  export interface SystemLog {
    [key: string]: any;

    code: string;
    data: string;
    id: number;
  }
}

/**
 * 获取日志列表数据
 */
async function getLogList(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogApi.SystemLog>>('/system/log/page', {
    params,
  });
}

export { getLogList };
