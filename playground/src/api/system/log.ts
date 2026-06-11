import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemLogApi {
  export interface SystemLog {
    code: string;
    data: string;
    id: number;
    tenantId: number;
  }
}

/**
 * 获取日志列表数据
 */
async function getLogList(params: Recordable<any>) {
  return requestClient.get<CommonType.Page<SystemLogApi.SystemLog>>(
    '/system/log/page',
    {
      params,
    },
  );
}

async function getLogListWithUserCore(params: Recordable<any>) {
  return requestClient.get<CommonType.PageWithUserCore<SystemLogApi.SystemLog>>(
    '/system/log/pageWithUserCore',
    {
      params,
    },
  );
}

export { getLogList, getLogListWithUserCore };
