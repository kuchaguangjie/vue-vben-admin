import { requestClient } from '#/api/request';

export namespace RcExecutionLogApi {
  export interface RcExecutionLog {
    id: number;
    tenantId: number;
    groupId?: number;
    ruleId?: number;
    scenario: string;
    userId?: number;
    inputParams: string;
    result: string;
    riskLevel: string;
    errorCode?: string;
    errorMsg?: string;
    executionTimeMs: number;
    createdAt: string;
    createdBy?: number;
  }

  export interface RcExecutionLogPageParams {
    groupId?: number;
    ruleId?: number;
    scenario?: string;
    userId?: number;
    result?: string;
    riskLevel?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
  }

  export interface RcExecutionLogListParams {
    groupId?: number;
    ruleId?: number;
    scenario?: string;
    userId?: number;
    result?: string;
    riskLevel?: string;
    limit?: number;
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
  return requestClient.get<Record<string, any>>('/rc/execution-log/statistics', {
    params: { days },
  });
}
