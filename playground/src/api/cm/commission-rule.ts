import { requestClient } from '#/api/request';

export namespace CmCommissionRuleApi {
  export interface CmCommissionRule {
    createdAt: string;
    createdBy: number;
    id: number;
    maxAmount: number;
    remark: string;
    sceneKey: string;
    status: number;
    tenantId: number;
    tenantLevel1Rate: number;
    tenantMaxLevel: number;
    totalRate: number;
    updatedAt?: string;
    updatedBy?: number;
    userLevel1Rate: number;
    userLevel2Rate: number;
    userLevel3Rate: number;
    userMaxLevel: number;
  }

  export interface CmCommissionRulePageParams {
    page?: number;
    pageSize?: number;
    sceneKey?: string;
    sortBy?: string;
    sortDesc?: boolean;
    status?: number;
  }

  export interface CmCommissionRuleCreateReq {
    maxAmount: number;
    remark?: string;
    sceneKey: string;
    status: number;
    tenantLevel1Rate: number;
    tenantMaxLevel: number;
    totalRate: number;
    userLevel1Rate: number;
    userLevel2Rate: number;
    userLevel3Rate: number;
    userMaxLevel: number;
  }

  export interface CmCommissionRuleUpdateReq {
    id: number;
    maxAmount: number;
    remark?: string;
    sceneKey: string;
    status: number;
    tenantLevel1Rate: number;
    tenantMaxLevel: number;
    totalRate: number;
    userLevel1Rate: number;
    userLevel2Rate: number;
    userLevel3Rate: number;
    userMaxLevel: number;
  }

  export interface CmCommissionRuleStatusReq {
    id: number;
    status: number;
  }
}

export async function getCmCommissionRulePage(
  params: CmCommissionRuleApi.CmCommissionRulePageParams,
) {
  return requestClient.get<{
    items: CmCommissionRuleApi.CmCommissionRule[];
    total: number;
  }>('/cm/commission-rule/page', { params });
}

export async function getCmCommissionRule(id: number) {
  return requestClient.get<CmCommissionRuleApi.CmCommissionRule>(
    `/cm/commission-rule/${id}`,
  );
}

export async function createCmCommissionRule(
  data: CmCommissionRuleApi.CmCommissionRuleCreateReq,
) {
  return requestClient.post<CmCommissionRuleApi.CmCommissionRule>(
    '/cm/commission-rule',
    data,
  );
}

export async function updateCmCommissionRule(
  id: number,
  data: CmCommissionRuleApi.CmCommissionRuleUpdateReq,
) {
  return requestClient.put(`/cm/commission-rule/${id}`, data);
}

export async function deleteCmCommissionRule(id: number) {
  return requestClient.delete(`/cm/commission-rule/${id}`);
}

export async function updateCmCommissionRuleStatus(
  data: CmCommissionRuleApi.CmCommissionRuleStatusReq,
) {
  return requestClient.put('/cm/commission-rule/status', data);
}
