import { requestClient } from '#/api/request';

export namespace SystemMemApi {
  export interface SystemMem {
    [key: string]: any;

    modules: string[];
  }
}

/**
 * 刷新 mem - all
 */
async function loadMemAll() {
  return requestClient.get<Array<SystemMemApi.SystemMem>>('/system/mem/load');
}

/**
 * 获取 mem status
 */
async function getMemStatus() {
  return requestClient.get<Array<SystemMemApi.SystemMem>>('/system/mem/status');
}

export { getMemStatus, loadMemAll };
