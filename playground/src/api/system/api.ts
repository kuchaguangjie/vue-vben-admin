import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { queryOptions } from '@tanstack/vue-query';

import { getTreeAsRoots } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemApiApi {
  export interface SystemApi {
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

async function getApiTree(params: Recordable<any>) {
  return requestClient.get<CommonType.Tree<SystemApiApi.SystemApi>>(
    '/system/api/tree',
    {
      params,
    },
  );
}
async function getApiTreeRoots(params: Recordable<any>) {
  return getTreeAsRoots<SystemApiApi.SystemApi>(getApiTree, params);
}

/**
 * API 树 queryOptions 工厂
 *
 * 适用于「全局只读 + 跨页共享」的服务器状态（如分配权限时的 API 树）。
 * 业务调用方目前仍直接调 getApiTree/getApiTreeRoots，可按需逐步改为
 * queryClient.fetchQuery(apiTreeQueryOptions(params)) 复用缓存。
 *
 * 注意：params 进入 queryKey 用于区分不同筛选条件的缓存。
 */
export function apiTreeQueryOptions(params: Recordable<any> = {}) {
  return queryOptions({
    queryFn: () => getApiTree(params),
    queryKey: ['system', 'api', 'tree', params] as const,
    staleTime: 60_000,
  });
}

/**
 * API 树 roots queryOptions 工厂（同上，但返回 roots 数组形式）
 */
export function apiTreeRootsQueryOptions(params: Recordable<any> = {}) {
  return queryOptions({
    queryFn: () => getApiTreeRoots(params),
    queryKey: ['system', 'api', 'treeRoots', params] as const,
    staleTime: 60_000,
  });
}

async function getApiTreeWithUserCore(params: Recordable<any>) {
  return requestClient.get<CommonType.TreeWithUserCore<SystemApiApi.SystemApi>>(
    '/system/api/treeWithUserCore',
    {
      params,
    },
  );
}

async function getApiTreeDirOnly() {
  return await getApiTreeRoots({ type: 1 });
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
  getApiTreeRoots,
  getApiTreeWithUserCore,
  updateApi,
  updateApiStatus,
};
