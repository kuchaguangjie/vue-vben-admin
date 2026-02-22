import type { Recordable } from '@vben/types';

import type { CommonType, SystemUserApi } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemApiApi {
  export interface ApiTreeResp {
    [key: string]: any;
    topItems: SystemApi[];
    userCoreMap: Record<number, SystemUserApi.UserCore>;
  }
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
 * 获取api列表数据
 */
async function getApiList(params: Recordable<any>) {
  return requestClient.get<Array<SystemApiApi.SystemApi>>('/system/api/page', {
    params,
  });
}

/**
 * 获取 api tree
 */
async function getApiTree(params: Recordable<any>) {
  return requestClient.get<SystemApiApi.ApiTreeResp>('/system/api/tree', {
    params,
  });
}

async function getApiTreeDirOnly() {
  const result = await getApiTree({ type: 1 });
  return result?.topItems;
}

/**
 * 获得 api tree & 角色 api ids (含 parent id).
 */
async function getApiTreeForRole(code: string) {
  return requestClient.get(`/system/api/treeForRole?code=${code}`);
}

/**
 * 获得角色 的 api
 */
async function getRoleApis(code: string) {
  return requestClient.get(`/system/api/getRoleApis?code=${code}`);
}

/**
 * 获取api列表数据, 无 menu 信息;
 */
async function getApiAll() {
  return requestClient.get<Array<SystemApiApi.SystemApi>>('/system/api/all');
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
  getApiAll,
  getApiList,
  getApiTree,
  getApiTreeDirOnly,
  getApiTreeForRole,
  getRoleApis,
  updateApi,
  updateApiStatus,
};
