import { requestClient } from '#/api/request';

export namespace SystemCasbinApi {
  export interface SystemCasbin {
    [key: string]: any;
  }
}

/**
 * 获取 casbin status
 */
async function getCasbinStatus() {
  return requestClient.get<Array<SystemCasbinApi.SystemCasbin>>(
    '/casbin/status',
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

export { getCasbinStatus, loadCasbin };
