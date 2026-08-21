import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { queryOptions } from '@tanstack/vue-query';

import { getTreeAsRoots } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    children?: SystemDept[];
    id: number;
    name: string;
    remark?: string;
    roleCodes: string[];
    status: 0 | 1;
    tenantId: number;
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptTree(params: Recordable<any>) {
  return requestClient.get<CommonType.Tree<SystemDeptApi.SystemDept>>(
    '/system/dept/tree',
    { params },
  );
}
async function getDeptTreeRoots(params: Recordable<any>) {
  return getTreeAsRoots<SystemDeptApi.SystemDept>(getDeptTree, params);
}

/**
 * 部门树 queryOptions 工厂
 *
 * 适用于「全局只读 + 跨页共享」的服务器状态（如分配用户部门时的部门树）。
 * 业务调用方目前仍直接调 getDeptTree/getDeptTreeRoots，可按需逐步改为
 * queryClient.fetchQuery(deptTreeQueryOptions(params)) 复用缓存。
 *
 * 注意：params 进入 queryKey 用于区分不同筛选条件的缓存。
 */
export function deptTreeQueryOptions(params: Recordable<any> = {}) {
  return queryOptions({
    queryFn: () => getDeptTree(params),
    queryKey: ['system', 'dept', 'tree', params] as const,
    staleTime: 60_000,
  });
}

/**
 * 部门树 roots queryOptions 工厂（同上，但返回 roots 数组形式）
 */
export function deptTreeRootsQueryOptions(params: Recordable<any> = {}) {
  return queryOptions({
    queryFn: () => getDeptTreeRoots(params),
    queryKey: ['system', 'dept', 'treeRoots', params] as const,
    staleTime: 60_000,
  });
}

async function getDeptTreeWithUserCore(params: Recordable<any>) {
  return requestClient.get<
    CommonType.TreeWithUserCore<SystemDeptApi.SystemDept>
  >('/system/dept/treeWithUserCore', {
    params,
  });
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post('/system/dept', data);
}

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  id: number,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.put(`/system/dept/${id}`, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: number) {
  return requestClient.delete(`/system/dept/${id}`);
}

/**
 * pre create
 */
async function preCreateDept() {
  return requestClient.get(`/system/dept/preCreate`);
}

/**
 * pre update
 */
async function preUpdateDept(id: number) {
  return requestClient.get(`/system/dept/preUpdate?id=${id}`);
}

/**
 * 部门 详情
 * @param id 角色 ID
 */
async function getDetailDept(id: number) {
  return requestClient.get(`/system/dept/${id}`);
}

export {
  createDept,
  deleteDept,
  getDeptTree,
  getDeptTreeRoots,
  getDeptTreeWithUserCore,
  getDetailDept,
  preCreateDept,
  preUpdateDept,
  updateDept,
};
