import { requestClient } from '#/api/request';

// 租户分佣规则类型（只有租户字段，无用户字段）
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
  }

  export interface CmCommissionRuleStatusReq {
    id: number;
    status: number;
  }
}

// ========== 租户分佣规则 API（路径 /cm-tenant/rule/*） ==========

export async function getCmCommissionRulePage(
  params: CmCommissionRuleApi.CmCommissionRulePageParams,
) {
  return requestClient.get<{
    items: CmCommissionRuleApi.CmCommissionRule[];
    total: number;
  }>('/cm-tenant/rule/page', { params });
}

export async function getCmCommissionRule(id: number) {
  return requestClient.get<CmCommissionRuleApi.CmCommissionRule>(
    `/cm-tenant/rule/${id}`,
  );
}

export async function createCmCommissionRule(
  data: CmCommissionRuleApi.CmCommissionRuleCreateReq,
) {
  return requestClient.post<CmCommissionRuleApi.CmCommissionRule>(
    '/cm-tenant/rule',
    data,
  );
}

export async function updateCmCommissionRule(
  id: number,
  data: CmCommissionRuleApi.CmCommissionRuleUpdateReq,
) {
  return requestClient.put(`/cm-tenant/rule/${id}`, data);
}

export async function deleteCmCommissionRule(id: number) {
  return requestClient.delete(`/cm-tenant/rule/${id}`);
}

export async function updateCmCommissionRuleStatus(
  data: CmCommissionRuleApi.CmCommissionRuleStatusReq,
) {
  return requestClient.put('/cm-tenant/rule/status', data);
}

// ========== 租户分佣报表 API（路径 /cm-tenant/*） ==========

export namespace CmTenantReportApi {
  export interface CommissionLogPageParams {
    beneficiaryId?: number;
    buyerId?: number;
    level?: number;
    orderNo?: string;
    page?: number;
    pageSize?: number;
    sceneKey?: string;
    sortBy?: string;
    sortDesc?: boolean;
    status?: number;
  }

  export interface CommissionLogRow {
    amount: number;
    beneficiaryId: number;
    beneficiaryName: string;
    buyerId: number;
    buyerName: string;
    commissionRate: number;
    createdAt: string;
    id: number;
    level: number;
    orderAmount: number;
    orderNo: string;
    remark: string;
    sceneKey: string;
    settledAt: string;
    settleTime: string;
    status: number;
  }

  export interface CommissionStatisticsParams {
    endDate?: string;
    sceneKey?: string;
    startDate?: string;
  }

  export interface CommissionStatistics {
    cancelledAmount: number;
    frozenAmount: number;
    levelStats: LevelStat[];
    sceneStats: SceneStat[];
    settledAmount: number;
    totalAmount: number;
    totalBeneficiaries: number;
    totalOrders: number;
  }

  export interface LevelStat {
    amount: number;
    count: number;
    level: number;
  }

  export interface SceneStat {
    amount: number;
    count: number;
    sceneKey: string;
  }

  export interface TenantAccountPageParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
    tenantId?: number;
  }

  export interface TenantAccountRow {
    availableAmount: number;
    createdAt: string;
    frozenAmount: number;
    ownerId: number;
    ownerType: number;
    tenantId: number;
    tenantName: string;
    totalIncome: number;
    updatedAt: string;
    withdrawnAmount: number;
  }

  export interface TenantRelationItem {
    commissionRate: number | null;
    id: number;
    name: string;
    parentId: number;
    parentName: string;
  }

  export interface TenantRelationResp {
    items: TenantRelationItem[];
  }
}

export async function getCmTenantCommissionLogPage(
  params: CmTenantReportApi.CommissionLogPageParams,
) {
  return requestClient.get<{
    items: CmTenantReportApi.CommissionLogRow[];
    total: number;
  }>('/cm-tenant/log/page', { params });
}

export async function getCmTenantCommissionStatistics(
  params: CmTenantReportApi.CommissionStatisticsParams,
) {
  return requestClient.get<CmTenantReportApi.CommissionStatistics>(
    '/cm-tenant/statistics',
    { params },
  );
}

export async function getCmTenantAccountPage(
  params: CmTenantReportApi.TenantAccountPageParams,
) {
  return requestClient.get<{
    items: CmTenantReportApi.TenantAccountRow[];
    total: number;
  }>('/cm-tenant/account/page', { params });
}

export async function getCmTenantRelation() {
  return requestClient.get<CmTenantReportApi.TenantRelationResp>(
    '/cm-tenant/relation',
  );
}
