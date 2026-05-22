import { requestClient } from '#/api/request';

export namespace RcRuleGroupApi {
  export interface RcRuleGroup {
    code: string;
    createdAt: string;
    createdBy: number;
    description: string;
    id: number;
    name: string;
    priority: number;
    scenario: string;
    status: number;
    tenantId: number;
    updatedAt?: string;
    updatedBy?: number;
  }

  export interface RcRuleGroupPageParams {
    code?: string;
    name?: string;
    page?: number;
    pageSize?: number;
    scenario?: string;
    sortBy?: string;
    sortDesc?: boolean;
    status?: number;
  }

  export interface RcRuleGroupListParams {
    scenario?: string;
    status?: number;
  }

  export interface CreateRcRuleGroupRequest {
    code: string;
    description?: string;
    name: string;
    priority: number;
    scenario: string;
    status: number;
  }

  export interface UpdateRcRuleGroupRequest {
    code: string;
    description?: string;
    name: string;
    priority: number;
    scenario: string;
    status: number;
  }

  export interface UpdateStatusRequest {
    status: number;
  }
}

export async function getRcRuleGroupPage(
  params: RcRuleGroupApi.RcRuleGroupPageParams,
) {
  return requestClient.get<{
    items: RcRuleGroupApi.RcRuleGroup[];
    total: number;
  }>('/rc/rule-group/page', { params });
}

export async function getRcRuleGroupList(
  params?: RcRuleGroupApi.RcRuleGroupListParams,
) {
  return requestClient.get<RcRuleGroupApi.RcRuleGroup[]>(
    '/rc/rule-group/list',
    { params },
  );
}

export async function getRcRuleGroup(id: number) {
  return requestClient.get<RcRuleGroupApi.RcRuleGroup>(`/rc/rule-group/${id}`);
}

export async function createRcRuleGroup(
  data: RcRuleGroupApi.CreateRcRuleGroupRequest,
) {
  return requestClient.post<RcRuleGroupApi.RcRuleGroup>('/rc/rule-group', data);
}

export async function updateRcRuleGroup(
  id: number,
  data: RcRuleGroupApi.UpdateRcRuleGroupRequest,
) {
  return requestClient.put(`/rc/rule-group/${id}`, data);
}

export async function deleteRcRuleGroup(id: number) {
  return requestClient.delete(`/rc/rule-group/${id}`);
}

export async function updateRcRuleGroupStatus(
  id: number,
  data: RcRuleGroupApi.UpdateStatusRequest,
) {
  return requestClient.put(`/rc/rule-group/${id}/status`, data);
}
