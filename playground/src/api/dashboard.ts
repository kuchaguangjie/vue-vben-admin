import { requestClient } from '#/api/request';

export namespace DashboardApi {
  export interface LatestNoticeItem {
    createdAt: string;
    id: number;
    title: string;
  }

  export interface OverviewResp {
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
