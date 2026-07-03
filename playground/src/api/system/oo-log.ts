import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemOOLogApi {
  export interface OOLogItem {
    caller: string;
    level: string;
    message: string;
    raw: Record<string, any>;
    requestId: string;
    tenantId: number;
    timestamp: string;
    userId: number;
    username: string;
  }

  export interface OOLogPageParams {
    endTime?: string;
    keyword: string;
    module: string;
    pageNum: number;
    pageSize: number;
    startTime?: string;
  }
}

export async function getOOLogPage(params: SystemOOLogApi.OOLogPageParams) {
  return requestClient.get<CommonType.Page<SystemOOLogApi.OOLogItem>>(
    '/system/oo-log/page',
    { params },
  );
}
