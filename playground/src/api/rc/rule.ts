import { requestClient } from '#/api/request';

export namespace RcRuleApi {
  export interface RcRule {
    action: string;
    code: string;
    conditions: string;
    createdAt: string;
    createdBy: number;
    description: string;
    errorCode?: string;
    errorMsg?: string;
    groupId: number;
    id: number;
    name: string;
    priority: number;
    riskLevel: string;
    status: number;
    tenantId: number;
    updatedAt?: string;
    updatedBy?: number;
  }

  export interface RcRulePageParams {
    action?: string;
    code?: string;
    groupId?: number;
    name?: string;
    page?: number;
    pageSize?: number;
    riskLevel?: string;
    sortBy?: string;
    sortDesc?: boolean;
    status?: number;
  }

  export interface RcRuleListParams {
    groupId?: number;
    status?: number;
  }

  export interface CreateRcRuleRequest {
    action: string;
    code: string;
    conditions: string;
    description?: string;
    errorCode?: string;
    errorMsg?: string;
    groupId: number;
    name: string;
    priority: number;
    riskLevel: string;
    status: number;
  }

  export interface UpdateRcRuleRequest {
    action: string;
    code: string;
    conditions: string;
    description?: string;
    errorCode?: string;
    errorMsg?: string;
    groupId: number;
    name: string;
    priority: number;
    riskLevel: string;
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
