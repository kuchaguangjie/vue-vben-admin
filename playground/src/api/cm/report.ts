import { requestClient } from '#/api/request';

export namespace CmReportApi {
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

  export interface AccountPageParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
    userId?: number;
  }

  export interface AccountRow {
    availableAmount: number;
    createdAt: string;
    frozenAmount: number;
    nick: string;
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
  }>('/cm/report/log/page', { params });
}

export async function getCmCommissionStatistics(
  params: CmReportApi.CommissionStatisticsParams,
) {
  return requestClient.get<CmReportApi.CommissionStatistics>(
    '/cm/report/statistics',
    { params },
  );
}

export async function getCmAccountPage(params: CmReportApi.AccountPageParams) {
  return requestClient.get<{
    items: CmReportApi.AccountRow[];
    total: number;
  }>('/cm/report/account/page', { params });
}
