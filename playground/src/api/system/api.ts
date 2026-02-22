import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemApiApi {
  export interface SystemApi {
    [key: string]: any;

    action: string;
    id: number;
    path: string;
    pid: number | undefined;
    remark?: string;
    status: number;
    type: number;
    version: number;
  }
}

/**
 * 获取 api tree
 */
async function getApiTree(params: Recordable<any>) {
  return requestClient.get<CommonType.TreeWithUserCore<SystemApiApi.SystemApi>>(
    '/system/api/tree',
    {
      params,
    },
  );
}

async function getApiTreeDirOnly() {
  const result = await getApiTree({ type: 1 });
  return result?.topItems;
}

/**
 * 创建api
 * @param data api数据
 */
async function createApi(data: Omit<SystemApiApi.SystemApi, 'id'>) {
  return requestClient.post('/system/api', data);
}

/**
 * 更新api
 *
 * @param id api ID
 * @param data api数据
 */
async function updateApi(id: number, data: Omit<SystemApiApi.SystemApi, 'id'>) {
  return requestClient.put(`/system/api/${id}`, data);
}

/**
 * 更新api状态
 * @param data api数据
 */
async function updateApiStatus(data: CommonType.UpdateStatus) {
  return requestClient.post(`/system/api/updateStatus`, data);
}

/**
 * 删除api
 * @param id api ID
 */
async function deleteApi(id: number) {
  return requestClient.delete(`/system/api/${id}`);
}

export {
  createApi,
  deleteApi,
  getApiTree,
  getApiTreeDirOnly,
  updateApi,
  updateApiStatus,
};
