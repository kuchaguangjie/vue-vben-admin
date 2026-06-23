import { requestClient } from '#/api/request';

export namespace CmReportApi {
  export interface CommissionLogPageParams {
    beneficiaryId?: number;
    buyerId?: number;
    currency?: string;
    level?: number;
    orderNo?: string;
    page?: number;
    pageSize?: number;
    sceneKey?: string;
    sortBy?: string;
    sortDesc?: boolean;
    status?: number;
    tenantId?: number;
  }

  export interface CommissionLogRow {
    amount: number;
    beneficiaryId: number;
    beneficiaryName: string;
    buyerId: number;
    buyerName: string;
    commissionRate: number;
    createdAt: string;
    currency: string;
    id: number;
    level: number;
    orderAmount: number;
    orderNo: string;
    remark: string;
    sceneKey: string;
    settledAt: string;
    settleTime: string;
    status: number;
    tenantId: number;
    tenantName: string;
  }

  export interface CommissionStatisticsParams {
    currency?: string;
    endDate?: string;
    sceneKey?: string;
    startDate?: string;
    tenantId?: number;
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

  export interface AccountPageParams {
    currency?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
    tenantId?: number;
    userId?: number;
  }

  export interface AccountRow {
    availableAmount: number;
    createdAt: string;
    currency: string;
    frozenAmount: number;
    nick: string;
    tenantId: number;
    tenantName: string;
    totalIncome: number;
    updatedAt: string;
    userId: number;
    username: string;
    withdrawnAmount: number;
  }
}

export async function getCmCommissionLogPage(
  params: CmReportApi.CommissionLogPageParams,
) {
  return requestClient.get<{
    items: CmReportApi.CommissionLogRow[];
    total: number;
  }>('/cm/user-report/log/page', { params });
}

export async function getCmCommissionStatistics(
  params: CmReportApi.CommissionStatisticsParams,
) {
  return requestClient.get<CmReportApi.CommissionStatistics>(
    '/cm/user-report/statistics',
    { params },
  );
}

export async function getCmAccountPage(params: CmReportApi.AccountPageParams) {
  return requestClient.get<{
    items: CmReportApi.AccountRow[];
    total: number;
  }>('/cm/user-report/account/page', { params });
}
