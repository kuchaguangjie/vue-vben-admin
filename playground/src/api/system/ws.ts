import { requestClient } from '#/api/request';

export namespace SystemWsApi {
  export interface TenantStat {
    connCount: number;
    sidCount: number;
    tenantId: number;
    userCount: number;
  }

  export interface SystemWsStat {
    config: {
      isCluster: boolean;
      maxConnPerSid: number;
      rateLimit: {
        burst: number;
        enable: boolean;
        rate: number;
      };
    };
    stat: {
      connCount: number;
      instanceCount: number;
      sidCount: number;
      tenantStats?: Record<number, TenantStat>;
      userCount: number;
    };
    statAt: string;
  }
}

async function getWsStat(params?: { tenantId?: number }) {
  return requestClient.get<SystemWsApi.SystemWsStat>('/system/ws/stat', {
    params,
  });
}

export { getWsStat };
