import { requestClient } from '#/api/request';

export namespace SystemMemApi {
  export interface SystemMem {
    modules: string[];
  }
}

/**
 * 刷新 mem - all
 */
async function loadMemAll() {
  return requestClient.get<any>('/system/mem/load');
}

/**
 * 获取 mem status
 */
async function getMemStatus() {
  return requestClient.get<any>('/system/mem/status');
}

export { getMemStatus, loadMemAll };
