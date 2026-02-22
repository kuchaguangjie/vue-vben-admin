import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

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
  return requestClient.get<CommonType.Page<SystemLogApi.SystemLog>>(
    '/system/log/page',
    {
      params,
    },
  );
}

async function getLogTreeWithUserCore(params: Recordable<any>) {
  return requestClient.get<CommonType.PageWithUserCore<SystemLogApi.SystemLog>>(
    '/system/log/pageWithUserCore',
    {
      params,
    },
  );
}

export { getLogList, getLogTreeWithUserCore };
