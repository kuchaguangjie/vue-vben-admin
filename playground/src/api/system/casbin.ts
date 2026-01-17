import { requestClient } from '#/api/request';

export namespace SystemCasbinApi {
  export interface SystemCasbin {
    [key: string]: any;
  }
}

/**
 * 获取 casbin 手动操作 状态
 */
async function getCasbinManualStatus() {
  return requestClient.get<Array<SystemCasbinApi.SystemCasbin>>(
    '/casbin/manualStatus',
  );
}

/**
 * Load casbin policy
 */
async function loadCasbin() {
  return requestClient.post<Array<SystemCasbinApi.SystemCasbin>>(
    '/casbin/load',
  );
}

/**
 * 获取 casbin 统计
 */
async function getCasbinStat() {
  return requestClient.get<Array<SystemCasbinApi.SystemCasbin>>('/casbin/stat');
}

export { getCasbinManualStatus, getCasbinStat, loadCasbin };
