import { requestClient } from '#/api/request';

export namespace RcExecutionLogApi {
  export interface RcExecutionLog {
    createdAt: string;
    createdBy?: number;
    errorCode?: string;
    errorMsg?: string;
    executionTimeMs: number;
    groupId?: number;
    id: number;
    inputParams: string;
    result: string;
    riskLevel: string;
    ruleId?: number;
    scenario: string;
    tenantId: number;
    userId?: number;
  }

  export interface RcExecutionLogPageParams {
    endDate?: string;
    groupId?: number;
    page?: number;
    pageSize?: number;
    result?: string;
    riskLevel?: string;
    ruleId?: number;
    scenario?: string;
    sortBy?: string;
    sortDesc?: boolean;
    startDate?: string;
    userId?: number;
  }

  export interface RcExecutionLogListParams {
    groupId?: number;
    limit?: number;
    result?: string;
    riskLevel?: string;
    ruleId?: number;
    scenario?: string;
    userId?: number;
  }

  export interface BatchDeleteRequest {
    ids: number[];
  }

  export interface CleanOldLogsRequest {
    days: number;
  }
}

export async function getRcExecutionLogPage(
  params: RcExecutionLogApi.RcExecutionLogPageParams,
) {
  return requestClient.get<{
    items: RcExecutionLogApi.RcExecutionLog[];
    total: number;
  }>('/rc/execution-log/page', { params });
}

export async function getRcExecutionLogList(
  params?: RcExecutionLogApi.RcExecutionLogListParams,
) {
  return requestClient.get<RcExecutionLogApi.RcExecutionLog[]>(
    '/rc/execution-log/list',
    { params },
  );
}

export async function getRcExecutionLog(id: number) {
  return requestClient.get<RcExecutionLogApi.RcExecutionLog>(
    `/rc/execution-log/${id}`,
  );
}

export async function deleteRcExecutionLog(id: number) {
  return requestClient.delete(`/rc/execution-log/${id}`);
}

export async function batchDeleteRcExecutionLog(
  data: RcExecutionLogApi.BatchDeleteRequest,
) {
  return requestClient.post<{ rowsAffected: number }>(
    '/rc/execution-log/batch-delete',
    data,
  );
}

export async function cleanOldRcExecutionLogs(
  data: RcExecutionLogApi.CleanOldLogsRequest,
) {
  return requestClient.post<{ rowsAffected: number }>(
    '/rc/execution-log/clean',
    data,
  );
}

export async function getRcExecutionLogStatistics(days?: number) {
  return requestClient.get<Record<string, any>>(
    '/rc/execution-log/statistics',
    {
      params: { days },
    },
  );
}
