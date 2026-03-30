import { requestClient } from '#/api/request';

export namespace SystemWsApi {
  export interface SystemWsStat {
    [key: string]: any;
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
      userCount: number;
    };
    statAt: string;
  }
}

/**
 * 获取 ws stat
 */
async function getWsStat() {
  return requestClient.get<SystemWsApi.SystemWsStat>('/system/ws/stat');
}

export { getWsStat };
