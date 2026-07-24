import { requestClient } from '#/api/request';

export namespace DashboardApi {
  export interface LatestNoticeItem {
    createdAt: string;
    id: number;
    title: string;
  }

  export interface KnowledgeStats {
    personalCount: number;
    tenantCount: number;
    totalCount: number;
  }

  export interface OverviewResp {
    knowledgeStats: KnowledgeStats;
    latestNotices: LatestNoticeItem[];
    monthlyRevenue: number;
    pendingWithdrawCount: number;
    tenantCount: number;
    userCount: number;
  }
}

export async function getDashboardOverview() {
  return requestClient.get<DashboardApi.OverviewResp>('/dashboard/overview');
}
