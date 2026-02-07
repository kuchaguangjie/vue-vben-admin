import { requestClient } from '#/api/request';

export namespace SystemWsApi {
  export interface SystemWsStat {
    [key: string]: any;
    config: {
      maxConnPerSid: number;
    };
    stat: {
      connCount: number;
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
