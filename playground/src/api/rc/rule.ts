import { requestClient } from '#/api/request';

export namespace RcRuleApi {
  export interface RcRule {
    id: number;
    tenantId: number;
    groupId: number;
    name: string;
    code: string;
    description: string;
    priority: number;
    conditions: string;
    action: string;
    riskLevel: string;
    errorCode?: string;
    errorMsg?: string;
    status: number;
    createdAt: string;
    createdBy: number;
    updatedAt?: string;
    updatedBy?: number;
  }

  export interface RcRulePageParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
    groupId?: number;
    name?: string;
    code?: string;
    action?: string;
    riskLevel?: string;
    status?: number;
  }

  export interface RcRuleListParams {
    groupId?: number;
    status?: number;
  }

  export interface CreateRcRuleRequest {
    groupId: number;
    name: string;
    code: string;
    description?: string;
    priority: number;
    conditions: string;
    action: string;
    riskLevel: string;
    errorCode?: string;
    errorMsg?: string;
    status: number;
  }

  export interface UpdateRcRuleRequest {
    groupId: number;
    name: string;
    code: string;
    description?: string;
    priority: number;
    conditions: string;
    action: string;
    riskLevel: string;
    errorCode?: string;
    errorMsg?: string;
    status: number;
  }

  export interface UpdateStatusRequest {
    status: number;
  }
}

export async function getRcRulePage(params: RcRuleApi.RcRulePageParams) {
  return requestClient.get<{
    items: RcRuleApi.RcRule[];
    total: number;
  }>('/rc/rule/page', { params });
}

export async function getRcRuleList(params?: RcRuleApi.RcRuleListParams) {
  return requestClient.get<RcRuleApi.RcRule[]>('/rc/rule/list', { params });
}

export async function getRcRule(id: number) {
  return requestClient.get<RcRuleApi.RcRule>(`/rc/rule/${id}`);
}

export async function createRcRule(data: RcRuleApi.CreateRcRuleRequest) {
  return requestClient.post<RcRuleApi.RcRule>('/rc/rule', data);
}

export async function updateRcRule(
  id: number,
  data: RcRuleApi.UpdateRcRuleRequest,
) {
  return requestClient.put(`/rc/rule/${id}`, data);
}

export async function deleteRcRule(id: number) {
  return requestClient.delete(`/rc/rule/${id}`);
}

export async function updateRcRuleStatus(
  id: number,
  data: RcRuleApi.UpdateStatusRequest,
) {
  return requestClient.put(`/rc/rule/${id}/status`, data);
}
